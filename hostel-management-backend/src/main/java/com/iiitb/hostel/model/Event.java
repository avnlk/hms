package com.iiitb.hostel.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {

    @Id
    private String id;

    private String allocationId;
    private String studentId;
    private String hostelId;
    private String blockId;
    private String floorNumber;
    private String roomId;
    private String bedId;

    @Builder.Default
    private EventType type = EventType.CHECKIN;

    private Instant timestamp;
    private String remarks;
    private String performedBy;

    public enum EventType {
        ALLOTMENT,
        DEALLOTMENT,
        CHECKIN,
        CHECKOUT
    }
}
