// import React, {
//     useState,
//     useEffect,
//     useRef,
//     forwardRef,
//     useImperativeHandle,
// } from "react"
// import { AntdTag, AntdDatepicker, AntdSelect } from "../../utils/Antd"
// import util from "../../utils/util"
// import {
//     Table,
//     Input,
//     Button,
//     message,
//     Modal,
//     Card,
//     Row,
//     Col,
//     Typography,
//     Select,
//     Tabs,
// } from "antd"
// import {
//     ExclamationCircleOutlined,
//     PlusOutlined,
//     SearchOutlined,
// } from "@ant-design/icons"
// import CmasterService from "../../services/CmasterService"
// import StudentService from "../../services/StudentService"
// import UserService from "../../services/UserService"
// import CampaignService from "../../services/CampaignService"

// const { confirm } = Modal
// const { Text } = Typography
// const { Option } = Select
// const { TabPane } = Tabs

// /* -------------------- Add Leads Modal -------------------- */
// export const AddLeadsModal = forwardRef(({ isInstitute = false }, ref) => {
//     const [show, setShow] = useState(false)
//     const [data, setData] = useState({})
//     const [students, setStudents] = useState([])
//     const [loading, setLoading] = useState(false)

//     // dropdown states
//     const [countries, setCountries] = useState([])
//     const [acadCareers, setAcadCareers] = useState([])
//     const [disciplines, setDisciplines] = useState([])
//     const [genders, setGenders] = useState([])
//     const [users, setUsers] = useState([])

//     const handleChange = (v, k) => setData({ ...data, [k]: v })

//     useImperativeHandle(ref, () => ({
//         open() {
//             setData({})
//             setStudents([])
//             setShow(true)
//         },
//     }))

//     // fetch dropdowns from backend
//     useEffect(() => {
//         const fetchDropdowns = async () => {
//             try {
//                 const [countriesRes, careersRes, disciplinesRes, gendersRes, usersRes] =
//                     await Promise.all([
//                         CmasterService.allCountries({ status: 1 }),
//                         CmasterService.acadCareers({ status: 1 }),
//                         CmasterService.allDisciplines({ status: 1 }),
//                         CmasterService.genders({ status: 1 }),
//                         UserService.allUsers({ status: 1 }),
//                     ])

//                 // update state safely if path exists
//                 setCountries(countriesRes?.data?.result?.data || [])
//                 setAcadCareers(careersRes?.data?.result?.data || [])
//                 setDisciplines(disciplinesRes?.data?.result?.data || [])
//                 setGenders(gendersRes?.data?.result?.data || [])
//                 setUsers(usersRes?.data?.result?.data || [])
//             } catch (e) {
//                 console.error("Error fetching dropdowns", e)
//                 message.error("Failed to load form data")
//             }
//         }
//         fetchDropdowns()
//     }, [])

//     const handleApply = () => {
//         setLoading(true)
//         const filters = { ...data }

//         StudentService.list(filters)
//             .then(({ data }) => {
//                 const res = data.result || {}
//                 const studentsList = (res.data || []).map((s) => ({
//                     ...s,
//                     key: s.id,
//                 }))
//                 setStudents(studentsList)
//                 if (studentsList.length === 0)
//                     message.info("No students found for selected filters.")
//             })
//             .catch((e) => {
//                 message.error(
//                     e.response?.data?.message || e.message || "Failed to load students"
//                 )
//                 setStudents([])
//             })
//             .finally(() => setLoading(false))
//     }

//     const columns = [
//         { title: "RegNo", dataIndex: "regno" },
//         { title: "Name", dataIndex: "name" },
//         { title: "Email", dataIndex: "email" },
//         { title: "Mobile", dataIndex: "mobile" },
//         {
//             title: "DOB",
//             dataIndex: "dob",
//             render: (d) => (d ? util.getDate(d, "DD MMM YYYY") : "-"),
//         },
//         { title: "City", dataIndex: "resident_city" },
//         { title: "State", dataIndex: "resident_state" },
//         { title: "Academic Career", dataIndex: "acad_career" },
//         {
//             title: "Created On",
//             dataIndex: "created",
//             render: (c) => util.getDate(c, "DD MMM YYYY"),
//         },
//     ]

//     return (
//         <Modal
//             title="Add Leads"
//             open={show}
//             onCancel={() => setShow(false)}
//             width={1100}
//             okText="Apply Filter"
//             onOk={handleApply}
//             maskClosable={false}
//             destroyOnClose
//         >
//             <Card size="small" title="Filter Criteria" style={{ marginBottom: 16 }}>
//                 <form
//                     onSubmit={(e) => e.preventDefault()}
//                     autoComplete="off"
//                     spellCheck="false"
//                 >
//                     <Row gutter={[16, 16]}>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>From Date</label>
//                                 <AntdDatepicker
//                                     value={data.from}
//                                     onChange={(dt) => handleChange(dt, "from")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>To Date</label>
//                                 <AntdDatepicker
//                                     value={data.to}
//                                     onChange={(dt) => handleChange(dt, "to")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Gender</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     options={genders.map((v) => ({ id: v.id, name: v.name }))}
//                                     value={data.gender_id}
//                                     onChange={(v) => handleChange(v, "gender_id")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Country</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     showSearch
//                                     mode="multiple"
//                                     options={countries.map((v) => ({ id: v.id, name: v.name }))}
//                                     value={[...(data.country_id || [])]}
//                                     onChange={(v) => handleChange(v, "country_id")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Academic Career</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     showSearch
//                                     mode="multiple"
//                                     options={acadCareers.map((v) => ({ id: v.id, name: v.name }))}
//                                     value={[...(data.ac_id || [])]}
//                                     onChange={(v) => handleChange(v, "ac_id")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Discipline</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     showSearch
//                                     mode="multiple"
//                                     options={disciplines.map((v) => ({ id: v.id, name: v.name }))}
//                                     value={[...(data.discipline_id || [])]}
//                                     onChange={(v) => handleChange(v, "discipline_id")}
//                                 />
//                             </div>
//                         </Col>

//                         {!isInstitute && (
//                             <>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Basic Info Done?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.basic_info}
//                                             onChange={(v) => handleChange(v, "basic_info")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Educational Info Done?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.edu_info}
//                                             onChange={(v) => handleChange(v, "edu_info")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Document Uploaded?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.doc_uploaded}
//                                             onChange={(v) => handleChange(v, "doc_uploaded")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Document Verified?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.doc_verified}
//                                             onChange={(v) => handleChange(v, "doc_verified")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Background Info Done?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.background_info}
//                                             onChange={(v) => handleChange(v, "background_info")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Assigned To</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             showSearch
//                                             allowClear
//                                             options={users.map((v) => ({
//                                                 id: v.id,
//                                                 name: `${v.name} (${v.role})`,
//                                             }))}
//                                             value={data.assigned_to}
//                                             onChange={(v) => handleChange(v, "assigned_to")}
//                                         />
//                                     </div>
//                                 </Col>
//                             </>
//                         )}

//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Search</label>
//                                 <Input
//                                     placeholder="RegNo./Name/Email/Mob"
//                                     allowClear
//                                     value={data.k}
//                                     onChange={(e) => handleChange(e.target.value, "k")}
//                                 />
//                             </div>
//                         </Col>

//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Payment Proof</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     options={["Pending", "Uploaded", "Acknowledged", "Rejected"]}
//                                     value={data.payment_proof}
//                                     onChange={(v) => handleChange(v, "payment_proof")}
//                                 />
//                             </div>
//                         </Col>
//                     </Row>
//                 </form>
//             </Card>

//             {students.length > 0 && (
//                 <Card title={`Students (${students.length})`} size="small">
//                     <Table
//                         size="small"
//                         dataSource={students}
//                         columns={columns}
//                         loading={loading}
//                         pagination={{ pageSize: 10 }}
//                         scroll={{ y: 400 }}
//                     />
//                 </Card>
//             )}
//         </Modal>
//     )
// })

// /* -------------------- Campaign List Component -------------------- */
// export const CampaignList = ({
//     refOb = { current: {} },
//     openForm,
//     tabType,
//     filterParams,
//     openAddLeads,
// }) => {
//     const [result, setResult] = useState([])
//     const [loading, setLoading] = useState(false)
//     const [pageMeta, setPageMeta] = useState({})
//     const [templates, setTemplates] = useState([])
//     //   const sdataRef = useRef({ p: 1, ps: 50 });
//     const wh = window.innerHeight
//     useEffect(() => {
//         ; (async () => {
//             await getTemplates() // fetch templates first
//             await getList() // then campaigns
//         })()
//     }, [filterParams, tabType])
//     const handlePageChange = (page, pageSize) => {
//         getList({ ...filterParams, page, page_size: pageSize })
//     }

//     const getTemplates = async () => {
//         //  sdataRef.current.p = p || 1
//         //  sdataRef.current.ps = ps || sdataRef.current.ps
//         try {
//             const res = await CmasterService.emailTemplates()
//             const list = res?.data?.data || []
//             setTemplates(list)
//         } catch (err) {
//             console.error("Error loading templates:", err)
//             message.error("Failed to load templates")
//             setTemplates([])
//         }
//     }

//     const getList = async (params = filterParams) => {
//         setLoading(true)
//         if (templates.length === 0) {
//             await getTemplates()
//         }
//         try {
//             const query = {
//                 page: 1,
//                 page_size: 25,
//                 sort_by: "created_at",
//                 sort_order: "desc",
//                 type: tabType,
//                 ...(filterParams.search ? { search: filterParams.search } : {}),
//                 ...(filterParams.status ? { status: filterParams.status } : {}),
//             }

//             const res = await CampaignService.getAllEmailCampaign(query)

//             const campaigns = res?.data?.data || []

//             const templateMap = {}
//             templates.forEach((tpl) => {
//                 templateMap[tpl.id] = tpl.name
//             })

//             const formatted = campaigns.map((c) => ({
//                 key: c.id,
//                 id: c.id,
//                 name: c.name,
//                 type: c.type,
//                 status: c.status,
//                 sender: c.sender_name,
//                 sender_email: c.sender_email,
//                 reply_to: c.reply_to,
//                 template_id: c.template_id,
//                 scheduled_at: c.scheduled_at
//                     ? new Date(c.scheduled_at).toLocaleString()
//                     : "-",
//                 created_at: new Date(c.created_at).toLocaleString(),
//                 updated_at: new Date(c.updated_at).toLocaleString(),
//                 recipients: c.recipient_count || 0,
//                 created_by: c.created_by,
//                 templateName: templateMap[c.template_id],
//             }))

//             setResult(formatted)

//             // optional: store meta for pagination
//             setPageMeta(res.data.meta || {})
//         } catch (err) {
//             console.error("Error loading campaigns:", err)
//             message.error(err?.response?.data?.message || "Failed to load campaigns")
//             setResult([])
//         } finally {
//             setLoading(false)
//         }
//     }

//     refOb.current = { getList }

//     useEffect(() => {
//         getList()
//     }, [filterParams, tabType])

//     const deleteRecord = (id) => {
//         confirm({
//             title: "Do you want to delete this campaign?",
//             icon: <ExclamationCircleOutlined />,
//             okText: "Yes",
//             okType: "danger",
//             cancelText: "No",
//             async onOk() {
//                 try {
//                     setLoading(true)
//                     await CampaignService.deleteCampaign(id)
//                     message.success("Campaign deleted successfully")
//                     setResult((prev) => prev.filter((v) => v.id !== id))
//                 } catch (err) {
//                     console.error("Delete failed:", err)
//                     const msg =
//                         err?.response?.data?.message ||
//                         err?.response?.data?.error ||
//                         "Failed to delete campaign"
//                     message.error(msg)
//                 } finally {
//                     setLoading(false)
//                 }
//             },
//         })
//     }
//     const cols = [
//         {
//             title: "Campaign Name",
//             dataIndex: "name",
//             width: 220,
//             render: (name, row) => (
//                 <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                     <Text strong style={{ fontSize: 16 }}>
//                         {name}
//                     </Text>
//                     <Text type="secondary" style={{ fontSize: 12 }}>
//                         For: {row.for}
//                     </Text>
//                     <Text type="secondary" style={{ fontSize: 12 }}>
//                         Created: {util.getDate(row.created, "DD MMM YYYY")}
//                     </Text>
//                 </div>
//             ),
//         },
//         {
//             title: "Template",
//             dataIndex: "template",
//             width: 220,
//             align: "center",
//             render: (templateName) => (
//                 <Text type="secondary" style={{ fontSize: 12 }}>
//                     {templateName}
//                 </Text>
//             ),
//         },
//         {
//             title: "No. of Leads",
//             dataIndex: "leads",
//             width: 130,
//             align: "center",
//             render: (leads, row) => (
//                 <div
//                     style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         gap: 4,
//                     }}
//                 >
//                     <Text>{row.recipient_count}</Text>
//                     {row.status.toLowerCase() === "draft" && (
//                         <Button
//                             type="primary"
//                             size="small"
//                             icon={<PlusOutlined />}
//                             onClick={() => openAddLeads(row)}
//                         >
//                             Add Leads
//                         </Button>
//                     )}
//                 </div>
//             ),
//         },
//         {
//             title: "Status",
//             dataIndex: "status",
//             width: 110,
//             align: "center",
//             render: (status) => (
//                 <AntdTag>{status.charAt(0).toUpperCase() + status.slice(1)}</AntdTag>
//             ),
//         },
//         {
//             title: "Created On",
//             dataIndex: "created",
//             width: 160,
//             render: (created) => util.getDate(created, "DD MMM YYYY"),
//         },
//         {
//             title: "Actions",
//             align: "center",
//             width: 130,
//             fixed: "right",
//             render: (row) => (
//                 <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
//                     <Button type="default" size="small" onClick={() => openForm(row)}>
//                         <i className="fa fa-edit" />
//                     </Button>
//                     <Button
//                         type="default"
//                         size="small"
//                         danger
//                         onClick={() => deleteRecord(row.id)}
//                     >
//                         <i className="fa fa-times-circle font-red" />
//                     </Button>
//                 </div>
//             ),
//         },
//     ]

