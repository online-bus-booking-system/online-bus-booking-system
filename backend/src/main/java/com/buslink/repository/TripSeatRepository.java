package com.buslink.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.buslink.entities.TripSeat;

import jakarta.persistence.LockModeType;

@Repository
public interface TripSeatRepository extends JpaRepository<TripSeat, Long> {

	List<TripSeat> findByTripId(Long tripId);

	Optional<TripSeat> findByTripIdAndSeatNumber(Long tripId, String seatNumber);

	// Pessimistic Write Lock query to prevent concurrent double booking
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT ts FROM TripSeat ts WHERE ts.trip.id = :tripId AND ts.seatNumber = :seatNumber")
	Optional<TripSeat> findByTripIdAndSeatNumberWithLock(@Param("tripId") Long tripId, @Param("seatNumber") String seatNumber);
}
