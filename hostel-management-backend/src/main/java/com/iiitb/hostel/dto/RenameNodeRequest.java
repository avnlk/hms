package com.iiitb.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RenameNodeRequest {
    @NotBlank
    private String level;
    @NotBlank
    private String nodeId;
    @NotBlank
    private String newName;
}
