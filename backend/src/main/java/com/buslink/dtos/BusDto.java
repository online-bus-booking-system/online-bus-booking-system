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
public class BusDto {

	private Long id;
	private Long operatorId;
	private String name;
	private String busNumber;
	private String busType;
	private Integer totalSeats;
	private String layout;
	private List<String> amenities;

	// Document uploads info
	private String rcBookDoc;
	private String insuranceDoc;
	private String pucDoc;
}
