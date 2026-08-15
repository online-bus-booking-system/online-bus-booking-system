package com.buslink.service;

import java.util.List;

import com.buslink.dtos.BusDto;

public interface BusService {
	BusDto registerBus(Long operatorId, BusDto busDto);
	List<BusDto> getBusesByOperator(Long operatorId);
	BusDto getBusById(Long busId);
}
