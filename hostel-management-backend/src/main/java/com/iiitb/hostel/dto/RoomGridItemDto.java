package com.iiitb.hostel.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomGridItemDto {
    private String roomId;
    private String roomNumber;
    private Integer type;
    private String status;
}
