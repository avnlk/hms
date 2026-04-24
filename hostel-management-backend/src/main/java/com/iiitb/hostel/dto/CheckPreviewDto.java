package com.iiitb.hostel.dto;

import com.iiitb.hostel.model.Allocation;
import com.iiitb.hostel.model.Student;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckPreviewDto {
    private Student student;
    private Allocation allocation;
}
