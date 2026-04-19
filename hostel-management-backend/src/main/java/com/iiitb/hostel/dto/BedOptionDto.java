package com.iiitb.hostel.dto;

import com.iiitb.hostel.model.Hostel;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BedOptionDto {
    private String bedId;
    private String bedName;
    private Hostel.BedStatus status;
}
