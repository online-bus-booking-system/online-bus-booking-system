package com.buslink.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.OperatorResubmitDto;
import com.buslink.dtos.SignupRequestDto;
import com.buslink.entities.BusOperator;
import com.buslink.entities.OperatorDocument;
import com.buslink.entities.User;
import com.buslink.repository.BusOperatorRepository;
import com.buslink.repository.OperatorDocumentRepository;
import com.buslink.repository.TripRepository;
import com.buslink.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class OperatorServiceImpl implements OperatorService {

	private final BusOperatorRepository busOperatorRepository;
	private final UserRepository userRepository;
	private final OperatorDocumentRepository operatorDocumentRepository;
	private final TripRepository tripRepository;

	@Override
	public void resubmitApprovalDocuments(Long operatorId, OperatorResubmitDto resubmitDto) {
		BusOperator operator = busOperatorRepository.findById(operatorId)
				.orElseThrow(() -> new ResourceNotFoundException("Bus Operator not found with id: " + operatorId));

		if (resubmitDto.getCompanyName() != null) operator.setCompanyName(resubmitDto.getCompanyName());
		if (resubmitDto.getCity() != null) operator.setCity(resubmitDto.getCity());

		operator.setApprovalStatus("PENDING");
		operator.setRejectionReason(null);
		busOperatorRepository.save(operator);

		if (resubmitDto.getDocuments() != null) {
			for (SignupRequestDto.DocumentDto docDto : resubmitDto.getDocuments()) {
				OperatorDocument doc = new OperatorDocument();
				doc.setOperator(operator);
				doc.setDocumentType(docDto.getDocumentType());
				doc.setDocumentName(docDto.getDocumentName());
				doc.setFilePath("uploads/" + docDto.getDocumentName());
				operatorDocumentRepository.save(doc);
			}
		}
	}

	@Override
	public Map<String, Object> checkDeactivationEligibility(Long operatorId) {
		Long scheduledCount = tripRepository.countScheduledOrUpcomingTrips(operatorId, LocalDate.now());
		boolean isEligible = (scheduledCount == 0);

		Map<String, Object> result = new HashMap<>();
		result.put("isEligible", isEligible);
		result.put("scheduledTripsCount", scheduledCount);
		result.put("message", isEligible 
			? "Operator has no scheduled trips and is eligible to request account deactivation." 
			: "Cannot request account deactivation while you have " + scheduledCount + " scheduled or upcoming trips. All trips must be completed before requesting deactivation.");

		return result;
	}

	@Override
	public void requestAccountDeactivation(Long operatorId, String reason) {
		User user = userRepository.findById(operatorId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + operatorId));

		BusOperator operator = busOperatorRepository.findById(operatorId)
				.orElseThrow(() -> new ResourceNotFoundException("Bus Operator not found with id: " + operatorId));

		// Validate scheduled trips
		Long scheduledCount = tripRepository.countScheduledOrUpcomingTrips(operatorId, LocalDate.now());
		if (scheduledCount > 0) {
			throw new IllegalStateException("Cannot request account deactivation while you have " + scheduledCount + " scheduled or upcoming trips. All trips must be completed before requesting deactivation.");
		}

		user.setDeactivationStatus("REQUESTED");
		user.setDeactivationReason(reason);
		userRepository.save(user);

		operator.setApprovalStatus("DEACTIVATION_REQUESTED");
		busOperatorRepository.save(operator);
	}
}
