import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import util from "../../utils/util"
import {
  Card,
  Button,
  Upload,
  message,
  Table,
  Tag,
  List,
  Tabs,
  Input,
  Spin,
  Empty,
  Dropdown,
  Modal,
  Select,
} from "antd"
import {
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  DownOutlined,
} from "@ant-design/icons"
import InstituteService from "../../services/InstituteService"
import StudentService from "../../services/StudentService"
import FileService from "../../services/FileService"
import { sdx } from "../../sdx"

export default function DownloadVisaLetter() {
  const navigate = useNavigate()
  const isInstitute = util.isInstitute() === 1

  // ✅ Keep these — fetched from getInstituteId
  const [studentId, setStudentId] = useState(null)
  const [instituteId, setInstituteId] = useState(null)

  // ✅ State from paymentSlips
  const [payDetail, setPayDetail] = useState([])
  const [studentFiles, setStudentFiles] = useState([]) // for student
  const [studentFilesForIns, setStudentFilesForIns] = useState([]) // for institute
  const [visaFiles, setVisaFiles] = useState([])
  const [myVisaUploads, setMyVisaUploads] = useState([]) // student's own uploads

  // ✅ UI state
  const [files, setFiles] = useState({})
  const [uploading, setUploading] = useState({})
  const [searchText, setSearchText] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalDocument, setModalDocument] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalFileUrl, setModalFileUrl] = useState(null)
  const [loadingCount, setLoadingCount] = useState(0)
  const [eligibleStudents, setEligibleStudents] = useState([])

  const [letterDetail, setLetterDetail] = useState(null)
  const [ticketDetails, setTicketDetails] = useState(null)
  const [travelDetailType, setTravelDetailType] = useState("visa")

  const loading = loadingCount > 0
  const setLoading = (isLoading) => {
    setLoadingCount((c) => (isLoading ? c + 1 : Math.max(0, c - 1)))
  }
  // ✅ 1. Eligible students
  useEffect(() => {
    if (util.isStudent() !== 1) {
      InstituteService.getEligibleStudents().then((res) => {
        setEligibleStudents(res.data)
      })
    }
  }, [])

  const getScfId = (studentId) => {
    const payRec = (Array.isArray(payDetail) ? payDetail : []).find(
      (s) => String(s.student_id) === String(studentId)
    )
    if (payRec?.scf_id) return payRec.scf_id

    const rec = eligibleStudents?.data?.find(
      (s) => String(s.student_id) === String(studentId)
    )
    return rec?.scf_id
  }

  // useEffect(() => {
  //   setLoading1(true)
  //   InstituteService.getLetterDetails(1644)
  //     .then((res) => {
  //       // The response structure based on your example:
  //       // { message: "", data: { ... } }
  //       const detail = res?.data?.data || res?.data?.result || null
  //       setLetterDetail(detail)
  //       console.log("Letter Detail:", detail)
  //     })
  //     .catch((err) => console.error("Error fetching letter detail:", err))
  //     .finally(() => setLoading(false))
  // }, [])

  // ✅ 1. Fetch institute/student IDs
  useEffect(() => {
    setLoading(true)
    InstituteService.getInstituteId()
      .then(({ data }) => {
        const studentIdValue = data?.data?.student_id || null
        const instituteIdValue = data?.data?.institute_id || null
        
        setStudentId(studentIdValue)
        setInstituteId(instituteIdValue)
        
        // IMPORTANT: Set institute_id in sdx so it's included in headers
        if (instituteIdValue) {
          sdx.setData({ institute_id: instituteIdValue })
          console.log('[DownloadVisaLetter] Set institute_id in sdx:', instituteIdValue)
        }
      })
      .catch((err) => console.error("Error fetching IDs:", err))
      .finally(() => setLoading(false))
  }, [])

  // ✅ 2. Fetch payment slips
  useEffect(() => {
    setLoading(true)
    InstituteService.paymentSlips()
      .then((res) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.result)
          ? res.result
          : []
        // If needed, filter acknowledged only:
        // const acknowledged = list.filter((item) => item.payment_status === 'Acknowledged');
        setPayDetail(list)
      })
      .catch((err) => console.error("Error fetching payment slips:", err))
      .finally(() => setLoading(false))
  }, [])

  // ✅ 3. Get visa docs (student side)
  useEffect(() => {
    if (isInstitute || !studentId) return
    if (!Array.isArray(payDetail) || payDetail.length === 0) return

    const myRecord = payDetail.find(
      (p) => String(p.student_id) === String(studentId)
    )
    const scfId = myRecord?.scf_id
    if (!scfId) {
      setStudentFiles([])
      return
    }

    setLoading(true)
    InstituteService.getLetterDetails(scfId)
      .then((res) => {
        const detail = res?.data?.data || null
        setLetterDetail(detail)

        const letters = detail?.letters || null
        const items = []
        
        console.log("Letter details received:", detail)
        console.log("Letters object:", letters)
        
        if (letters?.visa_letter && letters?.visa_letter_fileid) {
          items.push({
            kind: "visa-letter",
            scf_id: detail?.scf_id || scfId,
            file_name: "Visa_Letter.pdf",
          })
        }
        if (letters?.admission_letter && letters?.admission_letter_fileid) {
          items.push({
            kind: "admission-letter",
            scf_id: detail?.scf_id || scfId,
            file_name: "Admission_Letter.pdf",
          })
        }
        if (letters?.payment_slip && letters?.payment_slip_fileid) {
          console.log("Adding payment slip to items:", {
            payment_slip: letters.payment_slip,
            payment_slip_fileid: letters.payment_slip_fileid
          })
          items.push({
            kind: "payment-slip",
            scf_id: detail?.scf_id || scfId,
            file_name: "Payment_Slip.pdf",
          })
        } else {
          console.log("Payment slip NOT added - conditions not met:", {
            payment_slip: letters?.payment_slip,
            payment_slip_fileid: letters?.payment_slip_fileid
          })
        }
        
        console.log("Final studentFiles items:", items)
        setStudentFiles(items)
      })
      .catch((err) => {
        console.error("Error fetching letter details:", err)
        setStudentFiles([])
      })
      .finally(() => setLoading(false))
  }, [studentId, isInstitute, payDetail])

  // // Students who haven't received visa yet
  // const notSentStudents = useMemo(() => {
  //   const sentStudentIds = new Set(studentFilesForIns.map(f => String(f.student_id)));
  //   return payDetail.filter(
  //     (s) => !sentStudentIds.has(String(s.student_id)) &&
  //       (searchText === "" ||
  //         s.student_name.toLowerCase().includes(searchText.toLowerCase()) ||
  //         s.student_regno.toLowerCase().includes(searchText.toLowerCase()))
  //   );
  // }, [payDetail, studentFilesForIns, searchText]);

  // // Students who have received visa
  // const sentStudents = useMemo(() => {
  //   return studentFilesForIns.filter(
  //     (f) =>
  //       searchText === "" ||
  //       f.file_name.toLowerCase().includes(searchText.toLowerCase()) ||
  //       (payDetail.find(s => String(s.student_id) === String(f.student_id))?.student_name || "")
  //         .toLowerCase()
  //         .includes(searchText.toLowerCase()) ||
  //       (payDetail.find(s => String(s.student_id) === String(f.student_id))?.student_regno || "")
  //         .toLowerCase()
  //         .includes(searchText.toLowerCase())
  //   );
  // }, [studentFilesForIns, payDetail, searchText]);

  // Students who haven't received visa yet
  const notSentStudents = useMemo(() => {
    const uploadedIds = new Set(
      studentFilesForIns.map((f) => String(f.student_id))
    )
    return payDetail.filter((p) => !uploadedIds.has(String(p.student_id)))
  }, [payDetail, studentFilesForIns])

  // Students who have received visa
  const sentStudents = useMemo(() => {
    // Map of student IDs who have at least one uploaded visa file
    const uploadedIds = new Set(
      studentFilesForIns.map((f) => String(f.student_id))
    )
    return payDetail.filter((p) => uploadedIds.has(String(p.student_id)))
  }, [payDetail, studentFilesForIns])

  // ✅ 3b. Get student's own visa uploads list
  useEffect(() => {
    if (isInstitute || !studentId) return
    const scfId =
      (Array.isArray(payDetail) ? payDetail : []).find(
        (p) => String(p.student_id) === String(studentId)
      )?.scf_id || null

    const letters = letterDetail?.letters || null
    if (scfId && letters?.student_visa_fileid) {
      setMyVisaUploads([
        {
          kind: "student-visa",
          scf_id: scfId,
          file_name: "Student_Visa.pdf",
        },
      ])
      return
    }

    setMyVisaUploads([])
  }, [studentId, isInstitute, payDetail, letterDetail])

  // ✅ 4. Get uploaded visa docs (institute side)
  useEffect(() => {
    if (!isInstitute) return

    const studentIds = payDetail.map((p) => p.student_id)
    if (studentIds.length === 0) return

    const fetchFiles = async () => {
      setLoading(true)
      let allFiles = []
      for (let id of studentIds) {
        try {
          const res = await InstituteService.downloadVisaLetter(id)
          if (res.data.status && Array.isArray(res.data.files)) {
            // Keep all records (even if file_name is empty) so we can detect existing rows
            allFiles = [
              ...allFiles,
              ...res.data.files.map((f) => ({ ...f, student_id: id })),
            ]
          }
        } catch (err) {
          console.error(`Error fetching visa letters for student ${id}:`, err)
        }
      }
      setStudentFilesForIns(allFiles)
      setLoading(false)
    }

    fetchFiles()
  }, [payDetail, isInstitute])

  // ✅ Get all Visa uploaded by students (institute view)
  useEffect(() => {
    if (!isInstitute || !instituteId) return

    const fetchFiles = async () => {
      setLoading(true)
      try {
        // Node backend: /student/letters returns eligible list and includes student_visa_fileid
        const res = await InstituteService.getEligibleStudents()
        const list = Array.isArray(res?.data?.data) ? res.data.data : []
        setVisaFiles(list)
      } catch (err) {
        console.error(
          "[Visa Uploaded By Student] Error fetching listAllVisa:",
          err
        )
        try {
          console.error(
            "[Visa Uploaded By Student] Error response:",
            err?.response
          )
        } catch (e) {}
        setVisaFiles([])
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [isInstitute, instituteId])

  // ✅ Fetch ticket details for student
  useEffect(() => {
    if (isInstitute) return
    
    const fetchTicketDetails = async () => {
      try {
        const res = await StudentService.getTicketDetails()
        if (res.data && res.data.result) {
          setTicketDetails(res.data.result)
        }
      } catch (error) {
        console.error('Failed to fetch ticket details:', error)
      }
    }

    fetchTicketDetails()
  }, [isInstitute])

  // =========================
  // 📌 File Handlers
  // =========================

  const handleBeforeUpload = (file, studentId, type) => {
    setFiles((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [type]: file, // either 'visa' or 'admission'
      },
    }))
    return false // prevent automatic upload
  }

  // ✅ Upload for Institute
  const handleVisaLetterUpload = async (student) => {
    const file = files[student.student_id]?.visa
    if (!file) return message.error("Please select a file before uploading!")

    const scfId = getScfId(student.student_id)
    if (!scfId) return message.error("scf_id not found for this student!")

    try {
      setUploading((p) => ({ ...p, [student.student_id]: true }))

      // 1️⃣ Upload the file first to get file_id
      const fileUploadRes = await FileService.uploadNode(file)
      const file_id = fileUploadRes?.data?.file_id || 
                      fileUploadRes?.data?.result?.file_id || 
                      fileUploadRes?.data?.result?.path || 
                      fileUploadRes?.data?.path || 
                      null

      if (!file_id) {
        throw new Error("File upload failed: file_id not returned.")
      }

      // 3️⃣ Upload visa letter
      await InstituteService.uploadVisaLetter(scfId, file_id)

      message.success(`Visa letter uploaded for ${student.student_name}`)
      setFiles((prev) => ({
        ...prev,
        [student.student_id]: {
          ...(prev[student.student_id] || {}),
          visa: null,
        },
      }))
    } catch (err) {
      message.error(err.message || "Upload failed!")
    } finally {
      setUploading((p) => ({ ...p, [student.student_id]: false }))
    }
  }
  // ✅ Upload Admission Letter for Institute

  const handleAdmissionLetterUpload = async (student) => {
    const file = files[student.student_id]?.admission
    if (!file) return message.error("Please select a file before uploading!")

    const scfId = getScfId(student.student_id)
    if (!scfId) return message.error("scf_id not found for this student!")

    try {
      setUploading((p) => ({ ...p, [student.student_id]: true }))

      // 1️⃣ Upload the file first to get file_id
      const fileUploadRes = await FileService.uploadNode(file)
      const file_id = fileUploadRes?.data?.file_id || 
                      fileUploadRes?.data?.result?.file_id || 
                      fileUploadRes?.data?.result?.path || 
                      fileUploadRes?.data?.path || 
                      null

      if (!file_id) {
        throw new Error("File upload failed: file_id not returned.")
      }

      // 3️⃣ Upload visa letter
      await InstituteService.uploadAdmissionLetter(scfId, file_id)

      message.success(`Admission letter uploaded for ${student.student_name}`)
      setFiles((prev) => ({
        ...prev,
        [student.student_id]: {
          ...(prev[student.student_id] || {}),
          admission: null,
        },
      }))
    } catch (err) {
      message.error(err.message || "Upload failed!")
    } finally {
      setUploading((p) => ({ ...p, [student.student_id]: false }))
    }
  }

  // ✅ Upload Payment Slip for Institute
  const handlePaymentSlipUpload = async (student) => {
    const file = files[student.student_id]?.payment
    if (!file) return message.error("Please select a file before uploading!")

    const scfId = getScfId(student.student_id)
    if (!scfId) return message.error("scf_id not found for this student!")

    try {
      setUploading((p) => ({ ...p, [student.student_id]: true }))

      // 1️⃣ Upload the file first to get file_id
      const fileUploadRes = await FileService.uploadNode(file)
      console.log('File upload response:', fileUploadRes)
      
      // Extract file_id from response (try multiple possible locations)
      const file_id = fileUploadRes?.data?.result?.file_id || 
                      fileUploadRes?.data?.file_id || 
                      fileUploadRes?.data?.result?.id ||
                      null

      console.log('Extracted file_id:', file_id)

      if (!file_id) {
        console.error('File upload response structure:', fileUploadRes)
        throw new Error("File upload failed: file_id not returned.")
      }

      // 2️⃣ Upload payment slip using INSTITUTE endpoint (saves to student_letters table)
      await InstituteService.uploadPaymentSlip(scfId, file_id)

      message.success(`Payment slip uploaded for ${student.student_name}`)
      setFiles((prev) => ({
        ...prev,
        [student.student_id]: {
          ...(prev[student.student_id] || {}),
          payment: null,
        },
      }))
      
      // Reload the page data to show the uploaded payment slip
      window.location.reload()
    } catch (err) {
      console.error('Payment slip upload error:', err)
      message.error(err.message || "Upload failed!")
    } finally {
      setUploading((p) => ({ ...p, [student.student_id]: false }))
    }
  }

  // const handleUpload = async (student) => {
  //   const file = files[student.student_id]
  //   if (!file) return message.error("Please select a file before uploading!")

  //   const paymentRecord = payDetail.find(
  //     (p) => String(p.student_id) === String(student.student_id)
  //   )

  //   if (!paymentRecord) {
  //     return message.error("Payment record not found for this student!")
  //   }

  //   const formData = new FormData()
  //   formData.append("visa_file", file)
  //   formData.append("user_id", paymentRecord.user_id)
  //   formData.append("student_id", student.student_id)
  //   formData.append("ins_id", paymentRecord.institute_id)
  //   // Match backend payload: include visa_status for institute uploads
  //   formData.append("visa_status", 1)

  //   try {
  //     setUploading((p) => ({ ...p, [student.student_id]: true }))
  //     console.log("Institute uploading visa letter:", formData)
  //     await InstituteService.uploadVisaLetter(formData)
  //     message.success(`Visa letter uploaded for ${student.student_name}`)
  //     setFiles((p) => ({ ...p, [student.student_id]: null }))
  //   } catch (err) {
  //     message.error(err.message || "Upload failed!")
  //   } finally {
  //     setUploading((p) => ({ ...p, [student.student_id]: false }))
  //   }
  // }

  // const handleStudentUpload = async () => {
  //   const file = files[studentId]
  //   if (!file) return message.error("Please select a file before uploading!")

  //   const myRecord = payDetail.find(
  //     (p) => String(p.student_id) === String(studentId)
  //   )

  //   if (!myRecord) {
  //     return message.error("Your payment record not found!")
  //   }

  //   const formData = new FormData()
  //   formData.append("visa_file", file)
  //   formData.append("user_id", myRecord.user_id)
  //   formData.append("student_id", studentId)
  //   formData.append("ins_id", myRecord.institute_id)
  //   // Student uploads should not set visa_status here

  //   try {
  //     setUploading((p) => ({ ...p, [studentId]: true }))
  //     await InstituteService.studentUploadVisa(formData)
  //     message.success("Visa letter uploaded successfully!")
  //     setFiles((p) => ({ ...p, [studentId]: null }))

  //     const res = await InstituteService.downloadVisaLetter(studentId)
  //     if (res.data.status && Array.isArray(res.data.files)) {
  //       setStudentFiles(
  //         res.data.files.filter((f) => f.file_name && f.file_name.trim() !== "")
  //       )
  //     }
  //   } catch (err) {
  //     message.error(err.message || "Upload failed!")
  //   } finally {
  //     setUploading((p) => ({ ...p, [studentId]: false }))
  //   }
  // }
  // ✅ Upload for Student
  const handleStudentUpload = async () => {
    const file = files[studentId]
    if (!file) return message.error("Please select a file before uploading!")

    const myRecord = payDetail.find(
      (p) => String(p.student_id) === String(studentId)
    )
    if (!myRecord) {
      return message.error("Your payment record not found!")
    }
    console.log("Student uploading visa letter for record:", myRecord)

    // Step 1: Upload file and get file_id
    let fileId
    try {
      const fileUploadRes = await FileService.uploadNode(file)
      fileId = fileUploadRes?.data?.file_id || 
               fileUploadRes?.data?.result?.file_id || 
               fileUploadRes?.data?.result?.path || 
               fileUploadRes?.data?.path || 
               null
      if (!fileId) throw new Error("File upload failed, no file_id returned")
    } catch (err) {
      return message.error(err.message || "File upload failed!")
    }
    // Step 2: Call new student visa API
    const scfId = myRecord.scf_id
    if (!scfId) return message.error("SCF ID not found for this student!")

    try {
      setUploading((p) => ({ ...p, [studentId]: true }))

      // New API expects JSON: { file_id: "FILE_123" }
      await InstituteService.studentUploadVisa(scfId, { file_id: fileId })

      message.success("Visa letter uploaded successfully!")
      setFiles((p) => ({ ...p, [studentId]: null }))

      // Refresh letter detail + institute letters list from Node backend
      try {
        const detailRes = await InstituteService.getLetterDetails(scfId)
        const detail = detailRes?.data?.data || null
        console.log('[Student Upload] Refreshed letter details:', detail)
        setLetterDetail(detail)

        const letters = detail?.letters || null
        const items = []
        if (letters?.visa_letter && letters?.visa_letter_fileid) {
          items.push({
            kind: "visa-letter",
            scf_id: detail?.scf_id || scfId,
            file_name: "Visa_Letter.pdf",
          })
        }
        if (letters?.admission_letter && letters?.admission_letter_fileid) {
          items.push({
            kind: "admission-letter",
            scf_id: detail?.scf_id || scfId,
            file_name: "Admission_Letter.pdf",
          })
        }
        if (letters?.payment_slip && letters?.payment_slip_fileid) {
          items.push({
            kind: "payment-slip",
            scf_id: detail?.scf_id || scfId,
            file_name: "Payment_Slip.pdf",
          })
        }
        setStudentFiles(items)
        
        // Update myVisaUploads immediately after successful upload
        if (letters?.student_visa_fileid) {
          console.log('[Student Upload] Setting myVisaUploads with scf_id:', scfId)
          setMyVisaUploads([
            {
              kind: "student-visa",
              scf_id: scfId,
              file_name: "Student_Visa.pdf",
            },
          ])
        }
      } catch (e) {
        console.error('[Student Upload] Error refreshing details:', e)
      }
    } catch (err) {
      message.error(err.message || "Upload failed!")
    } finally {
      setUploading((p) => ({ ...p, [studentId]: false }))
    }
  }

  const handleDelete = async (scfId) => {
    if (!scfId) {
      message.error("Invalid document ID")
      return
    }

    try {
      // Call the delete API with scf_id
      await InstituteService.deleteVisaLetter(scfId)
      message.success("Documents deleted successfully")
      
      // Refresh the eligible students list to reflect the deletion
      if (isInstitute) {
        try {
          const res = await InstituteService.getEligibleStudents()
          const list = Array.isArray(res?.data?.data) ? res.data.data : []
          setVisaFiles(list)
        } catch (e) {
          console.warn("Failed to refresh after delete:", e?.message || e)
        }
      }
    } catch (err) {
      console.error("Delete error:", err)
      message.error(err?.response?.data?.message || "Failed to delete documents")
    }
  }

  const handleView = (record) => {
    const safeFileName =
      record.file_name ||
      record.visafieldnew ||
      (record.file_url ? record.file_url.split("/").pop() : "Visa_Letter.pdf")

    console.log('[handleView] Opening modal for:', record)
    setModalDocument({
      ...record,
      file_name: safeFileName, // inject fallback name
    })
    setIsModalVisible(true)
    // Don't set modalLoading here - let the useEffect handle it
  }

  const handleModalClose = () => {
    setIsModalVisible(false)
    setModalDocument(null)
    setModalLoading(false)
    if (modalFileUrl) {
      URL.revokeObjectURL(modalFileUrl)
      setModalFileUrl(null)
    }
  }
  // Load modal file via POST when opened
  useEffect(() => {
    let active = true
    const load = async () => {
      if (!isModalVisible || !modalDocument) {
        return
      }
      
      setModalLoading(true)
      setModalFileUrl(null)
      
      try {
        console.log('[Modal] Loading file for:', modalDocument)
        const url = await fetchViewBlob(modalDocument)
        if (!active) return
        console.log('[Modal] File loaded successfully, URL:', url)
        setModalFileUrl(url)
        setModalLoading(false)
      } catch (e) {
        if (!active) return
        console.error("[Modal] Error loading file:", e)
        message.error(e.message || "Failed to load file")
        setModalLoading(false)
        handleModalClose()
      }
    }
    load()
    return () => {
      active = false
    }
  }, [isModalVisible, modalDocument])

  const handleDownload = (fileUrl, fileName) => {
    if (!fileUrl) {
      message.error("Unable to download file")
      return
    }
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName || "document.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    if (typeof fileUrl === "string" && fileUrl.startsWith("blob:")) {
      setTimeout(() => {
        try {
          window.URL.revokeObjectURL(fileUrl)
        } catch (e) {
          // ignore
        }
      }, 1000)
    }
  }

  const getFileType = (fileName) => {
    if (!fileName) return "unknown"
    const extension = fileName.split(".").pop().toLowerCase()
    if (["pdf"].includes(extension)) return "pdf"
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension))
      return "image"
    return "document"
  }

  const createObjectUrlFromResponse = async (res, expectedKind) => {
    const blob = res?.data
    const headers = res?.headers || {}
    const ctRaw = (headers["content-type"] || headers["Content-Type"] || "").toString()
    const ct = ctRaw.toLowerCase()

    if (!(blob instanceof Blob)) {
      const fallback = new Blob([blob])
      return {
        url: window.URL.createObjectURL(fallback),
        kind: expectedKind || "document",
      }
    }

    if (ct.includes("application/json") || ct.includes("text/html")) {
      const text = await blob.text()
      let msg = "Failed to load document"
      try {
        const parsed = JSON.parse(text)
        msg = parsed?.message || msg
      } catch (e) {
        msg = text || msg
      }
      throw new Error(msg)
    }

    const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer())
    const isPdf =
      bytes.length >= 4 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    const isPng =
      bytes.length >= 4 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    const isJpg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    const isGif =
      bytes.length >= 4 &&
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38

    if (expectedKind === "pdf" && !isPdf) {
      throw new Error("Invalid PDF received from server")
    }

    let kind = expectedKind || "document"
    let mime = ctRaw ? ctRaw.split(";")[0] : ""
    if (isPdf) {
      kind = "pdf"
      mime = "application/pdf"
    } else if (isPng) {
      kind = "image"
      mime = "image/png"
    } else if (isJpg) {
      kind = "image"
      mime = "image/jpeg"
    } else if (isGif) {
      kind = "image"
      mime = "image/gif"
    }

    const normalized = mime ? new Blob([blob], { type: mime }) : blob
    return {
      url: window.URL.createObjectURL(normalized),
      kind,
    }
  }

  // const fetchDownloadBlob = async (record) => {
  //   const id = record?.id || record?.doc_id || null;
  //   if (!id) return null;
  //   const res = await InstituteService.downloadVisaFile(id);
  //   const url = res?.data?.file_url || null;
  //   return url;
  // };
  // const fetchDownloadBlob = async (record) => {
  //   console.log("record", record)
  //   const id = record?.id || record?.scf_id || null
  //   const res = await InstituteService.downloadVisaFile(id);

  //   const baseUrl = res?.data?.file_url; // folder URL
  //   const fileName = record?.file_name;  // get the actual file name from record

  //   if (!baseUrl || !fileName) return null;

  //   const fullUrl = baseUrl.endsWith("/") ? baseUrl + fileName : baseUrl + "/" + fileName;
  //   return fullUrl;
  // };

  const fetchDownloadBlob = async (record) => {
    const scfId = record?.scf_id || null
    const kind = record?.kind || null
    
    console.log('[fetchDownloadBlob] Called with record:', record)
    console.log('[fetchDownloadBlob] scfId:', scfId, 'kind:', kind)
    
    if (!scfId) {
      console.error('[fetchDownloadBlob] No scfId provided')
      message.error('Unable to download: Missing student information')
      return null
    }
    
    try {
      const directUrl = record?.file_url || null
      if (directUrl) {
        console.log('[fetchDownloadBlob] Using direct URL:', directUrl)
        if (typeof directUrl === "string" && directUrl.toLowerCase().startsWith("file:")) {
          message.error("Invalid file URL")
          return null
        }
        const blobRes = await InstituteService.downloadFileByUrl(directUrl)
        const obj = await createObjectUrlFromResponse(blobRes)
        return obj.url
      }

      if (scfId && kind === "visa-letter") {
        console.log('[fetchDownloadBlob] Downloading visa letter for scfId:', scfId)
        try {
          const res = await InstituteService.downloadVisaLetterFile(scfId)
          console.log('[fetchDownloadBlob] Visa letter response received')
          const obj = await createObjectUrlFromResponse(res, "pdf")
          console.log('[fetchDownloadBlob] Visa letter blob URL created:', obj.url)
          return obj.url
        } catch (error) {
          console.error('[fetchDownloadBlob] Visa letter error:', error)
          if (error?.response?.status === 404) {
            const errorMsg = error?.response?.data?.message || "Visa letter has not been uploaded yet"
            message.error(errorMsg)
            return null
          }
          throw error
        }
      }
      if (scfId && kind === "admission-letter") {
        console.log('[fetchDownloadBlob] Downloading admission letter for scfId:', scfId)
        const res = await InstituteService.downloadAdmissionLetterFile(scfId)
        console.log('[fetchDownloadBlob] Admission letter response received')
        const obj = await createObjectUrlFromResponse(res, "pdf")
        console.log('[fetchDownloadBlob] Admission letter blob URL created:', obj.url)
        return obj.url
      }
      if (scfId && kind === "payment-slip") {
        console.log('[fetchDownloadBlob] Downloading payment slip for scfId:', scfId)
        try {
          const res = await InstituteService.downloadPaymentSlipFile(scfId)
          console.log('[fetchDownloadBlob] Payment slip response received')
          const obj = await createObjectUrlFromResponse(res, "pdf")
          console.log('[fetchDownloadBlob] Payment slip blob URL created:', obj.url)
          return obj.url
        } catch (error) {
          console.error('[fetchDownloadBlob] Payment slip error:', error)
          if (error?.response?.status === 404) {
            const errorMsg = error?.response?.data?.message || "Payment slip has not been uploaded yet"
            message.error(errorMsg)
            return null
          }
          throw error
        }
      }
      if (scfId && kind === "student-visa") {
        console.log('[fetchDownloadBlob] Downloading student visa for scfId:', scfId)
        console.log('[fetchDownloadBlob] Full record:', record)
        try {
          const res = await InstituteService.downloadVisaFileforStd(scfId)
          console.log('[fetchDownloadBlob] Student visa response received')
          console.log('[fetchDownloadBlob] Response headers:', res.headers)
          const obj = await createObjectUrlFromResponse(res, "pdf")
          console.log('[fetchDownloadBlob] Student visa blob URL created:', obj.url)
          return obj.url
        } catch (error) {
          console.error('[fetchDownloadBlob] Student visa error:', error)
          console.error('[fetchDownloadBlob] Error response:', error?.response)
          console.error('[fetchDownloadBlob] Error response data:', error?.response?.data)
          console.error('[fetchDownloadBlob] Error response status:', error?.response?.status)
          if (error?.response?.status === 404) {
            const errorMsg = error?.response?.data?.message || "Student visa has not been uploaded yet"
            message.error(errorMsg)
            return null
          }
          throw error
        }
      }
      if (scfId && kind === "student-ticket") {
        console.log('[fetchDownloadBlob] Downloading ticket for scfId:', scfId)
        try {
          const res = await InstituteService.downloadTicketFile(scfId)
          const obj = await createObjectUrlFromResponse(res, "pdf")
          return obj.url
        } catch (error) {
          if (error?.response?.status === 404) {
            const errorMsg = error?.response?.data?.message || "Ticket has not been uploaded yet"
            message.error(errorMsg)
            return null
          }
          throw error
        }
      }

      // Legacy fallback - but this might be the problematic part
      const id = record?.id || record?.doc_id || null
      if (!id) {
        console.error("[fetchDownloadBlob] No valid ID found for download:", record)
        return null
      }
      
      console.log("[fetchDownloadBlob] Attempting legacy download for ID:", id)
      const res = await InstituteService.downloadVisaFile(id)
      const url = res?.data?.file_url || null
      if (!url) {
        console.error("[fetchDownloadBlob] No file URL returned from legacy API")
        return null
      }
      const blobRes = await InstituteService.downloadFileByUrl(url)
      const obj = await createObjectUrlFromResponse(blobRes)
      return obj.url
    } catch (error) {
      console.error("[fetchDownloadBlob] Error:", error)
      console.error("[fetchDownloadBlob] Error response:", error?.response)
      console.error("[fetchDownloadBlob] Error message:", error?.message)
      message.error("Failed to download file: " + (error?.response?.data?.message || error.message || "Unknown error"))
      return null
    }
  }

  const fetchViewBlob = async (record) => {
    const scfId = record?.scf_id || null
    const kind = record?.kind || null
    const directUrl = record?.file_url || null

    console.log('[fetchViewBlob] Called with:', { scfId, kind, directUrl })

    // For ALL document types, just use the download endpoint
    // This is simpler and more consistent
    return fetchDownloadBlob(record)
  }

  const getFileIcon = (fileName) => {
    const fileType = getFileType(fileName)
    switch (fileType) {
      case "pdf":
        return <FilePdfOutlined style={{ color: "#ff4d4f" }} />
      case "image":
        return <FileImageOutlined style={{ color: "#52c41a" }} />
      default:
        return <FilePdfOutlined style={{ color: "#1890ff" }} />
    }
  }

  // ✅ Ticket handling functions
  const handleTicketFileUpload = async (file) => {
    const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/')
    if (!isValidType) {
      message.error('You can only upload PDF or image files!')
      return false
    }

    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!')
      return false
    }

    setUploading((p) => ({ ...p, ticket: true }))
    try {
      console.log('[Ticket Upload] Starting upload for file:', file.name)
      const uploadRes = await FileService.upload(file)
      console.log('[Ticket Upload] Upload response:', uploadRes)
      console.log('[Ticket Upload] file_id:', uploadRes.data.file_id)
      console.log('[Ticket Upload] file_url:', uploadRes.data.file_url)
      
      const fileData = {
        file_id: uploadRes.data.file_id,
        file_url: uploadRes.data.file_url
      }
      
      console.log('[Ticket Upload] Sending to backend:', fileData)

      const saveRes = await StudentService.saveTicketDetails(fileData)
      console.log('[Ticket Upload] Save response:', saveRes)
      
      if (saveRes.data && saveRes.data.success) {
        message.success('Ticket file uploaded successfully!')
        // Refresh ticket details
        const res = await StudentService.getTicketDetails()
        console.log('[Ticket Upload] Refreshed ticket details:', res.data)
        if (res.data && res.data.result) {
          setTicketDetails(res.data.result)
        }
      } else {
        message.error(saveRes.data?.message || 'Failed to save ticket details')
      }
    } catch (error) {
      console.error('[Ticket Upload] Error:', error)
      message.error(error.response?.data?.message || 'Failed to upload ticket file')
    } finally {
      setUploading((p) => ({ ...p, ticket: false }))
    }

    return false
  }

  const hasVisaLetter = (Array.isArray(studentFiles) ? studentFiles : []).some(
    (f) => f?.kind === "visa-letter"
  )
  const hasAdmissionLetter = (
    Array.isArray(studentFiles) ? studentFiles : []
  ).some((f) => f?.kind === "admission-letter")
  const canUploadStudentVisa = hasVisaLetter && hasAdmissionLetter
  const hasUploadedStudentVisa = (Array.isArray(myVisaUploads) ? myVisaUploads : []).length > 0
  const studentVisaStatus = String(
    letterDetail?.letters?.student_visa_status ?? ""
  )

  // =========================
  // 📊 Columns & Data
  // =========================

  const pendingColumns = [
    { title: "Reg No", dataIndex: "student_regno", key: "regNo", width: 120 },
    { title: "Name", dataIndex: "student_name", key: "name", width: 180 },
    { title: "Course", dataIndex: "specialization", key: "course", width: 200 },
    {
      title: "Upload Documents",
      key: "uploadDocuments",
      width: 400,
      render: (_, student) => (
        <div className="flex flex-col gap-2">
          {/* Visa Letter Upload */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-32">Visa Letter:</span>
            <Upload
              beforeUpload={(f) =>
                handleBeforeUpload(f, student.student_id, "visa")
              }
              maxCount={1}
              showUploadList={!!files[student.student_id]?.visa}
              onRemove={() => {
                setFiles((prev) => ({
                  ...prev,
                  [student.student_id]: {
                    ...(prev[student.student_id] || {}),
                    visa: null,
                  },
                }))
                return true
              }}
            >
              <Button size="small" icon={<UploadOutlined />}>Select</Button>
            </Upload>
            {files[student.student_id]?.visa && (
              <Button
                type="primary"
                size="small"
                className="bg-blue-500"
                onClick={() => handleVisaLetterUpload(student)}
                loading={uploading[student.student_id]?.visa}
              >
                {uploading[student.student_id]?.visa ? "Uploading..." : "Upload"}
              </Button>
            )}
          </div>

          {/* Admission Letter Upload */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-32">Admission Letter:</span>
            <Upload
              beforeUpload={(f) =>
                handleBeforeUpload(f, student.student_id, "admission")
              }
              maxCount={1}
              showUploadList={!!files[student.student_id]?.admission}
              onRemove={() => {
                setFiles((prev) => ({
                  ...prev,
                  [student.student_id]: {
                    ...(prev[student.student_id] || {}),
                    admission: null,
                  },
                }))
                return true
              }}
            >
              <Button size="small" icon={<UploadOutlined />}>Select</Button>
            </Upload>
            {files[student.student_id]?.admission && (
              <Button
                type="primary"
                size="small"
                className="bg-blue-500"
                onClick={() => handleAdmissionLetterUpload(student)}
                loading={uploading[student.student_id]?.admission}
              >
                {uploading[student.student_id]?.admission
                  ? "Uploading..."
                  : "Upload"}
              </Button>
            )}
          </div>

          {/* Payment Slip Upload */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-32">Payment Slip:</span>
            <Upload
              beforeUpload={(f) =>
                handleBeforeUpload(f, student.student_id, "payment")
              }
              maxCount={1}
              showUploadList={!!files[student.student_id]?.payment}
              onRemove={() => {
                setFiles((prev) => ({
                  ...prev,
                  [student.student_id]: {
                    ...(prev[student.student_id] || {}),
                    payment: null,
                  },
                }))
                return true
              }}
            >
              <Button size="small" icon={<UploadOutlined />}>Select</Button>
            </Upload>
            {files[student.student_id]?.payment && (
              <Button
                type="primary"
                size="small"
                className="bg-blue-500"
                onClick={() => handlePaymentSlipUpload(student)}
                loading={uploading[student.student_id]?.payment}
              >
                {uploading[student.student_id]?.payment
                  ? "Uploading..."
                  : "Upload"}
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "View & Download",
      key: "viewDownload",
      width: 350,
      render: (_, student) => {
        const scfId = getScfId(student.student_id)
        return (
          <div className="flex flex-col gap-2">
            {/* Visa Letter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-32">Visa Letter:</span>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  if (!scfId) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  handleView({
                    kind: "visa-letter",
                    scf_id: scfId,
                    file_name: "Visa_Letter.pdf",
                    student_name: student.student_name,
                    student_regno: student.student_regno,
                  })
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}
              >
                View
              </Button>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  if (!scfId) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  try {
                    const res = await InstituteService.downloadVisaLetterFile(scfId)
                    const contentType = res.headers['content-type'] || 'application/pdf'
                    const blob = new Blob([res.data], { type: contentType })
                    const url = window.URL.createObjectURL(blob)
                    handleDownload(url, "Visa_Letter.pdf")
                  } catch (e) {
                    console.error("Failed to download visa letter:", e)
                    message.error("Failed to download visa letter")
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}
              >
                Download
              </Button>
            </div>

            {/* Admission Letter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-32">Admission Letter:</span>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  if (!scfId) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  handleView({
                    kind: "admission-letter",
                    scf_id: scfId,
                    file_name: "Admission_Letter.pdf",
                    student_name: student.student_name,
                    student_regno: student.student_regno,
                  })
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}
              >
                View
              </Button>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  if (!scfId) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  try {
                    const res = await InstituteService.downloadAdmissionLetterFile(scfId)
                    const contentType = res.headers['content-type'] || 'application/pdf'
                    const blob = new Blob([res.data], { type: contentType })
                    const url = window.URL.createObjectURL(blob)
                    handleDownload(url, "Admission_Letter.pdf")
                  } catch (e) {
                    message.error("Failed to download admission letter")
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}
              >
                Download
              </Button>
            </div>

            {/* Payment Slip */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-32">Payment Slip:</span>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={async () => {
                  if (!scfId) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  try {
                    handleView({
                      kind: "payment-slip",
                      scf_id: scfId,
                      file_name: "Payment_Slip.pdf",
                      student_name: student.student_name,
                      student_regno: student.student_regno,
                    })
                  } catch (e) {
                    const errorMsg = e?.response?.data?.message || "Failed to view payment slip"
                    message.error(errorMsg)
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}
              >
                View
              </Button>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  if (!scfId) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  try {
                    const res = await InstituteService.downloadPaymentSlipFile(scfId)
                    const contentType = res.headers['content-type'] || 'application/pdf'
                    const blob = new Blob([res.data], { type: contentType })
                    const url = window.URL.createObjectURL(blob)
                    handleDownload(url, "Payment_Slip.pdf")
                  } catch (e) {
                    const errorMsg = e?.response?.data?.message || "Failed to download payment slip"
                    message.error(errorMsg)
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}
              >
                Download
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, student) => {
        const scfId = getScfId(student.student_id)
        return (
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={async () => {
              if (!scfId) {
                message.error("scf_id not found for this student!")
                return
              }
              Modal.confirm({
                title: 'Delete All Documents',
                content: `Are you sure you want to delete all documents for ${student.student_name}?`,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: async () => {
                  await handleDelete(scfId)
                },
              })
            }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Delete
          </Button>
        )
      },
    },
  ]

  const uploadedColumns = [
    {
      title: "Reg No",
      key: "student_regno",
      render: (_, r) =>
        payDetail.find((s) => String(s.student_id) === String(r.student_id))
          ?.student_regno || "N/A",
    },
    {
      title: "Student Name",
      key: "student_name",
      render: (_, r) =>
        payDetail.find((s) => String(s.student_id) === String(r.student_id))
          ?.student_name || "Unknown",
    },
    {
      title: "Visa Letter",
      key: "visaFile",
      render: (_, r) => (
        <Button
          type="link"
          className="p-0"
          onClick={async () => {
            const scfId = getScfId(r.student_id)
            if (!scfId) {
              message.error("scf_id not found for this student!")
              return
            }
            try {
              const res = await InstituteService.downloadVisaLetterFile(scfId)
              const contentType = res.headers['content-type'] || 'application/pdf'
              const blob = new Blob([res.data], { type: contentType })
              const url = window.URL.createObjectURL(blob)
              handleDownload(url, r.file_name || "Visa_Letter.pdf")
            } catch (e) {
              console.error("Failed to download visa letter:", e)
              message.error("Failed to download visa letter")
            }
          }}
        >
          Download
        </Button>
      ),
    },
    {
      title: "Admission Letter",
      key: "admissionFile",
      render: (_, r) => (
        <Button
          type="link"
          className="p-0"
          onClick={async () => {
            const scfId = getScfId(r.student_id)
            if (!scfId) {
              message.error("scf_id not found for this student!")
              return
            }
            try {
              const res = await InstituteService.downloadAdmissionLetterFile(scfId)
              const contentType = res.headers['content-type'] || 'application/pdf'
              const blob = new Blob([res.data], { type: contentType })
              const url = window.URL.createObjectURL(blob)
              handleDownload(url, r.file_name || "Admission_Letter.pdf")
            } catch (e) {
              message.error("Failed to download admission letter")
            }
          }}
        >
          Download
        </Button>
      ),
    },
    {
      title: "Payment Slip",
      key: "paymentFile",
      render: (_, r) => (
        <Button
          type="link"
          className="p-0"
          onClick={async () => {
            const scfId = getScfId(r.student_id)
            if (!scfId) {
              message.error("scf_id not found for this student!")
              return
            }
            try {
              const res = await InstituteService.downloadPaymentSlipFile(scfId)
              const contentType = res.headers['content-type'] || 'application/pdf'
              const blob = new Blob([res.data], { type: contentType })
              const url = window.URL.createObjectURL(blob)
              handleDownload(url, r.file_name || "Payment_Slip.pdf")
            } catch (e) {
              const errorMsg = e?.response?.data?.message || "Failed to download payment slip"
              message.error(errorMsg)
            }
          }}
        >
          Download
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, r) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(r.id)}
        >
          Delete
        </Button>
      ),
    },
  ]

  // ✅ Updated Columns for Visa and Ticket Details Uploaded By Student
  const visaLetterUploaded = [
    {
      title: "Reg No",
      dataIndex: "student_regno",
      key: "student_regno",
      width: 120,
    },
    {
      title: "Name",
      dataIndex: "student_name",
      key: "student_name",
      width: 180,
    },
    {
      title: "Course",
      dataIndex: "specialization",
      key: "specialization",
      width: 200,
      render: (_, record) => {
        // Try to get course from payDetail
        const student = payDetail.find(
          (s) => String(s.student_id) === String(record.student_id)
        )
        return student?.specialization || "N/A"
      },
    },
    {
      title: "Student Visa & Ticket",
      key: "documents",
      width: 300,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          {/* Student Visa */}
          {record.hasVisa && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-16">Visa:</span>
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  if (!record?.scf_id) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  handleView({
                    ...record,
                    kind: "student-visa",
                    file_name: "Student_Visa.pdf",
                  })
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                View
              </Button>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  if (!record?.scf_id) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  const url = await fetchDownloadBlob({
                    ...record,
                    kind: "student-visa",
                  })
                  if (!url) return
                  handleDownload(url, "Student_Visa.pdf")
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Download
              </Button>
            </div>
          )}
          
          {/* Student Ticket */}
          {record.hasTicket && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-16">Ticket:</span>
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  if (!record?.scf_id) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  handleView({
                    ...record,
                    kind: "student-ticket",
                    file_name: "Flight_Ticket.pdf",
                  })
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                View
              </Button>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  if (!record?.scf_id) {
                    message.error("scf_id not found for this student!")
                    return
                  }
                  const url = await fetchDownloadBlob({
                    ...record,
                    kind: "student-ticket",
                  })
                  if (!url) return
                  handleDownload(url, "Flight_Ticket.pdf")
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Download
              </Button>
            </div>
          )}

          {!record.hasVisa && !record.hasTicket && (
            <span className="text-gray-400 text-xs">No documents uploaded</span>
          )}
        </div>
      ),
    },
    {
      title: "Visa Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color, text
        if (status === "1") {
          color = "green"
          text = "Accepted"
        } else if (status === "2") {
          color = "red"
          text = "Rejected"
        } else if (status === "0") {
          color = "orange"
          text = "Pending"
        } else {
          color = "blue"
          text = "Unknown"
        }
        return <Tag color={color}>{text}</Tag>
      },
      filters: [
        { text: "Pending", value: "0" },
        { text: "Accepted", value: "1" },
        { text: "Rejected", value: "2" },
        { text: "Unknown", value: "unknown" },
      ],
      onFilter: (value, record) => {
        if (value === "unknown") return !record.status
        return record.status === value
      },
    },
    {
      title: "Action",
      key: "institute_remark",
      width: 200,
      render: (_, record) => (
        <div className="flex gap-2">
          <Dropdown
            menu={{
              items: [
                {
                  key: "accept",
                  label: "Accept",
                  onClick: () => handleRemark(record, "1"),
                },
                {
                  key: "reject",
                  label: "Reject",
                  onClick: () => handleRemark(record, "2"),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button onClick={(e) => e.preventDefault()} className="text-blue-600">
              Update Status <DownOutlined />
            </Button>
          </Dropdown>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              const scfId = record?.scf_id || getScfId(record.student_id)
              if (!scfId) {
                message.error("scf_id not found for this student!")
                return
              }
              Modal.confirm({
                title: 'Delete Student Documents',
                content: `Are you sure you want to delete the documents for ${record.student_name}?`,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => handleDelete(scfId),
              })
            }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </div>
      ),
    },
  ]

  // ✅ Handle Institute Remark (Status Update)
  const handleRemark = async (record, newStatus) => {
    try {
      const scfId = record?.scf_id || getScfId(record.student_id)
      if (!scfId) return message.error("scf_id not found for this student!")

      await InstituteService.updateVisaStatus(scfId, newStatus)

      message.success("Status updated successfully")

      // Update local state
      setVisaFiles((prev) =>
        prev.map((file) => {
          const fileKey = file?.scf_id || file?.id || file?.student_id
          const recordKey = record?.scf_id || record?.id || record?.student_id
          if (String(fileKey) !== String(recordKey)) return file

          if (file?.letters) {
            return {
              ...file,
              letters: {
                ...file.letters,
                student_visa_status: newStatus,
              },
            }
          }

          return { ...file, visastatus: newStatus }
        })
      )
    } catch (err) {
      message.error(err.message || "Failed to update status")
    }
  }

  // ✅ Memoized dynamic data for Visa and Ticket Details Uploaded By Student
  const visaLetterData = useMemo(() => {
    const src = Array.isArray(visaFiles) ? visaFiles : []

    // Node /student/letters shape
    if (src.length > 0 && src[0] && src[0].letters) {
      return src
        .filter((row) => {
          // Include if student has uploaded visa OR ticket
          const hasVisa = !!row?.letters?.student_visa_fileid
          const hasTicket = !!row?.letters?.ticket_file
          return hasVisa || hasTicket
        })
        .map((row, index) => ({
          key: row.scf_id || index,
          kind: "student-visa",
          scf_id: row.scf_id,
          student_id: row.student_id,
          student_regno: row.student_regno || "N/A",
          student_name: row.student_name || "Unknown",
          specialization: row.specialization || "N/A",
          file_name: "Student_Visa.pdf",
          hasVisa: !!row?.letters?.student_visa_fileid,
          hasTicket: !!row?.letters?.ticket_file,
          ticket_file: row?.letters?.ticket_file || null,
          status:
            row?.letters?.student_visa_status !== undefined &&
            row?.letters?.student_visa_status !== null
              ? String(row.letters.student_visa_status)
              : "0",
        }))
    }

    // Legacy listAllVisa shape fallback
    const withFiles = src.filter((f) => {
      const hasUrl = !!f?.file_url
      const hasName = !!f?.visafieldnew
      return hasUrl || hasName
    })

    return withFiles.map((file, index) => ({
      key: file.id || index,
      kind: "student-visa",
      scf_id: getScfId(file.student_id) || null,
      student_id: file.student_id,
      student_regno: file.regno || "N/A",
      student_name: file.user_name || "Unknown",
      file_name: file.visafieldnew || "Student_Visa.pdf",
      hasVisa: true,
      hasTicket: false,
      ticket_file: null,
      status:
        file.visastatus !== undefined && file.visastatus !== null
          ? String(file.visastatus)
          : file.visa_status !== undefined && file.visa_status !== null
          ? String(file.visa_status)
          : "0",
      id: file.id,
    }))
  }, [visaFiles])

  const filteredPayDetail = useMemo(() => {
    if (!searchText) return payDetail
    return payDetail.filter(
      (i) =>
        i.student_name.toLowerCase().includes(searchText.toLowerCase()) ||
        i.student_regno.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [searchText, payDetail])

  // filteredUploaded was used by an older, commented-out tab. Remove to avoid linter warnings.

  const renderModalContent = () => {
    if (!modalDocument) return null

    console.log("modalDocument in renderModalContent:", modalDocument)
    const fileType = getFileType(modalDocument.file_name)
    console.log("Rendering modal for file type:", fileType)
    const rawUrl = modalFileUrl || null
    const fileUrl =
      rawUrl &&
      (String(rawUrl).startsWith("blob:") ||
        String(rawUrl).startsWith("data:") ||
        String(rawUrl).startsWith("http"))
        ? rawUrl
        : null

    return (
      <div className="document-viewer">
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(modalDocument.file_name)}
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {modalDocument.file_name || "Visa Letter"}
                </h3>
                <p className="text-gray-600 text-sm">
                  Student: {modalDocument.student_name} (
                  {modalDocument.student_regno})
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  try {
                    const url = await fetchDownloadBlob(modalDocument)
                    if (!url) {
                      message.error("Unable to download file")
                      return
                    }
                    handleDownload(url, modalDocument.file_name)
                  } catch (e) {
                    message.error(e?.message || "Unable to download file")
                  }
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>

        <div
          className="document-preview"
          style={{
            height: "60vh",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
          }}
        >
          {modalLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spin size="large" />
            </div>
          ) : !fileUrl ? (
            <div className="flex justify-center items-center h-full">
              <Empty description="Unable to load document" />
            </div>
          ) : (
            <div className="h-full">
              {fileType === "pdf" ? (
                <object
                  data={fileUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  style={{ border: "none", borderRadius: "6px" }}
                  aria-label="Document Preview"
                >
                  <embed
                    src={fileUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style={{ border: "none", borderRadius: "6px" }}
                  />
                </object>
              ) : fileType === "image" ? (
                <div className="flex justify-center items-center h-full bg-gray-50">
                  <img
                    src={fileUrl}
                    alt="Document Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-full bg-gray-50">
                  <FilePdfOutlined
                    style={{
                      fontSize: "48px",
                      color: "#1890ff",
                      marginBottom: "16px",
                    }}
                  />
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      handleDownload(fileUrl, modalDocument.file_name)
                    }
                  >
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-head-gradient" style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <h2>
          {isInstitute ? "Manage Visa Letters" : "Download Visa Letter"}
        </h2>
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

      {/* Body */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : isInstitute ? (
        <Card className="rounded-md text-blue-300">
          <Input.Search
            placeholder="Search by Reg No or Name"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16, maxWidth: 300 }}
            allowClear
          />

          <Tabs defaultActiveKey="0">
            <Tabs.TabPane tab={`All (${filteredPayDetail.length})`} key="0">
              <Table
                dataSource={filteredPayDetail}
                columns={pendingColumns}
                rowKey="student_id"
                pagination={{ pageSize: 10 }}
              />
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={`Visa and Ticket Detail Uploaded By Student (${visaLetterData.length})`}
              key="1"
            >
              {loading && visaLetterData.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Spin tip="Loading student visa files..." />
                </div>
              ) : visaLetterData.length === 0 ? (
                <Empty description="No visa files uploaded by students yet." />
              ) : (
                <Table
                  columns={visaLetterUploaded}
                  dataSource={visaLetterData}
                  rowKey="key"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    total: visaLetterData.length,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} items`,
                  }}
                  bordered
                  scroll={{ x: true }}
                />
              )}
            </Tabs.TabPane>
          </Tabs>
        </Card>
      ) : (
        <Card className=" ">
          <Tabs defaultActiveKey="inst" tabBarGutter={32}>
            {/* ===== Institute Visa Letters ===== */}
            <Tabs.TabPane tab="Visa Letter sent by Institute" key="visa">
              {studentFiles.filter((f) => f.kind === "visa-letter").length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={studentFiles.filter((f) => f.kind === "visa-letter")}
                  renderItem={(file) => (
                    <List.Item className="px-4 py-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition">
                      <div className="flex justify-between items-center w-full">
                        {/* File Info */}
                        <div className="flex items-center gap-3">
                          <FilePdfOutlined className="text-red-500 text-2xl" />
                          <span className="text-base font-medium text-gray-800">
                            {file ? "Visa_letter" : "No file"}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(file)}
                            className="bg-blue-500 rounded-lg"
                          >
                            View
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={async () => {
                              const url = await fetchDownloadBlob(file)
                              if (!url) return
                              handleDownload(
                                url,
                                file.file_name || "Visa_Letter.pdf"
                              )
                            }}
                            className="bg-blue-500 rounded-lg"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description={
                    <span className="text-gray-600 font-medium">
                      No visa letter uploaded yet by institute
                    </span>
                  }
                  className="py-10"
                />
              )}
            </Tabs.TabPane>

            {/* ===== Student Admission Upload ===== */}
            <Tabs.TabPane tab="Admission Letter sent by Institute" key="admsn">
              {studentFiles.filter((f) => f.kind === "admission-letter").length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={studentFiles.filter((f) => f.kind === "admission-letter")}
                  renderItem={(file) => (
                    <List.Item className="px-4 py-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition">
                      <div className="flex justify-between items-center w-full">
                        {/* File Info */}
                        <div className="flex items-center gap-3">
                          <FilePdfOutlined className="text-red-500 text-2xl" />
                          <span className="text-base font-medium text-gray-800">
                            {file ? "Admission_letter" : "No file"}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(file)}
                            className="bg-blue-500 rounded-lg"
                          >
                            View
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={async () => {
                              const url = await fetchDownloadBlob(file)
                              if (!url) return
                              handleDownload(
                                url,
                                file.file_name || "Admission_Letter.pdf"
                              )
                            }}
                            className="bg-blue-500 rounded-lg"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description={
                    <span className="text-gray-600 font-medium">
                      No admission letter uploaded yet by institute
                    </span>
                  }
                  className="py-10"
                />
              )}
            </Tabs.TabPane>

            {/* ===== Payment Slip ===== */}
            <Tabs.TabPane tab="Payment Slip" key="payment">
              {studentFiles.filter((f) => f.kind === "payment-slip").length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={studentFiles.filter((f) => f.kind === "payment-slip")}
                  renderItem={(file) => (
                    <List.Item className="px-4 py-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition">
                      <div className="flex justify-between items-center w-full">
                        {/* File Info */}
                        <div className="flex items-center gap-3">
                          <FilePdfOutlined className="text-red-500 text-2xl" />
                          <span className="text-base font-medium text-gray-800">
                            {file ? "Payment_Slip" : "No file"}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(file)}
                            className="bg-blue-500 rounded-lg"
                          >
                            View
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={async () => {
                              const url = await fetchDownloadBlob(file)
                              if (!url) return
                              handleDownload(
                                url,
                                file.file_name || "Payment_Slip.pdf"
                              )
                            }}
                            className="bg-blue-500 rounded-lg"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description={
                    <span className="text-gray-600 font-medium">
                      No payment slip uploaded yet by institute
                    </span>
                  }
                  className="py-10"
                />
              )}
            </Tabs.TabPane>

            {/* ===== Travel Details (Visa & Ticket) ===== */}
            <Tabs.TabPane tab="Travel Details" key="student">
              {!canUploadStudentVisa ? (
                /* Empty State */
                <div className="text-center py-14 bg-gray-50 rounded-xl border border-dashed border-gray-300 shadow-sm">
                  <FilePdfOutlined style={{ fontSize: 64, color: "#faad14" }} />
                  <h3 className="mt-5 text-lg font-semibold text-gray-800">
                    Visa Letter Not Yet Uploaded
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                    You’ll be able to upload your visa once the institute
                    uploads the visa letter.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dropdown to select between Visa and Ticket */}
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Travel Detail Type
                    </label>
                    <Select
                      value={travelDetailType}
                      onChange={setTravelDetailType}
                      style={{ width: '100%', maxWidth: 400 }}
                      size="large"
                    >
                      <Select.Option value="visa">Upload Your Visa Panel</Select.Option>
                      <Select.Option value="ticket">Upload Your Ticket Panel</Select.Option>
                    </Select>
                  </div>

                  {/* Visa Upload Panel */}
                  {travelDetailType === "visa" && (
                    <div className="space-y-8">
                      {/* Your Uploaded Visa(s) */}
                      <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">
                          Your Uploaded Visa
                        </h4>
                        {myVisaUploads && myVisaUploads.length > 0 ? (
                          <List
                            itemLayout="horizontal"
                            dataSource={myVisaUploads}
                            renderItem={(file) => (
                              <List.Item className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                                <div className="flex justify-between items-center w-full">
                                  <div className="flex items-center gap-3">
                                    {getFileIcon(file.file_name)}
                                    <span className="text-base font-medium text-gray-800">
                                      {file.file_name || "Visa.pdf"}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<EyeOutlined />}
                                      onClick={() =>
                                        handleView({
                                          ...file,
                                          student_name: util.getName?.() || "",
                                          student_regno: util.getRegno?.() || "",
                                        })
                                      }
                                      className="bg-blue-500 rounded-lg"
                                    >
                                      View
                                    </Button>
                                    <Button
                                      size="small"
                                      icon={<DownloadOutlined />}
                                      onClick={async () => {
                                        const url = await fetchDownloadBlob(file)
                                        if (!url) return
                                        handleDownload(
                                          url,
                                          file.file_name || "Visa_Letter.pdf"
                                        )
                                      }}
                                      className="rounded-lg"
                                    >
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <div className="text-gray-500">No visa uploaded yet.</div>
                        )}
                      </div>

                      {/* Current Visa Status */}
                      <div
                        className={`
                          p-5 rounded-lg shadow-sm border-l-4
                          ${
                            studentVisaStatus === "1"
                              ? "bg-green-50 border-green-500"
                              : studentVisaStatus === "2"
                              ? "bg-red-50 border-red-500"
                              : studentVisaStatus === "0"
                              ? "bg-orange-50 border-orange-400"
                              : "bg-blue-50 border-blue-400"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="">
                            <h4 className="text-lg font-semibold text-gray-800">
                              Visa Application Status
                            </h4>
                            <p className="text-lg text-gray-600 mt-1">
                              {studentVisaStatus === "1"
                                ? "Your visa has been accepted 🎉"
                                : studentVisaStatus === "2"
                                ? "Your visa has been rejected ❌"
                                : studentVisaStatus === "0"
                                ? "Your visa is under review ⏳"
                                : "Unknown status"}
                            </p>
                          </div>
                          <Tag
                            className="px-3 py-1 text-lg rounded-md font-medium"
                            color={
                              studentVisaStatus === "1"
                                ? "green"
                                : studentVisaStatus === "2"
                                ? "red"
                                : studentVisaStatus === "0"
                                ? "orange"
                                : "blue"
                            }
                          >
                            {studentVisaStatus === "1"
                              ? "Accepted"
                              : studentVisaStatus === "2"
                              ? "Rejected"
                              : studentVisaStatus === "0"
                              ? "Pending"
                              : "Unknown"}
                          </Tag>
                        </div>
                      </div>

                      {/* Upload Section */}
                      <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">
                          Upload Your Visa Document
                        </h4>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {(!hasUploadedStudentVisa || studentVisaStatus === "2") && (
                            <>
                              <Upload
                                beforeUpload={(f) => {
                                  setFiles((p) => ({ ...p, [studentId]: f }))
                                  return false
                                }}
                                maxCount={1}
                                showUploadList={!!files[studentId]}
                                onRemove={() => {
                                  setFiles((p) => ({ ...p, [studentId]: null }))
                                  return true
                                }}
                              >
                                <Button
                                  icon={<UploadOutlined />}
                                  className="rounded-lg"
                                  type="dashed"
                                >
                                  Select Visa Document
                                </Button>
                              </Upload>
                              {studentVisaStatus === "2" && (
                                <span className="text-sm text-orange-600 font-medium">
                                  Your visa was rejected. Please upload a new document.
                                </span>
                              )}
                            </>
                          )}

                          {(!hasUploadedStudentVisa || studentVisaStatus === "2") && files[studentId] && (
                            <Button
                              type="primary"
                              className="bg-blue-500 rounded-lg shadow-md"
                              onClick={handleStudentUpload}
                              loading={uploading[studentId]}
                            >
                              {uploading[studentId]
                                ? "Uploading..."
                                : studentVisaStatus === "2" 
                                ? "Re-upload Visa" 
                                : "Upload Visa"}
                            </Button>
                          )}

                          {hasUploadedStudentVisa && studentVisaStatus !== "2" && (
                            <div className="text-gray-500 text-sm">
                              Your visa has been uploaded and is {studentVisaStatus === "1" ? "accepted" : "under review"}.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ticket Upload Panel */}
                  {travelDetailType === "ticket" && (
                    <div className="space-y-6">
                      {/* Your Uploaded Ticket */}
                      <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">
                          Your Uploaded Ticket
                        </h4>
                        {ticketDetails && ticketDetails.ticket_file ? (
                          <List
                            itemLayout="horizontal"
                            dataSource={[{
                              file_name: 'Student_Ticket.pdf',
                              file_url: ticketDetails.ticket_file,
                              uploaded_at: ticketDetails.updated || ticketDetails.created
                            }]}
                            renderItem={(file) => {
                              // Create a proper file object for the ticket
                              const ticketFileObj = {
                                kind: "student-ticket",
                                scf_id: letterDetail?.scf_id || null,
                                file_name: 'Student_Ticket.pdf',
                                student_name: util.getName?.() || "",
                                student_regno: util.getRegno?.() || "",
                              };
                              
                              return (
                              <List.Item className="px-4 py-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition">
                                <div className="flex justify-between items-center w-full">
                                  <div className="flex items-center gap-3">
                                    {file.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                      <FileImageOutlined className="text-blue-500 text-2xl" />
                                    ) : (
                                      <FilePdfOutlined className="text-red-500 text-2xl" />
                                    )}
                                    <div>
                                      <span className="text-base font-medium text-gray-800">
                                        Student_Ticket.pdf
                                      </span>
                                      {file.uploaded_at && (
                                        <div className="text-gray-500 text-sm mt-1">
                                          Uploaded on: {new Date(file.uploaded_at).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric'
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<EyeOutlined />}
                                      onClick={() => handleView(ticketFileObj)}
                                      className="bg-blue-500 rounded-lg"
                                    >
                                      View
                                    </Button>
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<DownloadOutlined />}
                                      onClick={async () => {
                                        const url = await fetchDownloadBlob(ticketFileObj)
                                        if (!url) return
                                        handleDownload(
                                          url,
                                          "Student_Ticket.pdf"
                                        )
                                      }}
                                      className="bg-blue-500 rounded-lg"
                                    >
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </List.Item>
                            )}}
                          />
                        ) : (
                          <div className="text-gray-500">No ticket uploaded yet.</div>
                        )}
                      </div>

                      {/* Upload Section */}
                      <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">
                          Upload Your Ticket Document
                        </h4>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <Upload
                            accept=".pdf,.jpg,.jpeg,.png"
                            beforeUpload={handleTicketFileUpload}
                            showUploadList={false}
                          >
                            <Button
                              icon={<UploadOutlined />}
                              className="rounded-lg"
                              type="dashed"
                              size="large"
                              loading={uploading.ticket}
                            >
                              {uploading.ticket ? 'Uploading...' : 'Select Ticket Document'}
                            </Button>
                          </Upload>
                          <div className="text-gray-500 text-sm">
                            Accepted formats: PDF, JPG, PNG (Max 5MB)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tabs.TabPane>
          </Tabs>
        </Card>
      )}

      {/* Document Viewer Modal */}
      <Modal
        title="Document Viewer"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        width="90%"
        style={{ top: 50 }}
        destroyOnClose
      >
        {renderModalContent()}
      </Modal>
    </div>
  )
}
