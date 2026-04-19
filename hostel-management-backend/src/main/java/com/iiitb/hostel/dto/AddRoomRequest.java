package com.iiitb.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddRoomRequest {
    @NotBlank
    private String bhavanaId;
    @NotBlank
    private String blockId;
    @NotBlank
    private String floorId;
    @NotBlank
    private String roomNumber;
    @NotNull
    private Integer type;
}
