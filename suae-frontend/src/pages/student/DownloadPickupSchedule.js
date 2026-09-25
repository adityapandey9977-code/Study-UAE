/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { Tinymce, GetTinymceContent, SetTinymceContent } from "../../utils/Controls";
import { useNavigate } from "react-router-dom";
import util from "../../utils/util";
import FileService from "../../services/FileService";
import {
  Table,
  Button,
  Upload,
  message,
  Tag,
  List,
  Spin,
  Empty,
  Space,
  Card,
  Tabs,
  Input,
  Modal,
  Alert,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  SendOutlined,
  EditOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import InstituteService from "../../services/InstituteService";

export default function DownloadPickupSchedule() {
  const [studentId, setStudentId] = useState(null);
  const [studentScfId, setStudentScfId] = useState(null);
  const [studentPickupData, setStudentPickupData] = useState(null);
  const [loadingCount, setLoadingCount] = useState(0);
  
  // Institute-side data
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [visaStatus, setVisaStatus] = useState(null);
  
  const navigate = useNavigate();
  const isInstitute = util.isInstitute() === 1;
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scheduleText, setScheduleText] = useState("");
  const [sendingSchedule, setSendingSchedule] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Modal for viewing file content
  const [viewFileModal, setViewFileModal] = useState(false);
  const [viewingPickup, setViewingPickup] = useState(null);

  const setLoading = (isLoading) => {
    setLoadingCount((c) => (isLoading ? c + 1 : Math.max(0, c - 1)));
  };
  const loading = loadingCount > 0;

  // Fetch student ID and scf_id
  useEffect(() => {
    if (!isInstitute) {
      setLoading(true);
      
      let currentStudentId = null;
      
      InstituteService.getInstituteId()
        .then(({ data }) => {
          currentStudentId = data?.data?.student_id || null;
          setStudentId(currentStudentId);
          
          // Get scf_id from payment slips
          if (currentStudentId) {
            return InstituteService.paymentSlips();
          }
          throw new Error("No student ID found");
        })
        .then((payRes) => {
          if (payRes && currentStudentId) {
            const list = Array.isArray(payRes?.data) ? payRes.data : [];
            const myRecord = list.find((p) => String(p.student_id) === String(currentStudentId));
            
            console.log("Looking for student record:", {
              currentStudentId,
              totalRecords: list.length,
              foundRecord: !!myRecord,
              scf_id: myRecord?.scf_id
            });
            
            if (myRecord?.scf_id) {
              setStudentScfId(myRecord.scf_id);
            } else {
              console.warn("No scf_id found for student:", currentStudentId);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching student info:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [isInstitute]);

  // For student: check visa status and fetch pickup data
  useEffect(() => {
    if (!isInstitute && studentScfId) {
      setLoading(true);
      
      console.log("Fetching letter details for scf_id:", studentScfId);
      
      InstituteService.getLetterDetails(studentScfId)
        .then((res) => {
          console.log("Letter details response:", res?.data);
          
          const data = res?.data?.data;
          const letters = data?.letters;
          
          if (letters) {
            const status = letters.student_visa_status;
            const visaStatusStr = status !== undefined && status !== null ? String(status) : "0";
            
            console.log("Visa status details:", {
              student_visa_status: status,
              visaStatusStr,
              hasPickup: !!(letters.pickup || letters.pickup_fileid),
              pickup: letters.pickup,
              pickup_fileid: letters.pickup_fileid
            });
            
            setVisaStatus(visaStatusStr);
            
            // Set pickup data if available
            if (letters.pickup || letters.pickup_fileid) {
              setStudentPickupData({
                pickup: letters.pickup,
                pickup_fileid: letters.pickup_fileid,
                scf_id: studentScfId
              });
            } else {
              setStudentPickupData(null);
            }
          } else {
            console.warn("No letters data found in response");
            setVisaStatus("0");
          }
        })
        .catch((err) => {
          console.error("Error fetching student visa status:", err);
          setVisaStatus("0");
        })
        .finally(() => setLoading(false));
    }
  }, [studentScfId, isInstitute]);

  // Fetch eligible students for institute
  useEffect(() => {
    if (isInstitute) {
      setLoading(true);
      InstituteService.getEligibleStudents({})
        .then((response) => {
          const students = response.data.data.filter(
            (student) => student.letters?.student_visa_status === 1
          );
          setEligibleStudents(students);
        })
        .catch((error) => {
          console.error("Error fetching eligible students:", error);
          setEligibleStudents([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isInstitute]);

  // Handle file upload
  const handleBeforeUpload = (file) => {
    setSelectedFile(file);
    return false;
  };

  // Modal handlers
  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setScheduleText("");
    setSelectedFile(null);
    setModalVisible(true);
    setTimeout(() => {
      try {
        SetTinymceContent("pickup_schedule_editor", "");
      } catch (error) {
        console.warn("Could not set TinyMCE content:", error);
      }
    }, 100);
  };

  const handleSendSchedule = async () => {
    let content = "";
    try {
      content = GetTinymceContent("pickup_schedule_editor");
    } catch (error) {
      console.warn("Could not get TinyMCE content, using state value:", error);
      content = scheduleText;
    }

    if (!content.trim() && !selectedFile) {
      message.error("Please enter schedule details or upload a file!");
      return;
    }

    try {
      setSendingSchedule(true);
      let fileId = null;

      // Upload file first if selected
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const uploadRes = await FileService.uploadNode(selectedFile);
          fileId = uploadRes?.data?.file_id || 
                   uploadRes?.data?.result?.file_id || 
                   uploadRes?.data?.result?.path || 
                   uploadRes?.data?.path || 
                   null;
          
          if (!fileId) {
            throw new Error("File upload failed - no file ID returned");
          }
          
          console.log("File uploaded successfully, file_id:", fileId);
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          message.error(uploadError.message || "Failed to upload file");
          setUploadingFile(false);
          setSendingSchedule(false);
          return;
        }
        setUploadingFile(false);
      }

      // Upload pickup schedule
      const payload = {
        pickup: content || null,
        file_id: fileId
      };

      console.log("Uploading pickup schedule with payload:", payload);
      await InstituteService.uploadPickupDetail(selectedStudent.scf_id, payload);

      message.success(`Pickup schedule sent to ${selectedStudent.student_name}`);
      setModalVisible(false);
      setScheduleText("");
      setSelectedFile(null);
      setSelectedStudent(null);

      // Refresh eligible students list
      const response = await InstituteService.getEligibleStudents({});
      const students = response.data.data.filter(
        (student) => student.letters?.student_visa_status === 1
      );
      setEligibleStudents(students);
    } catch (error) {
      console.error("Error sending schedule:", error);
      message.error(error.message || "Failed to send schedule!");
    } finally {
      setSendingSchedule(false);
      setUploadingFile(false);
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!searchText) return eligibleStudents;
    return eligibleStudents.filter(
      (item) =>
        item.student_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.student_regno?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, eligibleStudents]);

  // Students with pickup schedule sent
  const studentsWithPickup = useMemo(() => {
    return eligibleStudents.filter(
      (student) => student.letters?.pickup || student.letters?.pickup_fileid
    );
  }, [eligibleStudents]);

  const filteredWithPickup = useMemo(() => {
    if (!searchText) return studentsWithPickup;
    return studentsWithPickup.filter(
      (item) =>
        item.student_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.student_regno?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, studentsWithPickup]);

  const handleViewPickup = (student) => {
    setViewingPickup(student);
    setViewFileModal(true);
  };

  const handleDownloadPickup = async (student) => {
    try {
      const scfId = student.scf_id || student.letters?.scf_id;
      if (!scfId) {
        message.error("Unable to download - missing student information");
        return;
      }

      const response = await InstituteService.downloadPickupFile(scfId);
      
      // Get content type from response headers
      const contentType = response.headers['content-type'] || 'application/pdf';
      
      // Create blob from response with proper content type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Get filename from content-disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `pickup_schedule_${student.student_regno || 'file'}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success("File downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      message.error(error.response?.data?.message || error.message || "Failed to download pickup schedule");
    }
  };

  const renderPickupPreview = () => {
    if (!viewingPickup) return null;

    const pickup = viewingPickup.letters?.pickup;
    const hasFile = viewingPickup.letters?.pickup_fileid;

    return (
      <div>
        {pickup && (
          <div className="p-4 border rounded-lg shadow-md bg-white mb-4">
            <h4 className="font-semibold mb-2">Schedule Details:</h4>
            <div
              className="pickup-content text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: pickup }}
            />
          </div>
        )}
        {hasFile ? (
          <div className="text-center p-4 border rounded-lg bg-gray-50">
            <p className="mb-4 text-gray-700">Attached file available for download</p>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadPickup(viewingPickup)}
            >
              Download File
            </Button>
          </div>
        ) : (
          pickup && (
            <Alert
              message="No file attachment"
              description="This pickup schedule contains only text information."
              type="info"
              showIcon
              className="mt-2"
            />
          )
        )}
        {!pickup && !hasFile && (
          <Empty description="No pickup schedule data available" />
        )}
      </div>
    );
  };

  // Table columns for students
  const columns = [
    {
      title: "Registration Number",
      dataIndex: "student_regno",
      key: "regNo",
      width: 180,
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "name",
      width: 250,
    },
    {
      title: "Course",
      dataIndex: "specialization_name",
      key: "course",
      width: 200,
    },
    {
      title: "Visa Status",
      key: "visaStatus",
      width: 150,
      render: () => <Tag color="green" className="px-3 py-1 text-sm font-medium">Accepted</Tag>,
    },
    {
      title: "Pickup Schedule",
      key: "pickup",
      width: 200,
      render: (_, student) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleOpenModal(student)}
        >
          {student.letters?.pickup || student.letters?.pickup_fileid ? "Update Schedule" : "Create Schedule"}
        </Button>
      ),
    },
  ];

  // Table columns for sent schedules
  const uploadedColumns = [
    {
      title: "Registration Number",
      dataIndex: "student_regno",
      key: "regNo",
      width: 180,
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "name",
      width: 250,
    },
    {
      title: "Course",
      dataIndex: "specialization_name",
      key: "course",
      width: 200,
    },
    {
      title: "Schedule Status",
      key: "status",
      width: 150,
      render: (_, student) => {
        const hasText = student.letters?.pickup;
        const hasFile = student.letters?.pickup_fileid;
        return (
          <Space direction="vertical" size="small">
            {hasText && <Tag color="blue">Text Schedule</Tag>}
            {hasFile && <Tag color="green">File Attached</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, student) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewPickup(student)}
          >
            View
          </Button>
          {student.letters?.pickup_fileid && (
            <Button
              type="default"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadPickup(student)}
            >
              Download
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleEditorInit = () => {
    if (modalVisible && selectedStudent) {
      try {
        SetTinymceContent("pickup_schedule_editor", scheduleText);
      } catch (error) {
        console.warn("Could not set TinyMCE content on init:", error);
      }
    }
  };

  return (
    <div className="page-content">
      <div className="page-head-gradient" style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <h2>{isInstitute ? "Manage Pickup Schedule" : "My Pickup Schedule"}</h2>
        <div className="d-flex align-items-center" style={{ gap: 10 }}>
          {!isInstitute && (
            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              Reg. No: <span className="bold600">{util.getRegno()}</span>
            </span>
          )}
          <div
            className="pill-btn sm cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
            onClick={() => navigate("/dashboard")}
          >
            Go To Dashboard
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Loading pickup schedule..." />
        </div>
      ) : (
        <>
          {isInstitute ? (
            eligibleStudents.length > 0 ? (
              <Card className="rounded-lg border">
                <div className="mb-6">
                  <Input.Search
                    placeholder="Search by Registration Number or Student Name"
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 400 }}
                    allowClear
                    size="large"
                  />
                </div>
                <Tabs
                  defaultActiveKey="1"
                  size="large"
                  tabBarStyle={{ fontSize: "16px", fontWeight: "500" }}
                  tabBarGutter={48}
                >
                  <Tabs.TabPane
                    tab={
                      <span style={{ fontSize: "16px", fontWeight: "500", padding: "12px 24px" }}>
                        Students with Accepted Visa ({filteredStudents.length} of {eligibleStudents.length})
                      </span>
                    }
                    key="1"
                  >
                    <div className="mt-4">
                      <Table
                        dataSource={filteredStudents}
                        columns={columns}
                        rowKey="scf_id"
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                        }}
                        scroll={{ x: true }}
                        bordered
                      />
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={
                      <span style={{ fontSize: "16px", fontWeight: "500", padding: "12px 24px" }}>
                        Sent Pickup Schedule ({filteredWithPickup.length} of {studentsWithPickup.length})
                      </span>
                    }
                    key="2"
                  >
                    <div className="mt-4">
                      {studentsWithPickup.length === 0 ? (
                        <Empty description="No pickup schedule files sent yet" className="py-16" />
                      ) : (
                        <Table
                          dataSource={filteredWithPickup}
                          columns={uploadedColumns}
                          rowKey="scf_id"
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                          }}
                          scroll={{ x: true }}
                          bordered
                        />
                      )}
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            ) : (
              <Alert
                message="This page will appear after visa accepted!"
                type="info"
                showIcon
                className="mt-6 ml-2 mr-2 p-2"
              />
            )
          ) : visaStatus === "1" ? (
            <Card
              title={
                <div className="p-4">
                  <div className="text-xl font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-600 text-2xl" />
                    Your visa has been accepted by the institute.
                  </div>
                  <Alert
                    message={
                      studentPickupData
                        ? "Find below your pickup schedule"
                        : "Wait for pickup schedule!"
                    }
                    type={studentPickupData ? "info" : "success"}
                    showIcon
                    className="mt-3 rounded-lg shadow-sm"
                  />
                </div>
              }
              className="rounded-lg border"
            >
              {studentPickupData ? (
                <List
                  itemLayout="horizontal"
                  dataSource={[studentPickupData]}
                  renderItem={(data) => (
                    <List.Item
                      className="px-4 py-3 border rounded-lg mb-3 hover:shadow-md transition"
                      actions={[
                        <Button
                          key="view"
                          type="primary"
                          icon={<EyeOutlined />}
                          onClick={() => {
                            setViewingPickup({ letters: data });
                            setViewFileModal(true);
                          }}
                          className="mr-2"
                        >
                          View
                        </Button>,
                        data.pickup_fileid && (
                          <Button
                            key="download"
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadPickup({ scf_id: data.scf_id })}
                            className="rounded-lg"
                          >
                            Download
                          </Button>
                        ),
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center gap-3">
                            <EyeOutlined className="text-blue-500 text-lg" />
                            <span className="text-lg font-medium text-gray-800">
                              Pickup Schedule
                            </span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description={
                    <span className="text-gray-600 text-lg font-medium">
                      No pickup schedule uploaded yet
                    </span>
                  }
                  className="py-20"
                />
              )}
            </Card>
          ) : (
            <Alert
              message="Visa Required"
              description={
                <div>
                  <p>This page will be available after your visa is accepted.</p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Debug Info:</p>
                      <p>Student ID: {studentId || 'Not found'}</p>
                      <p>SCF ID: {studentScfId || 'Not found'}</p>
                      <p>Visa Status: {visaStatus || 'Not loaded'}</p>
                    </div>
                  )}
                </div>
              }
              type="info"
              showIcon
              className="mt-6"
            />
          )}
        </>
      )}

      {/* Create Schedule Modal */}
      <Modal
        title={
          <div className="text-xl font-semibold text-gray-800">
            Send Pickup Schedule to {selectedStudent?.student_name}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" size="large" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            icon={<SendOutlined />}
            loading={sendingSchedule || uploadingFile}
            onClick={handleSendSchedule}
            size="large"
          >
            {uploadingFile ? "Uploading File..." : "Send Schedule"}
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">
            <span className="font-medium">Student:</span> {selectedStudent?.student_name} (
            {selectedStudent?.student_regno})
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter detailed pickup schedule information:
          </label>
          <Tinymce
            id="pickup_schedule_editor"
            data={scheduleText}
            height={300}
            onInit={handleEditorInit}
            onEditorChange={(content) => setScheduleText(content)}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optional: Upload a file
          </label>
          <Upload
            beforeUpload={handleBeforeUpload}
            maxCount={1}
            showUploadList={!!selectedFile}
            onRemove={() => {
              setSelectedFile(null);
              return true;
            }}
          >
            <Button icon={<UploadOutlined />}>
              {selectedFile ? "Change File" : "Select File"}
            </Button>
          </Upload>
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600">
              Selected file: {selectedFile.name}
            </div>
          )}
        </div>
      </Modal>

      {/* View File Modal */}
      <Modal
        title="Pickup Schedule Preview"
        open={viewFileModal}
        onCancel={() => setViewFileModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewFileModal(false)}>
            Close
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {renderPickupPreview()}
      </Modal>
    </div>
  );
}
