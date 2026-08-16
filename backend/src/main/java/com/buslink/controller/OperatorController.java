package com.buslink.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.buslink.dtos.ApiResponseDto;
import com.buslink.dtos.DashboardStatsDto;
import com.buslink.dtos.OperatorResubmitDto;
import com.buslink.service.OperatorService;
import com.buslink.service.RevenueService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/operator")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OperatorController {

	private final OperatorService operatorService;
	private final RevenueService revenueService;

	@PostMapping("/resubmit/{operatorId}")
	public ResponseEntity<ApiResponseDto> resubmitDocuments(@PathVariable Long operatorId, @RequestBody OperatorResubmitDto resubmitDto) {
		operatorService.resubmitApprovalDocuments(operatorId, resubmitDto);
		return ResponseEntity.ok(new ApiResponseDto("success", "Documents resubmitted for Admin review"));
	}

	@GetMapping("/deactivate-check/{operatorId}")
	public ResponseEntity<ApiResponseDto> checkDeactivationEligibility(@PathVariable Long operatorId) {
		Map<String, Object> eligibility = operatorService.checkDeactivationEligibility(operatorId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Deactivation eligibility checked", eligibility));
	}

	@PostMapping("/deactivate-request/{operatorId}")
	public ResponseEntity<ApiResponseDto> requestDeactivation(@PathVariable Long operatorId, @RequestParam(required = false) String reason) {
		operatorService.requestAccountDeactivation(operatorId, reason != null ? reason : "Operator requested closure");
		return ResponseEntity.ok(new ApiResponseDto("success", "Deactivation request submitted to Admin for review"));
	}

	@GetMapping("/dashboard-stats/{operatorId}")
	public ResponseEntity<ApiResponseDto> getDashboardStats(
			@PathVariable Long operatorId,
			@RequestParam(defaultValue = "monthly") String period) {
		DashboardStatsDto stats = revenueService.getOperatorDashboardStats(operatorId, period);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator dashboard statistics fetched", stats));
	}
}
