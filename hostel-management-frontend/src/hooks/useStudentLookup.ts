import type { FormInstance } from "antd/es/form";
import { message } from "antd";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { getCheckInPreview, getCheckOutPreview, type CheckPreviewDto } from "../services/checkService";

export type StudentLookupMode = "checkin" | "checkout";

export const roomDisplayForAllocated = (roomId: string): string => {
  const trimmed = roomId?.trim() ?? "";
  if (!trimmed) {
    return "—";
  }
  const parts = trimmed.split("-");
  const last = parts[parts.length - 1];
  return /^\d+$/.test(last) ? last : trimmed;
};

export function useStudentLookup(mode: StudentLookupMode) {
  const [preview, setPreview] = useState<CheckPreviewDto | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchByRoll = useCallback(
    async (form: FormInstance) => {
      const roll = (form.getFieldValue("rollNumber") as string | undefined)?.trim() ?? "";
      if (!roll) {
        message.error("Please enter a roll number.");
        return;
      }
      setSearchLoading(true);
      try {
        const data = mode === "checkin" ? await getCheckInPreview(roll) : await getCheckOutPreview(roll);
        setPreview(data);
        const roomSuffix = roomDisplayForAllocated(data.allocation.roomId);
        const roomText = `R - ${roomSuffix}`;
        const base = {
          rollNumber: data.student.rollNumber,
          name: data.student.name,
          program: data.student.program,
          batch: data.student.batch,
          email: data.student.email,
          phoneNumber: data.student.phoneNumber
        };
        if (mode === "checkin") {
          form.setFieldsValue({
            ...base,
            allocatedRoom: roomText,
            expectedCheckInDate: data.allocation.expectedCheckInDate
              ? dayjs(data.allocation.expectedCheckInDate).format("DD-MM-YYYY")
              : ""
          });
        } else {
          const checkInSrc = data.allocation.startDate || data.allocation.checkIn?.dateTime;
          form.setFieldsValue({
            ...base,
            roomNumber: roomText,
            checkInDate: checkInSrc ? dayjs(checkInSrc).format("DD-MM-YYYY") : "",
            remarks: "",
            shift: false,
            shiftRemarks: ""
          });
        }
      } catch {
        message.error(
          mode === "checkin"
            ? "Could not load check-in details for this roll number."
            : "Could not load check-out details for this roll number."
        );
        setPreview(null);
        if (mode === "checkin") {
          form.setFieldsValue({
            name: "",
            program: "",
            batch: "",
            email: "",
            phoneNumber: "",
            allocatedRoom: "",
            expectedCheckInDate: ""
          });
        } else {
          form.setFieldsValue({
            name: "",
            program: "",
            batch: "",
            email: "",
            phoneNumber: "",
            roomNumber: "",
            checkInDate: "",
            remarks: "",
            shift: false,
            shiftRemarks: ""
          });
        }
      } finally {
        setSearchLoading(false);
      }
    },
    [mode]
  );

  const resetPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return { preview, searchLoading, searchByRoll, resetPreview };
}
