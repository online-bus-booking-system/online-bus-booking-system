package com.buslink.utility;

import org.springframework.stereotype.Component;

/**
 * To follow Single Responsibility Principle (SRP), this separate class is created for QR code payload generation
 * and is used in BookingService.
 */
@Component
public class QrCodeGenerator {

	public String generateQrData(String pnrNumber, String passengerName, Double totalFare, String busNumber) {
		return String.format("BUSLINK_TICKET|PNR:%s|PASSENGER:%s|FARE:%.2f|BUS:%s", pnrNumber, passengerName, totalFare, busNumber);
	}
}
