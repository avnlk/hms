package com.iiitb.hostel.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    /** students collection: status = Active (schema default) */
    private long totalStudents;
    /** hostels: all nested beds */
    private long totalBeds;
    private long occupiedBeds;
    private long vacantBeds;
    /** allocations: status = CHECKED_IN */
    private long currentlyCheckedIn;
    /** allocations: status = ALLOTTED */
    private long allotted;
    /** allocations: status = CHECKED_OUT, endDate within today (local day bounds) */
    private long checkedOutToday;
    private List<OccupancyByHostelDto> occupancyByHostel;
}
