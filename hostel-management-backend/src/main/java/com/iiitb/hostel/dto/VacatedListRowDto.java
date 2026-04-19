package com.iiitb.hostel.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VacatedListRowDto {
    private String dateOfVacation;
    private String shiftVacate;
    private String ifShiftingRoomNo;
    private String remarkCheckOut;
    private String block;
    private String roomType;
    private String fromRoomNo;
    private String rollNo;
    private String name;
    private String degree;
    private String emailAddress;
    private String mobileNo;
    private String checkIn;
    private String remarkCheckIn;
}
