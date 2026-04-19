package com.iiitb.hostel.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PresentOccupancyRowDto {
    private int serialNo;
    private String floor;
    private String block;
    private String roomType;
    private String roomNo;
    private String rollNo;
    private String name;
    private String degree;
    private String emailAddress;
    private String mobile;
    private String checkIn;
    private String remark;
}
