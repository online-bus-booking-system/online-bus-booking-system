package com.buslink.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Booking;

@Repository
public interface RevenueRepository extends JpaRepository<Booking, Long> {

	/**
	 * JPQL Query: Calculates Platform Gross Volume (Total Revenue across all confirmed bookings)
	 * starting from the given startDate (Daily, Monthly, Quarterly, Annual).
	 */
	@Query("SELECT COALESCE(SUM(b.totalFare), 0.0) FROM Booking b WHERE b.bookingStatus = 'CONFIRMED' AND b.bookingDate >= :startDate")
	Double calculatePlatformGrossVolume(@Param("startDate") LocalDateTime startDate);

	/**
	 * JPQL Query: Calculates Gross Revenue for a specific Bus Operator from confirmed bookings
	 * starting from the given startDate (Daily, Monthly, Quarterly, Annual).
	 */
	@Query("SELECT COALESCE(SUM(b.totalFare), 0.0) FROM Booking b WHERE b.trip.bus.operator.id = :operatorId AND b.bookingStatus = 'CONFIRMED' AND b.bookingDate >= :startDate")
	Double calculateOperatorGrossRevenue(@Param("operatorId") Long operatorId, @Param("startDate") LocalDateTime startDate);
}
