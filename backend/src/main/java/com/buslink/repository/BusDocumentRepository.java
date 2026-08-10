package com.buslink.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.BusDocument;

@Repository
public interface BusDocumentRepository extends JpaRepository<BusDocument, Long> {
	List<BusDocument> findByBusId(Long busId);
}
