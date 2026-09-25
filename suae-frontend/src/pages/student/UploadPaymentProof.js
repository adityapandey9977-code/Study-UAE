// /* eslint-disable no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Modal, message, Spin, Card, Button, Input, Pagination } from 'antd';
// import StudentService from '../../services/StudentService';
// import FileService from '../../services/FileService';
// import util from '../../utils/util';
// import StuAcceptedCourseView from './StuAcceptedCourseView';
// import InstituteService from '../../services/InstituteService';
// import DropdownButton from 'antd/lib/dropdown/dropdown-button';
// import { DownOutlined } from '@ant-design/icons';
// import PaymentStatusDropdown from './PaymentStatusDropdown';

// const paymentStatusColor = {
//     Pending: 'orange',
//     Uploaded: 'purple',
//     Acknowledged: 'green',
//     Rejected: 'red',
// };

// export default function UploadPaymentProof() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [applied, setApplied] = useState(null);
//     const [isPaymentSlipOpen, setPaymentSlipOpen] = useState(false);
//     const [reloadFlag, setReloadFlag] = useState(0);

//     // For institute
//     const [studentList, setStudentList] = useState([]);
//     const [filteredList, setFilteredList] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize] = useState(5);
//     const isInstitute = util.isInstitute() === 1;

//     const uploadPaymentSlip = async (e) => {
//         if (util.checkPdf(e.target, 5)) {
//             setLoading(true);
//             try {
//                 const file = e.target.files[0];
//                 const uploadRes = await FileService.upload(file);
//                 const res = await StudentService.setSCFUploadPaymentSlip({
//                     scf_id: applied?.scf_id,
//                     payment_slip_file_id: uploadRes.data.file_id,
//                 });
//                 if (res.success) {
//                     message.success(res.message || 'Payment slip uploaded successfully');
//                     setReloadFlag(reloadFlag + 1);
//                 } else {
//                     message.error(res.message || 'Upload failed');
//                 }
//             } catch (err) {
//                 message.error('Upload error. Please try again.');
//             } finally {
//                 e.target.value = '';
//                 setLoading(false);
//             }
//         }
//     };

//     // 🔹 Fetch student payment slips (institute view)
//     useEffect(() => {
//         if (!isInstitute) return;

//         setLoading(true);
//         InstituteService.paymentSlips()
//             .then((res) => {
//                 console.log('Payment slips response:', res);

//                 // ✅ Safely extract and validate data
//                 const data = res?.data?.result || res?.data || [];

//                 if (Array.isArray(data)) {
//                     setStudentList(data);
//                     setFilteredList(data);
//                 } else {
//                     console.error('Expected array, but got:', data);
//                     setStudentList([]);
//                     setFilteredList([]);
//                     message.warning('No valid data received');
//                 }
//             })
//             .catch((err) => {
//                 console.error('Failed to load payment slips:', err);
//                 message.error('Could not load student list');
//                 setStudentList([]);
//                 setFilteredList([]);
//             })
//             .finally(() => {
//                 setLoading(false);
//             });
//     }, [isInstitute, reloadFlag]);

//     // 🔹 Recalculate paginated data whenever currentPage or filteredList changes
//     const paginatedData = React.useMemo(() => {
//         return filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);
//     }, [filteredList, currentPage, pageSize]);

//     // 🔹 Handle search filters
//     const handleSearch = (value, field) => {
//         const filtered = studentList.filter((s) =>
//             s[field]?.toString().toLowerCase().includes(value.toLowerCase())
//         );
//         setFilteredList(filtered);
//         setCurrentPage(1); // Reset to first page
//     };

