package com.buslink.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.buslink.dtos.ApiResponseDto;
import com.buslink.service.CustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CustomerController {

	private final CustomerService customerService;

	@DeleteMapping("/delete-account/{userId}")
	public ResponseEntity<ApiResponseDto> softDeleteAccount(@PathVariable Long userId) {
		customerService.softDeleteCustomerAccount(userId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Customer profile soft deleted successfully"));
	}
}
