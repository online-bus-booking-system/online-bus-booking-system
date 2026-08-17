package com.buslink.controller;

import com.buslink.dtos.RagChatRequestDto;
import com.buslink.dtos.RagChatResponseDto;
import com.buslink.service.RagChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@Tag(name = "BusLink RAG FAQ Chatbot", description = "Endpoints for RAG-powered customer support chatbot")
public class RagChatbotController {

    @Autowired
    private RagChatbotService ragChatbotService;

    @PostMapping
    @Operation(summary = "Submit query to BusLink RAG Chatbot", description = "Routes user query through Spring Boot to FastAPI RAG Microservice.")
    public ResponseEntity<RagChatResponseDto> chat(@RequestBody RagChatRequestDto requestDto) {
        RagChatResponseDto response = ragChatbotService.processChatQuery(requestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ingest")
    @Operation(summary = "Trigger Knowledge Base Ingestion", description = "Triggers incremental PDF vector ingestion in FastAPI microservice.")
    public ResponseEntity<Object> ingest(@RequestParam(defaultValue = "false") boolean force) {
        Object result = ragChatbotService.triggerIngestion(force);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get Vector Database Stats", description = "Returns collection statistics from FastAPI microservice.")
    public ResponseEntity<Object> getStats() {
        Object result = ragChatbotService.getStats();
        return ResponseEntity.ok(result);
    }
}
