package com.buslink.utility;

import java.util.UUID;

import org.springframework.stereotype.Component;

/**
 * To follow Single Responsibility Principle (SRP), this separate class is created for PNR generation
 * and is used in BookingService.
 */
@Component
public class PnrGenerator {

	public String generatePnr() {
		String randomPart = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 6).toUpperCase();
		long timestampPart = System.currentTimeMillis() % 10000;
		return "PNR-BL-" + timestampPart + "-" + randomPart;
	}
}
