package com.buslink.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Cancellation;

@Repository
public interface CancellationRepository extends JpaRepository<Cancellation, Long> {
	Optional<Cancellation> findByBookingId(Long bookingId);

	List<Cancellation> findByOperatorId(Long operatorId);

	// Total refund amount deducted from operator in date range
	@Query("SELECT COALESCE(SUM(c.refundAmount), 0.0) FROM Cancellation c WHERE c.operator.id = :operatorId AND c.cancellationTime >= :startDate")
	Double getTotalRefundDeductedForOperator(@Param("operatorId") Long operatorId, @Param("startDate") LocalDateTime startDate);
}
