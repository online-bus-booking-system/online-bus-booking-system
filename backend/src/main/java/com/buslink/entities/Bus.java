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
@Table(name = "buses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Bus extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "operator_id", nullable = false)
	private BusOperator operator;

	@Column(name = "bus_name", nullable = false, length = 100)
	private String busName;

	@Column(name = "bus_number", nullable = false, unique = true, length = 30)
	private String busNumber;

	@Column(name = "bus_type", nullable = false, length = 50)
	private String busType; // e.g. "AC Sleeper", "AC Seater", "Non-AC Seater"

	@Column(name = "total_seats", nullable = false)
	private Integer totalSeats;

	@Column(name = "layout_type", nullable = false, length = 30)
	private String layoutType; // e.g. "SLEEPER", "SEATER"

	@Column(name = "amenities", length = 255)
	private String amenities;
}
