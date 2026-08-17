package com.buslink.dtos;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDto {

	@NotNull(message = "Trip ID is required")
	private Long tripId;

	@NotBlank(message = "Passenger Name is required")
	private String passengerName;

	@NotBlank(message = "Passenger Email is required")
	private String passengerEmail;

	@NotBlank(message = "Passenger Phone is required")
	private String passengerPhone;

	private List<PassengerDetailDto> passengers;
	private List<String> selectedSeats;

	@NotBlank(message = "Boarding point is required")
	private String boardingPoint;

	@NotBlank(message = "Dropping point is required")
	private String droppingPoint;

	@NotNull(message = "Total fare is required")
	private Double totalFare;

	private String paymentMethod; // "UPI", "CREDIT_CARD", etc.
	private Boolean paymentSuccess; // Simulation button: true/false

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	public static class PassengerDetailDto {
		private String name;
		private Integer age;
		private String gender;
		private String seat;
	}
}
