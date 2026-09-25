
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import util from "../../../utils/util";
import StudentService from "../../../services/StudentService";
let $ = window.$;

function setActiveNav(path) {
    $(".nav-item").removeClass("active");

    $(".nav-link").each(function () {
        let href = $(this).attr("href") || $(this).attr("to"); // handle Link's 'to'
        if (href && path.indexOf(href) >= 0) {
            let li = $(this).closest("li");

            if (!li.hasClass("sidebar-mobile-offcanvas-toggler")) {
                li.addClass("active");

                // also mark parent dropdown li as active
                li.parents("li.nav-item").first().addClass("active");

                _closeResponsiveSidebar();
            }
        }
    });
}

function _closeResponsiveSidebar() {
    document.body.classList.remove("sidebar-mobile-open");
}

const useOnLocationChange = (handleLocationChange) => {
    const location = useLocation();
    useEffect(
        () => handleLocationChange(location),
        [location, handleLocationChange]
    );
};

export default function Leftnavs() {
    const modules = util.getModules();
    const [issueCount, setIssueCount] = useState({
        student: 0,
        institute: 0,
        total: 0
    });

    const closeResponsiveSidebar = (e) => {
        e.preventDefault();
        _closeResponsiveSidebar();
    };

    const init = () => {
        let wh = $(window).height();
        let h = wh - 0;
        $(".sidebarScrollDiv").css({ height: h + "px" });
    };

    const fetchIssueCount = async () => {
        // Only fetch issue count for super admin and client admin
        if (util.isAdmin() !== 1 && util.isClientAdmin() !== 1) {
            return;
        }
        
        try {
            const response = await StudentService.getIssueCount();
            const result = response.data?.result;
            if (result) {
                setIssueCount({
                    student: result.student_issues?.total || 0,
                    institute: result.institute_issues?.total || 0,
                    total: result.summary?.grand_total || 0
                });
            }
        } catch (error) {
            console.error('Error fetching issue count:', error);
        }
    };

    useOnLocationChange((loc) => {
        setActiveNav(loc.pathname);
    });

    useEffect(() => {
        init();
        fetchIssueCount();
        $(window).off("resize");
        $(window).resize(() => {
            init();
        });
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <div
                className="page-sidebar-cover"
                onClick={closeResponsiveSidebar}
            ></div>
            <div className="page-sidebar-wrapper d-print-none">
                <div className="page-sidebar navbar-collapse1 collapse1">
                    <div className="sidebarScrollDiv">
                        <ul
                            className="page-sidebar-menu page-header-fixed"
                            data-keep-expanded="false"
                            data-auto-scroll="true"
                            data-slide-speed="200"
                        >
                            <li className="sidebar-mobile-offcanvas-toggler d-lg-none">
                                <a
                                    href="/"
                                    className="responsive-toggler"
                                    onClick={closeResponsiveSidebar}
                                >
                                    <i className="icon-logout"></i>
                                </a>
                            </li>

                            {/* 1. Dashboard */}
                            {util.isAgent() !== 1 && (util.getUserType() !== 'CLIENT' || util.isAdmin() === 1 || util.isClientAdmin() === 1) && (
                                <li className="nav-item start">
                                    <Link to="/dashboard" className="nav-link">
                                        <i className="fa fa-th-large"></i>{" "}
                                        <span className="title">Dashboard</span>
                                    </Link>
                                </li>
                            )}

                            {/* 2. Students */}
                            {modules["view_students"] === 1 && (
                                <li className="nav-item">
                                    <Link to="/students" className="nav-link">
                                        <i className="fa fa-user-graduate"></i>{" "}
                                        <span className="title">Students</span>
                                    </Link>
                                </li>
                            )}

                            {/* 3. Institutes */}
                            {modules["view_institutes"] === 1 && (
                                <li className="nav-item">
                                    <Link to="/institutes" className="nav-link">
                                        <i className="fa fa-university"></i>{" "}
                                        <span className="title">Institutes</span>
                                    </Link>
                                </li>
                            )}

                            {/* 4. Agent */}
                            {(util.isAdmin() === 1 || util.isClientAdmin() === 1) && (
                                <li className="nav-item">
                                    <Link to="/agents" className="nav-link">
                                        <i className="fa fa-id-badge"></i>
                                        <span className="title">Agent</span>
                                    </Link>
                                </li>
                            )}

                            {/* 5. Applicant Response */}
                            {(util.isAdmin() === 1 || util.isClientAdmin() === 1) && (
                                <li className="nav-item">
                                    <Link to="/applicant-response" className="nav-link">
                                        <i className="fa fa-clipboard-check"></i>
                                        <span className="title">Applicant Response</span>
                                    </Link>
                                </li>
                            )}

                            {/* 6. Issues / Queries - Only for students and super admin/client admin */}
                            {(util.isStudent() === 1 || (modules["student_issues"] === 1 && (util.isAdmin() === 1 || util.isClientAdmin() === 1))) && (
                                <li className="nav-item">
                                    <Link to="/student-issues" className="nav-link">
                                        <i className="fa fa-exclamation-triangle"></i>{" "}
                                        <span className="title">Issue/Queries</span>
                                    </Link>
                                </li>
                            )}

                            {/* 7. Communication (dropdown) */}
                            {(util.isAdmin() === 1 || util.isClientAdmin() === 1) && (
                                <li className="nav-item">
                                    <a
                                        href="#!"
                                        className="nav-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            $("#comm-dropdown").slideToggle(200);
                                        }}
                                    >
                                        <i className="fa fa-comments"></i>
                                        <span className="title">Communication</span>
                                        <span className="arrow"></span>
                                    </a>
                                    <ul
                                        id="comm-dropdown"
                                        className="sub-menu"
                                        style={{ display: "none" }}
                                    >
                                        <li className="nav-item">
                                            <Link to="/email-templates" className="nav-link">
                                                Email Templates
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/whatsapp-templates" className="nav-link">
                                                WhatsApp Templates
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/campaign-templates" className="nav-link">
                                                Campaign
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/conversations" className="nav-link">
                                                Live Conversations
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* 8. Lead Allocation (dropdown) */}
                            {(util.isAdmin() === 1 || util.isClientAdmin() === 1) && (
                                <li className="nav-item">
                                    <a
                                        href="#!"
                                        className="nav-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            $("#lead-dropdown").slideToggle(200);
                                        }}
                                    >
                                        <i className="fa fa-handshake"></i>
                                        <span className="title">Lead Allocation</span>
                                        <span className="arrow"></span>
                                    </a>
                                    <ul
                                        id="lead-dropdown"
                                        className="sub-menu"
                                        style={{ display: "none" }}
                                    >
                                        <li className="nav-item">
                                            <Link to="/lead-assign-automation" className="nav-link">
                                                Lead Assign Automation
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* 9. Student Notifications */}
                            {(util.isStudent() === 1 || modules["student_notifications"] === 1) && (
                                <li className="nav-item">
                                    <Link to="/student-notifications" className="nav-link">
                                        <i className="fa fa-bell"></i>{" "}
                                        <span className="title">
                                            {util.isStudent() !== 1 ? "Student " : ""}Notifications
                                        </span>
                                    </Link>
                                </li>
                            )}

                            {/* 10. SIS Updates */}
                            {modules["student_notifications"] && (
                                <li className="nav-item">
                                    <Link to="/institute-notifications" className="nav-link">
                                        <i className="fa fa-sync-alt"></i>{" "}
                                        <span className="title">SIS Updates</span>
                                    </Link>
                                </li>
                            )}

                            {/* 11. Roles */}
                            {modules["manage_roles_users"] === 1 && (
                                <li className="nav-item">
                                    <Link to="/roles" className="nav-link">
                                        <i className="fa fa-user-shield"></i>{" "}
                                        <span className="title">Roles</span>
                                    </Link>
                                </li>
                            )}

                            {/* 12. Master */}
                            {modules["manage_cmasters"] === 1 && (
                                <li className="nav-item">
                                    <Link to="/cmasters" className="nav-link">
                                        <i className="fa fa-sliders-h"></i>{" "}
                                        <span className="title">Master</span>
                                    </Link>
                                </li>
                            )}

                            {/* 13. Application Engine */}
                            {(util.isAdmin() === 1 || util.isClientAdmin() === 1) && (
                                <li className="nav-item">
                                    <Link to="/application-engine" className="nav-link">
                                        <i className="fa fa-cogs"></i>
                                        <span className="title">Application Engine</span>
                                    </Link>
                                </li>
                            )}

                            {/* 14. Setting */}
                            {(util.isAdmin() === 1 || util.isClientAdmin() === 1) && (
                                <li className="nav-item">
                                    <Link to="/setting" className="nav-link">
                                        <i className="fa fa-cog"></i>
                                        <span className="title">Setting</span>
                                    </Link>
                                </li>
                            )}

                            {/* 14. Website Settings */}
                            {(util.isAdmin() === 1 || util.isClientAdmin() === 1) && (
                                <li className="nav-item" style={{ marginBottom: 12 }}>
                                    <Link to="/website-settings" className="nav-link">
                                        <i className="fa fa-palette"></i>
                                        <span className="title">CMS Studio</span>
                                    </Link>
                                </li>
                            )}
                            {/* ---------- Institute-specific links (kept as-is below; only show for institutes) ---------- */}
                            {util.isInstitute() === 1 && (
                                <>
                                    <li className="nav-item">
                                        <Link to="/icourses" className="nav-link">
                                            <i className="fa fa-book-open"></i>{" "}
                                            <span className="title">Courses</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/istudents" className="nav-link">
                                            <i className="fa fa-user-graduate"></i>{" "}
                                            <span className="title">Students</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/profile" className="nav-link">
                                            <i className="fa fa-user-circle"></i>{" "}
                                            <span className="title">My profile</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/iabout" className="nav-link">
                                            <i className="fa fa-info-circle"></i>{" "}
                                            <span className="title">About</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/idocuments" className="nav-link">
                                            <i className="fa fa-folder-open"></i>{" "}
                                            <span className="title">Documents</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/institute-notifications" className="nav-link">
                                            <i className="fa fa-sync-alt"></i>{" "}
                                            <span className="title">SIS Updates</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/blacklist-Country" className="nav-link">
                                            <i className="fa fa-ban"></i>{" "}
                                            <span className="title">Blacklist Country</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-issues" className="nav-link">
                                            <i className="fa fa-exclamation-triangle"></i>{" "}
                                            <span className="title">Student's Issue</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/institute-queries" className="nav-link">
                                            <i className="fa fa-question-circle"></i>{" "}
                                            <span className="title">Issues & Queries</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-comunications" className="nav-link">
                                            <i className="fa fa-comments"></i>{" "}
                                            <span className="title">Communications</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-payment-proof" className="nav-link">
                                            <i className="fa fa-receipt"></i>{" "}
                                            <span className="title">Payment</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-visa-letter" className="nav-link">
                                            <i className="fa fa-plane-departure"></i>{" "}
                                            <span className="title">Visa and Admission Letter</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-pickup-schedule" className="nav-link">
                                            <i className="fa fa-shuttle-van"></i>{" "}
                                            <span className="title">Pickup Schedule</span>
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Student-specific links */}
                            {util.isStudent() === 1 && (
                                <>
                                    <li className="nav-item">
                                        <Link to="/student-application" className="nav-link">
                                            <i className="fa fa-file-alt"></i>{" "}
                                            <span className="title">Application Form</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-comunications" className="nav-link">
                                            <i className="fa fa-envelope-open-text"></i>{" "}
                                            <span className="title">Communications</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-result" className="nav-link">
                                            <i className="fa fa-award"></i>{" "}
                                            <span className="title">Result</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-payment-proof" className="nav-link">
                                            <i className="fa fa-file-invoice-dollar"></i>{" "}
                                            <span className="title">Upload Payment Proof</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-visa-letter" className="nav-link">
                                            <i className="fa fa-passport"></i>{" "}
                                            <span className="title">Visa and Admission Letter</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/student-pickup-schedule" className="nav-link">
                                            <i className="fa fa-calendar-check"></i>{" "}
                                            <span className="title">Pickup Schedule</span>
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Agent-specific */}
                            {util.isAgent() === 1 && (
                                <li className="nav-item">
                                    <Link to="/agent-create-url-links" className="nav-link">
                                        <i className="fa fa-link"></i>{" "}
                                        <span className="title">Create Url Links</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

