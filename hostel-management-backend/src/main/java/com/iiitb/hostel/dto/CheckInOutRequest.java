package com.iiitb.hostel.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class CheckInOutRequest {
    @NotBlank
    private String rollNumber;
    private String remarks;
}
