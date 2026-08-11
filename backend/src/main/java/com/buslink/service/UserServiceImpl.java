package com.buslink.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.UpdateProfileDto;
import com.buslink.dtos.UserProfileDto;
import com.buslink.entities.User;
import com.buslink.entities.UserRole;
import com.buslink.repository.BusOperatorRepository;
import com.buslink.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final BusOperatorRepository busOperatorRepository;

	@Override
	public UserProfileDto getUserProfile(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
		return mapUserToProfileDto(user);
	}

	@Override
	public UserProfileDto updateUserProfile(Long userId, UpdateProfileDto updateDto) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

		if (updateDto.getName() != null) user.setFullName(updateDto.getName());
		if (updateDto.getEmail() != null) user.setEmail(updateDto.getEmail());
		if (updateDto.getPhone() != null) user.setPhone(updateDto.getPhone());
		if (user.getRole() == UserRole.ROLE_CUSTOMER && updateDto.getGender() != null) {
			user.setGender(updateDto.getGender());
		}

		User saved = userRepository.save(user);
		return mapUserToProfileDto(saved);
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
