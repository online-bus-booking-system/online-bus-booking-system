package com.buslink.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.buslink.dtos.ApiResponseDto;
import com.buslink.dtos.UpdateProfileDto;
import com.buslink.dtos.UserProfileDto;
import com.buslink.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping("/profile/{userId}")
	public ResponseEntity<ApiResponseDto> getProfile(@PathVariable Long userId) {
		UserProfileDto profile = userService.getUserProfile(userId);
		return ResponseEntity.ok(new ApiResponseDto("success", "User profile fetched", profile));
	}

	@PutMapping("/profile/{userId}")
	public ResponseEntity<ApiResponseDto> updateProfile(@PathVariable Long userId, @RequestBody UpdateProfileDto updateDto) {
		UserProfileDto updated = userService.updateUserProfile(userId, updateDto);
		return ResponseEntity.ok(new ApiResponseDto("success", "Profile updated successfully", updated));
	}
}
