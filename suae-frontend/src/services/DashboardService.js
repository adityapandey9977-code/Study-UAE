import axiosInstance from "../utils/axiosnode";

class DashboardService {
    instituteScoreboard(institute_id, sessionName) {
        return axiosInstance.get(`dashboard/institute/${institute_id}/summary?session=${encodeURIComponent(sessionName)}`);
    }

    instituteCourseSummary(institute_id, sessionName) {
        return axiosInstance.get(`dashboard/institute/${institute_id}/course-summary?session=${encodeURIComponent(sessionName)}`);
    }

    instituteCountrySummary(institute_id, sessionName) {
        return axiosInstance.get(`dashboard/institute/${institute_id}/country-summary?session=${encodeURIComponent(sessionName)}`);
    }

    instituteEmailsSent(institute_id, sessionName) {
        return axiosInstance.get(`dashboard/institute/${institute_id}/emails-sent?session=${encodeURIComponent(sessionName)}`);
    }

    instituteWhatsappSent(institute_id, sessionName) {
        return axiosInstance.get(`dashboard/institute/${institute_id}/whatsapp-sent?session=${encodeURIComponent(sessionName)}`);
    }

    instituteNotifications(institute_id) {
        return axiosInstance.get(`dashboard/institute/${institute_id}/notifications`);
    }

    instituteAcceptanceStats() {
        return axiosInstance.get(`dashboard/institute-acceptance-stats`);
    }

    overallStats() {
        return axiosInstance.get(`dashboard/overall-stats`);
    }

    statusBreakdown() {
        return axiosInstance.get(`dashboard/status-breakdown`);
    }
}
// eslint-disable-next-line
export default new DashboardService();