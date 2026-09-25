// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// import InstituteService from "../../services/InstituteService";
// import { sdx } from "../../sdx";
// import DashboardService from '../../services/DashboardService';
// // import StudentService from '../../services/StudentService';
// import { Row, Col, Card, Statistic, Table, List, Tag } from 'antd';
// import {
//     MailOutlined,
//     WhatsAppOutlined,
//     FormOutlined,
//     CheckCircleOutlined,
//     CloseCircleOutlined,
//     UserAddOutlined,
//     FileDoneOutlined,
//     SolutionOutlined,
//     FileTextOutlined,
//     // SearchOutlined,
//     // ReloadOutlined
// } from '@ant-design/icons';
// import { useContext } from "react";
// import { SessionContext } from "../../context/SessionContext";

// // const { Search } = Input;
// // const { Option } = Select;

// export default function InstituteDash() {
//     // const navigate = useNavigate();
//     // const [noti, setNoti] = useState({});
//     const [scoreBoard, setScoreBoard] = useState({
//         choice_filled: 0,
//         admission_offered: 0,
//         admission_rejected: 0,
//         accepted_by_student: 0,
//         rejected_by_student: 0,
//         payment_proof_uploaded: 0,
//         enrolled: 0
//     });
//     const [courseWiseData, setCourseWiseData] = useState([]);
//     const [countryWiseData, setCountryWiseData] = useState([]);
//     const [sisNotifications, setSisNotifications] = useState([]);
//     const [communications, setCommunications] = useState({
//         emailSent: 0,
//         whatsappSent: 0,
//         ticketRaised: 0
//     });
//     const [instituteId, setInstituteId] = useState(null);
//     const { selectedSession } = useContext(SessionContext);

//     // On Institute dashboard load: fetch the active institute id from PHP API
//     // and propagate it to global `sdx` so all subsequent requests (headers)
//     // and uploads (visa payload `ins_id`) use the correct dynamic institute.
//     const fetchInstituteId = async () => {
//         try {
//             const { data } = await InstituteService.getInstituteId();
//             const fetched = Number(data?.data?.institute_id || 0);
//             if (fetched) {
//                 setInstituteId(fetched);
//                 try {
//                     sdx.setData({ institute_id: fetched });

//                 } catch (e) { }
//             }
//         } catch (err) {
//             console.error("Error fetching institute ID:", err);
//         }
//     };

//     // const getNoti = async () => {
//     //     try {
//     //         const { data } = await InstituteService.notifications(instituteId);
//     //         console.log("data email", data)
//     //         const rows = (data?.result?.data ?? []).map((item, idx) => ({
//     //             key: idx + 1,
//     //             title: item.title ?? item.name ?? item.notif_title ?? "",
//     //             message: item.message ?? item.body ?? item.description ?? "",
//     //             time: item.time ?? item.created ?? item.sent_at ?? ""
//     //         }));
//     //         setSisNotifications(rows);
//     //         // if (rows.length > 0) {
//     //         //     setNoti(rows[0]);
//     //         //     await InstituteService.markNotificationRead(rows[0].key);
//     //         // } else setNoti({});
//     //     } catch (err) {
//     //         console.error(err);
//     //     }
//     // };

//     const getNoti = async () => {
//         try {
//             // 🔹 Fetch only the first page of notifications
//             const { data } = await InstituteService.notifications({ p: 1, ps: 1 });
//             console.log("🔹 Notification API Response:", data);

//             // 🔹 Use the same structure as Notifications.jsx
//             const rows = (data?.result?.data ?? []).map((v, i) => ({
//                 key: i + 1,
//                 title: v.title,
//                 message: v.description,
//                 time: v.created
//             }));

//             // 🔹 Set only the first notification (if exists)
//             setSisNotifications(rows.length ? [rows[0]] : []);
//         } catch (err) {
//             console.error("❌ Error fetching notifications:", err);
//         }
//     };

