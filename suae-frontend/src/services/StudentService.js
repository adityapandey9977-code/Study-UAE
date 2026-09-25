// /* eslint-disable import/no-anonymous-default-export */
// import axios from "../utils/axios";
// import axiosnode from "../utils/axiosnode";
// import InstituteService from "./InstituteService";

// class StudentService {

//     // ✅ Fetch featured/top institutes from Node backend
//     getFeaturedListings = async ({ student_id, session, course_id = "", limit = 5 }) => {
//         try {
//             const params = { student_id, session };
//             const { data } = await axiosnode.get("featured-listings", { params });
//             return data;
//         } catch (error) {
//             console.error("❌ Failed to fetch featured listings:", error);
//             throw error;
//         }
//     };

//     sendEmailVerificationOtp(payload) {
//         return axios.post("sendStudentEmailVerificationOtp", payload);
//     }
//     verifyEmail(data) {
//         return axios.post("student/verifyEmail", data);
//     }
//     sendMobileVerificationOtp(data) {
//         return axios.post("sendStudentMobileVerificationOtp", data);
//     }
//     verifyMobileNo(data) {
//         return axios.post("verifyStudentMobileNo", data);
//     }
//     register(data) {
//         return axios.post("studentRegister", data);
//     }

//     list(params) {
//         return axios.get("students", { params });
//     }
//     all(params) {
//         return axios.get("students/ALL", { params });
//     }
//     saveBasicInfo(data) {
//         return axios.post("saveStudentBasicInfo", data);
//     }
//     saveEducationInfo(data) {
//         return axios.post("saveStudentEducationInfo", data);
//     }
//     verifyDoc(student_id) {
//         return axios.post("verifyStudentDoc", { student_id });
//     }
//     saveBackgroundInfo(data) {
//         return axios.post("saveStudentBackgroundInfo", data);
//     }
//     detail(id) {
//         return axios.get("studentDetail/" + (id || ''));
//     }
//     delete(id) {
//         return axios.post("deleteStudent", { id });
//     }

//     sendEmail(data) {
//         return axios.post("sendEmailToStudent", data);
//     }
//     sentEmails(params) {
//         return axios.get("sentEmailsToStudent", { params });
//     }
//     allSentEmails(params) {
//         return axios.get("sentEmailsToStudent/ALL", { params });
//     }

//     sendWhatsapp = async (payload) => {
//         try {
//             const { data } = await axiosnode.post("communication/sendWhatsappToLead", payload);
//             return { ...data, success: true };
//         } catch (e) {
//             return { success: false, message: e.message };
//         }
//     }

//     getSentWhatsapp = async (params) => {
//         try {
//             const { data } = await axiosnode.get("communication/getSentWhatsappToLead", { params });
//             return data.result || [];
//         } catch (e) {
//             return [];
//         }
//     }

//     //Get whatsapp data nodejs
//     getAllSentWhatsapp = async () => {
//         try {
//             const { data } = await axiosnode.get("whatsapp/sent");
//             return data.data || [];
//         } catch (error) {
//             return [];
//         }
//     }

//     sendPassword(student_id) {
//         return axios.post("sendPasswordToStudent", { student_id });
//     }

//     saveFollowup(data) {
//         return axios.post("saveFollowup", data);
//     }
//     followups(params) {
//         return axios.get("followups", { params });
//     }
//     allFollowups(params) {
//         return axios.get("followups/ALL", { params });
//     }

//     issues(params) {
//         return axios.get("studentIssues", { params });
//     }
//     createIssue(data) {
//         return axios.post("createStudentIssue", data);
//     }
//     deleteIssue(id) {
//         return axios.post("deleteStudentIssue", { id });
//     }
//     createIssueReply(data) {
//         return axios.post("createStudentIssueReply", data);
//     }
//     issueReplies(issue_id) {
//         return axios.get("studentIssueReplies/" + issue_id);
//     }
//     deleteIssueReply(id) {
//         return axios.post("deleteStudentIssueReply", { id });
//     }
//     setIssueStatus(id, status) {
//         return axios.post("setStudentIssueStatus", { id, status });
//     }

