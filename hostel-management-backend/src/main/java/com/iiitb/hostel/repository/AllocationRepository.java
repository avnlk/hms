package com.iiitb.hostel.repository;

import java.time.Instant;
import java.util.List;

import com.iiitb.hostel.model.Allocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AllocationRepository extends MongoRepository<Allocation, String> {
    long countByStatus(Allocation.AllocationStatus status);

    List<Allocation> findByStudentId(String studentId);

    List<Allocation> findByStudentIdAndStatus(String studentId, Allocation.AllocationStatus status);

    List<Allocation> findByStudentIdAndStatusIn(String studentId, List<Allocation.AllocationStatus> statuses);

    Page<Allocation> findAll(Pageable pageable);

    Page<Allocation> findByStatusAndStartDateBetween(
        Allocation.AllocationStatus status,
        Instant startInclusive,
        Instant endInclusive,
        Pageable pageable
    );

    List<Allocation> findByStatusAndStartDateBetween(
        Allocation.AllocationStatus status,
        Instant startInclusive,
        Instant endInclusive
    );

    Page<Allocation> findByStatusAndEndDateBetween(
        Allocation.AllocationStatus status,
        Instant startInclusive,
        Instant endInclusive,
        Pageable pageable
    );

    List<Allocation> findByStatusAndEndDateBetween(
        Allocation.AllocationStatus status,
        Instant startInclusive,
        Instant endInclusive
    );
}
