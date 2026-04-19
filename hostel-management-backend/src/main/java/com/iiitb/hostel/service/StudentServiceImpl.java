package com.iiitb.hostel.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import com.iiitb.hostel.dto.BulkUploadResponse;
import com.iiitb.hostel.exception.ResourceNotFoundException;
import com.iiitb.hostel.model.Student;
import com.iiitb.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentServiceImpl implements StudentService {

    private static final List<String> CSV_HEADERS = List.of(
        "id",
        "rollNumber",
        "name",
        "gender",
        "batch",
        "program",
        "email",
        "phoneNumber",
        "address",
        "remarks",
        "status"
    );

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public Student createStudent(Student student) {
        if (studentRepository.existsByRollNumber(student.getRollNumber())) {
            throw new IllegalArgumentException("Student with rollNumber already exists: " + student.getRollNumber());
        }
        if (!StringUtils.hasText(student.getStatus())) {
            student.setStatus("Active");
        }
        return studentRepository.save(student);
    }

    @Override
    public Page<Student> getAllStudents(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "rollNumber"));
        if (!StringUtils.hasText(search)) {
            return studentRepository.findAll(pageable);
        }
        return studentRepository.findByRollNumberContainingIgnoreCase(search.trim(), pageable);
    }

    @Override
    public Student getStudentByRollNumber(String rollNumber) {
        return studentRepository.findByRollNumber(rollNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found for rollNumber: " + rollNumber));
    }

    @Override
    public BulkUploadResponse bulkUpload(MultipartFile csv) {
        if (csv == null || csv.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required");
        }

        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
            new InputStreamReader(csv.getInputStream(), StandardCharsets.UTF_8)
        )) {
            String headerLine = reader.readLine();
            if (!StringUtils.hasText(headerLine)) {
                throw new IllegalArgumentException("CSV is empty");
            }

            List<String> headers = parseCsvLine(headerLine);
            if (!headers.equals(CSV_HEADERS)) {
                throw new IllegalArgumentException(
                    "CSV header must exactly match: " + String.join(",", CSV_HEADERS)
                );
            }

            String line;
            int rowNumber = 1;
            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (!StringUtils.hasText(line)) {
                    continue;
                }

                try {
                    Student student = mapStudent(line);
                    if (studentRepository.existsByRollNumber(student.getRollNumber())) {
                        failureCount++;
                        errors.add("Row " + rowNumber + ": duplicate rollNumber " + student.getRollNumber());
                        continue;
                    }
                    studentRepository.save(student);
                    successCount++;
                } catch (IllegalArgumentException ex) {
                    failureCount++;
                    errors.add("Row " + rowNumber + ": " + ex.getMessage());
                }
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to read CSV file: " + ex.getMessage());
        }

        return BulkUploadResponse.builder()
            .successCount(successCount)
            .failureCount(failureCount)
            .errors(errors)
            .build();
    }

    private Student mapStudent(String line) {
        List<String> values = parseCsvLine(line);
        if (values.size() != CSV_HEADERS.size()) {
            throw new IllegalArgumentException(
                "expected " + CSV_HEADERS.size() + " columns but found " + values.size()
            );
        }

        Student student = new Student();
        student.setId(required(values.get(0), "id"));
        student.setRollNumber(required(values.get(1), "rollNumber"));
        student.setName(required(values.get(2), "name"));
        student.setGender(required(values.get(3), "gender"));
        student.setBatch(required(values.get(4), "batch"));
        student.setProgram(required(values.get(5), "program"));
        student.setEmail(required(values.get(6), "email"));
        student.setPhoneNumber(required(values.get(7), "phoneNumber"));
        student.setAddress(required(values.get(8), "address"));
        student.setRemarks(blankToNull(values.get(9)));
        String statusValue = blankToNull(values.get(10));
        student.setStatus(StringUtils.hasText(statusValue) ? statusValue : "Active");
        return student;
    }

    private List<String> parseCsvLine(String line) {
        if (line == null) {
            return List.of();
        }
        String[] split = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
        return Arrays.stream(split)
            .map(this::normalizeCsvValue)
            .toList();
    }

    private String normalizeCsvValue(String value) {
        String trimmed = Objects.toString(value, "").trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"") && trimmed.length() >= 2) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed.replace("\"\"", "\"");
    }

    private String required(String value, String fieldName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(fieldName + " is mandatory");
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
