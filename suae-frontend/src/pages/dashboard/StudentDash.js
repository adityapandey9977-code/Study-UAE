// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from "react-router-dom";
// import StudentService from "../../services/StudentService";
// import ClientService from "../../services/ClientService";
// import InstituteService from "../../services/InstituteService";
// import util from '../../utils/util';
// import {
//     message,
//     Steps,
//     Button,
//     Card,
//     Progress,
//     Alert,
//     Badge,
//     Spin,
//     Dropdown,
//     Modal
// } from 'antd';
// import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
// import moment from 'moment';
// const { confirm } = Modal;

// const { Step } = Steps;
// //const $=window.$;

// const paymentStatusColor = {
//     Pending: 'orange',
//     Uploaded: 'purple',
//     Acknowledged: 'green',
//     Rejected: 'red',
// };

// export default function StudentDash() {
//     const navigate = useNavigate();
//     const [stuDtl, setStuDtl] = useState({});
//     const [cfStarted, setCfStarted] = useState('N');
//     const [applied, setApplied] = useState([]);
//     const [travelPlans, setTravelPlans] = useState([]);
//     const [travelLoading, setTravelLoading] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const stuStatusItems = [
//         { label: <div className="cursor-pointer">Accept</div>, key: 'Accepted' },
//         { label: <div className="cursor-pointer">Reject</div>, key: 'Rejected' },
//     ];

//     const fetchTravelPlan = async (studentIdParam) => {
//         try {
//             setTravelLoading(true);
//             const studentId = studentIdParam ?? stuDtl?.id ?? stuDtl?.student_id ?? null;
//             if (!studentId) {
//                 setTravelPlans([]);
//                 return;
//             }
//             const res = await InstituteService.getPickupDetails(studentId);
//             const files = res?.data?.files;
//             if (res?.data?.status && Array.isArray(files) && files.length > 0) {
//                 setTravelPlans(files.map((item) => ({
//                     id: item.id || item.file_id || `${item.file_url || ''}-${item.created || ''}`,
//                     title: item.file_name || (item.pickup ? "Pickup Schedule" : "Travel Plan"),
//                     url: item.file_url || "",
//                     content: item.pickup || "",
//                     created: item.created || item.updated || null
//                 })));
//             } else {
//                 setTravelPlans([]);
//             }
//         } catch (error) {
//             setTravelPlans([]);
//         } finally {
//             setTravelLoading(false);
//         }
//     };
//     const handleStudentStatusClick = ({ key }, scf_id) => {
//         const fn = async () => {
//             setLoading(true)
//             const res = await StudentService.setSCFStudentStatus({
//                 scf_id,
//                 status: key,
//             })
//             if (res.success) {
//                 message.success(res.message || "Success")
//                 setApplied((prev) =>
//                     prev.map((r) =>
//                         r.scf_id === scf_id
//                             ? {
//                                 ...r,
//                                 stu_status: key,
//                                 stu_status_dt: moment().format("YYYY-MM-DD HH:mm:ss"),
//                             }
//                             : r
//                     )
//                 )
//             } else {
//                 message.error(res.message || "Failed")
//             }
//             setLoading(false)
//         };

//         confirm({
//             title: `Are you sure to mark as ${key}?`,
//             icon: <ExclamationCircleOutlined />,
//             content: "",
//             okText: "Yes",
//             cancelText: "No",
//             onOk: fn,
//         })
//     }

//     const getStuDtl = () => {
//         util.showLoader();
//         StudentService.detail().then((res) => {
//             const detail = res.data.result || {};
//             setStuDtl(detail);
//         }).catch(e => {
//             message.error(e.message);
//         }).finally(() => {
//             util.hideLoader();
//         });
//     }

//     const appliedCourses = () => {
//         StudentService.appliedCourses().then(({ data }) => {
//             setApplied(data.result.data);
//         }).catch(e => {
//             message.error(e.message);
//         }).finally(() => {
//         })
//     }
//     console.log("applied:: ", applied)

//     const stepCompleted = () => {
//         if (stuDtl.course_choice_date) {
//             return 4;
//         } else if (stuDtl.background_info_date) {
//             return 3;
//         } else if (stuDtl.edu_info_date) {
//             return 2;
//         } else if (stuDtl.basic_info_date) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }

//     useEffect(() => {
//         ClientService.choiceFillingStarted().then(({ data }) => {
//             setCfStarted(data.result);
//         });
//         getStuDtl();
//         appliedCourses();
//     }, []);

//     useEffect(() => {
//         const studentId = stuDtl?.id || stuDtl?.student_id;
//         if (studentId) {
//             fetchTravelPlan(studentId);
//         }
//     }, [stuDtl?.id, stuDtl?.student_id]);

//     const offers = applied.filter(a => a.offer_file_url);
//     const paymentProofs = applied.filter((row) => row.payment_slip_file_url);
//     const acceptedCourse = applied.find((row) => row.stu_status === 'Accepted');
//     const paymentSummary = paymentProofs[0] || acceptedCourse || null;
//     const paymentStatus = paymentSummary?.payment_status || 'Pending';
//     const hasAcceptedCourse = applied.some((r) => r.stu_status === "Accepted")

//     //const wh=$(window).height();
//     let cardh = 530; //wh-210;

//     return (
//         <div className="">
//             <div className="row">
//                 <div className="col-md-6 mb20">
//                     <Card title="Application Journey" bodyStyle={{ padding: 0 }}>
//                         <div className="ant-steps-green cscroll p20" style={{ height: cardh }}>
//                             <Steps direction="vertical" current={stepCompleted() + 1} status="wait">
//                                 <Step
//                                     title="SIS Registration"
//                                     subTitle={(stuDtl.email_verified === 1 ? 'Completed' : 'Registered') + ' on ' + util.getDate(stuDtl.created, 'DD MMM YYYY @ hh:mm A')}
//                                     description={
//                                         <div className='pb-8 text-[12px]'>
//                                             <div className="pb-1">
//                                                 {stuDtl.email_verified === 1 ? (
//                                                     <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Email verified</div>
//                                                 ) : (
//                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Email not verified</div>
//                                                 )}
//                                             </div>
//                                             <div>
//                                                 {stuDtl.mobile_verified === 1 ? (
//                                                     <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Mobile verified</div>
//                                                 ) : (
//                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Mobile not verified</div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     }
//                                 />

//                                 <Step
//                                     title="Basic Information"
//                                     subTitle={stuDtl.basic_info_date ? ('Completed on ' + util.getDate(stuDtl.basic_info_date, 'DD MMM YYYY @ hh:mm A')) : (
//                                         <span>
//                                             <span className="font-red">Pending</span>
//                                             <span className="pl5">
//                                                 <Button size="small" type="link" onClick={() => { navigate("/student-application/1") }}>Complete Now</Button>
//                                             </span>
//                                         </span>
//                                     )}
//                                     description={
//                                         <div style={{ paddingBottom: "30px" }}>
//                                             {stuDtl.basic_info_date &&
//                                                 <div className="fs12">
//                                                     {stuDtl.mobile_verified === 1 ? (
//                                                         <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Mobile number (Whatsapp) verified</div>
//                                                     ) : (
//                                                         <div className="font-red"><i className="fa fa-times-circle"></i> Mobile number (Whatsapp) not verified</div>
//                                                     )}
//                                                 </div>}
//                                         </div>
//                                     }
//                                 />

//                                 <Step
//                                     title="Educational Information"
//                                     subTitle={stuDtl.edu_info_date ? ('Completed on ' + util.getDate(stuDtl.edu_info_date, 'DD MMM YYYY @ hh:mm A')) : (
//                                         <span>
//                                             <span className="font-red">Pending</span>
//                                             {stuDtl.basic_info_date &&
//                                                 <span className="pl5">
//                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/2") }}>Complete Now</Button>
//                                                 </span>}
//                                         </span>
//                                     )}
//                                     description={
//                                         <div style={{ paddingBottom: "30px" }}>
//                                             {stuDtl.edu_info_date ? (
//                                                 <div className="fs12">
//                                                     {stuDtl.doc_uploaded_on ? (
//                                                         <>
//                                                             <div><i className="fa fa-check-circle font-green-jungle"></i> Document uploaded on {util.getDate(stuDtl.doc_uploaded_on, 'DD MMM YYYY @ hh:mm A')}</div>
//                                                             {!stuDtl.doc_verified_on ? (
//                                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Document verification pending</div>
//                                                             ) : (
//                                                                 <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Document verified on {util.getDate(stuDtl.doc_verified_on, 'DD MMM YYYY @ hh:mm A')}</div>
//                                                             )}
//                                                         </>
//                                                     ) : (
//                                                         <div className="font-red"><i className="fa fa-times-circle"></i> Document upload pending</div>
//                                                     )}
//                                                 </div>
//                                             ) : ""}
//                                         </div>
//                                     }
//                                 />

//                                 <Step
//                                     title="Background Information"
//                                     subTitle={stuDtl.background_info_date ? ('Completed on ' + util.getDate(stuDtl.background_info_date, 'DD MMM YYYY @ hh:mm A')) : (
//                                         <span>
//                                             <span className="font-red">Pending</span>
//                                             {stuDtl.edu_info_date &&
//                                                 <span className="pl5">
//                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/3") }}>Complete Now</Button>
//                                                 </span>}
//                                         </span>
//                                     )}
//                                     description={<div style={{ paddingBottom: "30px" }}></div>}
//                                 />

//                                 <Step
//                                     title="Choice Filling"
//                                     subTitle={stuDtl.course_choice_date ? ('Completed on ' + util.getDate(stuDtl.course_choice_date, 'DD MMM YYYY @ hh:mm A')) : (
//                                         <span>
//                                             <span className="font-red">Pending</span>
//                                             {stuDtl.background_info_date &&
//                                                 <span className="pl5">
//                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/4") }}>Complete Now</Button>
//                                                 </span>}
//                                         </span>
//                                     )}
//                                     description={
//                                         <div style={{ paddingBottom: "30px" }}>
//                                             {cfStarted === 'N' && !stuDtl.course_choice_date &&
//                                                 <div className="fs12">
//                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Not started yet</div>
//                                                 </div>
//                                             }
//                                         </div>
//                                     }
//                                 />

