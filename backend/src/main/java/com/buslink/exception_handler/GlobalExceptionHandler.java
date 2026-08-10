package com.buslink.exception_handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.buslink.custom_exceptions.AccountDeletionException;
import com.buslink.custom_exceptions.ApiException;
import com.buslink.custom_exceptions.DoubleBookingException;
import com.buslink.custom_exceptions.OperatorNotActiveException;
import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.ApiResponseDto;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiResponseDto> handleResourceNotFound(ResourceNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponseDto("error", ex.getMessage()));
	}

	@ExceptionHandler(DoubleBookingException.class)
	public ResponseEntity<ApiResponseDto> handleDoubleBooking(DoubleBookingException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(new ApiResponseDto("error", ex.getMessage()));
	}

	@ExceptionHandler(OperatorNotActiveException.class)
	public ResponseEntity<ApiResponseDto> handleOperatorNotActive(OperatorNotActiveException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(new ApiResponseDto("error", ex.getMessage()));
	}

	@ExceptionHandler(AccountDeletionException.class)
	public ResponseEntity<ApiResponseDto> handleAccountDeletion(AccountDeletionException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponseDto("error", ex.getMessage()));
	}

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ApiResponseDto> handleApiException(ApiException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponseDto("error", ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponseDto> handleValidationErrors(MethodArgumentNotValidException ex) {
		String errorMsg = ex.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.reduce((a, b) -> a + "; " + b).orElse("Validation error");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponseDto("error", errorMsg));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiResponseDto> handleAccessDenied(AccessDeniedException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(new ApiResponseDto("error", "Access Denied: You do not have permission to perform this action."));
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ApiResponseDto> handleAuthException(AuthenticationException ex) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(new ApiResponseDto("error", "Authentication Failed: " + ex.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponseDto> handleGeneralException(Exception ex) {
		ex.printStackTrace();
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponseDto("error", "Internal Server Error: " + ex.getMessage()));
	}
}
