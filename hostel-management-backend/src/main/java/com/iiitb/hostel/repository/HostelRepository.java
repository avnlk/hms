package com.iiitb.hostel.repository;

import com.iiitb.hostel.model.Hostel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HostelRepository extends MongoRepository<Hostel, String> {
}
