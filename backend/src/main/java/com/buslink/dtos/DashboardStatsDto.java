package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {

	private Long totalBookings;
	private Long cancelledBookings;
	private Long activeTrips;
	private RevenueStatsDto revenues;
}
