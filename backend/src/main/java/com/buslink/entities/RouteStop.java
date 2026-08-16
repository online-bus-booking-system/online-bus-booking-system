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
@Table(name = "route_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class RouteStop extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "route_id", nullable = false)
	private Route route;

	@ManyToOne
	@JoinColumn(name = "stop_id", nullable = false)
	private Stop stop;

	@Column(name = "location_name", nullable = true, length = 100)
	private String locationName;

	@Column(name = "landmark", nullable = true, length = 100)
	private String landmark;

	@Column(name = "scheduled_time", nullable = false, length = 20)
	private String scheduledTime;

	@Column(name = "stop_type", nullable = false, length = 20)
	private String stopType; // "BOARDING", "DROPPING"
}
