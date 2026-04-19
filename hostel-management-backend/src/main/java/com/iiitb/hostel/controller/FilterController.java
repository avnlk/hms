package com.iiitb.hostel.controller;

import java.util.List;

import com.iiitb.hostel.model.Hostel;
import com.iiitb.hostel.service.HostelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hostels/filters")
public class FilterController {

    private final HostelService hostelService;

    public FilterController(HostelService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping("/bhavanAs")
    public List<Hostel.Bhavana> getBhavanAs() {
        return hostelService.getBhavanAs();
    }

    @GetMapping("/blocks")
    public List<Hostel.Block> getBlocks(@RequestParam String bhavanaId) {
        return hostelService.getBlocks(bhavanaId);
    }

    @GetMapping("/floors")
    public List<Hostel.Floor> getFloors(@RequestParam String blockId) {
        return hostelService.getFloors(blockId);
    }

    @GetMapping("/roomTypes")
    public List<Integer> getRoomTypes() {
        return hostelService.getRoomTypes();
    }
}
