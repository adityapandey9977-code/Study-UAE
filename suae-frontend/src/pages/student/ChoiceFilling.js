
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import axiosnode from '../../utils/axiosnode';
import moment from 'moment';
import FileSaver from 'file-saver';
import { FaUniversity, FaMapMarkerAlt, FaBookOpen, FaStar } from "react-icons/fa";
import { SearchOutlined } from "@ant-design/icons";
import { useChoiceFilling } from '../../contexts/ChoiceFillingContext';
import {
  Table,
  Input,
  Button,
  message,
  Modal,
  Card,
  Checkbox,
  Select,
  Row,
  Col,
  Alert,
  Result,
  Dropdown,
  Tag
} from 'antd';
import { SmileOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import StudentService from '../../services/StudentService';
import CmasterService from '../../services/CmasterService';
import ClientService from '../../services/ClientService';
import util from '../../utils/util';
import { AntdSelect, AntdPaging } from '../../utils/Antd';
import InstituteService from '../../services/InstituteService';
import { useContext } from "react";
import { SessionContext } from "../../context/SessionContext";
const { confirm } = Modal;

export default function ChoiceFilling({ stuDtl, setStuDtl }) {
  const { started: cfStarted, closed: cfClosed } = useChoiceFilling();
  const isStudent = util.isStudent() === 1;
  const [applied, setApplied] = useState([]);
  const [appliedCounter, setAppliedCounter] = useState(0);
  const [viewSelectedModal, setViewSelectedModal] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [result, setResult] = useState({ data: [], page: {} });
  const [isTableLoading, setTableLoading] = useState(false);
  const sdataRef = useRef({ p: 1, ps: 100 });
  const formRef = useRef({});
  const lblClass1 = 'w70';
  const lblClass2 = 'w100';
  const [selectedCoursesLS, setSelectedCoursesLS] = useState([]);
  const [checkedCourses, setCheckedCourses] = useState([]);
  const [modalFilter, setModalFilter] = useState({
    inst_type: undefined,
    ac: undefined,
    discipline: undefined,
    search: '',
  });
  // ✅ NEW: Student country and blacklist tracking
  const [studentCountry, setStudentCountry] = useState("");
  const [blockedInstituteIds, setBlockedInstituteIds] = useState(new Set());
  // New: College modal states
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);
  const [selectedCollegeCourses, setSelectedCollegeCourses] = useState([]);
  const [selectedCollegeName, setSelectedCollegeName] = useState('');
  // Filter states for college modal
  const [courseNameFilter, setCourseNameFilter] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const [filteredCollegeCourses, setFilteredCollegeCourses] = useState([]);
  // Master data
  const [academicCareers, setAcademicCareers] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [disciplineName, setDisciplineName] = useState('');
  //for naac
  const [instituteDetails, setInstituteDetails] = useState({});

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [badgeCfg, setBadgeCfg] = useState({});
  const [featuredCustomText, setFeaturedCustomText] = useState("");

  // Course limit state - replaces hasLocked
  const [courseLimit, setCourseLimit] = useState({
    status: "allowed", // "allowed" or "blocked"
    filled: 0,        // number of courses already applied
    remaining: 3      // remaining courses that can be applied
  });
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [hasLockedChoices, setHasLockedChoices] = useState(false);
  const { activeSession } = useContext(SessionContext);
  const [featuredInstitutes, setFeaturedInstitutes] = useState([]);

  const courseCountByInstitute = useMemo(() => {
    const map = {};
    (result?.data || []).forEach((row) => {
      if (!row?.inst_name) return;
      if (activeSession && row?.session !== activeSession) return;
      map[row.inst_name] = (map[row.inst_name] || 0) + 1;
    });
    return map;
  }, [result?.data, activeSession]);

  const collegeCourseNameOptions = useMemo(() => {
    const set = new Set();
    (selectedCollegeCourses || []).forEach((c) => {
      const name = (c?.course || '').trim();
      if (name) set.add(name);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ label: name, value: name }));
  }, [selectedCollegeCourses]);

  const collegeDisciplineOptions = useMemo(() => {
    const set = new Set();
    (selectedCollegeCourses || []).forEach((c) => {
      const name = (c?.discipline || '').trim();
      if (name) set.add(name);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ label: name, value: name }));
  }, [selectedCollegeCourses]);

  // Fetch top 5 institutes for student
  //   useEffect(() => {
  //   if (!stuDtl?.id || !activeSession) return;

  //   StudentService.getTopInstitutesForStudent({
  //     student_id: stuDtl.id,
  //     session: activeSession,
  //     limit: 5,
  //   })
  //     .then((res) => {
  //       console.log("✅ Top Institutes API Response:", res);

  //       // ✅ Correctly extract list
  //       const list =
  //         Array.isArray(res?.data?.institutes)
  //           ? res.data.institutes
  //           : Array.isArray(res?.data)
  //           ? res.data
  //           : [];

  //       if (list.length === 0) {
  //         setFeaturedInstitutes([]);
  //         return;
  //       }

  //       // Group by institute
  //       const byInstitute = new Map();
  //       list.forEach((it) => {
  //         const key = it.institute_id || it.inst_id || it.id;
  //         if (!key) return;
  //         if (!byInstitute.has(key)) {
  //           byInstitute.set(key, {
  //             institute_id: it.institute_id,
  //             inst_name: it.institute_name,
  //             inst_type: it.institute_type,
  //             inst_city: it.city || it.city_name || "",
  //             inst_state: it.state || it.state_name || it.state_id || "",
  //             nirf_rank: it.nirf_rank,
  //             courses: [],
  //           });
  //         }
  //         const bucket = byInstitute.get(key);
  //         bucket.courses.push({
  //           id: it.institute_course_id || it.course_id || it.id,
  //           specialization:
  //             it.specialization_name || it.specialization || "",
  //           course: it.course_name || it.course || "",
  //           session: it.session,
  //         });
  //       });

  //       const normalized = Array.from(byInstitute.values()).slice(0, 5);
  //       setFeaturedInstitutes(normalized);
  //     })
  //     .catch(() => message.error("Failed to load featured institutes"));
  // }, [stuDtl?.id, activeSession]);

  // ✅ Fetch Top 5 Institutes for Student (Fixed)
  useEffect(() => {
    if (!stuDtl?.id || !activeSession) return;

    StudentService.getTopInstitutesForStudent({
      student_id: stuDtl.id,
      session: activeSession,
      limit: 5,
    })
      .then((res) => {
        console.log("✅ Top Institutes API Response:", res);

        // Correctly access path (res.data.institutes)
        const institutes = Array.isArray(res?.data?.institutes)
          ? res.data.institutes
          : [];

        if (institutes.length === 0) {
          setFeaturedInstitutes([]);
          return;
        }

        // Group by institute_id
        const grouped = new Map();

        institutes.forEach((it) => {
          const id = it.institute_id;
          if (!grouped.has(id)) {
            grouped.set(id, {
              institute_id: id,
              inst_name: it.institute_name,
              inst_type: it.institute_type,
              inst_city: it.city || "",
              inst_state: it.state_id || "",
              nirf_rank: it.nirf_rank || "",
              courses: [],
            });
          }

          grouped.get(id).courses.push({
            id: it.institute_course_id,
            course_name: it.course_name,
            specialization_name: it.specialization_name,
            discipline_name: it.discipline_name, // ✅ fix
            session: it.session,
          });
        });

        const finalList = Array.from(grouped.values()).slice(0, 5);
        setFeaturedInstitutes(finalList);

        console.log("🎯 Normalized Featured Institutes:", finalList);
      })
      .catch((err) => {
        console.error("❌ Failed to load featured institutes:", err);
        message.error("Failed to load featured institutes");
      });
  }, [stuDtl?.id, activeSession, stuDtl?.discipline_id, stuDtl?.ac_id]);

  // ✅ When activeSession changes, re-fetch institutes
  useEffect(() => {
    if (!activeSession) return

    // Re-fetch institutes for the current session
    list();
  }, [activeSession]);

  // Load super-admin configured recommendation badge settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recommendation-badge-config');
      setBadgeCfg(raw ? JSON.parse(raw) : {});
    } catch {
      setBadgeCfg({});
    }
  }, []);

  useEffect(() => {
    const onConfigUpdated = (e) => {
      try {
        const cfg = e?.detail ?? JSON.parse(localStorage.getItem('recommendation-badge-config')) ?? {};
        setBadgeCfg(cfg || {});
      } catch {
        setBadgeCfg({});
      }
    };

    const onStorage = (e) => {
      if (e.key === 'recommendation-badge-config') {
        try {
          setBadgeCfg(e.newValue ? JSON.parse(e.newValue) : {});
        } catch {
          setBadgeCfg({});
        }
      }
    };

    window.addEventListener('recommendation-badge-config-updated', onConfigUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('recommendation-badge-config-updated', onConfigUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!stuDtl?.id) return;

    StudentService.appliedCourses({ student_id: stuDtl.id })
      .then(({ data }) => {
        const list = (data && data.result && data.result.data) ? data.result.data : [];
        const normalized = Array.isArray(list) ? list : [];
        setApplied(normalized);
        console.log("applied", normalized)
      })
      .catch(() => {
        message.error('Failed to load applied courses');
      });
  }, [stuDtl?.id]);

  const handleAppliedCourses = (stuDtl) => {
    if (!stuDtl?.id) return;

    StudentService.appliedCourses({ student_id: stuDtl.id })
      .then(({ data }) => {
        const list = (data && data.result && data.result.data) ? data.result.data : [];
        const normalized = Array.isArray(list) ? list : [];
        setApplied(normalized);
        console.log("applied", normalized)
      })
      .catch(() => {
        message.error('Failed to load applied courses');
      });
  }

  // ✅ Fetch details for ALL institutes (including NAAC)
  useEffect(() => {
    if (!result.data || result.data.length === 0) return;
    const institutes = result.data.filter(row => row.isFirst && row.institute_id);
    const uniqueInstitutes = Array.from(
      new Map(institutes.map(inst => [inst.institute_id, inst])).values()
    );
    const detailPromises = uniqueInstitutes.map(async (institute) => {
      try {
        const res = await InstituteService.detail(institute.institute_id);
        if (res.data?.code === 200 && res.data?.result) {
          setInstituteDetails(prev => ({
            ...prev,
            [institute.institute_id]: res.data.result
          }));
        } else {
          console.warn(`❌ No data for institute ID: ${institute.institute_id}`, res);
        }
      } catch (err) {
        console.error(`Failed to fetch detail for institute ID: ${institute.institute_id}`, err);
      }
    });
    Promise.all(detailPromises);
  }, [result.data]);

  // ✅ Fetch student's country once
  useEffect(() => {
    const fetchStudentCountry = async () => {
      try {
        const res = await CmasterService.getStuCountryDetail();
        if (res.data?.country) {
          setStudentCountry(res.data.resident_country);
        }
      } catch (err) {
        console.error("Failed to load student country", err);
      }
    };
    fetchStudentCountry();
  }, []);

  useEffect(() => {
    const isInstitute = localStorage.getItem('is_institute') === '1';
    if (!isInstitute) return;
    if (!studentCountry || !result.data || result.data.length === 0) return;

    const fetchBlacklistData = async () => {
      const institutes = result.data.filter(
        (row) => row.isFirst && row.institute_id
      );
      const uniqueInstitutes = Array.from(
        new Map(institutes.map((inst) => [inst.institute_id, inst])).values()
      );

      // Temporary storage for blocked IDs
      const blockedIds = new Set();

      // Check blacklist for each institute
      await Promise.all(
        uniqueInstitutes.map(async (institute) => {
          try {
            const res = await CmasterService.showAllBlacklistedCountries({
              institute_id: institute.institute_id,
            });

            if (res.data?.code === 200 && Array.isArray(res.data.data)) {
              const isBlocked = res.data.data.some(
                (c) =>
                  c.country_name?.toLowerCase() === studentCountry.toLowerCase()
              );

              if (isBlocked) {
                blockedIds.add(institute.institute_id); // ✅ we store blocked IDs locally
              }
            }
          } catch (err) {
            console.error(
              `Failed to check blacklist for ${institute.inst_name}`,
              err
            );
          }
        })
      );

      // ✅ After all calls finish, update React state once
      setBlockedInstituteIds(blockedIds);
    };

    fetchBlacklistData();
  }, [studentCountry, result.data]);

  // Load academic careers and disciplines
  useEffect(() => {
    CmasterService.acadCareers({ status: 1 })
      .then((res) => {
        const list = Array.isArray(res?.data?.result?.data) ? res.data.result.data : [];
        setAcademicCareers(list);
      })
      .catch(() => setAcademicCareers([]));
    CmasterService.allDisciplines({ status: 1 })
      .then((res) => {
        const list = Array.isArray(res?.data?.result?.data) ? res.data.result.data : [];
        setDisciplines(list);
        if (stuDtl.discipline_id) {
          const disc = list.find(d => d.id === stuDtl.discipline_id);
          setDisciplineName(disc?.name || '');
        }
      })
      .catch(() => setDisciplines([]));
  }, [stuDtl.discipline_id]);

  // Sync selected courses from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('selectedCourses')) || [];
      setSelectedCoursesLS(Array.isArray(saved) ? saved : []);
    } catch (e) {
      localStorage.setItem('selectedCourses', '[]');
      setSelectedCoursesLS([]);
    }
    // Ensure current-session selections start fresh
    setCheckedCourses([]);
  }, [viewSelectedModal, stuDtl?.id]);

  // Load institute courses
  useEffect(() => {
    if (!stuDtl?.id || !activeSession) return;
    sdataRef.current.student_id = stuDtl.id;
    sdataRef.current.session = activeSession;
    sdataRef.current.ps = 1000;

    StudentService.instituteCourses(sdataRef.current)
      .then(({ data }) => {
        const groupedData = groupByInstituteWithCourses(data.result.data);
        groupedData.forEach((v, i) => {
          v.key = i;
        });
        setResult({ ...data.result, data: groupedData });
        const instituteData = groupedData
          .filter((row) => row.isFirst)
          .map((row) => ({
            inst_name: row.inst_name,
            inst_type: row.inst_type,
            inst_state: row.inst_state,
            inst_city: row.inst_city,
          }));
        setInstitutes(instituteData);
      })
      .catch((err) => {
        message.error('Failed to load institutes.');
      });
  }, [stuDtl?.id, activeSession]);

  // Get student country
  const groupByInstituteWithCourses = (data) => {
    const grouped = {};
    data.forEach((item) => {
      if (!grouped[item.inst_name]) grouped[item.inst_name] = [];
      grouped[item.inst_name].push(item);
    });
    const result = [];
    Object.entries(grouped).forEach(([inst_name, group]) => {
      group.forEach((item, idx) => {
        result.push({
          ...item,
          inst_name_rowSpan: idx === 0 ? group.length : 0,
          courses: group.map((c) => ({
            value: c.id,
            label: c.specialization,
          })),
          isFirst: idx === 0,
        });
      });
    });
    return result;
  };

  const [selectedCourses, setSelectedCourses] = useState({});
  const handleCourseChange = (inst_name, course_id) => {
    setSelectedCourses((prev) => ({
      ...prev,
      [inst_name]: course_id,
    }));
  };

  const handleAddToSelection = (sourceRow, courseObj) => {
    let row = sourceRow;
    let course = courseObj;
    if (!course) {
      course = sourceRow;
      row = {
        inst_name: course.inst_name,
        inst_type: course.inst_type,
        inst_state: course.inst_state,
        inst_city: course.inst_city,
      };
    }

    // Check if user has reached course limit
    if (courseLimit.status === "blocked") {
      console.log("334")
      message.warning('You have reached the maximum limit of 3 courses.');
      return;
    }

    const selected = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    const isAlreadyAdded = selected.some((c) => c.course.id === course.id);
    if (isAlreadyAdded) {
      message.info('This course is already in your selection.');
      return;
    }

    if (selected.length >= 10) {
      message.warning('You can add up to 10 courses only.');
      return;
    }

    const selectedData = {
      institute: {
        name: row.inst_name,
        type: row.inst_type,
        state: row.inst_state,
        city: row.inst_city,
      },
      course: {
        id: course.id,
        name: course.course,
        specialization: course.specialization,
        ac: course.ac,
        discipline: course.discipline,
        eligibility: course.eligibility_creteria,
      },
    };

    const updatedSelection = [...selected, selectedData];
    localStorage.setItem('selectedCourses', JSON.stringify(updatedSelection));
    setSelectedCoursesLS(updatedSelection);
    message.success('Course added to selection!');
  };

  // Filter logic for modal
  const filteredSelectedCourses = selectedCoursesLS.filter((course) => {
    let match = true;
    if (modalFilter.inst_type) {
      match = match && course.institute.type === modalFilter.inst_type;
    }
    if (modalFilter.ac) {
      match = match && course.course.ac === modalFilter.ac;
    }
    if (modalFilter.discipline) {
      match = match && course.course.discipline === modalFilter.discipline;
    }
    if (modalFilter.search) {
      const searchLower = modalFilter.search.toLowerCase();
      match =
        match &&
        (course.institute.name.toLowerCase().includes(searchLower) ||
          course.course.name.toLowerCase().includes(searchLower) ||
          course.course.specialization.toLowerCase().includes(searchLower));
    }
    return match;
  });

  // const list = (p, ps) => {
  //   setTableLoading(true);
  //   sdataRef.current.p = p || 1;
  //   sdataRef.current.ps = 1000 || sdataRef.current.ps;
  //   sdataRef.current.student_id = stuDtl.id;
  //   StudentService.instituteCourses(sdataRef.current)
  //     .then(({ data }) => {
  //       const groupedData = groupByInstituteWithCourses(data.result.data);
  //       groupedData.forEach((v, i) => {
  //         v.key = i;
  //       });
  //       setResult({ ...data.result, data: groupedData });
  //     })
  //     .catch((e) => {
  //       message.error(e.message);
  //     })
  //     .finally(() => {
  //       setTableLoading(false);
  //     });
  // };

  const list = (p, ps) => {
    setTableLoading(true);
    sdataRef.current.p = p || 1;
    sdataRef.current.ps = 1000 || sdataRef.current.ps;
    sdataRef.current.student_id = stuDtl.id;
    sdataRef.current.session = activeSession;   // ✅ added line

    StudentService.instituteCourses(sdataRef.current)
      .then(({ data }) => {
        const groupedData = groupByInstituteWithCourses(data.result.data);
        groupedData.forEach((v, i) => {
          v.key = i;
        });
        setResult({ ...data.result, data: groupedData });
      })
      .catch((e) => {
        message.error(e.message);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  useEffect(() => {
    list();

    // Fetch course limit
    if (stuDtl?.id) {
      setLoadingLimit(true);
      ClientService.checkStudentCourseLimit(stuDtl.id)
        .then((res) => {
          if (res.data) {
            console.log("fetch Course limit", res.data)
            setCourseLimit({
              status: res.data.status || "allowed",
              filled: res.data.filled || 0,
              remaining: res.data.remaining || 3
            });
            
            // Check if user has locked choices (has applied at least one course)
            if (res.data.filled > 0) {
              setHasLockedChoices(true);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch course limit:", err);
          setCourseLimit({
            status: "allowed",
            filled: 0,
            remaining: 3
          });
        })
        .finally(() => {
          setLoadingLimit(false);
        });
    }

    return () => message.destroy();
  }, [stuDtl?.id]);

  const handleApplySelectedCourses = () => {
    if (!isStudent) {
      message.error('This action is available only for students.');
      return;
    }
    // 1️⃣ Validate selected courses
    if (!Array.isArray(checkedCourses) || checkedCourses.length === 0) {
      message.warning('Please select at least one course.');
      return;
    }

    // Check if applying these courses would exceed the limit
    if (checkedCourses.length > courseLimit.remaining) {
      message.error(`You can only apply to ${courseLimit.remaining} more course(s).`);
      return;
    }

    // Ensure total doesn't exceed 3 courses
    if (courseLimit.filled + checkedCourses.length > 3) {
      message.error(
        `You can only have a total of 3 courses. You have ${courseLimit.filled} already applied and are trying to apply ${checkedCourses.length} more.`
      );
      return;
    }

    confirm({
      title: `Confirm Submit ${checkedCourses.length} Choice(s)?`,
      content: 'Once submitted, your choices will be sent to admin for locking.',
      okText: 'Submit Choices',
      cancelText: 'Cancel',
      onOk: () => {
        util.showLoader();
        handleAppliedCourses(stuDtl);

        // 3️⃣ Prepare payloads for API
        const payloads = checkedCourses.map(c => ({
          student_id: stuDtl.id,
          institute_course_id: c.course.id,
        }));

        Promise.all(payloads.map((payload) => StudentService.saveStudentChoiceFillings(payload)))
          .then((responses) => {
            message.success('Choices submitted successfully!');

            // 5️⃣ Clear local selection and modal
            localStorage.removeItem('selectedCourses');
            setSelectedCoursesLS([]);
            setCheckedCourses([]);
            setViewSelectedModal(false);
            list();

            // Lock the panel after first submission
            setHasLockedChoices(true);

            // Refresh course limit after applying
            if (stuDtl?.id) {
              StudentService.appliedCourses({ student_id: stuDtl.id })
                .then(({ data }) => {
                  setApplied(data.result.data || [])
                  console.log("applied", data.result.data)
                })
                .catch(err => console.error('Failed to fetch applied courses:', err));

              ClientService.checkStudentCourseLimit(stuDtl.id)
                .then(res => {
                  if (res.data) {
                    console.log("fetch Course limit", res.data)
                    setCourseLimit({
                      status: res.data.status || 'allowed',
                      filled: res.data.filled || 0,
                      remaining: res.data.remaining || 3,
                    });
                  }
                })
                .catch(err => console.error('Failed to fetch updated course limit:', err));
            }

            const last = responses[responses.length - 1]?.data;
            if (last?.course_choice_date) {
              setStuDtl({ ...stuDtl, course_choice_date: last.course_choice_date });
            }
          })
          .catch(e => {
            console.error('Error saving choice fillings:', e);
            const errorMessage = e.response?.data?.message || e.message || 'Failed to submit choices.';
            message.error(errorMessage);
          })
          .finally(() => util.hideLoader());
      },
    });
  };

  // const openCollegeModal = (row) => {
  //   // Prevent opening if course limit is blocked
  //   if (courseLimit.status === "blocked") {
  //     message.warning('You have reached the maximum limit of 3 courses.');
  //     return;
  //   }

  //   const courses = result.data.filter((item) => item.inst_name === row.inst_name);
  //   setSelectedCollegeName(row.inst_name);
  //   setSelectedCollegeCourses(courses);
  //   setCollegeModalVisible(true);
  // };

  const openCollegeModal = (row) => {
    // Prevent opening if course limit is blocked
    if (courseLimit.status === "blocked") {
      console.log("577")
      message.warning('You have reached the maximum limit of 3 courses.');
      return;
    }

    // ✅ Filter by both institute and active session
    const courses = result.data.filter(
      (item) =>
        item.inst_name === row.inst_name &&
        item.session === activeSession
    );

    setSelectedCollegeName(row.inst_name);
    setSelectedCollegeCourses(courses);
    setCollegeModalVisible(true);
  };

  // 🆕 Handle click on featured institute
  // const handleFeaturedInstituteClick = (inst) => {
  //   // Prevent if no courses available
  //   if (!inst.courses || inst.courses.length === 0) {
  //     message.info("No courses found for this institute.");
  //     return;
  //   }

  //   // Prevent if user already reached limit
  //   if (courseLimit.status === "blocked") {
  //     console.log("604")
  //     message.warning("You have reached the maximum limit of 3 courses.");
  //     return;
  //   }

  //   // ✅ Normalize and open same modal
  //   setSelectedCollegeName(inst.inst_name);
  //   setSelectedCollegeCourses(inst.courses);
  //   setCollegeModalVisible(true);
  // };
  const handleFeaturedInstituteClick = (inst) => {
    if (!inst.courses || inst.courses.length === 0) {
      message.info("No courses found for this institute.");
      return;
    }

    const normalizedCourses = inst.courses.map((c) => ({
      id: c.id || c.institute_course_id || "",
      inst_name: inst.inst_name,
      specialization: c.specialization_name || "N/A",
      course: c.course_name || "N/A",
      discipline: c.discipline_name || "N/A", // ✅ fixed
      eligibility_creteria: c.eligibility_creteria || "Not specified",
      ac:
        c.ac ||
        (c.course_name?.toLowerCase().includes("m.") ||
          c.course_name?.toLowerCase().includes("ma") ||
          c.course_name?.toLowerCase().includes("msc")
          ? "PG"
          : "UG"),
      applied_status: 0,
    }));

    setSelectedCollegeName(inst.inst_name);
    setSelectedCollegeCourses(normalizedCourses);
    setCollegeModalVisible(true);
  };

  const [searchTerm, setSearchTerm] = useState("");

  // 🔷 Dynamic Recommended Courses based on student's discipline
  //  useEffect(() => {
  //   if (!stuDtl?.id) return; // make sure student_id exists

  //   const fetchFeatured = async () => {
  //     try {
  //       const res = await StudentService.getFeaturedListingsForStudent({
  //         student_id: stuDtl.id,
  //       });

  //       if (res.success) {
  //         console.log("✅ Featured API Response:", res);
  //         setRecommendedCourses(res.data ? [res.data.institute_course] : []);
  //         setFeaturedInstitutes(res.suggestions || []);
  //       }
  //     } catch (err) {
  //       console.error("❌ Failed to fetch featured listings:", err);
  //     }
  //   };

  //   fetchFeatured();
  // }, [stuDtl?.id]);
  // ✅ Fetch Recommended Courses for Student
  useEffect(() => {
    if (!stuDtl?.id || !activeSession) return;

    StudentService.getFeaturedListingsForStudent({
      student_id: stuDtl.id,
      session: activeSession,
    })
      .then((res) => {
        console.log("✅ Recommended API Response:", res);

        const suggestions = Array.isArray(res?.suggestions)
          ? res.suggestions
          : [];

        const featured = res?.data?.institute_course || null;
        const first = featured || suggestions[0] || null;

        setFeaturedCustomText(res?.data?.custom_text || "");

        if (first) {
          setRecommendedCourses([
            {
              specialization_name: first.specialization_name,
              institute_name: first.institute_name,
              course_name: first.course_name,
            },
          ]);
        } else {
          setRecommendedCourses([]);
          setFeaturedCustomText("");
        }
      })
      .catch((err) => {
        console.error("❌ Failed to fetch recommended courses:", err);
      });
  }, [stuDtl?.id, activeSession, stuDtl?.discipline_id, stuDtl?.ac_id]);

  // Reset filters when modal opens
  useEffect(() => {
    if (collegeModalVisible) {
      setFilteredCollegeCourses(selectedCollegeCourses);
      setCourseNameFilter("");
      setDisciplineFilter("");
    }
  }, [collegeModalVisible, selectedCollegeCourses]);

  // Apply filter when button clicked
  const handleApplyFilter = () => {
    const filtered = selectedCollegeCourses.filter((course) => {
      const matchesName = course.course
        ?.toLowerCase()
        .includes(courseNameFilter.toLowerCase());
      const matchesDiscipline = course.discipline
        ?.toLowerCase()
        .includes(disciplineFilter.toLowerCase());
      return matchesName && matchesDiscipline;
    });
    setFilteredCollegeCourses(filtered);
  };

  // Show loading state while fetching course limit
  if (loadingLimit) {
    return (
      <div className="page-content1 flex items-center justify-center h-64">
        <Result icon={<SmileOutlined />} title="Loading course limit information..." />
      </div>
    );
  }

  // Check if choice filling is locked
  if (stuDtl.course_choice_date && courseLimit.status === "blocked") {
    return (
      <div className="page-content1">
        <AppliedCoursesInfo stuDtl={stuDtl} applied={applied || []} />
        <div className="page-pad1">
          <Alert
            type="success"
            message="Choice Filling Completed"
            description={`Your choices were locked on ${util.getDate(stuDtl.course_choice_date, 'DD MMM YYYY @ hh:mm A')}. No further changes are allowed.`}
            showIcon
          />
        </div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="page-content1">
        <AppliedCoursesInfo stuDtl={stuDtl} applied={applied || []} />
        <div className="page-pad1">
          <Alert message="Course selection is available only for students." type="info" showIcon={false} />
        </div>
      </div>
    );
  }

  // If user has locked choices by clicking "Proceed with Choice Lock" once
  if (hasLockedChoices) {
    return (
      <div className="page-content1">
        <AppliedCoursesInfo stuDtl={stuDtl} applied={applied || []} />
        <div className="page-pad1">
          <Card bordered className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3 text-blue-800">
              <i className="fa fa-lock text-2xl"></i>
              <div>
                <div className="font-semibold">Choice Filling Locked</div>
                <div className="text-sm">
                  You have submitted your choices. The panel is now locked and you cannot select more courses.
                </div>
                <div className="text-sm mt-1">
                  Total Applied: {courseLimit.filled} course(s)
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If course limit >= 3, only show AppliedCoursesInfo
  if (courseLimit.filled >= 3) {
    console.log("668")
    console.log("courseLimit", courseLimit)
    return (
      <div className="page-content1">
        <AppliedCoursesInfo stuDtl={stuDtl} applied={applied || []} />
        <div className="page-pad1">
          <Card bordered className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <i className="fa fa-check-circle text-2xl"></i>
              <div>
                <div className="font-semibold">You have reached the maximum limit of 3 courses!</div>
                <div className="text-sm">
                  Total Applied: {courseLimit.filled} courses
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content1">

      <AppliedCoursesInfo stuDtl={stuDtl} applied={applied || []} />

      <Row gutter={[16, 16]} align="stretch">
        {/* Instructions Card */}
        <Col xs={24} md={24}>
          <Card
            title="Instructions :"
            bordered
            size="small"
            className="mb-3"
            headStyle={{ fontSize: '14px', padding: '8px 12px' }}
            bodyStyle={{ padding: '10px' }}
            style={{ height: "100%" }}
          >
            <ul className="list-disc pl-4 space-y-1 text-red-400 text-sm">
              <li>Click "Select" to add the course to your list.</li>
              <li>You can select a maximum of 10 courses at a time.</li>
              <li>You can apply maximum {courseLimit.remaining} more course(s) (Total limit: 3).</li>
            </ul>
          </Card>
        </Col>
      </Row>

      {/* View Selected Button */}
      <div className="mb10 mt-2">
        {selectedCoursesLS.length > 0 ? (
          <Button
            type="primary"
            onClick={() => {
              const selected = JSON.parse(localStorage.getItem('selectedCourses')) || [];
              if (!Array.isArray(selected) || selected.length === 0) {
                message.info('No course selected yet.');
                return;
              }
              setCheckedCourses([]);
              setViewSelectedModal(true);
            }}
            className="blink-button"
          >
            Proceed with Choice Lock
          </Button>
        ) : (
          <p className="text-gray-500 italic text-sm">
            No courses selected yet.
          </p>
        )}
      </div>

      {/* ✅ View Selected Courses Modal */}
      <Modal
        title="Selected Courses"
        open={viewSelectedModal}
        onCancel={() => setViewSelectedModal(false)}
        destroyOnClose
        maskClosable={false}
        width="80%"
        footer={[
          <Button key="close" onClick={() => setViewSelectedModal(false)}>
            Close
          </Button>,
          <Button
            key="apply"
            type="primary"
            className="bg-blue-700"
            disabled={
              !Array.isArray(checkedCourses) ||
              checkedCourses.length === 0 ||
              courseLimit.filled + checkedCourses.length > 3
            }
            onClick={handleApplySelectedCourses}
          >
            Submit {Array.isArray(checkedCourses) ? checkedCourses.length : 0} Choice(s)
          </Button>,
        ]}
      >
        <div className="mb-3">
          {(() => {
            const remainingSlots = Math.max(0, 3 - (courseLimit.filled || 0));
            return (
              <>
                <p className="text-red-700 font-medium">
                  Note: You can submit only <strong>{remainingSlots} more choice(s)</strong> (Total limit: 3).
                </p>
                {courseLimit.filled > 0 && (
                  <p className="text-orange-600">
                    You have already applied to {courseLimit.filled} course(s).
                  </p>
                )}
              </>
            );
          })()}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <Input
            size="large"
            placeholder="Search by Course or Institute..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!rounded-lg !border-gray-300 hover:!border-blue-400 focus:!border-blue-500 focus:!shadow-md transition-all"
          />
        </div>

        {/* Courses List */}
        {(() => {
          const filteredData = filteredSelectedCourses.filter((data) => {
            if (!searchTerm.trim()) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
              data.institute.name.toLowerCase().includes(searchLower) ||
              (data.course.name && data.course.name.toLowerCase().includes(searchLower)) ||
              (data.course.specialization && data.course.specialization.toLowerCase().includes(searchLower))
            );
          });

          if (filteredData.length === 0) {
            return (
              <div className="text-center text-gray-500 py-6">
                No courses found.
              </div>
            );
          }

          return (
            <div className="border rounded-lg overflow-hidden bg-white">
              {filteredData.map((data, index) => {
                const isChecked = Array.isArray(checkedCourses)
                  ? checkedCourses.some((c) => c.course.id === data.course.id)
                  : false;
                const isDisabled =
                  !isChecked &&
                  (Array.isArray(checkedCourses) &&
                    (courseLimit.filled + checkedCourses.length >= 3));

                // Function to remove course from localStorage and state
                const handleDeselect = () => {
                  const selected = JSON.parse(localStorage.getItem('selectedCourses')) || [];
                  const updatedSelection = selected.filter(c => c.course.id !== data.course.id);
                  localStorage.setItem('selectedCourses', JSON.stringify(updatedSelection));
                  setSelectedCoursesLS(updatedSelection);
                  // Also remove from checkedCourses if present
                  if (isChecked) {
                    setCheckedCourses(prev => prev.filter(c => c.course.id !== data.course.id));
                  }
                  message.success("Course removed from selection.");
                };

                return (
                  <div
                    key={index}
                    className="flex gap-4 p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start pt-1">
                      <Checkbox
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (courseLimit.filled + checkedCourses.length >= 3) {
                              message.warning('You can only have a total of 3 courses.');
                              return;
                            }
                            setCheckedCourses((prev) => [...prev, data]);
                          } else {
                            setCheckedCourses((prev) =>
                              prev.filter((c) => c.course.id !== data.course.id)
                            );
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Institute Info */}
                      <div className="md:col-span-2">
                        <div className="uc font-bold text-sm">{data.institute.name}</div>
                        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                          <div>Type: {data.institute.type || "-"}</div>
                          <div>State: {data.institute.state || "-"}</div>
                          <div>City: {data.institute.city || "-"}</div>
                        </div>
                      </div>
                      {/* Course Info */}
                      <div className="md:col-span-2">
                        <div className="uc font-bold text-sm">{data.course.specialization}</div>
                        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                          <div>Course: {data.course.name || "-"}</div>
                          <div>Acad. Career: {data.course.ac || "-"}</div>
                          <div>Discipline: {data.course.discipline || "-"}</div>
                        </div>
                      </div>
                      {/* Action Button */}
                      <div className="flex items-center justify-center">
                        <Button
                          size="small"
                          danger
                          onClick={handleDeselect}
                          className="font-medium text-xs px-3 py-1 h-auto"
                        >
                          Deselect
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Modal>

      {/* ✅ College Course Modal */}
      <Modal
        title={<span className="uc">Courses at {selectedCollegeName}</span>}
        open={collegeModalVisible}
        onCancel={() => setCollegeModalVisible(false)}
        destroyOnClose
        maskClosable={false}
        width="80%"
        footer={null}
      >
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
          <div className="bg-white p-1 border-b border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <i className="fa fa-book-open text-blue-400 mr-2"></i>
                  Course Name
                </label>
                <Select
                  showSearch
                  allowClear
                  placeholder="Search course..."
                  value={courseNameFilter || undefined}
                  options={collegeCourseNameOptions}
                  onChange={(value) => setCourseNameFilter(value || "")}
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(String(input || "").toLowerCase())
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <i className="fa fa-cube text-purple-500 mr-2"></i>
                  Discipline
                </label>
                <Select
                  showSearch
                  allowClear
                  placeholder="Search discipline..."
                  value={disciplineFilter || undefined}
                  options={collegeDisciplineOptions}
                  onChange={(value) => setDisciplineFilter(value || "")}
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(String(input || "").toLowerCase())
                  }
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="primary"
                  onClick={handleApplyFilter}
                  icon={<i className="fa fa-filter"></i>}
                  className="h-11 ml2 px-6 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 w-full"
                >
                  Apply Filters
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setCourseNameFilter("");
                    setDisciplineFilter("");
                    setFilteredCollegeCourses(selectedCollegeCourses);
                  }}
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-600 font-medium w-full"
                >
                  <i className="fa fa-refresh mr-1"></i> Reset
                </Button>
              </div>
            </div>
          </div>
          <div className="p-3">
            {filteredCollegeCourses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl mx-4 mt-4 shadow-sm">
                <i className="fa fa-graduation-cap text-6xl opacity-20 mb-3"></i>
                <p className="text-lg font-medium">No courses found for current session</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                {filteredCollegeCourses.map((course) => {
                  const isAlreadySelected = selectedCoursesLS.some((c) => c.course.id === course.id);
                  const isSelectedInSession = selectedCourses[course.inst_name] === course.id;

                  return (
                    <div
                      key={course.id}
                      className={`p-4 border rounded-md hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${isSelectedInSession
                        ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => handleCourseChange(course.inst_name, course.id)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-gray-800 text-base leading-tight">
                          {course.specialization}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          <Tag
                            className={`text-sm px-3 py-1 rounded-sm border-0 shadow-sm tracking-wide ${course.ac === 'PG'
                              ? 'bg-gradient-to-r from-red-500 to-orange-400 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-400 text-white'
                              }`}
                          >
                            {course.ac}
                          </Tag>
                          {course.applied_status === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <i className="fa fa-check-circle"></i> Applied
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1.5 mb-3">
                        <div className="flex">
                          <span className="font-medium w-20">Course:</span>
                          <span className="font-semibold">{course.course}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-20">Discipline:</span>
                          <span>{course.discipline}</span>
                        </div>
                        <div className="flex flex-wrap items-start">
                          <span className="font-medium w-20 flex-shrink-0">Eligibility:</span>
                          <span className="italic flex-1 min-w-0 break-words" title={course.eligibility_creteria || 'Not specified'}>
                            {course.eligibility_creteria || 'Not specified'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {course.applied_status === 1 ? null : isAlreadySelected ? (
                          <span className="inline-flex items-center gap-1.5 text-blue-700 text-xs font-medium">
                            <i className="fa fa-star"></i> Selected
                          </span>
                        ) : (
                          <Button
                            size="large"
                            type="primary"
                            className="text-sm px-3 py-1 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToSelection(course);
                            }}
                            disabled={courseLimit.status === "blocked"}
                          >
                            Select Course
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Main Tile Layout */}
      <div className="page-pad1">
        <div className="mb15">
          <SearchForm dataRef={sdataRef} onSearch={list} />

          {/* 🔷 Conditionally Show Recommended Courses Only When No Filters Are Applied */}
          {(() => {
            const hasActiveFilter =
              sdataRef.current.inst_type ||
              sdataRef.current.ac_id ||
              sdataRef.current.k;
            return !hasActiveFilter ? (
              <Col xs={24} md={24}>
                <Card
                  bordered
                  size="small"
                  className="mt-3 shadow-lg rounded-lg overflow-hidden border-indigo-200"
                  headStyle={{ display: "none" }}
                  bodyStyle={{ padding: 0 }}
                >
                  {recommendedCourses && recommendedCourses.length > 0 ? (
                    <div
                      className="relative py-3 px-4 overflow-hidden"
                      style={{
                        background: `linear-gradient(to right, ${badgeCfg.gradientFrom || '#4f46e5'}, ${badgeCfg.gradientVia || '#7c3aed'}, ${badgeCfg.gradientTo || '#ec4899'})`,
                        color: badgeCfg.textColor || '#ffffff',
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-sm animate-pulse"
                          style={{ background: badgeCfg.labelBgColor || '#fde047', color: badgeCfg.labelTextColor || '#000000' }}
                        >
                          Recommended course based on your discipline.
                        </span>
                      </div>
                      <div className="whitespace-nowrap overflow-hidden">
                        <p className="inline-block text-md font-semibold animate-marquee">
                          {(() => {
                            const first = recommendedCourses[0] || {};
                            const customText = (featuredCustomText && String(featuredCustomText).trim()) || "";
                            const dropdownTpl = "We recommend you to pursue {{specialization}} at {{institute}} ({{course}})";
                            const parts = dropdownTpl.split(/(\{\{specialization\}\}|\{\{institute\}\}|\{\{course\}\})/g);
                            return (
                              <>
                                {customText ? <span>{customText} </span> : null}
                                {parts.map((p, i) => {
                                  if (p === "{{specialization}}") {
                                    return (
                                      <span key={`spec-${i}`} className="font-bold underline text-yellow-200">
                                        {first.specialization_name || "-"}
                                      </span>
                                    );
                                  }
                                  if (p === "{{institute}}") {
                                    return (
                                      <span key={`inst-${i}`} className="font-bold underline text-green-200">
                                        {first.institute_name || "-"}
                                      </span>
                                    );
                                  }
                                  if (p === "{{course}}") {
                                    return <span key={`course-${i}`}>{first.course_name || "-"}</span>;
                                  }
                                  return <span key={`txt-${i}`}>{p}</span>;
                                })}
                              </>
                            );
                          })()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm p-3 text-center">
                      No recommended course found for your discipline.
                    </p>
                  )}
                </Card>

                {/* 🏆 Top 5 Institutes by Discipline Card */}
                <Col xs={24} md={24}>
                  <Card
                    bordered
                    size="small"
                    className="mt-4 shadow-lg rounded-2xl overflow-hidden border-blue-200 hover:shadow-2xl transition-all duration-300"
                    headStyle={{ display: "none" }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white py-3 px-4">
                      <div className="flex items-center mb-2">
                        <i className="fa fa-trophy text-yellow-300 mr-2 text-lg"></i>
                        <span className="text-sm font-bold uppercase tracking-wide">
                          Top 5 Institutes in {disciplineName || "your discipline"}
                        </span>
                      </div>
                      <p className="text-xs opacity-90">
                        These institutes currently have the best performance and programs aligned with your field.
                      </p>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-white">
                      {featuredInstitutes && featuredInstitutes.length > 0 ? (
                        featuredInstitutes.map((inst, index) => (
                          <div
                            key={inst.institute_id || index}
                            onClick={() => handleFeaturedInstituteClick(inst)} // ✅ added
                            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-4 flex flex-col justify-between cursor-pointer hover:scale-[1.02]"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-800 uppercase line-clamp-2">
                                  {inst.inst_name}
                                </h3>
                                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-red-500" />
                                  {inst.inst_city || "-"}, {inst.inst_state || "-"}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <FaUniversity className="text-blue-500" /> {inst.inst_type || "Private"}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <FaBookOpen className="text-green-500" />
                                  {inst.courses?.length || 0} Course{inst.courses?.length !== 1 ? 's' : ''} Available
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic text-sm col-span-full text-center py-3">
                          No featured institutes found for this session.
                        </p>
                      )}
                    </div>

                  </Card>
                </Col>

              </Col>
            ) : null;
          })()}
        </div>

        {cfStarted === 'Y' ? (
          <div>
            <div className="pt-2">
              <Card size="small" bordered={true} bodyStyle={{ padding: 0 }} className="ant-table-text-top">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-3">
                  {result.data.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center h-64">
                      <p className="text-gray-500 text-lg">No institutes found</p>
                    </div>
                  ) : (
                    result.data
                      .filter((row) => row.isFirst)
                      .filter((row) => {
                        if (!studentCountry || !row.institute_id) return true;
                        return !blockedInstituteIds.has(row.institute_id);
                      })
                      .map((row) => (
                        <div
                          key={row.inst_name}
                          className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] flex flex-col h-full border border-gray-100 min-h-[120px]"
                          onClick={() => openCollegeModal(row)}
                        >
                          <div className="p-6 flex-grow">
                            <h3 className="text-xl font-bold text-gray-800 uppercase mb-4 line-clamp-2" title={row.inst_name}>
                              {row.inst_name}
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FaUniversity className="text-blue-500 mr-2.5" />
                                <span>Type: {row.inst_type || 'N/A'}</span>
                              </div>
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="text-red-500 mr-2.5" />
                                <span>Location: {row.inst_city}, {row.inst_state}</span>
                              </div>
                              <div className="flex items-center mt-2">
                                <FaStar className="text-yellow-500 mr-2.5" />
                                <span>NAAC: {instituteDetails[row.institute_id]?.naac || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 p-4 bg-blue-50 rounded-b-2xl">
                            <div className="flex items-center text-blue-700 font-medium">
                              <FaBookOpen className="mr-2" />
                              <span>
                                {(courseCountByInstitute[row.inst_name] || 0)} Course{(courseCountByInstitute[row.inst_name] || 0) !== 1 ? 's' : ''} Available
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                <div className="paging-box border-t bg-gray-50 px-4 py-3">
                  <AntdPaging
                    onChange={list}
                    total={result.page.total_records}
                    current={result.page.cur_page}
                    pageSize={sdataRef.current.ps}
                    showSizeChanger
                  />
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div>
            {cfClosed === 'Y' ? (
              <Result status="error" title="Choice filling is closed now!" />
            ) : (
              <Result icon={<SmileOutlined />} title="Choice filling is not started yet!" />
            )}
          </div>
        )}
      </div>

      <ChoiceApplyForm
        refOb={formRef}
        callback={list}
        pageno={sdataRef.current.p}
        stuDtl={stuDtl}
        setStuDtl={setStuDtl}
      />
    </div>
  );
}

const SearchForm = ({ dataRef, onSearch }) => {
  const [data, setData] = useState({ ...dataRef.current });
  const [acadCareers, setAcadCareers] = useState([]);
  const [modes, setModes] = useState([]);

  useEffect(() => {
    const next = { ...data };
    if (Object.prototype.hasOwnProperty.call(next, 'discipline_id')) {
      delete next.discipline_id;
    }
    dataRef.current = next;
  }, [data]);

  useEffect(() => {
    setData({ ...data, p: dataRef.current.p, ps: dataRef.current.ps });
  }, [dataRef.current.p, dataRef.current.ps]);

  useEffect(() => {
    CmasterService.acadCareers({ status: 1 }).then((res) =>
      setAcadCareers(res.data.result.data)
    );
    InstituteService.courses().then((res) => {
      const insts = res.data.result.data;
      const uniqueModes = [
        ...new Set(insts.map((i) => i.Mode_of_course).filter(Boolean)),
      ];

      setModes(uniqueModes);
    });
  }, []);

  const handleChange = (v, k) => {
    data[k] = v;
    setData({ ...data });
  };

  return (
    <Card
      size="small"
      title="Filter Criteria"
      className="mb-4"
      bodyStyle={{ paddingBottom: '16px' }}
    >
      <form
        onSubmit={(e) => e.preventDefault()}
        autoComplete="off"
        spellCheck="false"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="form-group">
              <label className="font-weight-bold mb-2">Institute Type</label>
              <AntdSelect
                placeholder="All"
                allowClear
                showSearch
                style={{ width: '100%' }}
                options={['Public', 'Private'].map((t) => ({
                  value: t,
                  label: t,
                }))}
                value={data.inst_type}
                onChange={(v) => handleChange(v, 'inst_type')}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="form-group">
              <label className="font-weight-bold mb-2">Academic Career</label>
              <AntdSelect
                placeholder="All"
                allowClear
                showSearch
                style={{ width: '100%' }}
                options={acadCareers.map((v) => ({
                  value: v.id,
                  label: v.name,
                }))}
                value={data.ac_id}
                onChange={(v) => handleChange(v, 'ac_id')}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="form-group">
              <label className="font-weight-bold mb-2">Mode of Course</label>
              <AntdSelect
                placeholder="All"
                allowClear
                showSearch
                style={{ width: '100%' }}
                options={[
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline" },
                ]}
                value={data.Mode_of_course}
                onChange={(v) => handleChange(v, "Mode_of_course")}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="form-group">
              <label className="font-weight-bold mb-2">Institute Name/Course</label>
              <Input
                placeholder="Enter text"
                allowClear
                style={{ width: '100%' }}
                value={data.k}
                onChange={(e) => handleChange(e.target.value, 'k')}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="form-group">
              <label className="mb-2" style={{ visibility: 'hidden' }}>Action</label>
              <Button 
                type="primary" 
                onClick={() => onSearch()}
                block
                size="large"
              >
                Apply Filter
              </Button>
            </div>
          </Col>
        </Row>
      </form>
    </Card>
  );
};

const ChoiceApplyForm = (props) => {
  const { callback, pageno, stuDtl, setStuDtl, refOb } = props;
  const [showModal, setShowModal] = useState(false);
  const [dtl, setDtl] = useState({});
  const [data, setData] = useState({});

  const handleOk = () => {
    message.destroy();
    util.showLoader();
    StudentService.saveStudentChoiceFillings(data)
      .then(({ data }) => {
        console.log("data", data)
        message.success(data.message || 'Saved');
        callback(data.id ? pageno : 1);
        setShowModal(false);
        setStuDtl({ ...stuDtl, course_choice_date: data.course_choice_date });
      })
      .catch((e) => {
        console.log("error", e)
        message.error(e.message);
      })
      .finally(() => {
        util.hideLoader();
      });
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  refOb.current = {
    open: (dtl) => {
      setDtl({ ...dtl });
      setData({
        student_id: stuDtl.id,
        institute_course_id: dtl.id,
      });
      setShowModal(true);
    },
  };

  const lblClass1 = 'w100';

  return (
    <Modal
      title={`Lock Choice`}
      open={showModal}
      okText="Lock Choice"
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose
      maskClosable={false}
      width={800}
    >
      <Card title="Institute Detail" size="small" className="mb15">
        <div className="uc bold600">{dtl.inst_name}</div>
        <div className="note-text pt3">
          <div className="d-flex">
            <div className={lblClass1}>Type</div>
            <div className="bold600">: {dtl.inst_type}</div>
          </div>
          <div className="d-flex">
            <div className={lblClass1}>State</div>
            <div className="bold600">: {dtl.inst_state}</div>
          </div>
          <div className="d-flex">
            <div className={lblClass1}>City</div>
            <div className="bold600">: {dtl.inst_city}</div>
          </div>
        </div>
      </Card>
      <Card title="Course Detail" size="small" className="mb15">
        <div className="uc bold600">{dtl.specialization}</div>
        <div className="note-text pt3">
          <div className="d-flex">
            <div className={lblClass1}>Course</div>
            <div className="bold600">: {dtl.course}</div>
          </div>
          <div className="d-flex">
            <div className={lblClass1}>Acad. Career</div>
            <div className="bold600">: {dtl.ac}</div>
          </div>
          <div className="d-flex">
            <div className={lblClass1}>Discipline</div>
            <div className="bold600">: {dtl.discipline}</div>
          </div>
          <div className="d-flex">
            <div className={lblClass1}>Eligibility Creteria</div>
            <div className="bold600">: {dtl.eligibility_creteria}</div>
          </div>
        </div>
      </Card>
      <form onSubmit={(e) => { e.preventDefault(); handleOk(); }} autoComplete="off">
        <div className="mb15">
          <Checkbox checked>
            This is to certify that all the details (Personal/Educational/Background) given by me are correct.
          </Checkbox>
        </div>
        <div>
          <Checkbox checked>
            In case any such details are found incorrect, SIS & Institute have the right to cancel my admission.
          </Checkbox>
        </div>
      </form>
    </Modal>
  );
};

// const AppliedCoursesInfo = ({ stuDtl, applied = [] }) => {
//   // const [applied, setApplied] = useState([]);
//   const appliedRef = useRef();

// useEffect(() => {
//   if (!stuDtl?.id) return;

//   StudentService.appliedCourses({ student_id: stuDtl.id })
//     .then(({ data }) => {
//       setApplied(data.result.data || []);
//     })
//     .catch(() => {
//       message.error('Failed to load applied courses');
//     });
// }, [stuDtl?.id]);

//   console.log("AppliedCoursesInfo called")

//   const offers = applied.filter((a) => a.offer_file_url);

//   if (applied.length === 0) return null;

//   return (
//     <div className="mb10 mt-2">
//       <Alert
//         message={`You have applied to ${applied.length} course(s).`}
//         description={offers.length > 0 && <div>You have received {offers.length} offer(s).</div>}
//         type="success"
//         showIcon={false}
//         action={
//           <Button size="small" danger onClick={() => appliedRef.current?.open(applied)}>
//             View
//           </Button>
//         }
//       />
//       <AppliedCourses ref={appliedRef} />
//     </div>
//   );
// };

const AppliedCoursesInfo = React.memo(({ stuDtl, applied = [] }) => {
  const appliedRef = useRef();
  const offers = applied.filter((a) => a.offer_file_url);
  if (applied.length === 0) return null;

  return (
    <div className="mb10 mt-2">
      <Alert
        message={`You have applied to ${applied.length} course(s).`}
        description={offers.length > 0 && <div>You have received {offers.length} offer(s).</div>}
        type="success"
        showIcon={false}
        action={
          <Button size="small" danger onClick={() => appliedRef.current?.open(applied)}>
            View
          </Button>
        }
      />
      <AppliedCourses ref={appliedRef} />
    </div>
  );
});

const AppStatusTag = ({ status }) => {
  const colors = { Pending: '#FFBF00', Accepted: '#26C281', Approved: '#26C281', Rejected: '#ed6b75' };
  return (
    <div
      className="uppercase text-[11px] px-2 py-[2px] rounded-lg text-center"
      style={{ color: colors[status], border: `1px solid ${colors[status]}` }}
    >
      {status}
    </div>
  );
};

const AppliedCourses = React.forwardRef((props, ref) => {
  const [applied, setApplied] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewOfferUrl, setViewOfferUrl] = useState(null);
  const lblClass1 = 'w70';
  const lblClass2 = 'w100';

  const handleCancel = () => setShowModal(false);

  const hasAcceptedCourse = applied.some((r) => r.stu_status === "Accepted");

  const handleStudentStatusClick = ({ key }, scf_id) => {
    const fn = async () => {
      setLoading(true);
      const res = await StudentService.setSCFStudentStatus({ scf_id, status: key });
      if (res.success) {
        message.success(res.message || 'Success');
        setApplied((prev) =>
          prev.map((r) =>
            r.scf_id === scf_id
              ? { ...r, stu_status: key, stu_status_dt: moment().format('YYYY-MM-DD HH:mm:ss') }
              : r
          )
        );
      } else {
        message.error(res.message || 'Failed');
      }
      setLoading(false);
    };

    confirm({
      title: `Are you sure to mark as ${key}?`,
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: 'Yes',
      cancelText: 'No',
      onOk: fn,
    });
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

  const stuStatusItems = [
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
              <div>
                <div className={lblClass2}>Eligibility Criteria</div>
              </div>
              <div className="bold600">: {row.eligibility_creteria}</div>
            </div>
            {!!row.offer_file_url && (
              <div className="mt-2 flex gap-1 items-center">
                <div className="flex gap-1 items-center text-black/50">
                  <i className="fa-solid fa-file-pdf text-[red]"></i> Offer Letter:
                </div>
                <Button size="small" onClick={() => handleViewOffer(row)}>
                  <i className="fa-sharp fa-solid fa-eye"></i>
                  <span className="text-[11px] font-semibold uppercase">&nbsp;View</span>
                </Button>
                <Button size="small" disabled={row.stu_status !== 'Accepted'} onClick={() => downloadOffer(row.offer_file_url)}>
                  <i className="fa-solid fa-download"></i>
                  <span className="text-[11px] font-semibold uppercase">&nbsp;Download</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Applied On',
      width: '170px',
      render: (row) => (
        <div>
          <div>{util.getDate(row.applied_on, 'DD MMM YYYY @ hh:mm A')}</div>
          <div className="mt-1 mb-2">
            <div className="text-black/50 text-[11px]">Institute Status:</div>
            <AppStatusTag status={row.ins_status} />
          </div>
          <div>
            <div className="text-black/50 text-[11px]">Student Status:</div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className={`${(row.ins_status === 'Accepted' && row.stu_status === 'Pending') ? 'w-[100px]' : 'w-full'}`}>
                <AppStatusTag status={row.stu_status} />
              </div>
              {(row.ins_status === "Accepted" &&
                row.stu_status === "Pending" &&
                !hasAcceptedCourse) && (
                  <Dropdown
                    menu={{ items: stuStatusItems, onClick: (e) => handleStudentStatusClick(e, row.scf_id) }}
                    trigger={["click"]}
                  >
                    <div className="bdr px-3 py-[2px] cursor-pointer rounded-[4px]">
                      <DownOutlined />
                    </div>
                  </Dropdown>
                )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  React.useImperativeHandle(ref, () => ({
    open: (records) => {
      setApplied(records);
      setShowModal(true);
    },
  }));

  return (
    <Modal
      title="Applied Courses"
      open={showModal}
      onCancel={handleCancel}
      destroyOnClose
      maskClosable={false}
      width="80%"
      footer={null}
    >
      <Card size="small" bordered={true} bodyStyle={{ padding: 0 }} className="ant-table-text-top">
        <Table dataSource={applied} columns={cols} pagination={false} />
      </Card>
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
    </Modal>
  );
});