//                                 {/* <Step 
//                                     title="Result Declaration" 
//                                     subTitle="Pending"
//                                     description={
//                                         <div style={{paddingBottom:"30px"}}>
//                                             <div className="fs12">
//                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not declared Yet</div>
//                                             </div>
//                                         </div>
//                                     }
//                                 />

//                                 <Step 
//                                     title="Offer Letter" 
//                                     subTitle="Pending"
//                                     description={
//                                         <div style={{paddingBottom:"30px"}}>
//                                             <div className="fs12">
//                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not alloted Yet</div>
//                                             </div>
//                                         </div>
//                                     }
//                                 />

//                                 <Step 
//                                     title="Admission Proof" 
//                                     subTitle="Pending"
//                                     description={
//                                         <div style={{paddingBottom:"30px"}}>
//                                             <div className="fs12">
//                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not given Yet</div>
//                                             </div>
//                                         </div>
//                                     }
//                                 />

//                                 <Step 
//                                     title="Travel Plan" 
//                                     subTitle="Pending"
//                                     description={
//                                         <div style={{paddingBottom:"30px"}}>
//                                             <div className="fs12">
//                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not uploaded Yet</div>
//                                             </div>
//                                         </div>
//                                     }
//                                 /> */}
//                             </Steps>
//                         </div>
//                     </Card>
//                 </div>
//                 <div className="col-md-6 mb20">
//                     <Card title="Student Journey" bodyStyle={{ padding: 0 }}>
//                         <div className="cscroll p20" style={{ height: cardh }}>
//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="w250 uc">Application Completion</div>
//                                             <div className="flex-grow-1">
//                                                 <Progress percent={stuDtl.completion_per} strokeWidth={12} trailColor="#ccc" showInfo={false} />
//                                             </div>
//                                             <div className="pl10">
//                                                 {stuDtl.completion_per}%
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="w250 uc">Student Queries</div>
//                                             <div className="ml-auto">
//                                                 <Badge count={stuDtl.issues_count} showZero />
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="uc">Comunications</div>
//                                             <div className="ml-auto">
//                                                 <Badge count={stuDtl.sent_email_count} showZero />
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> BASIC INFORMATION FILLING GUIDE</div>
//                                             <div className="ml-auto">
//                                                 <a href="/dashboard" target="blank">Watch Now</a>
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> BACKGROUND INFORMATION FILLING GUIDE</div>
//                                             <div className="ml-auto">
//                                                 <a href="/dashboard" target="blank">Watch Now</a>
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> STUDENT CHOICE FILLING GUIDE</div>
//                                             <div className="ml-auto">
//                                                 <a href="/dashboard" target="blank">Watch Now</a>
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                     </Card>
//                 </div>
//             </div>

//             <div className="row">
//                 {/* <div className="col-md-3 mb20">
//                     <Card title="Result Declaration" extra={(<div className="text-secondary">Pending</div>)}>
//                         <div className="font-red">Not declared yet</div>
//                     </Card>
//                 </div> */}
//                 <div className="col-md-4 mb20">
//                     <Card
//                         title="Offer Letter"
//                         extra={(<div className={offers.length > 0 ? "text-success" : "text-secondary"}>{offers.length > 0 ? 'Received' : 'Pending'}</div>)}
//                     >
//                         {offers.length > 0 ? (
//                             <div className='flex flex-col gap-3'>
//                                 {offers.map(row => (
//                                     <div key={row.scf_id} className='flex items-center justify-between'>
//                                         <div>
//                                             {row.inst_name}
//                                             <div className='text-black/50 text-[11px] pt-[2px]'>{row.course}</div>
//                                         </div>
//                                         <div>
//                                             <a href={row.offer_file_url} target='_blank' rel="noreferrer">
//                                                 <Button size='small' type='primary' ghost>Download</Button>
//                                             </a>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="font-red">Not alloted yet</div>
//                         )}

//                     </Card>
//                 </div>
//                 <div className="col-md-4 mb20">
//                     <Card
//                         title="Payment Proof"
//                         extra={(
//                             <div style={{ color: paymentStatusColor[paymentStatus] || '#868686' }}>
//                                 {paymentStatus}
//                             </div>
//                         )}
//                     >
//                         {paymentProofs.length > 0 ? (
//                             <div className='flex flex-col gap-3'>
//                                 {paymentProofs.map((row) => (
//                                     <div key={row.scf_id} className='flex items-start justify-between gap-4'>
//                                         <div className='flex-1'>
//                                             <div className='font-semibold'>{row.inst_name}</div>
//                                             <div className='text-black/50 text-[11px] pt-[2px]'>{row.specialization || row.course}</div>
//                                             <div className='text-black/50 text-[11px] pt-[6px]'>
//                                                 Status:&nbsp;
//                                                 <span style={{ color: paymentStatusColor[row.payment_status] || '#555' }}>
//                                                     {row.payment_status || 'Pending'}
//                                                 </span>
//                                             </div>
//                                             {!!row.payment_comment && (
//                                                 <div className='text-black/60 text-[11px] pt-[4px]'>
//                                                     Remarks: {row.payment_comment}
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className='flex flex-col md:flex-row gap-2'>
//                                             <a href={row.payment_slip_file_url} target='_blank' rel='noreferrer'>
//                                                 <Button size='small' type='primary' ghost>
//                                                     View
//                                                 </Button>
//                                             </a>
//                                             <a
//                                                 href={row.payment_slip_file_url}
//                                                 target='_blank'
//                                                 rel='noreferrer'
//                                                 download={`${row.inst_name || 'payment'}_PaymentSlip.pdf`}
//                                             >
//                                                 <Button size='small'>
//                                                     Download
//                                                 </Button>
//                                             </a>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className='text-gray-500'>
//                                 {paymentStatus === 'Pending'
//                                     ? (
//                                         <div className='flex flex-col md:flex-row justify-between'>
//                                             <span>Payment proof not uploaded yet.</span>
//                                             <Link to="/student-payment-proof">
//                                                 <Button size="small" type="primary">
//                                                     Upload Now
//                                                 </Button>
//                                             </Link>
//                                         </div>
//                                     )
//                                     : `Payment status: ${paymentStatus}`}
//                             </div>
//                         )}
//                     </Card>
//                 </div>

//                 <div className="col-md-4 mb20">
//                     <Card
//                         title="Pickup Schedule"
//                         extra={(
//                             <div className={travelPlans.length > 0 ? "text-success" : "text-secondary"}>
//                                 {travelPlans.length > 0 ? `${travelPlans.length} ${travelPlans.length === 1 ? 'Entry' : 'Entries'}` : "Pending"}
//                             </div>
//                         )}
//                     >
//                         <Spin spinning={travelLoading}>
//                             {travelPlans.length > 0 ? (
//                                 <div className="flex flex-col gap-3">
//                                     {travelPlans.map((plan) => (
//                                         <div key={plan.id} className="flex items-start justify-between gap-4 border border-gray-200 rounded-md p-3">
//                                             <div className="flex-1">
//                                                 <div className="font-semibold text-sm">{plan.title}</div>
//                                                 {plan.created && (
//                                                     <div className="text-black/50 text-[11px] pt-[2px]">
//                                                         Uploaded on {util.getDate(plan.created, 'DD MMM YYYY @ hh:mm A')}
//                                                     </div>
//                                                 )}
//                                                 {plan.content && (
//                                                     <div
//                                                         className="text-black/60 text-[12px] pt-2"
//                                                         dangerouslySetInnerHTML={{ __html: plan.content }}
//                                                     />
//                                                 )}
//                                             </div>
//                                             <div className="flex flex-col gap-2">
//                                                 {plan.url && (
//                                                     <a href={plan.url} target="_blank" rel="noreferrer">
//                                                         <Button size="small" type="primary" ghost>
//                                                             View
//                                                         </Button>
//                                                     </a>
//                                                 )}
//                                                 {plan.url && (
//                                                     <a
//                                                         href={plan.url}
//                                                         target="_blank"
//                                                         rel="noreferrer"
//                                                         download={plan.title.replace(/\s+/g, '_') + '.pdf'}
//                                                     >
//                                                         <Button size="small">Download</Button>
//                                                     </a>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-gray-500">Pickup schedule not uploaded yet.</div>
//                             )}
//                         </Spin>
//                     </Card>
//                 </div>
//                 {/* Applied courses */}
//                 {!applied || applied.length === 0 ? (
//                     <Card title="Applied Courses" className="w-full shadow-sm">
//                         <div className="p-8 text-center text-gray-500 text-base">
//                             You haven't applied to any courses yet.
//                         </div>
//                     </Card>
//                 ) : (
//                     <Card
//                         title={<span className="text-xl font-semibold text-gray-800">Applied Courses</span>}
//                         extra={
//                             <span className="text-sm text-gray-500">
//                                 Total: <strong>{applied.length}</strong>
//                             </span>
//                         }
//                         className="w-full shadow-md"
//                         bodyStyle={{ padding: 0 }}
//                     >
//                         <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
//                             <table className="min-w-full text-sm text-left">
//                                 <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wide">
//                                     <tr>
//                                         <th className="px-6 py-3">Institute</th>
//                                         <th className="px-6 py-3">Specialization</th>
//                                         <th className="px-6 py-3">Applied On</th>
//                                         <th className="px-6 py-3">Institute Status</th>
//                                         <th className="px-6 py-3">My Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {applied.map((app) => (
//                                         <tr
//                                             key={app.scf_id}
//                                             className="hover:bg-gray-50 transition-all duration-150 ease-in-out"
//                                         >
//                                             <td className="px-6 py-4">
//                                                 <div className="font-medium text-gray-800">{app.inst_name}</div>
//                                                 <div className="text-xs text-gray-500">
//                                                     {app.inst_city}, {app.inst_state}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <div className="text-gray-700 font-semibold">{app.specialization}</div>
//                                             </td>
//                                             <td className="px-6 py-4 text-gray-600">
//                                                 {util.getDate(app.applied_on, "DD MMM YYYY")}
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <AppStatusTag status={app.ins_status} />
//                                             </td>