//     refOb.current = { getList }

//     useEffect(() => {
//         getList()
//     }, [filterParams, tabType])
//     return (
//         <Table
//             dataSource={result}
//             columns={cols}
//             loading={loading}
//             pagination={{
//                 current: pageMeta.page,
//                 total: pageMeta.total_items,
//                 pageSize: pageMeta.page_size,
//                 onChange: handlePageChange,
//             }}
//         />
//     )
// }

// /* -------------------- Add/Edit Campaign Modal (Updated Style) -------------------- */
// export const AddEditCampaignForm = forwardRef((props, ref) => {
//     const [showForm, setShowForm] = useState(false)
//     const [data, setData] = useState({
//         status: "Draft",
//         type: "Email",
//         for: "",
//         template_id: "",
//         senderName: "",
//         senderEmail: "",
//         replyTo: "",
//     })
//     const [templates, setTemplates] = useState([])

//     const handleChange = (v, k) => setData({ ...data, [k]: v })

//     const loadTemplates = (typeOverride) => {
//         const typeToUse = typeOverride || data.type

//         const params = {
//             status: "ACTIVE",
//             type: typeToUse,
//         }

//         const service =
//             typeToUse?.toLowerCase() === "whatsapp"
//                 ? CmasterService.whatsappTemplates(params)
//                 : CmasterService.emailTemplates()

//         service
//             .then((res) => {
//                 let templates = res?.data?.data || []

//                 const filteredTemplates = templates.filter((t) => t.status === "ACTIVE")
//                 setTemplates(filteredTemplates)
//             })
//             .catch((err) => {
//                 message.error("Failed to load templates")
//             })
//     }
//     useEffect(() => {
//         if (showForm) {
//             loadTemplates(data.type)
//         }
//     }, [data.type, showForm])
//     useImperativeHandle(ref, () => ({
//         openForm(dtl) {
//             const campaignType =
//                 dtl?.type ||
//                 props.activeTab?.charAt(0).toUpperCase() + props.activeTab?.slice(1) ||
//                 "Email"

//             const defaultData = {
//                 status: "Draft",
//                 type: campaignType,
//                 for: "",
//                 template_id: "",
//                 senderName: "",
//                 senderEmail: "",
//                 replyTo: "",
//             }

//             setData(dtl ? { ...dtl } : defaultData)
//             setShowForm(true)
//             loadTemplates(campaignType)
//         },
//     }))

//     const handleTemplateSelect = (templateId) => {
//         handleChange(templateId, "template_id")
//         if (!templateId) return

//         const selectedTemplate = templates.find((t) => t.id === templateId)
//         if (!selectedTemplate) return

//         setData((prev) => ({
//             ...prev,
//             template_id: templateId,
//             subject: selectedTemplate.subject || "",
//             body: selectedTemplate.body || "",
//         }))
//     }

//     // Add campaign type change handler
//     const handleCampaignTypeChange = (value) => {
//         setData((prev) => ({
//             ...prev,
//             type: value,
//             template_id: "", // Reset template selection when type changes
//         }))
//     }

//     const save = async () => {
//         // Basic validation
//         if (!data.name || !data.type) {
//             message.warning("Campaign name and type are required!")
//             return
//         }

//         const payload = {
//             name: data.name,
//             type: data.type.toLowerCase(), // API expects lowercase type ("email", "whatsapp")
//             template_id: data.template_id || undefined,
//             sender_name: data.senderName || undefined,
//             sender_email: data.senderEmail || undefined,
//             reply_to: data.replyTo || undefined,
//             scheduled_at: data.scheduled_at || undefined, // optional if you add scheduling later
//         }

//         try {
//             const res = await CampaignService.createCampaign(payload)
//             message.success("Campaign created successfully!")

//             setShowForm(false)

//             // Optional: Refresh the campaign list automatically
//             if (props.onSaved && typeof props.onSaved === "function") {
//                 props.onSaved()
//             }
//         } catch (err) {
//             console.error("Error creating campaign:", err)
//             const errMsg =
//                 err.response?.data?.message ||
//                 err.message ||
//                 "Failed to create campaign"
//             message.error(errMsg)
//         }
//     }

//     return (
//         <Modal
//             title={`${data.id ? "Edit" : "Add"} Campaign`}
//             open={showForm}
//             okText="Save"
//             onOk={save}
//             onCancel={() => setShowForm(false)}
//             destroyOnClose
//             maskClosable={false}
//             width={700}
//         >
//             <Card size="small" title="Campaign Details">
//                 <form
//                     onSubmit={(e) => e.preventDefault()}
//                     autoComplete="off"
//                     spellCheck="false"
//                 >
//                     <Row gutter={[12, 12]}>
//                         <Col span={24}>
//                             <label>Campaign Name</label>
//                             <Input
//                                 placeholder="Enter campaign name"
//                                 value={data.name || ""}
//                                 onChange={(e) => handleChange(e.target.value, "name")}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>For</label>
//                             <AntdSelect
//                                 placeholder="Select target"
//                                 value={data.for || undefined}
//                                 onChange={(v) => handleChange(v, "for")}
//                                 options={[
//                                     { id: "Leads", name: "Leads" },
//                                     { id: "Students", name: "Students" },
//                                 ]}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Template</label>
//                             <AntdSelect
//                                 placeholder="Select Template"
//                                 value={data.template_id || undefined}
//                                 onChange={handleTemplateSelect}
//                                 allowClear
//                                 showSearch
//                                 options={templates.map((t) => ({ id: t.id, name: t.name }))}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Sender Name</label>
//                             <Input
//                                 placeholder="Enter sender name"
//                                 value={data.senderName || ""}
//                                 onChange={(e) => handleChange(e.target.value, "senderName")}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Sender Email</label>
//                             <Input
//                                 placeholder="Enter sender email"
//                                 value={data.senderEmail || ""}
//                                 onChange={(e) => handleChange(e.target.value, "senderEmail")}
//                             />
//                         </Col>

//                         <Col span={24}>
//                             <label>Reply To</label>
//                             <Input
//                                 placeholder="Enter reply-to email"
//                                 value={data.replyTo || ""}
//                                 onChange={(e) => handleChange(e.target.value, "replyTo")}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Status</label>
//                             <AntdSelect
//                                 placeholder="Select Status"
//                                 value={data.status || "Draft"}
//                                 onChange={(v) => handleChange(v, "status")}
//                                 options={[
//                                     { id: "Draft", name: "Draft" },
//                                     { id: "Published", name: "Published" },
//                                 ]}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Type</label>
//                             <AntdSelect
//                                 placeholder="Select Type"
//                                 value={data.type || "Email"}
//                                 onChange={(v) => handleCampaignTypeChange(v)}
//                                 options={[
//                                     { id: "Email", name: "Email" },
//                                     { id: "WhatsApp", name: "WhatsApp" },
//                                 ]}
//                             />
//                         </Col>
//                     </Row>
//                 </form>
//             </Card>
//         </Modal>
//     )
// })

// /* -------------------- Main Campaign Component -------------------- */
// export default function Campaign() {
//     const [activeTab, setActiveTab] = useState("email")
//     const [filterFd, setFilterFd] = useState({ name: "", for: "", status: "" })
//     const listRef = useRef({})
//     const formRef = useRef()
//     const addLeadsRef = useRef()

//     const openForm = (campaign) => formRef.current.openForm(campaign)
//     const openAddLeads = () => addLeadsRef.current.open()

//     return (
//         <div className="page-content">
//             <div className="page-head uc d-flex campaigns-head">
//                 <div className="my-auto">
//                     <h2>Campaigns</h2>
//                 </div>
//             </div>
//             <div className="page-pad">
//                 <Tabs activeKey={activeTab} onChange={setActiveTab}>
//                     {["email", "whatsapp"].map((tab) => (
//                         <TabPane
//                             tab={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Campaign`}
//                             key={tab}
//                         >
//                             <Card size="small" bodyStyle={{ padding: 10 }}>
//                                 <Row gutter={[12, 12]} align="middle">
//                                     <Col>
//                                         <Input
//                                             placeholder="Campaign Name"
//                                             allowClear
//                                             value={filterFd.name}
//                                             onChange={(e) =>
//                                                 setFilterFd({ ...filterFd, name: e.target.value })
//                                             }
//                                             style={{ width: 220 }}
//                                         />
//                                     </Col>
//                                     <Col>
//                                         <Select
//                                             placeholder="For"
//                                             allowClear
//                                             style={{ width: 140 }}
//                                             value={filterFd.for || undefined}
//                                             onChange={(v) => setFilterFd({ ...filterFd, for: v })}
//                                             tagRender={(props) => (
//                                                 <AntdTag type="blue">{props.label}</AntdTag>
//                                             )}
//                                         >
//                                             <Option value="Leads">Leads</Option>
//                                             <Option value="Students">Students</Option>
//                                         </Select>
//                                     </Col>
//                                     <Col>
//                                         <Select
//                                             placeholder="Status"
//                                             allowClear
//                                             style={{ width: 140 }}
//                                             value={filterFd.status || undefined}
//                                             onChange={(v) => setFilterFd({ ...filterFd, status: v })}
//                                             tagRender={(props) => (
//                                                 <AntdTag
//                                                     type={props.label === "Draft" ? "warning" : "success"}
//                                                 >
//                                                     {props.label}
//                                                 </AntdTag>
//                                             )}
//                                         >
//                                             <Option value="Draft">Draft</Option>
//                                             <Option value="Published">Published</Option>
//                                         </Select>
//                                     </Col>
//                                     <Col>
//                                         <Button
//                                             type="primary"
//                                             icon={<SearchOutlined />}
//                                             onClick={() => listRef.current.getList(filterFd)}
//                                         >
//                                             Search
//                                         </Button>
//                                     </Col>
//                                     <Col flex="auto" />
//                                     <Col>
//                                         <Button
//                                             type="primary"
//                                             icon={<PlusOutlined />}
//                                             onClick={() => openForm()}
//                                         >
//                                             Create New
//                                         </Button>
//                                     </Col>
//                                 </Row>

//                                 <div style={{ marginTop: 12 }}>
//                                     <CampaignList
//                                         refOb={listRef}
//                                         openForm={openForm}
//                                         tabType={tab}
//                                         filterParams={filterFd}
//                                         openAddLeads={openAddLeads}
//                                     />
//                                 </div>
//                             </Card>
//                         </TabPane>
//                     ))}
//                 </Tabs>
//             </div>
//             <AddEditCampaignForm
//                 ref={formRef}
//                 activeTab={activeTab}
//                 onSaved={() => listRef.current.getList()}
//             />
//             <AddLeadsModal ref={addLeadsRef} />
//         </div>
//     )
// }



// import React, {
//     useState,
//     useEffect,
//     useRef,
//     forwardRef,
//     useImperativeHandle,
// } from "react"
// import { AntdTag, AntdDatepicker, AntdSelect } from "../../utils/Antd"
// import util from "../../utils/util"
// import {
//     Table,
//     Input,
//     Button,
//     message,
//     Modal,
//     Card,
//     Row,
//     Col,
//     Typography,
//     Select,
//     Tabs,
//     Checkbox,
//     Divider,
//     Descriptions,
//     Statistic,
//     Tag,
// } from "antd"
// import {
//     ExclamationCircleOutlined,
//     PlusOutlined,
//     SearchOutlined,
//     EyeOutlined,
//     MailOutlined,
//     MessageOutlined,
//     WhatsAppOutlined,
//     UserOutlined,
//     ClockCircleOutlined,
// } from "@ant-design/icons"
// import dayjs from "dayjs";
// import CmasterService from "../../services/CmasterService"
// import StudentService from "../../services/StudentService"
// import UserService from "../../services/UserService"
// import CampaignService from "../../services/CampaignService"

// const { confirm } = Modal
// const { Text } = Typography
// const { Option } = Select
// const { TabPane } = Tabs

// /* -------------------- Add Leads Modal -------------------- */
// // Modal to view campaign recipients
// export const ViewRecipientsModal = forwardRef(({ isInstitute = false }, ref) => {
//     const [show, setShow] = useState(false)
//     const [loading, setLoading] = useState(false)
//     const [recipients, setRecipients] = useState([])
//     const [pagination, setPagination] = useState({
//         current: 1,
//         pageSize: 10,
//         total: 0,
//     })
//     const [campaign, setCampaign] = useState(null)

//     const columns = [
//         { title: 'ID', dataIndex: ['student', 'id'], key: 'id' },
//         { title: 'Name', dataIndex: ['student', 'name'], key: 'name' },
//         { title: 'Email', dataIndex: ['student', 'email'], key: 'email' },
//         { title: 'Phone', dataIndex: ['student', 'phone'], key: 'phone' },
//         {
//             title: 'Status',
//             key: 'status',
//             render: (_, record) => {
//                 if (!record.logs_summary) return '-';
//                 return Object.entries(record.logs_summary)
//                     .filter(([_, count]) => count > 0)
//                     .map(([status, count]) => `${status}: ${count}`)
//                     .join(', ');
//             },
//         },
//         {
//             title: 'Added On',
//             dataIndex: 'created_at',
//             key: 'created_at',
//             render: (date) => (date ? new Date(date).toLocaleString() : '-'),
//         },
//     ]

