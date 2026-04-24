import { DownloadOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRangeFilter, type DateRangeValue } from "../components/DateRangeFilter";
import {
  type PresentOccupancyRow,
  exportPresentOccupancyBlob,
  getPresentOccupancy,
  saveBlobAsFile
} from "../services/reportService";
import "./room-allotment-list.css";

const PAGE_SIZE = 10;

function rowMatchesSearch(row: PresentOccupancyRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const fields = [
    row.rollNo,
    row.name,
    row.roomNo,
    row.block,
    row.floor,
    row.roomType,
    row.degree,
    row.emailAddress,
    row.mobile,
    row.remark,
    row.checkIn
  ];
  return fields.some((f) => (f || "").toLowerCase().includes(q));
}

const PresentOccupancyPage = () => {
  const [range, setRange] = useState<DateRangeValue>(() => [dayjs().startOf("month"), dayjs().endOf("month")]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(PAGE_SIZE);
  const [rows, setRows] = useState<PresentOccupancyRow[]>([]);
  const [total, setTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const load = useCallback(async () => {
    if (!range[0] || !range[1]) {
      return;
    }
    setTableLoading(true);
    try {
      const data = await getPresentOccupancy(range[0], range[1], page - 1, size);
      setRows(data.content);
      setTotal(data.totalElements);
    } catch {
      message.error("Failed to load present occupancy.");
    } finally {
      setTableLoading(false);
    }
  }, [range, page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(
    () => rows.filter((row) => rowMatchesSearch(row, debouncedSearch)),
    [rows, debouncedSearch]
  );

  const columns: ColumnsType<PresentOccupancyRow> = [
    { title: "S.No.", dataIndex: "serialNo", key: "serialNo", width: 48 },
    { title: "Floor", dataIndex: "floor", key: "floor", width: 44 },
    { title: "Block", dataIndex: "block", key: "block", width: 72, ellipsis: true },
    { title: "Room Type", dataIndex: "roomType", key: "roomType", width: 72 },
    {
      title: "Room No.",
      key: "roomNo",
      width: 64,
      render: (_value, record: PresentOccupancyRow) =>
        record.roomNo && record.roomNo.trim() !== "" ? record.roomNo : "—"
    },
    { title: "Roll No.", dataIndex: "rollNo", key: "rollNo", width: 88, ellipsis: true },
    { title: "Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Degree", dataIndex: "degree", key: "degree", width: 80, ellipsis: true },
    {
      title: "Email Address",
      dataIndex: "emailAddress",
      key: "emailAddress",
      ellipsis: true,
      render: (value: string) =>
        value ? (
          <a href={`mailto:${value}`} style={{ color: "#1890ff" }}>
            {value}
          </a>
        ) : (
          ""
        )
    },
    { title: "Mobile", dataIndex: "mobile", key: "mobile", width: 88 },
    { title: "Check In", dataIndex: "checkIn", key: "checkIn", width: 88 },
    { title: "Remark", dataIndex: "remark", key: "remark", ellipsis: true }
  ];

  const onDownload = async () => {
    if (!range[0] || !range[1]) {
      message.error("Select a date range.");
      return;
    }
    setDownloadLoading(true);
    try {
      const blob = await exportPresentOccupancyBlob(range[0], range[1]);
      saveBlobAsFile(blob, "present-occupancy.xlsx");
    } catch {
      message.error("Failed to download report.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="room-allotment-page">
      <div className="room-allotment-card">
        <div className="room-allotment-toolbar">
          <div className="room-allotment-toolbar-left">
            <DateRangeFilter
              value={range}
              onChange={(next) => {
                if (next) {
                  setRange(next);
                  setPage(1);
                }
              }}
            />
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              loading={downloadLoading}
              className="room-allotment-allot-btn"
              onClick={() => void onDownload()}
            >
              Download
            </Button>
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
        </div>

        <Table<PresentOccupancyRow>
          rowKey={(record, index) => `${page}-${index}-${record.serialNo}-${record.rollNo}-${record.roomNo}`}
          size="small"
          loading={tableLoading}
          dataSource={filteredRows}
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

export default PresentOccupancyPage;
