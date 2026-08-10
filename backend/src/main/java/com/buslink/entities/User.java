package com.buslink.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true, exclude = "password")
public class User extends BaseEntity {

	@Column(name = "full_name", nullable = false, length = 100)
	private String fullName;

	@Column(name = "email", nullable = false, unique = true, length = 100)
	private String email;

	@Column(name = "password", nullable = false, length = 255)
	private String password;

	@Column(name = "phone", nullable = false, length = 20)
	private String phone;

	@Column(name = "gender", length = 20)
	private String gender;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false, length = 30)
	private UserRole role;

	// Soft delete flag for customer profiles
	@Column(name = "is_deleted")
	private Boolean isDeleted = false;

	// Operator deactivation request status: NONE, REQUESTED, APPROVED
	@Column(name = "deactivation_status", length = 30)
	private String deactivationStatus = "NONE";

	@Column(name = "deactivation_reason", length = 255)
	private String deactivationReason;
}
