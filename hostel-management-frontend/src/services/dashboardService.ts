import api from "./api";

export interface OccupancyByHostelDto {
  hostelName: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyPercent: number;
}

export interface DashboardStatsDto {
  totalStudents: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  currentlyCheckedIn: number;
  allotted: number;
  checkedOutToday: number;
  occupancyByHostel: OccupancyByHostelDto[];
}

export async function getDashboardStats(): Promise<DashboardStatsDto> {
  const response = await api.get<DashboardStatsDto>("/dashboard/stats");
  return response.data;
}
