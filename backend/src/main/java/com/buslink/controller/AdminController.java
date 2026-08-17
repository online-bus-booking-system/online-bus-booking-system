package com.buslink.controller;

import java.util.List;

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
import com.buslink.dtos.OperatorApprovalDto;
import com.buslink.dtos.OperatorAuditDetailsDto;
import com.buslink.dtos.RevenueStatsDto;
import com.buslink.dtos.UserProfileDto;
import com.buslink.service.AdminService;
import com.buslink.service.RevenueService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;
	private final RevenueService revenueService;

	@GetMapping("/pending-operators")
	public ResponseEntity<ApiResponseDto> getPendingOperators() {
		List<UserProfileDto> operators = adminService.getPendingOperators();
		return ResponseEntity.ok(new ApiResponseDto("success", "Pending operators list fetched", operators));
	}

	@GetMapping("/all-operators")
	public ResponseEntity<ApiResponseDto> getAllOperators() {
		List<UserProfileDto> operators = adminService.getAllOperators();
		return ResponseEntity.ok(new ApiResponseDto("success", "All operators list fetched", operators));
	}

	@GetMapping("/operators/search")
	public ResponseEntity<ApiResponseDto> searchOperatorsByName(@RequestParam(required = false) String query) {
		List<UserProfileDto> operators = adminService.searchOperatorsByName(query);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operators search results fetched", operators));
	}

	@GetMapping("/operators/{operatorId}/audit")
	public ResponseEntity<ApiResponseDto> getOperatorAuditDetails(@PathVariable Long operatorId) {
		OperatorAuditDetailsDto auditDetails = adminService.getOperatorAuditDetails(operatorId);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator audit details fetched (Excluding Revenue)", auditDetails));
	}

	@PostMapping("/approve-operator")
	public ResponseEntity<ApiResponseDto> approveOperator(@RequestBody OperatorApprovalDto approvalDto) {
		adminService.processOperatorApproval(approvalDto);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator approval status updated"));
	}

	@GetMapping("/deactivation-requests")
	public ResponseEntity<ApiResponseDto> getDeactivationRequests() {
		List<UserProfileDto> requests = adminService.getDeactivationRequests();
		return ResponseEntity.ok(new ApiResponseDto("success", "Deactivation requests fetched", requests));
	}

	@PostMapping("/process-deactivation")
	public ResponseEntity<ApiResponseDto> processDeactivation(@RequestParam Long operatorId, @RequestParam Boolean approve) {
		adminService.processOperatorDeactivation(operatorId, approve);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator deactivation request processed"));
	}

	@PostMapping("/toggle-operator-status")
	public ResponseEntity<ApiResponseDto> toggleOperatorStatus(@RequestParam Long operatorId, @RequestParam Boolean isActive) {
		adminService.toggleOperatorStatus(operatorId, isActive);
		return ResponseEntity.ok(new ApiResponseDto("success", "Operator active status updated to: " + isActive));
	}

	@GetMapping("/platform-revenue")
	public ResponseEntity<ApiResponseDto> getPlatformRevenue() {
		RevenueStatsDto revenue = revenueService.getPlatformRevenues();
		return ResponseEntity.ok(new ApiResponseDto("success", "Platform revenue statistics fetched", revenue));
	}
}
