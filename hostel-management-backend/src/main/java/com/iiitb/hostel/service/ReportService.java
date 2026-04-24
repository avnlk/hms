package com.iiitb.hostel.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import com.iiitb.hostel.dto.PresentOccupancyRowDto;
import com.iiitb.hostel.dto.ReportExportType;
import com.iiitb.hostel.dto.VacatedListRowDto;
import org.springframework.data.domain.Page;

public interface ReportService {

    ZoneId REPORT_ZONE = ZoneId.systemDefault();
    DateTimeFormatter DISPLAY_FORMAT =
        DateTimeFormatter.ofPattern("dd-MM-yyyy").withZone(REPORT_ZONE);

    Page<PresentOccupancyRowDto> getPresentOccupancy(Instant startDate, Instant endDate, int page, int size);

    Page<VacatedListRowDto> getVacatedList(Instant startDate, Instant endDate, int page, int size);

    byte[] exportToExcel(ReportExportType reportType, Instant startDate, Instant endDate);
}
