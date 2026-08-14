package com.buslink.dtos;

import java.time.LocalDate;
import java.time.LocalTime;
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
public class TripDto {

	private Long id;
	private Long busId;
	private Long routeId;

	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate departureDate;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
	private LocalTime departureTime;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
	private LocalTime arrivalTime;

	private Double price;
	private String status;

	private BusDto bus;
	private RouteDto route;
	private List<String> bookedSeats;
}
