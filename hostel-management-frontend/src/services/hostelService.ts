import api from "./api";
import { Hostel } from "../types";

export const hostelService = {
  async getAll(): Promise<Hostel[]> {
    const response = await api.get<Hostel[]>("/hostels");
    return response.data;
  },

  async addHostel(name: string): Promise<Hostel> {
    const response = await api.post<Hostel>("/hostels", { name });
    return response.data;
  },

  async addBhavana(hostelId: string, name: string): Promise<Hostel> {
    const response = await api.post<Hostel>(`/hostels/${hostelId}/bhavanAs`, { name });
    return response.data;
  },

  async addBlock(hostelId: string, bhavanaId: string): Promise<Hostel> {
    const response = await api.post<Hostel>(`/hostels/${hostelId}/blocks`, { bhavanaId });
    return response.data;
  },

  async addFloor(hostelId: string, bhavanaId: string, blockId: string, floorNumber: string): Promise<Hostel> {
    const response = await api.post<Hostel>(`/hostels/${hostelId}/floors`, {
      bhavanaId,
      blockId,
      floorNumber
    });
    return response.data;
  },

  async addRoom(
    hostelId: string,
    bhavanaId: string,
    blockId: string,
    floorId: string,
    roomNumber: string,
    type: number
  ): Promise<Hostel> {
    const response = await api.post<Hostel>(`/hostels/${hostelId}/rooms`, {
      bhavanaId,
      blockId,
      floorId,
      roomNumber,
      type
    });
    return response.data;
  },

  async addBed(
    hostelId: string,
    bhavanaId: string,
    blockId: string,
    floorId: string,
    roomId: string
  ): Promise<Hostel> {
    const response = await api.post<Hostel>(`/hostels/${hostelId}/beds`, {
      bhavanaId,
      blockId,
      floorId,
      roomId
    });
    return response.data;
  },

  async deleteNode(hostelId: string, level: string, nodeId: string): Promise<Hostel> {
    const response = await api.delete<Hostel>(`/hostels/${hostelId}/node`, {
      data: { level, nodeId }
    });
    return response.data;
  },

  async renameNode(hostelId: string, level: string, nodeId: string, newName: string): Promise<Hostel> {
    const response = await api.put<Hostel>(`/hostels/${hostelId}/node`, {
      level,
      nodeId,
      newName
    });
    return response.data;
  }
};
