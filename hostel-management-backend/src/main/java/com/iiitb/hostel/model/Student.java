package com.iiitb.hostel.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("students")
public class Student {

    @Id
    @NotBlank
    private String id;

    @Indexed(unique = true)
    @NotBlank
    private String rollNumber;

    @NotBlank
    private String name;
    @NotBlank
    private String gender;
    @NotBlank
    private String batch;
    @NotBlank
    private String program;
    @NotBlank
    private String email;
    @NotBlank
    private String phoneNumber;
    @NotBlank
    private String address;
    private String remarks;

    @NotBlank
    @Builder.Default
    private String status = "Active";
}
