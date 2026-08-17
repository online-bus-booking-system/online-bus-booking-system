package com.buslink.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDto {

	private Long id;
	private String pnrNumber; // PNR stored in Bookings table
	private String passengerName;
	private String passengerEmail;
	private String passengerPhone;
	private Double totalFare;
	private String bookingStatus;
	private String paymentMethod;
	private String paymentStatus;
	private String qrCodeData;
	private String boardingPoint;
	private String droppingPoint;

	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate travelDate;
	private String departureTime;

	private LocalDateTime bookingDate;

	private List<BookingRequestDto.PassengerDetailDto> passengers;
	private TripDto trip;
}
