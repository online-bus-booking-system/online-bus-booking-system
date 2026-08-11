package com.buslink.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.buslink.dtos.ApiResponseDto;
import com.buslink.dtos.AuthRequestDto;
import com.buslink.dtos.AuthResponseDto;
import com.buslink.dtos.SignupRequestDto;
import com.buslink.dtos.UserProfileDto;
import com.buslink.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/signin")
	public ResponseEntity<ApiResponseDto> signin(@Valid @RequestBody AuthRequestDto authRequest) {
		AuthResponseDto response = authService.authenticateUser(authRequest);
		return ResponseEntity.ok(new ApiResponseDto("success", "User authenticated successfully", response));
	}

	@PostMapping("/signup")
	public ResponseEntity<ApiResponseDto> signup(@Valid @RequestBody SignupRequestDto signupRequest) {
		UserProfileDto profile = authService.registerUser(signupRequest);
		return ResponseEntity.ok(new ApiResponseDto("success", "User registered successfully", profile));
	}
}