//                                             <td className="px-6 py-4">
//                                                 <div className="flex items-center justify-between gap-2 mt-1">
//                                                     <div className={`${(app.ins_status === 'Accepted' && app.offer_file_url && app.stu_status === 'Pending') ? 'w-[100px]' : 'w-full'}`}>
//                                                         <AppStatusTag status={app.stu_status} />
//                                                     </div>
//                                                     {(app.ins_status === "Accepted" &&
//                                                         app.offer_file_url &&
//                                                         app.stu_status === "Pending" &&
//                                                         !hasAcceptedCourse) && (
//                                                             <Dropdown
//                                                                 menu={{ items: stuStatusItems, onClick: (e) => handleStudentStatusClick(e, app.scf_id) }}
//                                                                 trigger={["click"]}
//                                                             >
//                                                                 <div className="bdr px-3 py-[2px] cursor-pointer rounded-[4px]">
//                                                                     <DownOutlined />
//                                                                 </div>
//                                                             </Dropdown>
//                                                         )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </Card>
//                 )}


//             </div>
//         </div>
//     )
// }

// const AppStatusTag = ({ status }) => {
//     const colors = { Pending: '#FFBF00', Accepted: '#26C281', Approved: '#26C281', Rejected: '#ed6b75' };
//     return (
//         <div
//             className="uppercase text-[11px] px-2 py-[2px] rounded-lg text-center"
//             style={{ color: colors[status], border: `1px solid ${colors[status]}` }}
//         >
//             {status}
//         </div>
//     );
// };



// // /* eslint-disable react-hooks/exhaustive-deps */
// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from "react-router-dom";
// // import StudentService from "../../services/StudentService";
// // import ClientService from "../../services/ClientService";
// // import util from '../../utils/util';
// // import {
// //     message,
// //     Steps,
// //     Button,
// //     Card,
// //     Progress,
// //     Alert,
// //     Badge
// // } from 'antd';

// // const { Step } = Steps;
// // //const $=window.$;

// // export default function StudentDash() {
// //     const navigate = useNavigate();
// //     const [stuDtl, setStuDtl] = useState({});
// //     const [cfStarted, setCfStarted] = useState('N');
// //     const [applied, setApplied] = useState([]);

// //     const getStuDtl = () => {
// //         util.showLoader();
// //         StudentService.detail().then((res) => {
// //             setStuDtl(res.data.result || {});
// //         }).catch(e => {
// //             message.error(e.message);
// //         }).finally(() => {
// //             util.hideLoader();
// //         });
// //     }

// //     const appliedCourses = () => {
// //         StudentService.appliedCourses().then(({ data }) => {
// //             setApplied(data.result.data);
// //         }).catch(e => {
// //             message.error(e.message);
// //         }).finally(() => {
// //         })
// //     }

// //     const stepCompleted = () => {
// //         if (stuDtl.course_choice_date) {
// //             return 4;
// //         } else if (stuDtl.background_info_date) {
// //             return 3;
// //         } else if (stuDtl.edu_info_date) {
// //             return 2;
// //         } else if (stuDtl.basic_info_date) {
// //             return 1;
// //         } else {
// //             return 0;
// //         }
// //     }

// //     useEffect(() => {
// //         ClientService.choiceFillingStarted().then(({ data }) => {
// //             setCfStarted(data.result);
// //         });
// //         getStuDtl();
// //         appliedCourses();
// //     }, []);

// //     const offers = applied.filter(a => a.offer_file_url);

// //     //const wh=$(window).height();
// //     let cardh = 530; //wh-210;

// //     return (
// //         <div className="">
// //             <div className="row">
// //                 <div className="col-md-6 mb20">
// //                     <Card title="Application Journey" bodyStyle={{ padding: 0 }}>
// //                         <div className="ant-steps-green cscroll p20" style={{ height: cardh }}>
// //                             <Steps direction="vertical" current={stepCompleted() + 1} status="wait">
// //                                 <Step
// //                                     title="SIS Registration"
// //                                     subTitle={(stuDtl.email_verified === 1 ? 'Completed' : 'Registered') + ' on ' + util.getDate(stuDtl.created, 'DD MMM YYYY @ hh:mm A')}
// //                                     description={
// //                                         <div className='pb-8 text-[12px]'>
// //                                             <div className="pb-1">
// //                                                 {stuDtl.email_verified === 1 ? (
// //                                                     <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Email verified</div>
// //                                                 ) : (
// //                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Email not verified</div>
// //                                                 )}
// //                                             </div>
// //                                             <div>
// //                                                 {stuDtl.mobile_verified === 1 ? (
// //                                                     <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Mobile verified</div>
// //                                                 ) : (
// //                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Mobile not verified</div>
// //                                                 )}
// //                                             </div>
// //                                         </div>
// //                                     }
// //                                 />

// //                                 <Step
// //                                     title="Basic Information"
// //                                     subTitle={stuDtl.basic_info_date ? ('Completed on ' + util.getDate(stuDtl.basic_info_date, 'DD MMM YYYY @ hh:mm A')) : (
// //                                         <span>
// //                                             <span className="font-red">Pending</span>
// //                                             <span className="pl5">
// //                                                 <Button size="small" type="link" onClick={() => { navigate("/student-application/1") }}>Complete Now</Button>
// //                                             </span>
// //                                         </span>
// //                                     )}
// //                                     description={
// //                                         <div style={{ paddingBottom: "30px" }}>
// //                                             {stuDtl.basic_info_date &&
// //                                                 <div className="fs12">
// //                                                     {stuDtl.mobile_verified === 1 ? (
// //                                                         <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Mobile number (Whatsapp) verified</div>
// //                                                     ) : (
// //                                                         <div className="font-red"><i className="fa fa-times-circle"></i> Mobile number (Whatsapp) not verified</div>
// //                                                     )}
// //                                                 </div>}
// //                                         </div>
// //                                     }
// //                                 />

// //                                 <Step
// //                                     title="Educational Information"
// //                                     subTitle={stuDtl.edu_info_date ? ('Completed on ' + util.getDate(stuDtl.edu_info_date, 'DD MMM YYYY @ hh:mm A')) : (
// //                                         <span>
// //                                             <span className="font-red">Pending</span>
// //                                             {stuDtl.basic_info_date &&
// //                                                 <span className="pl5">
// //                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/2") }}>Complete Now</Button>
// //                                                 </span>}
// //                                         </span>
// //                                     )}
// //                                     description={
// //                                         <div style={{ paddingBottom: "30px" }}>
// //                                             {stuDtl.edu_info_date ? (
// //                                                 <div className="fs12">
// //                                                     {stuDtl.doc_uploaded_on ? (
// //                                                         <>
// //                                                             <div><i className="fa fa-check-circle font-green-jungle"></i> Document uploaded on {util.getDate(stuDtl.doc_uploaded_on, 'DD MMM YYYY @ hh:mm A')}</div>
// //                                                             {!stuDtl.doc_verified_on ? (
// //                                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Document verification pending</div>
// //                                                             ) : (
// //                                                                 <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Document verified on {util.getDate(stuDtl.doc_verified_on, 'DD MMM YYYY @ hh:mm A')}</div>
// //                                                             )}
// //                                                         </>
// //                                                     ) : (
// //                                                         <div className="font-red"><i className="fa fa-times-circle"></i> Document upload pending</div>
// //                                                     )}
// //                                                 </div>
// //                                             ) : ""}
// //                                         </div>
// //                                     }
// //                                 />

// //                                 <Step
// //                                     title="Background Information"
// //                                     subTitle={stuDtl.background_info_date ? ('Completed on ' + util.getDate(stuDtl.background_info_date, 'DD MMM YYYY @ hh:mm A')) : (
// //                                         <span>
// //                                             <span className="font-red">Pending</span>
// //                                             {stuDtl.edu_info_date &&
// //                                                 <span className="pl5">
// //                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/3") }}>Complete Now</Button>
// //                                                 </span>}
// //                                         </span>
// //                                     )}
// //                                     description={<div style={{ paddingBottom: "30px" }}></div>}
// //                                 />

// //                                 <Step
// //                                     title="Choice Filling"
// //                                     subTitle={stuDtl.course_choice_date ? ('Completed on ' + util.getDate(stuDtl.course_choice_date, 'DD MMM YYYY @ hh:mm A')) : (
// //                                         <span>
// //                                             <span className="font-red">Pending</span>
// //                                             {stuDtl.background_info_date &&
// //                                                 <span className="pl5">
// //                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/4") }}>Complete Now</Button>
// //                                                 </span>}
// //                                         </span>
// //                                     )}
// //                                     description={
// //                                         <div style={{ paddingBottom: "30px" }}>
// //                                             {cfStarted === 'N' && !stuDtl.course_choice_date &&
// //                                                 <div className="fs12">
// //                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Not started yet</div>
// //                                                 </div>
// //                                             }
// //                                         </div>
// //                                     }
// //                                 />

// //                                 {/* <Step 
// //                                     title="Result Declaration" 
// //                                     subTitle="Pending"
// //                                     description={
// //                                         <div style={{paddingBottom:"30px"}}>
// //                                             <div className="fs12">
// //                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not declared Yet</div>
// //                                             </div>
// //                                         </div>
// //                                     }
// //                                 />

// //                                 <Step 
// //                                     title="Offer Letter" 
// //                                     subTitle="Pending"
// //                                     description={
// //                                         <div style={{paddingBottom:"30px"}}>
// //                                             <div className="fs12">
// //                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not alloted Yet</div>
// //                                             </div>
// //                                         </div>
// //                                     }
// //                                 />

// //                                 <Step 
// //                                     title="Admission Proof" 
// //                                     subTitle="Pending"
// //                                     description={
// //                                         <div style={{paddingBottom:"30px"}}>
// //                                             <div className="fs12">
// //                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not given Yet</div>
// //                                             </div>
// //                                         </div>
// //                                     }
// //                                 />

