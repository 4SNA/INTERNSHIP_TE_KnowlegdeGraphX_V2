# KnowledgeGraphX Neural Workspace 🧠🌐

KnowledgeGraphX is a next-generation SaaS platform that transforms unstructured organizational data into a high-fidelity, interactive knowledge graph. 

Built with a focus on real-time collaboration and advanced RAG (Retrieval-Augmented Generation) architectures, it allows teams to query their entire document corpus using a natural, AI-driven interface.

## 🚀 Tech Stack

### 🎨 Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4.0 (Custom Glassmorphism Engine)
- **Icons**: Lucide React
- **State**: React 19 Server Components & Client Hooks
- **Real-time**: Socket.IO Client / Spring WebSocket

### ⚙️ Backend
- **Core**: Spring Boot 3.4 (Java 17+)
- **Security**: Spring Security + JWT
- **Real-time**: Spring WebSocket + Redis Pub/Sub
- **Database**: PostgreSQL with **PgVector** extension (Structured Data & Vector Storage)
- **Caching**: Memurai / Redis natively on Windows
- **Neural Engine**: Local Ollama AI orchestrating `llama3` for Entity Extraction & chat synthesis, and `nomic-embed-text` for semantic indexing. LangChain4j integration.

## ✨ Key Features
- **Instant Asynchronous Pipeline**: Multi-threaded Spring Boot ingestion that decouples document parsing, entity extraction, and vector indexing for a 0-latency perceived UX.
- **Neural Dashboard**: Bento-grid metrics and live system monitoring.
- **Collaborative Workspace**: Real-time multi-user document analysis with AI assistance.
- **Source Citations**: AI responses with direct links to document page numbers and sections.
- **Interactive Knowledge Graph**: Visualize entity relationships and thematic clusters across your corpus.
- **Advanced Architecture**: Localized AI processing eliminating 3rd party API costs and guaranteeing privacy via D-Drive orchestration.

## 📂 Project Structure
- `/frontend`: Next.js application with a premium dark futuristic design system.
- `/backend`: Spring Boot core engine for document processing and AI orchestration.
- `run_kgx_on_d.ps1`: The ultimate self-healing orchestrator script. Single-click start for Vector DB, Cache, Local LLM, and Microservices.

## 🛠️ Getting Started

### The Ultimate Deployment (D-Drive Optimized)
Simply execute the deployment orchestrator. It manages paths, resolves port conflicts, initiates Redis/PostgreSQL locally, ensures AI models are spawned, and spins up both backend and frontend applications synchronously.

```bash
.\run_kgx_on_d.ps1
```

---
Designed for speed, intelligence, and a seamless collaborative future.
© 2026 KnowledgeGraphX Core Team
