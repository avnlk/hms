import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, Row, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAllotmentStore } from "../store/allotmentStore";
import { getStudentByRollNumber } from "../services/studentService";
import "./room-allotment-wizard.css";

type Step1FormValues = {
  rollNumber: string;
  name: string;
  program: string;
  batch: string;
  email: string;
  phoneNumber: string;
  expectedCheckInDate: Dayjs;
  remarks?: string;
};

const RoomAllotmentStep1StudentPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<Step1FormValues>();
  const student = useAllotmentStore((s) => s.student);
  const expectedCheckInDate = useAllotmentStore((s) => s.expectedCheckInDate);
  const setStudent = useAllotmentStore((s) => s.setStudent);
  const setExpectedCheckInDate = useAllotmentStore((s) => s.setExpectedCheckInDate);
  const setRemarks = useAllotmentStore((s) => s.setRemarks);
  const [searchLoading, setSearchLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);

  useEffect(() => {
    if (student) {
      form.setFieldsValue({
        rollNumber: student.rollNumber,
        name: student.name,
        program: student.program,
        batch: student.batch,
        email: student.email,
        phoneNumber: student.phoneNumber,
        expectedCheckInDate: expectedCheckInDate ? dayjs(expectedCheckInDate) : undefined
      });
    }
  }, [student, expectedCheckInDate, form]);

  const runRollSearch = async () => {
    const roll = form.getFieldValue("rollNumber") as string | undefined;
    const trimmed = roll?.trim() ?? "";
    if (!trimmed) {
      message.error("Please enter a roll number.");
      return;
    }
    setSearchLoading(true);
    try {
      const data = await getStudentByRollNumber(trimmed);
      setStudent(data);
      form.setFieldsValue({
        rollNumber: data.rollNumber,
        name: data.name,
        program: data.program,
        batch: data.batch,
        email: data.email,
        phoneNumber: data.phoneNumber
      });
    } catch {
      message.error("Student not found or failed to load.");
      setStudent(null);
      form.setFieldsValue({
        name: "",
        program: "",
        batch: "",
        email: "",
        phoneNumber: ""
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const onNext = async () => {
    setNextLoading(true);
    try {
      const values = await form.validateFields();
      const trimmedRoll = values.rollNumber?.trim() ?? "";
      const loaded = useAllotmentStore.getState().student;
      if (!loaded || loaded.rollNumber !== trimmedRoll) {
        message.error("Please search and load a student by roll number.");
        return;
      }
      setExpectedCheckInDate(values.expectedCheckInDate.toISOString());
      setRemarks(values.remarks?.trim() ? values.remarks.trim() : null);
      navigate("/room-allotment/new/select-room");
    } catch {
      /* validation errors — antd handles */
    } finally {
      setNextLoading(false);
    }
  };

  return (
    <div className="room-allotment-wizard-step-body">
      <Form form={form} layout="vertical" className="room-allotment-wizard-form" requiredMark={false}>
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={12}>
            <Form.Item label="Roll Number" name="rollNumber" rules={[{ required: true, message: "Enter roll number" }]}>
              <Input
                placeholder="Roll Number"
                suffix={
                  <Button
                    type="text"
                    className="room-allotment-roll-search-btn"
                    icon={<SearchOutlined />}
                    loading={searchLoading}
                    onClick={() => void runRollSearch()}
                  />
                }
              />
            </Form.Item>
            <Form.Item label="Student Name" name="name">
              <Input placeholder="Student Name" disabled className="room-allotment-wizard-readonly" />
            </Form.Item>
            <Form.Item label="Program" name="program">
              <Input placeholder="Program" disabled className="room-allotment-wizard-readonly" />
            </Form.Item>
            <Form.Item label="Batch" name="batch">
              <Input placeholder="Batch" disabled className="room-allotment-wizard-readonly" />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input placeholder="Email" disabled className="room-allotment-wizard-readonly" />
            </Form.Item>
            <Form.Item label="Mobile" name="phoneNumber">
              <Input placeholder="Mobile" disabled className="room-allotment-wizard-readonly" />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item
              label={
                <span>
                  Expected Check In Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              name="expectedCheckInDate"
              rules={[{ required: true, message: "Select expected check-in date" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" placeholder="Select date" />
            </Form.Item>
            <Form.Item label="Remarks" name="remarks">
              <Input.TextArea rows={4} placeholder="Remarks" />
            </Form.Item>
            <div className="room-allotment-wizard-next-wrap">
              <Button type="primary" className="room-allotment-wizard-next-btn" loading={nextLoading} onClick={() => void onNext()}>
                Next
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default RoomAllotmentStep1StudentPage;