//     const fetchRecipients = async (page = 1, pageSize = 10) => {
//         if (!campaign) return;

//         setLoading(true);
//         try {
//             const response = await CampaignService.getCampaignRecipients(campaign.id, {
//                 page,
//                 page_size: pageSize,
//             });

//             setRecipients(response.data.data || []);
//             setPagination({
//                 ...pagination,
//                 current: page,
//                 total: response.data.meta?.total_items || 0,
//             });
//         } catch (error) {
//             console.error('Error fetching recipients:', error);
//             message.error('Failed to load recipients. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleTableChange = (pagination) => {
//         fetchRecipients(pagination.current, pagination.pageSize);
//     };

//     useImperativeHandle(ref, () => ({
//         open(campaignData) {
//             setCampaign(campaignData);
//             setShow(true);
//             fetchRecipients(1, 10);
//         },
//     }));

//     return (
//         <Modal
//             title={`Recipients - ${campaign?.name || ''}`}
//             open={show}
//             onCancel={() => setShow(false)}
//             width={1000}
//             footer={null}
//             destroyOnClose
//         >
//             <Table
//                 columns={columns}
//                 dataSource={recipients}
//                 rowKey={record => record.id}
//                 loading={loading}
//                 pagination={{
//                     ...pagination,
//                     showSizeChanger: true,
//                     showTotal: (total) => `Total ${total} recipients`,
//                 }}
//                 onChange={handleTableChange}
//                 scroll={{ x: 'max-content' }}
//             />
//         </Modal>
//     );
// });

// export const AddLeadsModal = forwardRef(({ isInstitute = false, campaignId, onSuccess }, ref) => {
//     const [show, setShow] = useState(false)
//     const [data, setData] = useState({})
//     const [students, setStudents] = useState([])
//     const [loading, setLoading] = useState(false)
//     const [selectedRowKeys, setSelectedRowKeys] = useState([])
//     const [addLoading, setAddLoading] = useState(false)

//     // dropdown states
//     const [countries, setCountries] = useState([])
//     const [acadCareers, setAcadCareers] = useState([])
//     const [disciplines, setDisciplines] = useState([])
//     const [genders, setGenders] = useState([])
//     const [users, setUsers] = useState([])

//     const handleChange = (v, k) => setData({ ...data, [k]: v })

//     useImperativeHandle(ref, () => ({
//         open(campaign) {
//             setData({})
//             setStudents([])
//             setSelectedRowKeys([])
//             setShow(true)
//             if (campaign) {
//                 setData(prev => ({ ...prev, campaign }))
//             }
//         },
//     }))

//     // fetch dropdowns from backend
//     useEffect(() => {
//         const fetchDropdowns = async () => {
//             try {
//                 const [countriesRes, careersRes, disciplinesRes, gendersRes, usersRes] =
//                     await Promise.all([
//                         CmasterService.allCountries({ status: 1 }),
//                         CmasterService.acadCareers({ status: 1 }),
//                         CmasterService.allDisciplines({ status: 1 }),
//                         CmasterService.genders({ status: 1 }),
//                         UserService.allUsers({ status: 1 }),
//                     ])

//                 // update state safely if path exists
//                 setCountries(countriesRes?.data?.result?.data || [])
//                 setAcadCareers(careersRes?.data?.result?.data || [])
//                 setDisciplines(disciplinesRes?.data?.result?.data || [])
//                 setGenders(gendersRes?.data?.result?.data || [])
//                 setUsers(usersRes?.data?.result?.data || [])
//             } catch (e) {
//                 console.error("Error fetching dropdowns", e)
//                 message.error("Failed to load form data")
//             }
//         }
//         fetchDropdowns()
//     }, [])

//     const handleApply = () => {
//         setLoading(true)
//         const filters = { ...data }

//         StudentService.list(filters)
//             .then(({ data }) => {
//                 const res = data.result || {}
//                 const studentsList = (res.data || []).map((s) => ({
//                     ...s,
//                     key: s.id,
//                 }))
//                 setStudents(studentsList)
//                 console.log("Filtered Students:", studentsList)
//                 if (studentsList.length === 0)
//                     message.info("No students found for selected filters.")
//             })
//             .catch((e) => {
//                 message.error(
//                     e.response?.data?.message || e.message || "Failed to load students"
//                 )
//                 setStudents([])
//             })
//             .finally(() => setLoading(false))
//     }

//     const handleAddRecipients = async () => {
//         if (selectedRowKeys.length === 0) {
//             message.warning('Please select at least one student to add')
//             return
//         }

//         if (!data.campaign) {
//             message.error('No campaign selected')
//             return
//         }

//         const selectedStudents = students.filter(student =>
//             selectedRowKeys.includes(student.id)
//         )

//         const payload = {
//             student_ids: selectedStudents.map(s => s.id),
//             variables: selectedStudents.reduce((acc, student) => ({
//                 ...acc,
//                 [student.id]: {
//                     firstName: student.name?.split(' ')[0] || '',
//                     email: student.email || '',
//                     mobile: student.mobile || ''
//                 }
//             }), {})
//         }

//         try {
//             setAddLoading(true)
//             const response = await CampaignService.addCampaignRecipients(
//                 data.campaign.id,
//                 payload
//             )

//             const { inserted_count = 0, duplicates = [], conflicts = [] } = response.data.data || {}

//             if (inserted_count > 0) {
//                 message.success(`Successfully added ${inserted_count} recipients to the campaign`)
//             }

//             if (duplicates.length > 0) {
//                 message.warning(`${duplicates.length} students were already added to this campaign`)
//             }

//             if (conflicts.length > 0) {
//                 message.warning(`Could not add ${conflicts.length} students due to conflicts`)
//             }

//             // Clear selection and refresh the list if needed
//             setSelectedRowKeys([])
//             if (onSuccess) {
//                 onSuccess()
//             }

//             // Close the modal if all students were processed
//             if (inserted_count + duplicates.length === selectedStudents.length) {
//                 setShow(false)
//             }
//         } catch (error) {
//             console.error('Error adding recipients:', error)
//             message.error(
//                 error.response?.data?.message ||
//                 'Failed to add recipients. Please try again.'
//             )
//         } finally {
//             setAddLoading(false)
//         }
//     }

//     const rowSelection = {
//         selectedRowKeys,
//         onChange: (selectedKeys) => {
//             setSelectedRowKeys(selectedKeys)
//         },
//     }

//     const columns = [
//         { title: "RegNo", dataIndex: "regno" },
//         { title: "Name", dataIndex: "name" },
//         { title: "Email", dataIndex: "email" },
//         { title: "Mobile", dataIndex: "mobile" },
//         {
//             title: "DOB",
//             dataIndex: "dob",
//             render: (d) => (d ? util.getDate(d, "DD MMM YYYY") : "-"),
//         },
//         { title: "City", dataIndex: "resident_city" },
//         { title: "State", dataIndex: "resident_state" },
//         { title: "Academic Career", dataIndex: "acad_career" },
//         {
//             title: "Created On",
//             dataIndex: "created",
//             render: (c) => util.getDate(c, "DD MMM YYYY"),
//         },
//     ]

//     return (
//         <Modal
//             title="Add Leads"
//             open={show}
//             onCancel={() => setShow(false)}
//             width={1100}
//             okText="Apply Filter"
//             onOk={handleApply}
//             maskClosable={false}
//             destroyOnClose
//         >
//             <Card size="small" title="Filter Criteria" style={{ marginBottom: 16 }}>
//                 <form
//                     onSubmit={(e) => e.preventDefault()}
//                     autoComplete="off"
//                     spellCheck="false"
//                 >
//                     <Row gutter={[16, 16]}>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>From Date</label>
//                                 <AntdDatepicker
//                                     value={data.from}
//                                     onChange={(dt) => handleChange(dt, "from")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>To Date</label>
//                                 <AntdDatepicker
//                                     value={data.to}
//                                     onChange={(dt) => handleChange(dt, "to")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Gender</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     options={genders.map((v) => ({ id: v.id, name: v.name }))}
//                                     value={data.gender_id}
//                                     onChange={(v) => handleChange(v, "gender_id")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Country</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     showSearch
//                                     mode="multiple"
//                                     options={countries.map((v) => ({ id: v.id, name: v.name }))}
//                                     value={[...(data.country_id || [])]}
//                                     onChange={(v) => handleChange(v, "country_id")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Academic Career</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     showSearch
//                                     mode="multiple"
//                                     options={acadCareers.map((v) => ({ id: v.id, name: v.name }))}
//                                     value={[...(data.ac_id || [])]}
//                                     onChange={(v) => handleChange(v, "ac_id")}
//                                 />
//                             </div>
//                         </Col>
//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Discipline</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     showSearch
//                                     mode="multiple"
//                                     options={disciplines.map((v) => ({ id: v.id, name: v.name }))}
//                                     value={[...(data.discipline_id || [])]}
//                                     onChange={(v) => handleChange(v, "discipline_id")}
//                                 />
//                             </div>
//                         </Col>

//                         {!isInstitute && (
//                             <>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Basic Info Done?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.basic_info}
//                                             onChange={(v) => handleChange(v, "basic_info")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Educational Info Done?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.edu_info}
//                                             onChange={(v) => handleChange(v, "edu_info")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Document Uploaded?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.doc_uploaded}
//                                             onChange={(v) => handleChange(v, "doc_uploaded")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Document Verified?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.doc_verified}
//                                             onChange={(v) => handleChange(v, "doc_verified")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Background Info Done?</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             allowClear
//                                             options={["Yes", "No"]}
//                                             value={data.background_info}
//                                             onChange={(v) => handleChange(v, "background_info")}
//                                         />
//                                     </div>
//                                 </Col>
//                                 <Col span={6}>
//                                     <div className="legend-lbl">
//                                         <label>Assigned To</label>
//                                         <AntdSelect
//                                             placeholder="All"
//                                             showSearch
//                                             allowClear
//                                             options={users.map((v) => ({
//                                                 id: v.id,
//                                                 name: `${v.name} (${v.role})`,
//                                             }))}
//                                             value={data.assigned_to}
//                                             onChange={(v) => handleChange(v, "assigned_to")}
//                                         />
//                                     </div>
//                                 </Col>
//                             </>
//                         )}

//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Search</label>
//                                 <Input
//                                     placeholder="RegNo./Name/Email/Mob"
//                                     allowClear
//                                     value={data.k}
//                                     onChange={(e) => handleChange(e.target.value, "k")}
//                                 />
//                             </div>
//                         </Col>

//                         <Col span={6}>
//                             <div className="legend-lbl">
//                                 <label>Payment Proof</label>
//                                 <AntdSelect
//                                     placeholder="All"
//                                     allowClear
//                                     options={["Pending", "Uploaded", "Acknowledged", "Rejected"]}
//                                     value={data.payment_proof}
//                                     onChange={(v) => handleChange(v, "payment_proof")}
//                                 />
//                             </div>
//                         </Col>
//                     </Row>
//                 </form>
//             </Card>

//             {students.length > 0 && (
//                 <>
//                     <Card size="small" bodyStyle={{ padding: 0 }}>
//                         <div className="above-tbl-filter-pad">
//                             <Row align="middle" gutter={10}>
//                                 <Col>
//                                     <Text strong>
//                                         {selectedRowKeys.length > 0
//                                             ? `Selected ${selectedRowKeys.length} of ${students.length} students`
//                                             : `Students (${students.length})`}
//                                     </Text>
//                                 </Col>

//                                 <Col flex="auto" />

//                                 <Col>
//                                     <Button
//                                         type="default"
//                                         onClick={() => {
//                                             const allStudentIds = students.map(student => student.id);
//                                             setSelectedRowKeys(allStudentIds);
//                                         }}
//                                         style={{ marginRight: 8 }}
//                                     >
//                                         Select All
//                                     </Button>
//                                     <Button
//                                         type="primary"
//                                         icon={<PlusOutlined />}
//                                         onClick={handleAddRecipients}
//                                         loading={addLoading}
//                                         disabled={selectedRowKeys.length === 0}
//                                     >
//                                         {selectedRowKeys.length > 0
//                                             ? `Add ${selectedRowKeys.length} Students`
//                                             : 'Add'}
//                                     </Button>
//                                 </Col>
//                             </Row>
//                         </div>
//                     </Card>

//                     <Table
//                         size="small"
//                         dataSource={students}
//                         columns={columns}
//                         loading={loading}
//                         rowKey="id"
//                         pagination={{
//                             pageSize: 10,
//                             showSizeChanger: false,
//                             showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`
//                         }}
//                         scroll={{ y: 400 }}
//                         rowSelection={{
//                             selectedRowKeys,
//                             onChange: (selectedRowKeys) => setSelectedRowKeys(selectedRowKeys),
//                         }}

//                         rowClassName={(record) =>
//                             selectedRowKeys.includes(record.id) ? 'selected-row' : ''
//                         }
//                     />
//                 </>
//             )}
//         </Modal>
//     )
// })

// /* -------------------- Campaign List Component -------------------- */
// export const CampaignList = ({
//     refOb = { current: {} },
//     openForm,
//     tabType,
//     filterParams,
//     openAddLeads,
// }) => {
//     const [result, setResult] = useState([])
//     const [loading, setLoading] = useState(false)
//     const [pageMeta, setPageMeta] = useState({})
//     const [templates, setTemplates] = useState([])
//     const [selectedCampaign, setSelectedCampaign] = useState(null)
//     const [campaignDetails, setCampaignDetails] = useState(null)
//     const [detailsLoading, setDetailsLoading] = useState(false)
//     const [modalVisible, setModalVisible] = useState(false)
//     const [templatesMap, setTemplatesMap] = useState({});

