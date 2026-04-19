package com.iiitb.hostel.repository;

import java.util.Optional;

import com.iiitb.hostel.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<Student, String> {
    long countByStatus(String status);

    Optional<Student> findByRollNumber(String rollNumber);

    Page<Student> findByRollNumberContainingIgnoreCase(String rollNumber, Pageable pageable);

    Page<Student> findByNameContainingIgnoreCase(String name, Pageable pageable);

    boolean existsByRollNumber(String rollNumber);
}
