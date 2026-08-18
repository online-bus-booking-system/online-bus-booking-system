package com.buslink.service;

import com.buslink.dtos.RagChatRequestDto;
import com.buslink.dtos.RagChatResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class RagChatbotService {

    @Value("${fastapi.rag.service.url:http://localhost:8000}")
    private String fastApiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public RagChatResponseDto processChatQuery(RagChatRequestDto requestDto) {
        String url = fastApiBaseUrl + "/chat";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RagChatRequestDto> entity = new HttpEntity<>(requestDto, headers);

        try {
            ResponseEntity<RagChatResponseDto> response = restTemplate.postForEntity(url, entity, RagChatResponseDto.class);
            return response.getBody();
        } catch (Exception e) {
            RagChatResponseDto fallback = new RagChatResponseDto();
            fallback.setAnswer("Reference => No details available\nAnswer => BusLink Chatbot Service is currently undergoing maintenance. Please contact support@buslink.in or call 1800-BUS-LINK.");
            fallback.setCitations(java.util.Collections.emptyList());
            fallback.setRetrievedCount(0);
            fallback.setContextUsed(false);
            fallback.setExecutionTimeSec(0.0);
            return fallback;
        }
    }

    public Object triggerIngestion(boolean force) {
        String url = fastApiBaseUrl + "/ingest?force=" + force;
        try {
            return restTemplate.postForObject(url, null, Object.class);
        } catch (Exception e) {
            return "Failed to connect to FastAPI ingestion service: " + e.getMessage();
        }
    }

    public Object getStats() {
        String url = fastApiBaseUrl + "/stats";
        try {
            return restTemplate.getForObject(url, Object.class);
        } catch (Exception e) {
            return "Failed to retrieve vector stats: " + e.getMessage();
        }
    }
}