//     saveNotification(data) {
//         return axios.post("saveStudentNotification", data);
//     }
//     notifications(params) {
//         return axios.get("studentNotifications", { params });
//     }
//     allNotifications(params) {
//         return axios.get("studentNotifications/ALL", { params });
//     }
//     unreadNotificationsCount() {
//         return axios.get("studentUnreadNotificationsCount");
//     }
//     markNotificationRead(id) {
//         return axios.post("markStudentNotificationRead", { id });
//     }
//     deleteNotification(id) {
//         return axios.post("deleteStudentNotification", { id });
//     }

//     assign(student_id, assigned_to) {
//         return axios.post("student/assign", { student_id, assigned_to });
//     }
//     markDead(yesNo, student_id) {
//         return axios.post("student/markDead/" + yesNo, { student_id });
//     }

//     /** */
//     instituteCourses(params) {
//         return axios.get("studentInstituteCourses", { params });
//     }

//     saveStudentChoiceFillings(data) {
//         return axios.post("saveStudentChoiceFillings", data);
//     }

//     appliedCourses(params) {
//         return axios.get("student/appliedCourses", { params });
//     }

//     setSCFAdmStatus = async ({ scf_id, status }) => {
//         try {
//             const { data } = await axiosnode.post("student/setSCFAdmStatus", { scf_id, status });
//             return { ...data, success: true };
//         } catch (e) {
//             return { message: e.message, success: false };
//         }
//     }

//     setSCFInstituteStatus = async ({ scf_id, status }) => {
//         try {
//             const { data } = await axiosnode.post("student/setSCFInstituteStatus", { scf_id, status });
//             return { ...data, success: true };
//         } catch (e) {
//             return { message: e.message, success: false };
//         }
//     }

//     setSCFUploadOfferLetter = async ({ scf_id, file_id, client_id, student_id, institute_id, auth }) => {
//         try {
//             // Try to resolve scf_id via payment slips when student_id and institute_id are available
//             const tryResolveScfFromPayment = async () => {
//                 try {
//                     const res = await InstituteService.paymentSlips();
//                     const list = (res && (res.data || res.result || res.rows)) || [];
//                     const arr = Array.isArray(list) ? list : (Array.isArray(list.data) ? list.data : []);
//                     const match = arr.find(v => String(v.student_id) === String(student_id) && String(v.institute_id) === String(institute_id));
//                     const scf = match && (Number(match.scf_id) || Number(match.scfid) || Number(match.scf));
//                     return scf || null;
//                 } catch (e) {
//                     return null;
//                 }
//             };

//             let resolvedScfId = Number(scf_id) || 0;
//             if (student_id && institute_id) {
//                 const byPayment = await tryResolveScfFromPayment();
//                 if (byPayment) {
//                     resolvedScfId = byPayment;
//                 }
//             }

