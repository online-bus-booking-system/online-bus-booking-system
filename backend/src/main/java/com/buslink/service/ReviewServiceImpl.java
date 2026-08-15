package com.buslink.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.ReviewDto;
import com.buslink.entities.Booking;
import com.buslink.entities.Review;
import com.buslink.repository.BookingRepository;
import com.buslink.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

	private final ReviewRepository reviewRepository;
	private final BookingRepository bookingRepository;

	@Override
	public ReviewDto submitReview(ReviewDto reviewDto) {
		Booking booking = bookingRepository.findById(reviewDto.getBookingId())
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + reviewDto.getBookingId()));

		Review review = new Review();
		review.setBooking(booking);
		review.setBus(booking.getTrip().getBus());
		review.setRating(reviewDto.getRating() != null ? reviewDto.getRating() : 5.0);
		review.setComment(reviewDto.getComment());

		Review saved = reviewRepository.save(review);

		ReviewDto dto = new ReviewDto();
		dto.setId(saved.getId());
		dto.setBookingId(booking.getId());
		dto.setBusId(booking.getTrip().getBus().getId());
		dto.setRating(saved.getRating());
		dto.setComment(saved.getComment());
		return dto;
	}

	@Override
	public List<ReviewDto> getReviewsByBus(Long busId) {
		return reviewRepository.findByBusId(busId).stream().map(r -> {
			ReviewDto dto = new ReviewDto();
			dto.setId(r.getId());
			dto.setBookingId(r.getBooking().getId());
			dto.setBusId(r.getBus().getId());
			dto.setRating(r.getRating());
			dto.setComment(r.getComment());
			return dto;
		}).collect(Collectors.toList());
	}
}
