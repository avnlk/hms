package com.iiitb.hostel.controller;

import java.util.List;

import com.iiitb.hostel.dto.AddBedRequest;
import com.iiitb.hostel.dto.AddBlockRequest;
import com.iiitb.hostel.dto.AddBhavanaRequest;
import com.iiitb.hostel.dto.AddFloorRequest;
import com.iiitb.hostel.dto.AddHostelRequest;
import com.iiitb.hostel.dto.AddRoomRequest;
import com.iiitb.hostel.dto.DeleteNodeRequest;
import com.iiitb.hostel.dto.RenameNodeRequest;
import com.iiitb.hostel.model.Hostel;
import com.iiitb.hostel.service.HostelService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hostels")
public class HostelController {

    private final HostelService hostelService;

    public HostelController(HostelService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping
    public List<Hostel> getAll() {
        return hostelService.getAll();
    }

    @PostMapping
    public Hostel addHostel(@Valid @RequestBody AddHostelRequest request) {
        return hostelService.addHostel(request);
    }

    @PostMapping("/{id}/bhavanAs")
    public Hostel addBhavana(@PathVariable String id, @Valid @RequestBody AddBhavanaRequest request) {
        return hostelService.addBhavana(id, request);
    }

    @PostMapping("/{id}/blocks")
    public Hostel addBlock(@PathVariable String id, @Valid @RequestBody AddBlockRequest request) {
        return hostelService.addBlock(id, request);
    }

    @PostMapping("/{id}/floors")
    public Hostel addFloor(@PathVariable String id, @Valid @RequestBody AddFloorRequest request) {
        return hostelService.addFloor(id, request);
    }

    @PostMapping("/{id}/rooms")
    public Hostel addRoom(@PathVariable String id, @Valid @RequestBody AddRoomRequest request) {
        return hostelService.addRoom(id, request);
    }

    @PostMapping("/{id}/beds")
    public Hostel addBed(@PathVariable String id, @Valid @RequestBody AddBedRequest request) {
        return hostelService.addBed(id, request);
    }

    @DeleteMapping("/{id}/node")
    public Hostel deleteNode(@PathVariable String id, @Valid @RequestBody DeleteNodeRequest request) {
        return hostelService.deleteNode(id, request.getLevel(), request.getNodeId());
    }

    @PutMapping("/{id}/node")
    public Hostel renameNode(@PathVariable String id, @Valid @RequestBody RenameNodeRequest request) {
        return hostelService.renameNode(id, request);
    }
}
