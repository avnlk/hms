import { DownloadOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRangeFilter, type DateRangeValue } from "../components/DateRangeFilter";
import {
  type VacatedListRow,
  exportVacatedListBlob,
  getVacatedList,
  saveBlobAsFile
} from "../services/reportService";
import "./room-allotment-list.css";

const PAGE_SIZE = 10;

function rowMatchesSearch(row: VacatedListRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const fields = [
    row.dateOfVacation,
    row.shiftVacate,
    row.ifShiftingRoomNo,
    row.remarkCheckOut,
    row.block,
    row.roomType,
    row.fromRoomNo,
    row.rollNo,
    row.name,
    row.degree,
    row.emailAddress,
    row.mobileNo,
    row.checkIn,
    row.remarkCheckIn
  ];
  return fields.some((f) => (f || "").toLowerCase().includes(q));
}

const VacatedListPage = () => {
  const [range, setRange] = useState<DateRangeValue>(() => [dayjs().startOf("month"), dayjs().endOf("month")]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(PAGE_SIZE);
  const [rows, setRows] = useState<VacatedListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const load = useCallback(async () => {
    if (!range[0] || !range[1]) {
      return;
    }
    setTableLoading(true);
    try {
      const data = await getVacatedList(range[0], range[1], page - 1, size);
      setRows(data.content);
      setTotal(data.totalElements);
    } catch {
      message.error("Failed to load vacated list.");
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

  const columns: ColumnsType<VacatedListRow> = [
    { title: "Date of Vacation", dataIndex: "dateOfVacation", key: "dateOfVacation", width: 110 },
    { title: "Shift/ Vacate", dataIndex: "shiftVacate", key: "shiftVacate", width: 96 },
    {
      title: "If Shifting, Room No.",
      dataIndex: "ifShiftingRoomNo",
      key: "ifShiftingRoomNo",
      width: 120
    },
    { title: "Remark Check out", dataIndex: "remarkCheckOut", key: "remarkCheckOut", ellipsis: true },
    { title: "Block", dataIndex: "block", key: "block", width: 80, ellipsis: true },
    { title: "Room Type", dataIndex: "roomType", key: "roomType", width: 72 },
    {
      title: "From Room No.",
      key: "fromRoomNo",
      dataIndex: "fromRoomNo",
      width: 88,
      render: (_value, record: VacatedListRow) => record.fromRoomNo ?? ""
    },
    { title: "Roll No.", dataIndex: "rollNo", key: "rollNo", width: 88, ellipsis: true },
    { title: "Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Degree", dataIndex: "degree", key: "degree", width: 80, ellipsis: true },
    {
      title: "E-Mail Address",
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
    { title: "Mobile No.", dataIndex: "mobileNo", key: "mobileNo", width: 96 },
    { title: "Check In", dataIndex: "checkIn", key: "checkIn", width: 88 },
    { title: "Remark Check IN", dataIndex: "remarkCheckIn", key: "remarkCheckIn", ellipsis: true }
  ];

  const onDownload = async () => {
    if (!range[0] || !range[1]) {
      message.error("Select a date range.");
      return;
    }
    setDownloadLoading(true);
    try {
      const blob = await exportVacatedListBlob(range[0], range[1]);
      saveBlobAsFile(blob, "vacated-list.xlsx");
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

        <Table<VacatedListRow>
          rowKey={(record, index) =>
            `${page}-${index}-${record.rollNo}-${record.fromRoomNo}-${record.dateOfVacation}`
          }
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

export default VacatedListPage;
