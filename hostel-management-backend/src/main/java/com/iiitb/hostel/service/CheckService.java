package com.iiitb.hostel.service;

import com.iiitb.hostel.dto.CheckInOutRequest;
import com.iiitb.hostel.dto.CheckPreviewDto;
import com.iiitb.hostel.model.Allocation;

public interface CheckService {

    CheckPreviewDto getCheckInPreview(String rollNumber);

    Allocation performCheckIn(CheckInOutRequest request, String performedBy);

    CheckPreviewDto getCheckOutPreview(String rollNumber);

    Allocation performCheckOut(CheckInOutRequest request, String performedBy);
}
