package com.iiitb.hostel.service;

import com.iiitb.hostel.dto.BulkUploadResponse;
import com.iiitb.hostel.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface StudentService {
    Student createStudent(Student student);

    Page<Student> getAllStudents(String search, int page, int size);

    Student getStudentByRollNumber(String rollNumber);

    BulkUploadResponse bulkUpload(MultipartFile csv);
}
