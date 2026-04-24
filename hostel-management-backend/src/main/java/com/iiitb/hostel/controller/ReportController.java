package com.iiitb.hostel.controller;

import java.time.Instant;

import com.iiitb.hostel.dto.PresentOccupancyRowDto;
import com.iiitb.hostel.dto.ReportExportType;
import com.iiitb.hostel.dto.VacatedListRowDto;
import com.iiitb.hostel.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/present-occupancy")
    public Page<PresentOccupancyRowDto> getPresentOccupancy(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return reportService.getPresentOccupancy(startDate, endDate, page, size);
    }

    @GetMapping("/vacated-list")
    public Page<VacatedListRowDto> getVacatedList(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return reportService.getVacatedList(startDate, endDate, page, size);
    }

    @GetMapping("/present-occupancy/export")
    public ResponseEntity<byte[]> exportPresentOccupancy(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        byte[] body = reportService.exportToExcel(ReportExportType.PRESENT_OCCUPANCY, startDate, endDate);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"present-occupancy.xlsx\"")
            .contentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ))
            .body(body);
    }

    @GetMapping("/vacated-list/export")
    public ResponseEntity<byte[]> exportVacatedList(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        byte[] body = reportService.exportToExcel(ReportExportType.VACATED_LIST, startDate, endDate);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"vacated-list.xlsx\"")
            .contentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ))
            .body(body);
    }
}
