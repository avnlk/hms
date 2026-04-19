package com.iiitb.hostel.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.iiitb.hostel.dto.AddBedRequest;
import com.iiitb.hostel.dto.AddBlockRequest;
import com.iiitb.hostel.dto.AddBhavanaRequest;
import com.iiitb.hostel.dto.AddFloorRequest;
import com.iiitb.hostel.dto.AddHostelRequest;
import com.iiitb.hostel.dto.AddRoomRequest;
import com.iiitb.hostel.dto.RenameNodeRequest;
import com.iiitb.hostel.exception.ResourceNotFoundException;
import com.iiitb.hostel.model.Hostel;
import com.iiitb.hostel.repository.HostelRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class HostelServiceImpl implements HostelService {

    private final HostelRepository hostelRepository;

    public HostelServiceImpl(HostelRepository hostelRepository) {
        this.hostelRepository = hostelRepository;
    }

    @Override
    public List<Hostel> getAll() {
        return hostelRepository.findAll();
    }

    @Override
    public Hostel addHostel(AddHostelRequest request) {
        Hostel hostel = Hostel.builder()
            .id(UUID.randomUUID().toString())
            .name(request.getName().trim())
            .build();
        return hostelRepository.save(hostel);
    }

    @Override
    public Hostel addBhavana(String hostelId, AddBhavanaRequest request) {
        Hostel hostel = getHostel(hostelId);
        Hostel.Bhavana bhavana = new Hostel.Bhavana(UUID.randomUUID().toString(), request.getName().trim(), new ArrayList<>());
        hostel.getBhavanAs().add(bhavana);
        return hostelRepository.save(hostel);
    }

    @Override
    public Hostel addBlock(String hostelId, AddBlockRequest request) {
        Hostel hostel = getHostel(hostelId);
        Hostel.Bhavana bhavana = findBhavana(hostel, request.getBhavanaId());
        bhavana.getBlocks().add(new Hostel.Block(UUID.randomUUID().toString(), new ArrayList<>()));
        return hostelRepository.save(hostel);
    }

    @Override
    public Hostel addFloor(String hostelId, AddFloorRequest request) {
        Hostel hostel = getHostel(hostelId);
        Hostel.Block block = findBlock(hostel, request.getBhavanaId(), request.getBlockId());
        Hostel.Floor floor = new Hostel.Floor(UUID.randomUUID().toString(), request.getFloorNumber().trim(), new ArrayList<>());
        block.getFloors().add(floor);
        return hostelRepository.save(hostel);
    }

    @Override
    public Hostel addRoom(String hostelId, AddRoomRequest request) {
        Hostel hostel = getHostel(hostelId);
        Hostel.Floor floor = findFloor(hostel, request.getBhavanaId(), request.getBlockId(), request.getFloorId());
        if (request.getType() == null || request.getType() <= 0) {
            throw new IllegalArgumentException("type must be a positive integer");
        }
        if (request.getRoomNumber() == null || request.getRoomNumber().isBlank()) {
            throw new IllegalArgumentException("roomNumber is required");
        }

        Hostel.Room room = new Hostel.Room();
        room.setRoomId(UUID.randomUUID().toString());
        room.setRoomNumber(request.getRoomNumber().trim());
        room.setType(request.getType());
        room.setBeds(new ArrayList<>());

        for (int i = 0; i < request.getType(); i++) {
            String generatedBedName = "Bed " + (i + 1);
            room.getBeds().add(new Hostel.Bed(generatedBedName, generatedBedName, Hostel.BedStatus.VACANT));
        }
        floor.getRooms().add(room);
        return hostelRepository.save(hostel);
    }

    @Override
    public Hostel addBed(String hostelId, AddBedRequest request) {
        Hostel hostel = getHostel(hostelId);
        Hostel.Room room = findRoom(hostel, request.getBhavanaId(), request.getBlockId(), request.getFloorId(), request.getRoomId());
        String generatedBedName = "Bed " + (room.getBeds().size() + 1);
        room.getBeds().add(new Hostel.Bed(generatedBedName, generatedBedName, Hostel.BedStatus.VACANT));
        return hostelRepository.save(hostel);
    }

    @Override
    public Hostel deleteNode(String hostelId, String level, String nodeId) {
        Hostel hostel = getHostel(hostelId);
        String normalizedLevel = normalizeLevel(level);

        boolean deleted = switch (normalizedLevel) {
            case "bhavana" -> hostel.getBhavanAs().removeIf(bhavana -> bhavana.getBhavanaId().equals(nodeId));
            case "block" -> deleteBlock(hostel, nodeId);
            case "floor" -> deleteFloor(hostel, nodeId);
            case "room" -> deleteRoom(hostel, nodeId);
            case "bed" -> deleteBed(hostel, nodeId);
            default -> throw new IllegalArgumentException("Unsupported level: " + level);
        };

        if (!deleted) {
            throw new ResourceNotFoundException("Node not found for level " + level + ": " + nodeId);
        }
        return hostelRepository.save(hostel);
    }

    @Override
    public Hostel renameNode(String hostelId, RenameNodeRequest request) {
        Hostel hostel = getHostel(hostelId);
        String normalizedLevel = normalizeLevel(request.getLevel());
        String newName = request.getNewName().trim();
        boolean renamed;

        switch (normalizedLevel) {
            case "hostel":
                hostel.setName(newName);
                renamed = true;
                break;
            case "bhavana":
                renamed = false;
                for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
                    if (bhavana.getBhavanaId().equals(request.getNodeId())) {
                        bhavana.setName(newName);
                        renamed = true;
                        break;
                    }
                }
                break;
            case "block":
                renamed = renameBlock(hostel, request.getNodeId(), newName);
                break;
            case "floor":
                renamed = renameFloor(hostel, request.getNodeId(), newName);
                break;
            case "room":
                renamed = renameRoom(hostel, request.getNodeId(), newName);
                break;
            case "bed":
                renamed = renameBed(hostel, request.getNodeId(), newName);
                break;
            default:
                throw new IllegalArgumentException("Unsupported level: " + request.getLevel());
        }

        if (!renamed) {
            throw new ResourceNotFoundException("Node not found for level " + request.getLevel() + ": " + request.getNodeId());
        }
        return hostelRepository.save(hostel);
    }

    @Override
    public List<Hostel.Bhavana> getBhavanAs() {
        List<Hostel.Bhavana> result = new ArrayList<>();
        for (Hostel hostel : hostelRepository.findAll()) {
            result.addAll(hostel.getBhavanAs());
        }
        return result;
    }

    @Override
    public List<Hostel.Block> getBlocks(String bhavanaId) {
        for (Hostel hostel : hostelRepository.findAll()) {
            for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
                if (bhavana.getBhavanaId().equals(bhavanaId)) {
                    return bhavana.getBlocks();
                }
            }
        }
        throw new ResourceNotFoundException("Bhavana not found: " + bhavanaId);
    }

    @Override
    public List<Hostel.Floor> getFloors(String blockId) {
        for (Hostel hostel : hostelRepository.findAll()) {
            for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
                for (Hostel.Block block : bhavana.getBlocks()) {
                    if (block.getBlockId().equals(blockId)) {
                        return block.getFloors();
                    }
                }
            }
        }
        throw new ResourceNotFoundException("Block not found: " + blockId);
    }

    @Override
    public List<Integer> getRoomTypes() {
        List<Integer> roomTypes = new ArrayList<>();
        for (Hostel hostel : hostelRepository.findAll()) {
            for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
                for (Hostel.Block block : bhavana.getBlocks()) {
                    for (Hostel.Floor floor : block.getFloors()) {
                        for (Hostel.Room room : floor.getRooms()) {
                            if (room.getType() != null && !roomTypes.contains(room.getType())) {
                                roomTypes.add(room.getType());
                            }
                        }
                    }
                }
            }
        }
        roomTypes.sort(Comparator.naturalOrder());
        return roomTypes;
    }

    private Hostel getHostel(String hostelId) {
        return hostelRepository.findById(hostelId)
            .orElseThrow(() -> new ResourceNotFoundException("Hostel not found: " + hostelId));
    }

    private Hostel.Bhavana findBhavana(Hostel hostel, String bhavanaId) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            if (bhavana.getBhavanaId().equals(bhavanaId)) {
                return bhavana;
            }
        }
        throw new ResourceNotFoundException("Bhavana not found: " + bhavanaId);
    }

    private Hostel.Block findBlock(Hostel hostel, String bhavanaId, String blockId) {
        Hostel.Bhavana bhavana = findBhavana(hostel, bhavanaId);
        for (Hostel.Block block : bhavana.getBlocks()) {
            if (block.getBlockId().equals(blockId)) {
                return block;
            }
        }
        throw new ResourceNotFoundException("Block not found: " + blockId);
    }

    private Hostel.Floor findFloor(Hostel hostel, String bhavanaId, String blockId, String floorId) {
        Hostel.Block block = findBlock(hostel, bhavanaId, blockId);
        for (Hostel.Floor floor : block.getFloors()) {
            if (floor.getFloorId().equals(floorId)) {
                return floor;
            }
        }
        throw new ResourceNotFoundException("Floor not found: " + floorId);
    }

    private Hostel.Room findRoom(Hostel hostel, String bhavanaId, String blockId, String floorId, String roomId) {
        Hostel.Floor floor = findFloor(hostel, bhavanaId, blockId, floorId);
        for (Hostel.Room room : floor.getRooms()) {
            if (room.getRoomId().equals(roomId)) {
                return room;
            }
        }
        throw new ResourceNotFoundException("Room not found: " + roomId);
    }

    private String normalizeLevel(String level) {
        if (!StringUtils.hasText(level)) {
            throw new IllegalArgumentException("level is required");
        }
        String normalized = level.trim().toLowerCase(Locale.ROOT);
        if ("bhavanas".equals(normalized) || "bhavanaas".equals(normalized)) {
            return "bhavana";
        }
        if ("blocks".equals(normalized)) {
            return "block";
        }
        if ("floors".equals(normalized)) {
            return "floor";
        }
        if ("rooms".equals(normalized)) {
            return "room";
        }
        if ("beds".equals(normalized)) {
            return "bed";
        }
        return normalized;
    }

    private boolean deleteBlock(Hostel hostel, String nodeId) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            if (bhavana.getBlocks().removeIf(block -> block.getBlockId().equals(nodeId))) {
                return true;
            }
        }
        return false;
    }

    private boolean deleteFloor(Hostel hostel, String nodeId) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                if (block.getFloors().removeIf(floor -> floor.getFloorId().equals(nodeId))) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean deleteRoom(Hostel hostel, String nodeId) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                for (Hostel.Floor floor : block.getFloors()) {
                    if (floor.getRooms().removeIf(room -> room.getRoomId().equals(nodeId))) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private boolean deleteBed(Hostel hostel, String nodeId) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                for (Hostel.Floor floor : block.getFloors()) {
                    for (Hostel.Room room : floor.getRooms()) {
                        if (room.getBeds().removeIf(bed -> bed.getBedId().equals(nodeId))) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private boolean renameBlock(Hostel hostel, String nodeId, String newName) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                if (block.getBlockId().equals(nodeId)) {
                    block.setBlockId(newName);
                    return true;
                }
            }
        }
        return false;
    }

    private boolean renameFloor(Hostel hostel, String nodeId, String newName) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                for (Hostel.Floor floor : block.getFloors()) {
                    if (floor.getFloorId().equals(nodeId)) {
                        floor.setFloorNumber(newName);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private boolean renameRoom(Hostel hostel, String nodeId, String newName) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                for (Hostel.Floor floor : block.getFloors()) {
                    for (Hostel.Room room : floor.getRooms()) {
                        if (room.getRoomId().equals(nodeId)) {
                            room.setRoomNumber(newName);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private boolean renameBed(Hostel hostel, String nodeId, String newName) {
        for (Hostel.Bhavana bhavana : hostel.getBhavanAs()) {
            for (Hostel.Block block : bhavana.getBlocks()) {
                for (Hostel.Floor floor : block.getFloors()) {
                    for (Hostel.Room room : floor.getRooms()) {
                        for (Hostel.Bed bed : room.getBeds()) {
                            if (bed.getBedId().equals(nodeId)) {
                                bed.setBedId(newName);
                                bed.setBedName(newName);
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}
