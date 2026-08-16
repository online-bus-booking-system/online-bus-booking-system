package com.buslink.service;

import java.util.List;

import com.buslink.dtos.OperatorApprovalDto;
import com.buslink.dtos.OperatorAuditDetailsDto;
import com.buslink.dtos.UserProfileDto;

public interface AdminService {
	List<UserProfileDto> getPendingOperators();
	List<UserProfileDto> getAllOperators();
	List<UserProfileDto> getDeactivationRequests();
	List<UserProfileDto> searchOperatorsByName(String query);
	OperatorAuditDetailsDto getOperatorAuditDetails(Long operatorId);
	void processOperatorApproval(OperatorApprovalDto approvalDto);
	void processOperatorDeactivation(Long operatorId, Boolean approve);
	void toggleOperatorStatus(Long operatorId, Boolean isActive);
}
