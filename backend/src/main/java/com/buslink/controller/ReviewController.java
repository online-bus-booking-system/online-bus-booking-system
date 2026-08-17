package com.buslink.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.buslink.dtos.ApiResponseDto;
import com.buslink.dtos.ReviewDto;
import com.buslink.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReviewController {

	private final ReviewService reviewService;

	@PostMapping("/submit")
	public ResponseEntity<?> submitReview(@RequestBody ReviewDto reviewDto) {
		ReviewDto saved = reviewService.submitReview(reviewDto);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponseDto("SUCCESS", "Review saved to database successfully", saved));
	}

	@GetMapping("/bus/{busId}")
	public ResponseEntity<?> getReviewsByBus(@PathVariable Long busId) {
		List<ReviewDto> reviews = reviewService.getReviewsByBus(busId);
		return ResponseEntity.ok(new ApiResponseDto("SUCCESS", "Bus reviews retrieved", reviews));
	}
}
