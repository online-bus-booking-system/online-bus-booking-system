package com.buslink.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "trip_seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class TripSeat extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "trip_id", nullable = false)
	private Trip trip;

	@ManyToOne
	@JoinColumn(name = "seat_id", nullable = false)
	private Seat seat;

	@Column(name = "seat_number", nullable = false, length = 10)
	private String seatNumber;

	@Column(name = "seat_status", nullable = false, length = 20)
	private String seatStatus = "AVAILABLE"; // "AVAILABLE", "BOOKED", "LOCKED"

	// Optimistic locking version field to prevent concurrent double booking
	@Version
	@Column(name = "version")
	private Integer version;
}
