package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CancelBookingDto {

	private Long bookingId;
	private String cancellationReason;
	private Double refundAmount;
	private Double cancellationFee;
}
