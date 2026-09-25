/* eslint-disable import/no-anonymous-default-export */
import axios from "../utils/axios";
import axiosnode from "../utils/axiosnode";
import util from "../utils/util";

class InstituteService {
  register(data) {
    return axios.post("instituteRegister", data)
  }

  list(params) {
    return axios.get("institutes", { params })
  }
  all(params) {
    return axios.get("institutes/ALL", { params })
  }
  //Update course
  updateCourse(id, data) {
    return axios.post("updateinstitutecourse", { id, ...data })
  }
  delete(id) {
    return axios.post("deleteInstitute", { id })
  }
  changeStatus(id, status) {
    return axios.post("changeInstituteStatus", { id, status })
  }
  detail(id) {
    return axios.get(`instituteDetail/${id ? id : ""}`)
  }
  saveCourse(data) {
    return axios.post("saveInstituteCourse", data)
  }
  courses(params) {
    return axios.get("instituteCourses", { params })
  }
  coursesAdmin(instituteId, params) {
    return axiosnode.get(`master/institute/${instituteId}/courses`, { params })
  }
  copyCoursesBulk(instituteId, payload) {
    return axiosnode.post(`/master/institute/${instituteId}/courses/copy`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  allCourses(params) {
    return axios.get("instituteCourses/ALL", { params })
  }
  deleteCourse(id) {
    return axios.post("deleteInstituteCourse", { id })
  }

  importCourses(file, instituteId) {
    const formData = new FormData();
    formData.append("file", file);
    if (instituteId) {
      formData.append("institute_id", instituteId);
    }
    return axiosnode.post("institute/courses/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }

  saveAboutInstitute(data) {
    return axios.post("saveAboutInstitute", data)
  }
  aboutInstitutes(params) {
    return axios.get("aboutInstitutes", { params })
  }
  allAboutInstitutes(params) {
    return axios.get("aboutInstitutes/ALL", { params })
  }
  deleteAboutInstitute(id) {
    return axios.post("deleteAboutInstitute", { id })
  }

  saveDocumentInstitute(data) {
    return axios.post("saveDocumentInstitute", data)
  }
  documentInstitutes(params) {
    return axios.get("documentInstitutes", { params })
  }
  allDocumentInstitutes(params) {
    return axios.get("documentInstitutes/ALL", { params })
  }
  deleteDocumentInstitute(id) {
    return axios.post("deleteDocumentInstitute", { id })
  }

  saveNotification(data) {
    return axiosnode.post("/notifications", data)
  }
  notifications(params) {
    return axiosnode.get("/notifications", { params })
  }
  allNotifications(params) {
    return axios.get("InstituteNotifications/ALL", { params })
  }
  unreadNotificationsCount() {
    return axiosnode.get("/notifications/unread-count")
  }
  markNotificationRead(id) {
    return axiosnode.post(`/notifications/${id}/read`)
  }
  deleteNotification(id) {
    return axiosnode.delete(`/notifications/${id}`)
  }
  allInstituteIssues(params) {
    return axiosnode.get("/institute/issues", { params })
  }
  createInstituteIssue(payload) {
    return axiosnode.post("/institute/issues", payload)
  }
  allInstituteIssuesforAdmin(params) {
    return axiosnode.get("/institute/issues/admin", { params })
  }

  instituteIssueReplies(issueId) {
    return axiosnode.get(`/institute/issues/${issueId}/replies`)
  }

  addInstituteIssueReply(issueId, payload) {
    return axiosnode.post(`/institute/issues/${issueId}/replies`, payload)
  }

	createInsIssueReply(payload) {
		return axios.post("createInsIssueReply", payload)
	}

  updateInstituteIssueStatus(issueId, status) {
    return axiosnode.patch(`/institute/issues/${issueId}`, { status })
  }

  deleteInstituteIssue(id) {
    return axiosnode.post(`/institute/issues/delete`, { id })
  }
  //Payment slips
  paymentSlips = async () => {
    try {
      // Try with institute_id header if available
      let headers = {}
      try {
        const { sdx } = await import("../sdx")
        if (sdx && sdx.institute_id) {
          headers.institute_id = sdx.institute_id
        }
      } catch (e) {}
      const firstTry = await axiosnode.get("payment/slips", { headers })
      return { ...firstTry.data, success: true }
    } catch (err) {
      // If forbidden, attempt to resolve institute id and retry once
      const isForbidden = Number(err?.response?.status) === 403
      if (!isForbidden) {
        return { message: err.message, success: false }
      }
      try {
        const getIns = await axios.post("getins")
        const insId = Number(
          getIns?.data?.data?.institute_id || getIns?.data?.institute_id || 0
        )
        let headers = {}
        if (insId) {
          try {
            const { sdx } = await import("../sdx")
            if (sdx) sdx.setData({ institute_id: insId })
          } catch (e) {}
          headers.institute_id = insId
        }
        const retry = await axiosnode.get("payment/slips", { headers })
        return { ...retry.data, success: true }
      } catch (e2) {
        return { message: e2.message || err.message, success: false }
      }
    }
  }

  //get institute id
  getInstituteId() {
    return axios.post("getins")
  }

  //Upload Visa API (Institute side)
  // uploadVisaLetter(data) {
  //     return axios.post("visa/doc/upload", data);
  // }
  uploadVisaLetter(scf_id, fileId) {
    return axiosnode.post(
      `/student/letters/${scf_id}/visa-letter`,
      { file_id: fileId } // sending JSON with file_id
    )
  }
  uploadAdmissionLetter(scf_id, fileId) {
    return axiosnode.post(
      `/student/letters/${scf_id}/admission-letter`,
      { file_id: fileId } // sending JSON with file_id
    )
  }

  uploadPaymentSlip(scf_id, fileId) {
    return axiosnode.post(
      `/student/letters/${scf_id}/payment-slip`,
      { file_id: fileId } // sending JSON with file_id
    )
  }

  // New helpers to download letters directly as files (Node backend)
  downloadVisaLetterFile(scfId) {
    // Try to include institute_id header if available
    let headers = {}
    try {
      const { sdx } = require("../sdx")
      if (sdx && sdx.institute_id) {
        headers.institute_id = sdx.institute_id
      }
    } catch (e) {}
    
    return axiosnode.get(`/student/letters/${scfId}/visa-letter/download`, {
      responseType: "blob",
      headers
    })
  }

  viewVisaLetterFile(scfId) {
    // Try to include institute_id header if available
    let headers = {}
    try {
      const { sdx } = require("../sdx")
      if (sdx && sdx.institute_id) {
        headers.institute_id = sdx.institute_id
      }
    } catch (e) {}
    
    return axiosnode.get(`/student/letters/${scfId}/visa-letter/view`, {
      responseType: "blob",
      headers
    })
  }

  downloadAdmissionLetterFile(scfId) {
    // Try to include institute_id header if available
    let headers = {}
    try {
      const { sdx } = require("../sdx")
      if (sdx && sdx.institute_id) {
        headers.institute_id = sdx.institute_id
      }
    } catch (e) {}
    
    return axiosnode.get(`/student/letters/${scfId}/admission-letter/download`, {
      responseType: "blob",
      headers
    })
  }

  viewAdmissionLetterFile(scfId) {
    // Try to include institute_id header if available
    let headers = {}
    try {
      const { sdx } = require("../sdx")
      if (sdx && sdx.institute_id) {
        headers.institute_id = sdx.institute_id
      }
    } catch (e) {}
    
    return axiosnode.get(`/student/letters/${scfId}/admission-letter/view`, {
      responseType: "blob",
      headers
    })
  }

  downloadPaymentSlipFile(scfId) {
    // Try to include institute_id header if available
    let headers = {}
    try {
      const { sdx } = require("../sdx")
      if (sdx && sdx.institute_id) {
        headers.institute_id = sdx.institute_id
      }
    } catch (e) {}
    
    return axiosnode.get(`/student/letters/${scfId}/payment-slip/download`, {
      responseType: "blob",
      headers
    })
  }

  viewPaymentSlipFile(scfId) {
    // Try to include institute_id header if available
    let headers = {}
    try {
      const { sdx } = require("../sdx")
      if (sdx && sdx.institute_id) {
        headers.institute_id = sdx.institute_id
      }
    } catch (e) {}
    
    return axiosnode.get(`/student/letters/${scfId}/payment-slip/view`, {
      responseType: "blob",
      headers
    })
  }

  //Download Visa API
  downloadVisaLetter(studentId) {
    return axios.post(`student/doclist/${studentId}`)
  }
  //Delete Visa API
  deleteVisaLetter(scfId) {
    // Use new Node.js API to delete all documents for a student
    return axiosnode.delete(`/student/letters/${scfId}/documents`)
  }

  //Payment Status Update
  updatePaymentStatus(payload) {
    return axios.post("student/paymentstatus", payload)
  }
  //Upload Pickup Detail - Updated to use student_letters API
  uploadPickupDetail(scfId, payload) {
    return axiosnode.post(`/student/letters/${scfId}/pickup`, payload)
  }
  //getPickup details - Updated to use student_letters API
  getPickupDetails(scfId) {
    return axiosnode.get(`/student/letters/${scfId}`)
  }
  //Delete Pickup Detail - Not supported in new API (pickup is part of student_letters record)
  deletePickupDetail(scfId) {
    // To delete pickup, we update with null values
    return axiosnode.post(`/student/letters/${scfId}/pickup`, { pickup: null, file_id: null })
  }
  //Download Pickup File
  downloadPickupFile(scfId) {
    return axiosnode.get(`/student/letters/${scfId}/pickup/download`, {
      responseType: "blob",
    })
  }
  //View Pickup File
  viewPickupFile(scfId) {
    return axiosnode.get(`/student/letters/${scfId}/pickup/view`, {
      responseType: "blob",
    })
  }
  //Students issue for institute
  getStudentIssues = async () => {
    const { data } = await axiosnode.get("issues/student")
    return data
  }
  //student re-upload visa (uses same upload API)
  reuploadVisaStu(doc_id, data) {
    return axios.post("visa/doc/upload", data)
  }
  //Student upload visa (Student side)
  //   studentUploadVisa(data) {
  //     return axios.post("visa/doc/upload", data)
  //   }

  // Replace the old FormData-based call
  studentUploadVisa(scfId, payload) {
    return axiosnode.post(`/student/letters/${scfId}/student-visa`, payload)
  }

  getLetterDetails(scfId) {
    return axiosnode.get(`/student/letters/${scfId}`)
  }

  //Download Visa file via POST -> returns JSON with file_url 
  downloadVisaFile(doc_id) {
    return axios.post(`visa/download/${doc_id}`)
  }

  downloadFileByUrl(fileUrl) {
    return axios.get(fileUrl, {
      responseType: "blob",
    })
  }

  downloadVisaFileforStd(scf_id) {
    return axiosnode.get(`/student/letters/${scf_id}/student-visa/download`, {
      responseType: "blob",
    })
  }

  viewStudentVisaFile(scfId) {
    return axiosnode.get(`/student/letters/${scfId}/student-visa/view`, {
      responseType: "blob",
    })
  }
  // Build absolute visa file URL by file name (direct access via uploads path)
  visaFileUrl(file_name) {
    if (!file_name) return null
    const base = util.apiUrl + "uploads/files/"
    try {
      return base + encodeURIComponent(file_name)
    } catch (e) {
      return base + file_name
    }
  }
  //Get Visa Uploaded by student

  getVisaStudent(student_id) {
    return axios.post(`visaletter/list/${student_id}`)
  }

  //Get all Visa uploaded by students (for institute tab)
  listAllVisa(instituteId) {
    return axios.post(`visa/doc/listall_visa/${instituteId}`)
  }

  //Update Visa statsus :
  //   updateVisaStatus(doc_id, visa_status) {
  //     return axios.post(`visa/updatestatus`, { doc_id, visa_status })
  //   }

  updateVisaStatus = (scfId, status) => {
    // Map numeric status to API decision string
    let decision
    switch (status) {
      case "1":
      case 1:
        decision = "APPROVED"
        break
      case "2":
      case 2:
        decision = "REJECTED"
        break
      default:
        decision = "PENDING" // or skip sending if backend does not accept pending
    }

    return axiosnode.post(`/student/letters/${scfId}/student-visa/review`, {
      decision,
    })
  }

  changeMaskStatus(ins_id, mask_status) {
    return axios.post("updatemaskstatus", {
      inst_id: ins_id,
      mask_status: mask_status,
    })
  }

  getEligibleStudents() {
    return axiosnode.get("/student/letters")
  }

  // Ticket file methods
  downloadTicketFile(scfId) {
    return axiosnode.get(`/student/letters/${scfId}/ticket/download`, {
      responseType: "blob",
    })
  }

  viewTicketFile(scfId) {
    return axiosnode.get(`/student/letters/${scfId}/ticket/view`, {
      responseType: "blob",
    })
  }
}

export default new InstituteService();