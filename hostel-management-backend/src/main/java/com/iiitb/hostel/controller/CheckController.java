package com.iiitb.hostel.controller;

import com.iiitb.hostel.dto.CheckInOutRequest;
import com.iiitb.hostel.dto.CheckPreviewDto;
import com.iiitb.hostel.model.Allocation;
import com.iiitb.hostel.service.CheckService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/check")
public class CheckController {

    private final CheckService checkService;

    public CheckController(CheckService checkService) {
        this.checkService = checkService;
    }

    @GetMapping("/in/{rollNumber}")
    public CheckPreviewDto getCheckInPreview(@PathVariable String rollNumber) {
        return checkService.getCheckInPreview(rollNumber);
    }

    @PostMapping("/in")
    public Allocation performCheckIn(@Valid @RequestBody CheckInOutRequest request, Authentication authentication) {
        return checkService.performCheckIn(request, authentication.getName());
    }

    @GetMapping("/out/{rollNumber}")
    public CheckPreviewDto getCheckOutPreview(@PathVariable String rollNumber) {
        return checkService.getCheckOutPreview(rollNumber);
    }

    @PostMapping("/out")
    public Allocation performCheckOut(@Valid @RequestBody CheckInOutRequest request, Authentication authentication) {
        return checkService.performCheckOut(request, authentication.getName());
    }
}
