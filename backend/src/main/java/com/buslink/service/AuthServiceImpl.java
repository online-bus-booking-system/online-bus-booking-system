package com.buslink.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.ApiException;
import com.buslink.dtos.AuthRequestDto;
import com.buslink.dtos.AuthResponseDto;
import com.buslink.dtos.SignupRequestDto;
import com.buslink.dtos.UserProfileDto;
import com.buslink.entities.BusOperator;
import com.buslink.entities.Customer;
import com.buslink.entities.OperatorDocument;
import com.buslink.entities.User;
import com.buslink.entities.UserRole;
import com.buslink.repository.BusOperatorRepository;
import com.buslink.repository.CustomerRepository;
import com.buslink.repository.OperatorDocumentRepository;
import com.buslink.repository.UserRepository;
import com.buslink.security.CustomUserDetailsImpl;
import com.buslink.security.JwtUtils;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserRepository userRepository;
	private final CustomerRepository customerRepository;
	private final BusOperatorRepository busOperatorRepository;
	private final OperatorDocumentRepository operatorDocumentRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtUtils jwtUtils;

	@Override
	public AuthResponseDto authenticateUser(AuthRequestDto authRequest) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

		CustomUserDetailsImpl userDetails = (CustomUserDetailsImpl) authentication.getPrincipal();
		User user = userDetails.getUser();

		if (Boolean.TRUE.equals(user.getIsDeleted())) {
			throw new ApiException("This account has been deactivated or soft deleted.");
		}

		String token = jwtUtils.generateJwtToken(authentication);
		UserProfileDto userProfile = mapUserToProfileDto(user);

		return new AuthResponseDto(token, userProfile);
	}

	@Override
	public UserProfileDto registerUser(SignupRequestDto signupRequest) {
		if (userRepository.existsByEmail(signupRequest.getEmail())) {
			throw new ApiException("Email address is already registered. Please sign in.");
		}

		UserRole role;
		String reqRole = signupRequest.getRole().toLowerCase();
		if ("operator".equals(reqRole) || "bus_operator".equals(reqRole)) {
			role = UserRole.ROLE_OPERATOR;
		} else if ("admin".equals(reqRole)) {
			role = UserRole.ROLE_ADMIN;
		} else {
			role = UserRole.ROLE_CUSTOMER;
		}

		User user = new User();
		user.setFullName(signupRequest.getFullName());
		user.setEmail(signupRequest.getEmail());
		user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
		user.setPhone(signupRequest.getPhone());
		user.setGender(signupRequest.getGender());
		user.setRole(role);
		user.setIsDeleted(false);
		user.setDeactivationStatus("NONE");

		User savedUser = userRepository.save(user);

		// Enforce Single Source of Truth (userId == customerId or operatorId)
		if (role == UserRole.ROLE_CUSTOMER) {
			Customer customer = new Customer();
			customer.setUser(savedUser);
			customerRepository.save(customer);
		} else if (role == UserRole.ROLE_OPERATOR) {
			BusOperator operator = new BusOperator();
			operator.setUser(savedUser);
			operator.setCompanyName(signupRequest.getCompanyName() != null ? signupRequest.getCompanyName() : signupRequest.getFullName());
			operator.setCity("Pune");
			operator.setApprovalStatus("PENDING"); // Mandatory Admin approval flow
			operator.setIsActive(true);
			BusOperator savedOperator = busOperatorRepository.save(operator);

			// Save verification documents in operator_documents table
			if (signupRequest.getDocuments() != null) {
				for (SignupRequestDto.DocumentDto docDto : signupRequest.getDocuments()) {
					OperatorDocument doc = new OperatorDocument();
					doc.setOperator(savedOperator);
					doc.setDocumentType(docDto.getDocumentType());
					doc.setDocumentName(docDto.getDocumentName());
					doc.setFilePath("uploads/" + docDto.getDocumentName());
					operatorDocumentRepository.save(doc);
				}
			}
		}

		return mapUserToProfileDto(savedUser);
	}

	private UserProfileDto mapUserToProfileDto(User user) {
		UserProfileDto dto = new UserProfileDto();
		dto.setId(user.getId());
		dto.setName(user.getFullName());
		dto.setEmail(user.getEmail());
		dto.setGender(user.getGender());
		dto.setPhone(user.getPhone());
		dto.setRole(user.getRole().name().replace("ROLE_", "").toLowerCase());
		dto.setDeactivationStatus(user.getDeactivationStatus());

		if (user.getRole() == UserRole.ROLE_OPERATOR) {
			busOperatorRepository.findById(user.getId()).ifPresent(op -> {
				dto.setCompanyName(op.getCompanyName());
				dto.setApprovalStatus(op.getApprovalStatus());
				dto.setRejectionReason(op.getRejectionReason());
				dto.setIsActive(op.getIsActive());
			});
		}

		return dto;
	}
}
