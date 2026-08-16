package com.buslink.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Route;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
	List<Route> findByOperatorId(Long operatorId);
	Optional<Route> findByOperatorIdAndSourceCityIgnoreCaseAndDestinationCityIgnoreCase(Long operatorId, String sourceCity, String destinationCity);
	Optional<Route> findBySourceCityIgnoreCaseAndDestinationCityIgnoreCase(String sourceCity, String destinationCity);
	List<Route> findBySourceCityIgnoreCase(String sourceCity);
}
