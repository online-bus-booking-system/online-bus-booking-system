package com.buslink.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Seat;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
	List<Seat> findByBusId(Long busId);
}
