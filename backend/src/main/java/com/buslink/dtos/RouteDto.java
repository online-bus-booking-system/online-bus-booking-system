package com.buslink.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteDto {

	private Long id;
	private Long operatorId;
	private String sourceCity;
	private String destinationCity;
	private Integer distanceKm;
	private String duration;

	private List<StopDto> boardingPoints;
	private List<StopDto> droppingPoints;

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	public static class StopDto {
		private String location;
		private String landmark;
		private String time;
	}
}
