package com.iiitb.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteNodeRequest {
    @NotBlank
    private String level;
    @NotBlank
    private String nodeId;
}
