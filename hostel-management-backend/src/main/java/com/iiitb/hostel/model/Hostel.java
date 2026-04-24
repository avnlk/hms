package com.iiitb.hostel.model;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "hostels")
public class Hostel {

    @Id
    private String id;

    private String name;

    @Builder.Default
    private List<Bhavana> bhavanAs = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Bhavana {
        private String bhavanaId;
        private String name;
        private List<Block> blocks = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Block {
        private String blockId;
        private List<Floor> floors = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Floor {
        private String floorId;
        private String floorNumber;
        private List<Room> rooms = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Room {
        /** Stable UUID reference used by allocations and APIs; never replace with display labels. */
        private String roomId;
        /** Human-readable label (e.g. 101). */
        private String roomNumber;
        private Integer type;
        private List<Bed> beds = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Bed {
        private String bedId;
        private String bedName;
        private BedStatus status;
    }

    public enum BedStatus {
        VACANT,
        OCCUPIED
    }
}
