
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { sdx } from '../../sdx';
import InstituteService from "../../services/InstituteService";
import { useLocation, useNavigate } from 'react-router-dom';
import FileSaver from 'file-saver';
import StudentService from '../../services/StudentService';
import CmasterService from '../../services/CmasterService';
import { useChoiceFilling } from '../../contexts/ChoiceFillingContext';
import ClientService from '../../services/ClientService';
import UserService from '../../services/UserService';
import FileService from '../../services/FileService';
import axios from '../../utils/axios';
import axiosnode from '../../utils/axiosnode';
import { AntdPaging, AntdDatepicker, AntdSelect } from '../../utils/Antd';
import util from '../../utils/util';
import { filterStudents, getUserFilters, hasFilters, getFilterSummary } from '../../utils/leadFilters';
import StuRow from './StuRow';
import StuForm from './StuForm';
import StuSendEmail from './StuSendEmail';
import StuSendWhatsapp from './StuSendWhatsapp';
import StuFollowup from './StuFollowup';
import StuConversations from './StuConversations';
import Issues from './Issues';
import AssigntoForm from './AssigntoForm';
import { SessionContext } from '../../context/SessionContext';
import moment from 'moment';
import {
    Button,
    Input,
    message,
    Modal,
    Card,
    Row,
    Col,
    Switch,
    Table,
    Dropdown,
    Spin,
    Tabs,
} from 'antd';
import {
    DownOutlined,
} from '@ant-design/icons';
// const { confirm } = Modal;
const { TabPane } = Tabs;
let $ = window.$;
const paymentStatusColor = {
    Pending: 'orange',
    Uploaded: 'purple',
    Acknowledged: 'green',
    Rejected: 'red',
};

const resolveOfferUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
    let nodeOrigin = '';
    try {
        nodeOrigin = new URL(util.apiUrlNode).origin;
    } catch (e) {
        nodeOrigin = '';
    }

    try {
        const parsed = new URL(rawUrl);
        // If it's already a full URL (PHP or Node), return as-is
        return rawUrl;
    } catch (e) {
        // If it's a relative path, prepend the Node origin
        if (nodeOrigin && (rawUrl.startsWith('/uploads/') || rawUrl.startsWith('uploads/'))) {
            const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
            return `${nodeOrigin}${path}`;
        }
        return rawUrl;
    }
};

