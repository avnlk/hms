package com.iiitb.hostel.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.iiitb.hostel.dto.CheckInOutRequest;
import com.iiitb.hostel.dto.CheckPreviewDto;
import com.iiitb.hostel.exception.ResourceNotFoundException;
import com.iiitb.hostel.model.Allocation;
import com.iiitb.hostel.model.Event;
import com.iiitb.hostel.model.Hostel;
import com.iiitb.hostel.model.Student;
import com.iiitb.hostel.repository.AllocationRepository;
import com.iiitb.hostel.repository.EventRepository;
import com.iiitb.hostel.repository.HostelRepository;
import com.iiitb.hostel.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckServiceImpl implements CheckService {

    private final StudentRepository studentRepository;
    private final AllocationRepository allocationRepository;
    private final HostelRepository hostelRepository;
    private final EventRepository eventRepository;

    public CheckServiceImpl(
        StudentRepository studentRepository,
        AllocationRepository allocationRepository,
        HostelRepository hostelRepository,
        EventRepository eventRepository
    ) {
        this.studentRepository = studentRepository;
        this.allocationRepository = allocationRepository;
        this.hostelRepository = hostelRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public CheckPreviewDto getCheckInPreview(String rollNumber) {
        Student student = findStudentByRoll(rollNumber);
        Allocation allocation = findLatestActiveAllocation(student.getId(), rollNumber);
        applyRoomNumberForPreview(allocation);
        return CheckPreviewDto.builder()
            .student(student)
            .allocation(allocation)
            .build();
    }

    @Override
    @Transactional
    public Allocation performCheckIn(CheckInOutRequest request, String performedBy) {
        Student student = findStudentByRoll(request.getRollNumber());
        Allocation allocation = findLatestAllocation(student.getId(), Allocation.AllocationStatus.ALLOTTED);

        Hostel hostel = hostelRepository.findById(allocation.getHostelId())
            .orElseThrow(() -> new ResourceNotFoundException("Hostel not found: " + allocation.getHostelId()));
        setBedOccupied(hostel, allocation.getRoomId(), allocation.getBedId());
        hostelRepository.save(hostel);

        Instant now = Instant.now();
        allocation.setStatus(Allocation.AllocationStatus.CHECKED_IN);
        if (allocation.getCheckIn() == null) {
            allocation.setCheckIn(new Allocation.CheckAction());
        }
        allocation.getCheckIn().setDateTime(now);
        allocation.getCheckIn().setRemarks(request.getRemarks());
        allocation.setStartDate(now);

        Allocation saved = allocationRepository.save(allocation);

        Event event = Event.builder()
            .id(UUID.randomUUID().toString())
            .allocationId(saved.getId())
            .studentId(student.getId())
            .hostelId(saved.getHostelId())
            .blockId(saved.getBlockId())
            .floorNumber(saved.getFloorNumber())
            .roomId(saved.getRoomId())
            .bedId(saved.getBedId())
            .type(Event.EventType.CHECKIN)
            .timestamp(now)
            .remarks(request.getRemarks())
            .performedBy(performedBy)
            .build();
        eventRepository.save(event);

        return saved;
    }

    @Override
    public CheckPreviewDto getCheckOutPreview(String rollNumber) {
        Student student = studentRepository.findByRollNumber(rollNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + rollNumber));
        Allocation allocation = findLatestCheckedInAllocation(student.getId(), rollNumber);
        applyRoomNumberForPreview(allocation);
        return CheckPreviewDto.builder()
            .student(student)
            .allocation(allocation)
            .build();
    }

    @Override
    @Transactional
    public Allocation performCheckOut(CheckInOutRequest request, String performedBy) {
        Student student = findStudentByRoll(request.getRollNumber());
        Allocation allocation = findLatestCheckedInAllocation(student.getId(), request.getRollNumber());

        Hostel hostel = hostelRepository.findById(allocation.getHostelId())
            .orElseThrow(() -> new ResourceNotFoundException("Hostel not found: " + allocation.getHostelId()));
        setBedVacant(hostel, allocation.getRoomId(), allocation.getBedId());
        hostelRepository.save(hostel);

        Instant now = Instant.now();
        allocation.setStatus(Allocation.AllocationStatus.CHECKED_OUT);
        if (allocation.getCheckOut() == null) {
            allocation.setCheckOut(new Allocation.CheckAction());
        }
        allocation.getCheckOut().setDateTime(now);
        allocation.getCheckOut().setRemarks(request.getRemarks());
        allocation.setEndDate(now);

        Allocation saved = allocationRepository.save(allocation);

        Event event = Event.builder()
            .id(UUID.randomUUID().toString())
            .allocationId(saved.getId())
            .studentId(student.getId())
            .hostelId(saved.getHostelId())
            .blockId(saved.getBlockId())
            .floorNumber(saved.getFloorNumber())
            .roomId(saved.getRoomId())
            .bedId(saved.getBedId())
            .type(Event.EventType.CHECKOUT)
            .timestamp(now)
            .remarks(request.getRemarks())
            .performedBy(performedBy)
            .build();
        eventRepository.save(event);

        return saved;
    }

    private Student findStudentByRoll(String rollNumber) {
        return studentRepository.findByRollNumber(rollNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + rollNumber));
    }

    private Allocation findLatestAllocation(String studentId, Allocation.AllocationStatus status) {
        List<Allocation> list = allocationRepository.findByStudentIdAndStatus(studentId, status);
        if (list.isEmpty()) {
            throw new ResourceNotFoundException("No " + status + " allocation for student");
        }
        return list.stream()
            .max(Comparator.comparing(Allocation::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
            .orElseThrow(() -> new ResourceNotFoundException("No " + status + " allocation for student"));
    }

    private Allocation findLatestActiveAllocation(String studentId, String rollNumber) {
        List<Allocation> active = allocationRepository.findByStudentIdAndStatusIn(
            studentId,
            List.of(Allocation.AllocationStatus.CHECKED_IN, Allocation.AllocationStatus.ALLOTTED)
        );
        if (active.isEmpty()) {
            throw new ResourceNotFoundException("No active allocation found for roll number: " + rollNumber);
        }
        return active.stream()
            .max(Comparator.comparing(Allocation::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
            .orElseThrow(
                () -> new ResourceNotFoundException("No active allocation found for roll number: " + rollNumber)
            );
    }

    private Allocation findLatestCheckedInAllocation(String studentId, String rollNumber) {
        List<Allocation> checkedIn = allocationRepository.findByStudentIdAndStatus(
            studentId,
            Allocation.AllocationStatus.CHECKED_IN
        );
        if (checkedIn.isEmpty()) {
            throw new ResourceNotFoundException("No active checked-in allocation found for roll number: " + rollNumber);
        }
        return checkedIn.stream()
            .max(Comparator.comparing(Allocation::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
            .orElseThrow(
                () -> new ResourceNotFoundException(
                    "No active checked-in allocation found for roll number: " + rollNumber
                )
            );
    }

    private void applyRoomNumberForPreview(Allocation allocation) {
        Hostel hostel = hostelRepository.findById(allocation.getHostelId()).orElse(null);
        allocation.setRoomId(resolveRoomNumber(hostel, allocation.getRoomId()));
    }

    private String resolveRoomNumber(Hostel hostel, String roomId) {
        if (hostel == null || roomId == null || roomId.isBlank()) {
            return roomId;
        }
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                for (Hostel.Floor floor : block.getFloors()) {
                    for (Hostel.Room room : floor.getRooms()) {
                        if (roomMatches(room, roomId)) {
                            return room.getRoomNumber() != null && !room.getRoomNumber().isBlank()
                                ? room.getRoomNumber()
                                : roomId;
                        }
                    }
                }
            }
        }
        return roomId;
    }

    private boolean roomMatches(Hostel.Room room, String roomId) {
        if (room == null || roomId == null) {
            return false;
        }
        if (room.getRoomId() != null && roomId.trim().equals(room.getRoomId().trim())) {
            return true;
        }
        return room.getRoomNumber() != null && roomId.trim().equals(room.getRoomNumber().trim());
    }

    private void setBedVacant(Hostel hostel, String roomId, String bedId) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                for (Hostel.Floor floor : block.getFloors()) {
                    for (Hostel.Room room : floor.getRooms()) {
                        if (room.getRoomId().equals(roomId)) {
                            for (Hostel.Bed bed : room.getBeds()) {
                                if (bed.getBedId().equals(bedId)) {
                                    bed.setStatus(Hostel.BedStatus.VACANT);
                                    return;
                                }
                            }
                            throw new ResourceNotFoundException("Bed not found in room: " + bedId);
                        }
                    }
                }
            }
        }
        throw new ResourceNotFoundException("Room not found in hostel: " + roomId);
    }

    private void setBedOccupied(Hostel hostel, String roomId, String bedId) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                for (Hostel.Floor floor : block.getFloors()) {
                    for (Hostel.Room room : floor.getRooms()) {
                        if (room.getRoomId().equals(roomId)) {
                            for (Hostel.Bed bed : room.getBeds()) {
                                if (bed.getBedId().equals(bedId)) {
                                    bed.setStatus(Hostel.BedStatus.OCCUPIED);
                                    return;
                                }
                            }
                            throw new ResourceNotFoundException("Bed not found in room: " + bedId);
                        }
                    }
                }
            }
        }
        throw new ResourceNotFoundException("Room not found in hostel: " + roomId);
    }
}
