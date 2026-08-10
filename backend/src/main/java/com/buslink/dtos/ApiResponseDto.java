package com.buslink.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponseDto {

	private String status; // "success" or "error"
	private String message;
	private Object data;
	private LocalDateTime timestamp;

	public ApiResponseDto(String status, String message) {
		this.status = status;
		this.message = message;
		this.timestamp = LocalDateTime.now();
	}

	public ApiResponseDto(String status, String message, Object data) {
		this.status = status;
		this.message = message;
		this.data = data;
		this.timestamp = LocalDateTime.now();
	}
}
