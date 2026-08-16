package com.buslink.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
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
import com.buslink.dtos.TripDto;
import com.buslink.service.TripService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TripController {

	private final TripService tripService;

	@PostMapping("/create")
	public ResponseEntity<ApiResponseDto> createTrip(@RequestBody TripDto tripDto) {
		TripDto created = tripService.createTrip(tripDto);
		return ResponseEntity.ok(new ApiResponseDto("success", "Trip scheduled successfully", created));
	}

	@PostMapping("/{tripId}/cancel")
	public ResponseEntity<ApiResponseDto> cancelTrip(@PathVariable Long tripId, @RequestParam Long operatorId) {
		tripService.cancelTripByOperator(tripId, operatorId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Trip cancelled successfully"));
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponseDto> searchTrips(
			@RequestParam String source,
			@RequestParam String destination,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		List<TripDto> trips = tripService.searchActiveTrips(source, destination, date);
		return ResponseEntity.ok(new ApiResponseDto("success", "Active trips search results", trips));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponseDto> getTripById(@PathVariable Long id) {
		TripDto trip = tripService.getTripById(id);
		return ResponseEntity.ok(new ApiResponseDto("success", "Trip fetched", trip));
	}

	@GetMapping("/operator/{operatorId}")
	public ResponseEntity<ApiResponseDto> getTripsByOperator(@PathVariable Long operatorId) {
		List<TripDto> trips = tripService.getTripsByOperator(operatorId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator trips fetched", trips));
	}
}
