package com.iiitb.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private String id;

    @NotBlank
    private String rollNumber;
    @NotBlank
    private String name;
    @NotBlank
    private String gender;
    @NotBlank
    private String batch;
    @NotBlank
    private String program;
    @NotBlank
    private String email;
    @NotBlank
    private String phoneNumber;
    @NotBlank
    private String address;

    private String remarks;
    private String status;
}
