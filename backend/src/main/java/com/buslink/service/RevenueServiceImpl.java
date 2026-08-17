package com.buslink.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.dtos.DashboardStatsDto;
import com.buslink.dtos.RevenueStatsDto;
import com.buslink.repository.BookingRepository;
import com.buslink.repository.RevenueRepository;
import com.buslink.repository.TripRepository;
import com.buslink.utility.RevenueCalculator;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class RevenueServiceImpl implements RevenueService {

	private final RevenueRepository revenueRepository;
	private final BookingRepository bookingRepository;
	private final TripRepository tripRepository;

	// To follow Single Responsibility Principle (SRP), RevenueCalculator is used in RevenueService for net revenue & refund calculations.
	private final RevenueCalculator revenueCalculator;

	@Override
	public RevenueStatsDto getPlatformRevenues() {
		LocalDateTime now = LocalDateTime.now();

		Double daily = revenueRepository.calculatePlatformGrossVolume(now.minusDays(1));
		Double monthly = revenueRepository.calculatePlatformGrossVolume(now.minusMonths(1));
		Double quarterly = revenueRepository.calculatePlatformGrossVolume(now.minusMonths(3));
		Double annual = revenueRepository.calculatePlatformGrossVolume(now.minusYears(1));

		return new RevenueStatsDto(
				daily != null ? daily : 0.0,
				monthly != null ? monthly : 0.0,
				quarterly != null ? quarterly : 0.0,
				annual != null ? annual : 0.0
		);
	}

	@Override
	public DashboardStatsDto getOperatorDashboardStats(Long operatorId, String period) {
		LocalDateTime startDate = calculateStartDateForPeriod(period);

		Long totalBookings = bookingRepository.countTotalBookingsForOperator(operatorId, startDate);
		Long cancelledBookings = bookingRepository.countCancelledBookingsForOperator(operatorId, startDate);
		Long activeTrips = tripRepository.countActiveTripsForOperator(operatorId, startDate);

		Double netRevenue = revenueCalculator.calculateNetOperatorRevenue(operatorId, startDate);

		RevenueStatsDto revenueDto = new RevenueStatsDto();
		if ("daily".equalsIgnoreCase(period)) revenueDto.setDailyRevenue(netRevenue);
		else if ("monthly".equalsIgnoreCase(period)) revenueDto.setMonthlyRevenue(netRevenue);
		else if ("quarterly".equalsIgnoreCase(period)) revenueDto.setQuarterlyRevenue(netRevenue);
		else revenueDto.setAnnualRevenue(netRevenue);

		return new DashboardStatsDto(
				totalBookings != null ? totalBookings : 0L,
				cancelledBookings != null ? cancelledBookings : 0L,
				activeTrips != null ? activeTrips : 0L,
				revenueDto
		);
	}

	private LocalDateTime calculateStartDateForPeriod(String period) {
		LocalDateTime now = LocalDateTime.now();
		if ("daily".equalsIgnoreCase(period)) return now.minusDays(1);
		if ("monthly".equalsIgnoreCase(period)) return now.minusMonths(1);
		if ("quarterly".equalsIgnoreCase(period)) return now.minusMonths(3);
		return now.minusYears(1);
	}
}
