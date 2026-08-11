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
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Review extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "booking_id", nullable = false)
	private Booking booking;

	@ManyToOne
	@JoinColumn(name = "bus_id", nullable = false)
	private Bus bus;

	@Column(name = "rating", nullable = false)
	private Double rating;

	@Column(name = "comment", length = 255)
	private String comment;
}
