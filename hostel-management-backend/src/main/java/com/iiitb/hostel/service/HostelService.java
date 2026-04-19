package com.iiitb.hostel.service;

import java.util.List;

import com.iiitb.hostel.dto.AddBedRequest;
import com.iiitb.hostel.dto.AddBlockRequest;
import com.iiitb.hostel.dto.AddBhavanaRequest;
import com.iiitb.hostel.dto.AddFloorRequest;
import com.iiitb.hostel.dto.AddHostelRequest;
import com.iiitb.hostel.dto.AddRoomRequest;
import com.iiitb.hostel.dto.RenameNodeRequest;
import com.iiitb.hostel.model.Hostel;

public interface HostelService {
    List<Hostel> getAll();

    Hostel addHostel(AddHostelRequest request);

    Hostel addBhavana(String hostelId, AddBhavanaRequest request);

    Hostel addBlock(String hostelId, AddBlockRequest request);

    Hostel addFloor(String hostelId, AddFloorRequest request);

    Hostel addRoom(String hostelId, AddRoomRequest request);

    Hostel addBed(String hostelId, AddBedRequest request);

    Hostel deleteNode(String hostelId, String level, String nodeId);

    Hostel renameNode(String hostelId, RenameNodeRequest request);

    List<Hostel.Bhavana> getBhavanAs();

    List<Hostel.Block> getBlocks(String bhavanaId);

    List<Hostel.Floor> getFloors(String blockId);

    List<Integer> getRoomTypes();
}
