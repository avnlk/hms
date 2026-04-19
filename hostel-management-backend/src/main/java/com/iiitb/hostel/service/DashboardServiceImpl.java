package com.iiitb.hostel.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.iiitb.hostel.dto.DashboardStatsDto;
import com.iiitb.hostel.dto.OccupancyByHostelDto;
import com.iiitb.hostel.model.Allocation;
import com.iiitb.hostel.model.Hostel;
import com.iiitb.hostel.repository.AllocationRepository;
import com.iiitb.hostel.repository.StudentRepository;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

/**
 * Aggregations align with {@code _docs/db_schema.xlsx}:
 * <ul>
 *   <li>{@code students.status} default {@code Active}</li>
 *   <li>{@code allocations.status}: ALLOTTED / CHECKED_IN / CHECKED_OUT / CANCELLED</li>
 *   <li>{@code hostels.bhavanAs[].blocks[].floors[].rooms[].beds[].status}: VACANT | OCCUPIED</li>
 * </ul>
 * <p>
 * MongoDB (bed rollups — equivalent shell pipeline):
 * <pre>
 * db.hostels.aggregate([
 *   { $unwind: { path: "$bhavanAs", preserveNullAndEmptyArrays: true } },
 *   { $unwind: { path: "$bhavanAs.blocks", preserveNullAndEmptyArrays: true } },
 *   { $unwind: { path: "$bhavanAs.blocks.floors", preserveNullAndEmptyArrays: true } },
 *   { $unwind: { path: "$bhavanAs.blocks.floors.rooms", preserveNullAndEmptyArrays: true } },
 *   { $unwind: { path: "$bhavanAs.blocks.floors.rooms.beds", preserveNullAndEmptyArrays: true } },
 *   { $group: {
 *       _id: { id: "$_id", name: "$name" },
 *       totalBeds: { $sum: 1 },
 *       occupiedBeds: { $sum: { $cond: [
 *         { $eq: ["$bhavanAs.blocks.floors.rooms.beds.status", "OCCUPIED"] }, 1, 0 ] } }
 *   }}
 * ])
 * </pre>
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private static final String STUDENT_STATUS_ACTIVE = "Active";
    private static final String OCCUPIED = Hostel.BedStatus.OCCUPIED.name();
    private static final ZoneId REPORT_ZONE = ZoneId.systemDefault();

    private static final String BED_PATH = "$bhavanAs.blocks.floors.rooms.beds.status";

    private final StudentRepository studentRepository;
    private final AllocationRepository allocationRepository;
    private final MongoTemplate mongoTemplate;

    public DashboardServiceImpl(
        StudentRepository studentRepository,
        AllocationRepository allocationRepository,
        MongoTemplate mongoTemplate
    ) {
        this.studentRepository = studentRepository;
        this.allocationRepository = allocationRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public DashboardStatsDto getStats() {
        long totalStudents = studentRepository.countByStatus(STUDENT_STATUS_ACTIVE);
        long currentlyCheckedIn = allocationRepository.countByStatus(Allocation.AllocationStatus.CHECKED_IN);
        long allotted = allocationRepository.countByStatus(Allocation.AllocationStatus.ALLOTTED);

        Instant dayStart = LocalDate.now(REPORT_ZONE).atStartOfDay(REPORT_ZONE).toInstant();
        Instant dayEnd = LocalDate.now(REPORT_ZONE).plusDays(1).atStartOfDay(REPORT_ZONE).toInstant();
        Query checkedOutQuery = new Query(Criteria.where("status").is(Allocation.AllocationStatus.CHECKED_OUT)
            .andOperator(
                Criteria.where("endDate").gte(dayStart),
                Criteria.where("endDate").lt(dayEnd)
            ));
        long checkedOutToday = mongoTemplate.count(checkedOutQuery, Allocation.class);

        BedRollup global = rollupBedsGlobal();
        List<OccupancyByHostelDto> byHostel = rollupBedsPerHostel();

        long totalBeds = global.totalBeds();
        long occupiedBeds = global.occupiedBeds();
        long vacantBeds = totalBeds - occupiedBeds;

        return DashboardStatsDto.builder()
            .totalStudents(totalStudents)
            .totalBeds(totalBeds)
            .occupiedBeds(occupiedBeds)
            .vacantBeds(vacantBeds)
            .currentlyCheckedIn(currentlyCheckedIn)
            .allotted(allotted)
            .checkedOutToday(checkedOutToday)
            .occupancyByHostel(byHostel)
            .build();
    }

    private List<Document> unwindBedPipeline() {
        return Arrays.asList(
            new Document("$unwind", new Document("path", "$bhavanAs").append("preserveNullAndEmptyArrays", true)),
            new Document("$unwind", new Document("path", "$bhavanAs.blocks").append("preserveNullAndEmptyArrays", true)),
            new Document("$unwind", new Document("path", "$bhavanAs.blocks.floors").append("preserveNullAndEmptyArrays", true)),
            new Document(
                "$unwind",
                new Document("path", "$bhavanAs.blocks.floors.rooms").append("preserveNullAndEmptyArrays", true)
            ),
            new Document(
                "$unwind",
                new Document("path", "$bhavanAs.blocks.floors.rooms.beds").append("preserveNullAndEmptyArrays", true)
            )
        );
    }

    private BedRollup rollupBedsGlobal() {
        List<Document> pipeline = new ArrayList<>(unwindBedPipeline());
        pipeline.add(new Document("$group", new Document("_id", null)
            .append("totalBeds", new Document("$sum", 1))
            .append("occupiedBeds", new Document("$sum", new Document("$cond", Arrays.asList(
                new Document("$eq", Arrays.asList(BED_PATH, OCCUPIED)),
                1,
                0
            ))))));

        Document out = mongoTemplate.getCollection("hostels")
            .aggregate(pipeline)
            .first();
        if (out == null) {
            return new BedRollup(0, 0);
        }
        return new BedRollup(
            numberLong(out.get("totalBeds")),
            numberLong(out.get("occupiedBeds"))
        );
    }

    private List<OccupancyByHostelDto> rollupBedsPerHostel() {
        List<Document> pipeline = new ArrayList<>(unwindBedPipeline());
        pipeline.add(new Document("$group", new Document("_id", new Document("id", "$_id").append("name", "$name"))
            .append("totalBeds", new Document("$sum", 1))
            .append("occupiedBeds", new Document("$sum", new Document("$cond", Arrays.asList(
                new Document("$eq", Arrays.asList(BED_PATH, OCCUPIED)),
                1,
                0
            ))))));
        pipeline.add(new Document("$sort", new Document("_id.name", 1)));

        List<OccupancyByHostelDto> list = new ArrayList<>();
        mongoTemplate.getCollection("hostels").aggregate(pipeline).forEach(doc -> {
            Document id = doc.get("_id", Document.class);
            String name = id != null ? id.getString("name") : "";
            long tb = numberLong(doc.get("totalBeds"));
            long ob = numberLong(doc.get("occupiedBeds"));
            double pct = tb == 0 ? 0.0 : Math.round((10000.0 * ob / tb)) / 100.0;
            list.add(OccupancyByHostelDto.builder()
                .hostelName(name != null ? name : "")
                .totalBeds(tb)
                .occupiedBeds(ob)
                .occupancyPercent(pct)
                .build());
        });
        return list;
    }

    private static long numberLong(Object v) {
        if (v == null) {
            return 0L;
        }
        if (v instanceof Number n) {
            return n.longValue();
        }
        return 0L;
    }

    private record BedRollup(long totalBeds, long occupiedBeds) {
    }
}
