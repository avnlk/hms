import { EditOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  type AllocationListItem,
  type AllocationStatus,
  getAllocations
} from "../services/allocationService";
import "./room-allotment-list.css";

const PAGE_SIZE = 10;

const statusLabel = (status: AllocationStatus): string => {
  switch (status) {
    case "ALLOTTED":
      return "Allotted";
    case "CHECKED_IN":
      return "Checked In";
    case "CHECKED_OUT":
      return "Checked Out";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

const RoomAllotmentListPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(PAGE_SIZE);
  const [rows, setRows] = useState<AllocationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  const load = useCallback(async () => {
    setTableLoading(true);
    try {
      const data = await getAllocations(debouncedSearch.trim(), page - 1, size);
      setRows(data.content);
      setTotal(data.totalElements);
    } catch {
      message.error("Failed to load allocations.");
    } finally {
      setTableLoading(false);
    }
  }, [debouncedSearch, page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: ColumnsType<AllocationListItem> = [
    {
      title: "S.No.",
      key: "sno",
      width: 52,
      render: (_value, _record, index) => (page - 1) * size + index + 1
    },
    { title: "Roll No.", dataIndex: "rollNumber", key: "rollNumber", width: 88 },
    { title: "Student Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Program", dataIndex: "program", key: "program", width: 72 },
    { title: "Batch", dataIndex: "batch", key: "batch", width: 56 },
    { title: "Email", dataIndex: "email", key: "email", ellipsis: true },
    { title: "Mobile", dataIndex: "phoneNumber", key: "phoneNumber", width: 96 },
    {
      title: "Room Booking",
      key: "roomBooking",
      width: 100,
      render: (_value, record) =>
        record.status ? (
          <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
            {statusLabel(record.status)}
          </Tag>
        ) : null
    },
    {
      title: "Expected Check-in Date",
      key: "expectedCheckInDate",
      width: 130,
      render: (_value, record) =>
        record.expectedCheckInDate
          ? dayjs(record.expectedCheckInDate).format("DD-MM-YYYY")
          : ""
    },
    { title: "Room No.", dataIndex: "roomId", key: "roomId", width: 72 },
    {
      title: "Action",
      key: "action",
      width: 56,
      align: "center",
      render: (_value, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          className="room-allotment-action-btn"
          aria-label="Edit"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/room-allotment/edit/${record.id}`);
          }}
        />
      )
    }
  ];

  return (
    <div className="room-allotment-page">
      <div className="room-allotment-card">
        <div className="room-allotment-header">
          <h3>Room Allotment</h3>
        </div>

        <div className="room-allotment-toolbar">
          <div className="room-allotment-toolbar-left">
            <Input
              size="small"
              placeholder="Search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="room-allotment-search"
            />
            <Space size={6}>
              <Button
                size="small"
                type="primary"
                icon={<SearchOutlined />}
                className="room-allotment-icon-btn"
                onClick={() => {
                  setDebouncedSearch(searchText.trim());
                  setPage(1);
                }}
              />
              <Button
                size="small"
                type="primary"
                icon={<ReloadOutlined />}
                className="room-allotment-icon-btn"
                onClick={() => {
                  setSearchText("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
              />
            </Space>
          </div>
          <Link to="/room-allotment/new">
            <Button type="primary" className="room-allotment-allot-btn">
              Allot Room
            </Button>
          </Link>
        </div>

        <Table<AllocationListItem>
          rowKey="id"
          size="small"
          loading={tableLoading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: false,
            position: ["bottomRight"]
          }}
          onChange={(pagination) => {
            setPage(pagination.current ?? 1);
          }}
          className="room-allotment-table"
        />
      </div>
    </div>
  );
};

export default RoomAllotmentListPage;
