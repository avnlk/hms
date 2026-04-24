import { create } from "zustand";
import { Bhavana, Hostel } from "../types";
import { hostelService } from "../services/hostelService";

type NodeLevel = "hostel" | "bhavana" | "block" | "floor" | "room" | "bed";

interface AddRoomPayload {
  roomNumber: string;
  roomType: number;
}

interface AddNodeContext {
  hostelId: string;
  bhavanaId?: string;
  blockId?: string;
  floorId?: string;
  roomId?: string;
}

interface HostelStore {
  hostels: Hostel[];
  loading: boolean;
  fetchHostels: () => Promise<void>;
  addNode: (level: NodeLevel, context: AddNodeContext, value: string | AddRoomPayload) => Promise<void>;
  deleteNode: (hostelId: string, level: NodeLevel, nodeId: string) => Promise<void>;
  renameNode: (hostelId: string, level: NodeLevel, nodeId: string, newName: string) => Promise<void>;
}

const replaceHostel = (current: Hostel[], updated: Hostel): Hostel[] => {
  const index = current.findIndex((hostel) => hostel.id === updated.id);
  if (index < 0) {
    return [...current, updated];
  }
  const next = [...current];
  next[index] = updated;
  return next;
};

const findBhavana = (hostel: Hostel, bhavanaId: string): Bhavana | undefined =>
  hostel.bhavanAs.find((bhavana) => bhavana.bhavanaId === bhavanaId);

export const useHostelStore = create<HostelStore>((set, get) => ({
  hostels: [],
  loading: false,

  fetchHostels: async () => {
    set({ loading: true });
    try {
      const hostels = await hostelService.getAll();
      set({ hostels });
    } finally {
      set({ loading: false });
    }
  },

  addNode: async (level, context, value) => {
    const { hostels } = get();
    let updatedHostel: Hostel;

    if (level === "hostel") {
      updatedHostel = await hostelService.addHostel(String(value));
      set((state) => ({ hostels: replaceHostel(state.hostels, updatedHostel) }));
      return;
    }

    const currentHostel = hostels.find((item) => item.id === context.hostelId);
    if (!currentHostel) {
      throw new Error("Hostel not found in store");
    }

    switch (level) {
      case "bhavana":
        updatedHostel = await hostelService.addBhavana(context.hostelId, String(value));
        set((state) => ({ hostels: replaceHostel(state.hostels, updatedHostel) }));
        return;

      case "block": {
        if (!context.bhavanaId) throw new Error("bhavanaId is required");
        const before = findBhavana(currentHostel, context.bhavanaId)?.blocks ?? [];
        updatedHostel = await hostelService.addBlock(context.hostelId, context.bhavanaId);
        const afterBhavana = findBhavana(updatedHostel, context.bhavanaId);
        const createdBlock = afterBhavana?.blocks.find(
          (block) => !before.some((existing) => existing.blockId === block.blockId)
        );
        if (createdBlock) {
          updatedHostel = await hostelService.renameNode(
            context.hostelId,
            "block",
            createdBlock.blockId,
            String(value)
          );
        }
        set((state) => ({ hostels: replaceHostel(state.hostels, updatedHostel) }));
        return;
      }

      case "floor":
        if (!context.bhavanaId || !context.blockId) {
          throw new Error("bhavanaId and blockId are required");
        }
        updatedHostel = await hostelService.addFloor(
          context.hostelId,
          context.bhavanaId,
          context.blockId,
          String(value)
        );
        set((state) => ({ hostels: replaceHostel(state.hostels, updatedHostel) }));
        return;

      case "room": {
        if (!context.bhavanaId || !context.blockId || !context.floorId) {
          throw new Error("bhavanaId, blockId and floorId are required");
        }
        const payload = value as AddRoomPayload;
        updatedHostel = await hostelService.addRoom(
          context.hostelId,
          context.bhavanaId,
          context.blockId,
          context.floorId,
          payload.roomNumber.trim(),
          payload.roomType
        );
        set((state) => ({ hostels: replaceHostel(state.hostels, updatedHostel) }));
        return;
      }

      case "bed": {
        if (!context.bhavanaId || !context.blockId || !context.floorId || !context.roomId) {
          throw new Error("bhavanaId, blockId, floorId and roomId are required");
        }
        const roomBefore = currentHostel.bhavanAs
          .flatMap((bhavana) => bhavana.blocks)
          .flatMap((block) => block.floors)
          .flatMap((floor) => floor.rooms)
          .find((room) => room.roomId === context.roomId);
        const bedIdsBefore = roomBefore?.beds.map((bed) => bed.bedId) ?? [];

        updatedHostel = await hostelService.addBed(
          context.hostelId,
          context.bhavanaId,
          context.blockId,
          context.floorId,
          context.roomId
        );

        const roomAfter = updatedHostel.bhavanAs
          .flatMap((bhavana) => bhavana.blocks)
          .flatMap((block) => block.floors)
          .flatMap((floor) => floor.rooms)
          .find((room) => room.roomId === context.roomId);

        const createdBed = roomAfter?.beds.find((bed) => !bedIdsBefore.includes(bed.bedId));
        if (createdBed) {
          updatedHostel = await hostelService.renameNode(
            context.hostelId,
            "bed",
            createdBed.bedId,
            String(value)
          );
        }
        set((state) => ({ hostels: replaceHostel(state.hostels, updatedHostel) }));
      }
    }
  },

  deleteNode: async (hostelId, level, nodeId) => {
    const updatedHostel = await hostelService.deleteNode(hostelId, level, nodeId);
    set((state) => ({ hostels: replaceHostel(state.hostels, updatedHostel) }));
  },

  renameNode: async (hostelId, level, nodeId, newName) => {
    const updatedHostel = await hostelService.renameNode(hostelId, level, nodeId, newName);
    set((state) => ({ hostels: replaceHostel(state.hostels, updatedHostel) }));
  }
}));
