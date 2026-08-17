package com.buslink.custom_exceptions;

public class AccountDeletionException extends RuntimeException {
	public AccountDeletionException(String message) {
		super(message);
	}
}
