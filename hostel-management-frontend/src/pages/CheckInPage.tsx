import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, message } from "antd";
import { useState } from "react";
import { useStudentLookup } from "../hooks/useStudentLookup";
import { performCheckIn } from "../services/checkService";
import "./check-in-page.css";
import "./room-allotment-list.css";

const CheckInPage = () => {
  const [form] = Form.useForm<{
    rollNumber: string;
    name: string;
    program: string;
    batch: string;
    email: string;
    phoneNumber: string;
    allocatedRoom: string;
    expectedCheckInDate: string;
    remarks?: string;
  }>();
  const { preview, searchLoading, searchByRoll, resetPreview } = useStudentLookup("checkin");
  const [submitLoading, setSubmitLoading] = useState(false);

  const onCheckIn = async () => {
    const rollNumber = (form.getFieldValue("rollNumber") as string | undefined)?.trim() ?? "";
    if (!rollNumber || !preview || preview.student.rollNumber !== rollNumber) {
      message.error("Please search and load a student by roll number.");
      return;
    }
    setSubmitLoading(true);
    try {
      const remarks = form.getFieldValue("remarks") as string | undefined;
      await performCheckIn({
        rollNumber,
        remarks: remarks?.trim() || undefined
      });
      message.success("Check-in completed.");
      form.resetFields();
      resetPreview();
    } catch {
      message.error("Check-in failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="room-allotment-page check-in-page">
      <div className="room-allotment-card">
        <Form form={form} layout="vertical" className="check-in-form" requiredMark={false}>
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}>
              <Form.Item label="Roll Number" name="rollNumber" rules={[{ required: true, message: "Enter roll number" }]}>
                <Input
                  placeholder="Roll Number"
                  suffix={
                    <Button
                      type="text"
                      style={{ padding: "0 4px", height: 22, color: "#1890ff" }}
                      icon={<SearchOutlined />}
                      loading={searchLoading}
                      onClick={() => void searchByRoll(form)}
                    />
                  }
                />
              </Form.Item>
              <Form.Item label="Student Name" name="name">
                <Input placeholder="Student Name" disabled className="check-in-readonly" />
              </Form.Item>
              <Form.Item label="Program" name="program">
                <Input placeholder="Program" disabled className="check-in-readonly" />
              </Form.Item>
              <Form.Item label="Batch" name="batch">
                <Input placeholder="Batch" disabled className="check-in-readonly" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input placeholder="Email" disabled className="check-in-readonly" />
              </Form.Item>
              <Form.Item label="Mobile" name="phoneNumber">
                <Input placeholder="Mobile" disabled className="check-in-readonly" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item label="Allocated Room" name="allocatedRoom">
                <Input placeholder="Allocated Room" disabled className="check-in-readonly" />
              </Form.Item>
              <Form.Item label="Expected Check in Date" name="expectedCheckInDate">
                <Input placeholder="Expected Check in Date" disabled className="check-in-readonly" />
              </Form.Item>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea rows={5} placeholder="Remarks" />
              </Form.Item>
              <div className="check-in-submit-wrap">
                <Button type="primary" className="check-in-submit-btn" loading={submitLoading} onClick={() => void onCheckIn()}>
                  Check In
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default CheckInPage;
