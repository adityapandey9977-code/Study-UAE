import axios from "../utils/axios";
import axiosnode, { axiosPublicInstance } from "../utils/axiosnode";
import util from "../utils/util";
class CmasterService {
    acadCareers(params) {
        return axios.get("cmaster/acadCareers", { params });
    }
    saveAcadCareer(data) {
        return axios.post("cmaster/saveAcadCareer", data);
    }
    deleteAcadCareer(id) {
        return axios.post("cmaster/deleteAcadCareer", { id });
    }


    boards(type, params) {
        return axios.get("cmaster/boards/" + type, { params });
    }
    saveBoard(data) {
        return axios.post("cmaster/saveBoard", data);
    }
    deleteBoard(id) {
        return axios.post("cmaster/deleteBoard", { id });
    }


    genders(params) {
        return axios.get("cmaster/genders", { params });
    }
    saveGender(data) {
        return axios.post("cmaster/saveGender", data);
    }
    deleteGender(id) {
        return axios.post("cmaster/deleteGender", { id });
    }

    currencies(params) {
        return axios.get("cmaster/currencies", { params });
    }
    allCurrencies(params) {
        return axios.get("cmaster/currencies/ALL", { params });
    }
    // ✅ Add country to blacklist
    addBlacklistedCountry(data) {
        // data: { institute_id, country_code, country_name }
        return axios.post("/saveblacklist", data);
    }

    // ✅ Fetch blacklisted countries (POST with body)
    showAllBlacklistedCountries(data) {
        // data: { institute_id }
        return axios.post("/showblacklist", data);
    }
    // ✅ Remove country from blacklist
    removeBlacklistedCountry(data) {
        // data: { institute_id, country_code }
        return axios.post(`/deleteblacklist/${data.id}`, {
            institute_id: data.institute_id,
        });
    }
    //Edit country
    editBlacklistedCountry(data) {
        return axios.post(`/editblacklist/${data.id}`, {
            institute_id: data.institute_id,
            country_code: data.country_code,
            country_name: data.country_name
        });
    }
    //get inst id
    getInstituteId() {
        return axios.get("/getins");
    }
    //get country detail
    getStuCountryDetail() {
        return axios.get("/studentcountry");
    }
    //Pass student country to backend
    passStudentCountry(data) {
        return axios.post("/studentInstituteCourses", data);
    }
    saveCurrency(data) {
        return axios.post("cmaster/saveCurrency", data);
    }
    deleteCurrency(id) {
        return axios.post("cmaster/deleteCurrency", { id });
    }
    countries(params) {
        return axios.get("cmaster/countries", { params });
    }
    allCountries(params) {
        return axios.get("cmaster/countries/ALL", { params });
    }
    saveCountry(data) {
        return axios.post("cmaster/saveCountry", data);
    }
    deleteCountry(id) {
        return axios.post("cmaster/deleteCountry", { id });
    }

    allStates(params) {
        return axios.get("cmaster/states/ALL", { params });
    }

    disciplines(params) {
        return axios.get("cmaster/disciplines", { params });
    }
    allDisciplines(params) {
        return axios.get("cmaster/disciplines/ALL", { params });
    }
    saveDiscipline(data) {
        return axios.post("cmaster/saveDiscipline", data);
    }
    deleteDiscipline(id) {
        return axios.post("cmaster/deleteDiscipline", { id });
    }


    courseTypes(params) {
        return axios.get("cmaster/courseTypes", { params });
    }
    saveCourseType(data) {
        return axios.post("cmaster/saveCourseType", data);
    }
    deleteCourseType(id) {
        return axios.post("cmaster/deleteCourseType", { id });
    }


    courses(params) {
        return axios.get("cmaster/courses", { params });
    }
    allCourses(params) {
        return axios.get("cmaster/courses/ALL", { params });
    }
    saveCourse(data) {
        return axios.post("cmaster/saveCourse", data);
    }
    deleteCourse(id) {
        return axios.post("cmaster/deleteCourse", { id });
    }

