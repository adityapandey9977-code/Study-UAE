/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import StudentService from "../../services/StudentService";
import AuthService from "../../services/AuthService";
import util from "../../utils/util";
import {
    Button,
    message,
    Modal,
    Input,
    Alert
} from 'antd';


export default function EmailVerifyOtp(props) {
    const { refOb, setEmailVerified = null } = props;
    const navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false);
    const [data, setData] = useState({});
    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }

    const closeModal = () => {
        setModalOpen(false);
    }

    const login = (fd) => {
        message.destroy();
        util.showLoader();
        AuthService.studentLoginWithOtp(fd || data).then(({ data }) => {
            util.setLoginInfoLocalStorage(data);
            navigate('/dashboard');
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        });
    }

    const verify = () => {
        message.destroy();
        util.showLoader();
        StudentService.verifyEmail(data).then(({ data }) => {
            message.success(data.message);
            setModalOpen(false);
            if (setEmailVerified) {
                setEmailVerified();
            }
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        });
    }

    const sendOtp = () => {
        message.destroy();
        util.showLoader();
        StudentService.sendEmailVerificationOtp(data).then((res) => {
            message.success(res.data.message || 'OTP sent');
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        });
    }

    refOb.current = {
        open: (otpData, sendOtpAlso = false) => {
            setData(otpData);
            setModalOpen(true);
            if (sendOtpAlso) {
                data.email = otpData.email;
                sendOtp();
            }
        },
        login: (fd) => {
            login(fd);
        }
    }

    useEffect(() => {
    }, []);


    return (
        <Modal
            title={"Email Verification OTP"}
            open={isModalOpen}
            onCancel={closeModal}
            destroyOnClose
            maskClosable={false}
            width={600}
            footer={null}
        >
            <div className="pb30">
                <Alert message="Email verification OTP has been sent to your email-id" type="info" banner showIcon={false} />
                <div className="d-flex pt20">
                    <div className="my-auto flex-grow-1">
                        <Input size="large" placeholder="Enter OTP" value={data.otp || ''} onChange={e => handleChange(e.target.value, 'otp')} />
                    </div>
                    <div className="my-auto w100">
                        {setEmailVerified === null ? (
                            <Button size="large" type="danger" block onClick={() => login()}>Login</Button>
                        ) : (
                            <Button size="large" type="danger" block onClick={() => verify()}>Verify</Button>
                        )}
                    </div>
                </div>
                <div className="pt10">
                    Didn't receive OTP yet? <span className="link" onClick={sendOtp}>Resend.</span>
                </div>
            </div>
        </Modal>
    );
}