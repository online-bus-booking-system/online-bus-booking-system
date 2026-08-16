package com.buslink.service;

import java.time.LocalDate;
import java.util.List;

import com.buslink.dtos.TripDto;

public interface TripService {
	TripDto createTrip(TripDto tripDto);
	List<TripDto> searchActiveTrips(String source, String destination, LocalDate date);
	TripDto getTripById(Long tripId);
	List<TripDto> getTripsByOperator(Long operatorId);
	void cancelTripByOperator(Long tripId, Long operatorId);
}