//     return (
//         <div className="page-content">
//             {/* =============== STUDENT VIEW =============== */}
//             {!isInstitute && (
//                 <>
//                     <div className="page-head uc d-flex">
//                         <div className="my-auto">
//                             <h2>Upload Payment Proof</h2>
//                         </div>
//                         <div className="my-auto ml-auto">
//                             <div className="d-flex align-items-center">
//                                 <div className="fs13 pr15">
//                                     Reg. No: <span className="bold600">{util.getRegno()}</span>
//                                 </div>
//                                 <div className="pill-btn sm" onClick={() => navigate('/dashboard')}>
//                                     Go To Dashboard
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="page-pad">
//                         <div className="min-h-[100px] max-w-[800px] mx-auto">
//                             <div className="mb-6">
//                                 <Card
//                                     size="small"
//                                     title="Payment Proof"
//                                     extra={
//                                         <div className="flex items-center gap-2">
//                                             <div className="text-black/50">Status:</div>
//                                             <div style={{ color: paymentStatusColor[applied?.payment_status] }}>
//                                                 {applied?.payment_status || 'Pending'}
//                                             </div>
//                                         </div>
//                                     }
//                                 >
//                                     <Spin spinning={loading}>
//                                         {applied?.stu_status === 'Accepted' ? (
//                                             <>
//                                                 <div className="flex items-center justify-between">
//                                                     {applied?.payment_status !== 'Acknowledged' && (
//                                                         <label className="ant-btn">
//                                                             <input
//                                                                 type="file"
//                                                                 className="d-none"
//                                                                 accept="image/*, application/pdf"
//                                                                 onChange={uploadPaymentSlip}
//                                                             />
//                                                             <i className="fa fa-upload"></i> Upload Payment Slip
//                                                         </label>
//                                                     )}
//                                                     {applied?.payment_status !== 'Pending' && (
//                                                         <Button type="primary" onClick={() => setPaymentSlipOpen(true)}>
//                                                             View
//                                                         </Button>
//                                                     )}
//                                                 </div>
//                                                 {!!applied?.payment_comment && (
//                                                     <div className="mt-2">
//                                                         <div>Remarks:</div>
//                                                         <div>{applied.payment_comment}</div>
//                                                     </div>
//                                                 )}
//                                             </>
//                                         ) : (
//                                             <div className="text-gray-500">You must accept an offer to upload payment proof.</div>
//                                         )}
//                                     </Spin>
//                                 </Card>
//                             </div>
//                             <StuAcceptedCourseView reload_flag={reloadFlag} callback={setApplied} />
//                         </div>
//                     </div>

//                     {/* View Modal */}
//                     {isPaymentSlipOpen && applied?.payment_slip_file_url && (
//                         <Modal
//                             title={
//                                 <div className="flex items-center gap-4">
//                                     <div>Payment Proof</div>
//                                     <div>|</div>
//                                     <div className="flex items-center gap-2">
//                                         <div className="text-black/50">Status:</div>
//                                         <div style={{ color: paymentStatusColor[applied.payment_status] }}>
//                                             {applied.payment_status}
//                                         </div>
//                                     </div>
//                                 </div>
//                             }
//                             open
//                             onCancel={() => setPaymentSlipOpen(false)}
//                             destroyOnClose
//                             maskClosable={false}
//                             width="70%"
//                             style={{ top: 20 }}
//                             bodyStyle={{ height: window.innerHeight - 100, padding: 0 }}
//                             footer={null}
//                         >
//                             <iframe
//                                 src={applied.payment_slip_file_url}
//                                 title="Payment Slip"
//                                 style={{ height: '100%', width: '100%', border: 'none' }}
//                             />
//                         </Modal>
//                     )}
//                 </>
//             )}

//             {/* =============== INSTITUTE VIEW =============== */}
//             {isInstitute && (
//                 <div className="">
//                     <div className="page-head uc d-flex">
//                         <div className="my-auto">
//                             <h2>Students Who Uploaded Payment Slips</h2>
//                         </div>
//                     </div>
//                     <div className="min-h-[100px] max-w-[2000px] mx-auto">
//                         <Card size="large" title="" className="">
//                             {/* Search Filters */}
//                             <div className="flex gap-4 mb-4 flex-wrap">
//                                 <div className="flex flex-col">
//                                     <label className="mb-1 text-sm font-medium">Reg. No.</label>
//                                     <Input
//                                         placeholder="Search by Reg. No."
//                                         onChange={(e) => handleSearch(e.target.value, 'student_regno')}
//                                         allowClear
//                                         style={{ width: 200 }}
//                                     />
//                                 </div>

