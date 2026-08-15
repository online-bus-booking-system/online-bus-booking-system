package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OperatorApprovalDto {

	private Long operatorId;
	private String approvalStatus; // "APPROVED", "REJECTED"
	private String rejectionReason;
}
