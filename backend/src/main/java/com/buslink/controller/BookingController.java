package com.buslink.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.buslink.dtos.ApiResponseDto;
import com.buslink.dtos.BookingRequestDto;
import com.buslink.dtos.BookingResponseDto;
import com.buslink.dtos.CancelBookingDto;
import com.buslink.dtos.FindTicketRequestDto;
import com.buslink.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BookingController {

	private final BookingService bookingService;

	@PostMapping("/create")
	public ResponseEntity<ApiResponseDto> createBooking(
			@RequestParam(required = false) Long userId,
			@Valid @RequestBody BookingRequestDto bookingRequest) {
		BookingResponseDto booking = bookingService.createBooking(userId, bookingRequest);
		return ResponseEntity.ok(new ApiResponseDto("success", "Ticket booked successfully", booking));
	}

	@GetMapping("/my-bookings/{userId}")
	public ResponseEntity<ApiResponseDto> getCustomerBookings(@PathVariable Long userId) {
		List<BookingResponseDto> bookings = bookingService.getCustomerBookings(userId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Customer bookings fetched", bookings));
	}

	@GetMapping("/pnr/{pnrNumber}")
	public ResponseEntity<ApiResponseDto> getBookingByPnr(@PathVariable String pnrNumber) {
		BookingResponseDto booking = bookingService.getBookingByPnr(pnrNumber);
		return ResponseEntity.ok(new ApiResponseDto("success", "Booking fetched by PNR", booking));
	}

	@PostMapping("/find-ticket")
	public ResponseEntity<ApiResponseDto> findTicketByPnrAndPhone(@Valid @RequestBody FindTicketRequestDto requestDto) {
		BookingResponseDto booking = bookingService.getBookingByPnrAndPhone(requestDto.getPnrNumber(), requestDto.getMobileNumber());
		return ResponseEntity.ok(new ApiResponseDto("success", "Ticket fetched successfully", booking));
	}

	@GetMapping("/operator/{operatorId}")
	public ResponseEntity<ApiResponseDto> getOperatorBookings(@PathVariable Long operatorId) {
		List<BookingResponseDto> bookings = bookingService.getOperatorBookings(operatorId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator bookings fetched", bookings));
	}

	@PostMapping("/cancel")
	public ResponseEntity<ApiResponseDto> cancelBooking(
			@RequestParam(required = false) Long userId,
			@RequestBody CancelBookingDto cancelDto) {
		bookingService.cancelBooking(userId, cancelDto);
		return ResponseEntity.ok(new ApiResponseDto("success", "Booking cancelled and refund processed"));
	}
}
