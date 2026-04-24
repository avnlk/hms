package com.iiitb.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyByHostelDto {
    private String hostelName;
    private long totalBeds;
    private long occupiedBeds;
    private double occupancyPercent;
}
