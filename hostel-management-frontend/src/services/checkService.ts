import api from "./api";
import type { Allocation, Student } from "../types";

export interface CheckPreviewDto {
  student: Student;
  allocation: Allocation;
}

export const getCheckInPreview = async (rollNumber: string): Promise<CheckPreviewDto> => {
  const encoded = encodeURIComponent(rollNumber.trim());
  const response = await api.get<CheckPreviewDto>(`/check/in/${encoded}`);
  return response.data;
};

export const performCheckIn = async (payload: { rollNumber: string; remarks?: string }): Promise<unknown> => {
  const response = await api.post("/check/in", payload);
  return response.data;
};

export const getCheckOutPreview = async (rollNumber: string): Promise<CheckPreviewDto> => {
  const encoded = encodeURIComponent(rollNumber.trim());
  const response = await api.get<CheckPreviewDto>(`/check/out/${encoded}`);
  return response.data;
};

export const performCheckOut = async (payload: { rollNumber: string; remarks?: string }): Promise<unknown> => {
  const response = await api.post("/check/out", payload);
  return response.data;
};