//     const getCourseWiseData = async () => {
//         try {
//             const { data } = await DashboardService.instituteCourseSummary(instituteId, selectedSession?.name);
//             const rows = (data?.result?.data ?? []).map((item, idx) => ({
//                 key: idx + 1,
//                 course: item.course_name ?? "N/A",
//                 total_applications: item.total_applications,
//                 admission_offered: item.admission_offered,
//                 accepted_by_student: item.accepted_by_student,
//                 rejected_by_student: item.rejected_by_student,
//                 offer_letters_sent: item.offer_letters_sent
//             }));
//             setCourseWiseData(rows);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const getCountryWiseData = async () => {
//         try {
//             const { data } = await DashboardService.instituteCountrySummary(instituteId, selectedSession?.name);
//             const rows = (data?.result?.data ?? []).map((item, idx) => ({
//                 key: idx + 1,
//                 country: item.country_name ?? "N/A",
//                 total_applications: item.total_applications,
//                 admission_offered: item.admission_offered,
//                 accepted_by_student: item.accepted_by_student,
//                 rejected_by_student: item.rejected_by_student,
//                 offer_letters_sent: item.offer_letters_sent
//             }));
//             setCountryWiseData(rows);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const getCommunicationsData = async () => {
//         try {
//             const emailData = await DashboardService.instituteEmailsSent(instituteId, selectedSession?.name);
//             const whatsappData = await DashboardService.instituteWhatsappSent(instituteId, selectedSession?.name);

