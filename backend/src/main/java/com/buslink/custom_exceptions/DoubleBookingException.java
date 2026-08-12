package com.buslink.custom_exceptions;

public class DoubleBookingException extends RuntimeException {
	public DoubleBookingException(String message) {
		super(message);
	}
}
