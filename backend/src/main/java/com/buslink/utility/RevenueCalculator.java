package com.buslink.utility;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.buslink.repository.CancellationRepository;
import com.buslink.repository.RevenueRepository;

import lombok.RequiredArgsConstructor;

/**
 * To follow Single Responsibility Principle (SRP), this separate class is created for calculating net revenues and applying refund deductions
 * and is used in RevenueService.
 */
@Component
@RequiredArgsConstructor
public class RevenueCalculator {

	private final RevenueRepository revenueRepository;
	private final CancellationRepository cancellationRepository;

	public Double calculateNetOperatorRevenue(Long operatorId, LocalDateTime startDate) {
		Double gross = revenueRepository.calculateOperatorGrossRevenue(operatorId, startDate);
		Double totalRefundsDeducted = cancellationRepository.getTotalRefundDeductedForOperator(operatorId, startDate);

		if (gross == null) gross = 0.0;
		if (totalRefundsDeducted == null) totalRefundsDeducted = 0.0;

		return Math.max(0.0, gross - totalRefundsDeducted);
	}
}
