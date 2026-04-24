import { create } from "zustand";
import type { Student } from "../types";

interface AllotmentStore {
  student: Student | null;
  expectedCheckInDate: string | null;
  remarks: string | null;
  hostelId: string | null;
  bhavanaId: string | null;
  blockId: string | null;
  floorNumber: string | null;
  roomId: string | null;
  bedId: string | null;
  roomNumber: string | null;
  bedName: string | null;
  tagH: string | null;
  tagB: string | null;
  tagFloor: string | null;
  roomType: number | null;
  setStudent: (student: Student | null) => void;
  setExpectedCheckInDate: (value: string | null) => void;
  setRemarks: (value: string | null) => void;
  setRoomSelection: (payload: {
    hostelId: string;
    bhavanaId: string;
    blockId: string;
    floorNumber: string;
    roomId: string;
    bedId: string;
    roomNumber: string;
    bedName: string;
    tagH: string;
    tagB: string;
    tagFloor: string;
    roomType: number;
  }) => void;
  clearRoomSelection: () => void;
  reset: () => void;
}

const emptyRoom = {
  hostelId: null as string | null,
  bhavanaId: null as string | null,
  blockId: null as string | null,
  floorNumber: null as string | null,
  roomId: null as string | null,
  bedId: null as string | null,
  roomNumber: null as string | null,
  bedName: null as string | null,
  tagH: null as string | null,
  tagB: null as string | null,
  tagFloor: null as string | null,
  roomType: null as number | null
};

export const useAllotmentStore = create<AllotmentStore>((set) => ({
  student: null,
  expectedCheckInDate: null,
  remarks: null,
  ...emptyRoom,
  setStudent: (student) => set({ student }),
  setExpectedCheckInDate: (expectedCheckInDate) => set({ expectedCheckInDate }),
  setRemarks: (remarks) => set({ remarks }),
  setRoomSelection: (payload) =>
    set({
      hostelId: payload.hostelId,
      bhavanaId: payload.bhavanaId,
      blockId: payload.blockId,
      floorNumber: payload.floorNumber,
      roomId: payload.roomId,
      bedId: payload.bedId,
      roomNumber: payload.roomNumber,
      bedName: payload.bedName,
      tagH: payload.tagH,
      tagB: payload.tagB,
      tagFloor: payload.tagFloor,
      roomType: payload.roomType
    }),
  clearRoomSelection: () => set({ ...emptyRoom }),
  reset: () =>
    set({
      student: null,
      expectedCheckInDate: null,
      remarks: null,
      ...emptyRoom
    })
}));
