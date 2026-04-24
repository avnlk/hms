package com.iiitb.hostel.dto;

import java.time.Instant;

import com.iiitb.hostel.model.Allocation;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AllocationListItemDto {
    private String id;
    private String studentId;
    private String rollNumber;
    private String name;
    private String program;
    private String batch;
    private String email;
    private String phoneNumber;
    private String hostelId;
    private String hostelName;
    private String blockId;
    private String floorNumber;
    private String roomId;
    private String bedId;
    private Allocation.AllocationStatus status;
    private Instant expectedCheckInDate;
    private Instant startDate;
    private Instant endDate;
    private Allocation.CheckAction checkIn;
    private Allocation.CheckAction checkOut;
    private Instant createdAt;
}
