package com.buslink.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.buslink.dtos.ApiResponseDto;
import com.buslink.dtos.RouteDto;
import com.buslink.service.RouteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RouteController {

	private final RouteService routeService;

	@PostMapping("/create")
	public ResponseEntity<ApiResponseDto> createRoute(
			@RequestParam(required = false) Long operatorId,
			@RequestBody RouteDto routeDto) {
		RouteDto saved = routeService.createRoute(routeDto, operatorId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator-specific route saved", saved));
	}

	@GetMapping("/operator/{operatorId}")
	public ResponseEntity<ApiResponseDto> getRoutesByOperator(@PathVariable Long operatorId) {
		List<RouteDto> routes = routeService.getRoutesByOperator(operatorId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator routes fetched", routes));
	}

	@GetMapping("/all")
	public ResponseEntity<ApiResponseDto> getAllRoutes() {
		List<RouteDto> routes = routeService.getAllRoutes();
		return ResponseEntity.ok(new ApiResponseDto("success", "All routes list fetched", routes));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponseDto> getRouteById(@PathVariable Long id) {
		RouteDto route = routeService.getRouteById(id);
		return ResponseEntity.ok(new ApiResponseDto("success", "Route fetched", route));
	}
}