export default function Students() {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState({ data: [], page: {} });
    const sdataRef = useRef({ 
        p: 1, 
        ps: 100, // Default page size set to 100
        from: null,
        to: null 
    });
    const cref = useRef({});
    const autoRefreshRef = useRef({ timer: null, lastAt: 0 });
    const debounceRef = useRef({ timer: null }); // Add debounce ref to prevent duplicate calls
    const modules = util.getModules();
    const [stuDtl, setStuDtl] = useState({});
    const [isIssueModalOpen, setIssueModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const isClientAdmin = util.isClientAdmin() === 1;
    const isInstitute = util.isInstitute() === 1;
    const isAgent = util.isAgent() === 1;
    const { selectedSession, setSelectedSession, sessions } = useContext(SessionContext);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current.timer) {
                clearTimeout(debounceRef.current.timer);
            }
        };
    }, []);

    // Ensure dynamic institute context (sdx.institute_id) is populated when
    // viewing the Students page in Institute mode. This makes the header
    // `institute_id` and visa upload payload `ins_id` available globally.
    useEffect(() => {
        if (!isInstitute) return;
        (async () => {
            try {
                const { data } = await InstituteService.getInstituteId();
                // Some environments return {institute_id}, others {data: {institute_id}}
                const rawId = (data && (data.institute_id || data?.data?.institute_id || data?.result?.institute_id)) || 0;
                const fetched = Number(rawId || 0);
                // eslint-disable-next-line no-console
                // console.log('[ctx] Students getInstituteId raw response:', data, 'parsed id:', fetched);
                if (fetched) {
                    sdx.setData({ institute_id: fetched });
                    // eslint-disable-next-line no-console
                    // console.log('[ctx] Students set sdx.institute_id:', sdx.institute_id);
                }
            } catch (e) {
                // ignore
            }
        })();
    }, [isInstitute]);

    // Map tab keys to backend values
    // const choiceFillingMap = {
    //     accepted: 'Ins_Accepted',
    //     rejected: 'Ins_Rejected',
    //     offered: 'offer_Uploaded',
    //     offer_accepted: 'Stu_Accepted',
    //     stu_rejected: 'Stu_Rejected',
    // };
    const choiceFillingMap = {
        accepted: 'Ins_Accepted',
        rejected: 'Ins_Rejected',
        'offer-pending': 'offer_Pending',
        offered: 'offer_Uploaded',
        offer_accepted: 'Stu_Accepted',
        stu_rejected: 'Stu_Rejected',
        choice_filled: 'Yes',
        choice_not_filled: 'No',
    };

    // === Main list function ===
    const list = (p = 1, ps = sdataRef.current.ps, tab = activeTab) => {
        // Clear any existing debounce timer
        if (debounceRef.current.timer) {
            clearTimeout(debounceRef.current.timer);
        }
        
        // Debounce API calls to prevent duplicates
        debounceRef.current.timer = setTimeout(() => {
            executeList(p, ps, tab);
        }, 100); // 100ms debounce
    };

    const executeList = (p = 1, ps = sdataRef.current.ps, tab = activeTab) => {
        // 🔥 IMMEDIATE DEBUG - Check URL parameters
        const currentUrl = window.location.href;
        const currentSearch = window.location.search;
        const testParams = new URLSearchParams(currentSearch);
        const testSessionId = testParams.get('master_session_id');
        
        console.log('� IMMEDIATE DEBUG:', {
            currentUrl,
            currentSearch,
            testSessionId,
            'testSessionId type': typeof testSessionId
        });
        
        console.log('🚀 list() called with:', { p, ps, tab });
        console.log('🌐 Current URL:', window.location.href);
        console.log('🔗 URL Search:', window.location.search);
        
        // Update the page number and page size
        sdataRef.current.p = p;
        sdataRef.current.ps = ps;
        
        const filters = { p, ps };

        // IMPORTANT: Process URL parameters first before making API call
        const urlParams = new URLSearchParams(window.location.search);
        
        // Process filter parameters from URL and update sdataRef
        const urlFilters = {
            basic_info: urlParams.get('basic_info'),
            edu_info: urlParams.get('edu_info'),
            doc_uploaded: urlParams.get('doc_uploaded'),
            doc_verified: urlParams.get('doc_verified'),
            background_info: urlParams.get('background_info'),
            payment_proof: urlParams.get('payment_proof'),
            choice_filling: urlParams.get('choice_filling'),
        };
        
        // Update sdataRef with URL parameters if they exist
        Object.keys(urlFilters).forEach(key => {
            if (urlFilters[key]) {
                sdataRef.current[key] = urlFilters[key];
                console.log(`Setting ${key} = ${urlFilters[key]} from URL`);
            }
        });

        // Check for session parameters in URL first (highest priority)
        const urlSessionId = urlParams.get('master_session_id');
        const urlSessionName = urlParams.get('session_name');
        const urlSession = urlParams.get('session');
        
        console.log('🔍 URL Session Parameters:', {
            urlSessionId,
            urlSessionName, 
            urlSession,
            'urlSessionId type': typeof urlSessionId
        });
        
        // Priority order: URL master_session_id > URL session_name > URL session > context session
        let sessionToUse = null;
        let sessionIdToUse = null;

        if (urlSessionId) {
            // Direct session ID from URL (highest priority)
            sessionIdToUse = parseInt(urlSessionId);
            console.log('✅ Using URL master_session_id:', sessionIdToUse, 'from URL param:', urlSessionId);
        } else if (urlSessionName) {
            // Session name from URL, need to convert to ID
            sessionToUse = urlSessionName;
            console.log('Using URL session_name:', sessionToUse);
        } else if (urlSession) {
            // Legacy session parameter
            sessionToUse = urlSession;
            console.log('Using URL session:', sessionToUse);
        } else {
            // Fall back to context session
            sessionToUse = selectedSession;
            console.log('Using context session:', sessionToUse);
        }

        console.log('🔍 URL Parameters Debug:', {
            'window.location.search': window.location.search,
            'urlSessionId': urlSessionId,
            'urlSessionId type': typeof urlSessionId,
            'urlSessionId parsed': urlSessionId ? parseInt(urlSessionId) : null
        });

        // Convert session to master_session_id for PHP API if we don't already have it
        if (!sessionIdToUse && sessionToUse) {
            if (typeof sessionToUse === 'object' && sessionToUse.key) {
                sessionIdToUse = sessionToUse.key;
            } else if (typeof sessionToUse === 'object' && sessionToUse.id) {
                sessionIdToUse = sessionToUse.id;
            } else if (typeof sessionToUse === 'string' && /^\d+$/.test(sessionToUse)) {
                sessionIdToUse = parseInt(sessionToUse);
            } else if (typeof sessionToUse === 'number') {
                sessionIdToUse = sessionToUse;
            }
            // If we have a session context object, try to get the key from it
            else if (selectedSession && selectedSession.key) {
                sessionIdToUse = selectedSession.key;
            }
            // Fallback: try id field
            else if (selectedSession && selectedSession.id) {
                sessionIdToUse = selectedSession.id;
            }
        }

        // Set the session ID in filters
        if (sessionIdToUse) {
            filters.master_session_id = sessionIdToUse;
            console.log('✅ Final session ID for API:', sessionIdToUse);
        } else {
            console.warn('❌ No session ID found, using hardcoded session ID 68 for testing');
            console.warn('Debug info:', { urlSessionId, urlSessionName, urlSession, selectedSession });
            // Only use hardcoded fallback if there's no URL session parameter
            if (!urlSessionId && !urlSessionName && !urlSession) {
                filters.master_session_id = 68;
            } else {
                console.error('🚨 URL session parameter exists but sessionIdToUse is null!');
                // Force use URL parameter if it exists
                if (urlSessionId) {
                    filters.master_session_id = parseInt(urlSessionId);
                    console.log('🔧 FORCED URL session ID:', parseInt(urlSessionId));
                }
            }
        }

        // Apply tab-based filtering for institutes
        if ((isInstitute || isClientAdmin) && tab !== 'all') {
            // Check if there's a mapping for the current tab
            if (choiceFillingMap[tab]) {
                filters.choice_filling = choiceFillingMap[tab];
            }
        }

        // Add other filters from sdataRef (but don't override tab-based choice_filling)
        Object.keys(sdataRef.current).forEach(key => {
            if (!['p', 'ps', 'from', 'to'].includes(key)) {
                const value = sdataRef.current[key];
                if (value != null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                    // Don't override choice_filling if it was set by tab logic above
                    if (key === 'choice_filling' && filters.choice_filling) {
                        return;
                    }
                    filters[key] = value;
                }
            }
        });

        // Add date filters - these should work regardless of session
        if (sdataRef.current.from) {
            filters.from = moment(sdataRef.current.from).format('YYYY-MM-DD');
        }
        if (sdataRef.current.to) {
            filters.to = moment(sdataRef.current.to).format('YYYY-MM-DD');
        }
        
        // Only add session-based date fallback if no explicit dates are set and no session ID
        if (!sdataRef.current.from && !sdataRef.current.to && !filters.master_session_id && sessionToUse) {
            let sessionStart = null;
            let sessionEnd = null;
            
            if (sessionToUse.startDate && sessionToUse.endDate) {
                // Use explicit session dates if available
                sessionStart = new Date(sessionToUse.startDate);
                sessionEnd = new Date(sessionToUse.endDate);
                sessionEnd.setHours(23, 59, 59, 999);
            } else {
                // Fall back to parsing session name (e.g., "2022-2023")
                let sessionLabel = null;
                if (typeof sessionToUse === 'string') {
                    sessionLabel = sessionToUse;
                } else if (sessionToUse.name) {
                    sessionLabel = sessionToUse.name;
                }
                
                if (sessionLabel && typeof sessionLabel === 'string') {
                    const m = sessionLabel.match(/(\d{4})-(\d{4})/);
                    if (m) {
                        const startYear = parseInt(m[1], 10);
                        const endYear = parseInt(m[2], 10);
                        sessionStart = new Date(`${startYear}-11-01T00:00:00`);
                        sessionEnd = new Date(`${endYear}-10-31T23:59:59`);
                    }
                }
            }
            
            // If we have valid session dates, use them
            if (sessionStart && sessionEnd && !isNaN(sessionStart) && !isNaN(sessionEnd)) {
                filters.from = moment(sessionStart).format('YYYY-MM-DD');
                filters.to = moment(sessionEnd).format('YYYY-MM-DD');
            }
        }

        util.showLoader();
        
        console.log('📤 API Request - Sending filters:', filters);
        console.log('📤 Page:', p, 'PageSize:', ps);
        console.log('📤 sdataRef.current:', { ...sdataRef.current });
        
        StudentService.list(filters)
        .then(({ data }) => {
            console.log('🔍 Raw API Response:', data);
            console.log('🔍 Response code:', data?.code);
            console.log('🔍 Response message:', data?.message);
            console.log('🔍 Has result:', !!data?.result);
            console.log('🔍 Has result.data:', !!data?.result?.data);
            console.log('🔍 Result.data is array:', Array.isArray(data?.result?.data));
            console.log('🔍 Result.data length:', data?.result?.data?.length);
            
            let studentsData = [];
            let pageInfo = {};
            
            // PHP API returns: { code: 200, message: "", result: { data: [...], page: {...} } }
            if (data && data.code === 200 && data.result) {
                if (Array.isArray(data.result.data)) {
                    console.log('✅ PHP API Format: data.result.data with', data.result.data.length, 'records');
                    console.log('📦 API page object:', data.result.page);
                    studentsData = data.result.data;
                    
                    // IMPORTANT: Always prefer API's page object if it exists
                    if (data.result.page && typeof data.result.page === 'object') {
                        pageInfo = {
                            ...data.result.page,
                            // Ensure cur_page is set correctly
                            cur_page: data.result.page.cur_page || p
                        };
                        console.log('✅ Using API page info:', pageInfo);
                    } else {
                        // Fallback only if API doesn't provide page info
                        pageInfo = {
                            start: (p - 1) * ps,
                            total: data.result.data.length,
                            total_records: data.result.data.length,
                            cur_page: p
                        };
                        console.warn('⚠️ API did not provide page info, using fallback');
                    }
                }
            }
            // Fallback: Try other formats
            else if (data && data.result) {
                if (Array.isArray(data.result.data) && typeof data.result.page === 'object') {
                    console.log('✅ Format 1: data.result.data with', data.result.data.length, 'records');
                    studentsData = data.result.data;
                    pageInfo = data.result.page;
                } 
                else if (Array.isArray(data.result)) {
                    console.log('✅ Format 2: data.result array with', data.result.length, 'records');
                    studentsData = data.result;
                    pageInfo = {
                        start: (p - 1) * ps,
                        total: data.result.length,
                        total_records: data.result.length,
                        cur_page: p
                    };
                }
                else if (data.result.rows && Array.isArray(data.result.rows)) {
                    console.log('✅ Format 3: data.result.rows with', data.result.rows.length, 'records');
                    studentsData = data.result.rows;
                    pageInfo = data.result.page || {
                        start: (p - 1) * ps,
                        total: data.result.rows.length,
                        total_records: data.result.rows.length,
                        cur_page: p
                    };
                }
            }
            else if (data && Array.isArray(data.data)) {
                console.log('✅ Format 4: data.data with', data.data.length, 'records');
                studentsData = data.data;
                pageInfo = data.page || {
                    start: (p - 1) * ps,
                    total: data.data.length,
                    total_records: data.data.length,
                    cur_page: p
                };
            }
            else if (Array.isArray(data)) {
                console.log('✅ Format 5: data array with', data.length, 'records');
                studentsData = data;
                pageInfo = {
                    start: (p - 1) * ps,
                    total: data.length,
                    total_records: data.length,
                    cur_page: p
                };
            }
            
            if (studentsData.length > 0) {
                console.log('✅ Successfully parsed', studentsData.length, 'students (before deduplication)');
                console.log('📋 First student sample:', {
                    id: studentsData[0]?.id,
                    name: studentsData[0]?.name,
                    regno: studentsData[0]?.regno,
                    email: studentsData[0]?.email
                });
                console.log('📄 Page info:', pageInfo);
                
                // 🔥 DEDUPLICATE STUDENTS - Backend returns duplicate rows due to JOIN with files table
                // Group by student ID and aggregate file information
                const studentMap = new Map();
                studentsData.forEach(student => {
                    const id = student.id;
                    if (!studentMap.has(id)) {
                        // First occurrence - store the student
                        studentMap.set(id, { ...student });
                    } else {
                        // Duplicate - merge file information
                        const existing = studentMap.get(id);
                        
                        // Merge offer_letter_file_id (keep non-null value)
                        if (student.offer_letter_file_id && !existing.offer_letter_file_id) {
                            existing.offer_letter_file_id = student.offer_letter_file_id;
                        }
                        
                        // Merge admission_letter and admission_letter_fileid (keep non-null value)
                        if (student.admission_letter && !existing.admission_letter) {
                            existing.admission_letter = student.admission_letter;
                        }
                        if (student.admission_letter_fileid && !existing.admission_letter_fileid) {
                            existing.admission_letter_fileid = student.admission_letter_fileid;
                        }
                        
                        // Merge visa_letter and visa_letter_fileid (keep non-null value)
                        if (student.visa_letter && !existing.visa_letter) {
                            existing.visa_letter = student.visa_letter;
                        }
                        if (student.visa_letter_fileid && !existing.visa_letter_fileid) {
                            existing.visa_letter_fileid = student.visa_letter_fileid;
                        }
                    }
                });
                
                // Convert map back to array
                const deduplicatedStudents = Array.from(studentMap.values());
                console.log('🔧 Deduplicated:', studentsData.length, '→', deduplicatedStudents.length, 'students');
                
                // Check if frontend filters are set
                const frontendFilters = getUserFilters();
                console.log('🔍 Frontend user_filters from localStorage:', frontendFilters);
                
                // IMPORTANT: Don't apply frontend filtering since API already filtered
                // The API handles all filtering based on the filter criteria form
                // Frontend filtering (user_filters) is only for strategy-based restrictions
                // For now, we'll skip frontend filtering to show API results directly
                const filteredStudents = deduplicatedStudents; // Skip filterStudents() to show API results
                
                // Log filtering info (for debugging)
                if (hasFilters()) {
                    console.warn('⚠️ Frontend user_filters detected but SKIPPED:', getFilterSummary());
                    console.warn('Showing all', filteredStudents.length, 'students from API (frontend filter disabled)');
                }
                
                const finalResult = {
                    data: filteredStudents,
                    page: {
                        ...pageInfo,
                        total: filteredStudents.length,
                        // Keep the original total_records from API for pagination
                        // total_records: filteredStudents.length
                        cur_page: p || pageInfo.cur_page || 1
                    }
                };
                
                console.log('✅ Setting result state with', filteredStudents.length, 'students');
                console.log('📄 Final page info:', finalResult.page);
                setResult(finalResult);

                const now = Date.now();
                const recentUnassigned = (filteredStudents || []).some((r) => {
                    if (!r || r.assigned_to) return false;
                    const createdAt = r.created ? new Date(r.created).getTime() : 0;
                    if (!createdAt || Number.isNaN(createdAt)) return false;
                    return now - createdAt < 2 * 60 * 1000;
                });
                if (recentUnassigned && now - (autoRefreshRef.current.lastAt || 0) > 10 * 1000) {
                    autoRefreshRef.current.lastAt = now;
                    if (autoRefreshRef.current.timer) clearTimeout(autoRefreshRef.current.timer);
                    autoRefreshRef.current.timer = setTimeout(() => {
                        list(p, ps, tab);
                    }, 2500);
                }
            } else {
                console.error('❌ No students data found in response');
                console.error('Full response:', JSON.stringify(data, null, 2));
                setResult({ data: [], page: {} });
                message.warning('No students found matching the criteria');
            }
        })
        .catch(error => {
            console.error('Error loading students:', error);
            console.error('Error response:', error.response?.data);
            message.error(error.response?.data?.message || 'Failed to load students');
            setResult({ data: [], page: {} });
        })
        .finally(() => {
            util.hideLoader();
        });
    };

    // === Helper function to get master session ID ===
    const getMasterSessionId = () => {
        // Process URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const urlSessionId = urlParams.get('master_session_id');
        const urlSessionName = urlParams.get('session_name');
        const urlSession = urlParams.get('session');
        
        // Priority order: URL master_session_id > URL session_name > URL session > context session
        let sessionToUse = null;
        let sessionIdToUse = null;

        if (urlSessionId) {
            // Direct session ID from URL (highest priority)
            sessionIdToUse = parseInt(urlSessionId);
        } else if (urlSessionName) {
            // Session name from URL, need to convert to ID
            sessionToUse = urlSessionName;
        } else if (urlSession) {
            // Legacy session parameter
            sessionToUse = urlSession;
        } else {
            // Fall back to context session
            sessionToUse = selectedSession;
        }

        // Convert session to master_session_id for PHP API if we don't already have it
        if (!sessionIdToUse && sessionToUse) {
            if (typeof sessionToUse === 'object' && sessionToUse.key) {
                sessionIdToUse = sessionToUse.key;
            } else if (typeof sessionToUse === 'object' && sessionToUse.id) {
                sessionIdToUse = sessionToUse.id;
            } else if (typeof sessionToUse === 'string' && /^\d+$/.test(sessionToUse)) {
                sessionIdToUse = parseInt(sessionToUse);
            } else if (typeof sessionToUse === 'number') {
                sessionIdToUse = sessionToUse;
            }
            // If we have a session context object, try to get the key from it
            else if (selectedSession && selectedSession.key) {
                sessionIdToUse = selectedSession.key;
            }
            // Fallback: try id field
            else if (selectedSession && selectedSession.id) {
                sessionIdToUse = selectedSession.id;
            }
        }

        // Return the session ID or fallback
        if (sessionIdToUse) {
            return sessionIdToUse;
        } else {
            // Use hardcoded fallback if no session parameters
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.get('master_session_id') && !urlParams.get('session_name') && !urlParams.get('session')) {
                return 68; // Hardcoded fallback
            }
            return null;
        }
    };

    // === Upload CSV ===
    const uploadCsv = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
            message.error('Please select a valid CSV or Excel file (.csv, .xlsx, or .xls)');
            event.target.value = '';
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            message.error('File size should not exceed 5MB');
            event.target.value = '';
            return;
        }

        try {
            util.showLoader();

            // Get the master session ID
            const masterSessionId = getMasterSessionId();
            if (!masterSessionId) {
                message.error('Session ID is required for CSV upload. Please ensure you have a valid session.');
                return;
            }

            // Create FormData and append the file and session ID
            const formData = new FormData();
            formData.append('file', file);
            formData.append('master_session_id', masterSessionId);

            // Send the file directly to the import endpoint
            console.log('Sending file to import endpoint with session ID:', masterSessionId);
            const importResponse = await StudentService.importCsv(formData);

            if (importResponse?.data?.success || importResponse?.success || importResponse?.data?.status) {
                const importData = importResponse?.data?.data || importResponse?.data;
                setUploadResult(importData);
                setUploadModalVisible(true);
                // Refresh the list after successful import
                list(1, 100);
            } else {
                throw new Error(importResponse?.data?.message || importResponse?.message || 'Import failed');
            }
        } catch (error) {
            console.error('Upload/Import Error:', error);
            
            if (error.message === 'ENDPOINT_NOT_IMPLEMENTED' || error.response?.status === 404) {
                // Import endpoint not implemented yet - show upload success with warning
                message.success('File uploaded successfully to server');
                message.warning({
                    content: 'CSV import functionality is not yet available. The backend endpoint POST /student/importCsv needs to be implemented. Please contact your system administrator.',
                    duration: 8
                });
                console.log('Import endpoint not yet implemented on server - POST /student/importCsv returns 404');
            } else {
                // Other import errors - show them
                message.success('File uploaded successfully');
                const errorMsg = error.response?.data?.message || error.message || 'Failed to upload/import Excel/CSV file';
                message.error(`Import failed: ${errorMsg}`);
            }
        } finally {
            util.hideLoader();
            event.target.value = ''; // Reset file input
        }
    };

    // === Download CSV ===
    const downloadCsv = () => {
        const params = { ...sdataRef.current, action: 'Download' };

        // Get URL parameters for CSV download
        const searchParams = new URLSearchParams(location.search);
        const paymentProofParam = searchParams.get('payment_proof');
        const choiceFillingParam = searchParams.get('choice_filling');
        // const tabParam = searchParams.get('tab');

        if (paymentProofParam) {
            params.payment_proof = paymentProofParam;
        } else if (choiceFillingParam) {
            params.choice_filling = choiceFillingParam;
        } else if (isInstitute && activeTab !== 'all' && !sdataRef.current.choice_filling) {
            params.choice_filling = choiceFillingMap[activeTab];
        }

        if (sdataRef.current.choice_filling && !paymentProofParam && !choiceFillingParam) {
            params.choice_filling = sdataRef.current.choice_filling;
        }

        util.showLoader();
        StudentService.all(params)
            .then(({ data }) => {
                const records = data.result?.data || [];
                if (!Array.isArray(records) || records.length === 0) {
                    message.warning('No data available to download');
                    return;
                }
                const header = {
                    name: 'NAME',
                    regno: 'REGISTRATION NUMBER',
                    email: 'EMAIL',
                    mobile: 'MOBILE',
                    email_verified: 'EMAIL VERIFIED',
                    mobile_verified: 'MOBILE VERIFIED',
                    gender: 'GENDER',
                    assigned_to_name: 'ASSIGNED TO',
                    next_followup_date: 'NEXT FOLLOWUP DATE',
                    dob: 'DOB',
                    is_dead: 'IS DEAD',
                    country: 'COUNTRY',
                    acad_career: 'ACADEMIC CAREER',
                    discipline: 'DISCIPLINE',
                    basic_info: 'BASIC INFO DONE',
                    edu_info: 'EDUCATION INFO DONE',
                    doc_uploaded: 'DOC UPLOADED',
                    doc_verified: 'DOC VERIFIED',
                    background_info: 'BACKGROUND INFO DONE',
                    course_choice: 'CHOICE FILLING DONE',
                    reference1: 'REFERENCE1',
                    reference2: 'REFERENCE2',
                    utm_source: 'UTM SOURCE',
                    created: 'REGISTERED ON',
                    agent: 'AGENT NAME',
                    agent_code: 'AGENT CODE',
                };
                const processedRecords = records.map((v) => ({
                    ...v,
                    utm_source: v.utm?.utm_source || 'N/A',
                    mobile_verified: v.mobile_verified ? 'YES' : 'NO',
                    email_verified: v.email_verified ? 'YES' : 'NO',
                    is_dead: v.dead_on ? 'YES' : 'NO',
                    basic_info: v.basic_info_date ? 'YES' : 'NO',
                    edu_info: v.edu_info_date ? 'YES' : 'NO',
                    doc_uploaded: v.doc_uploaded_on ? 'YES' : 'NO',
                    doc_verified: v.doc_verified_on ? 'YES' : 'NO',
                    background_info: v.background_info_date ? 'YES' : 'NO',
                    course_choice: v.course_choice_date ? 'YES' : 'NO',
                }));
                const blob = util.convertToCSVBlob(processedRecords, header);
                FileSaver.saveAs(blob, `student-leads-${isInstitute ? activeTab : 'all'}.csv`);
            })
            .catch((e) => {
                console.error('Download Error:', e);
                const errorMsg = e.response?.data?.message || e.message || 'Failed to download data';
                message.error(errorMsg);
            })
            .finally(() => {
                util.hideLoader();
            });
    };

    const downloadSampleCsv = () => {
        const headers = ["Name", "Email", "Mobile", "Country", "Resident Country", "Discipline", "Academic Career", "Reg No"];
        const sampleRow = {
            name: "John Doe",
            email: "john.doe@example.com",
            mobile: "+919876543210",
            country: "India",
            resident_country: "India",
            discipline: "Engineering",
            academic_career: "Undergraduate",
            reg_no: ""
        };

        const formatRow = (row) => {
            return headers.map(header => {
                const key = header.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
                let value = row[key] || '';
                // Enclose in quotes if it contains commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(",");
        };

        const csvContent = "\uFEFF" + [headers.join(","), formatRow(sampleRow)].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "sample_students_upload.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openIssuesModal = (dtl) => {
        if (!cref.current.getIssues) return;
        setStuDtl(dtl);
        setIssueModalOpen(true);
        cref.current.getIssues(dtl.id);
    };

    // Apply filters from query string once on mount
    useEffect(() => {
        const qs = new URLSearchParams(window.location.search);
        const stage = qs.get('stage');
        
        // Clear existing filters first when URL changes
        const keysToReset = ['basic_info', 'edu_info', 'doc_uploaded', 'doc_verified', 'background_info', 'payment_proof', 'choice_filling'];
        keysToReset.forEach(key => {
            delete sdataRef.current[key];
        });
        
        console.log('Before processing URL params - sdataRef:', { ...sdataRef.current });
        
        const direct = {
            basic_info: qs.get('basic_info'),
            edu_info: qs.get('edu_info'),
            doc_uploaded: qs.get('doc_uploaded'),
            doc_verified: qs.get('doc_verified'),
            background_info: qs.get('background_info'),
            payment_proof: qs.get('payment_proof'),
            choice_filling: qs.get('choice_filling'),
        };
        Object.keys(direct).forEach(k => {
            if (direct[k]) {
                sdataRef.current[k] = direct[k];
            }
        });

        const stageMap = {
            admission_offered: { choice_filling: 'offer_Uploaded' },
            offer_accepted: { choice_filling: 'Stu_Accepted' },
            admission_rejected: { choice_filling: 'Ins_Rejected' },
            accepted_by_student: { choice_filling: 'Ins_Accepted' },
            payment_proof_uploaded: { payment_proof: 'Uploaded' },
            basic_info_completed: { basic_info: 'Yes' },
            educational_info_completed: { edu_info: 'Yes' },
            background_info_completed: { background_info: 'Yes' },
        };
        if (stage && stageMap[stage]) {
            Object.assign(sdataRef.current, stageMap[stage]);
        }
        
        console.log('URL parameters processed:', { stage, direct, 'sdataRef.current': { ...sdataRef.current } });
        console.log('Current URL search params:', window.location.search);
        
        // No need to trigger reload here since list() function now processes URL params directly
    }, [location.search]);

    // Sync URL session into SessionContext so the Header dropdown reflects the session after redirect/new tab.
    useEffect(() => {
        const qs = new URLSearchParams(location.search);
        const urlSessionId = qs.get('master_session_id');
        if (!urlSessionId) return;

        const parsedId = parseInt(urlSessionId, 10);
        if (!parsedId) return;

        if (selectedSession?.key === parsedId || selectedSession?.id === parsedId) return;

        const matched = sessions?.find((s) => Number(s?.key) === parsedId);
        if (matched) {
            setSelectedSession(matched);
            localStorage.setItem('selectedSession', JSON.stringify(matched));
        }
    }, [location.search, sessions, selectedSession, setSelectedSession]);

    // When the Header session dropdown changes, update URL and reload immediately.
    useEffect(() => {
        const handler = (e) => {
            const next = e?.detail;
            const nextId = next?.key || next?.id;
            if (!nextId) return;

            const current = new URLSearchParams(location.search);
            current.set('master_session_id', String(nextId));
            if (next?.name) current.set('session_name', String(next.name));
            current.delete('session');

            navigate({ search: current.toString() }, { replace: true });
            list(1, 100);
        };

        window.addEventListener('sessionChanged', handler);
        return () => window.removeEventListener('sessionChanged', handler);
    }, [location.search, navigate]);

    // Set initial page size to 100 on mount (before any list calls)
    useEffect(() => {
        sdataRef.current.ps = 100;
    }, []);

    // Removed hasInitialLoadRef - it was preventing reloads when filters changed

    // Initial load - only call list once when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');

        // Set active tab from URL if present
        if (tabParam && [
            'all', 
            'accepted', 
            'rejected', 
            'offered', 
            'offer_accepted', 
            'stu_rejected', 
            'choice_filled', 
            'choice_not_filled', 
            'offer-pending'
        ].includes(tabParam)) {
            setActiveTab(tabParam);
        }

        // Set up the callback for external calls
        cref.current.getStudentsList = (page, pageSize) => list(page, pageSize);
        
        // Don't call list here - let the session-dependent useEffect handle it
    }, []);

    // Load data when session is ready or URL changes
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');
        const sessionIdParam = searchParams.get('master_session_id');
        const sessionNameParam = searchParams.get('session_name');
        const sessionParam = searchParams.get('session');

        // Update tab if changed in URL
        if (
            tabParam &&
            [
                'all',
                'accepted',
                'rejected',
                'offered',
                'offer_accepted',
                'stu_rejected',
                'choice_filled',
                'choice_not_filled',
                'offer-pending'
            ].includes(tabParam)
        ) {
            setActiveTab(tabParam);
        }
