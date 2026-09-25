/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FileSaver from 'file-saver';
import { Alert, message, Spin, Card, Button, Modal } from 'antd';
import StudentService from "../../services/StudentService";
import util from '../../utils/util';

const AppStatusTag = ({ status }) => {
    const colors = {
        Pending: '#FFBF00',
        Accepted: '#26C281',
        Approved: '#26C281',
        Rejected: '#ed6b75',
    }
    return (
        <div className={`uppercase text-[11px] px-2 py-[2px] rounded-lg text-center`} style={{ color: colors[status], border: `1px solid ${colors[status]}` }}>
            {status}
        </div>
    )
}

export default function StuAcceptedCourseView({ student_id, reload_flag, callback = () => { } }) {
    const [loading, setLoading] = useState(true);
    const [applied, setApplied] = useState(null);
    const [viewOfferUrl, setViewOfferUrl] = useState(null);
    const appliedCourses = async () => {
        setLoading(true);
        try {
            const { data } = await StudentService.appliedCourses({ student_id });
            const dtl = data.result.data.find((item) => item.stu_status === 'Accepted');
            setApplied(dtl || null);
            callback(dtl || null);
        } catch (e) {
            callback(null);
            message.error(e.message);
        }
        setLoading(false);
    }

    const downloadOffer = async (url) => {
        try{
            const { data } = await axios.get(url, { responseType: 'blob' });
            const blob = new Blob([data], { type: "application/pdf" });
            FileSaver.saveAs(blob, 'offer-letter.pdf');
        }catch(e){
            console.log(e);
        }
    }

    useEffect(() => {
        appliedCourses();
    }, [reload_flag]);

    return (
        <Spin spinning={loading}>
            <div className='min-h-[100px]'>
                {applied !== null ? (
                    <div className='flex flex-col gap-4'>
                        <Card size="small" title="Institute Detail">
                            <div className='flex flex-col gap-1'>
                                {[
                                    { value: applied.inst_name, label: 'Name', isbold: true },
                                    { value: applied.inst_type, label: 'Type' },
                                    { value: applied.inst_state, label: 'State' },
                                    { value: applied.inst_city, label: 'City' },
                                ].map((item) => (
                                    <div key={item.label} className='flex items-center gap-1'>
                                        <div className='text-black/50 w-[130px]'>{item.label}</div>
                                        <div className='pr-2'>:</div>
                                        <div className={item.isbold ? 'font-semibold' : ''}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card size="small" title="Course Detail">
                            <div className='flex flex-col gap-1'>
                                {[
                                    { value: applied.specialization, label: 'Course', isbold: true },
                                    { value: applied.ac, label: 'Acad. Career' },
                                    { value: applied.discipline, label: 'Discipline' },
                                    { value: applied.eligibility_creteria, label: 'Eligibility Creteria' },
                                ].map((item) => (
                                    <div key={item.label} className='flex items-center gap-1'>
                                        <div className='text-black/50'><div className='w-[130px]'>{item.label}</div></div>
                                        <div className='pr-2'>:</div>
                                        <div className={item.isbold ? 'font-semibold' : ''}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card size="small" title="Applied On">
                            <div className='flex items-center justify-between'>
                                <div>
                                    <div>{util.getDate(applied.applied_on, 'DD MMM YYYY @ hh:mm A')}</div>
                                    <div className='mt-1 mb-2 w-[157px]'>
                                        <div className='text-black/50 text-[11px]'>Institute Status:</div>
                                        <AppStatusTag status={applied.ins_status} />
                                    </div>
                                    <div className='mt-1 mb-2 w-[157px]'>
                                        <div className='text-black/50 text-[11px]'>Student Status:</div>
                                        <AppStatusTag status={applied.stu_status} />
                                    </div>
                                </div>

                                <div className='flex flex-col gap-3'>
                                    <Button size='small' onClick={() => setViewOfferUrl(applied.offer_file_url)} shape="round">
                                        <i className="fa-sharp fa-solid fa-eye"></i>
                                        <span className='text-[11px] font-semibold uppercase'>&nbsp;View Offer Letter</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>
                        {!loading && <Alert type="alert" message="You have not accepted any course." />}
                    </div>
                )}
            </div>

            {viewOfferUrl !== null &&
                <Modal
                    title="Offer Letter"
                    open
                    onCancel={() => setViewOfferUrl(null)}
                    destroyOnClose
                    maskClosable={false}
                    width="70%"
                    footer={null}
                    style={{ top: 0 }}
                    bodyStyle={{ height: window.innerHeight - 80, padding: 0, position: 'relative' }}
                >
                    <iframe
                        src={viewOfferUrl}
                        id="vofrltr"
                        name="vofrltr"
                        title="Print Preview"
                        style={{
                            height: '100%', border: 'none', width: '100%', overflow: 'auto', display: 'block', margin: 0, padding: 0, lineHeight: 0
                        }}
                    />
                    <div className='absolute top-[12px] right-[10px] z-[1000] bg-[rgb(50,54,57)] w-[120px] h-[30px]'></div>
                </Modal>
            }
        </Spin>
    )
}