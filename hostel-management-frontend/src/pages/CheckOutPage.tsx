import { SearchOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, Input, Row, message } from "antd";
import { useState } from "react";
import { useStudentLookup } from "../hooks/useStudentLookup";
import { performCheckOut } from "../services/checkService";
import "./check-out-page.css";
import "./room-allotment-list.css";

const buildCheckoutRemarks = (remarks?: string, shift?: boolean, shiftRemarks?: string): string | undefined => {
  const parts: string[] = [];
  if (remarks?.trim()) {
    parts.push(remarks.trim());
  }
  if (shift) {
    parts.push("Shift");
  }
  if (shiftRemarks?.trim()) {
    parts.push(shiftRemarks.trim());
  }
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join("\n");
};

const CheckOutPage = () => {
  const [form] = Form.useForm<{
    rollNumber: string;
    name: string;
    program: string;
    batch: string;
    email: string;
    phoneNumber: string;
    roomNumber: string;
    checkInDate: string;
    remarks?: string;
    shift?: boolean;
    shiftRemarks?: string;
  }>();
  const { preview, searchLoading, searchByRoll, resetPreview } = useStudentLookup("checkout");
  const [submitLoading, setSubmitLoading] = useState(false);

  const onCheckOut = async () => {
    const rollNumber = (form.getFieldValue("rollNumber") as string | undefined)?.trim() ?? "";
    if (!rollNumber || !preview || preview.student.rollNumber !== rollNumber) {
      message.error("Please search and load a student by roll number.");
      return;
    }
    setSubmitLoading(true);
    try {
      const remarks = form.getFieldValue("remarks") as string | undefined;
      const shift = form.getFieldValue("shift") as boolean | undefined;
      const shiftRemarks = form.getFieldValue("shiftRemarks") as string | undefined;
      await performCheckOut({
        rollNumber,
        remarks: buildCheckoutRemarks(remarks, shift, shiftRemarks)
      });
      message.success("Check-out completed.");
      form.resetFields();
      resetPreview();
    } catch {
      message.error("Check-out failed.");
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
              <Form.Item label="Room Number" name="roomNumber">
                <Input placeholder="Room Number" disabled className="check-in-readonly" />
              </Form.Item>
              <Form.Item label="Check in Date" name="checkInDate">
                <Input placeholder="Check in Date" disabled className="check-in-readonly" />
              </Form.Item>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea rows={5} placeholder="Remarks" />
              </Form.Item>
              <div className="check-out-shift-row">
                <Form.Item name="shift" valuePropName="checked" className="check-out-shift-check">
                  <Checkbox>Shift</Checkbox>
                </Form.Item>
                <Form.Item name="shiftRemarks" className="check-out-shift-remarks">
                  <Input.TextArea rows={2} placeholder="Remarks" />
                </Form.Item>
              </div>
              <div className="check-in-submit-wrap">
                <Button type="primary" className="check-in-submit-btn" loading={submitLoading} onClick={() => void onCheckOut()}>
                  Check Out
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default CheckOutPage;
