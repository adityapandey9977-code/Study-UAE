import React, { useEffect, useState, useContext, useMemo } from "react";
import { Card, Row, Input, Button, Space, message, Table, Select, InputNumber, Popconfirm } from "antd";
import CampaignService from "../../services/CampaignService";
import InstituteService from "../../services/InstituteService";
import { SessionContext } from "../../context/SessionContext";
import CmasterService from "../../services/CmasterService";

export default function RecommendationBadgeSettings() {
  const [form, setForm] = React.useState({ badgeTemplate: "" });
  // const [ids, setIds] = React.useState({ discipline_id: null, course_id: null, institute_course_id: null });
  const [ids, setIds] = React.useState({ discipline_id: null, course_id: null, institute_course_id: null, career_id: null });
  const [status, setStatus] = React.useState("ACTIVE");
  const [listings, setListings] = React.useState([]);
  const [listLoading, setListLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [institutes, setInstitutes] = React.useState([]);
  const [institutesLoading, setInstitutesLoading] = React.useState(false);
  const [courses, setCourses] = React.useState([]);
  const [coursesLoading, setCoursesLoading] = React.useState(false);
  const { selectedSession, activeSession } = useContext(SessionContext);
  const [disciplines, setDisciplines] = useState([]);
  const [disciplinesLoading, setDisciplinesLoading] = useState(false);
  const [allDisciplines, setAllDisciplines] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allSpecializations, setAllSpecializations] = useState([]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    Promise.all([
      CmasterService.allDisciplines({}),
      CmasterService.allCourses({}),
      CmasterService.allSpecializations({}),
    ])
      .then(([discRes, courseRes, specRes]) => {
        const d = discRes?.data?.result?.data || [];
        const c = courseRes?.data?.result?.data || [];
        const s = specRes?.data?.result?.data || [];
        setAllDisciplines(Array.isArray(d) ? d : []);
        setAllCourses(Array.isArray(c) ? c : []);
        setAllSpecializations(Array.isArray(s) ? s : []);
      })
      .catch(() => {
        setAllDisciplines([]);
        setAllCourses([]);
        setAllSpecializations([]);
      });
  }, []);

  const disciplineNameById = useMemo(() => {
    const map = {};
    (allDisciplines || []).forEach((d) => {
      if (!d) return;
      const id = d.id;
      if (id === undefined || id === null) return;
      map[String(id)] = d.name || d.discipline_name || d.title || '';
    });
    return map;
  }, [allDisciplines]);

  const courseNameById = useMemo(() => {
    const map = {};
    (allCourses || []).forEach((c) => {
      if (!c) return;
      const id = c.id;
      if (id === undefined || id === null) return;
      map[String(id)] = c.name || c.course_name || c.specialization_name || c.title || '';
    });
    (courses || []).forEach((c) => {
      if (!c) return;
      const id = c.id;
      if (id === undefined || id === null) return;
      const label = c.specialization_name || c.name || c.course_name || '';
      if (label && !map[String(id)]) map[String(id)] = label;
    });
    return map;
  }, [allCourses, courses]);

  const specializationById = useMemo(() => {
    const map = {};
    (allSpecializations || []).forEach((s) => {
      if (!s) return;
      const id = s.id;
      if (id === undefined || id === null) return;
      map[String(id)] = s;
    });
    return map;
  }, [allSpecializations]);

  const masterCourseById = useMemo(() => {
    const map = {};
    (allCourses || []).forEach((c) => {
      if (!c) return;
      const id = c.id;
      if (id === undefined || id === null) return;
      map[String(id)] = c;
    });
    return map;
  }, [allCourses]);

  const instituteNameById = useMemo(() => {
    const map = {};
    (institutes || []).forEach((i) => {
      if (!i) return;
      const id = i.id;
      if (id === undefined || id === null) return;
      map[String(id)] = i.name || i.institute_name || '';
    });
    return map;
  }, [institutes]);

  const selectedInstituteName = useMemo(() => {
    const id = ids?.institute_course_id;
    if (!id) return '';
    return instituteNameById[String(id)] || '';
  }, [ids?.institute_course_id, instituteNameById]);

  const selectedCourseRow = useMemo(() => {
    const id = ids?.course_id;
    if (!id) return null;
    return (courses || []).find((c) => String(c?.id) === String(id)) || null;
  }, [ids?.course_id, courses]);

  const selectedSpecializationRow = useMemo(() => {
    const specId = selectedCourseRow?.specialization_id;
    if (!specId) return null;
    return specializationById[String(specId)] || null;
  }, [selectedCourseRow, specializationById]);

  const selectedMasterCourseRow = useMemo(() => {
    const masterCourseId = selectedSpecializationRow?.course_id;
    if (!masterCourseId) return null;
    return masterCourseById[String(masterCourseId)] || null;
  }, [selectedSpecializationRow, masterCourseById]);

  const derivedCareerId = useMemo(() => {
    const v = selectedMasterCourseRow?.career_id;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [selectedMasterCourseRow]);

  const derivedDisciplineId = useMemo(() => {
    const v = selectedMasterCourseRow?.discipline_id;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [selectedMasterCourseRow]);

  const selectedCourseLabel = useMemo(() => {
    const id = ids?.course_id;
    if (!id) return '';
    return courseNameById[String(id)] || '';
  }, [ids?.course_id, courseNameById]);

  const selectedSpecializationLabel = useMemo(() => {
    const v = selectedCourseRow?.specialization_name || '';
    return String(v || '').trim();
  }, [selectedCourseRow]);

  const fetchCourses = (instituteId) => {
    if (!instituteId) {
      setCourses([]);
      setIds(p => ({ ...p, course_id: null }));
      return;
    }

    setCoursesLoading(true);
    const params = {
      session: selectedSession?.name || activeSession,
      show_all: 'false',
      // institute_id is not needed for admin endpoint
    };

    console.log('Fetching courses with params:', params, 'for institute:', instituteId);

    // Check if user is admin (you might need to adjust this based on your auth system)
    const isAdmin =
      localStorage.getItem('is_client_admin') === '1' ||
      localStorage.getItem('is_admin') === '1';

    const apiCall = isAdmin
      ? InstituteService.coursesAdmin(instituteId, params)
      : InstituteService.courses({ ...params, institute_id: instituteId });

    apiCall
      .then((res) => {
        console.log('Courses API Response:', res);

        // Extract courses from the response
        let courses = [];

        // Handle both admin and non-admin response structures
        if (res?.data?.result?.courses) {
          courses = res.data.result.courses;
        } else if (res?.data?.result?.data) {
          courses = res.data.result.data;
        } else if (res?.data?.data?.result?.courses) {
          // Handle potential nested structure
          courses = res.data.data.result.courses;
        } else if (res?.data?.data?.result?.data) {
          courses = res.data.data.result.data;
        } else if (Array.isArray(res?.data)) {
          // Handle direct array response
          courses = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          // Handle response with data array
          courses = res.data.data;
        }

        courses = (Array.isArray(courses) ? courses : []).filter((c) => {
          if (!c) return false;
          if (c.status === undefined || c.status === null || c.status === '') return true;
          return Number(c.status) === 1;
        });

        console.log('Extracted courses data:', courses);
        setCourses(Array.isArray(courses) ? courses : []);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        message.error('Failed to load courses: ' + (error?.response?.data?.message || 'Unknown error'));
        setCourses([]);
      })
      .finally(() => setCoursesLoading(false));
  };

  const handleInstituteChange = (value) => {
    setIds(p => ({ ...p, institute_course_id: value || null, course_id: null, discipline_id: null, career_id: null }));
    fetchCourses(value);
  };

  const save = () => {
    const instituteId = ids?.institute_course_id;
    const instituteCourseId = ids?.course_id;
    const disciplineId = ids?.discipline_id;
    const careerId = ids?.career_id;
    const sessionValue = selectedSession?.name || activeSession;
    if (!instituteId || !instituteCourseId || !disciplineId || !careerId) {
      message.error("Please provide institute, course and discipline");
      return;
    }

    const payload = {
      discipline_id: disciplineId,
      course_id: careerId,
      institute_course_id: instituteCourseId,
      session: sessionValue,
      custom_text: form.badgeTemplate || "",
      status,
    };

    const apiCall = selectedRow?.id
      ? CampaignService.updateFeaturedListingById(selectedRow.id, payload)
      : CampaignService.saveOrUpdateFeaturedListing(payload);

    apiCall
      .then(() => {
        message.success(selectedRow?.id ? "Updated" : "Saved");
        reset();
        fetchListings({
          discipline_id: ids?.discipline_id || undefined,
          course_id: ids?.career_id || undefined,
        });
      })
      .catch((e) => message.error(e?.response?.data?.message || "Failed to save"));
  };

  const reset = () => {
    setForm({ badgeTemplate: "" });
    setSelectedRow(null);
  };

  const applyRowToForm = (row) => {
    if (!row) return;
    const instCourseId = row?.institute_course_id ? Number(row.institute_course_id) : null;
    const disciplineId = row?.discipline_id ? Number(row.discipline_id) : null;
    const careerId = row?.course_id ? Number(row.course_id) : null;
    setIds((p) => ({
      ...p,
      institute_course_id: row?.institute_id ? Number(row.institute_id) : p.institute_course_id,
      course_id: instCourseId,
      discipline_id: disciplineId,
      career_id: careerId,
    }));
    if (row?.institute_id) {
      fetchCourses(Number(row.institute_id));
    }
    setForm({ badgeTemplate: row?.custom_text || "" });
    setStatus(row?.status || "ACTIVE");
    setSelectedRow(row);
  };

  const handleDeleteRow = async (row) => {
    if (!row?.id) {
      message.error("Invalid row id");
      return;
    }
    try {
      await CampaignService.deleteFeaturedListingById(row.id);
      message.success("Deleted");
      if (selectedRow?.id && String(selectedRow.id) === String(row.id)) {
        reset();
      }
      fetchListings({
        discipline_id: ids?.discipline_id || undefined,
        course_id: ids?.career_id || undefined,
      });
    } catch (e) {
      message.error(e?.response?.data?.message || "Failed to delete");
    }
  };


  // Update the handleCourseChange function
  const handleCourseChange = (courseId) => {
    const nextInstituteCourseId = courseId || null;
    const nextCourseRow = nextInstituteCourseId
      ? (courses || []).find((c) => String(c?.id) === String(nextInstituteCourseId))
      : null;
    const specRow = nextCourseRow?.specialization_id
      ? specializationById[String(nextCourseRow.specialization_id)]
      : null;
    const masterCourseRow = specRow?.course_id ? masterCourseById[String(specRow.course_id)] : null;
    const nextDisciplineId = masterCourseRow?.discipline_id ? Number(masterCourseRow.discipline_id) : null;
    const nextCareerId = masterCourseRow?.career_id ? Number(masterCourseRow.career_id) : null;

    setIds(p => ({
      ...p,
      course_id: nextInstituteCourseId,
      discipline_id: nextDisciplineId || null,
      career_id: nextCareerId || null,
    }));

    if (nextDisciplineId) {
      const dRow = (allDisciplines || []).find((d) => String(d?.id) === String(nextDisciplineId)) || null;
      setDisciplines(dRow ? [dRow] : []);
    } else {
      setDisciplines([]);
    }
  };

  // Add this new function to fetch disciplines
  const fetchDisciplines = (courseId) => {
    setDisciplinesLoading(true);

    CmasterService.allDisciplines({
      status: 1,
      course_id: courseId
    })
      .then((res) => {
        const data = res?.data?.result?.data || [];
        console.log('Fetched disciplines:', data);
        setDisciplines(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error fetching disciplines:', error);
        message.error('Failed to load disciplines');
        setDisciplines([]);
      })
      .finally(() => setDisciplinesLoading(false));
  };
  // useEffect(() => {
  //   // Read IDs from URL query params
  //   try {
  //     const qs = new URLSearchParams(window.location.search);
  //     const discipline_id = Number(qs.get("discipline_id")) || null;
  //     const course_id = Number(qs.get("course_id")) || null;
  //     const institute_course_id = Number(qs.get("institute_course_id")) || null;
  //     setIds({ discipline_id, course_id, institute_course_id });

  //     // Only fetch when discipline_id and course_id are present
  //     if (discipline_id && course_id) {
  //       // CampaignService.getFeaturedListingAdmin({ discipline_id, course_id })
  //       CampaignService.getFeaturedListingAdmin({ discipline_id: ids.discipline_id || 2 })
  //         .then((res) => {
  //           const data = res?.data || {};
  //           const custom = data?.custom_text || data?.result?.data?.[0]?.custom_text || "";
  //           setForm({ badgeTemplate: custom });
  //         })
  //         .catch(() => {
  //           setForm({ badgeTemplate: "" });
  //         });
  //     }
  //     fetchListings();
  //   } catch {
  //     // ignore
  //   }
  // }, []);

  useEffect(() => {
    try {
      // Only fetch data if we have both discipline_id and course_id
      const fetchData = () => {
        if (ids.discipline_id && ids.career_id) {
          CampaignService.getFeaturedListingAdmin({
            discipline_id: ids.discipline_id,
            course_id: ids.career_id
          })
          .then((res) => {
            const data = res?.data || {};
            const custom =
              data?.custom_text ||
              data?.result?.data?.[0]?.custom_text ||
              "";
            setForm({ badgeTemplate: custom });
          })
          .catch(() => setForm({ badgeTemplate: "" }));
        } else {
          setForm({ badgeTemplate: "" });
        }
      };

      fetchData();

      // Load listings for the current filter
      fetchListings({
        discipline_id: ids?.discipline_id || undefined,
        course_id: ids?.career_id || undefined,
      });

      // Fetch institutes if not already loaded
      if (institutes.length === 0) {
        setInstitutesLoading(true);
        InstituteService.all({})
          .then((res) => {
            const data = res?.data?.result?.data || [];
            setInstitutes(data);
          })
          .catch(() => {
            message.error('Failed to load institutes');
          })
          .finally(() => setInstitutesLoading(false));
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setForm({ badgeTemplate: "" });
    }
  }, [ids, institutes.length]);

  const fetchListings = (params = {}) => {
    setListLoading(true);
    CampaignService.getFeaturedListingAdmin(params)
      .then((res) => {
        const raw = res?.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.result?.data)
              ? raw.result.data
              : [];
        setListings(list.sort((a, b) => (a.id || 0) - (b.id || 0)));
      })
      .catch(() => setListings([]))
      .finally(() => setListLoading(false));
  };

  return (
    <div>
      <div className="page-head-gradient" style={{ padding: '18px 24px' }}>
        <h2>Recommendation Badge</h2>
      </div>

      <div className="page-pad">

      {/* Preview Section */}
      <Card title="Preview" bordered style={{ marginBottom: 16 }}>
        <div
          className="relative py-3 px-4 overflow-hidden"
          style={{
            background: "linear-gradient(to right, #4f46e5, #7c3aed, #ec4899)",
            color: "#ffffff",
            maxWidth: '100%',
            width: '100%',
            minWidth: 0,
          }}
        >
          <div className="flex items-center mb-2">
            <span
              className="text-xs font-bold px-2 py-1"
              style={{ background: "#fde047", color: "#000000" }}
            >
              Recommended course based on your discipline.
            </span>
          </div>
          <div
            className="overflow-hidden"
            style={{
              maxWidth: '100%',
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word'
            }}
          >
            <p
              className="text-md font-semibold"
              style={{
                margin: 0,
                display: 'block',
                maxWidth: '100%',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word'
              }}
            >
              {(() => {
                const customText = (form.badgeTemplate || "").trim();
                const dropdownTpl = "We recommend you to pursue {{specialization}} at {{institute}} ({{course}})";
                const parts = dropdownTpl.split(/(\{\{specialization\}\}|\{\{institute\}\}|\{\{course\}\})/g);
                return (
                  <>
                    {customText ? <span>{customText} </span> : null}
                    {parts.map((p, i) => {
                      if (p === "{{specialization}}")
                        return (
                          <span
                            key={`spec-${i}`}
                            className="font-bold underline"
                            style={{ color: "#fde68a" }}
                          >
                            {selectedSpecializationLabel || "Specialization"}
                          </span>
                        );
                      if (p === "{{institute}}")
                        return (
                          <span
                            key={`inst-${i}`}
                            className="font-bold underline"
                            style={{ color: "#86efac" }}
                          >
                            {selectedInstituteName || "Institute"}
                          </span>
                        );
                      if (p === "{{course}}")
                        return (
                          <span
                            key={`course-${i}`}
                            className="font-bold underline"
                          >
                            {selectedCourseLabel || "Course"}
                          </span>
                        );
                      return <span key={`txt-${i}`}>{p}</span>;
                    })}
                  </>
                );
              })()}
            </p>
          </div>
        </div>
      </Card>

      {/* Settings Section */}
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row gutter={12}>
          <Space wrap>
            <div>
              <div className="mb-1">Institute</div>
              <Select
                showSearch
                placeholder="Select Institute"
                optionFilterProp="children"
                style={{ width: 250 }}
                loading={institutesLoading}
                value={ids.institute_course_id || undefined}
                onChange={handleInstituteChange}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {institutes.map((institute) => (
                  <Select.Option key={institute.id} value={Number(institute.id)}>
                    {institute.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-1">Course</div>
              <Select
                showSearch
                placeholder="Select Course"
                optionFilterProp="children"
                style={{ width: 250 }}
                loading={coursesLoading}
                disabled={!ids.institute_course_id}
                value={ids.course_id || undefined}
                 onChange={handleCourseChange}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {courses.map((course) => (
                  <Select.Option key={course.id} value={Number(course.id)}>
                    {course.specialization_name || `Course ${course.id}`}
                  </Select.Option>
                ))}
              </Select>
            </div>
            
            <div>
              <div className="mb-1">Discipline</div>
              <Select
                showSearch
                placeholder="Select Discipline"
                style={{ width: 200 }}
                loading={disciplinesLoading}
                disabled
                value={ids.discipline_id || undefined}
                onChange={(v) => setIds(p => ({ ...p, discipline_id: v || null }))}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {disciplines.map((discipline) => (
                  <Select.Option key={discipline.id} value={Number(discipline.id)}>
                    {discipline.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-1">status</div>
              <Select
                value={status}
                onChange={setStatus}
                options={[{ value: "ACTIVE" }, { value: "INACTIVE" }]}
                style={{ width: 160 }}
              />
            </div>
          </Space>
        </Row>

        <div>
          <div className="mb-1">Custom Text</div>
          <Input.TextArea
            rows={2}
            value={form.badgeTemplate || ""}
            onChange={(e) => update("badgeTemplate", e.target.value)}
            placeholder="Use tokens: {{specialization}}, {{institute}}, {{course}}"
          />
        </div>

        <Space>
          <Button type="primary" onClick={save}>
            {selectedRow ? "Update" : "Save"}
          </Button>
          <Button onClick={reset}>Reset Defaults</Button>
        </Space>

        <Card title="Featured Listings" bordered>
          <Table
            size="small"
            loading={listLoading}
            dataSource={listings}
            rowKey={(r) => r.id || `${r.discipline_id}-${r.course_id}-${r.institute_course_id}`}
            columns={[
              { title: "ID", dataIndex: "id", key: "id", width: 80 },
              {
                title: "Discipline",
                dataIndex: "discipline_id",
                key: "discipline_id",
                width: 180,
                render: (v, r) => r?.discipline_name || disciplineNameById[String(v)] || v,
              },
              {
                title: "Course",
                dataIndex: "course_id",
                key: "course_id",
                width: 220,
                render: (v, r) => r?.course_name || r?.specialization_name || courseNameById[String(v)] || v,
              },
              {
                title: "Institute",
                dataIndex: "institute_course_id",
                key: "institute_course_id",
                width: 220,
                render: (v, r) =>
                  r?.institute_course?.institute_name ||
                  r?.institute_name ||
                  instituteNameById[String(r?.institute_id)] ||
                  v,
              },
              { title: "Custom Text", dataIndex: "custom_text", key: "custom_text" },
              { title: "Status", dataIndex: "status", key: "status", width: 120 },
              {
                title: "Actions",
                key: "actions",
                width: 160,
                render: (_, row) => (
                  <Space>
                    <Button size="small" onClick={() => applyRowToForm(row)}>
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this record?"
                      okText="Delete"
                      cancelText="Cancel"
                      onConfirm={() => handleDeleteRow(row)}
                    >
                      <Button size="small" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Space>
      </div>
    </div>
  );
}
