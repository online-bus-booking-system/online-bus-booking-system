package com.buslink.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Stop extends BaseEntity {

	@Column(name = "location_name", nullable = false, length = 100)
	private String locationName;

	@Column(name = "city", length = 100)
	private String city;

	@Column(name = "landmark", length = 100)
	private String landmark;
}
