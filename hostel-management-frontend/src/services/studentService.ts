import api from "./api";
import { Student } from "../types";

export interface StudentPageResponse {
  content: Student[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface StudentFormPayload {
  rollNumber: string;
  name: string;
  gender: string;
  batch: string;
  program: string;
  email: string;
  phoneNumber: string;
  remarks?: string;
}

const createStudentId = () => `STU-${Date.now()}`;

export const getStudents = async (
  search: string,
  page: number,
  size: number
): Promise<StudentPageResponse> => {
  const response = await api.get<StudentPageResponse>("/students", {
    params: { search: search || undefined, page, size }
  });
  return response.data;
};

export const getStudentByRollNumber = async (rollNumber: string): Promise<Student> => {
  const encoded = encodeURIComponent(rollNumber.trim());
  const response = await api.get<Student>(`/students/${encoded}`);
  return response.data;
};

export const createStudent = async (payload: StudentFormPayload): Promise<Student> => {
  const response = await api.post<Student>("/students", {
    id: createStudentId(),
    rollNumber: payload.rollNumber,
    name: payload.name,
    gender: payload.gender,
    batch: payload.batch,
    program: payload.program,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    address: "Not Provided",
    remarks: payload.remarks,
    status: "Active"
  });
  return response.data;
};

export const bulkUploadStudents = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post("/students/bulk-upload", formData);
  return response.data as { successCount: number; failureCount: number; errors: string[] };
};
