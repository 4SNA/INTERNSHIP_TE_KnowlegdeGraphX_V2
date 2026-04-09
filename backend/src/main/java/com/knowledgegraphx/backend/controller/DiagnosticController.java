package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.dto.diagnostics.NeuralAuditReport;
import com.knowledgegraphx.backend.service.DiagnosticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/diagnostics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiagnosticController {

    private final DiagnosticService diagnosticService;

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<NeuralAuditReport> getSessionAudit(@PathVariable Long sessionId) {
        return ResponseEntity.ok(diagnosticService.getSessionAudit(sessionId));
    }

    @GetMapping("/engine/health")
    public ResponseEntity<NeuralAuditReport.EngineStatus> getEngineHealth() {
        // Return global health pulse
        NeuralAuditReport report = diagnosticService.getSessionAudit(-1L); 
        return ResponseEntity.ok(report.getEngineStatus());
    }
}
