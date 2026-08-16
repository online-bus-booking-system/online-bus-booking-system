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
import com.buslink.dtos.BusDto;
import com.buslink.service.BusService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/buses")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BusController {

	private final BusService busService;

	@PostMapping("/register")
	public ResponseEntity<ApiResponseDto> registerBus(@RequestParam Long operatorId, @RequestBody BusDto busDto) {
		BusDto savedBus = busService.registerBus(operatorId, busDto);
		return ResponseEntity.ok(new ApiResponseDto("success", "Bus fleet vehicle registered successfully", savedBus));
	}

	@GetMapping("/operator/{operatorId}")
	public ResponseEntity<ApiResponseDto> getBusesByOperator(@PathVariable Long operatorId) {
		List<BusDto> buses = busService.getBusesByOperator(operatorId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator buses fetched", buses));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponseDto> getBusById(@PathVariable Long id) {
		BusDto bus = busService.getBusById(id);
		return ResponseEntity.ok(new ApiResponseDto("success", "Bus fetched", bus));
	}
}
