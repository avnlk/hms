import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Select,
  Space,
  Table,
  Upload
} from "antd";
import { ReloadOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Student } from "../types";
import {
  bulkUploadStudents,
  createStudent,
  getStudents,
  type StudentFormPayload
} from "../services/studentService";
import "./student-admin-page.css";

const PAGE_SIZE = 10;

interface StudentFormValues {
  rollNumber: string;
  name: string;
  email: string;
  gender: string;
  program: string;
  batch: string;
  phoneNumber?: string;
  remarks?: string;
}

const StudentAdminPage = () => {
  const [form] = Form.useForm<StudentFormValues>();
  const [apiNotification, contextHolder] = notification.useNotification();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchText.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const loadStudents = async (pageNumber: number, pageSize: number, search: string) => {
    setTableLoading(true);
    try {
      const response = await getStudents(search, pageNumber - 1, pageSize);
      setStudents(response.content ?? []);
      setTotal(response.totalElements ?? 0);
    } catch (error) {
      message.error("Failed to load students");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents(page, size, debouncedSearch);
  }, [page, size, debouncedSearch]);

  const columns: ColumnsType<Student> = useMemo(
    () => [
      {
        title: "S.No.",
        key: "serial",
        render: (_, __, index) => (page - 1) * size + index + 1,
        width: 64
      },
      { title: "Roll Number", dataIndex: "rollNumber", key: "rollNumber" },
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "Gender", dataIndex: "gender", key: "gender" },
      { title: "Program", dataIndex: "program", key: "program" },
      { title: "Batch", dataIndex: "batch", key: "batch" },
      { title: "Mobile", dataIndex: "phoneNumber", key: "phoneNumber" }
    ],
    [page, size]
  );

  const handleSubmit = async (values: StudentFormValues) => {
    const payload: StudentFormPayload = {
      rollNumber: values.rollNumber,
      name: values.name,
      gender: values.gender,
      batch: values.batch,
      program: values.program,
      email: values.email,
      phoneNumber: values.phoneNumber ?? "",
      remarks: values.remarks
    };
    setSubmitLoading(true);
    try {
      await createStudent(payload);
      apiNotification.success({ message: "Student added successfully" });
      form.resetFields();
      await loadStudents(1, size, debouncedSearch);
      setPage(1);
    } catch (error) {
      message.error("Failed to add student");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!fileList[0]?.originFileObj) {
      message.error("Please select a CSV file");
      return;
    }

    setBulkLoading(true);
    try {
      const response = await bulkUploadStudents(fileList[0].originFileObj);
      apiNotification.success({
        message: "Bulk upload completed",
        description: `Success: ${response.successCount}, Failure: ${response.failureCount}`
      });
      if (response.errors?.length) {
        apiNotification.warning({
          message: "Upload row errors",
          description: response.errors.slice(0, 3).join(" | ")
        });
      }
      setBulkModalOpen(false);
      setFileList([]);
      await loadStudents(page, size, debouncedSearch);
    } catch (error) {
      message.error("Bulk upload failed");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="student-admin-page">
      {contextHolder}
      <div className="student-admin-card">
        <div className="student-admin-header">
          <h3>Add Student Data</h3>
          <Button
            type="primary"
            className="student-admin-bulk-btn"
            onClick={() => setBulkModalOpen(true)}
          >
            Bulk Upload
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="student-admin-form-grid">
            <div>
              <Form.Item name="rollNumber" rules={[{ required: true, message: "Roll Number is required" }]}>
                <Input placeholder="Roll Number*" />
              </Form.Item>
              <Form.Item name="email" rules={[{ required: true, message: "Email is required" }]}>
                <Input placeholder="Email*" />
              </Form.Item>
              <Form.Item name="program" rules={[{ required: true, message: "Program is required" }]}>
                <Input placeholder="Program*" />
              </Form.Item>
              <Form.Item name="phoneNumber">
                <Input placeholder="Mobile" />
              </Form.Item>
            </div>
            <div>
              <Form.Item name="name" rules={[{ required: true, message: "Name is required" }]}>
                <Input placeholder="Name*" />
              </Form.Item>
              <Form.Item name="gender" rules={[{ required: true, message: "Gender is required" }]}>
                <Select
                  placeholder="Gender*"
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" }
                  ]}
                />
              </Form.Item>
              <Form.Item name="batch" rules={[{ required: true, message: "Batch is required" }]}>
                <Select
                  placeholder="Batch*"
                  options={[
                    { value: "2022", label: "2022" },
                    { value: "2023", label: "2023" },
                    { value: "2024", label: "2024" },
                    { value: "2025", label: "2025" }
                  ]}
                />
              </Form.Item>
              <Form.Item name="remarks">
                <Input.TextArea placeholder="Remarks" rows={2} />
              </Form.Item>
            </div>
          </div>
          <div className="student-admin-submit-wrap">
            <Button type="primary" htmlType="submit" loading={submitLoading} className="student-admin-submit">
              Submit
            </Button>
          </div>
        </Form>

        <div className="student-admin-table-toolbar">
          <Input
            size="small"
            placeholder="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="student-admin-search"
          />
          <Space size={6}>
            <Button
              size="small"
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => setDebouncedSearch(searchText.trim())}
            />
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText("");
                setDebouncedSearch("");
                setPage(1);
              }}
            />
          </Space>
        </div>

        <Table<Student>
          rowKey="rollNumber"
          size="small"
          loading={tableLoading}
          dataSource={students}
          columns={columns}
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: true
          }}
          onChange={(pagination) => {
            setPage(pagination.current ?? 1);
            setSize(pagination.pageSize ?? PAGE_SIZE);
          }}
          className="student-admin-table"
        />
      </div>

      <Modal
        title="Bulk Upload Students"
        open={bulkModalOpen}
        onCancel={() => {
          setBulkModalOpen(false);
          setFileList([]);
        }}
        onOk={() => {
          void handleBulkUpload();
        }}
        confirmLoading={bulkLoading}
        okText="Upload"
      >
        <Upload.Dragger
          accept=".csv"
          multiple={false}
          maxCount={1}
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p>Click or drag CSV file to this area</p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};

export default StudentAdminPage;