// //                                 <Step 
// //                                     title="Travel Plan" 
// //                                     subTitle="Pending"
// //                                     description={
// //                                         <div style={{paddingBottom:"30px"}}>
// //                                             <div className="fs12">
// //                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not uploaded Yet</div>
// //                                             </div>
// //                                         </div>
// //                                     }
// //                                 /> */}
// //                             </Steps>
// //                         </div>
// //                     </Card>
// //                 </div>
// //                 <div className="col-md-6 mb20">
// //                     <Card title="Student Journey" bodyStyle={{ padding: 0 }}>
// //                         <div className="cscroll p20" style={{ height: cardh }}>
// //                             <div className="mb20">
// //                                 <Alert
// //                                     banner
// //                                     type="warning"
// //                                     showIcon={false}
// //                                     className="shadow-sm"
// //                                     message={(
// //                                         <div className="d-flex align-items-center bold600">
// //                                             <div className="w250 uc">Application Completion</div>
// //                                             <div className="flex-grow-1">
// //                                                 <Progress percent={stuDtl.completion_per} strokeWidth={12} trailColor="#ccc" showInfo={false} />
// //                                             </div>
// //                                             <div className="pl10">
// //                                                 {stuDtl.completion_per}%
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 />
// //                             </div>

// //                             <div className="mb20">
// //                                 <Alert
// //                                     banner
// //                                     type="warning"
// //                                     showIcon={false}
// //                                     className="shadow-sm"
// //                                     message={(
// //                                         <div className="d-flex align-items-center bold600">
// //                                             <div className="w250 uc">Student Queries</div>
// //                                             <div className="ml-auto">
// //                                                 <Badge count={stuDtl.issues_count} showZero />
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 />
// //                             </div>

// //                             <div className="mb20">
// //                                 <Alert
// //                                     banner
// //                                     type="warning"
// //                                     showIcon={false}
// //                                     className="shadow-sm"
// //                                     message={(
// //                                         <div className="d-flex align-items-center bold600">
// //                                             <div className="uc">Comunications</div>
// //                                             <div className="ml-auto">
// //                                                 <Badge count={stuDtl.sent_email_count} showZero />
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 />
// //                             </div>

// //                             <div className="mb20">
// //                                 <Alert
// //                                     banner
// //                                     type="warning"
// //                                     showIcon={false}
// //                                     className="shadow-sm"
// //                                     message={(
// //                                         <div className="d-flex align-items-center bold600">
// //                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> BASIC INFORMATION FILLING GUID</div>
// //                                             <div className="ml-auto">
// //                                                 <a href="/dashboard" target="blank">Watch Now</a>
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 />
// //                             </div>

// //                             <div className="mb20">
// //                                 <Alert
// //                                     banner
// //                                     type="warning"
// //                                     showIcon={false}
// //                                     className="shadow-sm"
// //                                     message={(
// //                                         <div className="d-flex align-items-center bold600">
// //                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> BACKGROUND INFORMATION FILLING GUIDE</div>
// //                                             <div className="ml-auto">
// //                                                 <a href="/dashboard" target="blank">Watch Now</a>
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 />
// //                             </div>

// //                             <div className="">
// //                                 <Alert
// //                                     banner
// //                                     type="warning"
// //                                     showIcon={false}
// //                                     className="shadow-sm"
// //                                     message={(
// //                                         <div className="d-flex align-items-center bold600">
// //                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> STUDENT CHOICE FILLING GUIDE</div>
// //                                             <div className="ml-auto">
// //                                                 <a href="/dashboard" target="blank">Watch Now</a>
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 />
// //                             </div>
// //                         </div>
// //                     </Card>
// //                 </div>
// //             </div>

// //             <div className="row">
// //                 {/* <div className="col-md-3 mb20">
// //                     <Card title="Result Declaration" extra={(<div className="text-secondary">Pending</div>)}>
// //                         <div className="font-red">Not declared yet</div>
// //                     </Card>
// //                 </div> */}
// //                 <div className="col-md-4 mb20">
// //                     <Card title="Offer Letter" extra={(<div className={offers.length > 0 ? "text-success" : "text-secondary"}>{offers.length > 0 ? 'Received' : 'Pending'}</div>)}>
// //                         {offers.length > 0 ? (
// //                             <div className='flex flex-col gap-3'>
// //                                 {offers.map(row => (
// //                                     <div key={row.scf_id} className='flex items-center justify-between'>
// //                                         <div>
// //                                             {row.inst_name}
// //                                             <div className='text-black/50 text-[11px] pt-[2px]'>{row.course}</div>
// //                                         </div>
// //                                         <div>
// //                                             <a href={row.offer_file_url} target='_blank' rel="noreferrer">
// //                                                 <Button size='small' type='primary' ghost>Download</Button>
// //                                             </a>
// //                                         </div>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         ) : (
// //                             <div className="font-red">Not alloted yet</div>
// //                         )}

// //                     </Card>
// //                 </div>
// //                 <div className="col-md-4 mb20">
// //                     <Card title="Payment Proof" extra={(<div className="text-secondary">Pending</div>)}>
// //                         <div className="font-red">Not given yet</div>
// //                     </Card>
// //                 </div>
// //                 <div className="col-md-4 mb20">
// //                     <Card title="Travel Plan" extra={(<div className="text-secondary">Pending</div>)}>
// //                         <div className="font-red">Not uploaded  yet</div>
// //                     </Card>
// //                 </div>
// //                 {/* Applied courses */}
// //               {!applied || applied.length === 0 ? (
// //   <Card title="Applied Courses" className="w-full shadow-sm">
// //     <div className="p-8 text-center text-gray-500 text-base">
// //       You haven't applied to any courses yet.
// //     </div>
// //   </Card>
// // ) : (
// //   <Card
// //     title={<span className="text-xl font-semibold text-gray-800">Applied Courses</span>}
// //     extra={
// //       <span className="text-sm text-gray-500">
// //         Total: <strong>{applied.length}</strong>
// //       </span>
// //     }
// //     className="w-full shadow-md"
// //     bodyStyle={{ padding: 0 }}
// //   >
// //     <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
// //       <table className="min-w-full text-sm text-left">
// //         <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wide">
// //           <tr>
// //             <th className="px-6 py-3">Institute</th>
// //             <th className="px-6 py-3">Specialization</th>
// //             <th className="px-6 py-3">Applied On</th>
// //             <th className="px-6 py-3">Status</th>
// //           </tr>
// //         </thead>
// //         <tbody className="bg-white divide-y divide-gray-200">
// //           {applied.map((app) => (
// //             <tr
// //               key={app.scf_id}
// //               className="hover:bg-gray-50 transition-all duration-150 ease-in-out"
// //             >
// //               <td className="px-6 py-4">
// //                 <div className="font-medium text-gray-800">{app.inst_name}</div>
// //                 <div className="text-xs text-gray-500">
// //                   {app.inst_city}, {app.inst_state}
// //                 </div>
// //               </td>
// //               <td className="px-6 py-4">
// //                 <div className="text-gray-700 font-semibold">{app.specialization}</div>
// //               </td>
// //               <td className="px-6 py-4 text-gray-600">
// //                 {util.getDate(app.applied_on, "DD MMM YYYY")}
// //               </td>
// //               <td className="px-6 py-4">
// //                 <AppStatusTag status={app.ins_status} />
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //     </div>
// //   </Card>
// // )}


// //             </div>
// //         </div>
// //     )
// // }

// // const AppStatusTag = ({ status }) => {
// //     const colors = { Pending: '#FFBF00', Accepted: '#26C281', Approved: '#26C281', Rejected: '#ed6b75' };
// //     return (
// //         <div
// //             className="uppercase text-[11px] px-2 py-[2px] rounded-lg text-center"
// //             style={{ color: colors[status], border: `1px solid ${colors[status]}` }}
// //         >
// //             {status}
// //         </div>
// //     );
// // };

// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from "react-router-dom";
// import StudentService from "../../services/StudentService";
// import ClientService from "../../services/ClientService";
// import InstituteService from "../../services/InstituteService";
// import util from '../../utils/util';
// import {
//     message,
//     Steps,
//     Button,
//     Card,
//     Progress,
//     Alert,
//     Badge,
//     Spin
// } from 'antd';

// const { Step } = Steps;
// //const $=window.$;

// const paymentStatusColor = {
//     Pending: 'orange',
//     Uploaded: 'purple',
//     Acknowledged: 'green',
//     Rejected: 'red',
// };

// export default function StudentDash() {
//     const navigate = useNavigate();
//     const [stuDtl, setStuDtl] = useState({});
//     const [cfStarted, setCfStarted] = useState('N');
//     const [applied, setApplied] = useState([]);
//     const [travelPlans, setTravelPlans] = useState([]);
//     const [travelLoading, setTravelLoading] = useState(false);

//     const fetchTravelPlan = async (studentIdParam) => {
//         try {
//             setTravelLoading(true);
//             const studentId = studentIdParam ?? stuDtl?.id ?? stuDtl?.student_id ?? null;
//             if (!studentId) {
//                 setTravelPlans([]);
//                 return;
//             }
//             const res = await InstituteService.getPickupDetails(studentId);
//             const files = res?.data?.files;
//             if (res?.data?.status && Array.isArray(files) && files.length > 0) {
//                 setTravelPlans(files.map((item) => ({
//                     id: item.id || item.file_id || `${item.file_url || ''}-${item.created || ''}`,
//                     title: item.file_name || (item.pickup ? "Pickup Schedule" : "Travel Plan"),
//                     url: item.file_url || "",
//                     content: item.pickup || "",
//                     created: item.created || item.updated || null
//                 })));
//             } else {
//                 setTravelPlans([]);
//             }
//         } catch (error) {
//             setTravelPlans([]);
//         } finally {
//             setTravelLoading(false);
//         }
//     };

//     const getStuDtl = () => {
//         util.showLoader();
//         StudentService.detail().then((res) => {
//             const detail = res.data.result || {};
//             setStuDtl(detail);
//         }).catch(e => {
//             message.error(e.message);
//         }).finally(() => {
//             util.hideLoader();
//         });
//     }

