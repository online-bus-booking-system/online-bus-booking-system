package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CitationDto {
    private String document;
    private int page;
    private String section;
    private double similarityScore;
    private String chunkId;
}
