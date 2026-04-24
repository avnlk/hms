package com.iiitb.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddBedRequest {
    @NotBlank
    private String bhavanaId;
    @NotBlank
    private String blockId;
    @NotBlank
    private String floorId;
    @NotBlank
    private String roomId;
}