//     const appliedCourses = () => {
//         StudentService.appliedCourses().then(({ data }) => {
//             setApplied(data.result.data);
//         }).catch(e => {
//             message.error(e.message);
//         }).finally(() => {
//         })
//     }

//     const stepCompleted = () => {
//         if (stuDtl.course_choice_date) {
//             return 4;
//         } else if (stuDtl.background_info_date) {
//             return 3;
//         } else if (stuDtl.edu_info_date) {
//             return 2;
//         } else if (stuDtl.basic_info_date) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }

//     useEffect(() => {
//         ClientService.choiceFillingStarted().then(({ data }) => {
//             setCfStarted(data.result);
//         });
//         getStuDtl();
//         appliedCourses();
//     }, []);

//     useEffect(() => {
//         const studentId = stuDtl?.id || stuDtl?.student_id;
//         if (studentId) {
//             fetchTravelPlan(studentId);
//         }
//     }, [stuDtl?.id, stuDtl?.student_id]);

//     const offers = applied.filter(a => a.offer_file_url);
//     const paymentProofs = applied.filter((row) => row.payment_slip_file_url);
//     const acceptedCourse = applied.find((row) => row.stu_status === 'Accepted');
//     const paymentSummary = paymentProofs[0] || acceptedCourse || null;
//     const paymentStatus = paymentSummary?.payment_status || 'Pending';

//     //const wh=$(window).height();
//     let cardh = 530; //wh-210;

//     return (
//         <div className="">
//             <div className="row">
//                 <div className="col-md-6 mb20">
//                     <Card title="Application Journey" bodyStyle={{ padding: 0 }}>
//                         <div className="ant-steps-green cscroll p20" style={{ height: cardh }}>
//                             <Steps direction="vertical" current={stepCompleted() + 1} status="wait">
//                                 <Step
//                                     title="SIS Registration"
//                                     subTitle={(stuDtl.email_verified === 1 ? 'Completed' : 'Registered') + ' on ' + util.getDate(stuDtl.created, 'DD MMM YYYY @ hh:mm A')}
//                                     description={
//                                         <div className='pb-8 text-[12px]'>
//                                             <div className="pb-1">
//                                                 {stuDtl.email_verified === 1 ? (
//                                                     <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Email verified</div>
//                                                 ) : (
//                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Email not verified</div>
//                                                 )}
//                                             </div>
//                                             <div>
//                                                 {stuDtl.mobile_verified === 1 ? (
//                                                     <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Mobile verified</div>
//                                                 ) : (
//                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Mobile not verified</div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     }
//                                 />

//                                 <Step
//                                     title="Basic Information"
//                                     subTitle={stuDtl.basic_info_date ? ('Completed on ' + util.getDate(stuDtl.basic_info_date, 'DD MMM YYYY @ hh:mm A')) : (
//                                         <span>
//                                             <span className="font-red">Pending</span>
//                                             <span className="pl5">
//                                                 <Button size="small" type="link" onClick={() => { navigate("/student-application/1") }}>Complete Now</Button>
//                                             </span>
//                                         </span>
//                                     )}
//                                     description={
//                                         <div style={{ paddingBottom: "30px" }}>
//                                             {stuDtl.basic_info_date &&
//                                                 <div className="fs12">
//                                                     {stuDtl.mobile_verified === 1 ? (
//                                                         <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Mobile number (Whatsapp) verified</div>
//                                                     ) : (
//                                                         <div className="font-red"><i className="fa fa-times-circle"></i> Mobile number (Whatsapp) not verified</div>
//                                                     )}
//                                                 </div>}
//                                         </div>
//                                     }
//                                 />

//                                 <Step
//                                     title="Educational Information"
//                                     subTitle={stuDtl.edu_info_date ? ('Completed on ' + util.getDate(stuDtl.edu_info_date, 'DD MMM YYYY @ hh:mm A')) : (
//                                         <span>
//                                             <span className="font-red">Pending</span>
//                                             {stuDtl.basic_info_date &&
//                                                 <span className="pl5">
//                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/2") }}>Complete Now</Button>
//                                                 </span>}
//                                         </span>
//                                     )}
//                                     description={
//                                         <div style={{ paddingBottom: "30px" }}>
//                                             {stuDtl.edu_info_date ? (
//                                                 <div className="fs12">
//                                                     {stuDtl.doc_uploaded_on ? (
//                                                         <>
//                                                             <div><i className="fa fa-check-circle font-green-jungle"></i> Document uploaded on {util.getDate(stuDtl.doc_uploaded_on, 'DD MMM YYYY @ hh:mm A')}</div>
//                                                             {!stuDtl.doc_verified_on ? (
//                                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Document verification pending</div>
//                                                             ) : (
//                                                                 <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Document verified on {util.getDate(stuDtl.doc_verified_on, 'DD MMM YYYY @ hh:mm A')}</div>
//                                                             )}
//                                                         </>
//                                                     ) : (
//                                                         <div className="font-red"><i className="fa fa-times-circle"></i> Document upload pending</div>
//                                                     )}
//                                                 </div>
//                                             ) : ""}
//                                         </div>
//                                     }
//                                 />

//                                 <Step
//                                     title="Background Information"
//                                     subTitle={stuDtl.background_info_date ? ('Completed on ' + util.getDate(stuDtl.background_info_date, 'DD MMM YYYY @ hh:mm A')) : (
//                                         <span>
//                                             <span className="font-red">Pending</span>
//                                             {stuDtl.edu_info_date &&
//                                                 <span className="pl5">
//                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/3") }}>Complete Now</Button>
//                                                 </span>}
//                                         </span>
//                                     )}
//                                     description={<div style={{ paddingBottom: "30px" }}></div>}
//                                 />

//                                 <Step
//                                     title="Choice Filling"
//                                     subTitle={stuDtl.course_choice_date ? ('Completed on ' + util.getDate(stuDtl.course_choice_date, 'DD MMM YYYY @ hh:mm A')) : (
//                                         <span>
//                                             <span className="font-red">Pending</span>
//                                             {stuDtl.background_info_date &&
//                                                 <span className="pl5">
//                                                     <Button size="small" type="link" onClick={() => { navigate("/student-application/4") }}>Complete Now</Button>
//                                                 </span>}
//                                         </span>
//                                     )}
//                                     description={
//                                         <div style={{ paddingBottom: "30px" }}>
//                                             {cfStarted === 'N' && !stuDtl.course_choice_date &&
//                                                 <div className="fs12">
//                                                     <div className="font-red"><i className="fa fa-times-circle"></i> Not started yet</div>
//                                                 </div>
//                                             }
//                                         </div>
//                                     }
//                                 />

//                                 {/* <Step 
//                                     title="Result Declaration" 
//                                     subTitle="Pending"
//                                     description={
//                                         <div style={{paddingBottom:"30px"}}>
//                                             <div className="fs12">
//                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not declared Yet</div>
//                                             </div>
//                                         </div>
//                                     }
//                                 />

//                                 <Step 
//                                     title="Offer Letter" 
//                                     subTitle="Pending"
//                                     description={
//                                         <div style={{paddingBottom:"30px"}}>
//                                             <div className="fs12">
//                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not alloted Yet</div>
//                                             </div>
//                                         </div>
//                                     }
//                                 />

//                                 <Step 
//                                     title="Admission Proof" 
//                                     subTitle="Pending"
//                                     description={
//                                         <div style={{paddingBottom:"30px"}}>
//                                             <div className="fs12">
//                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not given Yet</div>
//                                             </div>
//                                         </div>
//                                     }
//                                 />

//                                 <Step 
//                                     title="Travel Plan" 
//                                     subTitle="Pending"
//                                     description={
//                                         <div style={{paddingBottom:"30px"}}>
//                                             <div className="fs12">
//                                                 <div className="font-red"><i className="fa fa-times-circle"></i> Not uploaded Yet</div>
//                                             </div>
//                                         </div>
//                                     }
//                                 /> */}
//                             </Steps>
//                         </div>
//                     </Card>
//                 </div>
//                 <div className="col-md-6 mb20">
//                     <Card title="Student Journey" bodyStyle={{ padding: 0 }}>
//                         <div className="cscroll p20" style={{ height: cardh }}>
//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="w250 uc">Application Completion</div>
//                                             <div className="flex-grow-1">
//                                                 <Progress percent={stuDtl.completion_per} strokeWidth={12} trailColor="#ccc" showInfo={false} />
//                                             </div>
//                                             <div className="pl10">
//                                                 {stuDtl.completion_per}%
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="w250 uc">Student Queries</div>
//                                             <div className="ml-auto">
//                                                 <Badge count={stuDtl.issues_count} showZero />
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="uc">Comunications</div>
//                                             <div className="ml-auto">
//                                                 <Badge count={stuDtl.sent_email_count} showZero />
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> BASIC INFORMATION FILLING GUID</div>
//                                             <div className="ml-auto">
//                                                 <a href="/dashboard" target="blank">Watch Now</a>
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="mb20">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> BACKGROUND INFORMATION FILLING GUIDE</div>
//                                             <div className="ml-auto">
//                                                 <a href="/dashboard" target="blank">Watch Now</a>
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             <div className="">
//                                 <Alert
//                                     banner
//                                     type="warning"
//                                     showIcon={false}
//                                     className="shadow-sm"
//                                     message={(
//                                         <div className="d-flex align-items-center bold600">
//                                             <div className="uc"><i className="fa fa-caret-right pfont-color"></i> STUDENT CHOICE FILLING GUIDE</div>
//                                             <div className="ml-auto">
//                                                 <a href="/dashboard" target="blank">Watch Now</a>
//                                             </div>
//                                         </div>
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                     </Card>
//                 </div>
//             </div>

