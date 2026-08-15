package com.buslink.service;

import java.util.List;
import com.buslink.dtos.ReviewDto;

public interface ReviewService {
	ReviewDto submitReview(ReviewDto reviewDto);
	List<ReviewDto> getReviewsByBus(Long busId);
}
