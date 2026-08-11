package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

	private Long id;
	private String name;
	private String email;
	private String gender;
	private String phone;
	private String role; // "customer", "operator", "admin"

	// Operator specific status
	private String companyName;
	private String approvalStatus; // "PENDING", "APPROVED", "REJECTED", "DEACTIVATION_REQUESTED"
	private String rejectionReason;
	private Boolean isActive;
	private String deactivationStatus; // "NONE", "REQUESTED", "APPROVED"
	private String deactivationReason;
}