//             const payload = {
//                 scf_id: Number(resolvedScfId || scf_id),
//                 // Send only offer_letter_file_id as requested
//                 offer_letter_file_id: Number(file_id),
//                 // Include optional fields when available to satisfy auth/module guards
//                 ...(student_id ? { student_id: Number(student_id) } : {}),
//                 ...(institute_id ? { institute_id: Number(institute_id) } : {}),
//                 client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
//             };
//             // try { console.log('[offer] payload', payload); } catch (err) { }
//             const config = { headers: {} };
//             // Allow per-call override of auth headers (e.g., superadmin nodetoken)
//             if (auth && auth.nodeToken) {
//                 config.headers.Authorization = auth.nodeToken;
//             }
//             if (auth && auth.sessionId) {
//                 config.headers.Sessionid = auth.sessionId;
//             }
//             const insIdHeader = (auth && auth.institute_id) || payload.institute_id;
//             if (insIdHeader) {
//                 config.headers.institute_id = insIdHeader;
//             }
//             const { data } = await axiosnode.post("student/setSCFUploadOfferLetter", payload, config);
//             return { ...data, success: true };
//         }
//         catch (e) {
//             try { console.error('[offer] error', e?.response?.data || e?.message || e); } catch (err) { }
//             // Alternate approach: fallback to PHP API if Node denies module access
//             try {
//                 const phpPayload = {
//                     scf_id: Number(scf_id),
//                     offer_letter_file_id: Number(file_id),
//                     student_id: student_id ? Number(student_id) : undefined,
//                     institute_id: institute_id ? Number(institute_id) : undefined,
//                     client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
//                 };
//                 const res1 = await axios.post("student/setSCFUploadOfferLetter", phpPayload);
//                 return { ...res1.data, success: true };
//             } catch (e1) {
//                 // Try with file_id key if backend expects that
//                 try {
//                     const phpPayload2 = {
//                         scf_id: Number(scf_id),
//                         file_id: Number(file_id),
//                         student_id: student_id ? Number(student_id) : undefined,
//                         institute_id: institute_id ? Number(institute_id) : undefined,
//                         client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
//                     };
//                     const res2 = await axios.post("student/setSCFUploadOfferLetter", phpPayload2);
//                     return { ...res2.data, success: true };
//                 } catch (e2) {
//                     const serverMsg = e2?.response?.data?.message || e1?.response?.data?.message || e?.response?.data?.message || e?.message || 'Bad Request';
//                     return { message: serverMsg, success: false };
//                 }
//             }
//         }
//     }

//     setSCFStudentStatus = async ({ scf_id, status }) => {
//         try {
//             const { data } = await axiosnode.post("student/setSCFStudentStatus", { scf_id, status });
//             return { ...data, success: true };
//         } catch (e) {
//             return { message: e.message, success: false };
//         }
//     }

//     setSCFUploadPaymentSlip = async ({ scf_id, payment_slip_file_id }) => {
//         try {
//             const { data } = await axiosnode.post("student/setSCFUploadPaymentSlip", { scf_id, payment_slip_file_id });
//             return { ...data, success: true };
//         } catch (e) {
//             return { message: e.message, success: false };
//         }
//     }
// }

// export default new StudentService();

/* eslint-disable import/no-anonymous-default-export */
import axios from "../utils/axios";
import axiosnode from "../utils/axiosnode";
import InstituteService from "./InstituteService";
import util from "../utils/util";

class StudentService {
    toNodeStudentListParams(params) {
        const payload = { ...(params || {}) };
        if (!payload.session && payload.master_session_id) {
            payload.session = String(payload.master_session_id);
        }
        delete payload.master_session_id;
        return payload;
    }

    // Fetch featured/top institutes from Node backend
    getFeaturedListings = async ({ student_id, session, course_id, limit } = {}) => {
        try {
            // send only required params
            const params = { student_id, session };
            if (course_id) params.course_id = course_id;
            if (limit) params.limit = limit;

            const { data } = await axiosnode.get(`featured-listings/${student_id}/top-institutes`, { params });
            return data;
        } catch (error) {
            console.error(" Failed to fetch featured listings:", error);
            throw error;
        }
    };

    // New: Top institutes for student endpoint
    getTopInstitutesForStudent = async ({ student_id, session, course_id, limit } = {}) => {
        try {
            const params = { student_id, session };
            if (course_id) params.course_id = course_id;
            if (limit) params.limit = limit;
            const { data } = await axiosnode.get("featured-listings/student/top-institutes", { params });
            return data;
        } catch (error) {
            console.error(" Failed to fetch top institutes for student:", error);
            throw error;
        }
    };

getFeaturedListingsForStudent = async ({ student_id, session, course_id } = {}) => {
  try {
    const params = { student_id, session };
    if (course_id) params.course_id = course_id;
    const { data } = await axiosnode.get(`featured-listings/student`, { params });
    return data;
  } catch (error) {
    console.error("Failed to fetch featured listings for student:", error);
    throw error;
  }
};

