package com.buslink.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Bus;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
	List<Bus> findByOperatorId(Long operatorId);
	Optional<Bus> findByBusNumber(String busNumber);
}
