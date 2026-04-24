package com.iiitb.hostel.service;

import java.util.List;

import com.iiitb.hostel.dto.AllocationListItemDto;
import com.iiitb.hostel.dto.BedOptionDto;
import com.iiitb.hostel.dto.CreateAllocationRequest;
import com.iiitb.hostel.dto.RoomGridItemDto;
import com.iiitb.hostel.model.Allocation;
import org.springframework.data.domain.Page;

public interface AllocationService {
    Page<AllocationListItemDto> getAllocations(String search, int page, int size);

    AllocationListItemDto getAllocationById(String id);

    List<RoomGridItemDto> getRoomGrid(
        String hostelId,
        String bhavanaId,
        String blockId,
        String floorNumber,
        Integer roomType
    );

    List<BedOptionDto> getBedOptions(String roomId);

    Allocation createAllocation(CreateAllocationRequest request, String performedBy);
}