//                                 <div className="flex flex-col">
//                                     <label className="mb-1 text-sm font-medium">Name</label>
//                                     <Input
//                                         placeholder="Search by Name"
//                                         onChange={(e) => handleSearch(e.target.value, 'student_name')}
//                                         allowClear
//                                         style={{ width: 200 }}
//                                     />
//                                 </div>
//                             </div>


//                             <Spin spinning={loading}>
//                                 {paginatedData.length > 0 ? (
//                                     <>
//                                         <div className="text-gray-600 text-sm mb-2">
//                                             Showing {(currentPage - 1) * pageSize + 1}–
//                                             {Math.min(currentPage * pageSize, filteredList.length)} of {filteredList.length} records
//                                         </div>

//                                         <table className="w-full border border-gray-200 text-sm">
//                                             <thead className="bg-gray-50">
//                                                 <tr>
//                                                     <th className="p-2 border">S.No</th>
//                                                     <th className="p-2 border">Reg. No</th>
//                                                     <th className="p-2 border">Name</th>
//                                                     <th className="p-2 border">Course</th>
//                                                     <th className="p-2 border">Actions</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {paginatedData.map((stu, index) => (
//                                                     <tr key={stu.scf_id || index}>
//                                                         <td className="p-2 border text-center">
//                                                             {(currentPage - 1) * pageSize + index + 1}
//                                                         </td>
//                                                         <td className="p-2 border">{stu.student_regno}</td>
//                                                         <td className="p-2 border">{stu.student_name}</td>
//                                                         <td className="p-2 border">{stu.specialization || 'N/A'}</td>
//                                                         <td className="p-2 border text-center">
//                                                             <div className="flex gap-2 justify-center">
//                                                                 <Button
//                                                                     type="primary"
//                                                                     size="small"
//                                                                     onClick={() => {
//                                                                         setSelectedStudent(stu);
//                                                                         setPaymentSlipOpen(true);
//                                                                     }}
//                                                                 >
//                                                                     View
//                                                                 </Button>
//                                                                 <Button
//                                                                     size="small"
//                                                                     onClick={() => {
//                                                                         if (stu.file_url) {
//                                                                             const link = document.createElement('a');
//                                                                             link.href = stu.file_url;
//                                                                             link.target = '_blank';
//                                                                             link.download = `${stu.student_name}_PaymentSlip.pdf`;
//                                                                             link.click();
//                                                                             message.success('Download started');
//                                                                         } else {
//                                                                             message.error('No file available');
//                                                                         }
//                                                                     }}
//                                                                 >
//                                                                     Download
//                                                                 </Button>
//                                                                 <PaymentStatusDropdown
//                                                                     status={stu.payment_status}
//                                                                     scf_id={stu.scf_id}
//                                                                     student_id={stu.student_id} 
//                                                                     onChange={(newStatus) => {
//                                                                         // refresh list after status update
//                                                                         setReloadFlag((prev) => prev + 1);
//                                                                     }}
//                                                                 />


//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>

//                                         {/* Pagination */}
//                                         <div className="mt-4 flex justify-end">
//                                             <Pagination
//                                                 current={currentPage}
//                                                 pageSize={pageSize}
//                                                 total={filteredList.length}
//                                                 onChange={(page) => setCurrentPage(page)}
//                                                 showSizeChanger={false}
//                                             />
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <div className="text-center py-8 text-gray-500">
//                                         No students have uploaded payment proofs yet.
//                                     </div>
//                                 )}
//                             </Spin>
//                         </Card>
//                     </div>

