package com.buslink.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.RouteStop;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, Long> {
	List<RouteStop> findByRouteId(Long routeId);
	List<RouteStop> findByRouteIdAndStopType(Long routeId, String stopType);
}
