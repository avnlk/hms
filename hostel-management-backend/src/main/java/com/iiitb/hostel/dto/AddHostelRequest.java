package com.iiitb.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddHostelRequest {
    @NotBlank
    private String name;
}
