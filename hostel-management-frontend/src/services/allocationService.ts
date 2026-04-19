import api from "./api";

export type AllocationStatus = "ALLOTTED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

export interface AllocationListItem {
  id: string;
  studentId: string;
  rollNumber: string;
  name: string;
  program: string;
  batch: string;
  email: string;
  phoneNumber: string;
  hostelId: string;
  blockId: string;
  floorNumber: string;
  roomId: string;
  bedId: string;
  status: AllocationStatus;
  expectedCheckInDate: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
}

export interface AllocationPageResponse {
  content: AllocationListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const getAllocations = async (
  search: string,
  page: number,
  size: number
): Promise<AllocationPageResponse> => {
  const response = await api.get<AllocationPageResponse>("/allocations", {
    params: { search: search || undefined, page, size }
  });
  return response.data;
};

export const getAllocationById = async (id: string): Promise<AllocationListItem> => {
  const encoded = encodeURIComponent(id);
  const response = await api.get<AllocationListItem>(`/allocations/${encoded}`);
  return response.data;
};

export interface RoomGridItemDto {
  roomId: string;
  roomNumber: string;
  type: number;
  status: string;
}

export interface BedOptionDto {
  bedId: string;
  bedName?: string;
  status: "VACANT" | "OCCUPIED";
}

export const getRoomGrid = async (params: {
  hostelId: string;
  bhavanaId: string;
  blockId: string;
  floorNumber: string;
  roomType?: number;
}): Promise<RoomGridItemDto[]> => {
  const query: Record<string, string | number> = {
    hostelId: params.hostelId,
    bhavanaId: params.bhavanaId,
    blockId: params.blockId,
    floorNumber: params.floorNumber
  };
  if (params.roomType !== undefined) {
    query.roomType = params.roomType;
  }
  const response = await api.get<RoomGridItemDto[]>("/allocations/room-grid", { params: query });
  return response.data;
};

export const getBedOptions = async (roomId: string): Promise<BedOptionDto[]> => {
  const encoded = encodeURIComponent(roomId);
  const response = await api.get<BedOptionDto[]>(`/allocations/beds/${encoded}`);
  return response.data;
};

export interface CreateAllocationPayload {
  studentId: string;
  hostelId: string;
  bhavanaId: string;
  blockId: string;
  floorNumber: string;
  roomId: string;
  bedId: string;
  expectedCheckInDate: string;
  startDate: string;
  endDate: string;
  remarks?: string;
}

export const createAllocation = async (payload: CreateAllocationPayload): Promise<unknown> => {
  const response = await api.post("/allocations", payload);
  return response.data;
};
