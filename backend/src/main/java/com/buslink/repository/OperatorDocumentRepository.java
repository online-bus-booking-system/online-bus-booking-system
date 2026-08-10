package com.buslink.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.OperatorDocument;

@Repository
public interface OperatorDocumentRepository extends JpaRepository<OperatorDocument, Long> {
	List<OperatorDocument> findByOperatorId(Long operatorId);
}
