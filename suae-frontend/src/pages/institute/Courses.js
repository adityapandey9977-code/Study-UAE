/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import InstituteService from "../../services/InstituteService";
import CmasterService from "../../services/CmasterService";
import util from "../../utils/util";
import { SessionContext } from "../../context/SessionContext";
import { AntdSelect, AntdPaging, AntdTag } from "../../utils/Antd";
import {
    Table,
    Input,
    Button,
    message,
    Modal,
    Card,
    Alert,
    // Divider,
    Row,
    Col,
    Radio,
    Select,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
const { confirm } = Modal;

//const $ = window.$;

export default function Courses({ InstituteListPage = false, instituteId }) {
    // const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [result, setResult] = useState({ data: [], page: {} });
    const [isTableLoading, setTableLoading] = useState(false);
    const sdataRef = useRef({ p: 1, ps: 50 });
    const [tableKey, setTableKey] = useState(0);
    const formRef = useRef({});

    const { selectedSession, setSelectedSession, activeSession, sessions } = useContext(SessionContext);
    // const sessionName = selectedSession?.name || activeSession;

    const [acadCareers, setAcadCareers] = useState([]);
    const [disciplines, setDisciplines] = useState([]);
    const [courses, setCourses] = useState([]);
    const [specializations, setSpecializations] = useState([]);

    // For copy-from-previous-session feature
    const [copyModalVisible, setCopyModalVisible] = useState(false);
    const [copySourceSession, setCopySourceSession] = useState(null);
    const [copyLoading, setCopyLoading] = useState(false);
    const [copyCourses, setCopyCourses] = useState([]);
    const [copySelectedRowKeys, setCopySelectedRowKeys] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);

    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploading, setUploading] = useState(false);

    const isClientAdmin = localStorage.getItem("is_client_admin") === "1";

    const getSessionDisplayName = (sessionName) => {
        const name = String(sessionName || "");
        const m = name.match(/(\d{4})-(\d{4})/);
        return m ? m[2] : name;
    };

    const cols = isClientAdmin
        ? [
            {
                title: "Specialization",
                dataIndex: "specialization_name",
                render: (specialization_name, row) => (
                    <div>
                        <div className="bold600">{specialization_name}</div>
                        <div className="note-text">
                            <div className="d-flex">
                                <div className="w100">Institute</div>
                                <div className="bold600">: {row.institute_name}</div>
                            </div>
                            <div className="d-flex">
                                <div className="w100">Mode</div>
                                <div className="bold600">: {row.Mode_of_course}</div>
                            </div>
                            <div className="d-flex">
                                <div className="w100">Session</div>
                                <div className="bold600">: {row.session}</div>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "Status",
                dataIndex: "status",
                width: 150,
                render: (v) => (
                    <div className="nowrap">
                        {v * 1 ? (
                            <AntdTag type="success">Active</AntdTag>
                        ) : (
                            <AntdTag type="danger">Inactive</AntdTag>
                        )}
                    </div>
                ),
            },
        ]
        : [
            {
                title: "Specialization",
                dataIndex: "specialization",
                render: (specialization, row) => (
                    <div>
                        <div className="bold600">{specialization}</div>
                        <div className="note-text">
                            <div className="d-flex">
                                <div className="w100">Course</div>
                                <div className="bold600">: {row.course}</div>
                            </div>
                            <div className="d-flex">
                                <div className="w100">Discipline</div>
                                <div className="bold600">: {row.discipline}</div>
                            </div>
                            <div className="d-flex">
                                <div className="w100">Acad. Career</div>
                                <div className="bold600">: {row.acad_career}</div>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "Status",
                dataIndex: "status",
                width: 150,
                render: (v) => (
                    <div className="nowrap">
                        {v * 1 ? (
                            <AntdTag type="success">Active</AntdTag>
                        ) : (
                            <AntdTag type="danger">Inactive</AntdTag>
                        )}
                    </div>
                ),
            },
            {
                title: "Actions",
                dataIndex: "id",
                width: "86px",
                render: (id, row) => (
                    <div className="text-center">
                        <Button.Group size="small">
                            <Button type="default" onClick={() => updateRecord(row)}>
                                <i className="fa fa-edit"></i>
                            </Button>
                            <Button type="default" onClick={() => deleteRecord(id)}>
                                <i className="fa fa-times-circle font-red"></i>
                            </Button>
                        </Button.Group>
                    </div>
                ),
            },
        ];

    const updateRecord = (row) => {
        message.destroy();
        formRef.current.open(row);
    };

    const deleteRecord = (id) => {
        message.destroy();
        confirm({

            title: `Are you sure to delete this course?`,
            icon: <ExclamationCircleOutlined />,
            content: "",
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                setTableLoading(true);
                InstituteService.deleteCourse(id)
                    .then(({ data, id }) => {
                        message.success(data.message || "Deleted");
                        list();
                    })
                    .catch((e) => {
                        message.error(e.message);
                    })
                    .finally(() => {
                        setTableLoading(false);
                    });
            },
            onCancel() { },
        });
    };

    const list = useCallback(async () => {
        setTableLoading(true);

        const params = {
            session: selectedSession?.name || activeSession,
            show_all: false,
            // Include search parameters from sdataRef
            ...sdataRef.current,
        };

        const isClientAdmin = localStorage.getItem("is_client_admin") === "1";
        const finalInstituteId = instituteId || localStorage.getItem("is_institute");

        const apiCall = isClientAdmin
            ? InstituteService.coursesAdmin(finalInstituteId, params)
            : InstituteService.courses(params);

        apiCall
            .then(({ data }) => {
                const res = data.result;
                // Handle both structures properly
                let courses = res.courses || res.data || [];

                // Frontend guard: for institute users, ensure we only show
                // courses for the currently selected/active session.
                const currentSessionName = selectedSession?.name || activeSession;
                if (!isClientAdmin && currentSessionName) {
                    courses = courses.filter((c) => c.session === currentSessionName);
                }

                const page = {
                    start: 0,
                    total: courses.length,
                    total_records: courses.length,
                    cur_page: 1,
                };
                setResult({ data: courses, page });
            })
            .catch((e) => message.error(e.message))
            .finally(() => setTableLoading(false));
    }, [activeSession, instituteId, selectedSession?.name]);

    useEffect(() => {
        CmasterService.acadCareers({ status: 1 }).then((res) =>
            setAcadCareers(res.data.result.data)
        );
        CmasterService.allDisciplines({ status: 1 }).then((res) =>
            setDisciplines(res.data.result.data)
        );
        CmasterService.allCourses({ status: 1 }).then((res) =>
            setCourses(res.data.result.data)
        );
        CmasterService.allSpecializations({ status: 1 }).then((res) =>
            setSpecializations(res.data.result.data)
        );
        return () => {
            message.destroy();
        };
    }, []);

    useEffect(() => {
        list();
    }, [list]);

    useEffect(() => {
        if (!sessions || !sessions.length) {
            setFilteredSessions([]);
            return;
        }

        if (!selectedSession || !selectedSession.name) {
            setFilteredSessions([]);
            return;
        }

        const selectedSessionObj = sessions.find(s => s.name === selectedSession.name);

        if (!selectedSessionObj) {
            setFilteredSessions([]);
            return;
        }

        const filtered = sessions
            .filter(session =>
                new Date(session.start_date) < new Date(selectedSessionObj.start_date)
            )
            .sort((a, b) =>
                new Date(b.start_date) - new Date(a.start_date)
            );

        setFilteredSessions(filtered);
        setCopySourceSession(null);

    }, [sessions, selectedSession]);

    // Reload courses whenever the selected or active session changes
    useEffect(() => {
        list();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list, selectedSession, activeSession]);

    // ---------- Copy From Previous Session Logic ----------

    const openCopyModal = () => {
        setCopySelectedRowKeys([]);
        setCopyCourses([]);
        setCopySourceSession(null);
        setCopyModalVisible(true);
    };

    const loadCoursesForSession = async (sessionName) => {

        setCopyLoading(true);
        try {
            const params = {
                session: sessionName,
                show_all: true,
            };

            const isClientAdminLocal = localStorage.getItem("is_client_admin") === "1";
            const finalInstituteId = instituteId || localStorage.getItem("is_institute");

            const apiCall = isClientAdminLocal
                ? InstituteService.coursesAdmin(finalInstituteId, params)
                : InstituteService.courses(params);

            const { data } = await apiCall;
            const res = data.result || {};
            const list = res.courses || res.data || [];
            setCopyCourses(list.map((c) => ({ ...c, key: c.id || c.specialization_id || Math.random() })));
        } catch (e) {
            message.error(e.message || "Failed to load previous session courses");
            setCopyCourses([]);
        } finally {
            setCopyLoading(false);
        }
    };

    const buildCopyPayload = (course) => {
        return {
            // Core identifiers
            career_id: course.career_id,
            discipline_id: course.discipline_id,
            course_id: course.course_id,
            specialization_id: course.specialization_id,
            // Mode & status
            Mode_of_course: course.Mode_of_course,
            status: course.status,
            // Session always set to current active session
            session: activeSession,
            // Fee structures and currencies (pass through as-is if present)
            saarc_fee_structure: course.saarc_fee_structure,
            nonsaarc_fee_structure: course.nonsaarc_fee_structure,
            nri_fee_structure: course.nri_fee_structure,
            indian_fee_structure: course.indian_fee_structure,
            saarc_currency: course.saarc_currency,
            nonsaarc_currency: course.nonsaarc_currency,
            nri_currency: course.nri_currency,
            indian_currency: course.indian_currency,
        };
    };

    const copyCoursesToActiveSession = async (coursesToCopy) => {
        const currentSession = selectedSession?.name || activeSession;
        
        if (!currentSession) {
            message.warning("Session is not set.");
            return;
        }

        if (!coursesToCopy.length) {
            message.warning("No courses selected to copy.");
            return;
        }

        try {
            setCopyLoading(true);
            const instituteResponse = await CmasterService.getInstituteId();

            // Try different possible response formats
            const currentInstituteId = instituteResponse?.data?.institute_id ||
                instituteResponse?.data?.id ||
                instituteResponse?.data?.data?.institute_id ||
                instituteResponse?.data?.data?.id;

            if (!currentInstituteId) {
                throw new Error("Could not determine institute ID from the server response");
            }

            // Ensure course_ids is an array of numbers
            const payload = {
                from_session: copySourceSession,
                to_session: currentSession,
                course_ids: coursesToCopy.map(course => Number(course.id))
            };

            const copyResponse = await InstituteService.copyCoursesBulk(currentInstituteId, payload);

            if (copyResponse?.data?.result?.success) {
                message.success(copyResponse.data.message || "Courses copied successfully!");
                setCopyModalVisible(false);
                // Force a refresh of the table data
                await list();
                setTableKey(prev => prev + 1);

                // Reset the form and selected items
                setCopySelectedRowKeys([]);
                setCopyCourses([]);
                setCopySourceSession(null);
            } else {
                message.error(copyResponse.data?.message || "Failed to copy courses. Please try again.");
            }
        } catch (error) {
            console.error("Error in copyCoursesToActiveSession:", {
                error,
                response: error.response?.data
            });
            message.error(error.response?.data?.message || "An error occurred while copying courses.");
        } finally {
            setCopyLoading(false);
        }
    };

    const handleCopySelected = () => {

        if (!copyCourses.length) {
            console.error('No courses available to copy');
            message.warning('No courses available to copy. Please select a session first.');
            return;
        }

        if (!copySelectedRowKeys.length) {
            console.error('No courses selected');
            message.warning('Please select at least one course to copy.');
            return;
        }

        const toCopy = copyCourses.filter((c) => copySelectedRowKeys.includes(c.key));


        if (!toCopy.length) {
            console.error('No valid courses found to copy');
            message.warning('No valid courses found to copy.');
            return;
        }

        copyCoursesToActiveSession(toCopy);
    };

    const handleCopyAll = () => {

        if (!copyCourses.length) {
            console.error('No courses available to copy');
            message.warning('No courses available to copy. Please select a session first.');
            return;
        }

        copyCoursesToActiveSession(copyCourses);
    };

    const downloadSampleCsv = () => {
        const headers = [
            "Program Level", "Discipline", "Course", "Specialization", "Mode of Course", "Session", "Eligibility Criteria",
            "SAARC Currency", "Non-SAARC Currency", "NRI Currency", "Indian Currency",
            "saarc_without_hostel1st", "saarc_with_hostel1st", "saarc_without_hostel2nd", "saarc_with_hostel2nd", 
            "saarc_without_hostel3rd", "saarc_with_hostel3rd", "saarc_without_hostel4th", "saarc_with_hostel4th",
            "saarc_without_hostel5th", "saarc_with_hostel5th", "saarc_without_hostel6th", "saarc_with_hostel6th",
            "saarc_total_package_without_hostel", "saarc_total_package_with_hostel",
            "nonsaarc_without_hostel1st", "nonsaarc_with_hostel1st", "nonsaarc_without_hostel2nd", "nonsaarc_with_hostel2nd",
            "nonsaarc_without_hostel3rd", "nonsaarc_with_hostel3rd", "nonsaarc_without_hostel4th", "nonsaarc_with_hostel4th",
            "nonsaarc_without_hostel5th", "nonsaarc_with_hostel5th", "nonsaarc_without_hostel6th", "nonsaarc_with_hostel6th",
            "nonsaarc_total_package_without_hostel", "nonsaarc_total_package_with_hostel",
            "nri_without_hostel1st", "nri_with_hostel1st", "nri_without_hostel2nd", "nri_with_hostel2nd",
            "nri_without_hostel3rd", "nri_with_hostel3rd", "nri_without_hostel4th", "nri_with_hostel4th",
            "nri_without_hostel5th", "nri_with_hostel5th", "nri_without_hostel6th", "nri_with_hostel6th",
            "nri_total_package_without_hostel", "nri_total_package_with_hostel",
            "indian_without_hostel1st", "indian_with_hostel1st", "indian_without_hostel2nd", "indian_with_hostel2nd",
            "indian_without_hostel3rd", "indian_with_hostel3rd", "indian_without_hostel4th", "indian_with_hostel4th",
            "indian_without_hostel5th", "indian_with_hostel5th", "indian_without_hostel6th", "indian_with_hostel6th",
            "indian_total_package_without_hostel", "indian_total_package_with_hostel"
        ];
        const sampleRow = [
            "Diploma", "Agriculture", "Diploma in Agriculture", "Diploma in Agriculture", "Regular", "2025-2026", "Grade 10 with 50% marks",
            "USD", "USD", "USD", "INR",
            "1500", "2000", "1500", "2000", "", "", "", "", "", "", "", "", "", "", "3000", "4000",
            "2500", "3200", "2500", "3200", "", "", "", "", "", "", "", "", "", "", "5000", "6400",
            "3000", "3800", "3000", "3800", "", "", "", "", "", "", "", "", "", "", "6000", "7600",
            "80000", "110000", "80000", "110000", "", "", "", "", "", "", "", "", "", "", "160000", "220000"
        ];
        
        // Use standard CSV format with quotes to handle special characters correctly
        const formatRow = (arr) => arr.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(",");
        const csvContent = "\uFEFF" + [headers.join(","), formatRow(sampleRow)].join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "sample_courses_upload.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        e.target.value = '';

        if (!file.name.endsWith('.csv')) {
            message.error("Please upload a valid CSV file (.csv)");
            return;
        }

        const targetInstId = instituteId || null;

        setUploading(true);
        util.showLoader();

        InstituteService.importCourses(file, targetInstId)
            .then(({ data }) => {
                if (data.success) {
                    message.success("Bulk upload completed!");
                    setUploadResult(data.result);
                    setUploadModalVisible(true);
                    list(1); // Refresh the list
                } else {
                    message.error(data.message || "Failed to upload courses");
                }
            })
            .catch(err => {
                console.error(err);
                message.error(err.response?.data?.message || err.message || "Failed to upload courses");
            })
            .finally(() => {
                setUploading(false);
                util.hideLoader();
            });
    };

    const wh = window.innerHeight;

    return (
        <div className="page-content">
            {!InstituteListPage && (
                <div className="page-head-gradient" style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                    <h2>Institute Courses</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: 19 }}>Select Session:</span>
                        <Select
                            style={{ minWidth: 180, textAlign: "center" }}
                            placeholder="Select session"
                            value={sessions && sessions.length > 0 ? (selectedSession?.name || activeSession) : undefined}
                            onChange={(value) => {
                                const session = sessions.find(s => s.name === value);
                                if (session) {
                                    setSelectedSession(session);
                                    localStorage.setItem("selectedSession", JSON.stringify(session));
                                }
                            }}
                            dropdownStyle={{ textAlign: "center" }}
                            optionLabelProp="label"
                            popupClassName="session-dropdown-transparent"
                            styles={{
                                root: { backgroundColor: 'transparent', color: '#fff' },
                                selector: { backgroundColor: 'transparent !important', borderColor: 'rgba(255,255,255,0.3) !important', color: '#fff' }
                            }}
                        >
                            {sessions?.map(s => (
                                <Select.Option 
                                    key={s.name} 
                                    value={s.name}
                                    label={getSessionDisplayName(s.name)}
                                >
                                    {getSessionDisplayName(s.name)}
                                </Select.Option>
                            )) || []}
                        </Select>
                    </div>
                </div>
            )}
            <div className={InstituteListPage ? "" : "page-pad"}>
                <div>
                    <div>
                        <Card size="small" bordered={true} bodyStyle={{ padding: 0 }}>
                            <div className="above-tbl-filter-pad">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center justify-between w-full">
                                        {result.data.length > 0 && (
                                            <div className="text-secondary">
                                                Showing {result.page.start + 1} -{" "}
                                                {result.page.start + result.page.total} of{" "}
                                                {result.page.total_records} records.
                                            </div>
                                        )}
                                        <div>
                                            <SearchForm dataRef={sdataRef} onSearch={list} />
                                        </div>
                                    </div>
                                    {!InstituteListPage && (
                                        <div className="flex gap-2">
                                            <Button
                                                type="default"
                                                onClick={downloadSampleCsv}
                                                style={{ borderColor: '#2563eb', color: '#2563eb' }}
                                            >
                                                <i className="fa fa-download mr5"></i> Sample CSV
                                            </Button>
                                            <label className="ant-btn ant-btn-dashed flex items-center justify-center cursor-pointer mb-0">
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleBulkUpload}
                                                    style={{ display: 'none' }}
                                                    disabled={uploading}
                                                />
                                                <i className="fa fa-upload mr5"></i> Bulk Upload
                                            </label>
                                            <Button
                                                type="default"
                                                onClick={openCopyModal}
                                            >
                                                Copy From Previous Session
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={() => formRef.current.open()}
                                                style={{ background: 'linear-gradient(135deg, #588d93 0%, #568cb1 100%)', border: 'none', borderRadius: 8, fontWeight: 600 }}
                                            >
                                                <i className="fa fa-plus mr5"></i> Add New
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bdr-top">
                                {result.data.length === 0 && !isTableLoading ? (
                                    <div className="text-center py-8 text-secondary">
                                        {sdataRef.current.k || sdataRef.current.status ? 
                                            "No data for the selected filter" : 
                                            "No courses found"
                                        }
                                    </div>
                                ) : (
                                    <Table
                                        key={`course-table-${tableKey}`}
                                        size="small"
                                        bordered={false}
                                        dataSource={result.data}
                                        columns={cols}
                                        loading={isTableLoading}
                                        scroll={{ y: wh - 340 }}
                                        pagination={false}
                                        className="stripped"
                                    />
                                )}
                            </div>

                            <div className="paging-box">
                                <AntdPaging
                                    onChange={list}
                                    total={result.page.total_records}
                                    current={result.page.cur_page}
                                    pageSize={sdataRef.current.ps}
                                    showSizeChanger
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <AddForm
                refOb={formRef}
                callback={list}
                pageno={sdataRef.current.p}
                {...{ acadCareers, disciplines, courses, specializations }}
            />

            {/* Copy From Previous Session Modal */}
            <Modal
                title="Copy Courses From Previous Session"
                open={copyModalVisible}
                onCancel={() => setCopyModalVisible(false)}
                footer={null}
                width={900}
                destroyOnClose
                maskClosable={false}
            >
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-2">
                        <span>Select Previous Session:</span>
                        <Select
                            key={`session-select-${selectedSession?.name || 'none'}`}
                            style={{ minWidth: 200 }}
                            placeholder={!sessions?.length ? "Loading sessions..." : "Select session"}
                            value={copySourceSession || undefined}
                            onChange={(value) => {
                                setCopySourceSession(value);
                                loadCoursesForSession(value);
                            }}
                            options={filteredSessions?.map(s => ({
                                label: getSessionDisplayName(s.name),
                                value: s.name
                            })) || []}
                            notFoundContent={
                                sessions?.length ? "No previous sessions found" : "Loading sessions..."
                            }
                        />
                    </div>

                    <Table
                        size="small"
                        bordered={false}
                        dataSource={copyCourses}
                        loading={copyLoading}
                        rowKey="key"
                        pagination={false}
                        rowSelection={{
                            selectedRowKeys: copySelectedRowKeys,
                            onChange: (keys) => setCopySelectedRowKeys(keys),
                        }}
                        columns={[
                            {
                                title: "Specialization",
                                dataIndex: "specialization",
                                render: (specialization, row) => (
                                    <div>
                                        <div className="bold600">{specialization || row.specialization_name}</div>
                                        <div className="note-text">
                                            <div className="d-flex">
                                                <div className="w100">Course</div>
                                                <div className="bold600">: {row.course}</div>
                                            </div>
                                            <div className="d-flex">
                                                <div className="w100">Discipline</div>
                                                <div className="bold600">: {row.discipline}</div>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                title: "Mode",
                                dataIndex: "Mode_of_course",
                                width: 120,
                            },
                            {
                                title: "Status",
                                dataIndex: "status",
                                width: 100,
                                render: (v) => (
                                    <div className="nowrap">
                                        {v * 1 ? (
                                            <AntdTag type="success">Active</AntdTag>
                                        ) : (
                                            <AntdTag type="danger">Inactive</AntdTag>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        scroll={{ y: 300 }}
                    />

                    <div className="flex justify-end gap-2 mt-3">
                        <Button
                            type="default"
                            onClick={handleCopySelected}
                            disabled={!copySelectedRowKeys.length}
                            loading={copyLoading}
                        >
                            Copy Selected
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleCopyAll}
                            disabled={!copyCourses.length}
                            loading={copyLoading}
                        >
                            Copy All
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Bulk Upload Results Modal */}
            <Modal
                title="Bulk Upload Results"
                open={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setUploadModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={650}
            >
                {uploadResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                            <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{uploadResult.total || 0}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginTop: '4px' }}>Total Rows</div>
                            </div>
                            <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>{uploadResult.created || 0}</div>
                                <div style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase', marginTop: '4px' }}>Created</div>
                            </div>
                            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>{uploadResult.updated || 0}</div>
                                <div style={{ fontSize: '11px', color: '#1d4ed8', textTransform: 'uppercase', marginTop: '4px' }}>Updated</div>
                            </div>
                            <div style={{ padding: '10px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706' }}>{Number(uploadResult.skipped || 0) + Number(uploadResult.errors || 0)}</div>
                                <div style={{ fontSize: '11px', color: '#b45309', textTransform: 'uppercase', marginTop: '4px' }}>Failed/Skipped</div>
                            </div>
                        </div>

                        {uploadResult.error_rows && uploadResult.error_rows.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px', color: '#334155' }}>
                                    Errors & Warnings ({uploadResult.error_rows.length})
                                </div>
                                <div style={{ 
                                    maxHeight: '250px', 
                                    overflowY: 'auto', 
                                    border: '1px solid #cbd5e1', 
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                                                <th style={{ padding: '8px 12px', width: '80px', fontWeight: '600', color: '#475569' }}>Row No.</th>
                                                <th style={{ padding: '8px 12px', fontWeight: '600', color: '#475569' }}>Error details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uploadResult.error_rows.map((err, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#b91c1c' }}>Row {err.row}</td>
                                                    <td style={{ padding: '8px 12px', color: '#334155' }}>{err.message}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

const SearchForm = (props) => {
    let { dataRef, onSearch } = props;
    let [data, setData] = useState({ ...dataRef.current });
    
    const handleChangeAndSearch = (v, k) => {
        const newData = { ...data, [k]: v };
        setData(newData);
        dataRef.current = newData; // Update ref immediately
        onSearch(); // Trigger search
    };
    
    const handleChange = (v, k) => {
        const newData = { ...data, [k]: v };
        setData(newData);
    };
    
    useEffect(() => {
        dataRef.current = { ...data };
    }, [data]);

    useEffect(() => {
        setData({ ...data, p: dataRef.current.p, ps: dataRef.current.ps });
    }, [dataRef.current.p, dataRef.current.ps]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSearch();
            }}
            autoComplete="off"
            spellCheck="false"
        >
            <div className="d-flex">
                <div className="mr5">
                    <Input
                        placeholder="Search"
                        allowClear
                        value={data.k}
                        onChange={(e) => handleChange(e.target.value, "k")}
                        onPressEnter={() => {
                            dataRef.current = { ...data };
                            onSearch();
                        }}
                        onClear={() => {
                            const newData = { ...data, k: '' };
                            setData(newData);
                            dataRef.current = newData;
                            onSearch();
                        }}
                    />
                </div>
                <div className="w150 mr5">
                    <AntdSelect
                        placeholder="Status (All)"
                        allowClear
                        options={[
                            { value: "1", label: "Active" },
                            { value: "0", label: "Inactive" },
                        ]}
                        value={data.status}
                        onChange={(v) => handleChangeAndSearch(v, "status")}
                        onClear={() => handleChangeAndSearch('', "status")}
                    />
                </div>
                <div>
                    <Button
                        type="primary"
                        icon={<i className="fa fa-search fs13"></i>}
                        onClick={() => {
                            dataRef.current = { ...data };
                            onSearch();
                        }}
                        style={{ background: 'linear-gradient(135deg, #588d93 0%, #568cb1 100%)', border: 'none', borderRadius: 8 }}
                    ></Button>
                </div>
            </div>
        </form>
    );
};

const AddForm = (props) => {
    const { sessions, activeSession, selectedSession } = useContext(SessionContext);

    const getSessionDisplayName = (sessionName) => {
        const name = String(sessionName || "");
        const m = name.match(/(\d{4})-(\d{4})/);
        return m ? m[2] : name;
    };

    let {
        callback,
        pageno,
        refOb,
        acadCareers,
        disciplines,
        courses,
        specializations,
    } = props;
    let [showModal, setShowModal] = useState(false);
    let [data, setData] = useState({});

    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    };

    const handleOk = () => {
        message.destroy();

        const currentSession = selectedSession?.name || activeSession;

        // Prepare the data for submission
        const formData = {
            ...data,
            // Ensure session is included in the form data
            session: data.session || data.Session || currentSession || '',
            // Stringify fee structures if they are objects
            saarc_fee_structure: typeof data.saarc_fee_structure === 'object'
                ? JSON.stringify(data.saarc_fee_structure)
                : (data.saarc_fee_structure || ''),
            nonsaarc_fee_structure: typeof data.nonsaarc_fee_structure === 'object'
                ? JSON.stringify(data.nonsaarc_fee_structure)
                : (data.nonsaarc_fee_structure || ''),
            nri_fee_structure: typeof data.nri_fee_structure === 'object'
                ? JSON.stringify(data.nri_fee_structure)
                : (data.nri_fee_structure || ''),
            indian_fee_structure: typeof data.indian_fee_structure === 'object'
                ? JSON.stringify(data.indian_fee_structure)
                : (data.indian_fee_structure || '')
        };

        // Clean up the data object before sending
        delete formData.Session; // Remove the uppercase Session if it exists

        util.showLoader();

        const apiCall = formData.id
            ? InstituteService.updateCourse(formData.id, formData)
            : InstituteService.saveCourse(formData);

        apiCall
            .then(({ data: res }) => {
                message.success(res.message || (data.id ? "Updated" : "Saved"));
                callback(data.id ? pageno : 1);
                setShowModal(false);
            })
            .catch((e) => {
                message.error(e.message);
            })
            .finally(() => {
                util.hideLoader();
            });
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    refOb.current = {
        ...refOb.current,
        open: (dtl) => {
            if (dtl) {
                // Parse fee structure data if it exists and handle session data
                const parsedDtl = {
                    ...dtl,
                    // Handle both Session (uppercase) and session (lowercase) for backward compatibility
                    session: dtl.session || dtl.Session || '',
                    saarc_fee_structure: dtl.saarc_fee_structure
                        ? (typeof dtl.saarc_fee_structure === 'string'
                            ? JSON.parse(dtl.saarc_fee_structure)
                            : dtl.saarc_fee_structure)
                        : {},
                    nonsaarc_fee_structure: dtl.nonsaarc_fee_structure
                        ? (typeof dtl.nonsaarc_fee_structure === 'string'
                            ? JSON.parse(dtl.nonsaarc_fee_structure)
                            : dtl.nonsaarc_fee_structure)
                        : {},
                    nri_fee_structure: dtl.nri_fee_structure
                        ? (typeof dtl.nri_fee_structure === 'string'
                            ? JSON.parse(dtl.nri_fee_structure)
                            : dtl.nri_fee_structure)
                        : {},
                    indian_fee_structure: dtl.indian_fee_structure
                        ? (typeof dtl.indian_fee_structure === 'string'
                            ? JSON.parse(dtl.indian_fee_structure)
                            : dtl.indian_fee_structure)
                        : {},
                };
                setData(parsedDtl);
            } else {
                setData({
                    saarc_fee_structure: {},
                    nonsaarc_fee_structure: {},
                    nri_fee_structure: {},
                    indian_fee_structure: {}
                });
            }
            setShowModal(true);
        },
    };

    return (
        <Modal
            title={`${data.id ? "Edit" : "Add"} Course`}
            open={showModal}
            okText="Save"
            onOk={handleOk}
            onCancel={handleCancel}
            destroyOnClose
            maskClosable={false}
            width={1200}
            style={{ top: 50 }}
            bodyStyle={{ height: "calc(100vh - 150px)" }}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleOk(`${data.id ? data.id : ""}`);
                }}
                autoComplete="off"
                spellCheck="false"
            >
                <div className="flex flex-col gap-4">
                    <Card size="small" type="inner" title="Course Details">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <div className="legend-lbl">
                                    <label className="req">Program Level</label>
                                    <AntdSelect
                                        allowClear
                                        options={acadCareers}
                                        value={data.career_id}
                                        onChange={(v) => {
                                            data.course_id = null;
                                            data.discipline_id = null;
                                            data.specialization_id = null;
                                            handleChange(v, "career_id");
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div className="legend-lbl">
                                    <label className="req">Discipline</label>
                                    <AntdSelect
                                        allowClear
                                        options={disciplines}
                                        value={data.discipline_id}
                                        onChange={(v) => {
                                            data.course_id = null;
                                            data.specialization_id = null;
                                            handleChange(v, "discipline_id");
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <div className="legend-lbl">
                                    <label className="req">Course</label>
                                    <AntdSelect
                                        allowClear
                                        options={courses.filter((v) => {
                                            let cond = v.discipline_id === data.discipline_id;
                                            if (data.career_id) {
                                                cond = cond && v.career_id === data.career_id;
                                            }
                                            return cond;
                                        })}
                                        value={data.course_id}
                                        onChange={(v) => {
                                            data.specialization_id = null;
                                            handleChange(v, "course_id");
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div className="legend-lbl">
                                    <label className="req">Specialization</label>
                                    <AntdSelect
                                        allowClear
                                        options={specializations.filter(
                                            (v) => v.course_id === data.course_id
                                        )}
                                        value={data.specialization_id}
                                        onChange={(v) => {
                                            handleChange(v, "specialization_id");
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div className="legend-lbl">
                                    <label className="req">Mode of Course</label>
                                    <AntdSelect
                                        allowClear
                                        options={[
                                            { label: "Offline", value: "offline" },
                                            { label: "Online", value: "online" },
                                        ]}
                                        value={data.Mode_of_course}
                                        onChange={(v) => handleChange(v, "Mode_of_course")}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div className="legend-lbl">
                                    <label className="req">Session</label>
                                    <AntdSelect
                                        allowClear={false}
                                        options={[{ 
                                            label: getSessionDisplayName(selectedSession?.name || activeSession), 
                                            value: selectedSession?.name || activeSession 
                                        }]}
                                        value={selectedSession?.name || activeSession}
                                        disabled
                                        style={{ width: "100%" }}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    <Card
                        size="small"
                        type="inner"
                        title="Fee Waiver (Saarc Countries)"
                        extra={
                            <div className="flex items-center gap-4 select-none">
                                <Radio
                                    checked={data.saarc_currency === "INR"}
                                    value="INR"
                                    onChange={(e) =>
                                        setData({ ...data, saarc_currency: e.target.value })
                                    }
                                >
                                    INR
                                </Radio>

                                <Radio
                                    checked={data.saarc_currency === "USD"}
                                    value="USD"
                                    onChange={(e) =>
                                        setData({ ...data, saarc_currency: e.target.value })
                                    }
                                >
                                    USD
                                </Radio>
                            </div>
                        }
                    >
                        <div className="mb-1 text-[11px] font-semibold text-center text-black/50">
                            ONLY NEPAL, BANGLADESH, SRILANKA, AFGHANISTAN
                        </div>

                        <Row gutter={[16, 16]} wrap={false}>
                            {[
                                { num: 1, suffix: "st" },
                                { num: 2, suffix: "nd" },
                                { num: 3, suffix: "rd" },
                                { num: 4, suffix: "th" },
                                { num: 5, suffix: "th" },
                                { num: 6, suffix: "th" },
                                { num: 7, suffix: "th", isTotal: true },
                            ].map(({ num, suffix, isTotal }) => (
                                <Col key={num}>
                                    <Card
                                        size="small"
                                        title={
                                            <div className="text-[11px]">
                                                {isTotal ? (
                                                    "Total Package"
                                                ) : (
                                                    <>
                                                        {num}
                                                        <sup>{suffix}</sup> yr Fee
                                                    </>
                                                )}
                                            </div>
                                        }
                                        style={{ minWidth: 140 }}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="legend-lbl">
                                                <label>Without Hostel</label>
                                                <Input
                                                    value={
                                                        isTotal
                                                            ? data.saarc_fee_structure
                                                                ?.total_package_without_hostel
                                                            : data.saarc_fee_structure?.[
                                                            `without_hostel${num}${suffix}`
                                                            ]
                                                    }
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            saarc_fee_structure: {
                                                                ...data.saarc_fee_structure,
                                                                [isTotal
                                                                    ? "total_package_without_hostel"
                                                                    : `without_hostel${num}${suffix}`]:
                                                                    e.target.value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="legend-lbl">
                                                <label>With Hostel</label>
                                                <Input
                                                    value={
                                                        isTotal
                                                            ? data.saarc_fee_structure
                                                                ?.total_package_with_hostel
                                                            : data.saarc_fee_structure?.[
                                                            `with_hostel${num}${suffix}`
                                                            ]
                                                    }
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            saarc_fee_structure: {
                                                                ...data.saarc_fee_structure,
                                                                [isTotal
                                                                    ? "total_package_with_hostel"
                                                                    : `with_hostel${num}${suffix}`]:
                                                                    e.target.value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>

                    <Card
                        size="small"
                        type="inner"
                        title="Fee Waiver (Non-Saarc Countries)"
                        extra={
                            <div className="flex items-center gap-4 select-none">
                                <Radio
                                    checked={data.nonsaarc_currency === "INR"}
                                    value="INR"
                                    onChange={(e) =>
                                        setData({ ...data, nonsaarc_currency: e.target.value })
                                    }
                                >
                                    INR
                                </Radio>

                                <Radio
                                    checked={data.nonsaarc_currency === "USD"}
                                    value="USD"
                                    onChange={(e) =>
                                        setData({ ...data, nonsaarc_currency: e.target.value })
                                    }
                                >
                                    USD
                                </Radio>
                            </div>
                        }
                    >
                        <div className="mb-1 text-[11px] font-semibold text-center text-black/50">
                            EXCEPT NEPAL, BANGLADESH, SRILANKA, AFGHANISTAN
                        </div>

                        <Row gutter={[16, 16]} wrap={false}>
                            {[
                                { num: 1, suffix: "st" },
                                { num: 2, suffix: "nd" },
                                { num: 3, suffix: "rd" },
                                { num: 4, suffix: "th" },
                                { num: 5, suffix: "th" },
                                { num: 6, suffix: "th" },
                                { num: 7, suffix: "th", isTotal: true },
                            ].map(({ num, suffix, isTotal }) => (
                                <Col key={num}>
                                    <Card
                                        size="small"
                                        title={
                                            <div className="text-[11px]">
                                                {isTotal ? (
                                                    "Total Package"
                                                ) : (
                                                    <>
                                                        {num}
                                                        <sup>{suffix}</sup> yr Fee
                                                    </>
                                                )}
                                            </div>
                                        }
                                        style={{ minWidth: 140 }}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="legend-lbl">
                                                <label>Without Hostel</label>
                                                <Input
                                                    value={
                                                        isTotal
                                                            ? data.nonsaarc_fee_structure
                                                                ?.total_package_without_hostel
                                                            : data.nonsaarc_fee_structure?.[
                                                            `without_hostel${num}${suffix}`
                                                            ]
                                                    }
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            nonsaarc_fee_structure: {
                                                                ...data.nonsaarc_fee_structure,
                                                                [isTotal
                                                                    ? "total_package_without_hostel"
                                                                    : `without_hostel${num}${suffix}`]:
                                                                    e.target.value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="legend-lbl">
                                                <label>With Hostel</label>
                                                <Input
                                                    value={
                                                        isTotal
                                                            ? data.nonsaarc_fee_structure
                                                                ?.total_package_with_hostel
                                                            : data.nonsaarc_fee_structure?.[
                                                            `with_hostel${num}${suffix}`
                                                            ]
                                                    }
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            nonsaarc_fee_structure: {
                                                                ...data.nonsaarc_fee_structure,
                                                                [isTotal
                                                                    ? "total_package_with_hostel"
                                                                    : `with_hostel${num}${suffix}`]:
                                                                    e.target.value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>

                    <Card
                        size="small"
                        type="inner"
                        title="Fee Waiver (NRI)"
                        extra={
                            <div className="flex items-center gap-4 select-none">
                                <Radio
                                    checked={data.nri_currency === "INR"}
                                    value="INR"
                                    onChange={(e) =>
                                        setData({ ...data, nri_currency: e.target.value })
                                    }
                                >
                                    INR
                                </Radio>

                                <Radio
                                    checked={data.nri_currency === "USD"}
                                    value="USD"
                                    onChange={(e) =>
                                        setData({ ...data, nri_currency: e.target.value })
                                    }
                                >
                                    USD
                                </Radio>
                            </div>
                        }
                    >
                        <div className="mb-1 text-[11px] font-semibold text-center text-black/50">
                            EXCEPT NEPAL, BANGLADESH, SRILANKA, AFGHANISTAN
                        </div>

                        <Row gutter={[16, 16]} wrap={false}>
                            {[
                                { num: 1, suffix: "st" },
                                { num: 2, suffix: "nd" },
                                { num: 3, suffix: "rd" },
                                { num: 4, suffix: "th" },
                                { num: 5, suffix: "th" },
                                { num: 6, suffix: "th" },
                                { num: 7, suffix: "th", isTotal: true },
                            ].map(({ num, suffix, isTotal }) => (
                                <Col key={num}>
                                    <Card
                                        size="small"
                                        style={{ minWidth: 140 }}
                                        title={
                                            <div className="text-[11px]">
                                                {isTotal ? (
                                                    "Total Package"
                                                ) : (
                                                    <>
                                                        {num}
                                                        <sup>{suffix}</sup> yr Fee
                                                    </>
                                                )}
                                            </div>
                                        }
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="legend-lbl">
                                                <label>Without Hostel</label>
                                                <Input
                                                    value={
                                                        isTotal
                                                            ? data.nri_fee_structure
                                                                ?.total_package_without_hostel
                                                            : data.nri_fee_structure?.[
                                                            `without_hostel${num}${suffix}`
                                                            ]
                                                    }
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            nri_fee_structure: {
                                                                ...data.nri_fee_structure,
                                                                [isTotal
                                                                    ? "total_package_without_hostel"
                                                                    : `without_hostel${num}${suffix}`]:
                                                                    e.target.value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="legend-lbl">
                                                <label>With Hostel</label>
                                                <Input
                                                    value={
                                                        isTotal
                                                            ? data.nri_fee_structure
                                                                ?.total_package_with_hostel
                                                            : data.nri_fee_structure?.[
                                                            `with_hostel${num}${suffix}`
                                                            ]
                                                    }
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            nri_fee_structure: {
                                                                ...data.nri_fee_structure,
                                                                [isTotal
                                                                    ? "total_package_with_hostel"
                                                                    : `with_hostel${num}${suffix}`]:
                                                                    e.target.value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>

                    <Card
                        size="small"
                        type="inner"
                        title="Fee Waiver (INDIAN)"
                        extra={
                            <div className="flex items-center gap-4 select-none">
                                <Radio
                                    checked={data.indian_currency === "INR"}
                                    value="INR"
                                    onChange={(e) =>
                                        setData({ ...data, indian_currency: e.target.value })
                                    }
                                >
                                    INR
                                </Radio>

                                <Radio
                                    checked={data.indian_currency === "USD"}
                                    value="USD"
                                    onChange={(e) =>
                                        setData({ ...data, indian_currency: e.target.value })
                                    }
                                >
                                    USD
                                </Radio>
                            </div>
                        }
                    >
                        <Row gutter={[16, 16]} wrap={false}>
                            {[
                                { num: 1, suffix: "st" },
                                { num: 2, suffix: "nd" },
                                { num: 3, suffix: "rd" },
                                { num: 4, suffix: "th" },
                                { num: 5, suffix: "th" },
                                { num: 6, suffix: "th" },
                                { num: 7, suffix: "th", isTotal: true },
                            ].map(({ num, suffix, isTotal }) => (
                                <Col key={num}>
                                    <Card
                                        size="small"
                                        style={{ minWidth: 140 }}
                                        title={
                                            <div className="text-[11px]">
                                                {isTotal ? (
                                                    "Total Package"
                                                ) : (
                                                    <>
                                                        {num}
                                                        <sup>{suffix}</sup> yr Fee
                                                    </>
                                                )}
                                            </div>
                                        }
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="legend-lbl">
                                                <label>Without Hostel</label>
                                                <Input
                                                    value={
                                                        isTotal
                                                            ? data.indian_fee_structure
                                                                ?.total_package_without_hostel
                                                            : data.indian_fee_structure?.[
                                                            `without_hostel${num}${suffix}`
                                                            ]
                                                    }
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            indian_fee_structure: {
                                                                ...data.indian_fee_structure,
                                                                [isTotal
                                                                    ? "total_package_without_hostel"
                                                                    : `without_hostel${num}${suffix}`]:
                                                                    e.target.value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="legend-lbl">
                                                <label>With Hostel</label>
                                                <Input
                                                    value={
                                                        isTotal
                                                            ? data.indian_fee_structure
                                                                ?.total_package_with_hostel
                                                            : data.indian_fee_structure?.[
                                                            `with_hostel${num}${suffix}`
                                                            ]
                                                    }
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            indian_fee_structure: {
                                                                ...data.indian_fee_structure,
                                                                [isTotal
                                                                    ? "total_package_with_hostel"
                                                                    : `with_hostel${num}${suffix}`]:
                                                                    e.target.value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>

                    <Card type="inner" size="small" title="Eligibility Criteria">
                        <Input.TextArea
                            rows="4"
                            value={data.eligibility_creteria || ""}
                            onChange={(e) =>
                                handleChange(e.target.value, "eligibility_creteria")
                            }
                        />
                    </Card>

                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <div className="legend-lbl">
                                <label className="req">Status</label>
                                <div>
                                    <AntdSelect
                                        options={[
                                            { value: "1", label: "Active" },
                                            { value: "0", label: "Inactive" },
                                        ]}
                                        value={data.status}
                                        onChange={(v) => {
                                            handleChange(v, "status");
                                        }}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </form>
        </Modal>
    );
};
