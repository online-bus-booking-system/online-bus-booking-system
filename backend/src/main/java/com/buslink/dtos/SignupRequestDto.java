package com.buslink.dtos;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequestDto {

	@NotBlank(message = "Role is required")
	private String role; // "customer", "operator", "admin"

	@NotBlank(message = "Full Name is required")
	private String fullName;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email address format")
	private String email;

	private String gender;

	@NotBlank(message = "Phone number is required")
	private String phone;

	@NotBlank(message = "Password is required")
	private String password;

	// Bus Operator specific fields
	private String companyName;

	private List<DocumentDto> documents;

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	public static class DocumentDto {
		private String documentType;
		private String documentName;
	}
}