//                     {/* Modal: View Payment Slip */}
//                     {isPaymentSlipOpen && selectedStudent && (
//                         <Modal
//                             title={`Payment Proof - ${selectedStudent.student_name} (Reg: ${selectedStudent.student_regno})`}
//                             open
//                             onCancel={() => setPaymentSlipOpen(false)}
//                             destroyOnClose
//                             maskClosable={false}
//                             width="70%"
//                             style={{ top: 20 }}
//                             bodyStyle={{ height: window.innerHeight - 100, padding: 0 }}
//                             footer={null}
//                         >
//                             {selectedStudent.file_url ? (
//                                 <iframe
//                                     src={selectedStudent.file_url}
//                                     title="Payment Proof"
//                                     style={{ height: '100%', width: '100%', border: 'none' }}
//                                 />
//                             ) : (
//                                 <div className="flex items-center justify-center h-full bg-gray-50">
//                                     <div className="text-red-500">No file available</div>
//                                 </div>
//                             )}
//                         </Modal>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }


/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, message, Spin, Card, Button, Input, Pagination } from 'antd';
import StudentService from '../../services/StudentService';
import FileService from '../../services/FileService';
import util from '../../utils/util';
import StuAcceptedCourseView from './StuAcceptedCourseView';
import InstituteService from '../../services/InstituteService';
import DropdownButton from 'antd/lib/dropdown/dropdown-button';
import { DownOutlined } from '@ant-design/icons';
import PaymentStatusDropdown from './PaymentStatusDropdown';

const paymentStatusColor = {
    Pending: 'orange',
    Uploaded: 'purple',
    Acknowledged: 'green',
    Rejected: 'red',
};

