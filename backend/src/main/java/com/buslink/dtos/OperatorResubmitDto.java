package com.buslink.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OperatorResubmitDto {

	private Long operatorId;
	private String companyName;
	private String city;
	private List<SignupRequestDto.DocumentDto> documents;
}
