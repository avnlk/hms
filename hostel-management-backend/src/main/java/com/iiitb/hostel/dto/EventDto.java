package com.iiitb.hostel.dto;

import java.time.Instant;

import com.iiitb.hostel.model.Event;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    private String id;

    @NotBlank
    private String allocationId;
    @NotBlank
    private String studentId;
    @NotBlank
    private String hostelId;
    @NotBlank
    private String blockId;
    @NotBlank
    private String floorNumber;
    @NotBlank
    private String roomId;
    @NotBlank
    private String bedId;

    private Event.EventType type;

    @NotNull
    private Instant timestamp;
    private String remarks;
    @NotBlank
    private String performedBy;
}
