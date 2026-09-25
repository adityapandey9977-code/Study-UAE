/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import StudentService from "../../services/StudentService";
import util from "../../utils/util";
import {
    Button,
    message,
    Modal,
    Input,
    Alert
} from 'antd';


export default function MobileVerifyOtp(props) {
    const { refOb, stuName, studentId } = props;
    const [isModalOpen, setModalOpen] = useState(false);
    let [data, setData] = useState({});
    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }

    const closeModal = () => {
        setModalOpen(false);
    }

    const verify = () => {
        message.destroy();
        util.showLoader();
        StudentService.verifyMobileNo({ ...data, student_id: studentId || data.student_id }).then(({ data }) => {
            message.success(data.message);
            setModalOpen(false);
            props.setMobileVerified();
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        });
    }

    const sendOtp = (otpData) => {
        let fd = otpData ? otpData : data;
        message.destroy();
        util.showLoader();
        StudentService.sendMobileVerificationOtp({ isd_code_country_id: fd.isd_code_country_id, mobile: fd.mobile, name: stuName || '', student_id: studentId || fd.student_id }).then((res) => {
            message.success(res.data.message || 'OTP sent');
            setData({ ...fd, student_id: studentId || fd.student_id, otp_token: res.data.otp_token, ccode_token: res.data.ccode_token, mobile_token: res.data.mobile_token });
            setModalOpen(true);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        });
    }

    refOb.current = {
        open: (otpData) => {
            sendOtp(otpData);
        }
    }

    useEffect(() => {
    }, []);


    return (
        <Modal
            title={"Mobile (Whatsapp) Verification OTP"}
            open={isModalOpen}
            onCancel={closeModal}
            destroyOnClose
            maskClosable={false}
            width={600}
            footer={null}
        >
            <div className="pb30">
                <Alert message="OTP has been sent to your Whatsapp mobile number" type="info" banner showIcon={false} />
                <div className="d-flex pt20">
                    <div className="my-auto flex-grow-1">
                        <Input size="large" placeholder="Enter OTP" value={data.otp || ''} onChange={e => handleChange(e.target.value, 'otp')} />
                    </div>
                    <div className="my-auto w100">
                        <Button size="large" type="primary" block onClick={verify}>Verify</Button>
                    </div>
                </div>
                <div className="pt10">
                    Didn't receive OTP yet? <span className="link" onClick={() => sendOtp(null)}>Resend.</span>
                </div>
            </div>
        </Modal>
    );
}