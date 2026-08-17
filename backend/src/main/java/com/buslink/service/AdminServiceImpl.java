package com.buslink.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.OperatorApprovalDto;
import com.buslink.dtos.OperatorAuditDetailsDto;
import com.buslink.dtos.UserProfileDto;
import com.buslink.entities.Bus;
import com.buslink.entities.BusOperator;
import com.buslink.entities.Review;
import com.buslink.entities.Route;
import com.buslink.entities.User;
import com.buslink.repository.BusOperatorRepository;
import com.buslink.repository.BusRepository;
import com.buslink.repository.ReviewRepository;
import com.buslink.repository.RouteRepository;
import com.buslink.repository.TripRepository;
import com.buslink.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

	private final BusOperatorRepository busOperatorRepository;
	private final UserRepository userRepository;
	private final BusRepository busRepository;
	private final RouteRepository routeRepository;
	private final TripRepository tripRepository;
	private final ReviewRepository reviewRepository;

	@Override
	public List<UserProfileDto> getPendingOperators() {
		return busOperatorRepository.findByApprovalStatus("PENDING").stream()
				.map(op -> mapOperatorToDto(op.getUser(), op))
				.collect(Collectors.toList());
	}

	@Override
	public List<UserProfileDto> getAllOperators() {
		return busOperatorRepository.findAll().stream()
				.map(op -> mapOperatorToDto(op.getUser(), op))
				.collect(Collectors.toList());
	}

	@Override
	public List<UserProfileDto> getDeactivationRequests() {
		return userRepository.findAll().stream()
				.filter(u -> "REQUESTED".equalsIgnoreCase(u.getDeactivationStatus()) 
						|| (busOperatorRepository.findById(u.getId()).isPresent() 
							&& "DEACTIVATION_REQUESTED".equalsIgnoreCase(busOperatorRepository.findById(u.getId()).get().getApprovalStatus())))
				.map(u -> {
					BusOperator op = busOperatorRepository.findById(u.getId()).orElse(null);
					return mapOperatorToDto(u, op);
				})
				.collect(Collectors.toList());
	}

	@Override
	public List<UserProfileDto> searchOperatorsByName(String query) {
		if (query == null || query.trim().isEmpty()) {
			return getAllOperators();
		}
		String q = query.trim().toLowerCase();
		return busOperatorRepository.findAll().stream()
				.filter(op -> (op.getCompanyName() != null && op.getCompanyName().toLowerCase().contains(q))
						|| (op.getUser() != null && op.getUser().getFullName() != null && op.getUser().getFullName().toLowerCase().contains(q)))
				.map(op -> mapOperatorToDto(op.getUser(), op))
				.collect(Collectors.toList());
	}

	@Override
	public OperatorAuditDetailsDto getOperatorAuditDetails(Long operatorId) {
		BusOperator op = busOperatorRepository.findById(operatorId)
				.orElseThrow(() -> new ResourceNotFoundException("Bus Operator not found with id: " + operatorId));
		User user = op.getUser();

		OperatorAuditDetailsDto audit = new OperatorAuditDetailsDto();
		audit.setOperatorId(op.getId());
		audit.setCompanyName(op.getCompanyName());
		audit.setFullName(user.getFullName());
		audit.setEmail(user.getEmail());
		audit.setPhone(user.getPhone());
		audit.setCity(op.getCity());
		audit.setRating(op.getRating());
		audit.setApprovalStatus(op.getApprovalStatus());
		audit.setIsActive(op.getIsActive());
		audit.setDeactivationStatus(user.getDeactivationStatus());
		audit.setDeactivationReason(user.getDeactivationReason());

		// 1. Buses (Excluding Revenue)
		List<Bus> buses = busRepository.findByOperatorId(operatorId);
		List<OperatorAuditDetailsDto.BusAuditDto> busDtos = buses.stream().map(b -> new OperatorAuditDetailsDto.BusAuditDto(
				b.getId(), b.getBusName(), b.getBusNumber(), b.getBusType(), b.getTotalSeats(), b.getLayoutType(), b.getAmenities()
		)).collect(Collectors.toList());
		audit.setBuses(busDtos);

		// 2. Routes
		List<Route> routes = routeRepository.findByOperatorId(operatorId);
		List<OperatorAuditDetailsDto.RouteAuditDto> routeDtos = routes.stream().map(r -> new OperatorAuditDetailsDto.RouteAuditDto(
				r.getId(), r.getSourceCity(), r.getDestinationCity(), r.getDistanceKm(), r.getDuration()
		)).collect(Collectors.toList());
		audit.setRoutes(routeDtos);

		// 3. Trip Counts (Excluding Revenue)
		Long totalTrips = tripRepository.countByBusOperatorId(operatorId);
		Long completedTrips = tripRepository.countByBusOperatorIdAndStatus(operatorId, "COMPLETED");
		Long scheduledTrips = tripRepository.countScheduledOrUpcomingTrips(operatorId, LocalDate.now());
		audit.setTotalTripsCount(totalTrips != null ? totalTrips : 0);
		audit.setCompletedTripsCount(completedTrips != null ? completedTrips : 0);
		audit.setScheduledTripsCount(scheduledTrips != null ? scheduledTrips : 0);

		// 4. Customer Reviews
		List<OperatorAuditDetailsDto.ReviewAuditDto> reviewDtos = new ArrayList<>();
		for (Bus bus : buses) {
			List<Review> reviews = reviewRepository.findByBusId(bus.getId());
			for (Review rev : reviews) {
				String custName = "Verified Passenger";
				if (rev.getBooking() != null && rev.getBooking().getUser() != null) {
					custName = rev.getBooking().getUser().getFullName();
				} else if (rev.getBooking() != null && rev.getBooking().getGuestContact() != null) {
					custName = rev.getBooking().getGuestContact().getFullName();
				}
				reviewDtos.add(new OperatorAuditDetailsDto.ReviewAuditDto(
						rev.getId(), custName, rev.getRating(), rev.getComment(), 
						rev.getCreatedAt() != null ? rev.getCreatedAt().toString() : "N/A"
				));
			}
		}
		audit.setReviews(reviewDtos);

		return audit;
	}

	@Override
	public void processOperatorApproval(OperatorApprovalDto approvalDto) {
		BusOperator operator = busOperatorRepository.findById(approvalDto.getOperatorId())
				.orElseThrow(() -> new ResourceNotFoundException("Bus Operator not found with id: " + approvalDto.getOperatorId()));

		if ("APPROVED".equalsIgnoreCase(approvalDto.getApprovalStatus())) {
			operator.setApprovalStatus("APPROVED");
			operator.setRejectionReason(null);
			operator.setIsActive(true);
		} else {
			operator.setApprovalStatus("REJECTED");
			operator.setRejectionReason(approvalDto.getRejectionReason() != null ? approvalDto.getRejectionReason() : "License or documents incomplete");
			operator.setIsActive(false);
		}

		busOperatorRepository.save(operator);
	}

	@Override
	public void processOperatorDeactivation(Long operatorId, Boolean approve) {
		User user = userRepository.findById(operatorId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + operatorId));

		BusOperator operator = busOperatorRepository.findById(operatorId).orElse(null);

		if (Boolean.TRUE.equals(approve)) {
			user.setDeactivationStatus("APPROVED");
			user.setIsDeleted(true);
			if (operator != null) {
				operator.setIsActive(false);
				operator.setApprovalStatus("DEACTIVATED");
			}
		} else {
			user.setDeactivationStatus("NONE");
			user.setDeactivationReason(null);
			if (operator != null) {
				operator.setApprovalStatus("APPROVED");
				operator.setIsActive(true);
			}
		}

		userRepository.save(user);
		if (operator != null) busOperatorRepository.save(operator);
	}

	@Override
	public void toggleOperatorStatus(Long operatorId, Boolean isActive) {
		User user = userRepository.findById(operatorId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + operatorId));

		BusOperator operator = busOperatorRepository.findById(operatorId)
				.orElseThrow(() -> new ResourceNotFoundException("Bus Operator not found with id: " + operatorId));

		operator.setIsActive(isActive);
		if (Boolean.FALSE.equals(isActive)) {
			user.setDeactivationStatus("DEACTIVATED_BY_ADMIN");
			user.setIsDeleted(true);
			operator.setApprovalStatus("DEACTIVATED");
		} else {
			user.setDeactivationStatus("NONE");
			user.setIsDeleted(false);
			operator.setApprovalStatus("APPROVED");
		}

		busOperatorRepository.save(operator);
		userRepository.save(user);
	}

	private UserProfileDto mapOperatorToDto(User user, BusOperator op) {
		UserProfileDto dto = new UserProfileDto();
		dto.setId(user.getId());
		dto.setName(user.getFullName());
		dto.setEmail(user.getEmail());
		dto.setGender(user.getGender());
		dto.setPhone(user.getPhone());
		dto.setRole(user.getRole().name().replace("ROLE_", "").toLowerCase());
		dto.setDeactivationStatus(user.getDeactivationStatus());
		dto.setDeactivationReason(user.getDeactivationReason());

		if (op != null) {
			dto.setCompanyName(op.getCompanyName());
			dto.setApprovalStatus(op.getApprovalStatus());
			dto.setRejectionReason(op.getRejectionReason());
			dto.setIsActive(op.getIsActive());
		}

		return dto;
	}
}
