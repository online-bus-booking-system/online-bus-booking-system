package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RagChatResponseDto {
    private String answer;
    private List<CitationDto> citations;
    private int retrievedCount;
    private boolean contextUsed;
    private double executionTimeSec;
}
