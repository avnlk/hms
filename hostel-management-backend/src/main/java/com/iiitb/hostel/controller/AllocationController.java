package com.iiitb.hostel.controller;

import java.util.List;

import com.iiitb.hostel.dto.AllocationListItemDto;
import com.iiitb.hostel.dto.BedOptionDto;
import com.iiitb.hostel.dto.CreateAllocationRequest;
import com.iiitb.hostel.dto.RoomGridItemDto;
import com.iiitb.hostel.model.Allocation;
import com.iiitb.hostel.service.AllocationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping
    public Page<AllocationListItemDto> getAllocations(
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return allocationService.getAllocations(search, page, size);
    }

    @GetMapping("/{id}")
    public AllocationListItemDto getAllocationById(@PathVariable String id) {
        return allocationService.getAllocationById(id);
    }

    @PostMapping
    public Allocation createAllocation(@Valid @RequestBody CreateAllocationRequest request, Authentication authentication) {
        return allocationService.createAllocation(request, authentication.getName());
    }

    @GetMapping("/room-grid")
    public List<RoomGridItemDto> getRoomGrid(
        @RequestParam String hostelId,
        @RequestParam String bhavanaId,
        @RequestParam String blockId,
        @RequestParam String floorNumber,
        @RequestParam(required = false) Integer roomType
    ) {
        return allocationService.getRoomGrid(hostelId, bhavanaId, blockId, floorNumber, roomType);
    }

    @GetMapping("/beds/{roomId}")
    public List<BedOptionDto> getBedOptions(@PathVariable String roomId) {
        return allocationService.getBedOptions(roomId);
    }
}
