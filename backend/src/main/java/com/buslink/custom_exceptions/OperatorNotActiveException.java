package com.buslink.custom_exceptions;

public class OperatorNotActiveException extends RuntimeException {
	public OperatorNotActiveException(String message) {
		super(message);
	}
}
