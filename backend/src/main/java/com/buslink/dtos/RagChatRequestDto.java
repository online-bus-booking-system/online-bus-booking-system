package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RagChatRequestDto {
    private String query;
    private List<ChatTurnDto> conversationHistory;
    private Integer topK;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatTurnDto {
        private String userQuery;
        private String assistantResponse;
    }
}
