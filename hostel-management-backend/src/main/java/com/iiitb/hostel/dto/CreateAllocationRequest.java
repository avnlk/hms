package com.iiitb.hostel.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAllocationRequest {
    @NotBlank
    private String studentId;
    @NotBlank
    private String hostelId;
    @NotBlank
    private String bhavanaId;
    @NotBlank
    private String blockId;
    @NotBlank
    private String floorNumber;
    @NotBlank
    private String roomId;
    @NotBlank
    private String bedId;
    @NotNull
    private Instant expectedCheckInDate;
    @NotNull
    private Instant startDate;
    @NotNull
    private Instant endDate;
    private String remarks;
}
