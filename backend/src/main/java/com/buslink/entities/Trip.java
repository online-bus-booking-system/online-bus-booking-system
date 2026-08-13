package com.buslink.entities;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Trip extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "bus_id", nullable = false)
	private Bus bus;

	@ManyToOne
	@JoinColumn(name = "route_id", nullable = false)
	private Route route;

	@Column(name = "departure_date", nullable = false)
	private LocalDate departureDate;

	@Column(name = "departure_time", nullable = false)
	private LocalTime departureTime;

	@Column(name = "arrival_time", nullable = false)
	private LocalTime arrivalTime;

	@Column(name = "ticket_price", nullable = false)
	private Double ticketPrice;

	@Column(name = "status", nullable = false, length = 30)
	private String status = "SCHEDULED"; // "SCHEDULED", "IN_TRANSIT", "DEPARTED", "COMPLETED", "CANCELLED"
}