    sendEmailVerificationOtp(payload) {
        return axios.post("sendStudentEmailVerificationOtp", payload);
    }
    verifyEmail(data) {
        return axios.post("student/verifyEmail", data);
    }
 sendMobileVerificationOtp(data) {
    return axiosnode.post("whatsapp/send-mobile-otp", data);
}

verifyMobileNo(data) {
    return axiosnode.post("whatsapp/verify-mobile-otp", data);
}
    register(data) {
        return axios.post("studentRegister", data);
    }

    list(params) {
        const payload = { ...(params || {}) };
        
        // Add agent_user_id ONLY if master_session_id is NOT present
        if (!payload.master_session_id && !payload.agent_user_id) {
            const agentUserId = util.getAgentUserId();
            if (agentUserId) {
                payload.agent_user_id = agentUserId;
            } else if (util.isAgent() === 1) {
                const fallback = util.getUserId();
                if (fallback) payload.agent_user_id = fallback;
            }
        }
        
        // Transform filter parameters to match PHP API expectations
        const transformedPayload = { ...payload };
        
        // Map frontend filter keys to PHP API keys
        if (transformedPayload.basic_info !== undefined) {
            transformedPayload.basic_info_completed = transformedPayload.basic_info.toLowerCase();
            delete transformedPayload.basic_info;
        }
        if (transformedPayload.edu_info !== undefined) {
            transformedPayload.edu_info_completed = transformedPayload.edu_info.toLowerCase();
            delete transformedPayload.edu_info;
        }
        if (transformedPayload.background_info !== undefined) {
            transformedPayload.background_info_completed = transformedPayload.background_info.toLowerCase();
            delete transformedPayload.background_info;
        }
        if (transformedPayload.doc_uploaded !== undefined) {
            transformedPayload.doc_uploaded = transformedPayload.doc_uploaded;
        }
        if (transformedPayload.doc_verified !== undefined) {
            transformedPayload.doc_verified = transformedPayload.doc_verified;
        }
        if (transformedPayload.payment_proof !== undefined) {
            transformedPayload.payment_proof = transformedPayload.payment_proof;
        }
        if (transformedPayload.payment_proof_uploaded !== undefined) {
            transformedPayload.payment_proof_uploaded = transformedPayload.payment_proof_uploaded.toLowerCase();
        }
        
        // Always use Node API POST endpoint for student list
        return axiosnode.post("students", transformedPayload);
    }
    all(params) {
        const payload = { ...(params || {}) };
        
        // Add agent_user_id ONLY if master_session_id is NOT present
        if (!payload.master_session_id && !payload.agent_user_id) {
            const agentUserId = util.getAgentUserId();
            if (agentUserId) {
                payload.agent_user_id = agentUserId;
            } else if (util.isAgent() === 1) {
                const fallback = util.getUserId();
                if (fallback) payload.agent_user_id = fallback;
            }
        }
        
        // Transform filter parameters to match PHP API expectations
        const transformedPayload = { ...payload };
        
        // Map frontend filter keys to PHP API keys
        if (transformedPayload.basic_info !== undefined) {
            transformedPayload.basic_info_completed = transformedPayload.basic_info.toLowerCase();
            delete transformedPayload.basic_info;
        }
        if (transformedPayload.edu_info !== undefined) {
            transformedPayload.edu_info_completed = transformedPayload.edu_info.toLowerCase();
            delete transformedPayload.edu_info;
        }
        if (transformedPayload.background_info !== undefined) {
            transformedPayload.background_info_completed = transformedPayload.background_info.toLowerCase();
            delete transformedPayload.background_info;
        }
        if (transformedPayload.doc_uploaded !== undefined) {
            transformedPayload.doc_uploaded = transformedPayload.doc_uploaded;
        }
        if (transformedPayload.doc_verified !== undefined) {
            transformedPayload.doc_verified = transformedPayload.doc_verified;
        }
        if (transformedPayload.payment_proof !== undefined) {
            transformedPayload.payment_proof = transformedPayload.payment_proof;
        }
        if (transformedPayload.payment_proof_uploaded !== undefined) {
            transformedPayload.payment_proof_uploaded = transformedPayload.payment_proof_uploaded.toLowerCase();
        }
        
        // Always use Node API POST endpoint for all students
        return axiosnode.post("students/ALL", transformedPayload);
    }
    
    
    saveBasicInfo(data) {
        return axios.post("saveStudentBasicInfo", data);
    }
    saveEducationInfo(data) {
        return axios.post("saveStudentEducationInfo", data);
    }
    verifyDoc(student_id) {
        return axios.post("verifyStudentDoc", { student_id });
    }
    getStudentDocuments(student_id) {
        return axios.get(`studentDocuments/${student_id}`);
    }
    saveBackgroundInfo(data) {
        return axios.post("saveStudentBackgroundInfo", data);
    }
    detail(id) {
        return axios.get("studentDetail/" + (id || ''));
    }
    delete(id) {
        return axios.post("deleteStudent", { id });
    }

