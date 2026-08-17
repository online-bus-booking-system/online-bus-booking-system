package com.buslink.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Payment extends BaseEntity {

	@OneToOne
	@JoinColumn(name = "booking_id", nullable = false)
	private Booking booking;

	@Column(name = "transaction_id", nullable = false, unique = true, length = 100)
	private String transactionId;

	@Column(name = "payment_method", nullable = false, length = 50)
	private String paymentMethod; // "UPI", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING"

	@Column(name = "amount", nullable = false)
	private Double amount;

	@Column(name = "discount_amount")
	private Double discountAmount = 0.0;

	@Column(name = "promo_code", length = 50)
	private String promoCode;

	@Column(name = "payment_status", nullable = false, length = 30)
	private String paymentStatus = "SUCCESS"; // "SUCCESS", "FAILED", "PENDING", "REFUNDED"

	@CreationTimestamp
	@Column(name = "transaction_time")
	private LocalDateTime transactionTime;
}
