package com.buslink.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FindTicketRequestDto {

	@Schema(description = "Ticket PNR Number", example = "PNR8F4A2B1")
	@NotBlank(message = "PNR number is required")
	private String pnrNumber;

	@Schema(description = "Passenger Mobile Phone Number", example = "9876543210")
	@NotBlank(message = "Mobile number is required")
	private String mobileNumber;
}