//     const wh = window.innerHeight

//     // Fetch all email templates
//     const fetchEmailTemplates = async () => {
//         try {
//             const response = await CmasterService.emailTemplates({});
//             const templates = response.data.data || [];
//             const templateMap = {};
//             templates.forEach(template => {
//                 templateMap[template.id] = template.name;
//             });
//             setTemplatesMap(templateMap);
//         } catch (error) {
//             console.error('Error fetching email templates:', error);
//         }
//     };

//     // Call this in useEffect when component mounts
//     useEffect(() => {
//         fetchEmailTemplates();
//     }, []);

//     useEffect(() => {
//         ; (async () => {
//             await getTemplates() // fetch templates first
//             await getList() // then campaigns
//         })()
//     }, [filterParams, tabType])
//     const handlePageChange = (page, pageSize) => {
//         getList({ ...filterParams, page, page_size: pageSize })
//     }

//     const getTemplates = async () => {
//         //  sdataRef.current.p = p || 1
//         //  sdataRef.current.ps = ps || sdataRef.current.ps
//         try {
//             const res = await CmasterService.emailTemplates()
//             const list = res?.data?.data || []
//             setTemplates(list)
//         } catch (err) {
//             console.error("Error loading templates:", err)
//             message.error("Failed to load templates")
//             setTemplates([])
//         }
//     }

//     const getList = async (params = filterParams) => {
//         setLoading(true)
//         if (templates.length === 0) {
//             await getTemplates()
//         }
//         try {
//             const query = {
//                 page: 1,
//                 page_size: 25,
//                 sort_by: "created_at",
//                 sort_order: "desc",
//                 type: tabType,
//                 ...(filterParams.search ? { search: filterParams.search } : {}),
//                 ...(filterParams.status ? { status: filterParams.status } : {}),
//             }

//             const res = await CampaignService.getAllEmailCampaign(query)

//             const campaigns = res?.data?.data || []

//             const templateMap = {}
//             templates.forEach((tpl) => {
//                 templateMap[tpl.id] = tpl.name
//             })

//             const formatted = campaigns.map((c) => ({
//                 key: c.id,
//                 id: c.id,
//                 name: c.name,
//                 type: c.type,
//                 status: c.status,
//                 sender: c.sender_name,
//                 sender_email: c.sender_email,
//                 reply_to: c.reply_to,
//                 template_id: c.template_id,
//                 scheduled_at: c.scheduled_at
//                     ? new Date(c.scheduled_at).toLocaleString()
//                     : "-",
//                 created_at: new Date(c.created_at).toLocaleString(),
//                 updated_at: new Date(c.updated_at).toLocaleString(),
//                 recipients: c.recipient_count || 0,
//                 created_by: c.created_by,
//                 templateName: templateMap[c.template_id],
//             }))

//             setResult(formatted)

//             // optional: store meta for pagination
//             setPageMeta(res.data.meta || {})
//         } catch (err) {
//             console.error("Error loading campaigns:", err)
//             message.error(err?.response?.data?.message || "Failed to load campaigns")
//             setResult([])
//         } finally {
//             setLoading(false)
//         }
//     }

//     refOb.current = { getList }

//     useEffect(() => {
//         getList()
//     }, [filterParams, tabType])

//     const deleteRecord = (id) => {
//         confirm({
//             title: "Do you want to delete this campaign?",
//             icon: <ExclamationCircleOutlined />,
//             okText: "Yes",
//             okType: "danger",
//             cancelText: "No",
//             async onOk() {
//                 try {
//                     setLoading(true)
//                     await CampaignService.deleteCampaign(id)
//                     message.success("Campaign deleted successfully")
//                     setResult((prev) => prev.filter((v) => v.id !== id))
//                 } catch (err) {
//                     console.error("Delete failed:", err)
//                     const msg =
//                         err?.response?.data?.message ||
//                         err?.response?.data?.error ||
//                         "Failed to delete campaign"
//                     message.error(msg)
//                 } finally {
//                     setLoading(false)
//                 }
//             },
//         })
//     }
//     const cols = [
//         {
//             title: "Campaign Name",
//             dataIndex: "name",
//             width: 220,
//             render: (name, row) => (
//                 <div
//                     style={{ display: "flex", flexDirection: "column", gap: 2, cursor: 'pointer' }}
//                     onClick={(e) => handleCampaignNameClick(e, row)}>
//                     <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
//                         {name}
//                     </Text>
//                     <Text type="secondary" style={{ fontSize: 12 }}>
//                         For: {row.for}
//                     </Text>
//                     <Text type="secondary" style={{ fontSize: 12 }}>
//                         Created: {util.getDate(row.created, "DD MMM YYYY")}
//                     </Text>
//                 </div>
//             ),
//         },
//         {
//             title: "Template",
//             dataIndex: "template_id",
//             key: "template",
//             render: (templateId) => (
//                 <span>{templatesMap[templateId] || 'No template'}</span>
//             )
//         },
//         {
//             title: "No. of Leads",
//             dataIndex: "leads",
//             width: 130,
//             align: "center",
//             render: (leads, row) => (
//                 <div
//                     style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         gap: 4,
//                     }}
//                 >
//                     <Text>{row.recipient_count}</Text>
//                     {row.status.toLowerCase() === "draft" && (
//                         <Button
//                             type="primary"
//                             size="small"
//                             icon={<PlusOutlined />}
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 openAddLeads(row);
//                             }}
//                         >
//                             Add Leads
//                         </Button>
//                     )}
//                 </div>
//             ),
//         },
//         {
//             title: "Status",
//             dataIndex: "status",
//             width: 110,
//             align: "center",
//             render: (status) => (
//                 <AntdTag>{status.charAt(0).toUpperCase() + status.slice(1)}</AntdTag>
//             ),
//         },
//         {
//             title: "Created On",
//             dataIndex: "created",
//             width: 160,
//             render: (created) => util.getDate(created, "DD MMM YYYY"),
//         },
//         {
//             title: "Actions",
//             align: "center",
//             width: 130,
//             fixed: "right",
//             render: (row) => (
//                 <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
//                     <Button type="default" size="small" onClick={() => openForm(row)}>
//                         <i className="fa fa-edit" />
//                     </Button>
//                     <Button
//                         type="default"
//                         size="small"
//                         danger
//                         onClick={() => deleteRecord(row.id)}
//                     >
//                         <i className="fa fa-times-circle font-red" />
//                     </Button>
//                 </div>
//             ),
//         },
//     ]

//     const fetchCampaignDetails = async (campaignId) => {
//         try {
//             setDetailsLoading(true)
//             const response = await CampaignService.getCampaignDetails(campaignId)
//             setCampaignDetails(response.data.data)
//             setModalVisible(true)
//         } catch (error) {
//             console.error('Error fetching campaign details:', error)
//             message.error('Failed to load campaign details')
//         } finally {
//             setDetailsLoading(false)
//         }
//     }

//     const handleCampaignNameClick = (e, record) => {
//         e.stopPropagation();
//         setSelectedCampaign(record);
//         fetchCampaignDetails(record.id);
//     };

//     refOb.current = { getList }

//     useEffect(() => {
//         getList()
//     }, [filterParams, tabType])

//     const getStatusTag = (status) => {
//         const statusMap = {
//             draft: { color: 'orange', text: 'Draft' },
//             scheduled: { color: 'blue', text: 'Scheduled' },
//             in_progress: { color: 'processing', text: 'In Progress' },
//             completed: { color: 'success', text: 'Completed' },
//             failed: { color: 'error', text: 'Failed' }
//         }
//         const statusInfo = statusMap[status.toLowerCase()] || { color: 'default', text: status }
//         return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
//     }

//     return (
//         <>
//             <Table
//                 dataSource={result}
//                 columns={cols}
//                 loading={loading}
//                 pagination={{
//                     current: pageMeta.page,
//                     total: pageMeta.total_items,
//                     pageSize: pageMeta.page_size,
//                     onChange: handlePageChange,
//                 }}
//                 onRow={(record) => ({
//                     // Remove the click handler from the row
//                 })}
//             />

//             <Modal
//                 title="Campaign Details"
//                 open={modalVisible}
//                 onCancel={() => setModalVisible(false)}
//                 footer={[
//                     <Button key="close" onClick={() => setModalVisible(false)}>
//                         Close
//                     </Button>
//                 ]}
//                 width={800}
//             >
//                 {detailsLoading ? (
//                     <div style={{ textAlign: 'center', padding: '20px' }}>Loading campaign details...</div>
//                 ) : campaignDetails ? (
//                     <div>
//                         <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
//                             <div style={{ marginRight: 16, fontSize: 24 }}>
//                                 {tabType === 'email' ? <MailOutlined /> : tabType === 'sms' ? <MessageOutlined /> : <WhatsAppOutlined />}
//                             </div>
//                             <div>
//                                 <Typography.Title level={4} style={{ margin: 0 }}>{campaignDetails.name}</Typography.Title>
//                                 <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
//                                     {getStatusTag(campaignDetails.status)}
//                                     <span style={{ margin: '0 8px' }}>•</span>
//                                     <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
//                                         Created on {dayjs(campaignDetails.created_at).format('MMM D, YYYY')}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         <Divider style={{ margin: '16px 0' }} />

//                         <Descriptions bordered column={1} size="small">
//                             <Descriptions.Item label="Campaign Type">
//                                 {campaignDetails.type?.charAt(0).toUpperCase() + campaignDetails.type?.slice(1)}
//                             </Descriptions.Item>
//                             <Descriptions.Item label="Sender">
//                                 {campaignDetails.sender_name} &lt;{campaignDetails.sender_email}&gt;
//                             </Descriptions.Item>
//                             <Descriptions.Item label="Reply To">
//                                 {campaignDetails.reply_to}
//                             </Descriptions.Item>
//                             <Descriptions.Item label="Template">
//                                 {campaignDetails.template_id}
//                             </Descriptions.Item>
//                             {campaignDetails.scheduled_at && (
//                                 <Descriptions.Item label="Scheduled For">
//                                     <div style={{ display: 'flex', alignItems: 'center' }}>
//                                         <ClockCircleOutlined style={{ marginRight: 8 }} />
//                                         {dayjs(campaignDetails.scheduled_at).format('MMM D, YYYY h:mm A')}
//                                     </div>
//                                 </Descriptions.Item>
//                             )}
//                             <Descriptions.Item label="Recipients">
//                                 <div style={{ display: 'flex', alignItems: 'center' }}>
//                                     <UserOutlined style={{ marginRight: 8 }} />
//                                     {campaignDetails.recipient_count || 0} recipients
//                                 </div>
//                             </Descriptions.Item>
//                         </Descriptions>

//                         {campaignDetails.logs_summary && (
//                             <div style={{ marginTop: 24 }}>
//                                 <Typography.Title level={5} style={{ marginBottom: 12 }}>Delivery Status</Typography.Title>
//                                 <Row gutter={16}>
//                                     <Col span={6}>
//                                         <Statistic title="Pending" value={campaignDetails.logs_summary.pending} valueStyle={{ color: '#1890ff' }} />
//                                     </Col>
//                                     <Col span={6}>
//                                         <Statistic title="Sent" value={campaignDetails.logs_summary.sent} valueStyle={{ color: '#52c41a' }} />
//                                     </Col>
//                                     <Col span={6}>
//                                         <Statistic title="Delivered" value={campaignDetails.logs_summary.delivered} valueStyle={{ color: '#13c2c2' }} />
//                                     </Col>
//                                     <Col span={6}>
//                                         <Statistic title="Failed" value={campaignDetails.logs_summary.failed} valueStyle={{ color: '#f5222d' }} />
//                                     </Col>
//                                 </Row>
//                             </div>
//                         )}
//                     </div>
//                 ) : (
//                     <div>No campaign details available</div>
//                 )}
//             </Modal>
//         </>
//     )
// }

// /* -------------------- Add/Edit Campaign Modal (Updated Style) -------------------- */
// export const AddEditCampaignForm = forwardRef((props, ref) => {
//     const [showForm, setShowForm] = useState(false)
//     const [data, setData] = useState({
//         status: "Draft",
//         type: "Email",
//         for: "",
//         template_id: "",
//         senderName: "",
//         senderEmail: "",
//         replyTo: "",
//     })
//     const [templates, setTemplates] = useState([])

//     const handleChange = (v, k) => setData({ ...data, [k]: v })

//     const loadTemplates = (typeOverride) => {
//         const typeToUse = typeOverride || data.type

//         const params = {
//             status: "ACTIVE",
//             type: typeToUse,
//         }

//         const service =
//             typeToUse?.toLowerCase() === "whatsapp"
//                 ? CmasterService.whatsappTemplates(params)
//                 : CmasterService.emailTemplates()

//         service
//             .then((res) => {
//                 let templates = res?.data?.data || []

//                 const filteredTemplates = templates.filter((t) => t.status === "ACTIVE")
//                 setTemplates(filteredTemplates)
//             })
//             .catch((err) => {
//                 message.error("Failed to load templates")
//             })
//     }
//     useEffect(() => {
//         if (showForm) {
//             loadTemplates(data.type)
//         }
//     }, [data.type, showForm])
//     useImperativeHandle(ref, () => ({
//         openForm(dtl) {
//             const campaignType = dtl?.type ||
//                 props.activeTab?.charAt(0).toUpperCase() + props.activeTab?.slice(1) ||
//                 "Email"

