package com.buslink.utility;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.buslink.custom_exceptions.AccountDeletionException;
import com.buslink.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

/**
 * To follow Single Responsibility Principle (SRP), this separate class is created for validating customer account soft delete rules
 * and is used in CustomerService.
 */
@Component
@RequiredArgsConstructor
public class CustomerAccountValidator {

	private final BookingRepository bookingRepository;

	public void validateCustomerCanBeSoftDeleted(Long userId) {
		Long upcomingCount = bookingRepository.countUpcomingJourneysForUser(userId, LocalDate.now());
		if (upcomingCount != null && upcomingCount > 0) {
			throw new AccountDeletionException("Cannot delete account because you have an upcoming journey.");
		}
	}
}
