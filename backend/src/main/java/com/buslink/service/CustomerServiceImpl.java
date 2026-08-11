package com.buslink.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.entities.User;
import com.buslink.repository.UserRepository;
import com.buslink.utility.CustomerAccountValidator;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

	private final UserRepository userRepository;

	// To follow Single Responsibility Principle (SRP), this separate class CustomerAccountValidator is used in CustomerService for validation rules.
	private final CustomerAccountValidator customerAccountValidator;

	@Override
	public void softDeleteCustomerAccount(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

		// Validate soft delete rules (Upcoming journey, pending payment/refund)
		customerAccountValidator.validateCustomerCanBeSoftDeleted(userId);

		user.setIsDeleted(true);
		userRepository.save(user);
	}
}
