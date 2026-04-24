package com.iiitb.hostel.dto;

import java.time.Instant;

import com.iiitb.hostel.model.Allocation;
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
public class AllocationDto {
    private String id;

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

    private Allocation.AllocationStatus status;

    @NotNull
    private Instant expectedCheckInDate;
    @NotNull
    private Instant startDate;
    @NotNull
    private Instant endDate;

    @NotNull
    private Allocation.CheckAction checkIn;
    @NotNull
    private Allocation.CheckAction checkOut;
    @NotNull
    private Instant createdAt;
}
