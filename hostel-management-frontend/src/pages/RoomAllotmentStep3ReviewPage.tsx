import { HomeOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAllocation } from "../services/allocationService";
import { useAllotmentStore } from "../store/allotmentStore";
import "./room-allotment-step3.css";
import "./room-allotment-wizard.css";

const formatRoomTypeLabel = (type: number | null): string => {
  const n = Number(type) || 0;
  return `${n} Bedded Bunker`;
};

const RoomAllotmentStep3ReviewPage = () => {
  const navigate = useNavigate();
  const student = useAllotmentStore((s) => s.student);
  const expectedCheckInDate = useAllotmentStore((s) => s.expectedCheckInDate);
  const remarks = useAllotmentStore((s) => s.remarks);
  const hostelId = useAllotmentStore((s) => s.hostelId);
  const bhavanaId = useAllotmentStore((s) => s.bhavanaId);
  const blockId = useAllotmentStore((s) => s.blockId);
  const floorNumber = useAllotmentStore((s) => s.floorNumber);
  const roomId = useAllotmentStore((s) => s.roomId);
  const bedId = useAllotmentStore((s) => s.bedId);
  const roomNumber = useAllotmentStore((s) => s.roomNumber);
  const bedName = useAllotmentStore((s) => s.bedName);
  const tagH = useAllotmentStore((s) => s.tagH);
  const tagB = useAllotmentStore((s) => s.tagB);
  const tagFloor = useAllotmentStore((s) => s.tagFloor);
  const roomType = useAllotmentStore((s) => s.roomType);
  const reset = useAllotmentStore((s) => s.reset);

  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (!student || !expectedCheckInDate) {
      navigate("/room-allotment/new", { replace: true });
      return;
    }
    if (
      !hostelId ||
      !bhavanaId ||
      !blockId ||
      !floorNumber ||
      !roomId ||
      !bedId ||
      !tagH ||
      !tagB ||
      !tagFloor
    ) {
      navigate("/room-allotment/new/select-room", { replace: true });
    }
  }, [
    student,
    expectedCheckInDate,
    hostelId,
    bhavanaId,
    blockId,
    floorNumber,
    roomId,
    bedId,
    tagH,
    tagB,
    tagFloor,
    navigate
  ]);

  const onCancel = () => {
    navigate("/room-allotment/new/select-room");
  };

  const onConfirmBooking = async () => {
    if (!student || !expectedCheckInDate || !hostelId || !bhavanaId || !blockId || !floorNumber || !roomId || !bedId) {
      message.error("Missing booking data.");
      return;
    }
    const expected = new Date(expectedCheckInDate);
    const startDate = expected.toISOString();
    const end = new Date(expected);
    end.setUTCFullYear(end.getUTCFullYear() + 1);
    const endDate = end.toISOString();

    setConfirmLoading(true);
    try {
      await createAllocation({
        studentId: student.id,
        hostelId,
        bhavanaId,
        blockId,
        floorNumber,
        roomId,
        bedId,
        expectedCheckInDate,
        startDate,
        endDate,
        remarks: remarks ?? undefined
      });
      message.success("Room booking confirmed.");
      reset();
      navigate("/room-allotment");
    } catch {
      message.error("Failed to confirm booking.");
    } finally {
      setConfirmLoading(false);
    }
  };

  if (
    !student ||
    !expectedCheckInDate ||
    !hostelId ||
    !bhavanaId ||
    !blockId ||
    !floorNumber ||
    !roomId ||
    !bedId ||
    !tagH ||
    !tagB ||
    !tagFloor
  ) {
    return null;
  }

  const displayRoomNumber = (roomNumber && roomNumber.trim() !== "") ? roomNumber : roomId;

  return (
    <div className="room-allotment-wizard-step-body room-allotment-review">
      <div className="room-allotment-review-card">
        <div className="room-allotment-review-card-head">Review Summary</div>
        <div className="room-allotment-review-card-body">
          <div className="room-allotment-review-student">
            {student.name} | {student.rollNumber}
          </div>
          <div className="room-allotment-review-tags">
            <span className="room-allotment-review-tag room-allotment-review-tag-blue">
              <HomeOutlined aria-hidden />
              {tagH}
            </span>
            <span className="room-allotment-review-tag room-allotment-review-tag-blue">
              <HomeOutlined aria-hidden />
              {tagB}
            </span>
            <span className="room-allotment-review-tag room-allotment-review-tag-blue">
              <HomeOutlined aria-hidden />
              {tagFloor}
            </span>
            <span className="room-allotment-review-tag room-allotment-review-tag-green">
              <HomeOutlined aria-hidden />
              Room No. {displayRoomNumber}
            </span>
            <span className="room-allotment-review-room-type">
              <HomeOutlined aria-hidden />
              {formatRoomTypeLabel(roomType)}
            </span>
          </div>
          <div className="room-allotment-review-bed-box">
            <HomeOutlined aria-hidden />
            {bedName ?? "—"}
          </div>
        </div>
      </div>
      <div className="room-allotment-review-actions">
        <Button className="room-allotment-review-btn-cancel" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="primary"
          className="room-allotment-review-btn-confirm"
          loading={confirmLoading}
          onClick={() => void onConfirmBooking()}
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  );
};

export default RoomAllotmentStep3ReviewPage;
