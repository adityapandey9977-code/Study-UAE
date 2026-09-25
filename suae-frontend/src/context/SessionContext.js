import { createContext, useState, useEffect } from "react";
import CmasterService from "../services/CmasterService";
import dayjs from "dayjs";
import { message } from "antd";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [selectedSession, setSelectedSession] = useState(
        JSON.parse(localStorage.getItem("selectedSession")) || {}
    );
    const [activeSession, setActiveSession] = useState(
        localStorage.getItem("activeSession") || ""
    );
    const [sessions, setSessions] = useState([]);

    // 🟢 Fetch sessions globally
    // const fetchSessions = async () => {
    //     try {
    //         const response = await CmasterService.getSessions();
    //         const apiData = response?.data?.result || [];

    //         const formatted = apiData.map((item) => ({
    //             key: item.id,
    //             name: `${dayjs(item.session_startdt).year()}-${dayjs(item.session_enddt).year()}`,
    //             start_date: dayjs(item.session_startdt).format("DD MMM YYYY"),
    //             end_date: dayjs(item.session_enddt).format("DD MMM YYYY"),
    //             status: item.status === 1 ? "Active" : "Ended",
    //         }));

    //         const sorted = [...formatted].sort((a, b) => b.name.localeCompare(a.name));
    //         setSessions(sorted);
    //         localStorage.setItem("sessions", JSON.stringify(sorted));

    //         const active = sorted.find((s) => s.status === "Active");
    //         if (active) {
    //             setActiveSession(active.name);
    //             localStorage.setItem("activeSession", active.name);
    //         } else {
    //             setActiveSession("");
    //             localStorage.removeItem("activeSession");
    //         }
    //     } catch (err) {
    //         console.error("Session fetch error:", err);
    //         if (err.response?.status !== 401) {
    //             message.error("Failed to fetch sessions globally");
    //         }
    //     }
    // };

    const fetchSessions = async () => {
        try {
            // ✅ Check role from localStorage
            const isAdmin = localStorage.getItem("is_admin") === "1";
            const isClientAdmin = localStorage.getItem("is_client_admin") === "1";
            const isInstitute = localStorage.getItem("is_institute") === "1";
            const isStudent = localStorage.getItem("is_student") === "1";
            const userType = localStorage.getItem("user_type");

            // ✅ Allow these roles: admin, client admin, institute, student, AND any CLIENT type user (including counsellors)
            const isAllowed = isAdmin || isClientAdmin || isInstitute || isStudent || userType === 'CLIENT';

            if (!isAllowed) {
                console.log("🚫 Session fetch skipped — not an admin/institute/client admin");
                setSessions([]);
                setActiveSession("");
                localStorage.removeItem("sessions");
                localStorage.removeItem("activeSession");
                return;
            }

            // ✅ Proceed to call API
            const response = await CmasterService.getSessions();
            const apiData = response?.data?.result || [];

            const formatted = apiData.map((item) => ({
                key: item.id,
                name: `${dayjs(item.session_startdt).year()}-${dayjs(item.session_enddt).year()}`,
                fullName: `${dayjs(item.session_startdt).year()}-${dayjs(item.session_enddt).year()}`,
                start_date: dayjs(item.session_startdt).format("DD MMM YYYY"),
                end_date: dayjs(item.session_enddt).format("DD MMM YYYY"),
                status: item.status === 1 ? "Active" : "Ended",
            }));

            const sorted = [...formatted].sort((a, b) => b.name.localeCompare(a.name));
            setSessions(sorted);
            localStorage.setItem("sessions", JSON.stringify(sorted));
            console.log("sorted",sorted)

            // ✅ Set active session
            const active = sorted.find((s) => s.status === "Active");
            if (active) {
                setActiveSession(active.name);
                localStorage.setItem("activeSession", active.name);
            } else {
                setActiveSession("");
                localStorage.removeItem("activeSession");
            }

        } catch (err) {
            console.error("Session fetch error:", err);
            if (err.response?.status !== 401) {
                message.error("Failed to fetch sessions globally");
            }
        }
    };
    // 🕒 Fetch sessions after login or reload

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) fetchSessions();

        // 🟢 Listen for login success (custom event)
        const handleLogin = () => {
            const tokenNow = localStorage.getItem("token");
            if (tokenNow) fetchSessions();
        };

        window.addEventListener("loginSuccess", handleLogin);

        return () => {
            window.removeEventListener("loginSuccess", handleLogin);
        };
    }, []); // run once

    // 🟢 Trigger event manually right after login
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Dispatch loginSuccess to load sessions instantly
            window.dispatchEvent(new Event("loginSuccess"));
        }
    }, []);

    return (
        <SessionContext.Provider
            value={{
                selectedSession,
                setSelectedSession,
                activeSession,
                setActiveSession,
                sessions,
                setSessions,
                fetchSessions,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};
