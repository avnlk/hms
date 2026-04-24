import type { Dayjs } from "dayjs";
import api from "./api";

export interface PresentOccupancyRow {
  serialNo: number;
  floor: string;
  block: string;
  roomType: string;
  roomNo: string;
  rollNo: string;
  name: string;
  degree: string;
  emailAddress: string;
  mobile: string;
  checkIn: string;
  remark: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export function toIsoRange(start: Dayjs, end: Dayjs): { startDate: string; endDate: string } {
  return {
    startDate: start.startOf("day").toISOString(),
    endDate: end.endOf("day").toISOString()
  };
}

export async function getPresentOccupancy(
  start: Dayjs,
  end: Dayjs,
  page: number,
  size: number
): Promise<SpringPage<PresentOccupancyRow>> {
  const { startDate, endDate } = toIsoRange(start, end);
  const response = await api.get<SpringPage<PresentOccupancyRow>>("/reports/present-occupancy", {
    params: { startDate, endDate, page, size }
  });
  return response.data;
}

export async function exportPresentOccupancyBlob(start: Dayjs, end: Dayjs): Promise<Blob> {
  const { startDate, endDate } = toIsoRange(start, end);
  const response = await api.get("/reports/present-occupancy/export", {
    params: { startDate, endDate },
    responseType: "blob"
  });
  return response.data;
}

export interface VacatedListRow {
  dateOfVacation: string;
  shiftVacate: string;
  ifShiftingRoomNo: string;
  remarkCheckOut: string;
  block: string;
  roomType: string;
  fromRoomNo: string;
  rollNo: string;
  name: string;
  degree: string;
  emailAddress: string;
  mobileNo: string;
  checkIn: string;
  remarkCheckIn: string;
}

export async function getVacatedList(
  start: Dayjs,
  end: Dayjs,
  page: number,
  size: number
): Promise<SpringPage<VacatedListRow>> {
  const { startDate, endDate } = toIsoRange(start, end);
  const response = await api.get<SpringPage<VacatedListRow>>("/reports/vacated-list", {
    params: { startDate, endDate, page, size }
  });
  return response.data;
}

export async function exportVacatedListBlob(start: Dayjs, end: Dayjs): Promise<Blob> {
  const { startDate, endDate } = toIsoRange(start, end);
  const response = await api.get("/reports/vacated-list/export", {
    params: { startDate, endDate },
    responseType: "blob"
  });
  return response.data;
}

export function saveBlobAsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