//             <div className="row">
//                 {/* <div className="col-md-3 mb20">
//                     <Card title="Result Declaration" extra={(<div className="text-secondary">Pending</div>)}>
//                         <div className="font-red">Not declared yet</div>
//                     </Card>
//                 </div> */}
//                 <div className="col-md-4 mb20">
//                     <Card
//                         title="Offer Letter"
//                         extra={(<div className={offers.length > 0 ? "text-success" : "text-secondary"}>{offers.length > 0 ? 'Received' : 'Pending'}</div>)}
//                     >
//                         {offers.length > 0 ? (
//                             <div className='flex flex-col gap-3'>
//                                 {offers.map(row => (
//                                     <div key={row.scf_id} className='flex items-center justify-between'>
//                                         <div>
//                                             {row.inst_name}
//                                             <div className='text-black/50 text-[11px] pt-[2px]'>{row.course}</div>
//                                         </div>
//                                         <div>
//                                             <a href={row.offer_file_url} target='_blank' rel="noreferrer">
//                                                 <Button size='small' type='primary' ghost>Download</Button>
//                                             </a>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="font-red">Not alloted yet</div>
//                         )}

//                     </Card>
//                 </div>
//                 <div className="col-md-4 mb20">
//                     <Card
//                         title="Payment Proof"
//                         extra={(
//                             <div style={{ color: paymentStatusColor[paymentStatus] || '#868686' }}>
//                                 {paymentStatus}
//                             </div>
//                         )}
//                     >
//                         {paymentProofs.length > 0 ? (
//                             <div className='flex flex-col gap-3'>
//                                 {paymentProofs.map((row) => (
//                                     <div key={row.scf_id} className='flex items-start justify-between gap-4'>
//                                         <div className='flex-1'>
//                                             <div className='font-semibold'>{row.inst_name}</div>
//                                             <div className='text-black/50 text-[11px] pt-[2px]'>{row.specialization || row.course}</div>
//                                             <div className='text-black/50 text-[11px] pt-[6px]'>
//                                                 Status:&nbsp;
//                                                 <span style={{ color: paymentStatusColor[row.payment_status] || '#555' }}>
//                                                     {row.payment_status || 'Pending'}
//                                                 </span>
//                                             </div>
//                                             {!!row.payment_comment && (
//                                                 <div className='text-black/60 text-[11px] pt-[4px]'>
//                                                     Remarks: {row.payment_comment}
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className='flex flex-col md:flex-row gap-2'>
//                                             <a href={row.payment_slip_file_url} target='_blank' rel='noreferrer'>
//                                                 <Button size='small' type='primary' ghost>
//                                                     View
//                                                 </Button>
//                                             </a>
//                                             <a
//                                                 href={row.payment_slip_file_url}
//                                                 target='_blank'
//                                                 rel='noreferrer'
//                                                 download={`${row.inst_name || 'payment'}_PaymentSlip.pdf`}
//                                             >
//                                                 <Button size='small'>
//                                                     Download
//                                                 </Button>
//                                             </a>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className='text-gray-500'>
//                                 {paymentStatus === 'Pending'
//                                     ? 'Payment proof not uploaded yet.'
//                                     : `Payment status: ${paymentStatus}`}
//                             </div>
//                         )}
//                     </Card>
//                 </div>

//                 <div className="col-md-4 mb20">
//                     <Card
//                         title="Pickup Schedule"
//                         extra={(
//                             <div className={travelPlans.length > 0 ? "text-success" : "text-secondary"}>
//                                 {travelPlans.length > 0 ? `${travelPlans.length} ${travelPlans.length === 1 ? 'Entry' : 'Entries'}` : "Pending"}
//                             </div>
//                         )}
//                     >
//                         <Spin spinning={travelLoading}>
//                             {travelPlans.length > 0 ? (
//                                 <div className="flex flex-col gap-3">
//                                     {travelPlans.map((plan) => (
//                                         <div key={plan.id} className="flex items-start justify-between gap-4 border border-gray-200 rounded-md p-3">
//                                             <div className="flex-1">
//                                                 <div className="font-semibold text-sm">{plan.title}</div>
//                                                 {plan.created && (
//                                                     <div className="text-black/50 text-[11px] pt-[2px]">
//                                                         Uploaded on {util.getDate(plan.created, 'DD MMM YYYY @ hh:mm A')}
//                                                     </div>
//                                                 )}
//                                                 {plan.content && (
//                                                     <div
//                                                         className="text-black/60 text-[12px] pt-2"
//                                                         dangerouslySetInnerHTML={{ __html: plan.content }}
//                                                     />
//                                                 )}
//                                             </div>
//                                             <div className="flex flex-col gap-2">
//                                                 {plan.url && (
//                                                     <a href={plan.url} target="_blank" rel="noreferrer">
//                                                         <Button size="small" type="primary" ghost>
//                                                             View
//                                                         </Button>
//                                                     </a>
//                                                 )}
//                                                 {plan.url && (
//                                                     <a
//                                                         href={plan.url}
//                                                         target="_blank"
//                                                         rel="noreferrer"
//                                                         download={plan.title.replace(/\s+/g, '_') + '.pdf'}
//                                                     >
//                                                         <Button size="small">Download</Button>
//                                                     </a>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-gray-500">Pickup schedule not uploaded yet.</div>
//                             )}
//                         </Spin>
//                     </Card>
//                 </div>
//                 {/* Applied courses */}
//                 {!applied || applied.length === 0 ? (
//                     <Card title="Applied Courses" className="w-full shadow-sm">
//                         <div className="p-8 text-center text-gray-500 text-base">
//                             You haven't applied to any courses yet.
//                         </div>
//                     </Card>
//                 ) : (
//                     <Card
//                         title={<span className="text-xl font-semibold text-gray-800">Applied Courses</span>}
//                         extra={
//                             <span className="text-sm text-gray-500">
//                                 Total: <strong>{applied.length}</strong>
//                             </span>
//                         }
//                         className="w-full shadow-md"
//                         bodyStyle={{ padding: 0 }}
//                     >
//                         <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
//                             <table className="min-w-full text-sm text-left">
//                                 <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wide">
//                                     <tr>
//                                         <th className="px-6 py-3">Institute</th>
//                                         <th className="px-6 py-3">Specialization</th>
//                                         <th className="px-6 py-3">Applied On</th>
//                                         <th className="px-6 py-3">Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {applied.map((app) => (
//                                         <tr
//                                             key={app.scf_id}
//                                             className="hover:bg-gray-50 transition-all duration-150 ease-in-out"
//                                         >
//                                             <td className="px-6 py-4">
//                                                 <div className="font-medium text-gray-800">{app.inst_name}</div>
//                                                 <div className="text-xs text-gray-500">
//                                                     {app.inst_city}, {app.inst_state}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <div className="text-gray-700 font-semibold">{app.specialization}</div>
//                                             </td>
//                                             <td className="px-6 py-4 text-gray-600">
//                                                 {util.getDate(app.applied_on, "DD MMM YYYY")}
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <AppStatusTag status={app.ins_status} />
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </Card>
//                 )}


//             </div>
//         </div>
//     )
// }

// const AppStatusTag = ({ status }) => {
//     const colors = { Pending: '#FFBF00', Accepted: '#26C281', Approved: '#26C281', Rejected: '#ed6b75' };
//     return (
//         <div
//             className="uppercase text-[11px] px-2 py-[2px] rounded-lg text-center"
//             style={{ color: colors[status], border: `1px solid ${colors[status]}` }}
//         >
//             {status}
//         </div>
//     );
// };


/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import StudentService from "../../services/StudentService";
import ClientService from "../../services/ClientService";
import InstituteService from "../../services/InstituteService";
import util from '../../utils/util';
import { useChoiceFilling } from '../../contexts/ChoiceFillingContext';
import {
    message,
    Steps,
    Button,
    Card,
    Progress,
    Alert,
    Badge,
    Spin,
    Dropdown,
    Modal
} from 'antd';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { confirm } = Modal;

const { Step } = Steps;
//const $=window.$;

const paymentStatusColor = {
    Pending: 'orange',
    Uploaded: 'purple',
    Acknowledged: 'green',
    Rejected: 'red',
};

