package com.buslink.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "bus_operators")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class BusOperator {

	// Single Source of Truth: operatorId == userId
	@Id
	private Long id;

	@OneToOne
	@MapsId
	@JoinColumn(name = "user_id")
	private User user;

	@Column(name = "company_name", nullable = false, length = 100)
	private String companyName;

	@Column(name = "city", length = 100)
	private String city;

	@Column(name = "rating")
	private Double rating = 4.5;

	// Approval Status: PENDING, APPROVED, REJECTED
	@Column(name = "approval_status", nullable = false, length = 30)
	private String approvalStatus = "PENDING";

	@Column(name = "rejection_reason", length = 255)
	private String rejectionReason;

	// Account activation status toggle by Admin
	@Column(name = "is_active", nullable = false)
	private Boolean isActive = true;
}
