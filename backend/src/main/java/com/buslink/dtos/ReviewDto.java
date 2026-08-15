package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
	private Long id;
	private Long bookingId;
	private Long busId;
	private Double rating;
	private String comment;
}
