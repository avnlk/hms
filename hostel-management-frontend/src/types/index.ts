export type AllocationStatus = "ALLOTTED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

export type EventType = "ALLOTMENT" | "DEALLOTMENT" | "CHECKIN" | "CHECKOUT";
export type BedStatus = "VACANT" | "OCCUPIED";

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  gender: string;
  batch: string;
  program: string;
  email: string;
  phoneNumber: string;
  address: string;
  remarks?: string;
  status: string;
}

export interface Hostel {
  id: string;
  name: string;
  bhavanAs: Bhavana[];
}

export interface Bhavana {
  bhavanaId: string;
  name: string;
  blocks: Block[];
}

export interface Block {
  blockId: string;
  floors: Floor[];
}

export interface Floor {
  floorId: string;
  floorNumber: string;
  rooms: Room[];
}

export interface Room {
  roomId: string;
  roomNumber?: string;
  type: number;
  beds: Bed[];
}

export interface Bed {
  bedId: string;
  bedName?: string;
  status: BedStatus;
}

export interface AllocationCheckAction {
  dateTime?: string;
  remarks?: string;
}

export interface Allocation {
  id: string;
  studentId: string;
  hostelId: string;
  blockId: string;
  floorNumber: string;
  roomId: string;
  bedId: string;
  status: AllocationStatus;
  expectedCheckInDate: string;
  startDate: string;
  endDate: string;
  checkIn: AllocationCheckAction;
  checkOut: AllocationCheckAction;
  createdAt: string;
}

export interface Event {
  id: string;
  allocationId: string;
  studentId: string;
  hostelId: string;
  blockId: string;
  floorNumber: string;
  roomId: string;
  bedId: string;
  type: EventType;
  timestamp: string;
  remarks?: string;
  performedBy: string;
}
