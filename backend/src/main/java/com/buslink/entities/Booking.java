package com.buslink.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
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
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Booking extends BaseEntity {

	// PNR stored in Bookings table as required
	@Column(name = "pnr_number", nullable = false, unique = true, length = 50)
	private String pnrNumber;

	// User associated with booking (Nullable for anonymous guest users)
	@ManyToOne
	@JoinColumn(name = "user_id", nullable = true)
	private User user;

	// Guest contact info associated with booking (Linked for anonymous guest users)
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "guest_contact_id", nullable = true)
	private GuestContact guestContact;

	@ManyToOne
	@JoinColumn(name = "trip_id", nullable = false)
	private Trip trip;

	@Column(name = "boarding_point", nullable = false, length = 150)
	private String boardingPoint;

	@Column(name = "dropping_point", nullable = false, length = 150)
	private String droppingPoint;

	@Column(name = "total_fare", nullable = false)
	private Double totalFare;

	@Column(name = "booking_status", nullable = false, length = 30)
	private String bookingStatus = "CONFIRMED"; // "CONFIRMED", "CANCELLED"

	@Column(name = "qr_code_data", length = 255)
	private String qrCodeData;

	@CreationTimestamp
	@Column(name = "booking_date")
	private LocalDateTime bookingDate;
}