export default function UploadPaymentProof() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [applied, setApplied] = useState(null);
    const [isPaymentSlipOpen, setPaymentSlipOpen] = useState(false);
    const [paymentSlipPreviewUrl, setPaymentSlipPreviewUrl] = useState(null);
    const [paymentSlipPreviewLoading, setPaymentSlipPreviewLoading] = useState(false);
    const [reloadFlag, setReloadFlag] = useState(0);

    // For institute
    const [studentList, setStudentList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const isInstitute = util.isInstitute() === 1;

    useEffect(() => {
        let active = true;

        const loadPreview = async () => {
            if (!isPaymentSlipOpen) return;
            
            // For students, use the direct file URL from PHP backend
            // For institutes, also use the direct file URL
            const fileUrl = isInstitute ? selectedStudent?.file_url : applied?.payment_slip_file_url;
            
            if (!fileUrl) {
                setPaymentSlipPreviewUrl(null);
                setPaymentSlipPreviewLoading(false);
                return;
            }

            setPaymentSlipPreviewLoading(true);
            
            // Use the direct file URL from PHP backend
            if (active) {
                setPaymentSlipPreviewUrl(fileUrl);
                setPaymentSlipPreviewLoading(false);
            }
        };

        loadPreview();
        return () => {
            active = false;
        };
    }, [isPaymentSlipOpen, isInstitute, selectedStudent?.file_url, applied?.payment_slip_file_url]);

    const handleClosePaymentSlip = () => {
        setPaymentSlipOpen(false);
        setPaymentSlipPreviewUrl(null);
        setPaymentSlipPreviewLoading(false);
    };

    const uploadPaymentSlip = async (e) => {
        if (util.checkImagePdf(e.target, 5)) {
            setLoading(true);
            try {
                const file = e.target.files[0];
                
                const uploadRes = await FileService.upload(file);
                
                // Extract file_id from the response
                const fileId = uploadRes?.data?.file_id || uploadRes?.data?.result?.file_id;
                if (!fileId) {
                    throw new Error('File upload failed - no file ID received');
                }
                
                // Use StudentService for student uploads (not InstituteService)
                const res = await StudentService.setSCFUploadPaymentSlip({
                    scf_id: applied?.scf_id,
                    payment_slip_file_id: fileId
                });
                
                if (res.success) {
                    message.success(res.message || 'Payment slip uploaded successfully');
                    setReloadFlag(reloadFlag + 1);
                } else {
                    message.error(res.message || 'Database update failed');
                }
            } catch (err) {
                const errorMessage = err?.response?.data?.message || err?.message || 'Upload error. Please try again.';
                message.error(errorMessage);
            } finally {
                e.target.value = '';
                setLoading(false);
            }
        }
    };

    // 🔹 Fetch student payment slips (institute view)
    useEffect(() => {
        if (!isInstitute) return;

        setLoading(true);
        InstituteService.paymentSlips()
            .then((res) => {
                console.log('Payment slips API response:', res);
                // ✅ Safely extract and validate data
                const data = res?.data?.data || res?.data || [];
                console.log('Extracted payment slips data:', data);

                if (Array.isArray(data)) {
                    setStudentList(data);
                    setFilteredList(data);
                    
                    if (data.length === 0) {
                        message.info('No payment slips found. Students may not have uploaded any yet.');
                    }
                } else {
                    setStudentList([]);
                    setFilteredList([]);
                    message.warning('Invalid data format received from server');
                }
            })
            .catch((err) => {
                console.error('Payment slips API error:', err);
                const errorMessage = err?.response?.data?.message || err?.message || 'Could not load payment slips';
                message.error(errorMessage);
                setStudentList([]);
                setFilteredList([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isInstitute, reloadFlag]);

    // 🔹 Recalculate paginated data whenever currentPage or filteredList changes
    const paginatedData = React.useMemo(() => {
        return filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [filteredList, currentPage, pageSize]);

    // 🔹 Handle search filters
    const handleSearch = (value, field) => {
        const filtered = studentList.filter((s) =>
            s[field]?.toString().toLowerCase().includes(value.toLowerCase())
        );
        setFilteredList(filtered);
        setCurrentPage(1); // Reset to first page
    };

    return (
        <div className="page-content">
            {/* =============== STUDENT VIEW =============== */}
            {!isInstitute && (
                <>
                    <div className="page-head-gradient" style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <h2>Upload Payment Proof</h2>
                        <div className="d-flex align-items-center" style={{ gap: 10 }}>
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                                Reg. No: <span className="bold600">{util.getRegno()}</span>
                            </span>
                            <div className="pill-btn sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }} onClick={() => navigate('/dashboard')}>
                                Go To Dashboard
                            </div>
                        </div>
                    </div>

                    <div className="page-pad">
                        <div className="min-h-[100px] max-w-[800px] mx-auto">
                            <div className="mb-6">
                                <Card
                                    size="small"
                                    title="Payment Proof"
                                    extra={
                                        <div className="flex items-center gap-2 h-200px">
                                            <div className="text-black/50 h-200px">Status:</div>
                                            <div style={{ color: paymentStatusColor[applied?.payment_status] }}>
                                                {applied?.payment_status || 'Pending'}
                                            </div>
                                        </div>
                                    }
                                >
                                    <Spin spinning={loading}>
                                        {applied?.stu_status === 'Accepted' ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    {applied?.payment_status !== 'Acknowledged' && (
                                                        <label className="ant-btn">
                                                            <input
                                                                type="file"
                                                                className="d-none"
                                                                accept="image/*, application/pdf"
                                                                onChange={uploadPaymentSlip}
                                                            />
                                                            <i className="fa fa-upload"></i> Upload Payment Slip
                                                        </label>
                                                    )}
                                                    {applied?.payment_status !== 'Pending' && (
                                                        <Button type="primary" onClick={() => setPaymentSlipOpen(true)}>
                                                            View
                                                        </Button>
                                                    )}
                                                </div>
                                                {!!applied?.payment_comment && (
                                                    <div className="mt-2">
                                                        <div>Remarks:</div>
                                                        <div>{applied.payment_comment}</div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-gray-500">You must accept an offer to upload payment proof.</div>
                                        )}
                                    </Spin>
                                </Card>
                            </div>
                            <StuAcceptedCourseView reload_flag={reloadFlag} callback={setApplied} />
                        </div>
                    </div>

                    {/* View Modal */}
                    {isPaymentSlipOpen && applied && applied?.payment_status !== 'Pending' && (
                        <Modal
                            title={
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>Payment Proof</div>
                                        <div>|</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-black/50">Status:</div>
                                            <div style={{ color: paymentStatusColor[applied.payment_status] }}>
                                                {applied.payment_status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => {
                                                if (!paymentSlipPreviewUrl) return;
                                                const link = document.createElement('a');
                                                link.href = paymentSlipPreviewUrl;
                                                link.target = '_blank';
                                                link.download = `PaymentSlip_${applied?.student_regno || 'student'}.pdf`;
                                                link.click();
                                                message.success('Download started');
                                            }}
                                            disabled={!paymentSlipPreviewUrl}
                                        >
                                            Download
                                        </Button>
                                        <Button onClick={handleClosePaymentSlip}>Close</Button>
                                    </div>
                                </div>
                            }
                            open
                            onCancel={handleClosePaymentSlip}
                            destroyOnClose
                            maskClosable={false}
                            width={Math.min(1100, window.innerWidth - 48)}
                            style={{ top: 50 }}
                            bodyStyle={{ height: window.innerHeight - 140, padding: 12, overflow: 'hidden' }}
                            footer={null}
                        >
                            <Spin spinning={paymentSlipPreviewLoading}>
                                <div style={{ height: '550px', width: '100%', background: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
                                    {paymentSlipPreviewLoading ? (
                                        <div className="flex items-center justify-center h-full bg-gray-50">
                                            <div className="text-gray-500">Loading payment proof...</div>
                                        </div>
                                    ) : paymentSlipPreviewUrl ? (
                                        <>
                                            <object
                                                data={paymentSlipPreviewUrl}
                                                type="application/pdf"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 'none' }}
                                            >
                                                <embed
                                                    src={paymentSlipPreviewUrl}
                                                    type="application/pdf"
                                                    width="100%"
                                                    height="100%"
                                                />
                                            </object>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gray-50">
                                            <div className="text-red-500">Unable to load payment proof</div>
                                        </div>
                                    )}
                                </div>
                            </Spin>
                        </Modal>
                    )}
                </>
            )}

            {/* =============== INSTITUTE VIEW =============== */}
            {isInstitute && (
                <div className="">
                    <div className="page-head-gradient">
                        <h2>Students Who Uploaded Payment Slips</h2>
                    </div>
                    <div className="min-h-[100px] max-w-[2000px] mx-auto">
                        <Card size="large" title="" className="">
                            {/* Search Filters */}
                            <div className="flex gap-4 mb-4 flex-wrap">
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium">Reg. No.</label>
                                    <Input
                                        placeholder="Search by Reg. No."
                                        onChange={(e) => handleSearch(e.target.value, 'student_regno')}
                                        allowClear
                                        style={{ width: 200 }}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium">Name</label>
                                    <Input
                                        placeholder="Search by Name"
                                        onChange={(e) => handleSearch(e.target.value, 'student_name')}
                                        allowClear
                                        style={{ width: 200 }}
                                    />
                                </div>
                            </div>


                            <Spin spinning={loading}>
                                {paginatedData.length > 0 ? (
                                    <>
                                        <div className="text-gray-600 text-sm mb-2">
                                            Showing {(currentPage - 1) * pageSize + 1}–
                                            {Math.min(currentPage * pageSize, filteredList.length)} of {filteredList.length} records
                                        </div>

                                        <table className="w-full border border-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-2 border">S.No</th>
                                                    <th className="p-2 border">Reg. No</th>
                                                    <th className="p-2 border">Name</th>
                                                    <th className="p-2 border">Course</th>
                                                    <th className="p-2 border">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((stu, index) => (
                                                    <tr key={stu.scf_id || index}>
                                                        <td className="p-2 border text-center">
                                                            {(currentPage - 1) * pageSize + index + 1}
                                                        </td>
                                                        <td className="p-2 border">{stu.student_regno}</td>
                                                        <td className="p-2 border">{stu.student_name}</td>
                                                        <td className="p-2 border">{stu.specialization || 'N/A'}</td>
                                                        <td className="p-2 border text-center">
                                                            <div className="flex gap-2 justify-center">
                                                                <Button
                                                                    type="primary"
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setSelectedStudent(stu);
                                                                        setPaymentSlipOpen(true);
                                                                    }}
                                                                >
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    onClick={() => {
                                                                        if (!stu?.file_url) {
                                                                            message.error('No file available');
                                                                            return;
                                                                        }
                                                                        try {
                                                                            // Use direct file URL from PHP backend
                                                                            const link = document.createElement('a');
                                                                            link.href = stu.file_url;
                                                                            link.target = '_blank';
                                                                            const extRaw = (stu?.file_ext || '.pdf').toString();
                                                                            const ext = extRaw.startsWith('.') ? extRaw : `.${extRaw}`;
                                                                            link.download = `${stu.student_name || 'student'}_PaymentSlip${ext}`;
                                                                            link.click();
                                                                            message.success('Download started');
                                                                        } catch (e) {
                                                                            message.error(e.message || 'Download failed');
                                                                        }
                                                                    }}
                                                                >
                                                                    Download
                                                                </Button>
                                                                <PaymentStatusDropdown
                                                                    status={stu.payment_status}
                                                                    scf_id={stu.scf_id}
                                                                    student_id={stu.student_id} 
                                                                    onChange={(newStatus) => {
                                                                        // refresh list after status update
                                                                        setReloadFlag((prev) => prev + 1);
                                                                    }}
                                                                />


                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
                                        <div className="mt-4 flex justify-end">
                                            <Pagination
                                                current={currentPage}
                                                pageSize={pageSize}
                                                total={filteredList.length}
                                                onChange={(page) => setCurrentPage(page)}
                                                showSizeChanger={false}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No students have uploaded payment proofs yet.
                                    </div>
                                )}
                            </Spin>
                        </Card>
                    </div>

                    {/* Modal: View Payment Slip */}
                    {isPaymentSlipOpen && selectedStudent && (
                        <Modal
                            title={
                                <div
  className="flex items-center justify-between mt-50"
  style={{ top: "50px" }}
>
                                    <div className='mt-50'>
                                        Payment Proof - {selectedStudent.student_name} (Reg: {selectedStudent.student_regno})
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => {
                                                if (!paymentSlipPreviewUrl) return;
                                                const link = document.createElement('a');
                                                link.href = paymentSlipPreviewUrl;
                                                link.target = '_blank';
                                                link.download = `${selectedStudent.student_name || 'student'}_PaymentSlip.pdf`;
                                                link.click();
                                                message.success('Download started');
                                            }}
                                            disabled={!paymentSlipPreviewUrl}
                                        >
                                            Download
                                        </Button>
                                        <Button onClick={handleClosePaymentSlip}>Close</Button>
                                    </div>
                                </div>
                            }
                            open
                            onCancel={handleClosePaymentSlip}
                            destroyOnClose
                            maskClosable={false}
                            width={Math.min(1100, window.innerWidth - 48)}
                            style={{ top: 50 }}
                            bodyStyle={{ height: window.innerHeight - 140, padding: 12, overflow: 'hidden' }}
                            footer={null}
                        >
                            <Spin spinning={paymentSlipPreviewLoading}>
                                <div style={{ height: '550px', width: '100%', background: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
                                    {paymentSlipPreviewLoading ? (
                                        <div className="flex items-center justify-center h-full bg-gray-50">
                                            <div className="text-gray-500">Loading payment proof...</div>
                                        </div>
                                    ) : paymentSlipPreviewUrl ? (
                                        <>
                                            <object
                                                data={paymentSlipPreviewUrl}
                                                type="application/pdf"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 'none' }}
                                            >
                                                <embed
                                                    src={paymentSlipPreviewUrl}
                                                    type="application/pdf"
                                                    width="100%"
                                                    height="100%"
                                                />
                                            </object>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gray-50">
                                            <div className="text-red-500">No file available</div>
                                        </div>
                                    )}
                                </div>
                            </Spin>
                        </Modal>
                    )}
                </div>
            )}
        </div>
    );
}