//             const defaultData = {
//                 id: dtl?.id,
//                 name: dtl?.name || "",
//                 status: dtl?.status || "Draft",
//                 type: campaignType,
//                 for: dtl?.for || "",
//                 template_id: dtl?.template_id || "",
//                 senderName: dtl?.sender_name || "",
//                 senderEmail: dtl?.sender_email || "",
//                 replyTo: dtl?.reply_to || "",
//                 scheduled_at: dtl?.scheduled_at ? dayjs(dtl.scheduled_at) : undefined
//             }

//             setData(defaultData)
//             setShowForm(true)
//             loadTemplates(campaignType)
//         },
//     }))

//     const handleTemplateSelect = (templateId) => {
//         handleChange(templateId, "template_id")
//         if (!templateId) return

//         const selectedTemplate = templates.find((t) => t.id === templateId)
//         if (!selectedTemplate) return

//         setData((prev) => ({
//             ...prev,
//             template_id: templateId,
//             subject: selectedTemplate.subject || "",
//             body: selectedTemplate.body || "",
//         }))
//     }

//     // Add campaign type change handler
//     const handleCampaignTypeChange = (value) => {
//         setData((prev) => ({
//             ...prev,
//             type: value,
//             template_id: "", // Reset template selection when type changes
//         }))
//     }


//     const save = async () => {
//         // Basic validation
//         if (!data.name || !data.type) {
//             message.warning("Campaign name and type are required!")
//             return
//         }

//         const campaignType = data.type.toLowerCase();
//         const payload = {
//             name: data.name,
//             type: campaignType,
//             template_id: data.template_id || undefined,
//             sender_name: data.senderName || undefined,
//             sender_email: data.senderEmail || undefined,
//             reply_to: data.replyTo || undefined,
//             status: data.status?.toLowerCase() || 'draft',
//             scheduled_at: data.scheduled_at || undefined
//         }

//         try {
//             let res;
//             if (data.id) {
//                 // Update existing campaign
//                 res = await CampaignService.updateCampaign(data.id, payload);
//                 message.success("Campaign updated successfully!");
//             } else {
//                 // Create new campaign
//                 res = await CampaignService.createCampaign(payload);
//                 message.success("Campaign created successfully!");
//             }

//             setShowForm(false);

//             // Refresh the campaign list
//             if (props.onSaved && typeof props.onSaved === "function") {
//                 props.onSaved();
//             }
//         } catch (err) {
//             console.error("Error saving campaign:", err);
//             const errMsg = err.response?.data?.message ||
//                 err.message ||
//                 `Failed to ${data.id ? 'update' : 'create'} campaign`;
//             message.error(errMsg);
//         }
//     }

//     return (
//         <Modal
//             title={`${data.id ? "Edit" : "Add"} Campaign`}
//             open={showForm}
//             okText="Save"
//             onOk={save}
//             onCancel={() => setShowForm(false)}
//             destroyOnClose
//             maskClosable={false}
//             width={700}
//         >
//             <Card size="small" title="Campaign Details">
//                 <form
//                     onSubmit={(e) => e.preventDefault()}
//                     autoComplete="off"
//                     spellCheck="false"
//                 >
//                     <Row gutter={[12, 12]}>
//                         <Col span={24}>
//                             <label>Campaign Name</label>
//                             <Input
//                                 placeholder="Enter campaign name"
//                                 value={data.name || ""}
//                                 onChange={(e) => handleChange(e.target.value, "name")}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>For</label>
//                             <AntdSelect
//                                 placeholder="Select target"
//                                 value={data.for || undefined}
//                                 onChange={(v) => handleChange(v, "for")}
//                                 options={[
//                                     { id: "Leads", name: "Leads" },
//                                     { id: "Students", name: "Students" },
//                                 ]}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Template</label>
//                             <AntdSelect
//                                 placeholder="Select Template"
//                                 value={data.template_id || undefined}
//                                 onChange={handleTemplateSelect}
//                                 allowClear
//                                 showSearch
//                                 options={templates.map((t) => ({ id: t.id, name: t.name }))}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Sender Name</label>
//                             <Input
//                                 placeholder="Enter sender name"
//                                 value={data.senderName || ""}
//                                 onChange={(e) => handleChange(e.target.value, "senderName")}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Sender Email</label>
//                             <Input
//                                 placeholder="Enter sender email"
//                                 value={data.senderEmail || ""}
//                                 onChange={(e) => handleChange(e.target.value, "senderEmail")}
//                             />
//                         </Col>

//                         <Col span={24}>
//                             <label>Reply To</label>
//                             <Input
//                                 placeholder="Enter reply-to email"
//                                 value={data.replyTo || ""}
//                                 onChange={(e) => handleChange(e.target.value, "replyTo")}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Status</label>
//                             <AntdSelect
//                                 placeholder="Select Status"
//                                 value={data.status || "draft"}
//                                 onChange={(v) => handleChange(v, "status")}
//                                 options={[
//                                     { id: "draft", name: "Draft" },
//                                     { id: "scheduled", name: "Scheduled" },
//                                     { id: "cancelled", name: "Cancelled" }
//                                 ]}
//                                 disabled={['sending', 'completed'].includes(data.status?.toLowerCase())}
//                             />
//                         </Col>

//                         <Col span={12}>
//                             <label>Type</label>
//                             <AntdSelect
//                                 placeholder="Select Type"
//                                 value={data.type || "Email"}
//                                 onChange={(v) => handleCampaignTypeChange(v)}
//                                 options={[
//                                     { id: "Email", name: "Email" },
//                                     { id: "WhatsApp", name: "WhatsApp" },
//                                 ]}
//                             />
//                         </Col>
//                     </Row>
//                 </form>
//             </Card>
//         </Modal>
//     )
// })

// export default function Campaign() {
//     const [activeTab, setActiveTab] = useState("email")
//     const [filterFd, setFilterFd] = useState({ name: "", for: "", status: "" })
//     const listRef = useRef({})
//     const formRef = useRef()
//     const addLeadsRef = useRef()
//     const viewRecipientsRef = useRef()

//     const openForm = (campaign) => formRef.current.openForm(campaign)
//     const openAddLeads = (campaign) => addLeadsRef.current.open(campaign)
//     const openViewRecipients = (campaign) => viewRecipientsRef.current.open(campaign)

//     const handleCampaignUpdated = () => {
//         listRef.current?.getList(); // Refresh the campaign list
//     }

//     return (
//         <div className="page-content">
//             <div className="page-head uc d-flex campaigns-head">
//                 <div className="my-auto">
//                     <h2>Campaigns</h2>
//                 </div>
//             </div>
//             <div className="page-pad">
//                 <Tabs activeKey={activeTab} onChange={setActiveTab}>
//                     {["email", "whatsapp"].map((tab) => (
//                         <TabPane
//                             tab={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Campaign`}
//                             key={tab}
//                         >
//                             <Card size="small" bodyStyle={{ padding: 10 }}>
//                                 <Row gutter={[12, 12]} align="middle">
//                                     <Col>
//                                         <Input
//                                             placeholder="Campaign Name"
//                                             allowClear
//                                             value={filterFd.name}
//                                             onChange={(e) =>
//                                                 setFilterFd({ ...filterFd, name: e.target.value })
//                                             }
//                                             style={{ width: 220 }}
//                                         />
//                                     </Col>
//                                     <Col>
//                                         <Select
//                                             placeholder="For"
//                                             allowClear
//                                             style={{ width: 140 }}
//                                             value={filterFd.for || undefined}
//                                             onChange={(v) => setFilterFd({ ...filterFd, for: v })}
//                                             tagRender={(props) => (
//                                                 <AntdTag type="blue">{props.label}</AntdTag>
//                                             )}
//                                         >
//                                             <Option value="Leads">Leads</Option>
//                                             <Option value="Students">Students</Option>
//                                         </Select>
//                                     </Col>
//                                     <Col>
//                                         <Select
//                                             placeholder="Status"
//                                             allowClear
//                                             style={{ width: 140 }}
//                                             value={filterFd.status || undefined}
//                                             onChange={(v) => setFilterFd({ ...filterFd, status: v })}
//                                             tagRender={(props) => (
//                                                 <AntdTag
//                                                     type={props.label === "Draft" ? "warning" : "success"}
//                                                 >
//                                                     {props.label}
//                                                 </AntdTag>
//                                             )}
//                                         >
//                                             <Option value="Draft">Draft</Option>
//                                             <Option value="Published">Published</Option>
//                                         </Select>
//                                     </Col>
//                                     <Col>
//                                         <Button
//                                             type="primary"
//                                             icon={<SearchOutlined />}
//                                             onClick={() => listRef.current.getList(filterFd)}
//                                         >
//                                             Search
//                                         </Button>
//                                     </Col>
//                                     <Col flex="auto" />
//                                     <Col>
//                                         <Button
//                                             type="primary"
//                                             icon={<PlusOutlined />}
//                                             onClick={() => openForm()}
//                                         >
//                                             Create New
//                                         </Button>
//                                     </Col>
//                                 </Row>

//                                 <div style={{ marginTop: 12 }}>
//                                     <CampaignList
//                                         refOb={listRef}
//                                         openForm={openForm}
//                                         tabType={tab}
//                                         filterParams={filterFd}
//                                         openAddLeads={openAddLeads}
//                                     />
//                                 </div>
//                             </Card>
//                         </TabPane>
//                     ))}
//                 </Tabs>
//             </div>
//             <AddEditCampaignForm
//                 ref={formRef}
//                 activeTab={activeTab}
//                 onSaved={handleCampaignUpdated}
//             />
//             <AddLeadsModal ref={addLeadsRef} />
//             <ViewRecipientsModal ref={viewRecipientsRef} />
//         </div>
//     )
// }