    specializations(params) {
        return axios.get("cmaster/specializations", { params });
    }
    allSpecializations(params) {
        return axios.get("cmaster/specializations/ALL", { params });
    }
    saveSpecialization(data) {
        return axios.post("cmaster/saveSpecialization", data);
    }
    deleteSpecialization(id) {
        return axios.post("cmaster/deleteSpecialization", { id });
    }

    followupCats(params) {
        return axios.get("cmaster/followupCats", { params });
    }
    allFollowupCats(params) {
        return axios.get("cmaster/followupCats/ALL", { params });
    }
    saveFollowupCat(data) {
        return axios.post("cmaster/saveFollowupCat", data);
    }
    deleteFollowupCat(id) {
        return axios.post("cmaster/deleteFollowupCat", { id });
    }

    eduQualifications(params) {
        return axios.get("cmaster/eduQualifications", { params });
    }
    allEduQualifications(params) {
        return axios.get("cmaster/eduQualifications/ALL", { params });
    }
    saveEduQualification(data) {
        return axios.post("cmaster/saveEduQualification", data);
    }
    deleteEduQualification(id) {
        return axios.post("cmaster/deleteEduQualification", { id });
    }

    issuesCats(params) {
        return axios.get("cmaster/issuesCats", { params });
    }
    allIssuesCats(params) {
        return axios.get("cmaster/issuesCats/ALL", { params });
    }
    saveIssuesCat(data) {
        return axios.post("cmaster/saveIssuesCat", data);
    }
    deleteIssuesCat(id) {
        return axios.post("cmaster/deleteIssuesCat", { id });
    }

    registerAgent(data) {
        return axios.post("agent/register", data);
    }
    verifyOtp(data) {
        return axios.post("agent/verify-otp", data);
    }

    // Apis for Super Admin
    getClientDashDetail = async (session) => {
        const { data } = await axiosnode.get(`scoreboard/student?session=${encodeURIComponent(session)}`);
        return data;
    };

    // New corrected API for Student Scoreboard
    getClientDashDetailCorrected = async (session) => {
        const { data } = await axiosnode.get(`dashboard/student-scoreboard-corrected?session=${encodeURIComponent(session)}`);
        return data;
    };

