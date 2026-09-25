import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import util from "../../../utils/util";
import { MaleUserIcon, FemaleUserIcon } from "../../../utils/Icons";
import { BellOutlined, DownOutlined } from "@ant-design/icons";
import { Badge, Select, Dropdown, Menu } from "antd";
import StudentService from "../../../services/StudentService";
import InstituteService from "../../../services/InstituteService";
import { SessionContext } from "../../../context/SessionContext";
import { useDynamicLogo } from "../../../hooks/useDynamicLogo";
import themeLoader from "../../../utils/themeLoader";

let $ = window.$;
const { Option } = Select;

export default function Header({ hideSidebarToggle = false, showCmsBackLink = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [notiCount, setNotiCount] = useState(0);

    // Use dynamic logo hook for global logo (used by everyone)
    const dynamicLogo = useDynamicLogo();

    // ✅ Context for session
    const { selectedSession, setSelectedSession, sessions } = useContext(SessionContext);

    const pathname = String(location?.pathname || "").replace(/\/+$/, "") || "/";
    const showSessionDropdown = [
        "/dashboard",
        "/students",
        "/campaign-templates",
        "/student-issues",
        "/institute-queries",
        "/applicant-response",
    ].some((p) => pathname === p || pathname.startsWith(p + "/"));

    const toggleSidebarCollapse = (e) => {
        e.preventDefault();
        $("body").toggleClass("page-sidebar-closed");
    };

    const toggleResponsiveSidebarCollapse = (e) => {
        e.preventDefault();
        document.body.classList.toggle("sidebar-mobile-open");
    };

    const getNotiCount = () => {
        const obj = util.isInstitute() ? InstituteService : StudentService;
        obj.unreadNotificationsCount()
            .then(({ data }) => {
                const raw = (data && (data.result ?? data.count ?? data.data)) ?? 0;
                const n = Number(raw);
                setNotiCount(Number.isFinite(n) && n > 0 ? n : 0);
            })
            .catch((e) => console.error(e.message));
    };

    // Everyone uses the global dynamic logo
    const logoUrl = dynamicLogo;

    // ✅ Sync sessions and default selection
    useEffect(() => {
        getNotiCount();

        // Load active theme from backend (after user is logged in)
        themeLoader.init().catch(err => {
            console.error('Failed to load theme:', err);
        });

        // Run only when sessions are available
        if (sessions && sessions.length > 0) {
            let stored = null;
            try {
                const raw = localStorage.getItem("selectedSession");
                stored = raw ? JSON.parse(raw) : null;
            } catch (err) {
                console.error("Invalid JSON in localStorage:", err.message);
                localStorage.removeItem("selectedSession");
            }

            const active = sessions.find((s) => s.status === "Active");

            if (stored && stored.name) {
                const fullStoredSession = sessions.find((s) => s.name === stored.name);
                if (fullStoredSession) {
                    setSelectedSession(fullStoredSession);
                    localStorage.setItem("selectedSession", JSON.stringify(fullStoredSession));
                } else if (active) {
                    setSelectedSession(active);
                    localStorage.setItem("selectedSession", JSON.stringify(active));
                } else {
                    setSelectedSession({});
                    localStorage.removeItem("selectedSession");
                }
            } else if (active) {
                setSelectedSession(active);
                localStorage.setItem("selectedSession", JSON.stringify(active));
            } else {
                setSelectedSession({});
                localStorage.removeItem("selectedSession");
            }
        } else {
            // No sessions loaded -> clear selection
            setSelectedSession({});
            localStorage.removeItem("selectedSession");
        }

        // ✅ Refresh notifications
        let interval;
        if (!window.location.href.includes("localhost")) {
            interval = setInterval(getNotiCount, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [sessions, setSelectedSession]); // ✅ add sessions as dependency


    // ✅ Handle dropdown change → set proper date range
    const handleSessionChange = (val) => {
        // Find the full session object from the sessions array
        const fullSession = sessions.find(s => s.name === val);

        if (fullSession) {
            // Use the full session object which includes the key (ID)
            setSelectedSession(fullSession);
            localStorage.setItem("selectedSession", JSON.stringify(fullSession));

            // ✅ Trigger custom event for Students.js to listen
            window.dispatchEvent(new CustomEvent("sessionChanged", { detail: fullSession }));
        } else {
            // Fallback to the old method if session not found
            const [start, end] = val.split("-").map(Number);
            const sessionObj = {
                name: val,
                startDate: `${start}-11-01`,
                endDate: `${end}-10-31`,
            };
            setSelectedSession(sessionObj);
            localStorage.setItem("selectedSession", JSON.stringify(sessionObj));
            window.dispatchEvent(new CustomEvent("sessionChanged", { detail: sessionObj }));
        }
    };

    const getSessionDisplayName = (session) => {
        const name = String(session?.name || "");
        const m = name.match(/(\d{4})-(\d{4})/);
        return m ? m[2] : name;
    };

    return (
        <div className="page-header navbar navbar-fixed-top d-print-none" style={{ fontWeight: 600 }}>
            <div className="d-flex align-items-center pl20 pr20 h-100"
            style={{
                   height: "60px"
                 }}>

                {/* Logo Section */}
                <div className="d-flex align-items-center page-logo pr15" style={{ minWidth: "150px",  height: "60px" }}>
                    {logoUrl === null ? (
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "40px", width: "120px" }}>
                            <div className="spinner-border spinner-border-sm text-dark" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={logoUrl || "theme/img/sis-logo.png"}
                            className="logo-default p-1"
                            style={{
                                maxHeight: "70px",
                                maxWidth: "250px",
                                width: "auto",
                                objectFit: "contain",
                                
                            }} alt="Logo"
                        />
                    )}
                    {!hideSidebarToggle && (
                        <div className="menu-toggler sidebar-toggler" onClick={toggleSidebarCollapse}>
                            <span></span>
                        </div>
                    )}
                </div>

                {/* Right Side */}
                <div className="ml-auto d-flex align-items-center">
                    {showCmsBackLink && (
                        <Link
                            to="/dashboard"
                            className="btn btn-sm mr15"
                            style={{
                                background: "rgba(0,0,0,0.06)",
                                border: "1px solid rgba(0,0,0,0.12)",
                                color: "#1a1a2e",
                                fontWeight: 600
                            }}
                        >
                            <i className="fa fa-arrow-left" style={{ marginRight: "6px" }}></i>
                            Admin Panel
                        </Link>
                    )}

                    {/* Notifications */}
                    {(util.isStudent() === 1 || util.isInstitute() === 1) && (
                        <div
                            className="pr30 cpointer noselect"
                            onClick={() =>
                                navigate(
                                    util.isStudent()
                                        ? "/student-notifications"
                                        : "/institute-notifications"
                                )
                            }
                        >
                            <Badge count={notiCount || 0} showZero={false} size="small">
                                <BellOutlined className="text-dark fs22" />
                            </Badge>
                        </div>
                    )}

                    {/* Session Dropdown */}
                    {(util.isAdmin() === 1 || util.isClientAdmin() === 1 || util.isInstitute() === 1) && showSessionDropdown && (
                        <div className="pr15 d-flex align-items-center">
                            <span className="mr5 text-dark" style={{ fontWeight: 700, fontSize: 14 }}>
                                Session:
                            </span>
                            <Select
                                value={selectedSession && selectedSession.name ? selectedSession.name : undefined}
                                onChange={handleSessionChange}
                                style={{
                                    minWidth: 100,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: "#1a1a2e",
                                    background: "rgba(0,0,0,0.04)",
                                    border: "1px solid rgba(0,0,0,0.08)",
                                    borderRadius: 8,
                                    textAlign: "center",
                                }}
                                dropdownStyle={{ textAlign: "center", borderRadius: 8 }}
                                placement="bottomLeft"
                                listHeight={300}
                                virtual={false}
                                getPopupContainer={(triggerNode) => triggerNode.closest('.overflow-auto') || triggerNode.closest('.page-content') || document.body}
                                dropdownAlign={{
                                    points: ['tl', 'bl'],
                                    offset: [0, 8],
                                    overflow: { adjustX: true, adjustY: false }
                                }}
                            >
                                {sessions.map((s) => (
                                    <Option key={s.name} value={s.name}>
                                        {getSessionDisplayName(s)}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}

                    {/* User Avatar */}
                    <div>
                        {util.getGender() === "Female" ? (
                            <FemaleUserIcon width="36" className="rounded" />
                        ) : (
                            <MaleUserIcon width="36" className="rounded" />
                        )}
                    </div>

                    {/* Profile / Logout */}
                    <div className="pl15 d-flex align-items-center">
                        <Dropdown
                            placement="bottomRight"
                            arrow
                            trigger={["click"]}
                            overlay={
                                <Menu>
                                    <Menu.Item key="1">
                                        {util.isStudent() === 1 ? (
                                            <div className="link" onClick={() => navigate("/profile")}>
                                                <i className="fa fa-cog"></i> Change Password
                                            </div>
                                        ) : (
                                            <div className="link" onClick={() => navigate("/profile")}>
                                                <i className="fa fa-user"></i> My Profile
                                            </div>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item key="2">
                                        <div className="link" onClick={(e) => util.logout(e, navigate)}>
                                            <i className="fa fa-sign-out-alt"></i> Logout
                                        </div>
                                    </Menu.Item>
                                </Menu>
                            }
                        >
                            <span className="cpointer">
                                {util.getLoggedName()} &nbsp;&nbsp;
                                <DownOutlined className="fs16" />
                            </span>
                        </Dropdown>
                    </div>

                    {/* Mobile sidebar toggler */}
                    <a
                        href="/"
                        className="menu-toggler responsive-toggler"
                        onClick={toggleResponsiveSidebarCollapse}
                    >
                        <span></span>
                    </a>
                </div>
            </div>
        </div>
    );
}
