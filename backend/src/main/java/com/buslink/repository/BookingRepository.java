package com.buslink.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

	Optional<Booking> findByPnrNumber(String pnrNumber);

	List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);

	List<Booking> findByTripBusOperatorIdOrderByBookingDateDesc(Long operatorId);

	// Check if customer has upcoming journeys for soft delete validation
	@Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.bookingStatus = 'CONFIRMED' AND b.trip.departureDate >= :currentDate")
	Long countUpcomingJourneysForUser(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);

	// Operator dashboard stats: total bookings in date range
	@Query("SELECT COUNT(b) FROM Booking b WHERE b.trip.bus.operator.id = :operatorId AND b.bookingDate >= :startDate")
	Long countTotalBookingsForOperator(@Param("operatorId") Long operatorId, @Param("startDate") LocalDateTime startDate);

	// Operator dashboard stats: cancelled bookings in date range
	@Query("SELECT COUNT(b) FROM Booking b WHERE b.trip.bus.operator.id = :operatorId AND b.bookingStatus = 'CANCELLED' AND b.bookingDate >= :startDate")
	Long countCancelledBookingsForOperator(@Param("operatorId") Long operatorId, @Param("startDate") LocalDateTime startDate);
}