//             setCommunications({
//                 emailSent: emailData?.data?.result?.data?.emails_sent ?? 0,
//                 whatsappSent: whatsappData?.data?.result?.data?.whatsapp_sent ?? 0,
//                 ticketRaised: 0
//             });
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const getScoreBoardData = async () => {
//         try {
//             if (!instituteId) return;
//             const { data } = await DashboardService.instituteScoreboard(instituteId, selectedSession?.name);
//             const sb = data?.result?.data ?? {};

//             setScoreBoard({
//                 choice_filled: sb.choice_filled ?? 0,
//                 admission_offered: sb.admission_offered ?? 0,
//                 admission_rejected: sb.admission_rejected ?? 0,
//                 accepted_by_student: sb.accepted_by_student ?? 0,
//                 rejected_by_student: sb.rejected_by_student ?? 0,
//                 payment_proof_uploaded: sb.payment_proof_uploaded ?? 0,
//                 enrolled: sb.enrolled ?? 0
//             });
//         } catch (err) {
//             console.error("Error fetching Score Board ", err);
//         }
//     };

//     useEffect(() => { fetchInstituteId(); }, []);
//     useEffect(() => {
//         if (!instituteId || !selectedSession?.name) return;
//         getNoti();
//         getCourseWiseData();
//         getCountryWiseData();
//         getCommunicationsData();
//         getScoreBoardData();
//     }, [instituteId, selectedSession]);

//     const courseColumns = [
//         { title: 'Course', dataIndex: 'course', key: 'course' },
//         { title: 'Total Applications', dataIndex: 'total_applications', key: 'total_applications' },
//         { title: 'Admission Offered', dataIndex: 'admission_offered', key: 'admission_offered' },
//         { title: 'Accepted by Student', dataIndex: 'accepted_by_student', key: 'accepted_by_student' },
//         { title: 'Rejected by Student', dataIndex: 'rejected_by_student', key: 'rejected_by_student' },
//         { title: 'Offer Letters Sent', dataIndex: 'offer_letters_sent', key: 'offer_letters_sent' }
//     ];

//     const countryColumns = [
//         { title: 'Country', dataIndex: 'country', key: 'country' },
//         { title: 'Total Applications', dataIndex: 'total_applications', key: 'total_applications' },
//         { title: 'Admission Offered', dataIndex: 'admission_offered', key: 'admission_offered' },
//         { title: 'Accepted by Student', dataIndex: 'accepted_by_student', key: 'accepted_by_student' },
//         { title: 'Rejected by Student', dataIndex: 'rejected_by_student', key: 'rejected_by_student' },
//         { title: 'Offer Letters Sent', dataIndex: 'offer_letters_sent', key: 'offer_letters_sent' }
//     ];

//     const ROW_HEIGHT = 45;
//     const VISIBLE_ROWS = 10;
//     const TABLE_SCROLL_Y = ROW_HEIGHT * VISIBLE_ROWS + 8;

//     const scoreIcons = {
//         choice_filled: <FormOutlined style={{ color: '#1890ff', fontSize: '16px' }} />,
//         admission_offered: <SolutionOutlined style={{ color: '#52c41a', fontSize: '16px' }} />,
//         admission_rejected: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />,
//         accepted_by_student: <CheckCircleOutlined style={{ color: '#13c2c2', fontSize: '16px' }} />,
//         rejected_by_student: <CloseCircleOutlined style={{ color: '#faad14', fontSize: '16px' }} />,
//         payment_proof_uploaded: <FileDoneOutlined style={{ color: '#722ed1', fontSize: '16px' }} />,
//         enrolled: <UserAddOutlined style={{ color: '#eb2f96', fontSize: '16px' }} />
//     };

//     // Updated: Open in new tab with appropriate filters
//     const handleScoreCardClick = (type) => {
//         let searchParams = new URLSearchParams();

//         switch (type) {
//             case 'choice_filled':
//                 // Filter for students who have filled choices
//                 searchParams.set('choice_filling', 'choice_filling_done');
//                 break;

//             case 'admission_offered':
//                 // Use the 'accepted' tab for admission offered
//                 searchParams.set('tab', 'accepted');
//                 break;

//             case 'admission_rejected':
//                 // Use the 'rejected' tab for admission rejected
//                 searchParams.set('tab', 'rejected');
//                 break;

//             case 'accepted_by_student':
//                 // Use the 'offer_accepted' tab for students who accepted
//                 searchParams.set('tab', 'offer_accepted');
//                 break;

//             case 'rejected_by_student':
//                 // Use the 'stu_rejected' tab for students who rejected
//                 searchParams.set('tab', 'stu_rejected');
//                 break;

//             case 'payment_proof_uploaded':
//                 // Filter for students with payment proof uploaded
//                 searchParams.set('payment_proof', 'Uploaded');
//                 break;

//             case 'enrolled':
//                 // Filter for students who are enrolled (payment acknowledged)
//                 searchParams.set('payment_proof', 'Acknowledged');
//                 break;

//             default:
//                 break;
//         }

//         let url = '/istudents';
//         if (searchParams.toString()) {
//             url += `?${searchParams.toString()}`;
//         }

//         // Open in new tab
//         window.open(url, '_blank', 'noopener,noreferrer');
//     };

//     return (
//         <div>
//             <style>{`
// 				.custom-row { height: ${ROW_HEIGHT}px; }
// 				.ant-table-cell { padding: 12px 16px !important; }
// 				.big-card { min-height: 500px; }
// 				.comm-title { display: flex; align-items: center; gap: 8px; }
// 				.score-card { cursor: pointer; transition: all 0.3s ease; }
// 				.score-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); transform: translateY(-2px); }
// 				.filter-section { margin-bottom: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px; }
// 				.card-title-with-icon { display: inline-flex; align-items: center; gap: 8px; color: #fff; }
// 			`}</style>

//             {/* Score Board */}
//             <div className="mb20">
//                 {/* SIS Notifications (warning-styled) */}
//                 <div className="mb20">
//                     <Row gutter={[16, 16]}>
//                         <Col span={24}>
//                             <Card
//                                 size='small'
//                                 title={
//                                     <span className="card-title-with-icon">
//                                         <FileTextOutlined style={{ color: '#fff' }} />
//                                         <span>SIS Notifications</span>
//                                     </span>
//                                 }
//                                 headStyle={{ background: 'linear-gradient(90deg, #faad14 0%, #ffd666 100%)', color: '#fff', borderRadius: '6px 6px 0 0' }}
//                                 className='mt-4'
//                             >
//                                 <List
//                                     itemLayout="vertical"
//                                     dataSource={sisNotifications}
//                                     renderItem={item => (
//                                         <List.Item>
//                                             <div className="mb8">
//                                                 <Tag color="warning" style={{ marginRight: 8 }}>Notification</Tag>
//                                                 <span className="bold600">{item.title}</span>
//                                             </div>
//                                             <div className="" >
//                                                 <div style={{ color: '#ad6800' }}>{item.message}</div>
//                                                 <div className="text-secondary fs11 pt5">{item.time}</div>
//                                             </div>
//                                         </List.Item>
//                                     )}
//                                 />
//                             </Card>
//                         </Col>
//                     </Row>
//                 </div>
//                 <h3 className="mb15">Score Board</h3>
//                 <Row gutter={[16, 16]}>
//                     {Object.entries(scoreBoard).map(([key, value], idx) => (
//                         <Col xs={24} sm={12} md={8} lg={6} key={idx}>
//                             <Card
//                                 size='small'
//                                 className="score-card"
//                                 onClick={() => handleScoreCardClick(key)}
//                             >
//                                 <Statistic
//                                     title={
//                                         <span className="comm-title">{scoreIcons[key]} {key.split(/_/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</span>
//                                     }
//                                     value={value}
//                                     valueStyle={{ color: 'black' }}
//                                 />
//                             </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             </div>

//             {/* Communications (moved here, before Course & Country Summary) */}
//             <div className="mb20">
//                 <Row gutter={[16, 16]}>
//                     <Col span={24}>
//                         <Card
//                             size='small'
//                             title={
//                                 <span className="card-title-with-icon">
//                                     <MailOutlined style={{ color: '#fff' }} />
//                                     <span>Communications</span>
//                                 </span>
//                             }
//                             headStyle={{ background: 'linear-gradient(90deg, #1677ff 0%, #69b1ff 100%)', color: '#fff', borderRadius: '6px 6px 0 0' }}
//                         >
//                             <Row gutter={[16, 16]}>
//                                 <Col span={8}>
//                                     <Card size='small'>
//                                         <Statistic
//                                             title={<span className="comm-title"><MailOutlined style={{ color: 'blue' }} /> Email Sent</span>}
//                                             value={communications.emailSent}
//                                             valueStyle={{ color: 'black' }}
//                                         />
//                                     </Card>
//                                 </Col>
//                                 <Col span={8}>
//                                     <Card size='small'>
//                                         <Statistic
//                                             title={<span className="comm-title"><WhatsAppOutlined style={{ color: 'green' }} /> WhatsApp Sent</span>}
//                                             value={communications.whatsappSent}
//                                             valueStyle={{ color: 'black' }}
//                                         />
//                                     </Card>
//                                 </Col>
//                                 <Col span={8}>
//                                     <Card size='small'>
//                                         <Statistic
//                                             title={<span className="comm-title"><FileTextOutlined style={{ color: 'red' }} /> Ticket Raised</span>}
//                                             value={communications.ticketRaised}
//                                             valueStyle={{ color: 'black' }}
//                                         />
//                                     </Card>
//                                 </Col>
//                             </Row>
//                         </Card>
//                     </Col>
//                 </Row>
//             </div>

//             {/* Course & Country Summary */}
//             <div className="mb20">
//                 <Row gutter={[16, 16]}>
//                     <Col span={24}>
//                         <Card
//                             size='small'
//                             title={
//                                 <span className="card-title-with-icon">
//                                     <SolutionOutlined style={{ color: '#fff' }} />
//                                     <span>Course Wise Summary</span>
//                                 </span>
//                             }
//                             headStyle={{ background: 'linear-gradient(90deg, #1677ff 0%, #69b1ff 100%)', color: '#fff', borderRadius: '6px 6px 0 0' }}
//                             bodyStyle={{ padding: 0 }}
//                             className="big-card"
//                         >
//                             <Table
//                                 dataSource={courseWiseData}
//                                 columns={courseColumns}
//                                 size="middle"
//                                 pagination={false}
//                                 scroll={{ y: TABLE_SCROLL_Y }}
//                                 rowClassName={() => "custom-row"}
//                             />
//                         </Card>
//                     </Col>
//                     <Col span={24}>
//                         <Card
//                             size='small'
//                             title={
//                                 <span className="card-title-with-icon">
//                                     <SolutionOutlined style={{ color: '#fff' }} />
//                                     <span>Country Wise Summary</span>
//                                 </span>
//                             }
//                             headStyle={{ background: 'linear-gradient(90deg, #1677ff 0%, #69b1ff 100%)', color: '#fff', borderRadius: '6px 6px 0 0' }}
//                             bodyStyle={{ padding: 0 }}
//                             className="big-card mt-4"
//                         >
//                             <Table
//                                 dataSource={countryWiseData}
//                                 columns={countryColumns}
//                                 size="middle"
//                                 pagination={false}
//                                 scroll={{ y: TABLE_SCROLL_Y }}
//                                 rowClassName={() => "custom-row"}
//                             />
//                         </Card>
//                     </Col>
//                 </Row>
//             </div>
//         </div>
//     );
// }

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import InstituteService from "../../services/InstituteService";
import { sdx } from "../../sdx";
import DashboardService from '../../services/DashboardService';
import { Tag } from 'antd';
import { useContext } from "react";
import { SessionContext } from "../../context/SessionContext";


export default function InstituteDash() {
    // const navigate = useNavigate();
    // const [noti, setNoti] = useState({});
    const [scoreBoard, setScoreBoard] = useState({
        choice_filled: 0,
        admission_offered: 0,
        admission_rejected: 0,
        accepted_by_student: 0,
        rejected_by_student: 0,
        payment_proof_uploaded: 0,
        enrolled: 0
    });
    const [courseWiseData, setCourseWiseData] = useState([]);
    const [countryWiseData, setCountryWiseData] = useState([]);
    const [sisNotifications, setSisNotifications] = useState([]);
    const [communications, setCommunications] = useState({
        emailSent: 0,
        whatsappSent: 0,
        ticketRaised: 0
    });
    const [instituteId, setInstituteId] = useState(null);
    const { selectedSession } = useContext(SessionContext);

    // On Institute dashboard load: fetch the active institute id from PHP API
    // and propagate it to global `sdx` so all subsequent requests (headers)
    // and uploads (visa payload `ins_id`) use the correct dynamic institute.
    const fetchInstituteId = async () => {
        try {
            const { data } = await InstituteService.getInstituteId();
            const fetched = Number(data?.data?.institute_id || 0);
            if (fetched) {
                setInstituteId(fetched);
                try {
                    sdx.setData({ institute_id: fetched });

                } catch (e) { }
            }
        } catch (err) {
            console.error("Error fetching institute ID:", err);
        }
    };

    // const getNoti = async () => {
    //     try {
    //         const { data } = await InstituteService.notifications(instituteId);
    //         console.log("data email", data)
    //         const rows = (data?.result?.data ?? []).map((item, idx) => ({
    //             key: idx + 1,
    //             title: item.title ?? item.name ?? item.notif_title ?? "",
    //             message: item.message ?? item.body ?? item.description ?? "",
    //             time: item.time ?? item.created ?? item.sent_at ?? ""
    //         }));
    //         setSisNotifications(rows);
    //         // if (rows.length > 0) {
    //         //     setNoti(rows[0]);
    //         //     await InstituteService.markNotificationRead(rows[0].key);
    //         // } else setNoti({});
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };

    const getNoti = async () => {
        try {
            // 🔹 Fetch only the first page of notifications
            const { data } = await InstituteService.notifications({ p: 1, ps: 1 });
            // console.log("🔹 Notification API Response:", data);

            // 🔹 Use the same structure as Notifications.jsx
            const rows = (data?.result?.data ?? []).map((v, i) => ({
                key: i + 1,
                title: v.title,
                message: v.description,
                time: v.created
            }));

            // 🔹 Set only the first notification (if exists)
            setSisNotifications(rows.length ? [rows[0]] : []);
        } catch (err) {
            console.error("❌ Error fetching notifications:", err);
        }
    };

    const getCourseWiseData = async () => {
        try {
            const { data } = await DashboardService.instituteCourseSummary(instituteId, selectedSession?.name);
            const rows = (data?.result?.data ?? []).map((item, idx) => ({
                key: idx + 1,
                course: item.course_name ?? "N/A",
                total_applications: item.total_applications,
                admission_offered: item.admission_offered,
                accepted_by_student: item.accepted_by_student,
                rejected_by_student: item.rejected_by_student,
                offer_letters_sent: item.offer_letters_sent
            }));
            setCourseWiseData(rows);
        } catch (err) {
            console.error(err);
        }
    };

    const getCountryWiseData = async () => {
        try {
            const { data } = await DashboardService.instituteCountrySummary(instituteId, selectedSession?.name);
            const rows = (data?.result?.data ?? []).map((item, idx) => ({
                key: idx + 1,
                country: item.country_name ?? "N/A",
                total_applications: item.total_applications,
                admission_offered: item.admission_offered,
                accepted_by_student: item.accepted_by_student,
                rejected_by_student: item.rejected_by_student,
                offer_letters_sent: item.offer_letters_sent
            }));
            setCountryWiseData(rows);
        } catch (err) {
            console.error(err);
        }
    };

    const getCommunicationsData = async () => {
        try {
            const emailData = await DashboardService.instituteEmailsSent(instituteId, selectedSession?.name);
            const whatsappData = await DashboardService.instituteWhatsappSent(instituteId, selectedSession?.name);

            setCommunications({
                emailSent: emailData?.data?.result?.data?.emails_sent ?? 0,
                whatsappSent: whatsappData?.data?.result?.data?.whatsapp_sent ?? 0,
                ticketRaised: 0
            });
        } catch (err) {
            console.error(err);
        }
    };

    const getScoreBoardData = async () => {
        try {
            if (!instituteId) return;
            const { data } = await DashboardService.instituteScoreboard(instituteId, selectedSession?.name);
            const sb = data?.result?.data ?? {};

            setScoreBoard({
                choice_filled: sb.choice_filled ?? 0,
                admission_offered: sb.admission_offered ?? 0,
                admission_rejected: sb.admission_rejected ?? 0,
                accepted_by_student: sb.accepted_by_student ?? 0,
                rejected_by_student: sb.rejected_by_student ?? 0,
                payment_proof_uploaded: sb.payment_proof_uploaded ?? 0,
                enrolled: sb.enrolled ?? 0
            });
        } catch (err) {
            console.error("Error fetching Score Board ", err);
        }
    };

    useEffect(() => { fetchInstituteId(); }, []);
    useEffect(() => {
        if (!instituteId || !selectedSession?.name) return;
        getNoti();
        getCourseWiseData();
        getCountryWiseData();
        getCommunicationsData();
        getScoreBoardData();
    }, [instituteId, selectedSession]);

    const scoreCards = [
        { key: 'choice_filled', label: 'Choice Filled', value: scoreBoard.choice_filled, icon: 'fa-list-ul', iconBg: '#e6f4ff', iconFg: '#1677ff', href: '/istudents?choice_filling=choice_filling_done' },
        { key: 'admission_offered', label: 'Admission Offered', value: scoreBoard.admission_offered, icon: 'fa-check-circle', iconBg: '#f6ffed', iconFg: '#52c41a', href: '/istudents?tab=accepted' },
        { key: 'admission_rejected', label: 'Admission Rejected', value: scoreBoard.admission_rejected, icon: 'fa-times-circle', iconBg: '#fff2f0', iconFg: '#ff4d4f', href: '/istudents?tab=rejected' },
        { key: 'accepted_by_student', label: 'Accepted by Student', value: scoreBoard.accepted_by_student, icon: 'fa-thumbs-up', iconBg: '#e6fffb', iconFg: '#13c2c2', href: '/istudents?tab=offer_accepted' },
        { key: 'rejected_by_student', label: 'Rejected by Student', value: scoreBoard.rejected_by_student, icon: 'fa-thumbs-down', iconBg: '#fff7e6', iconFg: '#fa8c16', href: '/istudents?tab=stu_rejected' },
        { key: 'payment_proof_uploaded', label: 'Payment Proof', value: scoreBoard.payment_proof_uploaded, icon: 'fa-credit-card', iconBg: '#f9f0ff', iconFg: '#722ed1', href: '/istudents?payment_proof=Uploaded' },
        { key: 'enrolled', label: 'Enrolled', value: scoreBoard.enrolled, icon: 'fa-graduation-cap', iconBg: '#edfff3', iconFg: '#389e0d', href: '/istudents?payment_proof=Acknowledged' },
    ];

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Welcome Banner */}
            <div className="dash-welcome" style={{ textAlign: 'center' }}>
                <div className="dash-welcome-header">
                    <div className="dash-header-icon-box">
                        <i className="fa fa-tachometer-alt"></i>
                    </div>
                    <h1 style={{ margin: 0 }}>Institute Dashboard</h1>
                </div>
                <p>Overview of all activities</p>
            </div>

            {/* Score Board */}
            <div className="dash-section">
                <div className="dash-header">
                    <h2 className="dash-title">
                        <i className="fa fa-chart-bar" style={{ marginRight: 8, color: '#1677ff' }}></i>
                        Score Board
                    </h2>
                </div>
                <div className="dash-body">
                    <div className="dash-cards-grid-5">
                        {scoreCards.map(c => (
                            <a key={c.key} href={c.href} target="_blank" rel="noreferrer" className="no-underline" style={{ color: 'inherit', textDecoration: 'none' }}>
                                <div className="dash-stat-card" style={{ borderTopColor: c.iconFg, cursor: 'pointer' }}>
                                    <div className="dash-stat-top">
                                        <span className="dash-stat-icon" style={{ background: c.iconBg }}>
                                            <i className={`fa ${c.icon}`} style={{ color: c.iconFg, fontSize: 16 }}></i>
                                        </span>
                                        <span className="dash-stat-label">{c.label}</span>
                                    </div>
                                    <div className="dash-stat-value">{Number(c.value || 0).toLocaleString()}</div>
                                    <div className="dash-stat-sparkline" style={{ background: c.iconFg }}></div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* SIS Notifications */}
            {sisNotifications.length > 0 && (
                <div className="dash-section">
                    <div className="dash-header">
                        <h2 className="dash-title">
                            <i className="fa fa-bell" style={{ marginRight: 8, color: '#faad14' }}></i>
                            SIS Notifications
                        </h2>
                    </div>
                    <div className="dash-body">
                        {sisNotifications.map((item, idx) => (
                            <div key={idx} style={{ padding: '12px 16px', background: '#fffbe6', borderRadius: 10, border: '1px solid #ffe58f', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <Tag color="warning" style={{ margin: 0, borderRadius: 6, fontWeight: 600 }}>Notification</Tag>
                                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{item.title}</span>
                                </div>
                                <div style={{ color: '#92400e', fontSize: 13 }}>{item.message}</div>
                                <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>{item.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Communications */}
            <div className="dash-section">
                <div className="dash-header">
                    <h2 className="dash-title">
                        <i className="fa fa-comments" style={{ marginRight: 8, color: '#52c41a' }}></i>
                        Communications
                    </h2>
                </div>
                <div className="dash-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div style={{ padding: '18px 20px', background: '#f0f5ff', borderRadius: 12, border: '1px solid #d6e4ff', textAlign: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#d6e4ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <i className="fa fa-envelope" style={{ fontSize: 20, color: '#1677ff' }}></i>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{communications.emailSent}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>Emails Sent</div>
                        </div>
                        <div style={{ padding: '18px 20px', background: '#f6ffed', borderRadius: 12, border: '1px solid #b7eb8f', textAlign: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#b7eb8f', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <i className="fa fa-whatsapp" style={{ fontSize: 20, color: '#52c41a' }}></i>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{communications.whatsappSent}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>WhatsApp Sent</div>
                        </div>
                        <div style={{ padding: '18px 20px', background: '#fff2f0', borderRadius: 12, border: '1px solid #ffccc7', textAlign: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ffccc7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <i className="fa fa-ticket-alt" style={{ fontSize: 20, color: '#ff4d4f' }}></i>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{communications.ticketRaised}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>Tickets Raised</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course & Country Summary - side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Course Wise */}
                <div className="dash-section">
                    <div className="dash-header">
                        <h2 className="dash-title">
                            <i className="fa fa-book" style={{ marginRight: 8, color: '#722ed1' }}></i>
                            Course Wise Summary
                        </h2>
                    </div>
                    <div className="dash-body" style={{ padding: 0 }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-sm table-hover m-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13 }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px' }}>Course</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Total</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Offered</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Accepted</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Rejected</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Offers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courseWiseData.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>No data available</td></tr>
                                    ) : courseWiseData.map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.course}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.total_applications}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.admission_offered}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{row.accepted_by_student}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{row.rejected_by_student}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.offer_letters_sent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Country Wise */}
                <div className="dash-section">
                    <div className="dash-header">
                        <h2 className="dash-title">
                            <i className="fa fa-globe" style={{ marginRight: 8, color: '#1890ff' }}></i>
                            Country Wise Summary
                        </h2>
                    </div>
                    <div className="dash-body" style={{ padding: 0 }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-sm table-hover m-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13 }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px' }}>Country</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Total</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Offered</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Accepted</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Rejected</th>
                                        <th style={{ fontWeight: 700, fontSize: 11, color: '#475569', padding: '10px 12px', textAlign: 'center' }}>Offers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {countryWiseData.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>No data available</td></tr>
                                    ) : countryWiseData.map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.country}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.total_applications}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.admission_offered}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{row.accepted_by_student}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{row.rejected_by_student}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.offer_letters_sent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}