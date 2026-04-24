package com.iiitb.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddBlockRequest {
    @NotBlank
    private String bhavanaId;
}
