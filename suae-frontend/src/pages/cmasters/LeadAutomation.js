/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Form, Input, Button, Select, Modal, message, Spin } from "antd";
import { AntdPaging, AntdTag } from "../../utils/Antd";
import UserService from "../../services/UserService";
import CmasterService from "../../services/CmasterService";
import StudentService from "../../services/StudentService";

const { confirm } = Modal;

// Dummy lead data moved outside to avoid recreation
// const dummyLeadData = [
//     {
//         id: 1,
//         automation_name: "Lead Assign Automation",
//         registered_via: "Online",
//         discipline: "Engineering",
//         courses: "Computer Science",
//         divided_into: "Team A",
//         status: "ACTIVE",
//     },
//     {
//         id: 2,
//         automation_name: "Lead Followup Automation",
//         registered_via: "Offline",
//         discipline: "Business",
//         courses: "MBA",
//         divided_into: "Team B",
//         status: "INACTIVE",
//     },
//     {
//         id: 3,
//         automation_name: "New Lead Automation",
//         registered_via: "Online",
//         discipline: "Science",
//         courses: "Physics",
//         divided_into: "Team C",
//         status: "ACTIVE",
//     },
// ];

const registeredViaOptions = ["ONLINE", "OFFLINE", "EXCEL"];

export default function LeadAutomation() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState({ data: [], page: {} });
    const sdataRef = useRef({ p: 1, ps: 50, k: "" });
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("edit");
    const [formData, setFormData] = useState({});
    const [counsellorUsers, setCounsellorUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [disciplines, setDisciplines] = useState([]);
    const [disciplinesLoading, setDisciplinesLoading] = useState(false);
    const [allCourses, setAllCourses] = useState([]);
    const [studentCount, setStudentCount] = useState(0);
    const [countLoading, setCountLoading] = useState(false);
    const [, setAssignPreview] = useState(null);
    const [, setPreviewLoading] = useState(false);
    const [, setPreviewError] = useState(null);

    useEffect(() => {
        CmasterService.allCourses({})
            .then(({ data }) => {
                const all = data?.result?.data || [];
                setAllCourses(Array.isArray(all) ? all : []);
            })
            .catch(() => setAllCourses([]));
    }, []);

    const courseNameById = useMemo(() => {
        const map = {};
        (allCourses || []).forEach((c) => {
            if (!c) return;
            const id = c.id;
            if (id === undefined || id === null) return;
            map[String(id)] = c.name || c.course_name || c.specialization_name || c.title || "";
        });
        return map;
    }, [allCourses]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await list();
            console.log('Table data:', data);
        };
        fetchData();
    }, []);

    const extractSelectValues = (v) => {
        if (!Array.isArray(v)) return [];
        return v
            .map((x) => {
                if (x && typeof x === 'object') return x.value;
                return x;
            })
            .filter((x) => x !== undefined && x !== null && x !== '');
    };

    const normalizeIdArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value === undefined || value === null || value === "") return [];
        if (typeof value === "string") {
            return value
                .split(",")
                .map((x) => String(x).trim())
                .filter(Boolean);
        }
        return [value];
    };

    const fetchAssignPreview = async (automationOrFormValues) => {
        const v = automationOrFormValues || form.getFieldsValue();
        const strategy = v.strategy === 'dataset' ? 'country' : (v.strategy || 'country');
        const agentIds = extractSelectValues(v.divided_into).map((x) => Number(x)).filter(Boolean);

        if (v.strategy === 'dataset') {
            setAssignPreview(null);
            setPreviewError(null);
            return;
        }

        if (!agentIds.length) {
            setAssignPreview(null);
            setPreviewError(null);
            return;
        }

        setPreviewLoading(true);
        setPreviewError(null);
        try {
            const listFilters = {
                p: 1,
                ps: 1000,
                country_id: extractSelectValues(v.country).map((x) => Number(x)).filter(Boolean),
                discipline_id: extractSelectValues(v.disciplines).map((x) => Number(x)).filter(Boolean),
                course_id: extractSelectValues(v.courses).map((x) => Number(x)).filter(Boolean),
                registered_via: Array.isArray(v.registered_via) ? v.registered_via : [],
            };

            const { data: listData } = await StudentService.list(listFilters);
            const listResult = listData?.result || {};
            const students = Array.isArray(listResult.data) ? listResult.data : [];
            const studentIds = students.map((s) => s.id).filter(Boolean);

            if (!studentIds.length) {
                setAssignPreview({ empty: true, strategy });
                return;
            }

            const { data } = await CmasterService.previewStudentsAutoAssign({
                student_ids: studentIds,
                strategy,
                agent_ids: agentIds,
            });

            setAssignPreview(data?.result || null);
        } catch (e) {
            console.error('Preview error:', e);
            setAssignPreview(null);
            const msg = e?.response?.data?.message || e?.message || 'Failed to load preview';
            setPreviewError(msg);
        } finally {
            setPreviewLoading(false);
        }
    };

    const loadCounsellorUsers = (includeAll = false) => {
        setUsersLoading(true);
        // Use allUsers like other screens (e.g. Campaign, Students) so response shape matches
        return UserService.allUsers(includeAll ? {} : { status: 1 })
            .then(({ data }) => {
                // Other pages use data.result.data for allUsers response
                const all = data?.result?.data || [];
                console.log('Counsellor users loaded:', all); // Debug log
                setCounsellorUsers(all);
                return all;
            })
            .catch((e) => {
                console.error('Error loading counsellor users:', e); // Debug log
                message.error(e.message || "Failed to load counsellor users");
                setCounsellorUsers([]); // Ensure empty array on error
                return [];
            })
            .finally(() => {
                setUsersLoading(false);
            });
    };

    const loadCountries = (includeAll = false) => {
        setCountriesLoading(true);
        return CmasterService.allCountries(includeAll ? {} : { status: 1 })
            .then((res) => {
                const all = res?.data?.result?.data || [];
                console.log('Countries loaded:', all); // Debug log
                setCountries(all);
                return all;
            })
            .catch((e) => {
                console.error('Error loading countries:', e); // Debug log
                message.error(e.message || "Failed to load countries");
                setCountries([]); // Ensure empty array on error
                return [];
            })
            .finally(() => {
                setCountriesLoading(false);
            });
    };

    const loadDisciplines = (includeAll = false) => {
        setDisciplinesLoading(true);
        const req = includeAll ? CmasterService.allDisciplines({}) : CmasterService.disciplines({ status: 1 });
        return req
            .then(({ data }) => {
                const all = data?.result?.data || [];
                console.log('Disciplines loaded:', all); // Debug log
                setDisciplines(all);
                return all;
            })
            .catch((e) => {
                console.error('Error loading disciplines:', e); // Debug log
                message.error(e.message || "Failed to load disciplines");
                setDisciplines([]); // Ensure empty array on error
                return [];
            })
            .finally(() => {
                setDisciplinesLoading(false);
            });
    };

    const fetchStudentCount = async (formValues) => {
        console.log('fetchStudentCount called with:', formValues); // Debug log
        setCountLoading(true);
        try {
            const params = {};
            
            if (Array.isArray(formValues.country) && formValues.country.length) {
                params.country_id = extractSelectValues(formValues.country).map((x) => Number(x)).filter(Boolean);
            }
            if (Array.isArray(formValues.registered_via) && formValues.registered_via.length) {
                params.registered_via = formValues.registered_via;
            }
            if (Array.isArray(formValues.disciplines) && formValues.disciplines.length) {
                params.discipline_id = extractSelectValues(formValues.disciplines).map((x) => Number(x)).filter(Boolean);
            } else if (typeof formValues.disciplines !== 'undefined' && formValues.disciplines !== null && formValues.disciplines !== "") {
                params.discipline_id = [Number(formValues.disciplines)].filter(Boolean);
            }

            console.log('Sending params to API:', params); // Debug log
            const { data } = await StudentService.getStudentCount(params);
            console.log('API response:', data); // Debug log
            const count = data?.result?.count || 0;
            console.log('Setting student count to:', count); // Debug log
            setStudentCount(count);
        } catch (e) {
            console.error("Failed to fetch student count:", e);
            setStudentCount(0);
        } finally {
            setCountLoading(false);
        }
    };

    // List automations from backend
    const list = async (p, ps) => {
        setLoading(true);
        try {
            sdataRef.current.p = p || 1;
            sdataRef.current.ps = ps || sdataRef.current.ps;

            const params = {
                page: sdataRef.current.p,
                page_size: sdataRef.current.ps,
            };

            const { data } = await CmasterService.leadAutomations(params);
            const res = data?.result || {};
            console.log('Backend response data:', res.data); // Debug log
            const rows = (res.data || []).map((r, index) => {
                console.log(`Row ${index}:`, r); // Debug log
                
                // Handle multiple disciplines display
                let disciplineDisplay = "";
                if (r.discipline_name) {
                    disciplineDisplay = r.discipline_name;
                } else if (r.discipline_id) {
                    // If we have discipline IDs but no names, show the IDs
                    const ids = Array.isArray(r.discipline_id) ? r.discipline_id : [r.discipline_id];
                    disciplineDisplay = ids.join(", ");
                }
                
                // Handle multiple courses display
                let coursesDisplay = "";
                if (r.course_name) {
                    coursesDisplay = r.course_name;
                } else if (r.course_id) {
                    // If we have course IDs but no names, show the IDs
                    const ids = Array.isArray(r.course_id) ? r.course_id : [r.course_id];
                    coursesDisplay = ids.join(", ");
                }
                
                return {
                    ...r,
                    id: r.id, // Explicitly preserve the id
                    automation_name: r.name,
                    strategy: (r.strategy === 'country' ? 'dataset' : (r.strategy === 'discipline' ? 'round_robin' : (r.strategy || ""))),
                    registered_via: Array.isArray(r.registered_via) ? r.registered_via.join(", ") : r.registered_via,
                    discipline: disciplineDisplay,
                    courses: coursesDisplay,
                    priority: r.priority,
                    status: r.status === 1 || r.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
                };
            });
            console.log('Processed rows:', rows); // Debug log

            setResult({
                data: rows,
                page: res.page || {},
            });
            return rows;
        } catch (err) {
            message.error(err.message || "Failed to fetch automations");
            return [];
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = async (record) => {
        try {
            setModalType("edit");
            console.log('Opening edit modal for record:', record); // Debug log
            
            // Reset form and state first
            form.resetFields();
            setFormData({});
            setStudentCount(0);
            
            // Show modal
            setShowModal(true);

            const { data } = await CmasterService.getLeadAutomation(record.id);
            console.log('API response for edit:', data); // Debug log
            const res = data?.result || {};
            console.log('Parsed result:', res); // Debug log

            // Parse filters_json if it exists
            let filters = {};
            if (res.filters_json) {
                try {
                    if (typeof res.filters_json === 'string') {
                        filters = JSON.parse(res.filters_json);
                    } else {
                        filters = res.filters_json;
                    }
                    console.log('Parsed filters:', filters); // Debug log
                } catch (e) {
                    console.error('Error parsing filters_json:', e);
                    filters = {};
                }
            }

            // Parse discipline_ids from filters_json first, then fallback to discipline_id
            let disciplineIds = [];
            if (filters.discipline_ids && Array.isArray(filters.discipline_ids)) {
                disciplineIds = filters.discipline_ids.map(id => Number(id)).filter(Boolean);
            } else if (res.discipline_id) {
                if (typeof res.discipline_id === 'string') {
                    disciplineIds = res.discipline_id.split(',').map(id => parseInt(String(id).trim())).filter(Boolean);
                } else if (Array.isArray(res.discipline_id)) {
                    disciplineIds = res.discipline_id.map(id => Number(id)).filter(Boolean);
                } else {
                    disciplineIds = [Number(res.discipline_id)].filter(Boolean);
                }
            }

            // Parse country_ids from filters_json
            let countryIds = [];
            if (filters.country_ids && Array.isArray(filters.country_ids)) {
                countryIds = filters.country_ids.map(id => Number(id)).filter(Boolean);
            }

            // Parse registered_via which might be a string or array
            let registeredViaArray = [];
            if (res.registered_via) {
                if (typeof res.registered_via === 'string') {
                    registeredViaArray = res.registered_via
                        .split(',')
                        .map((x) => String(x).trim())
                        .filter(Boolean);
                } else if (Array.isArray(res.registered_via)) {
                    registeredViaArray = res.registered_via;
                }
            }

            console.log('Parsed IDs:', { disciplineIds, countryIds }); // Debug log

            // Load dropdowns without status restriction in edit mode so existing (possibly inactive) values still resolve to labels
            const [counsellorsData, countriesData, disciplinesData] = await Promise.all([
                loadCounsellorUsers(true),
                loadCountries(true),
                loadDisciplines(true)
            ]);

            console.log('Dropdown data loaded (edit):', {
                counsellors: counsellorsData.length,
                countries: countriesData.length,
                disciplines: disciplinesData.length
            });

            const countryValue = countryIds.map((id) => {
                const found = (countriesData || []).find((c) => String(c.id) === String(id));
                return { value: String(id), label: found?.name || String(id) };
            });

            const disciplineValue = disciplineIds.map((id) => {
                const found = (disciplinesData || []).find((d) => String(d.id) === String(id));
                return { value: String(id), label: found?.name || String(id) };
            });

            const counsellorValue = (Array.isArray(res.agents) ? res.agents : []).map((a) => {
                const id = a?.id;
                const found = (counsellorsData || []).find((u) => String(u.id) === String(id));
                const name = found ? `${found.fname || ''} ${found.lname || ''}`.trim() : '';
                const label = (name || found?.email || found?.username) || (id ? `User #${id}` : '');
                return { value: String(id), label };
            }).filter((x) => x.value !== 'undefined' && x.value !== 'null' && x.value !== '');

            const initialData = {
                id: res.id,
                automation_name: res.name || "",
                strategy: res.strategy === 'country' ? 'dataset' : (res.strategy === 'discipline' ? 'round_robin' : (res.strategy || 'dataset')),
                status: res.status === 1 || res.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
                registered_via: registeredViaArray,
                disciplines: disciplineValue,
                country: countryValue,
                divided_into: counsellorValue,
                priority: res.priority || 100,
                description: res.description || "",
            };

            console.log('Setting form data to:', initialData); // Debug log
            setFormData(initialData);
            
            // Add a small delay to ensure all Select options are rendered before setting form values
            // This prevents showing IDs instead of text labels
            setTimeout(() => {
                form.setFieldsValue(initialData);
                console.log('Form values set:', form.getFieldsValue()); // Debug log
                
                // Fetch initial student count after form is populated
                fetchStudentCount(initialData);
                fetchAssignPreview(initialData);
            }, 100); // Small delay to ensure DOM is updated with options
            
        } catch (e) {
            console.error('Error in openEditModal:', e); // Debug log
            message.error(e.message || "Failed to load automation detail");
        }
    };

    const openAddModal = async () => {
        setModalType("add");
        
        // Reset everything first
        form.resetFields();
        setFormData({});
        setStudentCount(0);
        
        // Show modal
        setShowModal(true);
        
        const initialData = {
            automation_name: "",
            status: "ACTIVE",
            registered_via: [],
            disciplines: [],
            country: [],
            divided_into: [],
            strategy: "dataset",
            priority: 100,
            description: ""
        };
        
        setFormData(initialData);
        
        // Load dropdown data
        await Promise.all([
            loadCounsellorUsers(),
            loadCountries(),
            loadDisciplines()
        ]);
        
        // Add a small delay to ensure all Select options are rendered before setting form values
        setTimeout(() => {
            // Set form values after dropdowns are loaded
            form.setFieldsValue(initialData);
            // Fetch initial student count for empty form
            fetchStudentCount(initialData);
            fetchAssignPreview(initialData);
        }, 100); // Small delay to ensure DOM is updated with options
    };

    const deleteRecord = (id) => {
        console.log('deleteRecord called with id:', id); // Debug log
        if (!id) {
            message.error("No automation ID provided");
            return;
        }
        confirm({
            title: "Do you want to delete this automation?",
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            async onOk() {
                try {
                    const { data } = await CmasterService.deleteLeadAutomation(id);
                    message.success(data?.message || "Automation deleted");
                    list(sdataRef.current.p, sdataRef.current.ps);
                } catch (e) {
                    message.error(e.message || "Failed to delete automation");
                }
            },
        });
    };

    const columns = [
        { title: "SN", key: "sn", render: (value, record, index) => index + 1 },
        { title: "Automation Name", key: "automation_name" },
        {
            title: "Strategy",
            key: "strategy",
            render: (v) => {
                if (v === 'round_robin') return 'Round Robin';
                if (v === 'dataset' || v === 'country') return 'Dataset';
                if (v === 'discipline') return 'Discipline';
                return v || 'Round Robin';
            },
        },
        { title: "Registered Via", key: "registered_via" },
        { title: "Discipline", key: "discipline" },
        {
            title: "Courses",
            key: "courses",
            render: (v, record) => {
                if (record?.course_name) return record.course_name;
                const ids = normalizeIdArray(record?.course_id);
                const resolved = ids
                    .map((id) => courseNameById[String(id)] || "")
                    .filter(Boolean);
                if (resolved.length) return resolved.join(", ");
                return v;
            },
        },
        {
            title: "Action",
            key: "action",
             render: (value, record) => {
                console.log('Action render - value:', value, 'record:', record); // Debug log
                return (
                    <Button.Group size="small">
                        <Button style={{ marginRight: 8 }} type="default" onClick={() => openEditModal(record)}>
                            <i className="fa fa-edit"></i>
                        </Button>
                        <Button style={{ marginRight: 8 }} type="default" onClick={() => {
                            console.log('Delete clicked - record:', record, 'record.id:', record?.id); // Debug log
                            deleteRecord(record?.id);
                        }}>
                            <i className="fa fa-times-circle font-red"></i>
                        </Button>
                    </Button.Group>
                );
            },
        }
    ];

    useEffect(() => {
        list();
        return () => {
            message.destroy();
        };
    }, []);

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <div>
                    <h2>
                        <i className="fa fa-handshake"></i> Lead Assign Automation
                    </h2>
                </div>
            </div>

            <div className="page-pad">
                <div className="d-flex tbl-search-head mb-2">
                    <SearchForm dataRef={sdataRef} onSearch={list} />
                    <div className="ml-auto my-auto">
                        <Button onClick={openAddModal} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}>
                            <i className="fa fa-plus mr5"></i> Add
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center my-5">
                        <Spin size="large" />
                    </div>
                ) : result.data.length ? (
                    <>
                        <div className="mb8" style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                            Showing {result.page.start + 1} -{" "}
                            {result.page.start + result.page.total} of {result.page.total_records} records.
                        </div>

                        <div className="table-responsive">
                            <table className="table table-bordered table-md table-striped table-hover m-0">
                                <thead className="thead-light text-uppercase table-text-vmid">
                                    <tr>
                                        {columns.map((col) => (
                                            <th key={col.key} className={col.key === "sn" ? "w60" : ""}>
                                                {col.title}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="table-text-top">
                                    {result.data.map((row, i) => (
                                        <tr key={row.id || `row-${i}`}>
                                            {columns.map((col, idx) => (
                                                <td key={idx}>
                                                    {col.render ? col.render(row[col.key], row, i) : row[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex tbl-foot-bx" style={{ justifyContent: 'center', marginTop: 12 }}>
                            <AntdPaging
                                onChange={list}
                                total={result.page.total_records}
                                current={sdataRef.current.p}
                                pageSize={sdataRef.current.ps}
                                showSizeChanger
                                showTotal={(total, range) => (
                                    <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13, marginRight: 12 }}>
                                        {range[0]}–{range[1]} of {total} records
                                    </span>
                                )}
                            />
                        </div>
                    </>
                ) : (
                    <div className="no-rec">No record found</div>
                )}
            </div>

            {/* Modal */}
            <Modal
                title={modalType === "edit" ? "Edit Lead Assign Automation" : "Add Lead Assign Automation"}
                open={showModal}
                onCancel={() => {
                    form.resetFields();
                    setFormData({});
                    setStudentCount(0);
                    setShowModal(false);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        form.resetFields();
                        setFormData({});
                        setStudentCount(0);
                        setShowModal(false);
                    }}>
                        Close
                    </Button>,
                    <Button key="save" type="primary" onClick={() => form.submit()}>
                        {modalType === "edit" ? "Update" : "Save"}
                    </Button>,
                ]}
                width={600}
                styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={async (values) => {
                        try {
                            console.log('Form values on submit:', values); // Debug log
                            console.log('Modal type:', modalType); // Debug log
                            console.log('Form data state:', formData); // Debug log
                            const studentIds = [];

                            // Convert UI strategy values to DB values
                            // dataset -> country, round_robin -> discipline
                            let strategyForDB = values.strategy || 'country';
                            if (values.strategy === 'dataset') {
                                strategyForDB = 'country';
                            } else if (values.strategy === 'round_robin') {
                                strategyForDB = 'discipline';
                            }

                            const payload = {
                                name: values.automation_name,
                                strategy: strategyForDB,
                                registered_via: Array.isArray(values.registered_via) ? values.registered_via.join(",") : (values.registered_via || ""),
                                discipline_id: extractSelectValues(values.disciplines).map((x) => Number(x)).filter(Boolean),
                                filters_json: {
                                    country_ids: extractSelectValues(values.country).map((x) => Number(x)).filter(Boolean),
                                },
                                agents: extractSelectValues(values.divided_into).map((x) => Number(x)).filter(Boolean),
                                student_ids: studentIds,
                                automation_id: formData.id || undefined,
                            };

                            if (modalType === "edit") {
                                payload.status = values.status || (formData.status === "ACTIVE" ? 1 : 0);
                                payload.priority = values.priority || formData.priority || 100;
                                payload.description = values.description || formData.description || "";
                            }

                            console.log('Payload being sent:', payload); // Debug log

                            if (modalType === "edit" && formData.id) {
                                const { data } = await CmasterService.updateLeadAutomation(formData.id, payload);
                                message.success(data?.message || "Automation updated");
                            } else {
                                const { data } = await CmasterService.createLeadAutomation(payload);
                                message.success(data?.message || "Automation added");
                            }

                            form.resetFields();
                            setFormData({});
                            setStudentCount(0);
                            setShowModal(false);
                            list(sdataRef.current.p, sdataRef.current.ps);
                        } catch (e) {
                            message.error(e.message || "Failed to save automation");
                        }
                    }}
                >
                    <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                        <Form.Item
                            name="automation_name"
                            label="Automation Name"
                            rules={[{ required: true, message: "Please enter automation name" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Enter Automation Name" />
                        </Form.Item>
                        <Form.Item name="strategy" label="Strategy" style={{ flex: 1 }}>
                            <Select placeholder="Select Strategy" onChange={(v) => {
                                console.log('Strategy changed to:', v); // Debug log
                                const currentValues = form.getFieldsValue();
                                console.log('Current form values before strategy change:', currentValues); // Debug log
                                const next = {
                                    ...currentValues,
                                    strategy: v,
                                    registered_via: v === 'round_robin' ? ['ONLINE'] : (currentValues.registered_via || []),
                                };

                                if (v === 'round_robin') {
                                    form.setFieldsValue({ registered_via: ['ONLINE'] });
                                }
                                
                                // Explicitly set the strategy value to ensure it's updated
                                form.setFieldsValue({ strategy: v });
                                console.log('Form values after strategy change:', form.getFieldsValue()); // Debug log

                                fetchStudentCount(next);
                                fetchAssignPreview(next);
                            }} getPopupContainer={triggerNode => triggerNode.parentNode}>
                                <Select.Option value="dataset">Dataset</Select.Option>
                                <Select.Option value="round_robin">Round Robin</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "12px" }}>
                        Leads Filter Criteria
                    </div> */}

                    {/* Student Count Display */}
                    {/* <div style={{ 
                        backgroundColor: "#f0f8ff", 
                        border: "1px solid #d1ecf1", 
                        borderRadius: "4px", 
                        padding: "12px", 
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className="fa fa-users" style={{ color: "#0c5460" }}></i>
                            <span style={{ fontWeight: "500", color: "#0c5460" }}>
                                Students matching current filters:
                            </span>
                            <span style={{ fontSize: "12px", color: "#6c757d", fontStyle: "italic" }}>
                                (Country & Discipline filters only)
                            </span>
                        </div>
                        <div style={{ 
                            fontWeight: "bold", 
                            fontSize: "18px", 
                            color: "#0c5460",
                            minWidth: "40px",
                            textAlign: "center"
                        }}>
                            {countLoading ? (
                                <Spin size="small" />
                            ) : (
                                studentCount
                            )}
                        </div>
                    </div> */}

                    {/* Row: Country + Registered Via (same line) */}
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <Form.Item
                                name="country"
                                label="Country"
                                rules={[{ required: true, type: 'array', min: 1, message: 'Please select at least one country' }]}
                            >
                                <Select
                                    labelInValue
                                    mode="multiple"
                                    allowClear
                                    placeholder="Select country/countries"
                                    showSearch
                                    optionFilterProp="children"
                                    loading={countriesLoading}
                                    onChange={(values) => {
                                        // Fetch student count when country changes
                                        const currentValues = form.getFieldsValue();
                                        const newValues = { ...currentValues, country: values };
                                        console.log('Country changed, calling fetchStudentCount with:', newValues); // Debug log
                                        fetchStudentCount(newValues);
                                        fetchAssignPreview(newValues);
                                    }}
                                    getPopupContainer={triggerNode => triggerNode.parentNode}
                                >
                                    {countries.map((c) => (
                                        <Select.Option key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.strategy !== cur.strategy}>
                                {() => {
                                    const strategy = form.getFieldValue('strategy') || 'dataset';
                                    const viaOptions = strategy === 'round_robin' ? ['ONLINE'] : registeredViaOptions;
                                    const disabled = strategy === 'round_robin';

                                    return (
                                        <Form.Item name="registered_via" label="Registered Via">
                                            <Select
                                                mode="multiple"
                                                allowClear={!disabled}
                                                showSearch
                                                placeholder="Select options"
                                                optionFilterProp="children"
                                                disabled={disabled}
                                                onChange={(values) => {
                                                    const currentValues = form.getFieldsValue();
                                                    const newValues = { ...currentValues, registered_via: values };
                                                    console.log('Registered Via changed, calling fetchStudentCount with:', newValues); // Debug log
                                                    fetchStudentCount(newValues);
                                                    fetchAssignPreview(newValues);
                                                }}
                                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                            >
                                                {viaOptions.map((v) => (
                                                    <Select.Option key={v} value={v}>
                                                        {v}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    );
                                }}
                            </Form.Item>
                        </div>
                    </div>

                    {/* Row: Discipline */}
                    <Form.Item name="disciplines" label="Discipline">
                        <Select
                            labelInValue
                            mode="multiple"
                            allowClear
                            placeholder="Select disciplines"
                            showSearch
                            optionFilterProp="children"
                            loading={disciplinesLoading}
                            onChange={(values) => {
                                // Fetch student count when disciplines change
                                const currentValues = form.getFieldsValue();
                                const newValues = { ...currentValues, disciplines: values };
                                console.log('Disciplines changed, calling fetchStudentCount with:', newValues); // Debug log
                                fetchStudentCount(newValues);
                                fetchAssignPreview(newValues);
                            }}
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                        >
                            {disciplines.map((d) => (
                                <Select.Option key={d.id} value={String(d.id)}>
                                    {d.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "12px" }}>
                        Divide Leads Into These Counsellors/Users
                    </div>
                    <Form.Item name="divided_into" label="Select Counsellors/Users">
                        <Select
                            labelInValue
                            mode="multiple"
                            allowClear
                            showSearch
                            placeholder="Select Counsellors/Users"
                            optionFilterProp="children"
                            loading={usersLoading}
                            onChange={(selectedUserIds) => {
                                // Update distribution preview when counsellors change
                                const currentValues = form.getFieldsValue();
                                const next = { ...currentValues, divided_into: selectedUserIds };
                                fetchStudentCount(next);
                                fetchAssignPreview(next);
                            }}
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                        >
                            {counsellorUsers.map((u) => {
                                const name = `${u.fname || ""} ${u.lname || ""}`.trim();
                                const label = name || u.email || u.username || `User #${u.id}`;
                                return (
                                    <Select.Option key={u.id} value={String(u.id)}>
                                        {label}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    {/* Assignment Distribution Preview (server-side accurate) */}
                    {(() => {
                        const selectedCounsellors = (form.getFieldValue('divided_into') || []).map((x) => String(x));
                        const selectedCounsellorData = counsellorUsers.filter((u) => selectedCounsellors.includes(String(u.id)));
                        const strategy = form.getFieldValue('strategy') || 'country';
                        if (!selectedCounsellorData.length) {
                            return null;
                        }

                        // return (
                        //     <div
                        //         style={{
                        //             backgroundColor: '#f5f5f5',
                        //             border: '1px solid #d9d9d9',
                        //             borderRadius: '4px',
                        //             padding: '12px',
                        //             marginBottom: '16px',
                        //         }}
                        //     >
                        //         <div
                        //             style={{
                        //                 fontWeight: 'bold',
                        //                 fontSize: '14px',
                        //                 marginBottom: '8px',
                        //                 color: '#595959',
                        //                 display: 'flex',
                        //                 alignItems: 'center',
                        //                 gap: '8px',
                        //             }}
                        //         >
                        //             <i className="fa fa-users"></i>
                        //             Assignment Preview (based on unassigned leads)
                        //             {previewLoading ? <Spin size="small" /> : null}
                        //         </div>

                        //         {previewError ? (
                        //             <div style={{ color: '#cf1322', fontSize: 12 }}>{previewError}</div>
                        //         ) : assignPreview?.empty ? (
                        //             <div style={{ color: '#8c8c8c', fontSize: 12 }}>No students found for current filters.</div>
                        //         ) : assignPreview ? (
                        //             <>
                        //                 <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 8 }}>
                        //                     Strategy: <strong>{strategy}</strong> | Total: <strong>{assignPreview.total}</strong> | Unassigned: <strong>{assignPreview.unassigned}</strong> | Already assigned: <strong>{assignPreview.already_assigned}</strong>
                        //                 </div>

                        //                 {strategy === 'country' ? (
                        //                     <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                        //                         {Object.keys(assignPreview.per_country || {}).length ? (
                        //                             Object.entries(assignPreview.per_country).map(([countryId, dist]) => {
                        //                                 const countryName = (countries || []).find((c) => String(c.id) === String(countryId))?.name || `Country #${countryId}`;
                        //                                 return (
                        //                                     <div key={countryId} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4, padding: 8 }}>
                        //                                         <div style={{ fontWeight: 600, marginBottom: 6 }}>{countryName}</div>
                        //                                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                        //                                             {selectedCounsellorData.map((u) => {
                        //                                                 const name = `${u.fname || ''} ${u.lname || ''}`.trim();
                        //                                                 const label = name || u.email || u.username || `User #${u.id}`;
                        //                                                 const cnt = dist?.[u.id] || dist?.[String(u.id)] || 0;
                        //                                                 return (
                        //                                                     <div key={u.id} style={{ border: '1px solid #f0f0f0', borderRadius: 4, padding: 8, fontSize: 12 }}>
                        //                                                         <div style={{ fontWeight: 500, color: '#595959' }}>{label}</div>
                        //                                                         <div style={{ color: '#8c8c8c' }}>Will get: <strong>{cnt}</strong></div>
                        //                                                     </div>
                        //                                                 );
                        //                                             })}
                        //                                         </div>
                        //                                     </div>
                        //                                 );
                        //                             })
                        //                         ) : (
                        //                             <div style={{ color: '#8c8c8c', fontSize: 12 }}>No country-wise preview available for current filters.</div>
                        //                         )}
                        //                     </div>
                        //                 ) : (
                        //                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                        //                         {selectedCounsellorData.map((u) => {
                        //                             const name = `${u.fname || ''} ${u.lname || ''}`.trim();
                        //                             const label = name || u.email || u.username || `User #${u.id}`;
                        //                             const cnt = assignPreview.per_user?.[u.id] || assignPreview.per_user?.[String(u.id)] || 0;
                        //                             return (
                        //                                 <div key={u.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '8px', fontSize: '12px' }}>
                        //                                     <div style={{ fontWeight: '500', color: '#595959' }}>{label}</div>
                        //                                     <div style={{ color: '#8c8c8c' }}>Will get: <strong>{cnt}</strong></div>
                        //                                 </div>
                        //                             );
                        //                         })}
                        //                     </div>
                        //                 )}
                        //             </>
                        //         ) : (
                        //             <div style={{ color: '#8c8c8c', fontSize: 12 }}>Select filters and counsellors to see preview.</div>
                        //         )}
                        //     </div>
                        // );
                    })()}
                </Form>
            </Modal>
        </div>
    );
}

const SearchForm = ({ dataRef, onSearch }) => {
    const [data, setData] = useState({ ...dataRef.current });

    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    };

    useEffect(() => {
        dataRef.current = { ...data };
    }, [data]);

    return (
        <form onSubmit={(e) => e.preventDefault()} autoComplete="off" spellCheck="false">
            <style>{`.lead-auto-search .ant-input::placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 14px !important; opacity: 1 !important; }`}</style>
            <div className="d-flex lead-auto-search" style={{ gap: 8 }}>
                <div>
                    <Input
                        placeholder="Search"
                        allowClear
                        value={data.k}
                        onChange={(e) => handleChange(e.target.value, "k")}
                    />
                </div>
                <div>
                    <Button
                        icon={<i className="fa fa-search fs13"></i>}
                        onClick={() => onSearch(data.p, data.ps)}
                        style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 6, height: 32 }}
                    />
                </div>
            </div>
        </form>
    );
};
