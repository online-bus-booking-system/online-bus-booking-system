package com.buslink.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.Stop;

@Repository
public interface StopRepository extends JpaRepository<Stop, Long> {
}
