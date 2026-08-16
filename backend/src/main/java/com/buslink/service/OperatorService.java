package com.buslink.service;

import java.util.Map;
import com.buslink.dtos.OperatorResubmitDto;

public interface OperatorService {
	void resubmitApprovalDocuments(Long operatorId, OperatorResubmitDto resubmitDto);
	void requestAccountDeactivation(Long operatorId, String reason);
	Map<String, Object> checkDeactivationEligibility(Long operatorId);
}