    sendEmail(data) {
        return axios.post("sendEmailToStudent", data);
    }
    sentEmails(params) {
        return axios.get("sentEmailsToStudent", { params });
    }
    allSentEmails(params) {
        return axios.get("sentEmailsToStudent/ALL", { params });
    }

    sendWhatsapp = async (payload) => {
        try {
            const { data } = await axiosnode.post("communication/sendWhatsappToLead", payload);
            return { ...data, success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    getSentWhatsapp = async (params) => {
        try {
            const { data } = await axiosnode.get("communication/getSentWhatsappToLead", { params });
            return data.result || [];
        } catch (e) {
            return [];
        }
    }

    //Get whatsapp data nodejs
    getAllSentWhatsapp = async () => {
        try {
            const { data } = await axiosnode.get("whatsapp/sent");
            return data.data || [];
        } catch (error) {
            return [];
        }
    }

    sendPassword(student_id) {
        return axios.post("sendPasswordToStudent", { student_id });
    }

    saveFollowup(data) {
        return axios.post("saveFollowup", data);
    }
    followups(params) {
        return axios.get("followups", { params });
    }
    allFollowups(params) {
        return axios.get("followups/ALL", { params });
    }

    allStudentIssues(params) {
        const payload = { ...(params || {}) };
        if (!payload.master_session_id) {
            try {
                const raw = localStorage.getItem("selectedSession");
                const selected = raw ? JSON.parse(raw) : null;
                if (selected && selected.key) payload.master_session_id = selected.key;
            } catch (e) {
                // ignore
            }
        }
        return axios.post("studentIssues", payload);
    }

    // Student issues scoped to a specific institute (no paging params)
    studentIssuesForInstitute(institute_id) {
        return axios.get(`studentIssues/institute/${institute_id}`);
    }

    createIssue(data) {
        return axios.post("createStudentIssue", data);
    }
    deleteIssue(id) {
        return axios.post("deleteStudentIssue", { id });
    }
    createIssueReply(data) {
        return axios.post("createStudentIssueReply", data);
    }
    issueReplies(issue_id) {
        return axios.get("studentIssueReplies/" + issue_id);
    }
    deleteIssueReply(id) {
        return axios.post("deleteStudentIssueReply", { id });
    }
    setIssueStatus(id, status) {
        return axios.post("setStudentIssueStatus", { id, status });
    }

    // Get issue count by type and status
    getIssueCount() {
        return axiosnode.get("/issue-type-count/type-status");
    }

    saveNotification(data) {
        return axiosnode.post("/student-notifications", data);
    }
    notifications(params) {
        return axiosnode.get("/student-notifications", { params });
    }
    allNotifications(params) {
        return axios.get("studentNotifications/ALL", { params });
    }
    unreadNotificationsCount() {
        return axios.get("studentUnreadNotificationsCount");
    }
    markNotificationRead(id) {
        return axiosnode.post(`/student-notifications/${id}/read`);
    }
    deleteNotification(id) {
        return axiosnode.delete(`/student-notifications/${id}`);
    }

    assign(student_id, assigned_to, remark) {
        return axios.post("student/assign", { student_id, assigned_to, remark });
    }
    markDead(yesNo, student_id) {
        return axios.post("student/markDead/" + yesNo, { student_id });
    }

    /** */
    instituteCourses(params) {
        return axios.get("studentInstituteCourses", { params });
    }

    saveStudentChoiceFillings(data) {
        return axiosnode.post("student/saveStudentChoiceFillings", data);
    }

    appliedCourses = async (params) => {
        const res = await axios.get("student/appliedCourses", { params });

        const phpOrigin = (() => {
            try {
                return new URL(util.apiUrl).origin;
            } catch (e) {
                return '';
            }
        })();

        const resolveUploadsUrl = (rawUrl) => {
            if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
            if (rawUrl.startsWith('blob:')) return rawUrl;

            try {
                const parsed = new URL(rawUrl);
                // If it's already a full URL (PHP or Node), return as-is
                return rawUrl;
            } catch (e) {
                // If it's a relative path, prepend the PHP origin (where files are stored)
                if (phpOrigin && (rawUrl.startsWith('/uploads/') || rawUrl.startsWith('uploads/'))) {
                    const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
                    return `${phpOrigin}${path}`;
                }
                return rawUrl;
            }
        };

        try {
            const list = res?.data?.result?.data;
            if (Array.isArray(list)) {
                res.data.result.data = list.map((row) => {
                    if (!row) return row;
                    const patch = {};
                    if (row.offer_file_url) patch.offer_file_url = resolveUploadsUrl(row.offer_file_url);
                    if (row.payment_slip_file_url) patch.payment_slip_file_url = resolveUploadsUrl(row.payment_slip_file_url);
                    if (row.visa_letter_file_url) patch.visa_letter_file_url = resolveUploadsUrl(row.visa_letter_file_url);
                    if (row.admission_letter_file_url) patch.admission_letter_file_url = resolveUploadsUrl(row.admission_letter_file_url);
                    return Object.keys(patch).length ? { ...row, ...patch } : row;
                });
            }
        } catch (e) {
            // ignore normalization failures
        }

        return res;
    }

    setSCFAdmStatus = async ({ scf_id, status }) => {
        try {
            const { data } = await axiosnode.post("student/setSCFAdmStatus", { scf_id, status });
            return { ...data, success: true };
        } catch (e) {
            return { message: e.message, success: false };
        }
    }

    setSCFInstituteStatus = async ({ scf_id, status }) => {
        try {
            const { data } = await axiosnode.post("student/setSCFInstituteStatus", { scf_id, status });
            return { ...data, success: true };
        } catch (e) {
            return { message: e.message, success: false };
        }
    }

    setSCFUploadOfferLetter = async ({ scf_id, file_id, client_id, student_id, institute_id, auth }) => {
        try {
            // Try to resolve scf_id via payment slips when student_id and institute_id are available
            const tryResolveScfFromPayment = async () => {
                try {
                    const res = await InstituteService.paymentSlips();
                    const list = (res && (res.data || res.result || res.rows)) || [];
                    const arr = Array.isArray(list) ? list : (Array.isArray(list.data) ? list.data : []);
                    const match = arr.find(v => String(v.student_id) === String(student_id) && String(v.institute_id) === String(institute_id));
                    const scf = match && (Number(match.scf_id) || Number(match.scfid) || Number(match.scf));
                    return scf || null;
                } catch (e) {
                    return null;
                }
            };

            let resolvedScfId = Number(scf_id) || 0;
            if (student_id && institute_id) {
                const byPayment = await tryResolveScfFromPayment();
                if (byPayment) {
                    resolvedScfId = byPayment;
                }
            }

            const payload = {
                scf_id: Number(resolvedScfId || scf_id),
                // Send only offer_letter_file_id as requested
                offer_letter_file_id: Number(file_id),
                // Include optional fields when available to satisfy auth/module guards
                ...(student_id ? { student_id: Number(student_id) } : {}),
                ...(institute_id ? { institute_id: Number(institute_id) } : {}),
                client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
            };
            // try { console.log('[offer] payload', payload); } catch (err) { }
            const config = { headers: {} };
            // Allow per-call override of auth headers (e.g., superadmin nodetoken)
            if (auth && auth.nodeToken) {
                config.headers.Authorization = auth.nodeToken;
            }
            if (auth && auth.sessionId) {
                config.headers.Sessionid = auth.sessionId;
            }
            const insIdHeader = (auth && auth.institute_id) || payload.institute_id;
            if (insIdHeader) {
                config.headers.institute_id = insIdHeader;
            }
            const { data } = await axiosnode.post("student/setSCFUploadOfferLetter", payload, config);
            return { ...data, success: true };
        }
        catch (e) {
            try { console.error('[offer] error', e?.response?.data || e?.message || e); } catch (err) { }
            // Alternate approach: fallback to PHP API if Node denies module access
            try {
                const phpPayload = {
                    scf_id: Number(scf_id),
                    offer_letter_file_id: Number(file_id),
                    student_id: student_id ? Number(student_id) : undefined,
                    institute_id: institute_id ? Number(institute_id) : undefined,
                    client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
                };
                const res1 = await axios.post("student/setSCFUploadOfferLetter", phpPayload);
                return { ...res1.data, success: true };
            } catch (e1) {
                // Try with file_id key if backend expects that
                try {
                    const phpPayload2 = {
                        scf_id: Number(scf_id),
                        file_id: Number(file_id),
                        student_id: student_id ? Number(student_id) : undefined,
                        institute_id: institute_id ? Number(institute_id) : undefined,
                        client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
                    };
                    const res2 = await axios.post("student/setSCFUploadOfferLetter", phpPayload2);
                    return { ...res2.data, success: true };
                } catch (e2) {
                    const serverMsg = e2?.response?.data?.message || e1?.response?.data?.message || e?.response?.data?.message || e?.message || 'Bad Request';
                    return { message: serverMsg, success: false };
                }
            }
        }
    }

    setSCFUploadAdmissionLetter = async ({ scf_id, file_id, client_id, student_id, institute_id, auth }) => {
        try {
            // Try to resolve scf_id via payment slips when student_id and institute_id are available
            const tryResolveScfFromPayment = async () => {
                try {
                    const res = await InstituteService.paymentSlips();
                    const list = (res && (res.data || res.result || res.rows)) || [];
                    const arr = Array.isArray(list) ? list : (Array.isArray(list.data) ? list.data : []);
                    const match = arr.find(v => String(v.student_id) === String(student_id) && String(v.institute_id) === String(institute_id));
                    const scf = match && (Number(match.scf_id) || Number(match.scfid) || Number(match.scf));
                    return scf || null;
                } catch (e) {
                    return null;
                }
            };

            let resolvedScfId = Number(scf_id) || 0;
            if (student_id && institute_id) {
                const byPayment = await tryResolveScfFromPayment();
                if (byPayment) {
                    resolvedScfId = byPayment;
                }
            }

            const payload = {
                scf_id: Number(resolvedScfId || scf_id),
                admission_letter_file_id: Number(file_id),
                ...(student_id ? { student_id: Number(student_id) } : {}),
                ...(institute_id ? { institute_id: Number(institute_id) } : {}),
                client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
            };
            const config = { headers: {} };
            if (auth && auth.nodeToken) {
                config.headers.Authorization = auth.nodeToken;
            }
            if (auth && auth.sessionId) {
                config.headers.Sessionid = auth.sessionId;
            }
            const insIdHeader = (auth && auth.institute_id) || payload.institute_id;
            if (insIdHeader) {
                config.headers.institute_id = insIdHeader;
            }
            const { data } = await axiosnode.post("student/setSCFUploadAdmissionLetter", payload, config);
            return { ...data, success: true };
        }
        catch (e) {
            try { console.error('[admission] error', e?.response?.data || e?.message || e); } catch (err) { }
            try {
                const phpPayload = {
                    scf_id: Number(scf_id),
                    admission_letter_file_id: Number(file_id),
                    student_id: student_id ? Number(student_id) : undefined,
                    institute_id: institute_id ? Number(institute_id) : undefined,
                    client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
                };
                const res1 = await axios.post("student/setSCFUploadAdmissionLetter", phpPayload);
                return { ...res1.data, success: true };
            } catch (e1) {
                try {
                    const phpPayload2 = {
                        scf_id: Number(scf_id),
                        file_id: Number(file_id),
                        student_id: student_id ? Number(student_id) : undefined,
                        institute_id: institute_id ? Number(institute_id) : undefined,
                        client_id: (client_id !== undefined && client_id !== null && client_id !== '') ? Number(client_id) : 1
                    };
                    const res2 = await axios.post("student/setSCFUploadAdmissionLetter", phpPayload2);
                    return { ...res2.data, success: true };
                } catch (e2) {
                    const serverMsg = e2?.response?.data?.message || e1?.response?.data?.message || e?.response?.data?.message || e?.message || 'Bad Request';
                    return { message: serverMsg, success: false };
                }
            }
        }
    }

    setSCFStudentStatus = async ({ scf_id, status }) => {
        try {
            const { data } = await axiosnode.post("student/setSCFStudentStatus", { scf_id, status });
            return { ...data, success: true };
        } catch (e) {
            return { message: e.message, success: false };
        }
    }

    setSCFUploadPaymentSlip = async ({ scf_id, payment_slip_file_id }) => {
        try {
            const { data } = await axiosnode.post("student/setSCFUploadPaymentSlip", { scf_id, payment_slip_file_id });
            return { ...data, success: true };
        } catch (e) {
            return { message: e.message, success: false };
        }
    }

    // Download student's own payment proof (from student_choice_fillings table)
    downloadPaymentProofFile = async (scfId) => {
        try {
            return await axiosnode.get(`/payment/download/${scfId}`, {
                responseType: "blob",
            });
        } catch (e) {
            throw new Error(e.response?.data?.message || e.message || "Failed to download payment proof");
        }
    }

    verifyAllDocs = async (student_id) => {
        return Promise.reject(new Error("verifyAllDocs API is not implemented yet"));
    }

    assignByCountry(payload) {
        return axios.post("student/assign/by-country", payload);
    }

    assignByDiscipline(payload) {
        return axios.post("student/assignByDiscipline", payload);
    }

    assignByAutomation(payload) {
        return axiosnode.post("student/assign/by-automation", payload);
    }

    applyDatasetVisibility(payload) {
        return axiosnode.post("student/dataset/apply", payload);
    }

    assignByAutomationPublic(payload) {
        return axiosnode.post("public/student/assign/by-automation", payload);
    }
    autoAssign(payload) {
        return axios.post("student/autoAssign", payload);
    }
    assignedLeads(params) {
        return axios.get("student/assignedLeads", { params });
    }
    getStudentCount(params) {
        const searchParams = new URLSearchParams();
        Object.entries(params || {}).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return;

            if (Array.isArray(value)) {
                value.filter((v) => v !== undefined && v !== null && v !== "").forEach((v) => {
                    searchParams.append(key, v);
                });
            } else {
                searchParams.append(key, value);
            }
        });

        const qs = searchParams.toString();
        return axiosnode.get(`student/count${qs ? `?${qs}` : ""}`);
    }
    importCsv(formData) {
        // Use the axios instance which already has the interceptor for session management
        return axiosnode.post("student/import_csv", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        })
        .catch(error => {
        console.error('Import error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        return Promise.reject(error);
    });
}

    // Ticket Details Methods - Multiple Tickets Support
    getTicketDetails() {
        return axiosnode.get("student/ticket-details");
    }

    saveTicketDetails(data) {
        return axiosnode.post("student/ticket-details", data);
    }

    deleteTicketDetails(ticketId) {
        return axiosnode.delete(`student/ticket-details?ticket_id=${ticketId}`);
    }

    // Get student issues count and details by student_id
    getStudentIssuesByStudentId(student_id) {
        return axiosnode.get(`issues/student/${student_id}`);
    }

    // Send email to student when issue is resolved (Super Admin only)
    sendEmailToStudentForIssue(data) {
        return axiosnode.post("super-admin-email/send-email/student", data);
    }
}

export default new StudentService();