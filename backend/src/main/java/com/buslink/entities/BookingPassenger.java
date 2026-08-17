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
@Table(name = "booking_passengers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class BookingPassenger extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "booking_id", nullable = false)
	private Booking booking;

	@Column(name = "passenger_name", nullable = false, length = 100)
	private String passengerName;

	@Column(name = "age", nullable = false)
	private Integer age;

	@Column(name = "gender", nullable = false, length = 20)
	private String gender;

	@Column(name = "seat_number", nullable = false, length = 10)
	private String seatNumber;
}
