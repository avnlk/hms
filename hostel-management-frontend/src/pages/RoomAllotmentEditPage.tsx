import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Spin, Tag, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  type AllocationListItem,
  type AllocationStatus,
  getAllocationById
} from "../services/allocationService";

const statusTag = (status: AllocationStatus) => {
  switch (status) {
    case "ALLOTTED":
      return <Tag color="blue">ALLOTTED</Tag>;
    case "CHECKED_IN":
      return <Tag color="green">CHECKED_IN</Tag>;
    case "CHECKED_OUT":
      return <Tag color="default">CHECKED_OUT</Tag>;
    case "CANCELLED":
      return <Tag color="red">CANCELLED</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const formatDate = (value: string | null) => (value ? dayjs(value).format("DD-MM-YYYY") : "—");

const RoomAllotmentEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [allocation, setAllocation] = useState<AllocationListItem | null>(null);

  useEffect(() => {
    if (!id) {
      message.error("Allocation id is missing.");
      navigate("/room-allotment", { replace: true });
      return;
    }
    setLoading(true);
    void getAllocationById(id)
      .then((data) => setAllocation(data))
      .catch(() => message.error("Failed to load allocation details."))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  return (
    <Card
      bordered={false}
      title="Room Allotment / Edit"
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/room-allotment")}>
          Back
        </Button>
      }
    >
      {loading ? (
        <div style={{ padding: "24px 0", textAlign: "center" }}>
          <Spin />
        </div>
      ) : (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Roll No">{allocation?.rollNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="Room No">{allocation?.roomId || "—"}</Descriptions.Item>
          <Descriptions.Item label="Student Name">{allocation?.name || "—"}</Descriptions.Item>
          <Descriptions.Item label="Hostel">{allocation?.hostelId || "—"}</Descriptions.Item>
          <Descriptions.Item label="Program">{allocation?.program || "—"}</Descriptions.Item>
          <Descriptions.Item label="Block">{allocation?.blockId || "—"}</Descriptions.Item>
          <Descriptions.Item label="Batch">{allocation?.batch || "—"}</Descriptions.Item>
          <Descriptions.Item label="Floor">{allocation?.floorNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="Email">{allocation?.email || "—"}</Descriptions.Item>
          <Descriptions.Item label="Expected Check-in Date">
            {formatDate(allocation?.expectedCheckInDate ?? null)}
          </Descriptions.Item>
          <Descriptions.Item label="Mobile">{allocation?.phoneNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="Status">
            {allocation?.status ? statusTag(allocation.status) : "—"}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default RoomAllotmentEditPage;
