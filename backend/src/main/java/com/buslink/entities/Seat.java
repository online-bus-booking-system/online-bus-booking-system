package com.buslink.entities;

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
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Seat extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "bus_id", nullable = false)
	private Bus bus;

	@Column(name = "seat_number", nullable = false, length = 10)
	private String seatNumber; // e.g. "L1", "U5", "12"

	@Column(name = "seat_type", nullable = false, length = 30)
	private String seatType; // "SEATER", "SLEEPER_LOWER", "SLEEPER_UPPER"
}
