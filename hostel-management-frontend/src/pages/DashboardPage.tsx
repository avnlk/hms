import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  HomeOutlined,
  HourglassOutlined,
  InboxOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Progress, Row, Spin, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect } from "react";
import { getDashboardStats, type OccupancyByHostelDto } from "../services/dashboardService";
import "./dashboard-page.css";

const PRIMARY = "#1890ff";

const REFETCH_MS = 60_000;

const DashboardPage = () => {
  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    refetchInterval: REFETCH_MS
  });

  useEffect(() => {
    if (isError) {
      message.error("Failed to load dashboard stats.");
    }
  }, [isError, error]);

  const occupancyColumns: ColumnsType<OccupancyByHostelDto> = [
    { title: "Hostel", dataIndex: "hostelName", key: "hostelName", ellipsis: true },
    {
      title: "Total beds",
      dataIndex: "totalBeds",
      key: "totalBeds",
      width: 100,
      align: "right"
    },
    {
      title: "Occupied beds",
      dataIndex: "occupiedBeds",
      key: "occupiedBeds",
      width: 110,
      align: "right"
    },
    {
      title: "Occupancy",
      key: "occupancy",
      width: 220,
      render: (_value, record) => (
        <Progress
          percent={record.occupancyPercent}
          size="small"
          strokeColor={PRIMARY}
          trailColor="#e6f7ff"
          format={(pct) => `${pct ?? 0}%`}
        />
      )
    }
  ];

  if (isPending && !data) {
    return (
      <div className="dashboard-page" style={{ display: "flex", justifyContent: "center", paddingTop: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-inner">
        <Row gutter={[10, 10]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="dashboard-stat-card"
              title={
                <span>
                  <TeamOutlined />
                  Total Students
                </span>
              }
            >
              <div className="dashboard-stat-value">{data?.totalStudents ?? "—"}</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="dashboard-stat-card"
              title={
                <span>
                  <HomeOutlined />
                  Total Beds
                </span>
              }
            >
              <div className="dashboard-stat-value">{data?.totalBeds ?? "—"}</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="dashboard-stat-card"
              title={
                <span>
                  <UserOutlined />
                  Occupied Beds
                </span>
              }
            >
              <div className="dashboard-stat-value">{data?.occupiedBeds ?? "—"}</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="dashboard-stat-card"
              title={
                <span>
                  <InboxOutlined />
                  Vacant Beds
                </span>
              }
            >
              <div className="dashboard-stat-value">{data?.vacantBeds ?? "—"}</div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className="dashboard-stat-card"
              title={
                <span>
                  <CheckCircleOutlined />
                  Currently Checked In
                </span>
              }
            >
              <div className="dashboard-stat-value">{data?.currentlyCheckedIn ?? "—"}</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className="dashboard-stat-card"
              title={
                <span>
                  <HourglassOutlined />
                  Allotted Pending
                </span>
              }
            >
              <div className="dashboard-stat-value">{data?.allotted ?? "—"}</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className="dashboard-stat-card"
              title={
                <span>
                  <ExportOutlined />
                  Checked Out Today
                </span>
              }
            >
              <div className="dashboard-stat-value">{data?.checkedOutToday ?? "—"}</div>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 14 }}>
          <div className="dashboard-section-title">
            <h3>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              Occupancy by Hostel
            </h3>
          </div>
          <Table<OccupancyByHostelDto>
            rowKey={(row) => `${row.hostelName}-${row.totalBeds}`}
            size="small"
            loading={isFetching}
            dataSource={data?.occupancyByHostel ?? []}
            columns={occupancyColumns}
            pagination={false}
            className="dashboard-occupancy-table"
            locale={{ emptyText: "No hostel data" }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
