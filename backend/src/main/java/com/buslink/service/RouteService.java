package com.buslink.service;

import java.util.List;

import com.buslink.dtos.RouteDto;

public interface RouteService {
	RouteDto createRoute(RouteDto routeDto, Long operatorId);
	List<RouteDto> getRoutesByOperator(Long operatorId);
	List<RouteDto> getAllRoutes();
	RouteDto getRouteById(Long routeId);
}
