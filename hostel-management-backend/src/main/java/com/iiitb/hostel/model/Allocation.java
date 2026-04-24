package com.iiitb.hostel.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "allocations")
@CompoundIndex(name = "student_status_idx", def = "{'studentId': 1, 'status': 1}")
public class Allocation {

    @Id
    private String id;

    private String studentId;
    private String hostelId;
    private String blockId;
    private String floorNumber;
    private String roomId;
    private String bedId;

    @Builder.Default
    private AllocationStatus status = AllocationStatus.CHECKED_IN;

    private Instant expectedCheckInDate;
    private Instant startDate;
    private Instant endDate;

    @Builder.Default
    private CheckAction checkIn = new CheckAction();

    @Builder.Default
    private CheckAction checkOut = new CheckAction();

    private Instant createdAt;

    public enum AllocationStatus {
        ALLOTTED,
        CHECKED_IN,
        CHECKED_OUT,
        CANCELLED
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckAction {
        private Instant dateTime;
        private String remarks;
    }
}
