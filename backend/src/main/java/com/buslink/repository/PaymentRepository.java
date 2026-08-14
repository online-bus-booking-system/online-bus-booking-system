package com.buslink.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
	Optional<Payment> findByBookingId(Long bookingId);
	Optional<Payment> findByTransactionId(String transactionId);
}
