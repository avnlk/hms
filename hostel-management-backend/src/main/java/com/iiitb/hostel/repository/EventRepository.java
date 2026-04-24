package com.iiitb.hostel.repository;

import java.util.List;

import com.iiitb.hostel.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByAllocationId(String allocationId);
}
