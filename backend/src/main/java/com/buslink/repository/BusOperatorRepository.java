package com.buslink.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.BusOperator;

@Repository
public interface BusOperatorRepository extends JpaRepository<BusOperator, Long> {
	List<BusOperator> findByApprovalStatus(String approvalStatus);
	List<BusOperator> findByIsActive(Boolean isActive);
}