import React, {
    useState,
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle,
    useContext,
    useMemo,
} from "react"
import { RawHTML } from "../../utils/Controls"
import { AntdTag, AntdDatepicker, AntdSelect } from "../../utils/Antd"
import util from "../../utils/util"
import {
    Table,
    Input,
    Button,
    message,
    Modal,
    Card,
    Row,
    Col,
    Typography,
    Select,
    Tabs,
    Divider,
    Descriptions,
    Statistic,
    Tag,
    Empty,
} from "antd"
import {
    ExclamationCircleOutlined,
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    MailOutlined,
    MessageOutlined,
    WhatsAppOutlined,
    UserOutlined,
    ClockCircleOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs";
import CmasterService from "../../services/CmasterService"
import StudentService from "../../services/StudentService"
import UserService from "../../services/UserService"
import CampaignService from "../../services/CampaignService"
import CampaignLogs from "./CampaignLogs"
import { SessionContext } from "../../context/SessionContext"

const { confirm } = Modal
const { Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

/* -------------------- Add Leads Modal -------------------- */
// Modal to view campaign recipients
export const ViewRecipientsModal = forwardRef(({ isInstitute = false }, ref) => {
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [recipients, setRecipients] = useState([])
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })
    const [campaign, setCampaign] = useState(null)

    const columns = [
        { title: 'ID', dataIndex: ['student', 'id'], key: 'id' },
        { title: 'Name', dataIndex: ['student', 'name'], key: 'name' },
        { title: 'Email', dataIndex: ['student', 'email'], key: 'email' },
        { title: 'Phone', dataIndex: ['student', 'phone'], key: 'phone' },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                if (!record.logs_summary) return '-';
                return Object.entries(record.logs_summary)
                    .filter(([_, count]) => count > 0)
                    .map(([status, count]) => `${status}: ${count}`)
                    .join(', ');
            },
        },
        {
            title: 'Added On',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => (date ? new Date(date).toLocaleString() : '-'),
        },
    ]

    const fetchRecipients = async (page = 1, pageSize = 10) => {
        if (!campaign) return;

        setLoading(true);
        try {
            const response = await CampaignService.getCampaignRecipients(campaign.id, {
                page,
                page_size: pageSize,
            });

            setRecipients(response.data.data || []);
            setPagination({
                ...pagination,
                current: page,
                total: response.data.meta?.total_items || 0,
            });
        } catch (error) {
            console.error('Error fetching recipients:', error);
            message.error('Failed to load recipients. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        fetchRecipients(pagination.current, pagination.pageSize);
    };

    useImperativeHandle(ref, () => ({
        open(campaignData) {
            setCampaign(campaignData);
            setShow(true);
            fetchRecipients(1, 10);
        },
    }));

    return (
        <Modal
            title={`Recipients - ${campaign?.name || ''}`}
            open={show}
            onCancel={() => setShow(false)}
            width={1000}
            footer={null}
            destroyOnClose
        >
            <Table
                columns={columns}
                dataSource={recipients}
                rowKey={record => record.id}
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} recipients`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
            />
        </Modal>
    );
});

export const AddLeadsModal = forwardRef(({ isInstitute = false, campaignId, onSuccess }, ref) => {
    const [show, setShow] = useState(false)
    const [data, setData] = useState({})
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [addLoading, setAddLoading] = useState(false)

    // dropdown states
    const [countries, setCountries] = useState([])
    const [acadCareers, setAcadCareers] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const [genders, setGenders] = useState([])
    const [users, setUsers] = useState([])

    const handleChange = (v, k) => setData({ ...data, [k]: v })

    useImperativeHandle(ref, () => ({
        open(campaign) {
            setData({})
            setStudents([])
            setSelectedRowKeys([])
            setShow(true)
            if (campaign) {
                setData(prev => ({ ...prev, campaign }))
            }
        },
    }))

    // fetch dropdowns from backend
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [countriesRes, careersRes, disciplinesRes, gendersRes, usersRes] =
                    await Promise.all([
                        CmasterService.allCountries({ status: 1 }),
                        CmasterService.acadCareers({ status: 1 }),
                        CmasterService.allDisciplines({ status: 1 }),
                        CmasterService.genders({ status: 1 }),
                        UserService.allUsers({ status: 1 }),
                    ])

                // update state safely if path exists
                setCountries(countriesRes?.data?.result?.data || [])
                setAcadCareers(careersRes?.data?.result?.data || [])
                setDisciplines(disciplinesRes?.data?.result?.data || [])
                setGenders(gendersRes?.data?.result?.data || [])
                setUsers(usersRes?.data?.result?.data || [])
            } catch (e) {
                console.error("Error fetching dropdowns", e)
                message.error("Failed to load form data")
            }
        }
        fetchDropdowns()
    }, [])

    const handleApply = () => {
        setLoading(true)
        const filters = { ...data }

        StudentService.list(filters)
            .then(({ data }) => {
                const res = data.result || {}
                const studentsList = (res.data || []).map((s) => ({
                    ...s,
                    key: s.id,
                }))
                setStudents(studentsList)
                console.log("Filtered Students:", studentsList)
                if (studentsList.length === 0)
                    message.info("No students found for selected filters.")
            })
            .catch((e) => {
                message.error(
                    e.response?.data?.message || e.message || "Failed to load students"
                )
                setStudents([])
            })
            .finally(() => setLoading(false))
    }

    const handleAddRecipients = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one student to add')
            return
        }

        if (!data.campaign) {
            message.error('No campaign selected')
            return
        }

        const selectedStudents = students.filter(student =>
            selectedRowKeys.includes(student.id)
        )

        const payload = {
            student_ids: selectedStudents.map(s => s.id),
            variables: selectedStudents.reduce((acc, student) => ({
                ...acc,
                [student.id]: {
                    firstName: student.name?.split(' ')[0] || '',
                    email: student.email || '',
                    mobile: student.mobile || ''
                }
            }), {})
        }

        try {
            setAddLoading(true)
            const response = await CampaignService.addCampaignRecipients(
                data.campaign.id,
                payload
            )

            const { inserted_count = 0, duplicates = [], conflicts = [] } = response.data.data || {}

            if (inserted_count > 0) {
                message.success(`Successfully added ${inserted_count} recipients to the campaign`)
            }

            if (duplicates.length > 0) {
                message.warning(`${duplicates.length} students were already added to this campaign`)
            }

            if (conflicts.length > 0) {
                message.warning(`Could not add ${conflicts.length} students due to conflicts`)
            }

            // Clear selection and refresh the list if needed
            setSelectedRowKeys([])
            if (onSuccess) {
                onSuccess()
            }

            // Close the modal if all students were processed
            if (inserted_count + duplicates.length === selectedStudents.length) {
                setShow(false)
            }
        } catch (error) {
            console.error('Error adding recipients:', error)
            message.error(
                error.response?.data?.message ||
                'Failed to add recipients. Please try again.'
            )
        } finally {
            setAddLoading(false)
        }
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => {
            setSelectedRowKeys(selectedKeys)
        },
    }

    const columns = [
        { title: "RegNo", dataIndex: "regno" },
        { title: "Name", dataIndex: "name" },
        { title: "Email", dataIndex: "email" },
        { title: "Mobile", dataIndex: "mobile" },
        {
            title: "DOB",
            dataIndex: "dob",
            render: (d) => (d ? util.getDate(d, "DD MMM YYYY") : "-"),
        },
        { title: "City", dataIndex: "resident_city" },
        { title: "State", dataIndex: "resident_state" },
        { title: "Academic Career", dataIndex: "acad_career" },
        {
            title: "Created On",
            dataIndex: "created",
            render: (c) => util.getDate(c, "DD MMM YYYY"),
        },
    ]

    return (
        <Modal
            title="Add Leads"
            open={show}
            onCancel={() => setShow(false)}
            width={1100}
            okText="Apply Filter"
            onOk={handleApply}
            maskClosable={false}
            destroyOnClose
        >
            <Card size="small" title="Filter Criteria" style={{ marginBottom: 16 }}>
                <form
                    onSubmit={(e) => e.preventDefault()}
                    autoComplete="off"
                    spellCheck="false"
                >
                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <div className="legend-lbl">
                                <label>From Date</label>
                                <AntdDatepicker
                                    value={data.from}
                                    onChange={(dt) => handleChange(dt, "from")}
                                />
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="legend-lbl">
                                <label>To Date</label>
                                <AntdDatepicker
                                    value={data.to}
                                    onChange={(dt) => handleChange(dt, "to")}
                                />
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="legend-lbl">
                                <label>Gender</label>
                                <AntdSelect
                                    placeholder="All"
                                    allowClear
                                    options={genders.map((v) => ({ id: v.id, name: v.name }))}
                                    value={data.gender_id}
                                    onChange={(v) => handleChange(v, "gender_id")}
                                />
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="legend-lbl">
                                <label>Country</label>
                                <AntdSelect
                                    placeholder="All"
                                    allowClear
                                    showSearch
                                    mode="multiple"
                                    options={countries.map((v) => ({ id: v.id, name: v.name }))}
                                    value={[...(data.country_id || [])]}
                                    onChange={(v) => handleChange(v, "country_id")}
                                />
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="legend-lbl">
                                <label>Academic Career</label>
                                <AntdSelect
                                    placeholder="All"
                                    allowClear
                                    showSearch
                                    mode="multiple"
                                    options={acadCareers.map((v) => ({ id: v.id, name: v.name }))}
                                    value={[...(data.ac_id || [])]}
                                    onChange={(v) => handleChange(v, "ac_id")}
                                />
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="legend-lbl">
                                <label>Discipline</label>
                                <AntdSelect
                                    placeholder="All"
                                    allowClear
                                    showSearch
                                    mode="multiple"
                                    options={disciplines.map((v) => ({ id: v.id, name: v.name }))}
                                    value={[...(data.discipline_id || [])]}
                                    onChange={(v) => handleChange(v, "discipline_id")}
                                />
                            </div>
                        </Col>

                        {!isInstitute && (
                            <>
                                <Col span={6}>
                                    <div className="legend-lbl">
                                        <label>Basic Info Done?</label>
                                        <AntdSelect
                                            placeholder="All"
                                            allowClear
                                            options={["Yes", "No"]}
                                            value={data.basic_info}
                                            onChange={(v) => handleChange(v, "basic_info")}
                                        />
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="legend-lbl">
                                        <label>Educational Info Done?</label>
                                        <AntdSelect
                                            placeholder="All"
                                            allowClear
                                            options={["Yes", "No"]}
                                            value={data.edu_info}
                                            onChange={(v) => handleChange(v, "edu_info")}
                                        />
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="legend-lbl">
                                        <label>Document Uploaded?</label>
                                        <AntdSelect
                                            placeholder="All"
                                            allowClear
                                            options={["Yes", "No"]}
                                            value={data.doc_uploaded}
                                            onChange={(v) => handleChange(v, "doc_uploaded")}
                                        />
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="legend-lbl">
                                        <label>Document Verified?</label>
                                        <AntdSelect
                                            placeholder="All"
                                            allowClear
                                            options={["Yes", "No"]}
                                            value={data.doc_verified}
                                            onChange={(v) => handleChange(v, "doc_verified")}
                                        />
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="legend-lbl">
                                        <label>Background Info Done?</label>
                                        <AntdSelect
                                            placeholder="All"
                                            allowClear
                                            options={["Yes", "No"]}
                                            value={data.background_info}
                                            onChange={(v) => handleChange(v, "background_info")}
                                        />
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="legend-lbl">
                                        <label>Assigned To</label>
                                        <AntdSelect
                                            placeholder="All"
                                            showSearch
                                            allowClear
                                            options={users.map((v) => ({
                                                id: v.id,
                                                name: `${v.name} (${v.role})`,
                                            }))}
                                            value={data.assigned_to}
                                            onChange={(v) => handleChange(v, "assigned_to")}
                                        />
                                    </div>
                                </Col>
                            </>
                        )}

                        <Col span={6}>
                            <div className="legend-lbl">
                                <label>Search</label>
                                <Input
                                    placeholder="RegNo./Name/Email/Mob"
                                    allowClear
                                    value={data.k}
                                    onChange={(e) => handleChange(e.target.value, "k")}
                                />
                            </div>
                        </Col>

                        <Col span={6}>
                            <div className="legend-lbl">
                                <label>Payment Proof</label>
                                <AntdSelect
                                    placeholder="All"
                                    allowClear
                                    options={["Pending", "Uploaded", "Acknowledged", "Rejected"]}
                                    value={data.payment_proof}
                                    onChange={(v) => handleChange(v, "payment_proof")}
                                />
                            </div>
                        </Col>
                    </Row>
                </form>
            </Card>

            {students.length > 0 && (
                <>
                    <Card size="small" bodyStyle={{ padding: 0 }}>
                        <div className="above-tbl-filter-pad">
                            <Row align="middle" gutter={10}>
                                <Col>
                                    <Text strong>
                                        {selectedRowKeys.length > 0
                                            ? `Selected ${selectedRowKeys.length} of ${students.length} students`
                                            : `Students (${students.length})`}
                                    </Text>
                                </Col>

                                <Col flex="auto" />

                                <Col>
                                    <Button
                                        type="default"
                                        onClick={() => {
                                            const allStudentIds = students.map(student => student.id);
                                            setSelectedRowKeys(allStudentIds);
                                        }}
                                        style={{ marginRight: 8 }}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddRecipients}
                                        loading={addLoading}
                                        disabled={selectedRowKeys.length === 0}
                                    >
                                        {selectedRowKeys.length > 0
                                            ? `Add ${selectedRowKeys.length} Students`
                                            : 'Add'}
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    <Table
                        size="small"
                        dataSource={students}
                        columns={columns}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`
                        }}
                        scroll={{ y: 400 }}
                        rowSelection={rowSelection}

                        rowClassName={(record) =>
                            selectedRowKeys.includes(record.id) ? 'selected-row' : ''
                        }
                    />
                </>
            )}
        </Modal>
    )
})