// Load data if session parameters in URL, selectedSession loaded, or sessions available
        if (sessionIdParam || sessionNameParam || sessionParam) {
            console.log('✅ Session parameters found in URL, loading immediately');
            list(1, 100, tabParam || activeTab);
        } else if (selectedSession && selectedSession.key) {
            console.log('✅ Session loaded from context, calling list with session:', selectedSession);
            list(1, 100, tabParam || activeTab);
        } else if (sessions && sessions.length > 0 && !selectedSession.key) {
            // Sessions loaded but no session selected - auto-select first active session
            console.log('✅ Sessions loaded, auto-selecting first available session');
            const activeSession = sessions.find(s => s.status === 'Active') || sessions[0];
            if (activeSession && activeSession.key) {
                setSelectedSession(activeSession);
                localStorage.setItem('selectedSession', JSON.stringify(activeSession));
                // list() will be called when selectedSession updates
            }
        } else {
            console.log('⏳ Waiting for sessions to load...');
        }

    }, [selectedSession, location.search, sessions]); // Removed activeTab from dependencies

    // Handle URL changes - DISABLED: This was causing duplicate API calls
    // The second useEffect already handles URL changes via location.search dependency
    /*
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');
        const paymentProofParam = searchParams.get('payment_proof');
        const choiceFillingParam = searchParams.get('choice_filling');
        const sessionIdParam = searchParams.get('master_session_id');
        const sessionNameParam = searchParams.get('session_name');
        const sessionParam = searchParams.get('session');
        
        // Update active tab if changed in URL
        if (tabParam && [
            'all', 
            'accepted', 
            'rejected', 
            'offered', 
            'offer_accepted', 
            'stu_rejected', 
            'choice_filled', 
            'choice_not_filled', 
            'offer-pending'
        ].includes(tabParam) && tabParam !== activeTab) {
            setActiveTab(tabParam);
            // Don't call list here as it will be called in the Tabs onChange handler
        }

        // If URL parameters change (including session parameters), reload data
        if (paymentProofParam !== undefined || 
            choiceFillingParam !== undefined || 
            sessionIdParam !== undefined || 
            sessionNameParam !== undefined || 
            sessionParam !== undefined) {
            console.log('URL parameters changed, reloading data');
            list(1, 100);
        }
    }, [location.search]);
    */

    const renderTable = () => {
        const currentPage = Number(result.page.cur_page || 1) || 1;
        const pageSize = Number(sdataRef.current.ps || 100) || 100;
        const totalRecords = Number(result.page.total_records || result.page.total || result.data.length || 0);
        const startRecord = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
        const endRecord = totalRecords > 0 ? Math.min(currentPage * pageSize, totalRecords) : 0;
        
        return (
        <>
            {result.data.length > 0 && (
                <div className="d-flex align-items-center justify-content-between mb8">
                    <div className="text-secondary">
                        Showing {startRecord} - {endRecord} of{' '}
                        {totalRecords} records.
                    </div>
                    <div className="d-flex gap-2">
                        <Button type="dashed" size="small" onClick={downloadCsv}>
                            <i className="fa fa-download mr5"></i> Download CSV
                        </Button>
                    </div>
                </div>
            )}
            <div className="table-responsive" style={{ overflow: 'auto', width: '100%', height: 'calc(100vh - 310px)' }}>
                <table className="table table-bordered table-sm table-striped1 table-hover1 m-0" style={{ minWidth: '1600px' }}>
                    <thead className="thead-light text-uppercase table-text-vmid font-md">
                        <tr>
                            <th className="w20">SN</th>
                            <th className="w150">Student Detail</th>
                            <th className="w150">Country/City</th>
                            <th className="w200">Course of Interest</th>
                            <th className="w100">Register Date</th>
                            <th className="w120">Application Status</th>
                            {!isInstitute && <th className="w30"></th>}
                        </tr>
                    </thead>
                    <tbody className="table-text-top font-md">
                        {result.data.map((v, i) => (
                            <StuRow
                                key={v.id}
                                row={{ ...v, rowno: result.page.start + i + 1 }}
                                openIssuesModal={openIssuesModal}
                                cref={cref}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="d-flex tbl-foot-bx" style={{ marginTop: 12 }}>
                <AntdPaging
                    onChange={(page) => list(page, sdataRef.current.ps)}
                    onShowSizeChange={(current, size) => {
                        sdataRef.current.ps = size;
                        list(1, size);
                    }}
                    total={result.page.total_records}
                    current={result.page.cur_page}
                    pageSize={sdataRef.current.ps}
                    defaultPageSize={100}
                    showSizeChanger
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} students`}
                    pageSizeOptions={['25', '50', '100', '200', '500']}
                />
            </div>
        </>
        );
    };

    return (
        <div className="page-content" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <div className="page-head-gradient" style={{ flexDirection: 'row', justifyContent: 'space-between', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h2 style={{ justifyContent: 'flex-start' }}>
                        <i className="fa fa-graduation-cap"></i> Students
                    </h2>
                    <p className="ph-subtitle" style={{ textAlign: 'left' }}>
                        Manage and track all student applications
                    </p>
                </div>
                <div className="d-flex align-items-center ml-auto" style={{ gap: 12 }}>
                    {isClientAdmin && (
                        <div style={{ border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: 20, padding: '4px 14px', background: 'rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', height: '36px' }}>
                            <ChoiceFillingStart isDarkBackground={true} />
                        </div>
                    )}
                    {(modules['add_students'] === 1 || isAgent) && (
                        <div className="d-flex gap-2">
                            <Button 
                                type="dashed" 
                                onClick={downloadSampleCsv}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'rgba(255, 255, 255, 0.25)',
                                    color: '#fff',
                                    fontWeight: 500,
                                    borderRadius: 8,
                                    height: '36px'
                                }}
                            >
                                <i className="fa fa-download mr5"></i> Sample CSV
                            </Button>
                            <label 
                                className="ant-btn ant-btn-dashed cursor-pointer mb-0 d-flex align-items-center"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'rgba(255, 255, 255, 0.25)',
                                    color: '#fff',
                                    fontWeight: 500,
                                    borderRadius: 8,
                                    height: '36px',
                                    padding: '4px 15px'
                                }}
                            >
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={uploadCsv}
                                    style={{ display: 'none' }}
                                />
                                <i className="fa fa-upload mr5"></i> Upload CSV
                            </label>
                            {modules['add_students'] === 1 && (
                                <Button 
                                    type="primary" 
                                    onClick={() => cref.current.openStuForm()}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderRadius: 8,
                                        height: '36px',
                                        boxShadow: 'none'
                                    }}
                                >
                                    <i className="fa fa-plus mr5"></i> Add New Student
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="relative" style={{ width: '100%', maxWidth: '100%' }}>
                <div className="page-pad">
                    <div className="mb15">
                        <SearchForm
                            dataRef={sdataRef}
                            onSearch={(filters) => {
                                Object.assign(sdataRef.current, filters);
                                list(1,100);
                            }}
                        />
                    </div>
                    {/* Tabs Only for Institute */}
                    {/* {isInstitute || isClientAdmin ? (
                        <Tabs
                            activeKey={activeTab}
                            onChange={(key) => {
                                setActiveTab(key);
                                delete sdataRef.current.choice_filling; // Clear manual filter

                                // Update URL when tab changes
                                const searchParams = new URLSearchParams(location.search);
                                searchParams.set('tab', key);
                                // Remove other filters that might conflict
                                searchParams.delete('payment_proof');
                                searchParams.delete('choice_filling');
                                navigate({ search: searchParams.toString() }, { replace: true });

                                list(1, undefined, key);
                            }}
                        >
                            <TabPane tab="All" key="all">{renderTable()}</TabPane>
                            <TabPane tab="Ins_Accepted" key="accepted">{renderTable()}</TabPane>
                            <TabPane tab="Ins_Rejected" key="rejected">{renderTable()}</TabPane>
                            <TabPane tab="Offered" key="offered">{renderTable()}</TabPane>
                            <TabPane tab="Stu_Accepted" key="offer_accepted">{renderTable()}</TabPane>
                            <TabPane tab="Stu_Rejected" key="stu_rejected">
                                {renderTable()}
                            </TabPane>
                        </Tabs>
                    ) : (
                        renderTable()
                    )} */}
                    {isInstitute || isClientAdmin ? (
                        <Tabs
                            activeKey={activeTab}
                            onChange={(key) => {
                                setActiveTab(key);
                                
                                // Clear manual filters when switching tabs
                                delete sdataRef.current.choice_filling;
                                delete sdataRef.current.payment_proof;
                                delete sdataRef.current.offer_pending;

                                // Update URL when tab changes
                                const searchParams = new URLSearchParams(location.search);
                                searchParams.set('tab', key);
                                // Remove other filters that might conflict
                                searchParams.delete('payment_proof');
                                searchParams.delete('choice_filling');
                                navigate({ search: searchParams.toString() }, { replace: true });

                                list(1, undefined, key);
                            }}
                        >
                            <TabPane tab="All" key="all">{renderTable()}</TabPane>
                            <TabPane tab="Ins_Accepted" key="accepted">{renderTable()}</TabPane>
                            <TabPane tab="Ins_Rejected" key="rejected">{renderTable()}</TabPane>
                            <TabPane tab="Offer Pending" key="offer-pending">{renderTable()}</TabPane>
                            <TabPane tab="Offered" key="offered">{renderTable()}</TabPane>
                            <TabPane tab="Stu_Accepted" key="offer_accepted">{renderTable()}</TabPane>
                            <TabPane tab="Stu_Rejected" key="stu_rejected">{renderTable()}</TabPane>
                            <TabPane tab="Choice_Filled" key="choice_filled">{renderTable()}</TabPane>
                            <TabPane tab="Choice_Not_Filled" key="choice_not_filled">{renderTable()}</TabPane>
                        </Tabs>
                    ) : (
                        renderTable()
                    )}
                    {!result.data.length && <div className="no-rec">No record found</div>}
                </div>
            </div>
            {/* Modals */}
            <StuForm cref={cref} />
            <StuSendEmail cref={cref} />
            <StuSendWhatsapp cref={cref} />
            <StuFollowup cref={cref} />
            <StuConversations cref={cref} />
            <AssigntoForm cref={cref} />
            <AppliedCourses cref={cref} />
            <Modal
                title={<span>Issues - <span>{stuDtl.name}</span></span>}
                open={isIssueModalOpen}
                onCancel={() => setIssueModalOpen(false)}
                destroyOnClose
                forceRender
                maskClosable={false}
                width={1200}
                style={{ top: 20 }}
                footer={null}
            >
                <div className="cscroll" style={{ height: $(window).height() - 125 + 'px' }}>
                    <Issues cref={cref} forceStudentIssuesOnly={true} />
                </div>
            </Modal>

            {/* Bulk Upload Results Modal */}
            <Modal
                title="Bulk Upload Results"
                open={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setUploadModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={650}
            >
                {uploadResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                            <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{uploadResult.total || 0}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginTop: '4px' }}>Total Rows</div>
                            </div>
                            <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>{uploadResult.created_count || 0}</div>
                                <div style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase', marginTop: '4px' }}>Created</div>
                            </div>
                            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>{uploadResult.updated_count || 0}</div>
                                <div style={{ fontSize: '11px', color: '#1d4ed8', textTransform: 'uppercase', marginTop: '4px' }}>Updated</div>
                            </div>
                            <div style={{ padding: '10px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706' }}>{Number(uploadResult.skipped_count || 0) + Number(uploadResult.error_count || 0)}</div>
                                <div style={{ fontSize: '11px', color: '#b45309', textTransform: 'uppercase', marginTop: '4px' }}>Failed/Skipped</div>
                            </div>
                        </div>

                        {uploadResult.error_rows && uploadResult.error_rows.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px', color: '#334155' }}>
                                    Errors & Warnings ({uploadResult.error_rows.length})
                                </div>
                                <div style={{ 
                                    maxHeight: '250px', 
                                    overflowY: 'auto', 
                                    border: '1px solid #cbd5e1', 
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                                                <th style={{ padding: '8px 12px', width: '80px', fontWeight: '600', color: '#475569' }}>Row No.</th>
                                                <th style={{ padding: '8px 12px', fontWeight: '600', color: '#475569' }}>Error details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uploadResult.error_rows.map((err, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#b91c1c' }}>Row {err.row}</td>
                                                    <td style={{ padding: '8px 12px', color: '#334155' }}>{err.message}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

// === SearchForm Component ===
function SearchForm({ dataRef, onSearch }) {
    const [showFilters, setShowFilters] = useState(false);
    const [data, setData] = useState({
        from: undefined,
        to: undefined,
        gender_id: undefined,
        country_id: [],
        ac_id: [],
        discipline_id: [],
        student_status: [],
        email_verify: undefined,
        mob_verify: undefined,
        basic_info: undefined,
        edu_info: undefined,
        doc_uploaded: undefined,
        doc_verified: undefined,
        background_info: undefined,
        k: '',
        choice_filling: undefined,
        payment_proof: undefined,
        institute_id: undefined,
    });
    const [countries, setCountries] = useState([]);
    const [acadCareers, setAcadCareers] = useState([]);
    const [disciplines, setDisciplines] = useState([]);
    const [genders, setGenders] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const isInstitute = util.isInstitute() === 1;
    const isSuperAdmin = util.isAdmin() === 1 || util.isClientAdmin() === 1; // Both Super Admin and Client Admin
    
    const handleChange = (v, k) => {
            setData(prev => ({ ...prev, [k]: v }));
    };

    useEffect(() => {
        dataRef.current = { ...data };
    }, [data]);

    useEffect(() => {
        setData(prev => ({ ...prev, p: dataRef.current.p, ps: dataRef.current.ps }));
    }, [dataRef.current.p, dataRef.current.ps]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiCalls = [
                    CmasterService.allCountries({ status: 1 }),
                    CmasterService.acadCareers({ status: 1 }),
                    CmasterService.allDisciplines({ status: 1 }),
                    CmasterService.genders({ status: 1 })
                ];
                
                // Fetch institutes for Super Admin (includes both is_admin=1 and is_client_admin=1)
                const isSuperAdmin = util.isAdmin() === 1 || util.isClientAdmin() === 1;
                
                if (isSuperAdmin) {
                    apiCalls.push(InstituteService.all({ status: 1 }));
                }
                
                const results = await Promise.all(apiCalls);
                
                setCountries(results[0].data.result.data || []);
                setAcadCareers(results[1].data.result.data || []);
                setDisciplines(results[2].data.result.data || []);
                setGenders(results[3].data.result.data || []);
                
                // Set institutes if we fetched them (for Super Admin)
                if (isSuperAdmin && results[4]) {
                    const institutesList = results[4].data?.result?.data || results[4].data?.data || [];
                    setInstitutes(institutesList);
                }
            } catch (error) {
                console.error('Error loading form data:', error);
                message.error('Failed to load form data');
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderBottom: showFilters ? '1px solid #e5e7eb' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <i className="fa fa-filter" style={{ color: '#568cb1', fontSize: 13 }}></i>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Filters</span>
                    {hasFilters(data) && (
                        <span style={{ background: '#568cb1', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>Active</span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {hasFilters(data) && (
                        <button onClick={() => { setData({ from: undefined, to: undefined, gender_id: undefined, country_id: [], ac_id: [], discipline_id: [], student_status: [], email_verify: undefined, mob_verify: undefined, basic_info: undefined, edu_info: undefined, doc_uploaded: undefined, doc_verified: undefined, background_info: undefined, k: '', choice_filling: undefined, payment_proof: undefined, institute_id: undefined }); onSearch({ k: '' }); }} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            Clear All
                        </button>
                    )}
                    <button onClick={() => setShowFilters(!showFilters)} style={{ background: '#568cb1', border: 'none', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <i className={`fa fa-chevron-${showFilters ? 'up' : 'down'}`} style={{ fontSize: 10 }}></i>
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </button>
                </div>
            </div>
            {showFilters && (
                <div style={{ padding: '18px 20px', background: '#fafbfc' }}>
                    <form onSubmit={(e) => e.preventDefault()} autoComplete="off" spellCheck="false">
                        <Row gutter={[16, 16]}>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>From Date</label>
                                    <AntdDatepicker placeholder="From" format="DD MMM YYYY" value={data.from || null} onChange={(dt) => handleChange(dt, 'from')} />
                                </div>
                            </Col>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>To Date</label>
                                    <AntdDatepicker placeholder="To" format="DD MMM YYYY" value={data.to} onChange={(dt) => handleChange(dt, 'to')} />
                                </div>
                            </Col>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>Gender</label>
                                    <AntdSelect
                                        placeholder="All"
                                        allowClear
                                        options={genders.map((v) => ({ id: v.id, name: v.name }))}
                                        value={data.gender_id}
                                        onChange={(v) => handleChange(v, 'gender_id')}
                                    />
                                </div>
                            </Col>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>Country</label>
                                    <AntdSelect
                                        placeholder="Type to search..."
                                        allowClear
                                        showSearch
                                        mode="multiple"
                                        maxTagCount="responsive"
                                        options={countries.map((v) => ({ id: v.id, name: v.name }))}
                                        value={[...(data.country_id || [])]}
                                        onChange={(v) => handleChange(v, 'country_id')}
                                    />
                                </div>
                            </Col>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>Academic Career</label>
                                    <AntdSelect
                                        placeholder="All"
                                        allowClear
                                        showSearch
                                        mode="multiple"
                                        options={acadCareers.map((v) => ({ id: v.id, name: v.name }))}
                                        value={[...(data.ac_id || [])]}
                                        onChange={(v) => handleChange(v, 'ac_id')}
                                    />
                                </div>
                            </Col>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>Discipline</label>
                                    <AntdSelect
                                        placeholder="All"
                                        allowClear
                                        showSearch
                                        mode="multiple"
                                        options={disciplines.map((v) => ({ id: v.id, name: v.name }))}
                                        value={[...(data.discipline_id || [])]}
                                        onChange={(v) => handleChange(v, 'discipline_id')}
                                    />
                                </div>
                            </Col>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>Email Verification</label>
                                    <AntdSelect
                                        placeholder="All"
                                        allowClear
                                        options={['Verified', 'Not Verified']}
                                        value={data.email_verify}
                                        onChange={(v) => handleChange(v, 'email_verify')}
                                    />
                                </div>
                            </Col>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>Mobile Verification</label>
                                    <AntdSelect
                                        placeholder="All"
                                        allowClear
                                        options={['Verified', 'Not Verified']}
                                        value={data.mob_verify}
                                        onChange={(v) => handleChange(v, 'mob_verify')}
                                    />
                                </div>
                            </Col>
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>Student Status</label>
                                    <AntdSelect
                                        placeholder="All"
                                        allowClear
                                        mode="multiple"
                                        options={['ONLINE', 'OFFLINE']}
                                        value={[...(data.student_status || [])]}
                                        onChange={(v) => handleChange(v, 'student_status')}
                                    />
                                </div>
                            </Col>
                            {!isInstitute && (
                                <>
                                    <Col span="6">
                                        <div className="legend-lbl">
                                            <label>Basic Info Done?</label>
                                            <AntdSelect placeholder="All" allowClear options={['Yes', 'No']} value={data.basic_info} onChange={(v) => handleChange(v, 'basic_info')} />
                                        </div>
                                    </Col>
                                    <Col span="6">
                                        <div className="legend-lbl">
                                            <label>Educational Info Done?</label>
                                            <AntdSelect placeholder="All" allowClear options={['Yes', 'No']} value={data.edu_info} onChange={(v) => handleChange(v, 'edu_info')} />
                                        </div>
                                    </Col>
                                    <Col span="6">
                                        <div className="legend-lbl">
                                            <label>Document Uploaded?</label>
                                            <AntdSelect placeholder="All" allowClear options={['Yes', 'No']} value={data.doc_uploaded} onChange={(v) => handleChange(v, 'doc_uploaded')} />
                                        </div>
                                    </Col>
                                    <Col span="6">
                                        <div className="legend-lbl">
                                            <label>Document Verified?</label>
                                            <AntdSelect placeholder="All" allowClear options={['Yes', 'No']} value={data.doc_verified} onChange={(v) => handleChange(v, 'doc_verified')} />
                                        </div>
                                    </Col>
                                    <Col span="6">
                                        <div className="legend-lbl">
                                            <label>Background Info Done?</label>
                                            <AntdSelect placeholder="All" allowClear options={['Yes', 'No']} value={data.background_info} onChange={(v) => handleChange(v, 'background_info')} />
                                        </div>
                                    </Col>
                                </>
                            )}
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>RegNo./Name/Email/Mob</label>
                                    <Input
                                        placeholder="Search"
                                        allowClear
                                        value={data.k}
                                        onChange={(e) => handleChange(e.target.value, 'k')}
                                    />
                                </div>
                            </Col>
                            {isSuperAdmin && (
                                <Col span="6">
                                    <div className="legend-lbl">
                                        <label>Institute</label>
                                        <AntdSelect
                                            placeholder="All"
                                            allowClear
                                            showSearch
                                            options={institutes.map((v) => ({ id: v.id, name: v.name }))}
                                            value={data.institute_id}
                                            onChange={(v) => handleChange(v, 'institute_id')}
                                        />
                                    </div>
                                </Col>
                            )}
                            <Col span="6">
                                <div className="legend-lbl">
                                    <label>Payment Proof</label>
                                    <AntdSelect
                                        placeholder="All"
                                        allowClear
                                        options={['Pending', 'Uploaded', 'Acknowledged', 'Rejected']}
                                        value={data.payment_proof}
                                        onChange={(v) => handleChange(v, 'payment_proof')}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="primary" onClick={() => onSearch({ ...data })} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', border: 'none', borderRadius: 8, fontWeight: 700, height: 38, padding: '0 24px', fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                <i className="fa fa-search" style={{ marginRight: 5 }}></i>Apply Filter
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

// === ChoiceFillingStart Component ===
function ChoiceFillingStart({ isDarkBackground }) {
    const { started, loading, setChoiceFillingStarted } = useChoiceFilling();

    const save = async (val) => {
        const confirmMessage = val === 'Y'
            ? 'Are you sure you want to start choice filling?'
            : 'Are you sure you want to close choice filling?';

        Modal.confirm({
            title: 'Confirmation',
            content: confirmMessage,
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                await setChoiceFillingStarted(val);
            }
        });
    };

    return (
        <div className="my-auto d-flex align-items-center">
            <div className="pr10" style={{ color: isDarkBackground ? '#ffffff' : '#334155', fontWeight: isDarkBackground ? 500 : 600, fontSize: 13 }}>Choice Filling Started</div>
            <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
                checked={started === 'Y'}
                onChange={(checked) => save(checked ? 'Y' : 'N')}
                loading={loading}
            />
        </div>
    );
}

// === AppStatusTag Component ===
const AppStatusTag = ({ status }) => {
    const colors = {
        Pending: '#FFBF00',
        Accepted: '#26C281',
        Approved: '#26C281',
        Rejected: '#ed6b75',
    };
    if (!status) return null;
    return (
        <div
            className="uppercase text-[11px] px-2 py-[2px] rounded-lg text-center"
            style={{ color: colors[status] || '#000', border: `1px solid ${colors[status] || '#000'}` }}
        >
            {status}
        </div>
    );
};

// === AppliedCourses Component ===
function AppliedCourses({ cref }) {
    const [applied, setApplied] = useState([]);
    const [appliedDtl, setAppliedDtl] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [dtl, setDtl] = useState({});
    const [loading, setLoading] = useState(false);
    const [paymentComment, setPaymentComment] = useState('');
    const [viewOfferUrl, setViewOfferUrl] = useState(null);
    const isInstitute = util.isInstitute() === 1;
    const isClientAdmin = util.isClientAdmin() === 1;
    const lblClass1 = 'w70';
    const lblClass2 = 'w100';

    const approvedCount = (applied || []).filter((r) => String(r.adm_status) === 'Approved').length;

    const filterAppliedForInstitute = (list = []) => {
        if (!isInstitute) return list;
        const activeInstituteId = Number(sdx?.institute_id || 0);
        if (!activeInstituteId) return list;
        return list.filter(
            (course) => Number(course.institute_id) === activeInstituteId
        );
    };

    const handleCancel = () => {
        setShowModal(false);
        setAppliedDtl(null);
    };

    const appliedCourses = async (student_id) => {
        setLoading(true);
        try {
            const { data } = await StudentService.appliedCourses({ student_id });
            const courses = filterAppliedForInstitute(data.result?.data || []);
            courses.forEach((v, i) => (v.key = i));
            setApplied(courses);
        } catch (e) {
            // console.error('Error fetching applied courses:', e);
            message.error(e.message || 'Failed to fetch applied courses');
        } finally {
            setLoading(false);
        }
    };

    const handleAdmStatusClick = async ({ key }, scf_id) => {
        const currentRow = (applied || []).find((r) => String(r.scf_id) === String(scf_id));
        if (key === 'Approved') {
            if (String(currentRow?.adm_status) === 'Approved') {
                message.info('This course is already locked (Approved).');
                return;
            }
            if (approvedCount >= 3) {
                message.error('You can lock only 3 courses for a student.');
                return;
            }
        }
        setLoading(true);
        try {
            const res = await StudentService.setSCFAdmStatus({ scf_id, status: key });
            if (res.success) {
                message.success(res.message || 'Status updated successfully');
                appliedCourses(dtl.id);
            } else {
                message.error(res.message || 'Failed to update status');
            }
        } catch (e) {
            console.error('Error updating admission status:', e);
            message.error(e.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    //handle admin side unlock course logic
    const handleUnclock = (student_id, institute_courseid) => {
        setLoading(true);
        ClientService.unlockInstitudeChoices(student_id, institute_courseid)
            .then((res) => {
                console.log("Unlocked course : ", res);
                message.success('Choice unlocked successfully');
                appliedCourses(dtl.id);
            }).catch((err) => {
                console.log("Something went wrong!", err);
                message.error('Failed to unlock choice');
            }).finally(() => {
                setLoading(false);
            })
    }

    const handleInstituteStatusClick = async ({ key }, scf_id) => {
        setLoading(true);
        try {
            const res = await StudentService.setSCFInstituteStatus({ scf_id, status: key });
            if (res.success) {
                message.success(res.message || 'Status updated successfully');
                appliedCourses(dtl.id);
            } else {
                message.error(res.message || 'Failed to update status');
            }
        } catch (e) {
            console.error('Error updating institute status:', e);
            message.error(e.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const resolveClientId = async () => {
        // Prefer from modal context `dtl`
        if (dtl && dtl.client_id) return String(dtl.client_id);
        // Try to infer from currently loaded applied list
        const anyRow = applied?.[0] || null;
        if (anyRow && anyRow.client_id) return String(anyRow.client_id);
        // As a fallback, try student detail if available in this scope
        try {
            if (dtl && dtl.id) {
                const { data } = await StudentService.detail(dtl.id);
                const container = (data?.result || data?.data || data) || {};
                const found = container.client_id
                    || container?.student?.client_id
                    || container?.user?.client_id
                    || container?.lead?.client_id
                    || container?.profile?.client_id;
                if (found) return String(found);
            }
        } catch (err) { }
        return "1";
    };

    const uploadOfferLetter = async (e, scf_id) => {
        if (!util.checkPdf(e.target, 5)) return;
        setLoading(true);
        try {
            const file = e.target.files[0];
            const resolvedClientId = await resolveClientId();
            const uploadRes = await FileService.upload(file, resolvedClientId);
            // Resolve scf_id strictly by matching the student's institute_id
            let resolvedScfId = scf_id;
            let resolvedInstituteId = dtl?.institute_id;
            try {
                if (dtl?.id) {
                    const { data } = await StudentService.appliedCourses({ student_id: dtl.id });
                    const courses = data?.result?.data || [];
                    const matched = courses.find((c) => String(c.scf_id) === String(scf_id))
                        || courses.find((c) => String(c.institute_id) === String(dtl?.institute_id || ''));
                    if (matched && matched.scf_id) {
                        const normalizedInsStatus = String(matched.ins_status || '').trim().toLowerCase();
                        if (normalizedInsStatus !== 'accepted') {
                            message.error('Institute status must be Accepted before uploading offer letter.');
                            return;
                        }
                        resolvedScfId = Number(matched.scf_id);
                        resolvedInstituteId = Number(matched.institute_id);
                    } else {
                        message.error('Cannot resolve SCF for this student and institute.');
                        return;
                    }
                }
            } catch (e) {
                message.error('Failed to resolve SCF for the student.');
                return;
            }

            const res = await StudentService.setSCFUploadOfferLetter({
                scf_id: resolvedScfId,
                file_id: uploadRes.data.file_id,
                client_id: Number(resolvedClientId) || 1,
                student_id: dtl?.id || undefined,
                institute_id: Number(resolvedInstituteId) || undefined,
            });
            if (res.success) {
                message.success(res.message || 'Offer letter uploaded successfully');
                appliedCourses(dtl.id);
            } else {
                message.error(res.message || 'Failed to upload offer letter');
            }
        } catch (e) {
            console.error('Error uploading offer letter:', e);
            message.error(e.message || 'Failed to upload offer letter');
        } finally {
            e.target.value = '';
            setLoading(false);
        }
    };

    const handlePaymentAction = async (action) => {
        if (!appliedDtl || !paymentComment.trim()) {
            message.warning('Please enter remarks');
            return;
        }
        setLoading(true);
        try {
            const res = await StudentService.updatePaymentStatus({
                scf_id: appliedDtl.scf_id,
                status: action === 'acknowledge' ? 'Acknowledged' : 'Rejected',
                comments: paymentComment
            });
            if (res.success) {
                message.success(res.message || `Payment ${action}d successfully`);
                setAppliedDtl(null);
                setPaymentComment('');
                appliedCourses(dtl.id);
            } else {
                message.error(res.message || `Failed to ${action} payment`);
            }
        } catch (e) {
            console.error(`Error ${action}ing payment:`, e);
            message.error(e.message || `Failed to ${action} payment`);
        } finally {
            setLoading(false);
        }
    };

    const downloadOffer = async (url) => {
        if (!url) {
            message.error('Offer letter URL missing');
            return;
        }

        // Since the URL is already resolved by StudentService to the PHP server,
        // we can trigger a direct download using an anchor element
        try {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = url.split('/').pop() || 'offer-letter.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            message.error(error?.message || 'Failed to download offer letter');
        }
    };

    const handleViewOffer = async (row) => {
        const rawUrl = row?.offer_file_url;
        
        if (!rawUrl) {
            message.error('Offer letter URL missing');
            return;
        }

        // Since the URL is already resolved by StudentService to the PHP server,
        // we can use it directly in an iframe (no CORS issues with iframes)
        setViewOfferUrl(rawUrl);
    };

    const admStatusItems = [
        { label: <div className="cursor-pointer">Approve</div>, key: 'Approved' },
        { label: <div className="cursor-pointer">Reject</div>, key: 'Rejected' },
    ];

    const insStatusItems = [
        { label: <div className="cursor-pointer">Accept</div>, key: 'Accepted' },
        { label: <div className="cursor-pointer">Reject</div>, key: 'Rejected' },
    ];

    const cols = [
        {
            title: 'Institute Name',
            dataIndex: 'inst_name',
            width: 200,
            render: (text, row) => (
                <div>
                    <div className="uc bold600">{text}</div>
                    <div className="note-text pt3">
                        <div className="d-flex">
                            <div className={lblClass1}>Type</div>
                            <div className="bold600">: {row.inst_type}</div>
                        </div>
                        <div className="d-flex">
                            <div className={lblClass1}>State</div>
                            <div className="bold600">: {row.inst_state}</div>
                        </div>
                        <div className="d-flex">
                            <div className={lblClass1}>City</div>
                            <div className="bold600">: {row.inst_city}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Course Detail',
            dataIndex: 'specialization',
            render: (text, row) => (
                <div>
                    <div className="uc bold600">{text}</div>
                    <div className="note-text pt3">
                        <div className="d-flex">
                            <div className={lblClass2}>Course</div>
                            <div className="bold600">: {row.course}</div>
                        </div>
                        <div className="d-flex">
                            <div className={lblClass2}>Acad. Career</div>
                            <div className="bold600">: {row.ac}</div>
                        </div>
                        <div className="d-flex">
                            <div className={lblClass2}>Discipline</div>
                            <div className="bold600">: {row.discipline}</div>
                        </div>
                        <div className="d-flex">
                            <div className={lblClass2}>Eligibility Criteria</div>
                            <div className="bold600">: {row.eligibility_creteria}</div>
                        </div>
                    </div>
                    {!isInstitute && (
                        <div className="mt-2">
                            <mark>Institute Status: <span>{row.ins_status}</span></mark>
                        </div>
                    )}
                    {!!row.offer_file_url && (
                        <div className="mt-2 flex flex-col gap-2 w-[250px]">
                            <div className="flex gap-1 items-center">
                                <div className="flex gap-1 items-center text-black/50">
                                    <i className="fa-solid fa-file-pdf text-[red]"></i> Offer Letter:
                                </div>
                                <Button size="small" onClick={() => handleViewOffer(row)}>
                                    <i className="fa-sharp fa-solid fa-eye"></i>
                                    <span className="text-[11px] font-semibold uppercase">&nbsp;VIEW</span>
                                </Button>
                                <Button size="small" disabled={row.stu_status !== 'Accepted'} onClick={() => downloadOffer(row.offer_file_url)}>
                                    <i className="fa-solid fa-download"></i>
                                    <span className="text-[11px] font-semibold uppercase">&nbsp;DOWNLOAD</span>
                                </Button>
                            </div>
                            <div className="bdr rounded-[16px] px-2">
                                <span className="text-black/50">Student Status:</span> <span>{row.stu_status}</span>
                            </div>
                            <div className="bdr rounded-[16px] px-2">
                                <span className="text-black/50">Payment Status:</span> <span>{row.payment_status}</span>
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Applied On',
            width: '170px',
            render: (row) => (
                <div>
                    <div>{util.getDate(row.applied_on, 'DD MMM YYYY @ hh:mm A')}</div>
                    {!isInstitute && (
                        <div className="mt-1">
                            <div className="text-black/50 text-[11px]">Approval:</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-[100px]">
                                    <AppStatusTag status={row.adm_status} />
                                </div>
                                <Dropdown
                                    trigger={['click']}
                                    placement="bottomRight"
                                    menu={{
                                        items: admStatusItems.map((it) => {
                                            if (it.key !== 'Approved') return it;
                                            const disabled =
                                                String(row.adm_status) === 'Approved'
                                                || (approvedCount >= 3 && String(row.adm_status) !== 'Approved');
                                            return { ...it, disabled };
                                        }),
                                        onClick: (e) => handleAdmStatusClick(e, row.scf_id)
                                    }}
                                >
                                    <div className="bdr px-3 py-[2px] cursor-pointer rounded-[4px]">
                                        <DownOutlined />
                                    </div>
                                </Dropdown>
                                {isClientAdmin && (
                                    <Button
                                        onClick={() => handleUnclock(dtl.id, row.id)}
                                    >
                                        Unlock Choice
                                    </Button>
                                )}
                            </div>
                            {approvedCount >= 3 && (
                                <div className="mt-1 text-[11px] text-black/50">
                                    Locked courses limit reached (3/3).
                                </div>
                            )}
                        </div>
                    )}
                    {isInstitute && (
                        <div className="mt-1">
                            <div className="text-black/50 text-[11px]">Status:</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-[100px]">
                                    <AppStatusTag status={row.ins_status} />
                                </div>
                                {String(row.adm_status) === 'Approved' ? (
                                    <Dropdown
                                        trigger={['click']}
                                        placement="bottomRight"
                                        menu={{ items: insStatusItems, onClick: (e) => handleInstituteStatusClick(e, row.scf_id) }}
                                    >
                                        <div className="bdr px-3 py-[2px] cursor-pointer rounded-[4px]">
                                            <DownOutlined />
                                        </div>
                                    </Dropdown>
                                ) : (
                                    <div className="text-[11px] text-black/50">
                                        Waiting for admin lock
                                    </div>
                                )}
                            </div>
                            {row.ins_status === 'Accepted' && (
                                <div className="mt-1">
                                    <label className="ant-btn mt-1 w-[146px]">
                                        <input
                                            type="file"
                                            className="d-none"
                                            accept="image/*, application/pdf"
                                            onChange={(e) => uploadOfferLetter(e, row.scf_id)}
                                        />
                                        <i className="fa fa-upload"></i> Upload Offer
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    cref.current = {
        ...cref.current,
        openAppliedCourses: (dtl) => {
            setDtl(dtl);
            appliedCourses(dtl.id);
            setShowModal(true);
        },
    };

    //Handle All Unlock Choice filling
    const handleAllUnclock = (studentId) => {
        setLoading(true);
        ClientService.unlockStudentChoice(studentId)
            .then((res) => {
                message.success('All choices unlocked successfully');
                appliedCourses(dtl.id);
            }).catch((err) => {
                console.log("Something went wrong!", err);
                message.error('Failed to unlock choices');
            }).finally(() => {
                setLoading(false);
            })
    }

    // Check if user is client admin (only CLIENT ADMIN with is_client_admin=1 can unlock choice filling)
       const showUnlockButton = isClientAdmin && applied && applied.length > 0;

    return (
        <>
            <Modal
                title={<div>Applied Courses - {dtl.name} ({dtl.regno})</div>}
                open={showModal}
                onCancel={handleCancel}
                destroyOnClose
                maskClosable={false}
                width={1100}
                footer={null}
            >
                <Spin spinning={loading}>
                    {showUnlockButton && (
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                            <Button
                                onClick={() => handleAllUnclock(dtl.id)}
                                type="primary"
                                shape="round"
                                className="custom-unlock-btn"
                            >
                                Unlock All Choice Filling
                            </Button>
                        </div>
                    )}
                    <Card size="small" bordered bodyStyle={{ padding: 0 }} className="ant-table-text-top">
                        <Table size="small" bordered={false} dataSource={applied} columns={cols} pagination={false} />
                    </Card>
                </Spin>
            </Modal>
            {appliedDtl !== null && (
                <Modal
                    title={
                        <div className="flex items-center gap-4">
                            <div>Payment Proof</div>
                            <div>|</div>
                            <div className="flex items-center gap-2">
                                <div className="text-black/50">Status :</div>
                                <div style={{ color: paymentStatusColor[appliedDtl?.payment_status] }}>
                                    {appliedDtl?.payment_status}
                                </div>
                            </div>
                        </div>
                    }
                    open
                    onCancel={() => setAppliedDtl(null)}
                    destroyOnClose
                    maskClosable={false}
                    width="70%"
                    style={{ top: 20 }}
                    bodyStyle={{ height: window.innerHeight - 150, padding: 0 }}
                    footer={
                        isInstitute && (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={paymentComment}
                                    onChange={(e) => setPaymentComment(e.target.value)}
                                    placeholder="Enter remarks..."
                                    allowClear
                                />
                                <Button
                                    type="primary"
                                    onClick={() => handlePaymentAction('acknowledge')}
                                    loading={loading}
                                >
                                    Acknowledge
                                </Button>
                                <Button
                                    type="danger"
                                    onClick={() => handlePaymentAction('reject')}
                                    loading={loading}
                                >
                                    Reject
                                </Button>
                            </div>
                        )
                    }
                >
                    <iframe
                        src={appliedDtl?.payment_slip_file_url}
                        name="vofrltr"
                        title="Payment Proof"
                        style={{
                            height: '450px',
                            border: 'none',
                            width: '100%',
                            overflow: 'auto',
                        }}
                    />
                </Modal>
            )}
            {viewOfferUrl && (
                <Modal
                    title="Offer Letter"
                    open
                    onCancel={() => {
                        setViewOfferUrl(null);
                    }}
                    destroyOnClose
                    maskClosable={false}
                    width="70%"
                    footer={null}
                    style={{ top: 0 }}
                    bodyStyle={{ height: window.innerHeight - 80, padding: 0 }}
                >
                    <iframe
                        src={viewOfferUrl}
                        title="Offer Letter Preview"
                        style={{ height: '100%', width: '100%', border: 'none' }}
                    />
                </Modal>
            )}
        </>
    );
}


