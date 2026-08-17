package com.buslink.service;

import com.buslink.dtos.DashboardStatsDto;
import com.buslink.dtos.RevenueStatsDto;

public interface RevenueService {
	RevenueStatsDto getPlatformRevenues();
	DashboardStatsDto getOperatorDashboardStats(Long operatorId, String period);
}
