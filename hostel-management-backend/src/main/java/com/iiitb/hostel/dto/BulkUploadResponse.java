package com.iiitb.hostel.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResponse {
    private int successCount;
    private int failureCount;

    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
