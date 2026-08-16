package com.buslink.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Trip;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

	List<Trip> findByRouteId(Long routeId);

	List<Trip> findByBusOperatorId(Long operatorId);

	@Query("SELECT t FROM Trip t WHERE LOWER(t.route.sourceCity) = LOWER(:source) AND LOWER(t.route.destinationCity) = LOWER(:destination) AND (:date IS NULL OR t.departureDate = :date) AND t.status NOT IN ('DEPARTED', 'COMPLETED', 'CANCELLED')")
	List<Trip> searchActiveTrips(@Param("source") String source, @Param("destination") String destination, @Param("date") LocalDate date);

	// Operator dashboard active trips count by date range
	@Query("SELECT COUNT(t) FROM Trip t WHERE t.bus.operator.id = :operatorId AND t.status = 'SCHEDULED' AND t.createdAt >= :startDate")
	Long countActiveTripsForOperator(@Param("operatorId") Long operatorId, @Param("startDate") LocalDateTime startDate);

	// Count scheduled or upcoming trips for deactivation validation
	@Query("SELECT COUNT(t) FROM Trip t WHERE t.bus.operator.id = :operatorId AND (t.departureDate >= :today OR t.status = 'SCHEDULED' OR t.status = 'IN_TRANSIT') AND t.status != 'CANCELLED' AND t.status != 'COMPLETED'")
	Long countScheduledOrUpcomingTrips(@Param("operatorId") Long operatorId, @Param("today") LocalDate today);

	Long countByBusOperatorIdAndStatus(Long operatorId, String status);

	Long countByBusOperatorId(Long operatorId);
}
