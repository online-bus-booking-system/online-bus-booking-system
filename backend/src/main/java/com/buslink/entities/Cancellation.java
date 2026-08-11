package com.buslink.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "cancellations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Cancellation extends BaseEntity {

	@OneToOne
	@JoinColumn(name = "booking_id", nullable = false)
	private Booking booking;

	@ManyToOne
	@JoinColumn(name = "operator_id", nullable = false)
	private BusOperator operator;

	@Column(name = "refund_amount", nullable = false)
	private Double refundAmount;

	@Column(name = "cancellation_fee", nullable = false)
	private Double cancellationFee;

	@Column(name = "cancellation_reason", length = 255)
	private String cancellationReason;

	@CreationTimestamp
	@Column(name = "cancellation_time")
	private LocalDateTime cancellationTime;
}
