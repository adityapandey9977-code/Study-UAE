

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import StudentService from "../../services/StudentService";
import { sdx } from "../../sdx";
import util from "../../utils/util";

import {
    Button,
    message,
    Modal,
    Menu,
    Dropdown,
    Tooltip,
    Tag,
    Select,
    Spin,
    Timeline
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {
    ExclamationCircleOutlined, MoreOutlined, WhatsAppOutlined, DownOutlined
} from '@ant-design/icons';
import FileService from '../../services/FileService';
import InstituteService from '../../services/InstituteService';
const { confirm } = Modal;

const ALLOWED_VISA_PAYMENT_STATUSES = ['acknowledged', 'approved'];

const normalizeVisaListResponse = (listRes) => {
    const raw = listRes?.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.files)) return raw.files;
    if (Array.isArray(raw?.result)) return raw.result;
    if (Array.isArray(raw)) return raw;
    return [];
};

export default function StuRow(props) {
    const spinIcon = <LoadingOutlined style={{ fontSize: 14, color: 'white' }} spin />;
    const { cref } = props;
    const [row, setRow] = useState({});
    const modules = util.getModules();
    const isInstitute = util.isInstitute() === 1;
    // const [loading, setLoading] = useState(false);
    // const [applied, setApplied] = useState([]);
    const [dtl, setDtl] = useState({});
    const [offerModalVisible, setOfferModalVisible] = useState(false);
    const [availableInstitutes, setAvailableInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState(null);
    const { Option } = Select;
    const [visaModalVisible, setVisaModalVisible] = useState(false);
    const [visaAvailableInstitutes, setVisaAvailableInstitutes] = useState([]);
    const [selectedVisaInstitute, setSelectedVisaInstitute] = useState(null);
    const [visaViewModalVisible, setVisaViewModalVisible] = useState(false);
    const [visaFiles, setVisaFiles] = useState([]);
    const [admissionModalVisible, setAdmissionModalVisible] = useState(false);
    const [admissionAvailableInstitutes, setAdmissionAvailableInstitutes] = useState([]);
    const [selectedAdmissionInstitute, setSelectedAdmissionInstitute] = useState(null);
    const [admissionViewModalVisible, setAdmissionViewModalVisible] = useState(false);
    const [admissionFiles, setAdmissionFiles] = useState([]);
    const [offerViewModalVisible, setOfferViewModalVisible] = useState(false);
    const [offerFiles, setOfferFiles] = useState([]);
    const [offerUploadLoading, setOfferUploadLoading] = useState(false);
    const [offerViewLoading, setOfferViewLoading] = useState(false);
    const [visaUploadLoading, setVisaUploadLoading] = useState(false);
    const [visaViewLoading, setVisaViewLoading] = useState(false);
    const [admissionUploadLoading, setAdmissionUploadLoading] = useState(false);
    const [admissionViewLoading, setAdmissionViewLoading] = useState(false);
    const [offerUploaded, setOfferUploaded] = useState(false);
    const [visaUploaded, setVisaUploaded] = useState(false);
    const [admissionUploaded, setAdmissionUploaded] = useState(false);
    const [hasAcceptedInstitutes, setHasAcceptedInstitutes] = useState(false);
    const [canAccessVisaActions, setCanAccessVisaActions] = useState(() => {
        const status = props.row?.payment_status;
        return status ? ALLOWED_VISA_PAYMENT_STATUSES.includes(String(status).trim().toLowerCase()) : false;
    });
    const [timelineModalVisible, setTimelineModalVisible] = useState(false);
    const [timelineData, setTimelineData] = useState(null)
    const [appStatus, setAppStatus] = useState("Loading...");
    const [statusTimeline, setStatusTimeline] = useState([]);
    const [documentsModalVisible, setDocumentsModalVisible] = useState(false);
    const [studentDocuments, setStudentDocuments] = useState([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);

    // ------------------------- OFFER UPLOAD MODAL -------------------------
    const openOfferLetterModal = async () => {
        if (offerUploadLoading) return;
        setOfferUploadLoading(true);
        try {
            const courses = await fetchAppliedCourses(row.id);
            const uniqueInstitutes = courses.filter(c => c.ins_status === 'Accepted')
                .filter((v, i, self) => i === self.findIndex(c => c.institute_id === v.institute_id));

            if (!uniqueInstitutes.length) {
                message.warning("No accepted institutes found for this student");
                return;
            }

            setAvailableInstitutes(uniqueInstitutes);
            setSelectedInstitute(null);
            setOfferModalVisible(true);
        } catch (e) {
            message.error("Failed to fetch institutes");
        } finally {
            setOfferUploadLoading(false);
        }
    };

    // ------------------------- VISA UPLOAD MODAL -------------------------
    const openVisaLetterModal = async () => {
        if (visaUploadLoading) return;
        if (!canAccessVisaActions) {
            message.warning("Visa actions will be available once payment is approved or acknowledged.");
            return;
        }
        setVisaUploadLoading(true);
        try {
            const courses = await fetchAppliedCourses(row.id);
            const uniqueVisaInstitutes = courses.filter(c => c.ins_status === 'Accepted')
                .filter((v, i, self) => i === self.findIndex(c => c.institute_id === v.institute_id));

            if (!uniqueVisaInstitutes.length) {
                message.warning("No accepted institutes found for this student");
                return;
            }

            setVisaAvailableInstitutes(uniqueVisaInstitutes);
            setSelectedVisaInstitute(null);
            setVisaModalVisible(true);
        } catch (e) {
            message.error("Failed to fetch institutes");
        } finally {
            setVisaUploadLoading(false);
        }
    };

    // ------------------------- OFFER VIEW MODAL -------------------------
    const openOfferViewModal = async () => {
        if (offerViewLoading) return;
        setOfferViewLoading(true);
        try {
            // Always fetch from applied courses API to get the most accurate data
            const courses = await fetchAppliedCourses(row.id);
            
            // Find the accepted course (student must have accepted an offer)
            const acceptedCourse = courses.find(c => c.stu_status === 'Accepted');
            
            if (!acceptedCourse) {
                message.warning("Student has not accepted any offer yet");
                setOfferViewModalVisible(false);
                return;
            }

            // Check if the accepted course has an offer letter
            if (!acceptedCourse.offer_file_url && !acceptedCourse.offer_letter_file_url && !acceptedCourse.offer_letter_file_id) {
                message.warning("No offer letter found for this student");
                setOfferViewModalVisible(false);
                return;
            }

            // Use the offer file URL from the accepted course
            const offerFileUrl = acceptedCourse.offer_file_url || acceptedCourse.offer_letter_file_url;

            // Show only the single accepted institute's offer letter
            const allFiles = [{
                institute: acceptedCourse,
                scf_id: acceptedCourse.scf_id, // Add scf_id for potential API calls
                file: { 
                    file_url: offerFileUrl
                }
            }];

            setOfferFiles(allFiles);
            setSelectedInstitute(acceptedCourse);
            setOfferViewModalVisible(true);
            setOfferUploaded(true);
        } catch (e) {
            console.error('Error fetching offer letter:', e);
            message.error("Failed to fetch offer letter");
        } finally {
            setOfferViewLoading(false);
        }
    };

    // ------------------------- VISA VIEW MODAL -------------------------
    const openVisaViewModal = async () => {
        if (visaViewLoading) return;
        setVisaViewLoading(true);
        try {
            // Use data from students API (already in row)
            if (!row.visa_letter_fileid) {
                message.warning("No visa letter found for this student");
                setVisaViewModalVisible(false);
                return;
            }

            // Get the accepted course details to show institute name
            const courses = await fetchAppliedCourses(row.id);
            const acceptedCourse = courses.find(c => c.stu_status === 'Accepted');
            
            if (!acceptedCourse) {
                message.warning("Student has not accepted any offer yet");
                setVisaViewModalVisible(false);
                return;
            }

            // Show only the single accepted institute's visa letter
            const allFiles = [{
                institute: acceptedCourse,
                scf_id: acceptedCourse.scf_id, // Add scf_id for API call
                file: {
                    file_url: row.visa_letter_fileid,
                    file_id: row.visa_letter_fileid,
                    file_name: 'visa_letter.pdf'
                }
            }];

            setVisaFiles(allFiles);
            setSelectedVisaInstitute(acceptedCourse);
            setVisaViewModalVisible(true);
            setVisaUploaded(true);
        } catch (e) {
            message.error("Failed to fetch visa letter");
        } finally {
            setVisaViewLoading(false);
        }
    };

    // ------------------------- ADMISSION UPLOAD MODAL -------------------------
    const openAdmissionLetterModal = async () => {
        if (admissionUploadLoading) return;
        if (!canAccessVisaActions) {
            message.warning("Admission letter actions will be available once payment is approved or acknowledged.");
            return;
        }
        setAdmissionUploadLoading(true);
        try {
            const courses = await fetchAppliedCourses(row.id);
            const uniqueAdmissionInstitutes = courses.filter(c => c.ins_status === 'Accepted')
                .filter((v, i, self) => i === self.findIndex(c => c.institute_id === v.institute_id));

            if (!uniqueAdmissionInstitutes.length) {
                message.warning("No accepted institutes found for this student");
                return;
            }

            setAdmissionAvailableInstitutes(uniqueAdmissionInstitutes);
            setSelectedAdmissionInstitute(null);
            setAdmissionModalVisible(true);
        } catch (e) {
            message.error("Failed to fetch institutes");
        } finally {
            setAdmissionUploadLoading(false);
        }
    };

    // ------------------------- ADMISSION VIEW MODAL -------------------------
    const openAdmissionViewModal = async () => {
        if (admissionViewLoading) return;
        setAdmissionViewLoading(true);
        try {
            // Use data from students API (already in row)
            if (!row.admission_letter || !row.admission_letter_fileid) {
                message.warning("No admission letter found for this student");
                setAdmissionViewModalVisible(false);
                return;
            }

            // Get the accepted course details to show institute name
            const courses = await fetchAppliedCourses(row.id);
            const acceptedCourse = courses.find(c => c.stu_status === 'Accepted');
            
            if (!acceptedCourse) {
                message.warning("Student has not accepted any offer yet");
                setAdmissionViewModalVisible(false);
                return;
            }

            // Show only the single accepted institute's admission letter
            const allFiles = [{
                institute: acceptedCourse,
                file: {
                    file_url: row.admission_letter_fileid,
                    file_id: row.admission_letter_fileid,
                    file_name: 'admission_letter.pdf'
                }
            }];

            setAdmissionFiles(allFiles);
            setSelectedAdmissionInstitute(acceptedCourse);
            setAdmissionViewModalVisible(true);
            setAdmissionUploaded(true);
        } catch (e) {
            message.error("Failed to fetch admission letter");
        } finally {
            setAdmissionViewLoading(false);
        }
    };

    // const downloadFile = async (fileUrl, fileName = 'file.pdf') => {
    //     if (!fileUrl) return;

    //     try {
    //         const response = await fetch(fileUrl, {
    //             method: 'GET',
    //             headers: {
    //                 // Add auth headers here if required
    //             },
    //         });
    //         const blob = await response.blob();
    //         const url = window.URL.createObjectURL(blob);
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.download = fileName;
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (err) {
    //         console.error('Download failed:', err);
    //         message.error('Failed to download file');
    //     }
    // };

    const fetchAppliedCourses = async (student_id) => {
        // setLoading(true);
        try {
            const { data } = await StudentService.appliedCourses({ student_id });
            const courses = data.result?.data || [];
            courses.forEach((v, i) => (v.key = i));
            const hasEligiblePayment = courses.some((course) =>
                ALLOWED_VISA_PAYMENT_STATUSES.includes(String(course.payment_status || '').trim().toLowerCase())
            );
            setCanAccessVisaActions(hasEligiblePayment);
            // setApplied(courses);
            return courses; // return so we can get scf_id
        } catch (e) {
            message.error(e.message || 'Failed to fetch applied courses');
            return [];
        } finally {
            // setLoading(false);
        }
    };

    const resolveClientId = async (student_id) => {
        // Try from current row or detail state
        const inlineId = (row && row.client_id) || (dtl && dtl.client_id);
        if (inlineId) return String(inlineId);
        // Try from student detail API
        try {
            const { data } = await StudentService.detail(student_id);
            const container = (data?.result || data?.data || data) || {};
            const found = container.client_id
                || container?.student?.client_id
                || container?.user?.client_id
                || container?.lead?.client_id
                || container?.profile?.client_id;
            if (found) return String(found);
        } catch (err) { }
        // Last resort
        return "1";
    };

    const uploadOfferLetter = async (e, student_id, institute_id) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!util.checkPdf(e.target, 5)) return;

        setOfferUploadLoading(true);
        const hideUploadingMsg = message.loading("Uploading offer letter...", 0);
        try {
            const resolvedClientId = await resolveClientId(student_id);
            const uploadRes = await FileService.upload(file, resolvedClientId);
            const file_id = uploadRes.data?.file_id;
            if (!file_id) throw new Error("File upload failed");

            // Resolve SCF for selected institute
            const courses = await fetchAppliedCourses(student_id);
            const matched = courses.find(
                c => String(c.institute_id) === String(institute_id) && c.ins_status === 'Accepted'
            );

            if (!matched) {
                message.error("Selected institute is invalid for this student");
                return;
            }

            if (matched.ins_status !== 'Accepted') {
                message.error("Institute status must be Accepted before uploading offer letter");
                return;
            }

            const res = await StudentService.setSCFUploadOfferLetter({
                scf_id: matched.scf_id,
                file_id,
                client_id: Number(resolvedClientId),
                student_id: Number(student_id),
                institute_id: Number(institute_id),
            });

            if (res.success) {
                message.success(res.message || "Offer letter uploaded successfully");
                setRow({ ...row, offerLetterFile: file, offer_letter_file_url: uploadRes.data.file_url });
                setOfferUploaded(true);

                // Refresh timeline data to update the offer letter status
                setTimeout(() => {
                    openTimelineModal();
                }, 100);
            } else {
                message.error(res.message || "Failed to upload offer letter");
            }

        } catch (err) {
            message.error(err.message || "Upload failed");
        } finally {
            e.target.value = '';
            if (typeof hideUploadingMsg === 'function') hideUploadingMsg();
            setOfferUploadLoading(false);
            setOfferModalVisible(false);
        }
    };

    const uploadVisaLetter = async (e, student_id, selectedInstitute) => {
        if (!selectedInstitute) {
            message.error("Please select an institute before uploading");
            e.target.value = '';
            return;
        }
        if (!canAccessVisaActions) {
            message.warning("Visa upload will be available once payment is approved or acknowledged.");
            e.target.value = '';
            return;
        }
        const file = e.target.files[0];
        if (!file) return;
        if (!util.checkPdf(e.target, 5)) return;

        const formData = new FormData();
        formData.append("visa_status", "1");
        formData.append("user_id", String(row.user_id));
        formData.append("student_id", String(student_id));
        formData.append("ins_id", selectedVisaInstitute.institute_id);
        formData.append("visa_file", file);

        setVisaUploadLoading(true);
        const hideVisaUploadingMsg = message.loading("Uploading visa letter...", 0);
        try {
            const res = await InstituteService.uploadVisaLetter(formData);
            if (res.data.success === "ok") {
                message.success("Visa letter uploaded successfully");
                setRow({ ...row, visaLetterFile: file, visa_letter_file_url: res.data?.file_url });
                // setVisaUploaded(true);
                setRow(prev => ({
                    ...prev,
                    visa_letter_file_url: res.data?.file_url,
                }));
                setVisaUploaded(true);

                // Refresh timeline data to update the visa status
                setTimeout(async () => {
                    try {
                        // Force refresh timeline data even if modal is not visible
                        const courses = await fetchAppliedCourses(row.id);
                        const accepted = courses.filter((c) => c.ins_status === 'Accepted');
                        let latestVisa = null;

                        for (const inst of accepted) {
                            try {
                                const listRes = await InstituteService.listAllVisa(inst.institute_id);
                                const list = normalizeVisaListResponse(listRes);
                                const files = list.filter((f) => String(f?.student_id) === String(row.id)) || [];
                                if (files.length) {
                                    const localLatest = files.sort((a, b) => b.id - a.id)[0];
                                    if (!latestVisa || localLatest.id > latestVisa.id) {
                                        latestVisa = localLatest;
                                    }
                                }
                            } catch (e) { }
                        }

                        if (latestVisa) {
                            const visaStatusValue = latestVisa.visastatus || latestVisa.visa_status || latestVisa.status || '0';

                            // Update the row's visa status directly
                            setRow(prev => ({
                                ...prev,
                                visa_status: visaStatusValue === '1' || visaStatusValue === 1 ? 'Uploaded' : visaStatusValue
                            }));
                        }

                        // If timeline modal is open, refresh it
                        if (timelineModalVisible) {
                            openTimelineModal();
                        }
                    } catch (err) {
                        // Error refreshing visa status
                    }
                }, 500);
            } else {
                message.error(res.data.message || "Failed to upload visa letter");
            }
        } catch (err) {
            message.error(err.message || "Upload failed");
        } finally {
            e.target.value = '';
            if (typeof hideVisaUploadingMsg === 'function') hideVisaUploadingMsg();
            setVisaUploadLoading(false);
            setVisaModalVisible(false);
        }
    };

    const uploadAdmissionLetter = async (e, student_id, selectedInstitute) => {
        if (!selectedInstitute) {
            message.error("Please select an institute before uploading");
            e.target.value = '';
            return;
        }
        if (!canAccessVisaActions) {
            message.warning("Admission letter upload will be available once payment is approved or acknowledged.");
            e.target.value = '';
            return;
        }
        const file = e.target.files[0];
        if (!file) return;
        if (!util.checkPdf(e.target, 5)) return;

        setAdmissionUploadLoading(true);
        const hideAdmissionUploadingMsg = message.loading("Uploading admission letter...", 0);
        try {
            const resolvedClientId = await resolveClientId(student_id);
            const uploadRes = await FileService.upload(file, resolvedClientId);
            const file_id = uploadRes.data?.file_id;
            if (!file_id) throw new Error("File upload failed");

            // Resolve SCF for selected institute
            const courses = await fetchAppliedCourses(student_id);
            const matched = courses.find(
                c => String(c.institute_id) === String(selectedAdmissionInstitute.institute_id) && c.ins_status === 'Accepted'
            );

            if (!matched) {
                message.error("Selected institute is invalid for this student");
                return;
            }

            if (matched.ins_status !== 'Accepted') {
                message.error("Institute status must be Accepted before uploading admission letter");
                return;
            }

            const res = await StudentService.setSCFUploadAdmissionLetter({
                scf_id: matched.scf_id,
                file_id,
                client_id: Number(resolvedClientId),
                student_id: Number(student_id),
                institute_id: Number(selectedAdmissionInstitute.institute_id),
            });

            if (res.success) {
                message.success(res.message || "Admission letter uploaded successfully");
                setRow(prev => ({
                    ...prev,
                    admission_letter_file_url: uploadRes.data.file_url,
                }));
                setAdmissionUploaded(true);

                // Refresh timeline data
                setTimeout(() => {
                    if (timelineModalVisible) {
                        openTimelineModal();
                    }
                }, 100);
            } else {
                message.error(res.message || "Failed to upload admission letter");
            }

        } catch (err) {
            message.error(err.message || "Upload failed");
        } finally {
            e.target.value = '';
            if (typeof hideAdmissionUploadingMsg === 'function') hideAdmissionUploadingMsg();
            setAdmissionUploadLoading(false);
            setAdmissionModalVisible(false);
        }
    };

    const deleteRecord = () => {
        message.destroy();
        confirm({
            title: 'Are you sure to delete this student?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                StudentService.delete(row.id).then(({ data }) => {
                    message.success(data.message || 'Deleted');
                    setRow({ ...row, deleted: true });
                }).catch(e => {
                    message.error(e.message);
                }).finally(() => {
                    util.hideLoader();
                });
            },
            onCancel() {
            },
        });
    }

    const verifyAllDocs = async () => {
        if (documentsLoading) return;

        setDocumentsLoading(true);
        try {
            // Fetch student documents
            const { data } = await StudentService.detail(row.id);
            const studentDetail = data?.result || {};

            // Check if student has uploaded any documents
            if (!studentDetail.doc_uploaded_on) {
                message.warning('Documents not uploaded');
                return;
            }

            let documents = [];

            // Extract documents from edu_details
            if (studentDetail.edu_details && Array.isArray(studentDetail.edu_details)) {
                studentDetail.edu_details.forEach((edu, index) => {
                    if (edu.result_status === 'Declared' && edu.file_url) {
                        documents.push({
                            id: `edu_${edu.id}`,
                            name: edu.name || `Educational Document ${index + 1}`,
                            file_url: edu.file_url,
                            uploaded_on: studentDetail.edu_info_date || studentDetail.created,
                            verified: false, // Individual documents start as unverified
                            verified_on: null,
                            type: 'education'
                        });
                    }
                });
            }

            // Extract documents from background_details
            if (studentDetail.background_details) {
                const bg = studentDetail.background_details;

                // ID Photo Front
                if (bg.idphoto_front_file_url) {
                    documents.push({
                        id: `bg_idphoto_front_${bg.idphoto_front_file_id}`,
                        name: 'ID Photo (Front)',
                        file_url: bg.idphoto_front_file_url,
                        uploaded_on: studentDetail.background_info_date || studentDetail.created,
                        verified: false, // Individual documents start as unverified
                        verified_on: null,
                        type: 'background'
                    });
                }

                // ID Photo Back
                if (bg.idphoto_back_file_url) {
                    documents.push({
                        id: `bg_idphoto_back_${bg.idphoto_back_file_id}`,
                        name: 'ID Photo (Back)',
                        file_url: bg.idphoto_back_file_url,
                        uploaded_on: studentDetail.background_info_date || studentDetail.created,
                        verified: false, // Individual documents start as unverified
                        verified_on: null,
                        type: 'background'
                    });
                }
            }

            // If the student's documents are already verified globally, mark all as verified
            if (studentDetail.doc_verified_on) {
                documents = documents.map(doc => ({
                    ...doc,
                    verified: true,
                    verified_on: studentDetail.doc_verified_on
                }));
            }

            if (!documents || documents.length === 0) {
                message.info('No documents found for this student. The student may not have uploaded any documents yet.');
                return;
            }

            setStudentDocuments(documents);
            setDocumentsModalVisible(true);

        } catch (error) {
            message.error('Failed to fetch student documents');
        } finally {
            setDocumentsLoading(false);
        }
    };

    // Utility function to normalize file URLs (use PHP backend where files are stored)
    const getNodeFileUrl = (fileUrl) => {
        // Handle null, undefined, empty string, or '#'
        if (!fileUrl || fileUrl === '#' || fileUrl === null || fileUrl === '') {
            return fileUrl;
        }

        // Convert to string if it's a number (file ID)
        const fileUrlStr = String(fileUrl);

        // Use PHP backend for file URLs since that's where uploads are stored
        return util.normalizeUploadsUrl(fileUrlStr, 'php');
    };

    // Utility function specifically for visa and admission letters (use Node backend)
    const getLetterFileUrl = (fileUrl) => {
        // Handle null, undefined, empty string, or '#'
        if (!fileUrl || fileUrl === '#' || fileUrl === null || fileUrl === '') {
            return fileUrl;
        }

        // Convert to string if it's a number (file ID)
        const fileUrlStr = String(fileUrl);

        // Use Node backend for visa and admission letters since they're generated by Node
        return util.normalizeUploadsUrl(fileUrlStr, 'node');
    };

    const handleVerifyDocument = async (documentId) => {
        try {
            util.showLoader();

            // Check if already verified
            const currentDoc = studentDocuments.find(doc => doc.id === documentId);
            if (currentDoc && currentDoc.verified) {
                message.warning('This document is already verified');
                return;
            }

            // Call the actual verification API
            const response = await StudentService.verifyDoc(row.id);

            if (response?.data?.code === 200 || response?.data?.success || response?.success) {
                message.success('Document verified successfully');

                // Update the documents list - mark all as verified since the API verifies all documents
                setStudentDocuments(prev =>
                    prev.map(doc => ({
                        ...doc,
                        verified: true,
                        verified_on: new Date().toISOString()
                    }))
                );

                // Update the row data to reflect verification
                setRow(prev => ({
                    ...prev,
                    doc_verified_on: new Date().toISOString()
                }));

                // Update parent component if needed
                if (cref.current.updateRow) {
                    cref.current.updateRow({ doc_verified_on: new Date().toISOString() });
                }

            } else {
                const errorMessage = response?.data?.message || 'Failed to verify document';
                if (errorMessage.includes('already verified')) {
                    message.warning('Document has already been verified');
                    // Update local state to reflect that it's already verified
                    setStudentDocuments(prev =>
                        prev.map(doc => ({
                            ...doc,
                            verified: true,
                            verified_on: row.doc_verified_on || new Date().toISOString()
                        }))
                    );
                } else {
                    message.error(errorMessage);
                }
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to verify document';
            if (errorMessage.includes('already verified')) {
                message.warning('Document has already been verified');
                // Update local state to reflect that it's already verified
                setStudentDocuments(prev =>
                    prev.map(doc => ({
                        ...doc,
                        verified: true,
                        verified_on: row.doc_verified_on || new Date().toISOString()
                    }))
                );
            } else {
                message.error(errorMessage);
            }
        } finally {
            util.hideLoader();
        }
    };

    const handleVerifyAllDocuments = async () => {
        try {
            util.showLoader();

            // Check if all documents are already verified
            const allVerified = studentDocuments.every(doc => doc.verified);
            if (allVerified) {
                message.warning('All documents are already verified');
                return;
            }

            // Call the actual verification API for all documents
            const response = await StudentService.verifyDoc(row.id);

            if (response?.data?.code === 200 || response?.data?.success || response?.success) {
                message.success('All documents verified successfully');

                // Update all documents as verified
                setStudentDocuments(prev =>
                    prev.map(doc => ({
                        ...doc,
                        verified: true,
                        verified_on: new Date().toISOString()
                    }))
                );

                // Update the row data
                setRow(prev => ({
                    ...prev,
                    doc_verified_on: new Date().toISOString()
                }));

                // Update parent component
                if (cref.current.updateRow) {
                    cref.current.updateRow({ doc_verified_on: new Date().toISOString() });
                }

                // Close the modal after a short delay
                setTimeout(() => {
                    setDocumentsModalVisible(false);
                }, 1000);

            } else {
                const errorMessage = response?.data?.message || 'Failed to verify documents';
                if (errorMessage.includes('already verified')) {
                    message.warning('Documents have already been verified');
                    // Update local state to reflect that they're already verified
                    setStudentDocuments(prev =>
                        prev.map(doc => ({
                            ...doc,
                            verified: true,
                            verified_on: row.doc_verified_on || new Date().toISOString()
                        }))
                    );
                } else {
                    message.error(errorMessage);
                }
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to verify documents';
            if (errorMessage.includes('already verified')) {
                message.warning('Documents have already been verified');
                // Update local state to reflect that they're already verified
                setStudentDocuments(prev =>
                    prev.map(doc => ({
                        ...doc,
                        verified: true,
                        verified_on: row.doc_verified_on || new Date().toISOString()
                    }))
                );
            } else {
                message.error(errorMessage);
            }
        } finally {
            util.hideLoader();
        }
    };

    const sendPassword = () => {
        message.destroy();
        confirm({
            title: 'Are you sure to send new password?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                StudentService.sendPassword(row.id).then(({ data }) => {
                    message.success(data.message || 'Sent');
                }).catch(e => {
                    message.error(e.message);
                }).finally(() => {
                    util.hideLoader();
                });
            },
            onCancel() {
            },
        });
    }

    const markDead = (yesNo) => {
        message.destroy();
        confirm({
            title: `Are you sure to ${yesNo === 'Y' ? 'Mark Dead' : 'Mark Not Dead'}?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                StudentService.markDead(yesNo, row.id).then(({ data }) => {
                    message.success(data.message || 'Updated');
                    cref.current.updateRow(data.rowDtl);
                }).catch(e => {
                    message.error(e.message);
                }).finally(() => {
                    util.hideLoader();
                });
            },
            onCancel() {
            },
        });
    }

    const initRefFunctions = () => {
        cref.current = {
            ...cref.current,
            // updateRow: (obj) => {
            //     setRow({ ...row, ...obj });
            // },
            updateRow: (obj) => {
                setRow(prev => ({ ...prev, ...obj })); // <-- merge properly
            },
            increaseSentEmail: () => {
                setRow((prev) => {
                    const current = Number(prev?.sent_email_count ?? prev?.email_count ?? 0) || 0;
                    const next = current + 1;
                    return { ...prev, sent_email_count: next, email_count: next };
                });
            },
            increaseSentWhatsapp: () => {
                setRow((prev) => {
                    const current = Number(prev?.sent_whatsapp_count ?? prev?.whatsapp_count ?? 0) || 0;
                    const next = current + 1;
                    return { ...prev, sent_whatsapp_count: next, whatsapp_count: next };
                });
            },
            increaseFollowup: (next_followup_date) => {
                setRow((prev) => {
                    const current = Number(prev?.followup_count ?? 0) || 0;
                    return { ...prev, followup_count: current + 1, next_followup_date };
                });
            }
        }
    }

    const openAutoLoginUrl = (copyOnly = false) => {
        let auto_login_url = util.getStudentAutoLoginUrl(row.email);
        if (copyOnly) {
            util.copyToClipboard(auto_login_url, true);
        } else {
            window.open(auto_login_url, "blank");
        }
    }

    // const getApplicationStatus = async (s) => {
    //   try {
    //     const { data } = await StudentService.detail(s.id);
    //     const d = data?.result || {};

    //     // Step-by-step order — one active stage at a time
    //     if (!d.basic_info_date) return "SIS Registration";
    //     if (!d.edu_info_date) return "Basic Information";
    //     if (!d.background_info_date) return "Educational Information";
    //     if (!d.doc_verified_on) return "Background Information";
    //     if (!d.course_choice_date) return "Document Verified";
    //     return "Choice Filling";
    //   } catch (err) {
    //     console.error("Error fetching status:", err);
    //     return "Not Started";
    //   }
    // };
    // REMOVED: This was causing performance issues by calling studentDetail API for every row
    // const getApplicationStatus = async (s) => {
    //     try {
    //         const { data } = await StudentService.detail(s.id);
    //         const d = data?.result || {};
    //         if (!d.basic_info_date) return "SIS Registration";
    //         if (!d.edu_info_date) return "Basic Information";
    //         if (!d.background_info_date) return "Educational Information";
    //         if (!d.course_choice_date) return "Background Information";
    //         return "Choice Filling";
    //     } catch (err) {
    //         console.error("Error fetching status:", err);
    //         return "Not Started";
    //     }
    // };

    // NEW: Calculate status from row data (already available from list API)
    const getApplicationStatus = (s) => {
        // Use data already available from the list API response
        if (!s.basic_info_completed) return "SIS Registration";
        if (!s.edu_info_completed) return "Basic Information";
        if (!s.background_info_completed) return "Educational Information";
        if (!s.course_choice_date) return "Background Information";
        return "Choice Filling";
    };

    // REMOVED: This useEffect was making 2 API calls per row (performance killer!)
    // useEffect(() => {
    //     const fetchStatusAndTimeline = async () => {
    //         const status = await getApplicationStatus(row);
    //         setAppStatus(status);
    //         const { data } = await StudentService.detail(row.id);
    //         const d = data?.result || {};
    //         const steps = [
    //             { key: 'reg', title: 'SIS Registration', date: d.created },
    //             { key: 'basic', title: 'Basic Information', date: d.basic_info_date },
    //             { key: 'edu', title: 'Educational Information', date: d.edu_info_date },
    //             { key: 'bg', title: 'Background Information', date: d.background_info_date },
    //             { key: 'choice', title: 'Choice Filling', date: d.course_choice_date },
    //         ].filter(step => step.date);
    //         setStatusTimeline(steps);
    //     };
    //     if (row.id) fetchStatusAndTimeline();
    // }, [row.id]);

    // NEW: Calculate status and timeline from row data (no API calls needed)
    useEffect(() => {
        if (row.id) {
            // Calculate status from existing row data
            const status = getApplicationStatus(row);
            setAppStatus(status);
            
            // Build timeline from existing row data
            const steps = [
                { key: 'reg', title: 'SIS Registration', date: row.created },
                { key: 'basic', title: 'Basic Information', date: row.basic_info_completed },
                { key: 'edu', title: 'Educational Information', date: row.edu_info_completed },
                { key: 'bg', title: 'Background Information', date: row.background_info_completed },
                { key: 'choice', title: 'Choice Filling', date: row.course_choice_date },
            ].filter(step => step.date); // Only keep steps with a date
            
            setStatusTimeline(steps);
        }
    }, [row.id, row.basic_info_completed, row.edu_info_completed, row.background_info_completed, row.course_choice_date]);

    const openTimelineModal = async () => {
        try {
            util.showLoader();

            // Base detail
            const { data } = await StudentService.detail(row.id);
            const detail = data?.result || {};

            // Defaults for extra timeline info
            let paymentStatus = 'Pending';
            let offerUploaded = false;
            let visaStatusText = 'Pending';

            try {
                // Reuse appliedCourses helper to derive payment / offer / visa info
                const courses = await fetchAppliedCourses(row.id);

                const accepted = courses.filter((c) => c.ins_status === 'Accepted');

                // Payment status: mirror logic from StudentDash
                const paymentProofs = courses.filter((row) => row.payment_slip_file_url);
                const acceptedCourse = courses.find((row) => row.stu_status === 'Accepted');
                const paymentSummary = paymentProofs[0] || acceptedCourse || null;
                paymentStatus = paymentSummary?.payment_status || 'Pending';

                // Offer uploaded: any course with offer_file_url
                offerUploaded = courses.some((c) => !!(c.offer_file_url || c.offer_letter_file_url || c.offer_letter_file_id));

                // Prefer Node letters API for visa status because studentDetail/appliedCourses may not include letters.
                let scfIdCandidate = (
                    acceptedCourse?.scf_id
                    || paymentSummary?.scf_id
                    || accepted?.[0]?.scf_id
                    || courses?.[0]?.scf_id
                );

                if (!scfIdCandidate) {
                    try {
                        const eligibleRes = await InstituteService.getEligibleStudents();
                        const eligible = eligibleRes?.data?.data;
                        const match = Array.isArray(eligible)
                            ? eligible.find((s) => String(s?.student_id) === String(row.id))
                            : null;
                        if (match?.scf_id) scfIdCandidate = match.scf_id;
                    } catch (e) { }
                }

                let letters = null;
                if (scfIdCandidate) {
                    try {
                        const lettersRes = await InstituteService.getLetterDetails(scfIdCandidate);
                        const detailNode = lettersRes?.data?.data || lettersRes?.data?.result || null;
                        letters = detailNode?.letters || null;
                    } catch (e) { }
                }

                const hasInstituteVisaLetter = !!(
                    letters?.visa_letter
                    || letters?.visa_letter_fileid
                    || accepted.some((c) => !!(c.visa_letter_file_url || c.visa_letter_file_id))
                );

                const studentVisaStatusRaw = letters?.student_visa_status;
                if (studentVisaStatusRaw !== undefined && studentVisaStatusRaw !== null && String(studentVisaStatusRaw) !== '') {
                    const v = String(studentVisaStatusRaw).trim();
                    if (v === '1') {
                        visaStatusText = 'Accepted';
                    } else if (v === '2') {
                        visaStatusText = 'Rejected';
                    } else if (v === '0') {
                        visaStatusText = 'Pending';
                    } else {
                        visaStatusText = hasInstituteVisaLetter ? 'Uploaded' : 'Pending';
                    }
                } else if (letters?.student_visa_fileid || letters?.student_visa_file_id) {
                    visaStatusText = 'Uploaded';
                } else if (hasInstituteVisaLetter) {
                    visaStatusText = 'Uploaded';
                } else {
                    // Fallback: latest visa record across accepted institutes (legacy PHP listAllVisa)
                    let latestVisa = null;
                    for (const inst of accepted) {
                        try {
                            const listRes = await InstituteService.listAllVisa(inst.institute_id);
                            const list = normalizeVisaListResponse(listRes);
                            const files = list.filter((f) => String(f?.student_id) === String(row.id)) || [];
                            if (files.length) {
                                const localLatest = files.sort((a, b) => b.id - a.id)[0];
                                if (!latestVisa || localLatest.id > latestVisa.id) {
                                    latestVisa = localLatest;
                                }
                            }
                        } catch (e) { }
                    }

                    if (latestVisa) {
                        const visaStatusValueRaw = latestVisa.visastatus || latestVisa.visa_status || latestVisa.status || '0';
                        const visaStatusValue = String(visaStatusValueRaw).trim().toLowerCase();
                        const hasVisaFile = !!(latestVisa.file_url || latestVisa.visafieldnew || latestVisa.file_name);

                        if (visaStatusValue === '1') {
                            visaStatusText = 'Accepted';
                        } else if (visaStatusValue === '2') {
                            visaStatusText = 'Rejected';
                        } else if (visaStatusValue === 'approved') {
                            visaStatusText = 'Approved';
                        } else if (visaStatusValue === 'acknowledged') {
                            visaStatusText = 'Acknowledged';
                        } else {
                            visaStatusText = hasVisaFile ? 'Uploaded' : 'Pending';
                        }
                    }
                }
            } catch (innerErr) { }

            setTimelineData({
                ...detail,
                payment_timeline_status: paymentStatus,
                offer_timeline_uploaded: offerUploaded,
                visa_timeline_status: visaStatusText,
            });
            setTimelineModalVisible(true);
        } catch (err) {
            message.error("Failed to fetch timeline data");
        } finally {
            util.hideLoader();
        }
    };

    // useEffect(() => {
    //     setRow({ ...props.row });
    //     setDtl({ ...props.row });
    //     // Set institute context for headers if available on the row
    //     try {
    //         const rid = props?.row?.institute_id;
    //         if (rid) {
    //             sdx.setData({ institute_id: Number(rid) });
    //         }
    //     } catch (e) { }
    //     // Proactively detect if offer/visa already uploaded
    //     const detectUploads = async () => {
    //         try {
    //             const courses = await fetchAppliedCourses(props.row.id);
    //             const accepted = courses.filter(c => c.ins_status === 'Accepted');
    //             const hasOffer = accepted.some(inst => !!inst.offer_file_url);
    //             setOfferUploaded(hasOffer);

    //             // Visa: check per institute
    //             let hasVisa = false;
    //             for (let inst of accepted) {
    //                 try {
    //                     const listRes = await InstituteService.listAllVisa(inst.institute_id);
    //                     const files = listRes?.data?.data?.filter(f => f.student_id === props.row.id) || [];
    //                     if (files.length) { hasVisa = true; break; }
    //                 } catch (err) { }
    //             }
    //             setVisaUploaded(hasVisa);
    //         } catch (err) { }
    //     };
    //     if (props?.row?.id) detectUploads();
    // }, [props.row]);

    useEffect(() => {
        if (props.row) {
            const normalizedRow = { ...props.row };
            if (normalizedRow.sent_email_count === undefined || normalizedRow.sent_email_count === null) {
                normalizedRow.sent_email_count = Number(normalizedRow.email_count ?? 0) || 0;
            }
            if (normalizedRow.sent_whatsapp_count === undefined || normalizedRow.sent_whatsapp_count === null) {
                normalizedRow.sent_whatsapp_count = Number(normalizedRow.whatsapp_count ?? 0) || 0;
            }

            setRow(normalizedRow);
            setDtl(normalizedRow);
            const normalized = String(normalizedRow.payment_status || '').trim().toLowerCase();
            if (normalized) {
                setCanAccessVisaActions(ALLOWED_VISA_PAYMENT_STATUSES.includes(normalized));
            }

            // NEW: Set hasAcceptedInstitutes based on data from student_letters table
            // The backend now joins student_letters and student_choice_fillings tables
            // to provide these fields directly in the list API response
            
            const hasLetterData = !!(
                normalizedRow.offer_letter_file_id || 
                normalizedRow.admission_letter_fileid || 
                normalizedRow.visa_letter_fileid ||
                normalizedRow.admission_letter ||
                normalizedRow.visa_letter
            );
            
            // For super admin panel, always show buttons if student has completed choice filling
            // This allows uploading letters even if none exist yet
            const hasCompletedChoiceFilling = !!(normalizedRow.course_choice_date);
            
            setHasAcceptedInstitutes(hasLetterData || hasCompletedChoiceFilling);
        }
        // Set institute context for headers if available on the row
        try {
            const rid = props?.row?.institute_id;
            if (rid) {
                sdx.setData({ institute_id: Number(rid) });
            }
        } catch (e) { }

        // REMOVED: This was causing performance issues by calling appliedCourses API for every row
        // The detectUploads function will now be called lazily when user clicks on upload/view buttons
        // This prevents 100+ API calls on page load
        
        // OLD CODE (REMOVED):
        // const detectUploads = async () => {
        //     try {
        //         const courses = await fetchAppliedCourses(props.row.id);
        //         const accepted = courses.filter(c => c.ins_status === 'Accepted');
        //         setHasAcceptedInstitutes(accepted.length > 0);
        //         const hasOffer = accepted.some(inst => !!inst.offer_file_url);
        //         setOfferUploaded(hasOffer);
        //         // ... more checks
        //     } catch (err) { }
        // };
        // if (props?.row?.id) detectUploads();
    }, [props.row]);

    return (
        <>
            {row.deleted !== true && <>
                <tr className="trgap-top-8">
                    <td rowSpan="2">
                        {row.rowno}.
                    </td>
                    <td>
                        <div className="uc bold600">{row.name}</div>
                        <div className="font-green-meadow1 font-purple bold600 pb3 fs13">Reg No: {row.regno}</div>
                        <div className="note-text pt3">
                            <div className="pb1">
                                {row.email}
                                {row.email_verified === 1 ? (
                                    <span className="font-green-jungle fs10 pl4"><i className="fa fa-check-circle"></i> Verified</span>
                                ) : (
                                    <span className="font-red fs10 pl4">Not Verified</span>
                                )}
                            </div>
                            <div>
                                <i className="fa fa-mobile mr4"></i>
                                {row.isd_code}-{row.mobile}
                                {Number(row.mobile_verified) === 1 ? (
                                    <span className="font-green-jungle fs10 pl4"><i className="fa fa-check-circle"></i> Verified</span>
                                ) : (
                                    <span className="font-red fs10 pl4">Not Verified</span>
                                )}
                            </div>

                            <div className="pt8">
                                <div className="d-flex">
                                    <div className="w100">Gender</div>
                                    <div className="pl5 bold600">: {row.gender || 'N/A'}</div>
                                </div>
                                <div className="d-flex">
                                    <div className="w100">DOB</div>
                                    <div className="pl5 bold600">: {row.dob ? util.getDate(row.dob) : 'N/A'}</div>
                                </div>
                                {!isInstitute &&
                                    <div className="d-flex">
                                        <div className="w100">Assigned To</div>
                                        <div className="pl5 bold600">: {row.assigned_to_name || 'N/A'}</div>
                                    </div>
                                }
                                {!isInstitute &&
                                    <div className="d-flex">
                                        <div className="w100">Assign By</div>
                                        <div className="pl5 bold600">: {row.assigned_to ? (Number(row.automation_id) > 0 ? 'Automation' : 'Manual') : 'N/A'}</div>
                                    </div>
                                }
                                <div className="d-flex">
                                    <div className="w100">Next Followup</div>
                                    <div className="pl5 bold600">: {row.next_followup_date ? util.getDate(row.next_followup_date) : 'N/A'}</div>
                                </div>
                                <div className="d-flex">
                                    <div className="w100">UTM</div>
                                    <div className="pl5 bold600">: {row.utm?.utm_source || 'N/A'}</div>
                                </div>
                                {!!row.agent && !isInstitute &&
                                    <div className="d-flex">
                                        <div className="w100">Agent</div>
                                        <div className="pl5 bold600">: {row.agent} ({row.agent_code})</div>
                                    </div>
                                }
                            </div>
                            {row.dead_on &&
                                <div className="pt6">
                                    <Tag color="red">This lead is marked as DEAD on {util.getDate(row.dead_on)}</Tag>
                                </div>
                            }
                        </div>

                        <div className="note-text pt3">
                            <div className="d-flex">
                                <div className="w100">Last Location</div>
                                <div className="pl5 bold600">:&nbsp;
                                    <span>
                                        {row.ipdata === null ? (
                                            <span>N/A</span>
                                        ) : (
                                            <span>
                                                IP: {row.ipdata?.ip} | City: {row.ipdata?.city} | Region: {row.ipdata?.region} | Country: {row.ipdata?.country_name}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </td>

                    <td>
                        <div className="mb8">
                            <div className="note-text">Country:</div>
                            <div>{row.country}</div>
                        </div>

                        <div className="note-text uc mb5">Resident</div>
                        <div className="mb8">
                            <div className="note-text">State:</div>
                            <div>{row.resident_state || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="note-text">City:</div>
                            <div>{row.resident_city || 'N/A'}</div>
                        </div>
                    </td>

                    <td>
                        <div>{row.acad_career}</div>
                        <div>({row.discipline})</div>
                    </td>

                    <td className="nowrap">
                        <span className="fs11">{util.getDate(row.created, 'DD MMM YYYY @ hh:mm A')}</span>
                        {row.course_choice_date &&
                            <div className='pt10'>
                                <span className="font-green-jungle cpointer" onClick={() => cref.current.openAppliedCourses({ ...row })}><i className="fa fa-check-circle"></i> Choice Filled</span>
                            </div>
                        }
                    </td>

                    <td>

                        {statusTimeline.length > 0 && (

                            <div className="timeline-container" style={{ paddingLeft: '8px' }}>

                                {statusTimeline.map((step, index) => {

                                    const isLast = index === statusTimeline.length - 1;

                                    return (

                                        <div key={step.key} className="timeline-item" style={{ position: 'relative', paddingLeft: '20px', marginBottom: isLast ? '0' : '8px' }}>

                                            <div style={{
                                                position: 'absolute', left: 0, top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#4CAF50', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', zIndex: 1

                                            }}>

                                                ✓

                                            </div>

                                            {!isLast && (

                                                <div style={{

                                                    position: 'absolute',

                                                    left: '7px',

                                                    top: '18px',

                                                    bottom: '-8px',

                                                    width: '2px',

                                                    backgroundColor: '#E0E0E0',

                                                    zIndex: 0

                                                }}></div>

                                            )}

                                            <div className="fs11" style={{ lineHeight: '1.3' }}>

                                                <div style={{ fontWeight: 500 }}>{step.title}</div>

                                                <div className="fs10 text-muted">{util.getDate(step.date)}</div>

                                            </div>

                                        </div>

                                    );

                                })}

                            </div>

                        )}

                    </td>

                    {!isInstitute &&
                        <td className="text-center">
                            <Dropdown
                                placement="bottomRight"
                                arrow
                                trigger={['click']}
                                overlay={
                                    <Menu>
                                        {modules['edit_students'] === 1 &&
                                            <Menu.Item
                                                key="0"
                                                onClick={() => {
                                                    initRefFunctions();
                                                    cref.current.openStuForm(row.id);
                                                }}>
                                                <span>Edit</span>
                                            </Menu.Item>}

                                        {modules['delete_students'] === 1 &&
                                            <Menu.Item key="1" onClick={() => deleteRecord()}>
                                                <span>Delete</span>
                                            </Menu.Item>}
                                    </Menu>
                                }
                            >
                                <Tooltip title="Actions">
                                    <span className="cpointer fs18" onClick={e => e.preventDefault()} style={{ lineHeight: '18px' }}>
                                        <MoreOutlined />
                                    </span>
                                </Tooltip>
                            </Dropdown>
                        </td>
                    }
                </tr>
                <tr className="tr-shadow">
                    <td colSpan="5">
                        <div className="flex gap-1 pb-1" style={{ flexWrap: 'wrap' }}>
                            <div>
                                <Button size="small" style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }} onClick={() => {
                                    initRefFunctions();
                                    cref.current.openStuForm(row.id);
                                }}>View Detail</Button>
                            </div>

                            <div>
                                <Button
                                    size="small"
                                    style={{
                                        background: '#ecfdf5',
                                        color: '#059669',
                                        border: '1px solid #a7f3d0',
                                        fontWeight: 600,
                                        borderRadius: 6,
                                        fontSize: 12,
                                        padding: '0 10px',
                                        height: 28,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}
                                    onClick={() => {
                                        initRefFunctions();
                                        cref.current.openConversations({
                                            id: row.id,
                                            user_id: row.user_id,
                                            name: row.name,
                                            regno: row.regno,
                                            email: row.email,
                                            mobile: row.mobile,
                                            assigned_to: row.assigned_to,
                                            assigned_to_name: row.assigned_to_name
                                        });
                                    }}
                                >
                                    <i className="fa fa-comments mr4" style={{ fontSize: 13, color: '#059669' }}></i> View Conversations
                                </Button>
                            </div>

                            <div>
                                <Button size="small" onClick={openTimelineModal} style={{ background: '#f3e8ff', color: '#7c3aed', border: '1px solid #ddd6fe', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}>
                                    <i className="fa fa-clock-o mr4"></i> View Timeline
                                </Button>
                            </div>


                            {(modules['followups'] === 1 || isInstitute) &&
                                <div>
                                    <Button
                                        size="small"
                                        style={{ background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}
                                        onClick={() => {
                                            initRefFunctions();
                                            cref.current.openFollowup({ id: row.id, name: row.name, email: row.email, regno: row.regno, next_followup_date: row.next_followup_date });
                                        }}>
                                        Follow-Up <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, marginLeft: 4 }}>{row.followup_count}</span>
                                    </Button>
                                </div>
                            }

                            {(modules['send_email'] === 1 || isInstitute) &&
                                <>
                                    <Button
                                        size="small"
                                        style={{ background: '#fef9c3', color: '#a16207', border: '1px solid #fde68a', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}
                                        onClick={() => {
                                            initRefFunctions();
                                            cref.current.openSendEmail({ id: row.id, name: row.name, email: row.email, regno: row.regno });
                                        }}>
                                        <i className="fa fa-envelope mr4"></i> Email <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, marginLeft: 4 }}>{row.sent_email_count}</span>
                                    </Button>
                                    <Button
                                        size="small"
                                        style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}
                                        onClick={() => {
                                            initRefFunctions();
                                            cref.current.openSendWhatsapp({ id: row.id, name: row.name, email: row.email, mobile: row.mobile, isd_code: row.isd_code, regno: row.regno });
                                        }}>
                                        <WhatsAppOutlined />
                                        WhatsApp
                                        <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, marginLeft: 4 }}>{row.sent_whatsapp_count}</span>
                                    </Button>

                                    {/* Verify All Docs */}
                                    <Button
                                        size="small"
                                        style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}
                                        loading={documentsLoading}
                                        onClick={verifyAllDocs}
                                    >
                                        {documentsLoading ? 'Loading...' : 'Verify all docs'}
                                    </Button>
                                </>
                            }

                            {modules['send_password'] === 1 &&
                                <div>
                                    <Button size="small" style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }} onClick={sendPassword}><i className="fa fa-cog mr4"></i>Send Password</Button>
                                </div>
                            }

                            {modules['student_issues'] === 1 &&
                                <div>
                                    <Button
                                        size="small"
                                        style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}
                                        onClick={() => {
                                            props.openIssuesModal({ id: row.id, name: row.name, email: row.email, regno: row.regno });
                                        }}
                                    >
                                        Issues <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, marginLeft: 4 }}>{Number(row.issues_count) || 0}</span>
                                    </Button>
                                </div>
                            }

                            {modules['view_auto_login'] === 1 &&
                                <div>
                                    <Dropdown
                                        menu={{
                                            items: [
                                                { label: <div className="cursor-pointerselect-none" onClick={() => openAutoLoginUrl(false)}>Open</div>, key: '1' },
                                                { label: <div className="cursor-pointerselect-none" onClick={() => openAutoLoginUrl(true)}>Copy</div>, key: '2' },
                                            ],
                                        }}
                                        trigger={['click']}
                                    >
                                        <Button size="small" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}>
                                            Auto Login
                                            <DownOutlined />
                                        </Button>
                                    </Dropdown>
                                </div>
                            }

                            {modules['assign_to'] === 1 &&
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap' }}>
                                    <Button
                                        size="small"
                                        style={{ background: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}
                                        onClick={() => {
                                            initRefFunctions();
                                            cref.current.openAssignToForm({ id: row.id, name: row.name, email: row.email, regno: row.regno, assigned_to: row.assigned_to, remark: row.remark });
                                        }}
                                    >
                                        Assign To - {row.assigned_to_name || 'N/A'}
                                    </Button>
                                </div>
                            }

                            {modules['mark_dead'] === 1 &&
                                <div>
                                    <Button
                                        size="small"
                                        style={{ background: '#fce7f3', color: '#be185d', border: '1px solid #fbcfe8', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }}
                                        onClick={() => {
                                            initRefFunctions();
                                            markDead(row.dead_on ? 'N' : 'Y');
                                        }}
                                    >
                                        {row.dead_on ? "Mark Not Dead" : "Mark Dead"}
                                    </Button>
                                </div>
                            }

                            {/* Offer Letter, Visa Letter & Admission Letter Buttons */}
                            {(() => {
                                const isAdmin = util.isAdmin() === 1;
                                const isClientAdmin = util.isClientAdmin() === 1;
                                const showButtons = (isAdmin || isClientAdmin || isInstitute) && hasAcceptedInstitutes;
                                
                                return showButtons ? (
                                    <div className="flex gap-1">
                                        {/* Offer Letter */}
                                        <Button size="small" style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }} disabled={offerViewLoading} onClick={openOfferViewModal}>
                                            {offerViewLoading ? <Spin indicator={spinIcon} /> : "Offer Letter"}
                                        </Button>

                                        {/* Visa Letter */}
                                        {(canAccessVisaActions || row.visa_letter_fileid || row.visa_letter) && (
                                            <Button size="small" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }} disabled={visaViewLoading} onClick={openVisaViewModal}>
                                                {visaViewLoading ? <Spin indicator={spinIcon} /> : "Visa Letter"}
                                            </Button>
                                        )}

                                        {/* Admission Letter */}
                                        {(canAccessVisaActions || row.admission_letter_fileid || row.admission_letter) && (
                                            <Button size="small" style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: 600, borderRadius: 6, fontSize: 12, padding: '0 10px', height: 28 }} disabled={admissionViewLoading} onClick={openAdmissionViewModal}>
                                                {admissionViewLoading ? <Spin indicator={spinIcon} /> : "Admission Letter"}
                                            </Button>
                                        )}
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    </td>
                </tr>
            </>}

            {/* Upload offer letter modal */}
            <Modal
                visible={offerModalVisible}
                title="Select Institute for Offer Letter"
                onCancel={() => setOfferModalVisible(false)}
                onOk={() => {
                    if (!selectedInstitute) {
                        message.error("Please select an institute");
                        return;
                    }
                    document.getElementById(`offer-upload-${row.id}`).click();
                }}
                okButtonProps={{ disabled: !selectedInstitute }}
                width={600}               // Moderate width
                centered
                bodyStyle={{ padding: '20px 24px' }}
            >
                <Select
                    showSearch
                    placeholder="Select Institute"
                    value={selectedInstitute?.institute_id}
                    onChange={(value) => {
                        const inst = availableInstitutes.find(c => String(c.institute_id) === value);
                        setSelectedInstitute(inst);
                    }}
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    dropdownStyle={{ maxHeight: 300 }} // Limits dropdown height with scroll
                >
                    {availableInstitutes.map(c => (
                        <Option key={c.institute_id} value={c.institute_id}>
                            {c.inst_name}
                        </Option>
                    ))}
                </Select>

                {/* Hidden File Input for Upload */}
                <input
                    key={row.offer_letter_file_url || row.id}
                    type="file"
                    id={`offer-upload-${row.id}`}
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                        if (!selectedInstitute) {
                            message.error("Please select an institute before uploading");
                            e.target.value = "";
                            return;
                        }

                        const file = e.target.files[0];
                        if (!file) return;
                        if (!util.checkPdf(e.target, 5)) return;

                        // setLoading(true);
                        try {
                            const resolvedClientId = await resolveClientId(row.id);
                            const uploadRes = await FileService.upload(file, resolvedClientId);
                            const file_id = uploadRes.data?.file_id;
                            if (!file_id) throw new Error("File upload failed");

                            const courses = await fetchAppliedCourses(row.id);
                            const matched = courses.find(c => Number(c.institute_id) === Number(selectedInstitute.institute_id));
                            if (!matched || matched.ins_status !== 'Accepted') {
                                message.error("Institute invalid or not accepted");
                                return;
                            }

                            const res = await StudentService.setSCFUploadOfferLetter({
                                scf_id: matched.scf_id,
                                file_id,
                                client_id: Number(resolvedClientId),
                                student_id: Number(row.id),
                                institute_id: Number(selectedInstitute.institute_id),
                            });

                            if (res.success) {
                                message.success(res.message || "Offer letter uploaded successfully");

                                // Update offerFiles state immediately
                                const newFile = {
                                    institute: matched,
                                    file: {
                                        file_url: uploadRes.data.file_url,
                                        file_name: file.name || 'offer_letter.pdf'
                                    }
                                };
                                setOfferFiles(prev => {
                                    const filtered = prev.filter(f => f.institute.institute_id !== matched.institute_id);
                                    return [...filtered, newFile];
                                });

                                setRow(prev => ({
                                    ...prev,
                                    offer_letter_file_url: uploadRes.data.file_url,
                                }));

                                setSelectedInstitute(matched);
                                // Auto-close modal shortly after success
                                setTimeout(() => setOfferModalVisible(false), 800);
                            } else {
                                message.error(res.message || "Failed to upload offer letter");
                            }

                        } catch (err) {
                            console.error(err);
                            message.error(err.message || "Upload failed");
                        } finally {
                            e.target.value = '';
                            // setLoading(false);
                        }
                    }}
                />
            </Modal>

            {/* View offer letter */}
            <Modal
                title="View Offer Letters"
                open={offerViewModalVisible}
                onCancel={() => setOfferViewModalVisible(false)}
                footer={null}
                width={700}
                centered
                bodyStyle={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}
            >
                {offerFiles.length ? (
                    <div className="flex flex-col gap-4">
                        {offerFiles.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {item.institute.inst_name}
                                    </p>
                                </div>
                                <div className="mt-2 sm:mt-0 sm:ml-4 flex gap-2">
                                    <Button
                                        type="primary"
                                        size="middle"
                                        onClick={() => {
                                            try {
                                                const fileUrl = getNodeFileUrl(item.file.file_url);
                                                if (fileUrl) {
                                                    window.open(fileUrl, "_blank");
                                                } else {
                                                    message.error('Invalid file URL');
                                                }
                                            } catch (error) {
                                                console.error('Error viewing document:', error);
                                                message.error('Failed to open document');
                                            }
                                        }}
                                    >
                                        View PDF
                                    </Button>
                                    {/* Download removed: use viewer's built-in download in new tab */}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-6">
                        <div className="mb-4">No offer letters uploaded yet</div>
                        <Button
                            type="primary"
                            onClick={() => {
                                setOfferViewModalVisible(false);
                                openOfferLetterModal();
                            }}
                        >
                            Upload Offer Letter
                        </Button>
                    </div>
                )}
            </Modal>

            {/* Upload visa letter */}
            <Modal
                visible={visaModalVisible}
                title="Select Institute for Visa Letter"
                onCancel={() => setVisaModalVisible(false)}
                onOk={() => {
                    if (!selectedVisaInstitute) {
                        message.error("Please select an institute");
                        return;
                    }
                    document.getElementById(`visa-upload-${row.id}`).click();
                }}
                okButtonProps={{ disabled: !selectedVisaInstitute }}
                width={600}
                centered
                bodyStyle={{ padding: '20px 24px' }}
            >
                <Select
                    showSearch
                    placeholder="Select Institute"
                    value={selectedVisaInstitute?.institute_id}
                    onChange={(value) => {
                        const inst = visaAvailableInstitutes.find(c => String(c.institute_id) === value);
                        setSelectedVisaInstitute(inst);
                    }}
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    dropdownStyle={{ maxHeight: 300 }}
                >
                    {visaAvailableInstitutes.map(c => (
                        <Option key={c.institute_id} value={c.institute_id}>
                            {c.inst_name}
                        </Option>
                    ))}
                </Select>

                <input
                    key={row.visa_letter_file_url || row.id}
                    type="file"
                    id={`visa-upload-${row.id}`}
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                        if (!selectedVisaInstitute) {
                            message.error("Please select an institute before uploading");
                            e.target.value = '';
                            return;
                        }

                        const file = e.target.files[0];
                        if (!file) return;
                        if (!util.checkPdf(e.target, 5)) return;

                        const formData = new FormData();
                        formData.append("visa_status", "1");
                        formData.append("user_id", String(row.user_id));
                        formData.append("student_id", String(row.id));
                        formData.append("ins_id", selectedVisaInstitute.institute_id);
                        formData.append("visa_file", file);

                        // setLoading(true);
                        try {
                            const res = await InstituteService.uploadVisaLetter(formData);
                            if (res.data.success === "ok") {
                                message.success("Visa letter uploaded successfully");

                                // Update visaFiles state immediately
                                const newVisaFile = {
                                    institute: selectedVisaInstitute,
                                    file: {
                                        file_url: res.data.file_url,
                                        file_name: file.name || 'visa_letter.pdf'
                                    }
                                };
                                setVisaFiles(prev => {
                                    const filtered = prev.filter(f => f.institute.institute_id !== selectedVisaInstitute.institute_id);
                                    return [...filtered, newVisaFile];
                                });

                                setSelectedVisaInstitute(selectedVisaInstitute);
                                // Auto-close modal shortly after success
                                setTimeout(() => setVisaModalVisible(false), 800);
                            } else {
                                message.error(res.data.message || "Failed to upload visa letter");
                            }
                        } catch (err) {
                            console.error(err);
                            message.error(err.message || "Upload failed");
                        } finally {
                            e.target.value = '';
                            // setLoading(false);
                        }
                    }}
                />
            </Modal>

            {/* View visa letter */}
            <Modal
                title="View Visa Letters"
                open={visaViewModalVisible}
                onCancel={() => setVisaViewModalVisible(false)}
                footer={null}
                width={700}
                centered
                bodyStyle={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}
            >
                {visaFiles.length ? (
                    <div className="flex flex-col gap-4">
                        {visaFiles.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {item.institute.inst_name}
                                    </p>
                                </div>
                                <div className="mt-2 sm:mt-0 sm:ml-4 flex gap-2">
                                    <Button
                                        type="primary"
                                        size="middle"
                                        onClick={async () => {
                                            try {
                                                // Use the view endpoint instead of download to display in browser
                                                if (!item.scf_id) {
                                                    message.error('SCF ID not found');
                                                    return;
                                                }
                                                
                                                const res = await InstituteService.viewVisaLetterFile(item.scf_id);
                                                
                                                // Ensure we have a proper PDF blob with inline disposition
                                                const blob = new Blob([res.data], { type: 'application/pdf' });
                                                const url = window.URL.createObjectURL(blob);
                                                
                                                // Open in new tab - browser will display PDF viewer
                                                const newWindow = window.open(url, "_blank");
                                                
                                                if (!newWindow) {
                                                    message.error('Please allow pop-ups to view the PDF');
                                                    window.URL.revokeObjectURL(url);
                                                    return;
                                                }
                                                
                                                // Clean up the blob URL after the new window loads
                                                // Use longer delay to ensure PDF loads properly
                                                setTimeout(() => {
                                                    window.URL.revokeObjectURL(url);
                                                }, 5000);
                                            } catch (error) {
                                                console.error('Error viewing visa letter:', error);
                                                message.error(error?.response?.data?.message || 'Failed to open visa letter');
                                            }
                                        }}
                                    >
                                        View PDF
                                    </Button>
                                    {/* Download removed: use viewer's built-in download in new tab */}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-6">
                        <div className="mb-4">No visa letters uploaded yet</div>
                        <Button
                            type="primary"
                            onClick={() => {
                                setVisaViewModalVisible(false);
                                openVisaLetterModal();
                            }}
                        >
                            Upload Visa Letter
                        </Button>
                    </div>
                )}
            </Modal>

            {/* Upload admission letter modal */}
            <Modal
                visible={admissionModalVisible}
                title="Select Institute for Admission Letter"
                onCancel={() => setAdmissionModalVisible(false)}
                onOk={() => {
                    if (!selectedAdmissionInstitute) {
                        message.error("Please select an institute");
                        return;
                    }
                    document.getElementById(`admission-upload-${row.id}`).click();
                }}
                okButtonProps={{ disabled: !selectedAdmissionInstitute }}
                width={600}
                centered
                bodyStyle={{ padding: '20px 24px' }}
            >
                <Select
                    showSearch
                    placeholder="Select Institute"
                    value={selectedAdmissionInstitute?.institute_id}
                    onChange={(value) => {
                        const inst = admissionAvailableInstitutes.find(c => String(c.institute_id) === value);
                        setSelectedAdmissionInstitute(inst);
                    }}
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    dropdownStyle={{ maxHeight: 300 }}
                >
                    {admissionAvailableInstitutes.map(c => (
                        <Option key={c.institute_id} value={c.institute_id}>
                            {c.inst_name}
                        </Option>
                    ))}
                </Select>

                <input
                    key={row.admission_letter_file_url || row.id}
                    type="file"
                    id={`admission-upload-${row.id}`}
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                        if (!selectedAdmissionInstitute) {
                            message.error("Please select an institute before uploading");
                            e.target.value = '';
                            return;
                        }

                        const file = e.target.files[0];
                        if (!file) return;
                        if (!util.checkPdf(e.target, 5)) return;

                        try {
                            const resolvedClientId = await resolveClientId(row.id);
                            const uploadRes = await FileService.upload(file, resolvedClientId);
                            const file_id = uploadRes.data?.file_id;
                            if (!file_id) throw new Error("File upload failed");

                            const courses = await fetchAppliedCourses(row.id);
                            const matched = courses.find(c => Number(c.institute_id) === Number(selectedAdmissionInstitute.institute_id));
                            if (!matched || matched.ins_status !== 'Accepted') {
                                message.error("Institute invalid or not accepted");
                                return;
                            }

                            const res = await StudentService.setSCFUploadAdmissionLetter({
                                scf_id: matched.scf_id,
                                file_id,
                                client_id: Number(resolvedClientId),
                                student_id: Number(row.id),
                                institute_id: Number(selectedAdmissionInstitute.institute_id),
                            });

                            if (res.success) {
                                message.success(res.message || "Admission letter uploaded successfully");

                                const newFile = {
                                    institute: matched,
                                    file: {
                                        file_url: uploadRes.data.file_url,
                                        file_name: file.name || 'admission_letter.pdf'
                                    }
                                };
                                setAdmissionFiles(prev => {
                                    const filtered = prev.filter(f => f.institute.institute_id !== matched.institute_id);
                                    return [...filtered, newFile];
                                });

                                setRow(prev => ({
                                    ...prev,
                                    admission_letter_file_url: uploadRes.data.file_url,
                                }));

                                setSelectedAdmissionInstitute(matched);
                                setTimeout(() => setAdmissionModalVisible(false), 800);
                            } else {
                                message.error(res.message || "Failed to upload admission letter");
                            }

                        } catch (err) {
                            console.error(err);
                            message.error(err.message || "Upload failed");
                        } finally {
                            e.target.value = '';
                        }
                    }}
                />
            </Modal>

            {/* View admission letter */}
            <Modal
                title="View Admission Letters"
                open={admissionViewModalVisible}
                onCancel={() => setAdmissionViewModalVisible(false)}
                footer={null}
                width={700}
                centered
                bodyStyle={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}
            >
                {admissionFiles.length ? (
                    <div className="flex flex-col gap-4">
                        {admissionFiles.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {item.institute.inst_name}
                                    </p>
                                </div>
                                <div className="mt-2 sm:mt-0 sm:ml-4 flex gap-2">
                                    <Button
                                        type="primary"
                                        size="middle"
                                        onClick={async () => {
                                            try {
                                                if (item.institute.scf_id) {
                                                    // Use the backend API endpoint with authentication
                                                    const nodeBaseUrl = util.apiUrlNode.endsWith('/') ? util.apiUrlNode.slice(0, -1) : util.apiUrlNode;
                                                    const apiUrl = `${nodeBaseUrl}/student/letters/${item.institute.scf_id}/admission-letter/view`;

                                                    // Fetch with Node authentication headers
                                                    const sessionId = util.getSessionId();
                                                    const nodeToken = util.getNodeToken();
                                                    
                                                    if (!nodeToken) {
                                                        message.error("Node authentication token not available");
                                                        return;
                                                    }
                                                    
                                                    const response = await fetch(apiUrl, {
                                                        headers: {
                                                            'Sessionid': sessionId,
                                                            'Authorization': nodeToken
                                                        }
                                                    });

                                                    if (response.ok) {
                                                        const blob = await response.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        window.open(url, "_blank");
                                                    } else {
                                                        const errorText = await response.text();
                                                        console.error("Error response:", errorText);
                                                        message.error("Failed to load admission letter");
                                                    }
                                                } else {
                                                    message.error("Unable to view file - SCF ID not available");
                                                }
                                            } catch (error) {
                                                console.error("Error viewing admission letter:", error);
                                                message.error("Failed to view admission letter");
                                            }
                                        }}
                                    >
                                        View PDF
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-6">
                        <div className="mb-4">No admission letters uploaded yet</div>
                        <Button
                            type="primary"
                            onClick={() => {
                                setAdmissionViewModalVisible(false);
                                openAdmissionLetterModal();
                            }}
                        >
                            Upload Admission Letter
                        </Button>
                    </div>
                )}
            </Modal>

            {/* View student timeline */}
            <Modal
                title={
                    <div style={{ fontWeight: 600, fontSize: "16px" }}>
                        <i className="fa fa-clock-o mr4"></i> Student Timeline
                    </div>
                }
                open={timelineModalVisible}
                onCancel={() => setTimelineModalVisible(false)}
                footer={null}
                width={800}
                centered
                bodyStyle={{ padding: "20px 24px" }}
            >
                {timelineData ? (
                    <div style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "8px" }}>
                        {/* Header Info */}
                        <div
                            style={{
                                background: "#f9f9f9",
                                borderRadius: "8px",
                                padding: "12px 16px",
                                marginBottom: "16px",
                            }}
                        >
                            <div style={{ fontWeight: 600, fontSize: "15px", color: "#222" }}>
                                {timelineData.name}
                            </div>
                            <div style={{ color: "#555" }}>Reg No: {timelineData.regno}</div>

                            <div style={{ marginTop: "6px", color: "#666", fontSize: "13px" }}>
                                <div>
                                    📧 <b>{timelineData.email}</b>
                                </div>
                                <div>
                                    📱 {timelineData.isd_code}-{timelineData.mobile}
                                </div>
                                <div style={{ marginTop: "4px" }}>
                                    🟩 <b>Profile Completion:</b> {timelineData.completion_per || 0}%
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <Timeline mode="left" style={{ marginLeft: "10px" }}>
                            <Timeline.Item
                                color="green"
                                dot={<i className="fa fa-user-circle text-success"></i>}
                            >
                                <b>SIS Registration</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.created ? util.getDate(timelineData.created) : "Pending"}
                                </div>
                            </Timeline.Item>

                            <Timeline.Item
                                color={timelineData.basic_info_date ? "green" : "gray"}
                                dot={<i className="fa fa-id-card"></i>}
                            >
                                <b>Basic Information</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.basic_info_date
                                        ? util.getDate(timelineData.basic_info_date)
                                        : "Pending"}
                                </div>
                            </Timeline.Item>

                            <Timeline.Item
                                color={timelineData.edu_info_date ? "green" : "gray"}
                                dot={<i className="fa fa-graduation-cap"></i>}
                            >
                                <b>Educational Information</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.edu_info_date
                                        ? util.getDate(timelineData.edu_info_date)
                                        : "Pending"}
                                </div>
                            </Timeline.Item>

                            {/* Document Upload */}
                            <Timeline.Item
                                color={timelineData.doc_uploaded_on ? "green" : "gray"}
                                dot={<i className="fa fa-file-upload"></i>}
                            >
                                <b>Document Upload</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.doc_uploaded_on
                                        ? util.getDate(timelineData.doc_uploaded_on)
                                        : "Pending"}
                                </div>
                            </Timeline.Item>

                            {/* Document Verified */}
                            <Timeline.Item
                                color={timelineData.doc_verified_on ? "green" : "gray"}
                                dot={<i className="fa fa-check-square"></i>}
                            >
                                <b>Document Verified</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.doc_verified_on
                                        ? util.getDate(timelineData.doc_verified_on)
                                        : "Pending"}
                                </div>
                            </Timeline.Item>

                            {/* Background Information */}
                            <Timeline.Item
                                color={timelineData.background_info_date ? "green" : "gray"}
                                dot={<i className="fa fa-address-card"></i>}
                            >
                                <b>Background Information</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.background_info_date
                                        ? util.getDate(timelineData.background_info_date)
                                        : "Pending"}
                                </div>
                            </Timeline.Item>

                            {/* Choice Filling */}
                            <Timeline.Item
                                color={timelineData.course_choice_date ? "green" : "gray"}
                                dot={<i className="fa fa-list-alt"></i>}
                            >
                                <b>Choice Filling</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.course_choice_date
                                        ? util.getDate(timelineData.course_choice_date)
                                        : "Pending"}
                                </div>
                            </Timeline.Item>

                            {/* Offer Letter Uploaded */}
                            <Timeline.Item
                                color={timelineData.offer_timeline_uploaded ? "green" : "gray"}
                                dot={<i className="fa fa-file-alt"></i>}
                            >
                                <b>Offer Letter Uploaded</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.offer_timeline_uploaded ? 'Uploaded' : 'Pending'}
                                </div>
                            </Timeline.Item>

                            {/* Payment Status */}
                            <Timeline.Item
                                color={timelineData.payment_timeline_status && timelineData.payment_timeline_status !== 'Pending' ? "green" : "gray"}
                                dot={<i className="fa fa-credit-card"></i>}
                            >
                                <b>Payment Status</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.payment_timeline_status || 'Pending'}
                                </div>
                            </Timeline.Item>

                            {/* Visa Status */}
                            <Timeline.Item
                                color={(timelineData.visa_timeline_status && timelineData.visa_timeline_status !== 'Pending' && timelineData.visa_timeline_status !== 'Unknown') ? "green" : "gray"}
                                dot={<i className="fa fa-plane"></i>}
                            >
                                <b>Visa Status</b>
                                <div style={{ color: "#555" }}>
                                    {timelineData.visa_timeline_status || 'Pending'}
                                </div>
                            </Timeline.Item>
                        </Timeline>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <i className="fa fa-spinner fa-spin fs-16"></i> Loading details...
                    </div>
                )}
            </Modal>

            {/* Document Verification Modal */}
            <Modal
                title={
                    <div style={{ fontWeight: 600, fontSize: "16px" }}>
                        <i className="fa fa-file-text-o mr4"></i> Document Verification - {row.name}
                    </div>
                }
                open={documentsModalVisible}
                onCancel={() => setDocumentsModalVisible(false)}
                width={900}
                centered
                bodyStyle={{ padding: "20px 24px" }}
                footer={[
                    <Button key="cancel" onClick={() => setDocumentsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="verify-all"
                        type="primary"
                        onClick={handleVerifyAllDocuments}
                        disabled={studentDocuments.every(doc => doc.verified)}
                    >
                        <i className="fa fa-check mr4"></i>
                        Verify All Documents
                    </Button>
                ]}
            >
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {/* Student Info Header */}
                    <div
                        style={{
                            background: "#f9f9f9",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            marginBottom: "20px",
                        }}
                    >
                        <div style={{ fontWeight: 600, fontSize: "15px", color: "#222" }}>
                            {row.name} ({row.regno})
                        </div>
                        <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>
                            📧 {row.email} | 📱 {row.isd_code}-{row.mobile}
                        </div>
                        <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>
                            📅 Documents uploaded on: {row.doc_uploaded_on ? util.getDate(row.doc_uploaded_on) : 'Not uploaded'}
                        </div>
                    </div>

                    {/* Documents List */}
                    {studentDocuments.length > 0 ? (
                        <div className="space-y-4">
                            {studentDocuments.map((document, index) => (
                                <div
                                    key={document.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    style={{
                                        backgroundColor: document.verified ? '#f6ffed' : '#fff',
                                        borderColor: document.verified ? '#b7eb8f' : '#d9d9d9'
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <i className={`fa ${document.type === 'education' ? 'fa-graduation-cap' : 'fa-id-card'} text-blue-500`}></i>
                                                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                                                    {document.name}
                                                </span>
                                                <Tag color={document.type === 'education' ? 'blue' : 'purple'} size="small">
                                                    {document.type === 'education' ? 'Education' : 'Background'}
                                                </Tag>
                                                {document.verified && (
                                                    <Tag color="green" size="small">
                                                        <i className="fa fa-check mr-1"></i>
                                                        Verified
                                                    </Tag>
                                                )}
                                                {(!document.file_url || document.file_url === '#' || document.file_url === null || document.file_url === '') && (
                                                    <Tag color="orange" size="small">
                                                        <i className="fa fa-exclamation-triangle mr-1"></i>
                                                        File Not Available
                                                    </Tag>
                                                )}
                                            </div>

                                            <div style={{ fontSize: "12px", color: "#666" }}>
                                                <div>📅 Uploaded: {util.getDate(document.uploaded_on)}</div>
                                                {document.verified && document.verified_on && (
                                                    <div>✅ Verified: {util.getDate(document.verified_on)}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="small"
                                                type="default"
                                                disabled={!document.file_url || document.file_url === '#' || document.file_url === null || document.file_url === ''}
                                                onClick={async () => {
                                                    if (document.file_url && document.file_url !== '#' && document.file_url !== null && document.file_url !== '') {
                                                        try {
                                                            // Convert to proper file URL
                                                            const fileUrl = getNodeFileUrl(document.file_url);
                                                            
                                                            if (fileUrl) {
                                                                window.open(fileUrl, '_blank');
                                                            } else {
                                                                message.error('Invalid file URL');
                                                            }
                                                            
                                                        } catch (error) {
                                                            console.error('Error viewing document:', error);
                                                            message.error(error.message || 'Failed to open document. Please check if the file exists.');
                                                        }
                                                    } else {
                                                        // Show message if no document URL is available
                                                        message.warning('Document file is not available for viewing. The document may not have been uploaded yet or the file URL is missing.');
                                                    }
                                                }}
                                                title={!document.file_url || document.file_url === '#' || document.file_url === null || document.file_url === '' ? 'Document file not available' : 'View document'}
                                            >
                                                <i className="fa fa-eye mr-1"></i>
                                                {!document.file_url || document.file_url === '#' || document.file_url === null || document.file_url === '' ? 'No File' : 'View'}
                                            </Button>

                                            {/* {!document.verified && (
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    onClick={() => handleVerifyDocument(document.id)}
                                                >
                                                    <i className="fa fa-check mr-1"></i>
                                                    Verify
                                                </Button>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <i className="fa fa-file-o text-gray-400" style={{ fontSize: "48px" }}></i>
                            <div style={{ marginTop: "16px", color: "#666" }}>
                                No documents have been uploaded by this student yet.
                            </div>
                        </div>
                    )}

                    {/* Verification Summary */}
                    {/* {studentDocuments.length > 0 && (
                        <div
                            style={{
                                marginTop: "20px",
                                padding: "12px 16px",
                                backgroundColor: "#f0f2f5",
                                borderRadius: "8px",
                                fontSize: "13px"
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                                Verification Summary:
                            </div>
                            <div>
                                ✅ Verified: {studentDocuments.filter(doc => doc.verified).length} documents
                            </div>
                            <div>
                                ⏳ Pending: {studentDocuments.filter(doc => !doc.verified).length} documents
                            </div>
                        </div>
                    )} */}
                </div>
            </Modal>
        </>
    )
}
