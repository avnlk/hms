package com.iiitb.hostel.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.iiitb.hostel.dto.AllocationListItemDto;
import com.iiitb.hostel.dto.BedOptionDto;
import com.iiitb.hostel.dto.CreateAllocationRequest;
import com.iiitb.hostel.dto.RoomGridItemDto;
import com.iiitb.hostel.exception.ResourceNotFoundException;
import com.iiitb.hostel.model.Allocation;
import com.iiitb.hostel.model.Event;
import com.iiitb.hostel.model.Hostel;
import com.iiitb.hostel.model.Student;
import com.iiitb.hostel.repository.AllocationRepository;
import com.iiitb.hostel.repository.EventRepository;
import com.iiitb.hostel.repository.HostelRepository;
import com.iiitb.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AllocationServiceImpl implements AllocationService {

    private static final EnumSet<Allocation.AllocationStatus> ACTIVE_ALLOCATION_STATUSES =
        EnumSet.of(Allocation.AllocationStatus.ALLOTTED, Allocation.AllocationStatus.CHECKED_IN);

    private final AllocationRepository allocationRepository;
    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;
    private final EventRepository eventRepository;

    public AllocationServiceImpl(
        AllocationRepository allocationRepository,
        StudentRepository studentRepository,
        HostelRepository hostelRepository,
        EventRepository eventRepository
    ) {
        this.allocationRepository = allocationRepository;
        this.studentRepository = studentRepository;
        this.hostelRepository = hostelRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public Page<AllocationListItemDto> getAllocations(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String normalizedSearch = StringUtils.hasText(search) ? search.trim().toLowerCase(Locale.ROOT) : "";

        if (!StringUtils.hasText(normalizedSearch)) {
            Page<Allocation> allocationPage = allocationRepository.findAll(pageable);
            return enrichAllocations(allocationPage.getContent(), pageable, allocationPage.getTotalElements());
        }

        List<Allocation> allAllocations = allocationRepository.findAll();
        Map<String, Student> studentsById = studentRepository.findAll()
            .stream()
            .collect(Collectors.toMap(Student::getId, student -> student, (first, second) -> first));

        List<Allocation> filtered = allAllocations.stream()
            .filter(allocation -> matchesSearch(allocation, studentsById.get(allocation.getStudentId()), normalizedSearch))
            .sorted(Comparator.comparing(Allocation::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();

        int fromIndex = Math.min(page * size, filtered.size());
        int toIndex = Math.min(fromIndex + size, filtered.size());
        List<Allocation> pageContent = filtered.subList(fromIndex, toIndex);
        return enrichAllocations(pageContent, pageable, filtered.size());
    }

    @Override
    public AllocationListItemDto getAllocationById(String id) {
        Allocation allocation = allocationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Allocation not found: " + id));
        List<AllocationListItemDto> enriched = enrichAllocations(List.of(allocation), Pageable.unpaged(), 1).getContent();
        if (enriched.isEmpty()) {
            throw new ResourceNotFoundException("Allocation not found: " + id);
        }
        return enriched.get(0);
    }

    @Override
    public List<RoomGridItemDto> getRoomGrid(
        String hostelId,
        String bhavanaId,
        String blockId,
        String floorNumber,
        Integer roomType
    ) {
        Hostel hostel = getHostel(hostelId);
        Hostel.Floor floor = findFloor(hostel, bhavanaId, blockId, floorNumber);

        List<RoomGridItemDto> grid = new ArrayList<>();
        for (Hostel.Room room : floor.getRooms()) {
            if (roomType != null && room.getType() != null && !roomType.equals(room.getType())) {
                continue;
            }
            boolean hasVacant = room.getBeds().stream().anyMatch(bed -> bed.getStatus() == Hostel.BedStatus.VACANT);
            grid.add(RoomGridItemDto.builder()
                .roomId(room.getRoomId())
                .roomNumber(room.getRoomNumber())
                .type(room.getType())
                .status(hasVacant ? "AVAILABLE" : "OCCUPIED")
                .build());
        }
        return grid;
    }

    @Override
    public List<BedOptionDto> getBedOptions(String roomId) {
        for (Hostel hostel : hostelRepository.findAll()) {
            for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
                for (Hostel.Block block : bhavana.getBlocks()) {
                    for (Hostel.Floor floor : block.getFloors()) {
                        for (Hostel.Room room : floor.getRooms()) {
                            if (room.getRoomId().equals(roomId)) {
                                return room.getBeds().stream()
                                    .map(bed -> BedOptionDto.builder()
                                        .bedId(bed.getBedId())
                                        .bedName(bed.getBedName())
                                        .status(bed.getStatus())
                                        .build())
                                    .toList();
                            }
                        }
                    }
                }
            }
        }
        throw new ResourceNotFoundException("Room not found: " + roomId);
    }

    @Override
    public Allocation createAllocation(CreateAllocationRequest request, String performedBy) {
        Student student = studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));

        List<Allocation> activeAllocations = allocationRepository.findByStudentIdAndStatusIn(
            request.getStudentId(),
            List.copyOf(ACTIVE_ALLOCATION_STATUSES)
        );
        if (!activeAllocations.isEmpty()) {
            throw new IllegalArgumentException("Student already has an active allocation");
        }

        Hostel hostel = getHostel(request.getHostelId());
        Hostel.Room room = findRoom(
            hostel,
            request.getBhavanaId(),
            request.getBlockId(),
            request.getFloorNumber(),
            request.getRoomId()
        );
        Hostel.Bed bed = findBed(room, request.getBedId());
        if (bed.getStatus() != Hostel.BedStatus.VACANT) {
            throw new IllegalArgumentException("Selected bed is not VACANT");
        }

        bed.setStatus(Hostel.BedStatus.OCCUPIED);
        hostelRepository.save(hostel);

        Allocation allocation = Allocation.builder()
            .id(UUID.randomUUID().toString())
            .studentId(request.getStudentId())
            .hostelId(request.getHostelId())
            .blockId(request.getBlockId())
            .floorNumber(request.getFloorNumber())
            .roomId(request.getRoomId())
            .bedId(request.getBedId())
            .status(Allocation.AllocationStatus.ALLOTTED)
            .expectedCheckInDate(request.getExpectedCheckInDate())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .checkIn(new Allocation.CheckAction(null, null))
            .checkOut(new Allocation.CheckAction(null, null))
            .createdAt(Instant.now())
            .build();
        Allocation savedAllocation = allocationRepository.save(allocation);

        Event event = Event.builder()
            .id(UUID.randomUUID().toString())
            .allocationId(savedAllocation.getId())
            .studentId(student.getId())
            .hostelId(savedAllocation.getHostelId())
            .blockId(savedAllocation.getBlockId())
            .floorNumber(savedAllocation.getFloorNumber())
            .roomId(savedAllocation.getRoomId())
            .bedId(savedAllocation.getBedId())
            .type(Event.EventType.ALLOTMENT)
            .timestamp(Instant.now())
            .remarks(request.getRemarks())
            .performedBy(performedBy)
            .build();
        eventRepository.save(event);

        return savedAllocation;
    }

    private Page<AllocationListItemDto> enrichAllocations(List<Allocation> allocations, Pageable pageable, long total) {
        List<String> studentIds = allocations.stream().map(Allocation::getStudentId).distinct().toList();
        List<String> hostelIds = allocations.stream().map(Allocation::getHostelId).distinct().toList();
        Map<String, Student> studentsById = new HashMap<>();
        Map<String, Hostel> hostelsById = new HashMap<>();
        studentRepository.findAllById(studentIds)
            .forEach(student -> studentsById.put(student.getId(), student));
        hostelRepository.findAllById(hostelIds)
            .forEach(hostel -> hostelsById.put(hostel.getId(), hostel));

        List<AllocationListItemDto> content = allocations.stream()
            .map(allocation -> {
                Student student = studentsById.get(allocation.getStudentId());
                Hostel hostel = hostelsById.get(allocation.getHostelId());
                return AllocationListItemDto.builder()
                    .id(allocation.getId())
                    .studentId(allocation.getStudentId())
                    .rollNumber(student != null ? student.getRollNumber() : null)
                    .name(student != null ? student.getName() : null)
                    .program(student != null ? student.getProgram() : null)
                    .batch(student != null ? student.getBatch() : null)
                    .email(student != null ? student.getEmail() : null)
                    .phoneNumber(student != null ? student.getPhoneNumber() : null)
                    .hostelId(allocation.getHostelId())
                    .hostelName(hostel != null ? hostel.getName() : null)
                    .blockId(allocation.getBlockId())
                    .floorNumber(allocation.getFloorNumber())
                    .roomId(resolveRoomNumber(hostel, allocation))
                    .bedId(allocation.getBedId())
                    .status(allocation.getStatus())
                    .expectedCheckInDate(allocation.getExpectedCheckInDate())
                    .startDate(allocation.getStartDate())
                    .endDate(allocation.getEndDate())
                    .checkIn(allocation.getCheckIn())
                    .checkOut(allocation.getCheckOut())
                    .createdAt(allocation.getCreatedAt())
                    .build();
            })
            .toList();
        return new PageImpl<>(content, pageable, total);
    }

    private boolean matchesSearch(Allocation allocation, Student student, String normalizedSearch) {
        if (containsIgnoreCase(allocation.getRoomId(), normalizedSearch)
            || containsIgnoreCase(allocation.getBedId(), normalizedSearch)
            || containsIgnoreCase(allocation.getBlockId(), normalizedSearch)
            || containsIgnoreCase(allocation.getFloorNumber(), normalizedSearch)
            || containsIgnoreCase(String.valueOf(allocation.getStatus()), normalizedSearch)) {
            return true;
        }
        if (student == null) {
            return false;
        }
        return containsIgnoreCase(student.getRollNumber(), normalizedSearch)
            || containsIgnoreCase(student.getName(), normalizedSearch)
            || containsIgnoreCase(student.getProgram(), normalizedSearch)
            || containsIgnoreCase(student.getBatch(), normalizedSearch)
            || containsIgnoreCase(student.getEmail(), normalizedSearch)
            || containsIgnoreCase(student.getPhoneNumber(), normalizedSearch);
    }

    private boolean containsIgnoreCase(String value, String search) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(search);
    }

    private String resolveRoomNumber(Hostel hostel, Allocation allocation) {
        String allocationRoomId = allocation.getRoomId();
        if (hostel == null || allocationRoomId == null || allocationRoomId.isBlank()) {
            return allocationRoomId;
        }
        for (Hostel.Bhavana bhavana : nullSafe(hostel.getBhavanAs())) {
            for (Hostel.Block block : nullSafe(bhavana.getBlocks())) {
                for (Hostel.Floor floor : nullSafe(block.getFloors())) {
                    for (Hostel.Room room : nullSafe(floor.getRooms())) {
                        if (roomMatchesAllocation(allocationRoomId, room)) {
                            return room.getRoomNumber() != null && !room.getRoomNumber().isBlank()
                                ? room.getRoomNumber()
                                : allocationRoomId;
                        }
                    }
                }
            }
        }
        return allocationRoomId;
    }

    private static boolean roomMatchesAllocation(String allocationRoomId, Hostel.Room room) {
        if (allocationRoomId == null || allocationRoomId.isBlank() || room == null) {
            return false;
        }
        String value = allocationRoomId.trim();
        if (room.getRoomId() != null && value.equals(room.getRoomId().trim())) {
            return true;
        }
        return room.getRoomNumber() != null && value.equals(room.getRoomNumber().trim());
    }

    private static <T> List<T> nullSafe(List<T> list) {
        return list != null ? list : List.of();
    }

    private Hostel getHostel(String hostelId) {
        return hostelRepository.findById(hostelId)
            .orElseThrow(() -> new ResourceNotFoundException("Hostel not found: " + hostelId));
    }

    private Hostel.Bhavana findBhavana(Hostel hostel, String bhavanaId) {
        return hostel.getBhavanAs().stream()
            .filter(bhavana -> bhavana.getBhavanaId().equals(bhavanaId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Bhavana not found: " + bhavanaId));
    }

    private Hostel.Block findBlock(Hostel hostel, String bhavanaId, String blockId) {
        Hostel.Bhavana bhavana = findBhavana(hostel, bhavanaId);
        return bhavana.getBlocks().stream()
            .filter(block -> block.getBlockId().equals(blockId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Block not found: " + blockId));
    }

    private Hostel.Floor findFloor(Hostel hostel, String bhavanaId, String blockId, String floorNumber) {
        Hostel.Block block = findBlock(hostel, bhavanaId, blockId);
        return block.getFloors().stream()
            .filter(floor -> floor.getFloorNumber().equals(floorNumber))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Floor not found: " + floorNumber));
    }

    private Hostel.Room findRoom(Hostel hostel, String bhavanaId, String blockId, String floorNumber, String roomId) {
        Hostel.Floor floor = findFloor(hostel, bhavanaId, blockId, floorNumber);
        return floor.getRooms().stream()
            .filter(room -> room.getRoomId().equals(roomId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));
    }

    private Hostel.Bed findBed(Hostel.Room room, String bedId) {
        return room.getBeds().stream()
            .filter(bed -> bed.getBedId().equals(bedId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Bed not found: " + bedId));
    }
}
