package com.iiitb.hostel.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import com.iiitb.hostel.dto.PresentOccupancyRowDto;
import com.iiitb.hostel.dto.ReportExportType;
import com.iiitb.hostel.dto.VacatedListRowDto;
import com.iiitb.hostel.model.Allocation;
import com.iiitb.hostel.model.Hostel;
import com.iiitb.hostel.model.Student;
import com.iiitb.hostel.repository.AllocationRepository;
import com.iiitb.hostel.repository.HostelRepository;
import com.iiitb.hostel.repository.StudentRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ReportServiceImpl implements ReportService {

    private final AllocationRepository allocationRepository;
    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;

    public ReportServiceImpl(
        AllocationRepository allocationRepository,
        StudentRepository studentRepository,
        HostelRepository hostelRepository
    ) {
        this.allocationRepository = allocationRepository;
        this.studentRepository = studentRepository;
        this.hostelRepository = hostelRepository;
    }

    @Override
    public Page<PresentOccupancyRowDto> getPresentOccupancy(Instant startDate, Instant endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        Page<Allocation> allocPage = allocationRepository.findByStatusAndStartDateBetween(
            Allocation.AllocationStatus.CHECKED_IN,
            startDate,
            endDate,
            pageable
        );
        Map<String, Student> students = loadStudents(allocPage.getContent());
        Map<String, Hostel> hostels = loadHostels(allocPage.getContent());
        int base = page * size;
        List<PresentOccupancyRowDto> rows = new ArrayList<>();
        int i = 0;
        for (Allocation a : allocPage.getContent()) {
            Student s = students.get(a.getStudentId());
            Hostel h = hostels.get(a.getHostelId());
            Placement p = resolvePlacement(h, a);
            rows.add(PresentOccupancyRowDto.builder()
                .serialNo(base + i + 1)
                .floor(p.floor)
                .block(p.block)
                .roomType(p.roomType)
                .roomNo(p.roomNo)
                .rollNo(s != null ? s.getRollNumber() : "")
                .name(s != null ? s.getName() : "")
                .degree(s != null ? s.getBatch() : "")
                .emailAddress(s != null ? s.getEmail() : "")
                .mobile(s != null ? s.getPhoneNumber() : "")
                .checkIn(formatDisplayDate(a.getStartDate()))
                .remark(remarks(a.getCheckIn()))
                .build());
            i++;
        }
        return new PageImpl<>(rows, pageable, allocPage.getTotalElements());
    }

    @Override
    public Page<VacatedListRowDto> getVacatedList(Instant startDate, Instant endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "endDate"));
        Page<Allocation> allocPage = allocationRepository.findByStatusAndEndDateBetween(
            Allocation.AllocationStatus.CHECKED_OUT,
            startDate,
            endDate,
            pageable
        );
        Map<String, Student> students = loadStudents(allocPage.getContent());
        Map<String, Hostel> hostels = loadHostels(allocPage.getContent());
        List<VacatedListRowDto> rows = new ArrayList<>();
        for (Allocation a : allocPage.getContent()) {
            Student s = students.get(a.getStudentId());
            Hostel h = hostels.get(a.getHostelId());
            Placement p = resolvePlacement(h, a);
            rows.add(VacatedListRowDto.builder()
                .dateOfVacation(formatDisplayDate(a.getEndDate()))
                .shiftVacate("")
                .ifShiftingRoomNo("")
                .remarkCheckOut(remarks(a.getCheckOut()))
                .block(p.block)
                .roomType(p.roomType)
                .fromRoomNo(p.roomNo)
                .rollNo(s != null ? s.getRollNumber() : "")
                .name(s != null ? s.getName() : "")
                .degree(s != null ? s.getBatch() : "")
                .emailAddress(s != null ? s.getEmail() : "")
                .mobileNo(s != null ? s.getPhoneNumber() : "")
                .checkIn(formatDisplayDate(a.getStartDate()))
                .remarkCheckIn(remarks(a.getCheckIn()))
                .build());
        }
        return new PageImpl<>(rows, pageable, allocPage.getTotalElements());
    }

    @Override
    public byte[] exportToExcel(ReportExportType reportType, Instant startDate, Instant endDate) {
        if (reportType == ReportExportType.PRESENT_OCCUPANCY) {
            List<Allocation> all = allocationRepository.findByStatusAndStartDateBetween(
                Allocation.AllocationStatus.CHECKED_IN,
                startDate,
                endDate
            );
            all.sort((a, b) -> {
                Instant sa = a.getStartDate() != null ? a.getStartDate() : Instant.MIN;
                Instant sb = b.getStartDate() != null ? b.getStartDate() : Instant.MIN;
                return sb.compareTo(sa);
            });
            Map<String, Student> students = loadStudents(all);
            Map<String, Hostel> hostels = loadHostels(all);
            List<PresentOccupancyRowDto> rows = new ArrayList<>();
            int n = 1;
            for (Allocation a : all) {
                Student s = students.get(a.getStudentId());
                Hostel h = hostels.get(a.getHostelId());
                Placement p = resolvePlacement(h, a);
                rows.add(PresentOccupancyRowDto.builder()
                    .serialNo(n++)
                    .floor(p.floor)
                    .block(p.block)
                    .roomType(p.roomType)
                    .roomNo(p.roomNo)
                    .rollNo(s != null ? s.getRollNumber() : "")
                    .name(s != null ? s.getName() : "")
                    .degree(s != null ? s.getBatch() : "")
                    .emailAddress(s != null ? s.getEmail() : "")
                    .mobile(s != null ? s.getPhoneNumber() : "")
                    .checkIn(formatDisplayDate(a.getStartDate()))
                    .remark(remarks(a.getCheckIn()))
                    .build());
            }
            return writePresentOccupancyExcel(rows);
        }
        List<Allocation> all = allocationRepository.findByStatusAndEndDateBetween(
            Allocation.AllocationStatus.CHECKED_OUT,
            startDate,
            endDate
        );
        all.sort((a, b) -> {
            Instant ea = a.getEndDate() != null ? a.getEndDate() : Instant.MIN;
            Instant eb = b.getEndDate() != null ? b.getEndDate() : Instant.MIN;
            return eb.compareTo(ea);
        });
        Map<String, Student> students = loadStudents(all);
        Map<String, Hostel> hostels = loadHostels(all);
        List<VacatedListRowDto> rows = new ArrayList<>();
        for (Allocation a : all) {
            Student s = students.get(a.getStudentId());
            Hostel h = hostels.get(a.getHostelId());
            Placement p = resolvePlacement(h, a);
            rows.add(VacatedListRowDto.builder()
                .dateOfVacation(formatDisplayDate(a.getEndDate()))
                .shiftVacate("")
                .ifShiftingRoomNo("")
                .remarkCheckOut(remarks(a.getCheckOut()))
                .block(p.block)
                .roomType(p.roomType)
                .fromRoomNo(p.roomNo)
                .rollNo(s != null ? s.getRollNumber() : "")
                .name(s != null ? s.getName() : "")
                .degree(s != null ? s.getBatch() : "")
                .emailAddress(s != null ? s.getEmail() : "")
                .mobileNo(s != null ? s.getPhoneNumber() : "")
                .checkIn(formatDisplayDate(a.getStartDate()))
                .remarkCheckIn(remarks(a.getCheckIn()))
                .build());
        }
        return writeVacatedListExcel(rows);
    }

    private Map<String, Student> loadStudents(List<Allocation> allocations) {
        List<String> ids = allocations.stream().map(Allocation::getStudentId).filter(Objects::nonNull).distinct().toList();
        Map<String, Student> map = new HashMap<>();
        studentRepository.findAllById(ids).forEach(s -> map.put(s.getId(), s));
        return map;
    }

    private Map<String, Hostel> loadHostels(List<Allocation> allocations) {
        List<String> ids = allocations.stream().map(Allocation::getHostelId).filter(Objects::nonNull).distinct().toList();
        Map<String, Hostel> map = new HashMap<>();
        hostelRepository.findAllById(ids).forEach(h -> map.put(h.getId(), h));
        return map;
    }

    private static String remarks(Allocation.CheckAction action) {
        if (action == null || action.getRemarks() == null) {
            return "";
        }
        return action.getRemarks();
    }

    private static String formatDisplayDate(Instant instant) {
        if (instant == null) {
            return "";
        }
        return ReportService.DISPLAY_FORMAT.format(instant);
    }

    private record Placement(String floor, String block, String roomType, String roomNo) {
    }

    private Placement resolvePlacement(Hostel hostel, Allocation allocation) {
        String roomId = allocation.getRoomId();
        if (hostel == null || roomId == null || roomId.isBlank()) {
            return new Placement(
                formatFloorLabel(allocation.getFloorNumber()),
                nullToEmpty(allocation.getBlockId()),
                "",
                ""
            );
        }
        for (Hostel.Bhavana bhavana : nullSafe(hostel.getBhavanAs())) {
            for (Hostel.Block block : nullSafe(bhavana.getBlocks())) {
                for (Hostel.Floor floor : nullSafe(block.getFloors())) {
                    for (Hostel.Room room : nullSafe(floor.getRooms())) {
                        if (roomMatchesAllocation(roomId, room)) {
                            return new Placement(
                                formatFloorLabel(floor.getFloorNumber()),
                                nullToEmpty(bhavana.getName()),
                                roomTypeLabel(room.getType()),
                                roomDisplayNumber(room)
                            );
                        }
                    }
                }
            }
        }
        return new Placement(
            formatFloorLabel(allocation.getFloorNumber()),
            nullToEmpty(allocation.getBlockId()),
            "",
            ""
        );
    }

    /**
     * True if the allocation's room key matches this embedded room ({@code roomId} or display {@code roomNumber}).
     */
    private static boolean roomMatchesAllocation(String allocationRoomId, Hostel.Room room) {
        if (allocationRoomId == null || allocationRoomId.isBlank() || room == null) {
            return false;
        }
        String a = allocationRoomId.trim();
        if (room.getRoomId() != null && a.equals(room.getRoomId().trim())) {
            return true;
        }
        return room.getRoomNumber() != null && a.equals(room.getRoomNumber().trim());
    }

    /**
     * Prefer {@code roomNumber}; if missing, fall back to {@code roomId} (UUID is better than blank).
     */
    private static String roomDisplayNumber(Hostel.Room room) {
        if (room == null) {
            return "";
        }
        String displayNumber = room.getRoomNumber();
        if (displayNumber == null || displayNumber.isBlank()) {
            displayNumber = room.getRoomId();
        }
        return displayNumber != null ? displayNumber.trim() : "";
    }

    private static <T> List<T> nullSafe(List<T> list) {
        return list != null ? list : List.of();
    }

    private static String nullToEmpty(String s) {
        return s != null ? s : "";
    }

    private static String formatFloorLabel(String floorNumber) {
        if (floorNumber == null || floorNumber.isBlank()) {
            return "";
        }
        String t = floorNumber.trim();
        if ("G".equalsIgnoreCase(t) || "0".equals(t)) {
            return "G";
        }
        try {
            int n = Integer.parseInt(t);
            return switch (n) {
                case 1 -> "1st";
                case 2 -> "2nd";
                case 3 -> "3rd";
                default -> n + "th";
            };
        } catch (NumberFormatException e) {
            return t;
        }
    }

    private static String roomTypeLabel(Integer type) {
        if (type == null) {
            return "";
        }
        return switch (type) {
            case 1 -> "Single";
            case 2 -> "Double";
            case 3 -> "Triple";
            default -> String.valueOf(type);
        };
    }

    private byte[] writePresentOccupancyExcel(List<PresentOccupancyRowDto> rows) {
        String[] headers = {
            "S.No.",
            "Floor",
            "Block",
            "Room Type",
            "Room No.",
            "Roll No.",
            "Name",
            "Degree",
            "Email Address",
            "Mobile",
            "Check In",
            "Remark"
        };
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Present Occupancy");
            Row h = sheet.createRow(0);
            for (int c = 0; c < headers.length; c++) {
                Cell cell = h.createCell(c);
                cell.setCellValue(headers[c]);
            }
            int r = 1;
            for (PresentOccupancyRowDto row : rows) {
                Row data = sheet.createRow(r++);
                int c = 0;
                data.createCell(c++).setCellValue(row.getSerialNo());
                data.createCell(c++).setCellValue(row.getFloor());
                data.createCell(c++).setCellValue(row.getBlock());
                data.createCell(c++).setCellValue(row.getRoomType());
                data.createCell(c++).setCellValue(row.getRoomNo());
                data.createCell(c++).setCellValue(row.getRollNo());
                data.createCell(c++).setCellValue(row.getName());
                data.createCell(c++).setCellValue(row.getDegree());
                data.createCell(c++).setCellValue(row.getEmailAddress());
                data.createCell(c++).setCellValue(row.getMobile());
                data.createCell(c++).setCellValue(row.getCheckIn());
                data.createCell(c++).setCellValue(row.getRemark());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to write Excel", e);
        }
    }

    private byte[] writeVacatedListExcel(List<VacatedListRowDto> rows) {
        String[] headers = {
            "Date of Vacation",
            "Shift/Vacate",
            "If Shifting, Room No.",
            "Remark Check out",
            "Block",
            "Room Type",
            "From Room No.",
            "Roll No",
            "Name",
            "Degree",
            "E-Mail Address",
            "Mobile No.",
            "Check In",
            "Remark Check IN"
        };
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Vacated list");
            Row h = sheet.createRow(0);
            for (int c = 0; c < headers.length; c++) {
                h.createCell(c).setCellValue(headers[c]);
            }
            int r = 1;
            for (VacatedListRowDto row : rows) {
                Row data = sheet.createRow(r++);
                int c = 0;
                data.createCell(c++).setCellValue(row.getDateOfVacation());
                data.createCell(c++).setCellValue(row.getShiftVacate());
                data.createCell(c++).setCellValue(row.getIfShiftingRoomNo());
                data.createCell(c++).setCellValue(row.getRemarkCheckOut());
                data.createCell(c++).setCellValue(row.getBlock());
                data.createCell(c++).setCellValue(row.getRoomType());
                data.createCell(c++).setCellValue(row.getFromRoomNo());
                data.createCell(c++).setCellValue(row.getRollNo());
                data.createCell(c++).setCellValue(row.getName());
                data.createCell(c++).setCellValue(row.getDegree());
                data.createCell(c++).setCellValue(row.getEmailAddress());
                data.createCell(c++).setCellValue(row.getMobileNo());
                data.createCell(c++).setCellValue(row.getCheckIn());
                data.createCell(c++).setCellValue(row.getRemarkCheckIn());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to write Excel", e);
        }
    }
}
