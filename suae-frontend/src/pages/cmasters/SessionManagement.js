/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import {
    Card,
    Row,
    Col,
    Typography,
    Button,
    DatePicker,
    message,
    Table,
    Tag,
    Modal,
} from "antd";
import {
    PlayCircleOutlined,
    StopOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    EditOutlined, DeleteOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { SessionContext } from "../../context/SessionContext";
import CmasterService from "../../services/CmasterService";
import InstituteService from "../../services/InstituteService";
import StudentService from "../../services/StudentService";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(isSameOrBefore);

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const SessionManagement = () => {
    const [selectedRange, setSelectedRange] = useState([]);
    const [sessionActive, setSessionActive] = useState(false);
    const [activeSession, setActiveSession] = useState(null); // dayjs range or null
    // const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);

    // from context: we only need setter to publish top-4 sessions for Header
    const { sessions, setSessions, fetchSessions } = useContext(SessionContext); // ✅ added fetchSessions

    const [editModal, setEditModal] = useState({
        open: false,
        record: null,
        range: [],
    });

    // Suppress ResizeObserver warnings (keep your original behavior)
    // useEffect(() => {
    //     const resizeObserverErr = console.error;
    //     console.error = (...args) => {
    //         if (
    //             typeof args[0] === "string" &&
    //             args[0].includes("ResizeObserver loop limit exceeded")
    //         ) {
    //             return;
    //         }
    //         resizeObserverErr(...args);
    //     };
    //     return () => {
    //         console.error = resizeObserverErr;
    //     };
    // }, []);
    useEffect(() => {
        // 🧩 Suppress harmless ResizeObserver warnings in AntD DatePicker
        const originalError = console.error;
        console.error = (...args) => {
            if (
                typeof args[0] === "string" &&
                (args[0].includes("ResizeObserver loop limit exceeded") ||
                    args[0].includes("ResizeObserver loop completed"))
            ) {
                return;
            }
            originalError(...args);
        };
        return () => {
            console.error = originalError;
        };
    }, []);


    // const generateSessionName = (range) => {
    //     const startYear = dayjs(range[0]).year();
    //     const endYear = dayjs(range[1]).year();
    //     return `${startYear}-${endYear}`;
    // };

    // 🟢 Fetch Sessions and publish top 4 to context
    const loadSessions = async () => {
        setLoading(true);
        try {
            const response = await CmasterService.getSessions();
            const apiData = response?.data?.result || []; // ✅ Use "result" array

            const formatted = apiData.map((item) => ({
                key: item.id,
                name: `${dayjs(item.session_startdt).year()}-${dayjs(item.session_enddt).year()}`,
                start_date: dayjs(item.session_startdt).format("DD MMM YYYY"),
                end_date: dayjs(item.session_enddt).format("DD MMM YYYY"),
                status: item.status === 1 ? "Active" : "Ended",
            }));

            const sorted = [...formatted].sort((a, b) => b.name.localeCompare(a.name));
            setSessions(sorted);

            // Safe localStorage handling
            try {
                localStorage.setItem("sessions", JSON.stringify(sorted));
            } catch (e) {
                console.warn("Failed to save sessions to localStorage:", e);
            }

            // Active session
            const active = sorted.find((s) => s.status === "Active");
            if (active) {
                setActiveSession([
                    dayjs(active.start_date, "DD MMM YYYY"),
                    dayjs(active.end_date, "DD MMM YYYY"),
                ]);
                setSessionActive(true);
                try {
                    localStorage.setItem("activeSession", active.name);
                } catch (e) {
                    console.warn("Failed to save active session to localStorage:", e);
                }
            } else {
                setActiveSession(null);
                setSessionActive(false);
                try {
                    localStorage.removeItem("activeSession");
                } catch (e) {
                    console.warn("Failed to remove active session from localStorage:", e);
                }
            }
        } catch (err) {
            console.error(err);
            message.error("Failed to load sessions from API");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Clear any corrupted localStorage data first
        try {
            const sessionsData = localStorage.getItem("sessions");
            if (sessionsData) {
                JSON.parse(sessionsData); // Test if it's valid JSON
            }
        } catch (e) {
            console.warn("Corrupted sessions data in localStorage, clearing:", e);
            localStorage.removeItem("sessions");
        }

        try {
            const activeSessionData = localStorage.getItem("activeSession");
            if (activeSessionData && activeSessionData.includes("{")) {
                // If it looks like JSON but shouldn't be, clear it
                localStorage.removeItem("activeSession");
            }
        } catch (e) {
            console.warn("Corrupted active session data in localStorage, clearing:", e);
            localStorage.removeItem("activeSession");
        }

        loadSessions();
    }, []);

    // 🟢 Start Session
    const handleStartSession = () => {
        if (!selectedRange || !selectedRange.length) {
            message.warning("Please select a session date range first.");
            return;
        }

        const hasActive = sessions.some((s) => s.status === "Active");
        if (hasActive) {
            message.error("Please end the current active session before starting a new one.");
            return;
        }

        const lastEnded = sessions
            .filter((s) => s.status === "Ended")
            .sort(
                (a, b) =>
                    dayjs(b.end_date, "DD MMM YYYY") - dayjs(a.end_date, "DD MMM YYYY")
            )[0];

        if (
            lastEnded &&
            dayjs(selectedRange[0]).isSameOrBefore(
                dayjs(lastEnded.end_date, "DD MMM YYYY"),
                "day"
            )
        ) {
            message.error(
                `Session start date cannot be on or before previous session's end date (${lastEnded.end_date}).`
            );
            return;
        }

        confirm({
            title: "Confirm Start Session",
            icon: <ExclamationCircleOutlined />,
            // content: "Are you sure you want to start a new session? This will mark it as active.",
            content: (
                <div>
                    <p>Are you sure you want to start a new session? This will mark it as active.</p>
                    <p>
                        <strong>Selected Dates:</strong>{" "}
                        {dayjs(selectedRange[0]).format("DD MMM YYYY")} –{" "}
                        {dayjs(selectedRange[1]).format("DD MMM YYYY")}
                    </p>
                </div>
            ),
            okText: "Yes, Start Session",
            cancelText: "Cancel",
            async onOk() {
                try {
                    setBtnLoading(true);

                    const payload = {
                        session_startdt: dayjs(selectedRange[0]).format("YYYY-MM-DD"),
                        session_enddt: dayjs(selectedRange[1]).format("YYYY-MM-DD"),
                        status: 1,
                    };

                    // ✅ Call API
                    const res = await CmasterService.createSession(payload);

                    if (res?.data) {
                        message.success("New session started successfully!");
                        await loadSessions();      // reload locally
                        await fetchSessions();     // ✅ update global SessionContext
                        setSelectedRange([]);

                        // 🟢 Send notification
                        // const notification = {
                        //     title: "New Session Started",
                        //     description: `A new academic session has started from ${dayjs(selectedRange[0]).format("DD MMM YYYY")} to ${dayjs(selectedRange[1]).format("DD MMM YYYY")}.`,
                        //     status: "1"
                        // };
                        // 🟢 Send notification to both Institute and Students
                        const notification = {
                            title: "New Session Started",
                            description: `A new academic session has started from ${dayjs(selectedRange[0]).format("DD MMM YYYY")} to ${dayjs(selectedRange[1]).format("DD MMM YYYY")}.`,
                            status: "1"
                        };
                        await Promise.all([
                            InstituteService.saveNotification(notification),
                            StudentService.saveNotification(notification)
                        ]);
                        await InstituteService.saveNotification(notification);
                    }
                    else {
                        message.error("Failed to start session. Please try again.");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("Error creating session.");
                } finally {
                    setBtnLoading(false);
                }
            },
        });
    };

    // 🟢 End Session (manual)
    const handleEndSession = () => {
        if (!activeSession) {
            message.warning("No active session to end.");
            return;
        }

        confirm({
            title: "Confirm End Session",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to end the current active session?",
            okText: "Yes, End Session",
            cancelText: "Cancel",
            async onOk() {
                confirm({
                    title: "Final Confirmation",
                    icon: <ExclamationCircleOutlined />,
                    content: (
                        <div>
                            <p>This action is irreversible. Once ended, this session cannot be reactivated.</p>
                            <p><strong>Are you absolutely sure you want to end it?</strong></p>
                        </div>
                    ),
                    okText: "Yes, Confirm End",
                    cancelText: "Cancel",
                    async onOk() {
                        try {
                            setBtnLoading(true);

                            const active = sessions.find((s) => s.status === "Active");
                            if (!active) return message.warning("No active session found.");

                            const payload = { status: 0 };
                            const res = await CmasterService.updateSession(active.key, payload);

                            if (res?.data) {
                                message.success("Session ended successfully!");
                                await loadSessions();      // reload locally
                                await fetchSessions();     // ✅ update global SessionContext

                                // 🟢 Send notification
                                // const notification = {
                                //     title: "Session Ended",
                                //     description: `The session (${active.name}) has been ended successfully on ${dayjs().format("DD MMM YYYY")}.`,
                                //     status: "1"
                                // };
                                // 🟢 Send notification to both Institute and Students
                                const notification = {
                                    title: "Session Ended",
                                    description: `The session (${active.name}) has been ended successfully on ${dayjs().format("DD MMM YYYY")}.`,
                                    status: "1"
                                };
                                await Promise.all([
                                    InstituteService.saveNotification(notification),
                                    StudentService.saveNotification(notification)
                                ]);
                                await InstituteService.saveNotification(notification);
                            }
                            else {
                                message.error("Failed to end session.");
                            }
                        } catch (err) {
                            console.error(err);
                            message.error("Error ending session.");
                        } finally {
                            setBtnLoading(false);
                        }
                    },
                });
            },
        });

    };

    // 🟢 Edit Dates
    const handleEditDates = (record) => {
        setEditModal({
            open: true,
            record,
            range: [
                dayjs(record.start_date, "DD MMM YYYY"),
                dayjs(record.end_date, "DD MMM YYYY"),
            ],
        });
    };


    // 🟢 Save Edited End Date (API integrated)
    const handleSaveDates = async () => {
        if (!editModal.range || !editModal.range.length) {
            message.warning("Please select a new end date.");
            return;
        }

        confirm({
            title: "Confirm Update",
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to update the end date for ${editModal.record.name}?`,
            okText: "Yes, Update",
            cancelText: "Cancel",
            async onOk() {
                try {
                    setBtnLoading(true);

                    const payload = {
                        session_enddt: dayjs(editModal.range[1]).format("YYYY-MM-DD"),
                    };

                    // ✅ Update API call
                    const res = await CmasterService.updateSession(editModal.record.key, payload);

                    if (res?.data) {
                        message.success("Session end date updated successfully!");
                        loadSessions(); // reload list
                    } else {
                        message.error("Failed to update session end date.");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("Error updating session end date.");
                } finally {
                    setBtnLoading(false);
                    setEditModal({ open: false, record: null, range: [] });
                }
            },
        });
    };

    // 🗑 Delete Session
    const handleDeleteSession = (record) => {
        confirm({
            title: `Delete ${record.name}?`,
            icon: <ExclamationCircleOutlined />,
            content: "This action cannot be undone. Are you sure?",
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                try {
                    setBtnLoading(true);

                    // ✅ Delete API
                    const res = await CmasterService.deleteSession(record.key);

                    if (res?.data) {
                        message.success("Session deleted successfully!");
                        loadSessions();
                    } else {
                        message.error("Failed to delete session.");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("Error deleting session.");
                } finally {
                    setBtnLoading(false);
                }
            },
        });
    };

    const columns = [
        // { title: "Session", dataIndex: "name", key: "name" },
        {
    title: "Session",
    dataIndex: "name",
    key: "name",
    render: (_, record) => {
        const endYear = record.name?.split("-")[1]; // get 2nd year
        return endYear || record.name;
    },
},
        { title: "Start Date", dataIndex: "start_date", key: "start_date" },
        { title: "End Date", dataIndex: "end_date", key: "end_date" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "Active" ? "green" : "volcano"}>{status}</Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    {/* ✏️ Edit button — now visible for ALL sessions */}
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditDates(record)}
                    >
                        Edit End Date
                    </Button>

                    {/* 🗑 Delete button */}
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteSession(record)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="page-head-gradient" style={{ padding: '18px 24px' }}>
                <h2>Session Management</h2>
            </div>

            <div className="page-pad">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', border: 'none', color: '#fff', fontWeight: 600 }} icon={<ReloadOutlined />} onClick={loadSessions} loading={loading}>
                        Refresh
                    </Button>
                </div>

                {activeSession && (
                    <Row style={{ marginBottom: 16 }}>
                        <Col>
                            <Text strong>
                                Active Session:{" "}
                                <Tag color="green">
                                    {dayjs(activeSession[0]).format("DD MMM YYYY")} –{" "}
                                    {dayjs(activeSession[1]).format("DD MMM YYYY")}
                                </Tag>
                            </Text>
                        </Col>
                    </Row>
                )}

                <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 12 }}>
                <Col flex="auto">
                    <Text strong>Select Session Range:</Text>
                    {/* <RangePicker
                        value={activeSession || selectedRange}
                        onChange={setSelectedRange}
                        format="DD-MM-YYYY"
                        style={{ marginLeft: 8, width: "70%" }}
                        disabled={sessionActive || btnLoading}
                        disabledDate={(current) => {
                            const lastEnded = sessions
                                .filter((s) => s.status === "Ended")
                                .sort(
                                    (a, b) =>
                                        dayjs(b.end_date, "DD MMM YYYY") - dayjs(a.end_date, "DD MMM YYYY")
                                )[0];
                            if (!lastEnded) return false;
                            return (
                                current &&
                                current.isSameOrBefore(
                                    dayjs(lastEnded.end_date, "DD MMM YYYY"),
                                    "day"
                                )
                            );
                        }}
                    /> */}
                    <RangePicker
                        value={activeSession || selectedRange}
                        onChange={setSelectedRange}
                        format="DD-MM-YYYY"
                        style={{ marginLeft: 8, width: "70%" }}
                        disabled={sessionActive || btnLoading}
                        disabledDate={() => false}   // ✅ Allow selecting ANY date (past or future)
                    />
                </Col>
                <Col flex="none">
                    {!sessionActive ? (
                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={handleStartSession}
                            loading={btnLoading}
                        >
                            Start Session
                        </Button>
                    ) : (
                        <Button
                            danger
                            icon={<StopOutlined />}
                            onClick={handleEndSession}
                            loading={btnLoading}
                        >
                            End Session
                        </Button>
                    )}
                </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
                <Title level={5}>Session History</Title>
                <Table
                    size="small"
                    bordered
                    columns={columns}
                    dataSource={sessions}
                    pagination={false}
                    loading={loading}
                    rowClassName={(record) =>
                        record.status === "Active" ? "ant-table-row-selected" : ""
                    }
                />
            </div>

            {/* Edit Modal */}
            <Modal
                title={`Edit Session End Date - ${editModal.record?.name || ""}`}
                open={editModal.open}
                onOk={handleSaveDates}
                onCancel={() => setEditModal({ open: false, record: null, range: [] })}
                okText="Save"
            >
                <DatePicker
                    value={editModal.range[1]}
                    onChange={(value) =>
                        setEditModal((prev) => ({
                            ...prev,
                            range: [prev.range[0], value],
                        }))
                    }
                    format="DD-MM-YYYY"
                    style={{ width: "100%" }}
                    placeholder="Select New End Date"
                    disabledDate={(current) =>
                        current &&
                        current.isBefore(editModal.range[0], "day")
                    }
                />
                <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                    (Start date is fixed: {editModal.record?.start_date})
                </p>
            </Modal>

            </div>
        </div>
    );
};

export default SessionManagement;