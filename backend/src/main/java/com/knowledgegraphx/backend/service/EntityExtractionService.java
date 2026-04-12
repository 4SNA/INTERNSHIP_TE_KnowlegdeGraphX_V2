package com.knowledgegraphx.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgegraphx.backend.dto.ExtractedEntityDTO;
import com.knowledgegraphx.backend.model.Document;
import com.knowledgegraphx.backend.model.KnowledgeEntity;
import com.knowledgegraphx.backend.model.KnowledgeRelationship;
import com.knowledgegraphx.backend.repository.KnowledgeEntityRepository;
import com.knowledgegraphx.backend.repository.KnowledgeRelationshipRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EntityExtractionService {

    private final ChatLanguageModel chatLanguageModel;
    private final KnowledgeEntityRepository knowledgeEntityRepository;
    private final KnowledgeRelationshipRepository knowledgeRelationshipRepository;
    private final ObjectMapper objectMapper;

    // ─── Rule-based patterns ─────────────────────────────────────────────────
    private static final Pattern PROPER_NOUN  = Pattern.compile("\\b([A-Z][a-z]{2,}(?:\\s+[A-Z][a-z]{2,}){0,3})\\b");
    private static final Pattern ALL_CAPS     = Pattern.compile("\\b([A-Z]{2,10})\\b");
    private static final Pattern EMAIL        = Pattern.compile("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,6}");
    private static final Pattern MONEY        = Pattern.compile("(?:Rs\\.?|INR|\\$|€|£)\\s*[\\d,]+(?:\\.\\d+)?(?:\\s*(?:lakh|crore|million|billion|k))?", Pattern.CASE_INSENSITIVE);
    private static final Pattern PERCENTAGE   = Pattern.compile("\\b\\d+(?:\\.\\d+)?%");
    private static final Pattern YEAR         = Pattern.compile("\\b(19|20)\\d{2}\\b");
    private static final Pattern TECH_TERM    = Pattern.compile("\\b(?:Java|Python|React|Spring|SQL|PostgreSQL|MySQL|MongoDB|Redis|Docker|Kubernetes|AWS|Azure|GCP|Node\\.js|TypeScript|JavaScript|Git|REST|API|ML|AI|NLP|LLM|RAG|PDF|CSV|JSON|XML|HTML|CSS)\\b", Pattern.CASE_INSENSITIVE);

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
        "The","A","An","In","On","At","By","For","With","To","From","Of","And","Or","But",
        "Is","Are","Was","Were","Has","Have","Had","This","That","These","Those","It","He",
        "She","They","We","You","I","My","Our","Your","Their","Its","Which","Who","Whom",
        "What","When","Where","How","Why","All","Each","Both","Few","More","Most","Other",
        "Some","Such","No","Not","Only","Own","Same","So","Than","Too","Very","Just","Can",
        "Will","Would","Could","Should","May","Might","Must","Shall","Section","Page"
    ));

    @Transactional
    public void clearSessionGraph(Long sessionId) {
        log.info("Neural Purge: Clearing knowledge graph for session {}", sessionId);
        knowledgeRelationshipRepository.deleteBySessionId(sessionId);
        knowledgeEntityRepository.deleteBySessionId(sessionId);
    }

    @Transactional
    public void extractAndSaveEntities(Document document, String text) {
        log.info("Neural Extraction: Processing '{}' (rule-based + optional LLM)", document.getFileName());

        if (text == null || text.isBlank()) {
            log.warn("Neural Extraction: No text for document {}", document.getFileName());
            return;
        }

        try {
            // === PHASE A: Always-on Rule-Based Extraction ===
            Map<String, ExtractedEntityDTO.EntityWrapper> ruleEntities = extractByRules(text, document.getFileName());
            log.info("Neural Extraction [RULES]: '{}' → {} entities", document.getFileName(), ruleEntities.size());

            // === PHASE B: Optional LLM Enhancement (small sample, strict timeout) ===
            Map<String, ExtractedEntityDTO.EntityWrapper> llmEntities = tryLlmExtraction(document.getFileName(), text);
            if (!llmEntities.isEmpty()) {
                log.info("Neural Extraction [LLM]: '{}' → {} additional entities", document.getFileName(), llmEntities.size());
                // Merge — LLM wins on conflict (has context)
                ruleEntities.putAll(llmEntities);
            }

            if (ruleEntities.isEmpty()) {
                log.warn("Neural Extraction: Zero entities found in '{}'", document.getFileName());
                return;
            }

            // === PHASE C: Persist Entities ===
            Map<String, KnowledgeEntity> sessionEntities = new HashMap<>();
            for (Map.Entry<String, ExtractedEntityDTO.EntityWrapper> entry : ruleEntities.entrySet()) {
                String eName = entry.getKey();
                ExtractedEntityDTO.EntityWrapper wrapper = entry.getValue();

                KnowledgeEntity entity = knowledgeEntityRepository
                        .findBySessionIdAndNameIgnoreCase(document.getSession().getId(), eName)
                        .orElseGet(() -> {
                            KnowledgeEntity ne = KnowledgeEntity.builder()
                                    .name(eName)
                                    .type(wrapper.getType() != null ? wrapper.getType().toUpperCase() : "CONCEPT")
                                    .context(wrapper.getContext())
                                    .session(document.getSession())
                                    .documents(new HashSet<>())
                                    .build();
                            KnowledgeEntity saved = knowledgeEntityRepository.save(ne);
                            if (saved.getId() == null) throw new IllegalStateException("Neural Extraction: Failed to persist entity.");
                            return saved;
                        });


                entity.getDocuments().add(document);
                knowledgeEntityRepository.save(entity);
                sessionEntities.put(eName.toLowerCase(), entity);
            }

            // === PHASE D: Auto-generate Co-occurrence Relationships ===
            persistCooccurrenceRelationships(text, sessionEntities, document);

            log.info("Neural Extraction: SUCCESS '{}' → {} entities persisted", document.getFileName(), sessionEntities.size());

        } catch (Exception e) {
            log.error("Neural Extraction failed for '{}': {}", document.getFileName(), e.getMessage());
        }
    }

    // ─── Rule-Based Entity Extraction (always works, no LLM) ─────────────────
    private Map<String, ExtractedEntityDTO.EntityWrapper> extractByRules(String text, String fileName) {
        Map<String, ExtractedEntityDTO.EntityWrapper> entities = new LinkedHashMap<>();
        String sample = text.substring(0, Math.min(text.length(), 8000));

        // 1. Technical terms (highest priority - very precise)
        matchAll(TECH_TERM, sample).forEach(m -> {
            String name = capitalize(m);
            if (!STOP_WORDS.contains(name)) {
                entities.put(name, wrapper(name, "TECHNICAL", "Technical term found in " + fileName));
            }
        });

        // 2. Monetary values
        matchAll(MONEY, sample).forEach(m -> {
            String clean = m.trim();
            if (clean.length() > 1) {
                entities.put(clean, wrapper(clean, "FINANCIAL", "Monetary value in " + fileName));
            }
        });

        // 3. Email addresses → extract person/org names from them
        matchAll(EMAIL, sample).forEach(m -> {
            String local = m.split("@")[0].replaceAll("[._]", " ").trim();
            if (local.length() > 2) {
                String name = Arrays.stream(local.split(" "))
                    .map(w -> w.length() > 0 ? Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase() : w)
                    .collect(Collectors.joining(" "));
                entities.put(name, wrapper(name, "PEOPLE", "Person identified via email in " + fileName));
            }
        });

        // 4. Years as Temporal Markers
        matchAll(YEAR, sample).stream().distinct().limit(5).forEach(y ->
            entities.put("Year " + y, wrapper("Year " + y, "TEMPORAL", "Year reference in " + fileName))
        );

        // 5. Proper Nouns (Capitalized multi-word phrases)
        matchAll(PROPER_NOUN, sample).stream()
            .filter(m -> !STOP_WORDS.contains(m.split(" ")[0]))
            .filter(m -> m.split(" ").length <= 4)
            .filter(m -> m.length() > 3)
            .distinct()
            .limit(40)
            .forEach(m -> {
                if (!entities.containsKey(m)) {
                    String type = inferType(m);
                    entities.put(m, wrapper(m, type, "Identified in " + fileName));
                }
            });

        // 6. ALL_CAPS acronyms (AMCAT, JDBC, etc.)
        matchAll(ALL_CAPS, sample).stream()
            .filter(m -> m.length() >= 2 && m.length() <= 8)
            .filter(m -> !STOP_WORDS.contains(m))
            .distinct()
            .limit(20)
            .forEach(m -> {
                if (!entities.containsKey(m)) {
                    entities.put(m, wrapper(m, "TECHNICAL", "Acronym in " + fileName));
                }
            });

        // 7. Percentages
        matchAll(PERCENTAGE, sample).stream().distinct().limit(5).forEach(p ->
            entities.put(p, wrapper(p, "METRIC", "Percentage metric in " + fileName))
        );

        return entities;
    }

    private String inferType(String name) {
        String lower = name.toLowerCase();
        if (lower.contains("ltd") || lower.contains("inc") || lower.contains("pvt") ||
            lower.contains("corp") || lower.contains("technologies") || lower.contains("solutions") ||
            lower.contains("services") || lower.contains("bank") || lower.contains("institute") ||
            lower.contains("university") || lower.contains("college")) return "ORGANIZATION";
        if (lower.contains("payment") || lower.contains("salary") || lower.contains("fee") ||
            lower.contains("amount") || lower.contains("cost") || lower.contains("price")) return "FINANCIAL";
        // Check if it could be a person name (2 words, common structure)
        String[] parts = name.split(" ");
        if (parts.length == 2 && parts[0].length() > 2 && parts[1].length() > 2) return "PEOPLE";
        return "CONCEPT";
    }

    // ─── Try LLM extraction with a tiny sample ────────────────────────────────
    private Map<String, ExtractedEntityDTO.EntityWrapper> tryLlmExtraction(String fileName, String text) {
        Map<String, ExtractedEntityDTO.EntityWrapper> results = new LinkedHashMap<>();
        try {
            // Use only 1500 chars to prevent Ollama OOM
            String miniSample = text.substring(0, Math.min(text.length(), 1500));

            String prompt = String.format(
                "Extract key named entities from this text. Return ONLY valid JSON, nothing else.\n" +
                "Format: {\"entities\":[{\"name\":\"X\",\"type\":\"PEOPLE|ORGANIZATION|TECHNICAL|CONCEPT\",\"context\":\"brief context\"}]}\n" +
                "Text: %s", miniSample);

            String response = chatLanguageModel.generate(prompt);
            int start = response.indexOf("{");
            int end = response.lastIndexOf("}");
            if (start != -1 && end > start) {
                String json = response.substring(start, end + 1);
                ExtractedEntityDTO dto = objectMapper.readValue(json, ExtractedEntityDTO.class);
                if (dto != null && dto.getEntities() != null) {
                    for (ExtractedEntityDTO.EntityWrapper ew : dto.getEntities()) {
                        if (ew.getName() != null && !ew.getName().isBlank()) {
                            results.put(ew.getName(), ew);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Neural Extraction [LLM]: Skipped for '{}' — {} (rule-based results preserved)", fileName, e.getMessage());
        }
        return results;
    }

    // ─── Co-occurrence Relationship Generation ────────────────────────────────
    private void persistCooccurrenceRelationships(String text, Map<String, KnowledgeEntity> entities, Document doc) {
        if (entities.size() < 2) return;

        List<Map.Entry<String, KnowledgeEntity>> entries = new ArrayList<>(entities.entrySet());
        List<KnowledgeRelationship> toSave = new ArrayList<>();
        String lowerText = text.toLowerCase();

        // Connect entities that appear within 300 characters of each other
        for (int i = 0; i < entries.size(); i++) {
            for (int j = i + 1; j < entries.size(); j++) {
                String nameA = entries.get(i).getKey();
                String nameB = entries.get(j).getKey();
                KnowledgeEntity entityA = entries.get(i).getValue();
                KnowledgeEntity entityB = entries.get(j).getValue();

                int posA = lowerText.indexOf(nameA);
                int posB = lowerText.indexOf(nameB);

                if (posA >= 0 && posB >= 0 && Math.abs(posA - posB) < 300) {
                    String relation = inferRelation(entityA.getType(), entityB.getType());
                    boolean exists = knowledgeRelationshipRepository
                        .existsBySourceIdAndTargetIdAndRelationType(entityA.getId(), entityB.getId(), relation);
                    if (!exists) {
                        toSave.add(KnowledgeRelationship.builder()
                            .source(entityA)
                            .target(entityB)
                            .relationType(relation)
                            .session(doc.getSession())
                            .build());
                    }
                }
                if (toSave.size() > 60) break; // Cap to prevent explosion
            }
            if (toSave.size() > 60) break;
        }

        if (!toSave.isEmpty()) {
            knowledgeRelationshipRepository.saveAll(toSave);
            log.info("Neural Extraction: Persisted {} co-occurrence relationships for '{}'", toSave.size(), doc.getFileName());
        }
    }

    private String inferRelation(String typeA, String typeB) {
        if ("PEOPLE".equals(typeA) && "ORGANIZATION".equals(typeB)) return "WORKS_AT";
        if ("ORGANIZATION".equals(typeA) && "PEOPLE".equals(typeB)) return "EMPLOYS";
        if ("PEOPLE".equals(typeA) && "TECHNICAL".equals(typeB)) return "USES";
        if ("TECHNICAL".equals(typeA) && "TECHNICAL".equals(typeB)) return "RELATED_TO";
        if ("FINANCIAL".equals(typeA) || "FINANCIAL".equals(typeB)) return "ASSOCIATED_WITH";
        return "CO_OCCURS_WITH";
    }

    // ─── Utilities ────────────────────────────────────────────────────────────
    private List<String> matchAll(Pattern pattern, String text) {
        List<String> matches = new ArrayList<>();
        Matcher m = pattern.matcher(text);
        while (m.find()) matches.add(m.group());
        return matches;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private ExtractedEntityDTO.EntityWrapper wrapper(String name, String type, String context) {
        ExtractedEntityDTO.EntityWrapper w = new ExtractedEntityDTO.EntityWrapper();
        w.setName(name);
        w.setType(type);
        w.setContext(context);
        return w;
    }
}