/* -------------------- Campaign List Component -------------------- */
export const CampaignList = ({
    refOb = { current: {} },
    openForm,
    tabType,
    filterParams,
    openAddLeads,
}) => {
    const [result, setResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [pageMeta, setPageMeta] = useState({})
    const [templates, setTemplates] = useState([])
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [campaignDetails, setCampaignDetails] = useState(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [templatesMap, setTemplatesMap] = useState({});
    const [logsModalVisible, setLogsModalVisible] = useState(false);
    const emptySessionNotifiedRef = useRef({ sessionId: null, tabType: null });

    // Get session context
    const { selectedSession, activeSession, sessions } = useContext(SessionContext);

    const sessionId = useMemo(() => {
        if (selectedSession?.key) return selectedSession.key;
        if (selectedSession?.id) return selectedSession.id;

        const storedActiveSession = (() => {
            try {
                const raw = localStorage.getItem("activeSession");
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        })();

        if (storedActiveSession?.key) return storedActiveSession.key;
        if (storedActiveSession?.id) return storedActiveSession.id;

        const storedSessions = (() => {
            try {
                return JSON.parse(localStorage.getItem("sessions") || "[]") || [];
            } catch {
                return [];
            }
        })();

        const sessionList = sessions?.length ? sessions : storedSessions;
        const activeName =
            typeof activeSession === "string" && activeSession
                ? activeSession
                : storedActiveSession?.name || storedActiveSession?.fullName || null;

        if (!activeName) return null;

        const currentSession = sessionList.find(
            (s) => s?.name === activeName || s?.fullName === activeName
        );
        return currentSession?.key || currentSession?.id || null;
    }, [selectedSession, activeSession, sessions]);

    const sessionName = useMemo(() => {
        if (selectedSession?.name) return selectedSession.name;
        if (selectedSession?.fullName) return selectedSession.fullName;

        if (typeof activeSession === "string" && activeSession) return activeSession;

        try {
            const raw = localStorage.getItem("activeSession");
            const stored = raw ? JSON.parse(raw) : null;
            return stored?.name || stored?.fullName || null;
        } catch {
            return null;
        }
    }, [selectedSession, activeSession]);

    const sessionRange = useMemo(() => {
        if (!sessionName) return null;
        const parts = String(sessionName).split("-");
        if (parts.length !== 2) return null;
        const startYear = Number(parts[0]);
        const endYear = Number(parts[1]);
        if (!startYear || !endYear) return null;

        const start = dayjs(`${startYear}-11-01`);
        const end = dayjs(`${endYear}-10-31`);
        if (!start.isValid() || !end.isValid()) return null;

        return { start, end };
    }, [sessionName]);


    const handleSendCampaign = async (campaign) => {
        try {
            setLoading(true);
            const campaignType = String(campaign?.type || "").toLowerCase();
            const sendPayload = campaignType === "whatsapp"
                ? {
                    stagger: {
                        enabled: true,
                        first_delay_sec: 0,
                        min_delay_sec: 120,
                        max_delay_sec: 300,
                    },
                }
                : {};

            const response = await CampaignService.sendCampaign(campaign.id, sendPayload);

            const raw = response?.data;
            const data = raw?.data ?? raw?.result?.data ?? raw?.result ?? raw;
            const results = Array.isArray(data?.results)
                ? data.results
                : Array.isArray(data?.data?.results)
                    ? data.data.results
                    : null;

            if (Array.isArray(results)) {
                const failedCount = results.filter(
                    (r) => String(r?.status || "").toLowerCase() === "failed"
                ).length;
                const successCount = results.filter(
                    (r) => String(r?.status || "").toLowerCase() === "sent"
                ).length;

                if (failedCount > 0 && successCount === 0) {
                    message.error(`Campaign failed to send. All ${failedCount} messages failed.`);
                } else if (failedCount > 0) {
                    message.warning(
                        `Campaign partially sent. ${successCount} messages sent, ${failedCount} failed.`
                    );
                } else if (successCount > 0) {
                    message.success(
                        `Campaign sent successfully! ${successCount} messages queued for delivery.`
                    );
                } else {
                    message.info("Campaign queued but no messages were processed.");
                }
            } else {
                const status = String(data?.status || "").toLowerCase();
                const queuedCount = Number(data?.queued_count || 0);

                if (status === "completed") {
                    message.success("Campaign sent successfully!");
                } else if (queuedCount > 0) {
                    message.info(`Send started. ${queuedCount} messages queued for delivery.`);
                } else {
                    message.info("Send started. Please check logs for delivery status.");
                }
            }
            
            // Refresh the campaigns list
            getList();
        } catch (error) {
            console.error('Error sending campaign:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Failed to send campaign';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all email templates
    const fetchEmailTemplates = async () => {
        try {
            const response = await CmasterService.emailTemplates({});
            const templates = response.data.data || [];
            const templateMap = {};
            templates.forEach(template => {
                templateMap[template.id] = template.name;
            });
            setTemplatesMap(templateMap);
        } catch (error) {
            console.error('Error fetching email templates:', error);
        }
    };

    // Call this in useEffect when component mounts
    useEffect(() => {
        fetchEmailTemplates();
    }, []);

    useEffect(() => {
        ; (async () => {
            await getTemplates() // fetch templates first
            await getList() // then campaigns
        })()
    }, [filterParams, tabType, sessionId])
    const handlePageChange = (page, pageSize) => {
        getList({ ...filterParams, page, page_size: pageSize })
    }

    const getTemplates = async () => {
        //  sdataRef.current.p = p || 1
        //  sdataRef.current.ps = ps || sdataRef.current.ps
        try {
            const res = await CmasterService.emailTemplates()
            const list = res?.data?.data || []
            setTemplates(list)
        } catch (err) {
            console.error("Error loading templates:", err)
            message.error("Failed to load templates")
            setTemplates([])
        }
    }

    const getList = async (params = filterParams) => {
    setLoading(true)
    if (templates.length === 0) {
        await getTemplates()
    }
    try {
        const query = {
            page: params?.page || 1,
            page_size: params?.page_size || 25,
            sort_by: "created_at",
            sort_order: "desc",
            type: tabType,
            ...(params?.search || filterParams.search ? { search: params?.search || filterParams.search } : {}),
            ...(params?.status || filterParams.status ? { status: params?.status || filterParams.status } : {}),
            ...(params?.name || filterParams.name ? { name: params?.name || filterParams.name } : {}),
            ...(params?.for || filterParams.for ? { for: params?.for || filterParams.for } : {}),
            // Add session filtering
            ...(sessionId ? { session_id: sessionId } : {}),
        }

        const res = await CampaignService.getAllEmailCampaign(query)
        const campaigns = res?.data?.data || []

        const filteredCampaigns = sessionId
            ? campaigns.filter((c) => {
                if (c?.session_id !== undefined && c?.session_id !== null) {
                    return String(c.session_id) === String(sessionId);
                }

                if (sessionRange && c?.created_at) {
                    const created = dayjs(c.created_at);
                    if (!created.isValid()) return false;
                    return (
                        !created.isBefore(sessionRange.start, "day") &&
                        !created.isAfter(sessionRange.end, "day")
                    );
                }

                return false;
            })
            : campaigns;

        // Handle case when no data exists for the selected session
        if (filteredCampaigns.length === 0) {
            if (
                sessionId &&
                (emptySessionNotifiedRef.current.sessionId !== sessionId ||
                    emptySessionNotifiedRef.current.tabType !== tabType)
            ) {
                emptySessionNotifiedRef.current = { sessionId, tabType };
                message.info("Data not available for selected session")
            }
            setResult([])
            setPageMeta({
                page: 1,
                page_size: query.page_size,
                total_items: 0,
                total_pages: 0
            })
            return
        }

        const templateMap = {}
        templates.forEach((tpl) => {
            templateMap[tpl.id] = tpl.name
        })

        const formatted = filteredCampaigns.map((c) => ({
            key: c.id,
            id: c.id,
            name: c.name,
            type: c.type,
            status: c.status,
            sender: c.sender_name,
            sender_email: c.sender_email,
            reply_to: c.reply_to,
            template_id: c.template_id,
            scheduled_at: c.scheduled_at
                ? new Date(c.scheduled_at).toLocaleString()
                : "-",
            created_at: c.created_at,
            updated_at: c.updated_at,
            recipients: c.recipient_count || 0,
            created_by: c.created_by,
            templateName: templateMap[c.template_id],
            session_id: c.session_id // Include session_id in the formatted data
        }))

        setResult(formatted)
        setPageMeta(res.data.meta || {})
    } catch (err) {
        console.error("Error loading campaigns:", err)
        message.error(err?.response?.data?.message || "Failed to load campaigns")
        setResult([])
        setPageMeta({})
    } finally {
        setLoading(false)
    }
}

    refOb.current = { getList }

    useEffect(() => {
        getList()
    }, [filterParams, tabType, sessionId])

    const deleteRecord = (id) => {
        confirm({
            title: "Do you want to delete this campaign?",
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            async onOk() {
                try {
                    setLoading(true)
                    await CampaignService.deleteCampaign(id)
                    message.success("Campaign deleted successfully")
                    setResult((prev) => prev.filter((v) => v.id !== id))
                } catch (err) {
                    console.error("Delete failed:", err)
                    const msg =
                        err?.response?.data?.message ||
                        err?.response?.data?.error ||
                        "Failed to delete campaign"
                    message.error(msg)
                } finally {
                    setLoading(false)
                }
            },
        })
    }
    const cols = [
        {
            title: "Campaign Name",
            dataIndex: "name",
            width: 220,
            render: (name, row) => (
                <div
                    style={{ display: "flex", flexDirection: "column", gap: 2, cursor: 'pointer' }}
                    onClick={(e) => handleCampaignNameClick(e, row)}>
                    <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                        {name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        For: {row.for}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Created: {util.getDate(row.created_at, "DD MMM YYYY")}
                    </Text>
                </div>
            ),
        },
        {
            title: "Template",
            dataIndex: "template_id",
            key: "template",
            render: (templateId) => (
                <span>{templatesMap[templateId] || 'No template'}</span>
            )
        },
        {
            title: "No. of Leads",
            dataIndex: "leads",
            width: 130,
            align: "center",
            render: (leads, row) => (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <Text>{row.recipient_count}</Text>
                    {row.status.toLowerCase() === "draft" && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                openAddLeads(row);
                            }}
                        >
                            Add Leads
                        </Button>
                    )}
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 110,
            align: "center",
           render: (status) => getStatusTag(status)
        },
        {
            title: "Created On",
            dataIndex: "created_at",
            width: 160,
            render: (created_at) => util.getDate(created_at, "DD MMM YYYY"),
        },
       {
    title: 'Actions',
    align: "center",
    width: 150, // Slightly increased to accommodate all buttons
    fixed: "right",
    key: 'actions',
    render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            {/* Edit Button */}
            <Button 
                type="default" 
                size="small" 
                onClick={() => openForm(record)}
                icon={<i className="fa fa-edit" />}
                title="Edit"
                style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
            
            {/* Delete Button */}
            <Button
                type="default"
                size="small"
                danger
                onClick={() => deleteRecord(record.id)}
                icon={<i className="fa fa-times-circle" />}
                title="Delete"
                style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
            
            {/* Send Button */}
            <Button
                type="default"
                size="small"
                onClick={() => handleSendCampaign(record)}
                disabled={!['draft', 'scheduled'].includes(record.status?.toLowerCase())}
                title={!['draft', 'scheduled'].includes(record.status?.toLowerCase()) 
                    ? 'Only draft or scheduled campaigns can be sent' 
                    : 'Send campaign'}
                icon={<PlayCircleOutlined />}
                style={{ 
                    width: 30, 
                    height: 30, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: !['draft', 'scheduled'].includes(record.status?.toLowerCase()) ? '#ccc' : '#1890ff'
                }}
            />
            
            {/* Logs Button */}
            <Button
                type="default"
                size="small"
                onClick={() => {
                    setSelectedCampaign(record);
                    setLogsModalVisible(true);
                }}
                icon={<EyeOutlined />}
                title="View Logs"
                style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
        </div>
    ),
}
    ]

    const fetchCampaignDetails = async (campaignId) => {
        try {
            setDetailsLoading(true)
            const response = await CampaignService.getCampaignDetails(campaignId)
            setCampaignDetails(response.data.data)
            setModalVisible(true)
        } catch (error) {
            console.error('Error fetching campaign details:', error)
            message.error('Failed to load campaign details')
        } finally {
            setDetailsLoading(false)
        }
    }

    const handleCampaignNameClick = (e, record) => {
        e.stopPropagation();
        setSelectedCampaign(record);
        fetchCampaignDetails(record.id);
    };

    refOb.current = { getList }

    useEffect(() => {
        getList()
    }, [filterParams, tabType])

    const getStatusTag = (status) => {
        const statusMap = {
            draft: { color: 'orange', text: 'Draft' },
            scheduled: { color: 'blue', text: 'Scheduled' },
            in_progress: { color: 'processing', text: 'In Progress' },
            completed: { color: '#08762b', text: 'Completed' },
            failed: { color: 'error', text: 'Failed' }
        }
        const statusInfo = statusMap[status.toLowerCase()] || { color: 'default', text: status }
        return <Tag style={{ background: statusInfo.color === '#15803d' ? '#15803d' : undefined, color: statusInfo.color === '#353a37' ? '#fff' : undefined, fontWeight: 600, borderRadius: 6, padding: '2px 10px', border: statusInfo.color === '#15803d' ? 'none' : undefined }} color={statusInfo.color === '#15803d' ? undefined : statusInfo.color}>{statusInfo.text}</Tag>
    }

    return (
        <>
            <Table
                dataSource={result}
                columns={cols}
                loading={loading}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                sessionId
                                    ? "Data not available for selected session"
                                    : "No campaigns found"
                            }
                        />
                    ),
                }}
                pagination={{
                    current: pageMeta.page,
                    total: pageMeta.total_items,
                    pageSize: pageMeta.page_size,
                    onChange: handlePageChange,
                }}
                scroll={{ y: 'calc(100vh - 300px)' }}  // Adjust the height as needed
                sticky
                onRow={(record) => ({
                    // Remove the click handler from the row
                })}
            />

            <Modal
                title="Campaign Details"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {detailsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Loading campaign details...</div>
                ) : campaignDetails ? (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ marginRight: 16, fontSize: 24 }}>
                                {tabType === 'email' ? <MailOutlined /> : tabType === 'sms' ? <MessageOutlined /> : <WhatsAppOutlined />}
                            </div>
                            <div>
                                <Typography.Title level={4} style={{ margin: 0 }}>{campaignDetails.name}</Typography.Title>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                                    {getStatusTag(campaignDetails.status)}
                                    <span style={{ margin: '0 8px' }}>•</span>
                                    <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                                        Created on {dayjs(campaignDetails.created_at).format('MMM D, YYYY')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Campaign Type">
                                {campaignDetails.type?.charAt(0).toUpperCase() + campaignDetails.type?.slice(1)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sender">
                                {campaignDetails.sender_name} &lt;{campaignDetails.sender_email}&gt;
                            </Descriptions.Item>
                            <Descriptions.Item label="Reply To">
                                {campaignDetails.reply_to}
                            </Descriptions.Item>
                            <Descriptions.Item label="Template">
                                {campaignDetails.template_id}
                            </Descriptions.Item>
                            {campaignDetails.scheduled_at && (
                                <Descriptions.Item label="Scheduled For">
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                                        {dayjs(campaignDetails.scheduled_at).format('MMM D, YYYY h:mm A')}
                                    </div>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Recipients">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <UserOutlined style={{ marginRight: 8 }} />
                                    {campaignDetails.recipient_count || 0} recipients
                                </div>
                            </Descriptions.Item>
                        </Descriptions>

                        {campaignDetails.logs_summary && (
                            <div style={{ marginTop: 24 }}>
                                <Typography.Title level={5} style={{ marginBottom: 12 }}>Delivery Status</Typography.Title>
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Statistic title="Pending" value={campaignDetails.logs_summary.pending} valueStyle={{ color: '#1890ff' }} />
                                    </Col>
                                    <Col span={6}>
                                        <Statistic title="Sent" value={campaignDetails.logs_summary.sent} valueStyle={{ color: '#52c41a' }} />
                                    </Col>
                                    <Col span={6}>
                                        <Statistic title="Delivered" value={campaignDetails.logs_summary.delivered} valueStyle={{ color: '#13c2c2' }} />
                                    </Col>
                                    <Col span={6}>
                                        <Statistic title="Failed" value={campaignDetails.logs_summary.failed} valueStyle={{ color: '#f5222d' }} />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>No campaign details available</div>
                )}
            </Modal>
            {/* Add the logs modal */}
            {selectedCampaign && (
                <CampaignLogs
                    campaignId={selectedCampaign.id}
                    visible={logsModalVisible}
                    onClose={() => setLogsModalVisible(false)}
                />
            )}
        </>
    )
}

/* -------------------- Add/Edit Campaign Modal (Updated Style) -------------------- */
export const AddEditCampaignForm = forwardRef((props, ref) => {
    const [showForm, setShowForm] = useState(false)
    const [data, setData] = useState({
        status: "Draft",
        type: "Email",
        for: "",
        template_id: "",
        senderName: "",
        senderEmail: "",
        replyTo: "",
    })
    const [templates, setTemplates] = useState([])

    const handleChange = (v, k) => setData({ ...data, [k]: v })

    const isWhatsApp = (data.type || "").toLowerCase() === "whatsapp"

    const loadTemplates = (typeOverride) => {
        const typeToUse = typeOverride || data.type
        const isWhatsAppType = (typeToUse || "").toLowerCase() === "whatsapp"

        const params = isWhatsAppType
            ? {
                p: 1,
                ps: 200,
            }
            : {
                p: 1,
                ps: 200,
                status: "ACTIVE",
            }

        const service =
            typeToUse?.toLowerCase() === "whatsapp"
                ? CmasterService.whatsappTemplates(params)
                : CmasterService.emailTemplates(params)

        service
            .then((res) => {
                const root = res?.data || {}
                const list =
                    root?.data ||
                    root?.result?.data ||
                    root?.result?.result?.data ||
                    root?.result?.data?.data ||
                    []

                const templates = Array.isArray(list) ? list : []

                const filteredTemplates = isWhatsAppType
                    ? templates.filter((t) => {
                        const st = String(t?.status || "").toUpperCase()
                        return st !== "INACTIVE"
                    })
                    : templates.filter(
                        (t) => String(t?.status || "").toUpperCase() === "ACTIVE"
                    )

                setTemplates(filteredTemplates)
            })
            .catch((err) => {
                message.error(
                    err?.response?.data?.message || err?.message || "Failed to load templates"
                )
            })
    }
    useEffect(() => {
        if (showForm) {
            loadTemplates(data.type)
        }
    }, [data.type, showForm])
    useImperativeHandle(ref, () => ({
        openForm(dtl) {
            const campaignType = dtl?.type ||
                props.activeTab?.charAt(0).toUpperCase() + props.activeTab?.slice(1) ||
                "Email"

            const defaultData = {
                id: dtl?.id,
                name: dtl?.name || "",
                status: dtl?.status || "Draft",
                type: campaignType,
                for: dtl?.for || "",
                template_id: dtl?.template_id || "",
                senderName: dtl?.sender_name || "",
                senderEmail: dtl?.sender_email || "",
                replyTo: dtl?.reply_to || "",
                scheduled_at: dtl?.scheduled_at ? dayjs(dtl.scheduled_at) : undefined
            }

            setData(defaultData)
            setShowForm(true)
            loadTemplates(campaignType)
        },
    }))

    const handleTemplateSelect = (templateId) => {
        handleChange(templateId, "template_id")

        if (!templateId) {
            setData((prev) => ({
                ...prev,
                template_id: "",
                subject: "",
                body: "",
            }))
            return
        }

        const fetchTemplate = isWhatsApp
            ? CmasterService.getWhatsappTemplate(templateId)
            : CmasterService.getEmailTemplate(templateId)

        fetchTemplate
            .then(({ data }) => {
                const tpl = data?.result || data || {}

                setData((prev) => ({
                    ...prev,
                    template_id: templateId,
                    subject: isWhatsApp ? "" : tpl.subject || "",
                    body: tpl.body || tpl.message || "",
                }))
            })
            .catch((e) => {
                message.error(e?.message || "Failed to load template details")
            })
    }

    // Add campaign type change handler
    const handleCampaignTypeChange = (value) => {
        setData((prev) => ({
            ...prev,
            type: value,
            template_id: "", // Reset template selection when type changes
        }))
    }


    const save = async () => {
        // Basic validation
        if (!data.name || !data.type) {
            message.warning("Campaign name and type are required!")
            return
        }

        if (!isWhatsApp) {
            if (!data.senderName || !data.senderEmail) {
                message.warning("Sender Name and Sender Email are required for Email campaigns!")
                return
            }
        }

        const campaignType = data.type.toLowerCase();
        const scheduledAt = data.scheduled_at ? dayjs(data.scheduled_at) : null;
        const payload = {
            name: data.name,
            type: campaignType,
            template_id: data.template_id || undefined,
            ...(isWhatsApp
                ? {}
                : {
                    sender_name: data.senderName || undefined,
                    sender_email: data.senderEmail || undefined,
                    reply_to: data.replyTo || undefined,
                }),
            status: data.status?.toLowerCase() || 'draft',
            scheduled_at: scheduledAt && scheduledAt.isValid() ? scheduledAt.toISOString() : undefined
        }

        try {
            let res;
            if (data.id) {
                // Update existing campaign
                res = await CampaignService.updateCampaign(data.id, payload);
                message.success("Campaign updated successfully!");
            } else {
                // Create new campaign
                res = await CampaignService.createCampaign(payload);
                message.success("Campaign created successfully!");
            }

            setShowForm(false);

            // Refresh the campaign list
            if (props.onSaved && typeof props.onSaved === "function") {
                props.onSaved();
            }
        } catch (err) {
            console.error("Error saving campaign:", err);
            const errMsg = err.response?.data?.message ||
                err.message ||
                `Failed to ${data.id ? 'update' : 'create'} campaign`;
            message.error(errMsg);
        }
    }

    return (
        <Modal
            title={`${data.id ? "Edit" : "Add"} Campaign`}
            open={showForm}
            okText="Save"
            onOk={save}
            onCancel={() => setShowForm(false)}
            destroyOnClose
            maskClosable={false}
            width={700}
        >
            <Card size="small" title="Campaign Details">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    autoComplete="off"
                    spellCheck="false"
                >
                    <Row gutter={[12, 12]}>
                        <Col span={24}>
                            <label>Campaign Name</label>
                            <Input
                                placeholder="Enter campaign name"
                                value={data.name || ""}
                                onChange={(e) => handleChange(e.target.value, "name")}
                            />
                        </Col>

                        <Col span={12}>
                            <label>For</label>
                            <AntdSelect
                                placeholder="Select target"
                                value={data.for || undefined}
                                onChange={(v) => handleChange(v, "for")}
                                options={[
                                    { id: "Leads", name: "Leads" },
                                    { id: "Students", name: "Students" },
                                ]}
                            />
                        </Col>

                        {!isWhatsApp && (
                            <>
                                <Col span={12}>
                                    <label>Sender Name</label>
                                    <Input
                                        placeholder="Enter sender name"
                                        value={data.senderName || ""}
                                        onChange={(e) => handleChange(e.target.value, "senderName")}
                                    />
                                </Col>

                                <Col span={12}>
                                    <label>Sender Email</label>
                                    <Input
                                        placeholder="Enter sender email"
                                        value={data.senderEmail || ""}
                                        onChange={(e) => handleChange(e.target.value, "senderEmail")}
                                    />
                                </Col>

                                <Col span={24}>
                                    <label>Reply To</label>
                                    <Input
                                        placeholder="Enter reply-to email"
                                        value={data.replyTo || ""}
                                        onChange={(e) => handleChange(e.target.value, "replyTo")}
                                    />
                                </Col>
                            </>
                        )}

                        <Col span={12}>
                            <label>Status</label>
                            <AntdSelect
                                placeholder="Select Status"
                                value={data.status || "draft"}
                                onChange={(v) => handleChange(v, "status")}
                                options={[
                                    { id: "draft", name: "Draft" },
                                    { id: "scheduled", name: "Scheduled" },
                                    { id: "cancelled", name: "Cancelled" }
                                ]}
                                disabled={['sending', 'completed'].includes(data.status?.toLowerCase())}
                            />
                        </Col>

                        <Col span={12}>
                            <label>Type</label>
                            <AntdSelect
                                placeholder="Select Type"
                                value={data.type || "Email"}
                                onChange={(v) => handleCampaignTypeChange(v)}
                                options={[
                                    { id: "Email", name: "Email" },
                                    { id: "WhatsApp", name: "WhatsApp" },
                                ]}
                                disabled={Boolean(data.id)}
                            />
                        </Col>

                        {/* Template selection & preview moved to bottom */}
                        <Col span={12}>
                            <label>Template</label>
                            <AntdSelect
                                placeholder="Select Template"
                                value={data.template_id || undefined}
                                onChange={handleTemplateSelect}
                                allowClear
                                showSearch
                                options={templates.map((t) => ({ id: t.id, name: t.name }))}
                            />
                        </Col>

                        {data.template_id && (
                            <Col span={24}>
                                <div
                                    style={{
                                        marginTop: 8,
                                        padding: 12,
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 4,
                                        background: "#fafafa",
                                    }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Template Preview</div>
                                    {!isWhatsApp && data.subject && (
                                        <div style={{ marginBottom: 4 }}>
                                            <span style={{ fontWeight: 500 }}>Subject: </span>
                                            <span>{data.subject}</span>
                                        </div>
                                    )}
                                    <div
                                        className="email-body pt5 text-secondary"
                                        style={{
                                            marginTop: 4,
                                            fontSize: 12,
                                            maxHeight: 260,
                                            overflowY: "auto",
                                        }}
                                    >
                                        <RawHTML html={data.body || "<em>No body available for this template.</em>"} />
                                    </div>
                                </div>
                            </Col>
                        )}
                    </Row>
                </form>
            </Card>
        </Modal>
    )
})

export default function Campaign() {
    const [activeTab, setActiveTab] = useState("email")
    const [filterFd, setFilterFd] = useState({ name: "", for: "", status: "" })
    const listRef = useRef({})
    const formRef = useRef()
    const addLeadsRef = useRef()
    const viewRecipientsRef = useRef()

    const openForm = (campaign) => formRef.current.openForm(campaign)
    const openAddLeads = (campaign) => addLeadsRef.current.open(campaign)
    const openViewRecipients = (campaign) => viewRecipientsRef.current.open(campaign)

    const handleCampaignUpdated = () => {
        listRef.current?.getList(); // Refresh the campaign list
    }

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <div>
                    <h2>Campaigns</h2>
                </div>
            </div>
            <div className="page-pad">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    {["email", "whatsapp"].map((tab) => (
                        <TabPane
                            tab={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Campaign`}
                            key={tab}
                        >
                            <Card size="small" bodyStyle={{ padding: 10 }}>
                                <style>{`.campaign-filters .ant-input::placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 13px !important; opacity: 1 !important; } .campaign-filters .ant-select-selection__placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 13px !important; opacity: 1 !important; }`}</style>
                                <Row gutter={[12, 12]} align="middle" className="campaign-filters">
                                    <Col>
                                        <Input
                                            placeholder="Campaign Name"
                                            allowClear
                                            value={filterFd.name}
                                            onChange={(e) =>
                                                setFilterFd({ ...filterFd, name: e.target.value })
                                            }
                                            style={{ width: 220 }}
                                        />
                                    </Col>
                                    <Col>
                                        <Select
                                            placeholder="For"
                                            allowClear
                                            style={{ width: 140 }}
                                            value={filterFd.for || undefined}
                                            onChange={(v) => setFilterFd({ ...filterFd, for: v })}
                                            tagRender={(props) => (
                                                <AntdTag type="blue">{props.label}</AntdTag>
                                            )}
                                        >
                                            <Option value="Leads">Leads</Option>
                                            <Option value="Students">Students</Option>
                                        </Select>
                                    </Col>
                                    <Col>
                                        <Select
                                            placeholder="Status"
                                            allowClear
                                            style={{ width: 140 }}
                                            value={filterFd.status || undefined}
                                            onChange={(v) => setFilterFd({ ...filterFd, status: v })}
                                            tagRender={(props) => (
                                                <AntdTag
                                                    type={props.label === "Draft" ? "warning" : "success"}
                                                >
                                                    {props.label}
                                                </AntdTag>
                                            )}
                                        >
                                            <Option value="draft">Draft</Option>
                                            <Option value="scheduled">Scheduled</Option>
                                            <Option value="sending">Sending</Option>
                                            <Option value="completed">Completed</Option>
                                            <Option value="cancelled">Cancelled</Option>
                                        </Select>
                                    </Col>
                                    <Col>
                                        <Button
                                            icon={<SearchOutlined />}
                                            onClick={() =>
                                                listRef.current.getList({
                                                    ...filterFd,
                                                    status: filterFd.status
                                                        ? String(filterFd.status).toLowerCase()
                                                        : "",
                                                })
                                            }
                                            style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}
                                        >
                                            Search
                                        </Button>
                                    </Col>
                                    <Col flex="auto" />
                                    <Col>
                                        <Button
                                            icon={<PlusOutlined />}
                                            onClick={() => openForm()}
                                            style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}
                                        >
                                            Create New
                                        </Button>
                                    </Col>
                                </Row>

                                <div style={{ marginTop: 12 }}>
                                    <CampaignList
                                        refOb={listRef}
                                        openForm={openForm}
                                        tabType={tab}
                                        filterParams={filterFd}
                                        openAddLeads={openAddLeads}
                                    />
                                </div>
                            </Card>
                        </TabPane>
                    ))}
                </Tabs>
            </div>
            <AddEditCampaignForm
                ref={formRef}
                activeTab={activeTab}
                onSaved={handleCampaignUpdated}
            />
            <AddLeadsModal ref={addLeadsRef} />
            <ViewRecipientsModal ref={viewRecipientsRef} />
        </div>
    )
}