export default function StudentDash() {
    const navigate = useNavigate();
    const { started: cfStarted } = useChoiceFilling();
    const [stuDtl, setStuDtl] = useState({});
    const [applied, setApplied] = useState([]);
    const [travelPlans, setTravelPlans] = useState([]);
    const [travelLoading, setTravelLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [letterDetails, setLetterDetails] = useState(null);
    const stuStatusItems = [
        { label: <div className="cursor-pointer">Accept</div>, key: 'Accepted' },
        { label: <div className="cursor-pointer">Reject</div>, key: 'Rejected' },
    ];

    const fetchTravelPlan = async (scfIdParam) => {
        try {
            setTravelLoading(true);
            if (!scfIdParam) {
                setTravelPlans([]);
                return;
            }
            const res = await InstituteService.getPickupDetails(scfIdParam);
            const data = res?.data?.data;
            const letters = data?.letters;
            
            if (letters && (letters.pickup || letters.pickup_fileid)) {
                const pickupItem = {
                    id: letters.pickup_fileid || 'pickup-text',
                    title: "Pickup Schedule",
                    viewUrl: letters.pickup_fileid ? `/student/letters/${scfIdParam}/pickup/view` : "",
                    downloadUrl: letters.pickup_fileid ? `/student/letters/${scfIdParam}/pickup/download` : "",
                    content: letters.pickup || "",
                    created: letters.updated || letters.created || null,
                    scf_id: scfIdParam
                };
                setTravelPlans([pickupItem]);
            } else {
                setTravelPlans([]);
            }
        } catch (error) {
            console.error("Error fetching pickup details:", error);
            setTravelPlans([]);
        } finally {
            setTravelLoading(false);
        }
    };
    const handleStudentStatusClick = ({ key }, scf_id) => {
        const fn = async () => {
            setLoading(true)
            const res = await StudentService.setSCFStudentStatus({
                scf_id,
                status: key,
            })
            if (res.success) {
                message.success(res.message || "Success")
                setApplied((prev) =>
                    prev.map((r) =>
                        r.scf_id === scf_id
                            ? {
                                ...r,
                                stu_status: key,
                                stu_status_dt: moment().format("YYYY-MM-DD HH:mm:ss"),
                            }
                            : r
                    )
                )
            } else {
                message.error(res.message || "Failed")
            }
            setLoading(false)
        };

        confirm({
            title: `Are you sure to mark as ${key}?`,
            icon: <ExclamationCircleOutlined />,
            content: "",
            okText: "Yes",
            cancelText: "No",
            onOk: fn,
        })
    }

    const getStuDtl = () => {
        util.showLoader();
        StudentService.detail().then((res) => {
            const detail = res.data.result || {};
            setStuDtl(detail);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        });
    }

    const appliedCourses = () => {
        StudentService.appliedCourses().then(({ data }) => {
            setApplied(data.result.data);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
        })
    }
    console.log("applied:: ", applied)
    console.log("acceptedCourse:: ", applied.find((row) => row.stu_status === 'Accepted'))

    const stepCompleted = () => {
        if (stuDtl.course_choice_date) {
            return 4;
        } else if (stuDtl.background_info_date) {
            return 3;
        } else if (stuDtl.edu_info_date) {
            return 2;
        } else if (stuDtl.basic_info_date) {
            return 1;
        } else {
            return 0;
        }
    }

    useEffect(() => {
        getStuDtl();
        appliedCourses();
    }, []);

    useEffect(() => {
        const acceptedCourse = applied.find((row) => row.stu_status === 'Accepted');
        if (acceptedCourse?.scf_id) {
            fetchTravelPlan(acceptedCourse.scf_id);
        } else {
            setTravelPlans([]);
        }
    }, [applied]);

    // Fetch letter details when there's an accepted course
    useEffect(() => {
        const acceptedCourse = applied.find((row) => row.stu_status === 'Accepted');
        if (acceptedCourse?.scf_id) {
            InstituteService.getLetterDetails(acceptedCourse.scf_id)
                .then((res) => {
                    const detail = res?.data?.data || null;
                    setLetterDetails(detail);
                })
                .catch((err) => {
                    console.error('Error fetching letter details:', err);
                    setLetterDetails(null);
                });
        } else {
            setLetterDetails(null);
        }
    }, [applied]);

    const offers = applied.filter(a => a.offer_file_url);
    const paymentProofs = applied.filter((row) => row.payment_slip_file_url);
    const acceptedCourse = applied.find((row) => row.stu_status === 'Accepted');
    const paymentSummary = paymentProofs[0] || acceptedCourse || null;
    const paymentStatus = paymentSummary?.payment_status || 'Pending';
    const hasAcceptedCourse = applied.some((r) => r.stu_status === "Accepted")

    const isEmailVerified = Number(stuDtl.email_verified) === 1;
    const isMobileVerified = Number(stuDtl.mobile_verified) === 1;

    const nodeOrigin = (() => {
        try {
            return new URL(util.apiUrlNode).origin;
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
            // If it's a relative path, prepend the Node origin
            if (nodeOrigin && (rawUrl.startsWith('/uploads/') || rawUrl.startsWith('uploads/'))) {
                const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
                return `${nodeOrigin}${path}`;
            }
            return rawUrl;
        }
    };

    //const wh=$(window).height();
    let cardh = 530; //wh-210;

    return (
        <div className="">
            <div className="row">
                <div className="col-md-6 mb20">
                    <Card title="Application Journey" bodyStyle={{ padding: 0 }}>
                        <div className="ant-steps-green cscroll p20" style={{ height: cardh }}>
                            <Steps direction="vertical" current={stepCompleted() + 1} status="wait">
                                <Step
                                    title="SIS Registration"
                                    subTitle={(isEmailVerified ? 'Completed' : 'Registered') + ' on ' + util.getDate(stuDtl.created, 'DD MMM YYYY @ hh:mm A')}
                                    description={
                                        <div className='pb-8 text-[12px]'>
                                            <div className="pb-1">
                                                {isEmailVerified ? (
                                                    <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Email verified</div>
                                                ) : (
                                                    <div className="font-red"><i className="fa fa-times-circle"></i> Email not verified</div>
                                                )}
                                            </div>
                                            <div>
                                                {isMobileVerified ? (
                                                    <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Mobile verified</div>
                                                ) : (
                                                    <div className="font-red"><i className="fa fa-times-circle"></i> Mobile not verified</div>
                                                )}
                                            </div>
                                        </div>
                                    }
                                />

                                <Step
                                    title="Basic Information"
                                    subTitle={stuDtl.basic_info_date ? ('Completed on ' + util.getDate(stuDtl.basic_info_date, 'DD MMM YYYY @ hh:mm A')) : (
                                        <span>
                                            <span className="font-red">Pending</span>
                                            <span className="pl5">
                                                <Button size="small" type="link" onClick={() => { navigate("/student-application/1") }}>Complete Now</Button>
                                            </span>
                                        </span>
                                    )}
                                    description={
                                        <div style={{ paddingBottom: "30px" }}>
                                            {stuDtl.basic_info_date &&
                                                <div className="fs12">
                                                    {isMobileVerified ? (
                                                        <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Mobile number (Whatsapp) verified</div>
                                                    ) : (
                                                        <div className="font-red"><i className="fa fa-times-circle"></i> Mobile number (Whatsapp) not verified</div>
                                                    )}
                                                </div>}
                                        </div>
                                    }
                                />

                                <Step
                                    title="Educational Information"
                                    subTitle={stuDtl.edu_info_date ? ('Completed on ' + util.getDate(stuDtl.edu_info_date, 'DD MMM YYYY @ hh:mm A')) : (
                                        <span>
                                            <span className="font-red">Pending</span>
                                            {stuDtl.basic_info_date &&
                                                <span className="pl5">
                                                    <Button size="small" type="link" onClick={() => { navigate("/student-application/2") }}>Complete Now</Button>
                                                </span>}
                                        </span>
                                    )}
                                    description={
                                        <div style={{ paddingBottom: "30px" }}>
                                            {stuDtl.edu_info_date ? (
                                                <div className="fs12">
                                                    {stuDtl.doc_uploaded_on ? (
                                                        <>
                                                            <div><i className="fa fa-check-circle font-green-jungle"></i> Document uploaded on {util.getDate(stuDtl.doc_uploaded_on, 'DD MMM YYYY @ hh:mm A')}</div>
                                                            {!stuDtl.doc_verified_on ? (
                                                                <div className="font-red"><i className="fa fa-times-circle"></i> Document verification pending</div>
                                                            ) : (
                                                                <div className="font-green-jungle"><i className="fa fa-check-circle"></i> Document verified on {util.getDate(stuDtl.doc_verified_on, 'DD MMM YYYY @ hh:mm A')}</div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="font-red"><i className="fa fa-times-circle"></i> Document upload pending</div>
                                                    )}
                                                </div>
                                            ) : ""}
                                        </div>
                                    }
                                />

                                <Step
                                    title="Background Information"
                                    subTitle={stuDtl.background_info_date ? ('Completed on ' + util.getDate(stuDtl.background_info_date, 'DD MMM YYYY @ hh:mm A')) : (
                                        <span>
                                            <span className="font-red">Pending</span>
                                            {stuDtl.edu_info_date &&
                                                <span className="pl5">
                                                    <Button size="small" type="link" onClick={() => { navigate("/student-application/3") }}>Complete Now</Button>
                                                </span>}
                                        </span>
                                    )}
                                    description={<div style={{ paddingBottom: "30px" }}></div>}
                                />

                                <Step
                                    title="Choice Filling"
                                    subTitle={stuDtl.course_choice_date ? ('Completed on ' + util.getDate(stuDtl.course_choice_date, 'DD MMM YYYY @ hh:mm A')) : (
                                        <span>
                                            <span className="font-red">Pending</span>
                                            {stuDtl.background_info_date &&
                                                <span className="pl5">
                                                    <Button size="small" type="link" onClick={() => { navigate("/student-application/4") }}>Complete Now</Button>
                                                </span>}
                                        </span>
                                    )}
                                    description={
                                        <div style={{ paddingBottom: "30px" }}>
                                            {cfStarted === 'N' && !stuDtl.course_choice_date &&
                                                <div className="fs12">
                                                    <div className="font-red"><i className="fa fa-times-circle"></i> Not started yet</div>
                                                </div>
                                            }
                                        </div>
                                    }
                                />

                                {/* <Step 
                                    title="Result Declaration" 
                                    subTitle="Pending"
                                    description={
                                        <div style={{paddingBottom:"30px"}}>
                                            <div className="fs12">
                                                <div className="font-red"><i className="fa fa-times-circle"></i> Not declared Yet</div>
                                            </div>
                                        </div>
                                    }
                                />

                                <Step 
                                    title="Offer Letter" 
                                    subTitle="Pending"
                                    description={
                                        <div style={{paddingBottom:"30px"}}>
                                            <div className="fs12">
                                                <div className="font-red"><i className="fa fa-times-circle"></i> Not alloted Yet</div>
                                            </div>
                                        </div>
                                    }
                                />

                                <Step 
                                    title="Admission Proof" 
                                    subTitle="Pending"
                                    description={
                                        <div style={{paddingBottom:"30px"}}>
                                            <div className="fs12">
                                                <div className="font-red"><i className="fa fa-times-circle"></i> Not given Yet</div>
                                            </div>
                                        </div>
                                    }
                                />

                                <Step 
                                    title="Travel Plan" 
                                    subTitle="Pending"
                                    description={
                                        <div style={{paddingBottom:"30px"}}>
                                            <div className="fs12">
                                                <div className="font-red"><i className="fa fa-times-circle"></i> Not uploaded Yet</div>
                                            </div>
                                        </div>
                                    }
                                /> */}
                            </Steps>
                        </div>
                    </Card>
                </div>
                <div className="col-md-6 mb20">
                    <Card title="Applied Courses" bodyStyle={{ padding: 0 }}>
                        <div className="cscroll p20" style={{ height: cardh }}>
                            {applied.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {applied.map((course, index) => (
                                        <div
                                            key={course.scf_id || index}
                                            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                    {(course.inst_name || 'I').charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="font-bold text-gray-900 truncate pr-2 flex-1" title={course.inst_name}>
                                                            {course.inst_name}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col items-end gap-0.5">
                                                                <span className="text-[8px] uppercase font-bold text-gray-400 tracking-wider">Institute</span>
                                                                <AppStatusTag status={course.ins_status} />
                                                            </div>
                                                            <div className="flex flex-col items-end gap-0.5 border-l border-gray-100 pl-3">
                                                                <span className="text-[8px] uppercase font-bold text-gray-400 tracking-wider">Student</span>
                                                                {course.ins_status === "Accepted" && course.stu_status === "Pending" && !hasAcceptedCourse ? (
                                                                    <Dropdown
                                                                        menu={{ items: stuStatusItems, onClick: (e) => handleStudentStatusClick(e, course.scf_id) }}
                                                                        trigger={["click"]}
                                                                    >
                                                                        <div className="bg-amber-600 text-white px-2.5 py-0.5 rounded-full cursor-pointer flex items-center gap-1.5 text-[10px] font-bold shadow-sm hover:bg-amber-700 transition-all uppercase tracking-wider">
                                                                            Decide <DownOutlined className="text-[8px]" />
                                                                        </div>
                                                                    </Dropdown>
                                                                ) : (
                                                                    <AppStatusTag status={course.stu_status || 'Pending'} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <span className="font-medium">{course.course}</span>
                                                            {course.specialization && course.specialization !== course.course && (
                                                                <>
                                                                    <span className="mx-2 text-gray-300">|</span>
                                                                    <span className="text-gray-500 italic">{course.specialization}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center mt-3 pt-3 border-t border-gray-50 text-[11px] text-gray-400 font-medium tracking-tight">
                                                            <div className="flex items-center gap-1">
                                                                <i className="fa fa-calendar-alt opacity-70"></i>
                                                                <span>
                                                                    {(() => {
                                                                        const displayDate = (course.applied_on && course.applied_on !== '0000-00-00 00:00:00')
                                                                            ? course.applied_on
                                                                            : course.created;
                                                                        const date = util.getDate(displayDate, 'DD MMM YYYY');
                                                                        return (date && date !== '-') ? `APPLIED ON ${date}` : 'APPLICATION PENDING';
                                                                    })()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    No courses applied yet
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="row">
                {/* <div className="col-md-3 mb20">
                    <Card title="Result Declaration" extra={(<div className="text-secondary">Pending</div>)}>
                        <div className="font-red">Not declared yet</div>
                    </Card>
                </div> */}
                <div className="col-md-4 mb20">
                    <Card
                        title="Offer Letter"
                        extra={(<div className={offers.length > 0 ? "text-success" : "text-secondary"}>{offers.length > 0 ? 'Received' : 'Pending'}</div>)}
                    >
                        {offers.length > 0 ? (
                            <div className='flex flex-col gap-3'>
                                {offers.map(row => (
                                    <div key={row.scf_id} className='flex items-center justify-between'>
                                        <div>
                                            {row.inst_name}
                                            <div className='text-black/50 text-[11px] pt-[2px]'>{row.course}</div>
                                        </div>
                                        <div>
                                            <a href={resolveUploadsUrl(row.offer_file_url)} target='_blank' rel="noreferrer">
                                                <Button size='small' type='primary'>Download</Button>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="font-red">Not alloted yet</div>
                        )}

                    </Card>
                </div>
                <div className="col-md-4 mb20">
                    <Card
                        title="Payment Proof"
                        extra={(
                            <div style={{ color: paymentStatusColor[paymentStatus] || '#868686' }}>
                                {paymentStatus}
                            </div>
                        )}
                    >
                        {paymentProofs.length > 0 ? (
                            <div className='flex flex-col gap-3'>
                                {paymentProofs.map((row) => (
                                    <div key={row.scf_id} className='flex flex-col md:flex-row md:items-start md:justify-between gap-3'>
                                        <div className='min-w-0 flex-1'>
                                            <div className='font-semibold'>{row.inst_name}</div>
                                            <div className='text-black/50 text-[11px] pt-[2px]'>{row.specialization || row.course}</div>
                                            <div className='text-black/50 text-[11px] pt-[6px]'>
                                                Status:&nbsp;
                                                <span style={{ color: paymentStatusColor[row.payment_status] || '#555' }}>
                                                    {row.payment_status || 'Pending'}
                                                </span>
                                            </div>
                                            {!!row.payment_comment && (
                                                <div className='text-black/60 text-[11px] pt-[4px]'>
                                                    Remarks: {row.payment_comment}
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex flex-wrap md:flex-nowrap gap-2 shrink-0'>
                                            <a
                                                href={resolveUploadsUrl(row.payment_slip_file_url)}
                                                target='_blank'
                                                rel='noreferrer'
                                                download={`${row.inst_name || 'payment'}_PaymentSlip.pdf`}
                                            >
                                                <Button size='small' type='primary'>
                                                    Download
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-gray-500'>
                                {paymentStatus === 'Pending'
                                    ? (
                                        <div className='flex flex-col md:flex-row justify-between'>
                                            <span>Payment proof not uploaded yet.</span>
                                            <Link to="/student-payment-proof">
                                                <Button size="small" type="primary">
                                                    Upload Now
                                                </Button>
                                            </Link>
                                        </div>
                                    )
                                    : `Payment status: ${paymentStatus}`}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="col-md-4 mb20">
                    <Card
                        title="Pickup Schedule"
                        extra={
                            <div className={travelPlans.length > 0 ? "text-success" : "text-secondary"}>
                                {travelPlans.length > 0
                                    ? `${travelPlans.length} ${travelPlans.length === 1 ? "Entry" : "Entries"}`
                                    : "Pending"}
                            </div>
                        }
                    >
                        <Spin spinning={travelLoading}>
                            {travelPlans.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {travelPlans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className="flex items-start justify-between gap-3 border border-gray-200 rounded-md p-3"
                                        >
                                            {/* LEFT CONTENT */}
                                            <div className="flex-1 min-w-0">
                                                {/* Title */}
                                                <div className="font-semibold text-sm truncate">
                                                    {plan.title}
                                                </div>

                                                {/* Date */}
                                                {plan.created && (
                                                    <div className="text-black/50 text-[11px] pt-1">
                                                        Uploaded on {util.getDate(plan.created, "DD MMM YYYY @ hh:mm A")}
                                                    </div>
                                                )}

                                                {/* Description */}
                                                {plan.content && (
                                                    <div
                                                        className="text-black/60 text-[12px] pt-2 line-clamp-2"
                                                        dangerouslySetInnerHTML={{ __html: plan.content }}
                                                    />
                                                )}
                                            </div>

                                            {/* RIGHT BUTTONS */}
                                            {plan.downloadUrl && (
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <a
                                                        href={plan.downloadUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download={`${plan.title.replace(/\s+/g, "_")}.pdf`}
                                                    >
                                                        <Button size="small" type="primary" block>
                                                            Download
                                                        </Button>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500">Pickup schedule not uploaded yet.</div>
                            )}
                        </Spin>
                    </Card>
                </div>

            </div>

            <div className="row">
                <div className="col-md-6 mb20">
                    <Card title="Visa Letter">
                        <div style={{ minHeight: '100px' }}>
                            {letterDetails?.letters?.visa_letter && letterDetails?.letters?.visa_letter_fileid ? (
                                <div>
                                    <div className="mb-3 text-gray-700">
                                        <div className="font-semibold">{letterDetails.institute_name}</div>
                                        <div className="text-sm text-gray-600">{letterDetails.specialization_name}</div>
                                    </div>
                                    <Button 
                                        type="primary" 
                                        icon={<i className="fa fa-download mr-2"></i>}
                                        onClick={async () => {
                                            try {
                                                const res = await InstituteService.downloadVisaLetterFile(letterDetails.scf_id);
                                                const blob = new Blob([res.data], { type: 'application/pdf' });
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = `${letterDetails.student_name}_visa_letter.pdf`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                window.URL.revokeObjectURL(url);
                                            } catch (error) {
                                                message.error('Failed to download visa letter');
                                            }
                                        }}
                                    >
                                        Download Visa Letter
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    <i className="fa fa-file-text text-4xl text-gray-300 mb-3"></i>
                                    <div>Visa letter not available yet</div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
                <div className="col-md-6 mb20">
                    <Card title="Admission Letter">
                        <div style={{ minHeight: '100px' }}>
                            {letterDetails?.letters?.admission_letter && letterDetails?.letters?.admission_letter_fileid ? (
                                <div>
                                    <div className="mb-3 text-gray-700">
                                        <div className="font-semibold">{letterDetails.institute_name}</div>
                                        <div className="text-sm text-gray-600">{letterDetails.specialization_name}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* <Button 
                                            type="primary" 
                                            icon={<i className="fa fa-eye mr-2"></i>}
                                            onClick={async () => {
                                                try {
                                                    const res = await InstituteService.viewAdmissionLetterFile(letterDetails.scf_id);
                                                    const blob = new Blob([res.data], { type: 'application/pdf' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    window.open(url, '_blank');
                                                    // Clean up after 5 seconds
                                                    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
                                                } catch (error) {
                                                    console.error('Failed to view admission letter:', error);
                                                    message.error('Failed to view admission letter');
                                                }
                                            }}
                                        >
                                            View Admission Letter
                                        </Button> */}
                                        <Button 
                                            type="primary" 
                                            icon={<i className="fa fa-download mr-2"></i>}
                                            onClick={async () => {
                                                try {
                                                    const res = await InstituteService.downloadAdmissionLetterFile(letterDetails.scf_id);
                                                    const blob = new Blob([res.data], { type: 'application/pdf' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = `${letterDetails.student_name}_admission_letter.pdf`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(url);
                                                } catch (error) {
                                                    message.error('Failed to download admission letter');
                                                }
                                            }}
                                        >
                                            Download Admission Letter
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    <i className="fa fa-file-text text-4xl text-gray-300 mb-3"></i>
                                    <div>Admission letter not available yet</div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    )
}

const AppStatusTag = ({ status }) => {
    const statusConfig = {
        Pending: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
        Accepted: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        Approved: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        Rejected: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
    };

    const config = statusConfig[status] || { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };

    return (
        <div
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shadow-sm flex-shrink-0 ${config.bg} ${config.color} ${config.border}`}
        >
            {status}
        </div>
    );
};
