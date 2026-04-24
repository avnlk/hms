package com.iiitb.hostel.controller;

import com.iiitb.hostel.dto.DashboardStatsDto;
import com.iiitb.hostel.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public DashboardStatsDto getStats() {
        return dashboardService.getStats();
    }
}
