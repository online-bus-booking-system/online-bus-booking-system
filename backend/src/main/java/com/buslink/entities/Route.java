package com.buslink.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true, exclude = {"operator"})
public class Route extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "operator_id")
	private BusOperator operator;

	@Column(name = "source_city", nullable = false, length = 100)
	private String sourceCity;

	@Column(name = "destination_city", nullable = false, length = 100)
	private String destinationCity;

	@Column(name = "distance_km", nullable = false)
	private Integer distanceKm;

	@Column(name = "duration", nullable = false, length = 50)
	private String duration;
}
