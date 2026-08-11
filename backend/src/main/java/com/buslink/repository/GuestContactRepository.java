package com.buslink.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buslink.entities.GuestContact;

@Repository
public interface GuestContactRepository extends JpaRepository<GuestContact, Long> {
}
