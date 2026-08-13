package com.buslink.service;

import java.util.List;

import com.buslink.dtos.BookingRequestDto;
import com.buslink.dtos.BookingResponseDto;
import com.buslink.dtos.CancelBookingDto;

public interface BookingService {
	BookingResponseDto createBooking(Long userId, BookingRequestDto bookingRequest);
	List<BookingResponseDto> getCustomerBookings(Long userId);
	BookingResponseDto getBookingByPnr(String pnrNumber);
	BookingResponseDto getBookingByPnrAndPhone(String pnrNumber, String mobileNumber);
	List<BookingResponseDto> getOperatorBookings(Long operatorId);
	void cancelBooking(Long userId, CancelBookingDto cancelDto);
}