    // Smart API call - use corrected API locally, fallback to old API in production
    getClientDashDetailSmart = async (session) => {
        try {
            // Try the corrected API first (works locally and in production once deployed)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // Local development - use localhost API
                const nodeBaseUrl = String(util.apiUrlNode || "").replace(/\/$/, "");
                const response = await fetch(`${nodeBaseUrl}/dashboard/student-scoreboard-corrected?session=${encodeURIComponent(session)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': util.getNodeToken(),
                        'Sessionid': util.getSessionId()
                    }
                });
                const data = await response.json();
                return data;
            } else {
                // Production - try corrected API first, fallback to old API
                try {
                    const { data } = await axiosnode.get(`dashboard/student-scoreboard-corrected?session=${encodeURIComponent(session)}`);
                    return data;
                } catch (error) {
                    console.warn('Corrected API not available, falling back to old API:', error);
                    // Fallback to old API
                    const { data } = await axiosnode.get(`scoreboard/student?session=${encodeURIComponent(session)}`);
                    // Transform old API response to match new structure
                    return {
                        message: data.message || "",
                        result: {
                            success: true,
                            student_scoreboard: data.result || {}
                        }
                    };
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    getInstituteDashDeatil = async (session) => {
        const { data } = await axiosnode.get(`scoreboard/institute?session=${encodeURIComponent(session)}`);
        return data;
    };

    getGenderRatio = async (session) => {
        const { data } = await axiosnode.get(`dashboard/gender-ratio?session=${encodeURIComponent(session)}`);
        return data;
    };

    getStuIssueStats = async (session) => {
        const { data } = await axiosnode.get(`dashboard/issues-stats?session=${encodeURIComponent(session)}`);
        return data;
    };

    getAgeRange = async (session) => {
        const { data } = await axiosnode.get(`dashboard/age-range?session=${encodeURIComponent(session)}`);
        return data;
    };

    getTopInstitutes = async (session) => {
        const { data } = await axiosnode.get(`dashboard/top-institutes?session=${encodeURIComponent(session)}`);
        return data;
    };

    getTopCountries = async (session) => {
        const { data } = await axiosnode.get(`dashboard/top-countries?session=${encodeURIComponent(session)}`);
        return data;
    };

    getAgentStage = async (session) => {
        const params = { session };
        const agentUserId = util.getAgentUserId() || (util.isAgent() === 1 ? util.getUserId() : '');
        if (agentUserId) params.agent_user_id = agentUserId;
        const { data } = await axiosnode.get('scoreboard/agent', { params });
        return data;
    };

    getCommunicationsSummary = async () => {
        const { data } = await axiosnode.get('dashboard/communications');
        return data;
    }
    getQueryStatus = async () => {
        const { data } = await axiosnode.get('dashboard/query-status');
        return data;
    }
    getTopAgents = async () => {
        const { data } = await axiosnode.get('dashboard/top-agents');
        return data;
    }

    // Lead Allocation & Automations
    leadAutomations(params) {
        // API: GET /lead-automations?page=&page_size=&search=&status=
        return axiosnode.get('lead-automations', { params });
    }

    getLeadAutomation(id) {
        // API: GET /lead-automations/:id
        return axiosnode.get(`lead-automations/${id}`);
    }

    createLeadAutomation(data) {
        // API: POST /student/assign/auto (user-requested wiring)
        return axiosnode.post('/lead-automations', data);
    }

    assignStudentsAutomatically(data) {
        return axiosnode.post('student/assign/auto', data);
    }

    previewStudentsAutoAssign(data) {
        return axiosnode.post('student/assign/preview', data);
    }

    updateLeadAutomation(id, data) {
        // API: PUT /lead-automations/:id
        return axiosnode.put(`lead-automations/${id}`, data);
    }

    deleteLeadAutomation(id) {
        // API: DELETE /lead-automations/:id
        return axiosnode.delete(`lead-automations/${id}`);
    }

    // Email Templates APIs
    emailTemplates(params) {
        return axiosnode.get("email-templates", { params });
    }
    saveEmailTemplate(data) {
        return axiosnode.post("email-templates", data);
    }
    getEmailTemplate(id) {
        return axiosnode.get(`email-templates/${id}`);
    }
    updateEmailTemplate(id, data) {
        return axiosnode.put(`email-templates/${id}`, data);
    }
    deleteEmailTemplate(id) {
        return axiosnode.delete(`email-templates/${id}`);
    }

    // Logo management (New Node.js API)
    getAllLogos() {
        return axiosnode.get('/logos');
    }
    getActiveLogo() {
        return axiosPublicInstance.get('/public/logo/active');
    }
    uploadLogoFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return axiosnode.post('/file/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    createLogo(logoData) {
        return axiosnode.post('/logos', logoData);
    }
    setActiveLogo(id) {
        return axiosnode.post(`/logos/${id}/activate`);
    }
    deleteLogo(id) {
        return axiosnode.delete(`/logos/${id}`);
    }

    // WhatsApp Templates APIs (Dummy Data)
    whatsappTemplates(params = {}) {
        // Default pagination parameters
        const defaultParams = {
            p: 1,
            ps: 50
        };

        // Merge default params with provided params
        const queryParams = {
            ...defaultParams,
            ...params,
        };

        return axiosnode.get('/whatsapp-templates', {
            params: queryParams
        });
    }

    saveWhatsappTemplate(data) {
        const payload = {
            ...data,
            ...(data.type && !data.category ? { category: data.type } : {}),
            ...(data.category && { category: data.category.toUpperCase().replace(/\s+/g, '_') }),
            ...(data.status && { status: data.status.toUpperCase() }),
            ...(data.message && !data.body && { body: data.message }),

            // Default Values
            status: (data.status || 'DRAFT').toUpperCase(),
            language: data.language || 'en',
            media_type: (data.media_type || 'TEXT').toUpperCase(),

            // Ensure required fields are included
            name: data.name,
            body: data.body || data.message
        };

        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        return axiosnode.post('/whatsapp-templates', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    getWhatsappTemplate(id) {
        return axiosnode.get(`/whatsapp-templates/${id}`);
    }

    updateWhatsappTemplate(id, data) {
        const payload = {
            ...data,
            ...(data.type && !data.category ? { category: data.type } : {}),
            ...(data.category ? { category: data.category.toUpperCase().replace(/\s+/g, '_') } : {}),
            ...(data.status ? { status: data.status.toUpperCase() } : {}),
            ...(data.message && !data.body ? { body: data.message } : {}),
        };

        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        return axiosnode.put(`/whatsapp-templates/${id}`, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteWhatsappTemplate(id) {
        return axiosnode.delete(`/whatsapp-templates/${id}`);
    }

    // ===============================
    // ✅ Session Management APIs
    // ===============================

    // Get all sessions (with optional search/status filters)
    getSessions(params) {
        return axiosnode.get("master/sessions", { params });
    }

    // Create a new session
    createSession(data) {
        return axiosnode.post("master/sessions", data);
    }

    // Get session by ID
    getSessionById(id) {
        return axiosnode.get(`master/sessions/${id}`);
    }

    // Update session by ID
    updateSession(id, data) {
        return axiosnode.put(`master/sessions/${id}`, data);
    }

    // Delete session by ID
    deleteSession(id) {
        return axiosnode.delete(`master/sessions/${id}`);
    }

    saveTheme(data) {
        return axiosnode.post("color-schemes", data);
    }

    getThemes() {
        return axiosnode.get("color-schemes");
    }

    deleteTheme(id) {
        return axiosnode.delete(`color-schemes/${id}`);
    }

    activateTheme(id, data = { status: "ACTIVE", is_active: true }) {
        return axiosnode.put(`color-schemes/${id}`, data);
    }

    // ===============================
    // ✅ Student Communication APIs (Super Admin)
    // ===============================

    // Fetch all students who have communications
    getStudentCommunications(params) {
        // API: GET /student/communications?p=&ps=&k=&sender=
        return axiosnode.get("student/communications", { params });
    }

    // Fetch single student’s full communication history
    getStudentCommunicationById(studentId) {
        // API: GET /student/:student_id/communications
        return axiosnode.get(`student/${studentId}/communications`);
    }

    // Get list of communication senders for filtering
    getCommunicationSenders() {
        // Reuse the existing communications endpoint; it already returns senders in the payload
        return axiosnode.get("student/communications", { params: { p: 1, ps: 1 } }).then((response) => {
            const senders = response?.data?.result?.senders || [];
            return {
                ...response,
                data: {
                    ...response.data,
                    result: { senders },
                },
            };
        });
    }

    // In CmasterService.js
    getBackgrounds() {
        return axiosnode.get('/backgrounds');
    }

    // In CmasterService.js
    getActiveBackground(title) {
    return axiosPublicInstance.get(`/public/backgrounds/active`, {
        params: { title }
    });
}

    uploadBackground(backgroundData) {
        return axiosnode.post('/backgrounds', backgroundData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    activateBackground(id) {
        return axiosnode.post(`/backgrounds/${id}/activate`);
    }

    deleteBackground(id) {
        return axiosnode.delete(`/backgrounds/${id}`);
    }

}
// eslint-disable-next-line
export default new CmasterService();