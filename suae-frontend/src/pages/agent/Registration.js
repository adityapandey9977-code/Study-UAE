/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, message, Modal, Button } from "antd";
import {
    UserOutlined,
    MailOutlined,
    GlobalOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import CmasterService from "../../services/CmasterService";
import { AntdSelect } from "../../utils/Antd";
import { useDynamicLogo } from "../../hooks/useDynamicLogo";
import backgroundEvents from "../../utils/backgroundEvents";

export default function Registration() {
    const navigate = useNavigate();
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [userId, setUserId] = useState(null); // store user_id
    const [countries, setCountries] = useState([]);
    const [loginBackground, setLoginBackground] = useState(null);
    const logo = useDynamicLogo();

    useEffect(() => {
        // fetch countries from API
        CmasterService.allCountries({ status: 1 }).then((res) =>
            setCountries(res.data.result.data)
        );
    }, []);

    // Fetch dynamic login background
    useEffect(() => {
        const fetchLoginBackground = async () => {
            try {
                console.log('Fetching login background for agent registration...');
                const response = await CmasterService.getActiveBackground('Login Background');
                console.log('Login background API response:', response.data);
                if (response.data?.success && response.data.data?.file_url) {
                    console.log('Setting login background to:', response.data.data.file_url);
                    setLoginBackground(response.data.data.file_url);
                } else {
                    console.log('No active login background found or API error');
                }
            } catch (error) {
                console.error('Error fetching login background:', error);
            }
        };

        fetchLoginBackground();

        // Listen for background updates
        const handleBackgroundUpdate = () => {
            console.log('Background update event received, fetching new background...');
            fetchLoginBackground();
        };

        // Listen for storage events (when background is updated from admin panel)
        window.addEventListener('storage', handleBackgroundUpdate);
        
        // Also listen for custom events (for same-tab updates)
        window.addEventListener('backgroundUpdated', handleBackgroundUpdate);

        // Subscribe to background events
        const unsubscribe = backgroundEvents.subscribe((type) => {
            console.log('Background event received for type:', type);
            if (type === 'LOGIN') {
                fetchLoginBackground();
            }
        });

        return () => {
            window.removeEventListener('storage', handleBackgroundUpdate);
            window.removeEventListener('backgroundUpdated', handleBackgroundUpdate);
            unsubscribe();
        };
    }, []);

    const handleCountryChange = (countryId) => {
        const selectedCountry = countries.find((c) => c.id === countryId);
        setValues({
            ...values,
            country_id: countryId,
            isd_code_country_id: selectedCountry?.id,
        });
    };

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        message.destroy();

        if (!values.fullName || !values.email || !values.mobile || !values.country_id) {
            message.error("Please fill in all required fields.");
            return;
        }

        // Split fullName into fname and lname
        const nameParts = values.fullName.trim().split(" ");
        const fname = nameParts[0] || "";
        const lname = nameParts.slice(1).join(" ") || "";

        const payload = {
            name: values.fullName, // full name
            fname,
            lname,
            email: values.email,
            country_id: values.country_id,
            mobile: values.mobile,
            organization: values.organization,
        };

        setLoading(true);
        try {
            const { data } = await CmasterService.registerAgent(payload);
            setUserId(data.user_id); // store user_id
            setShowOtpModal(true);
            message.success("Registration successful! Please enter OTP.");
        } catch (err) {
            message.error(err.message || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            message.error("Please enter OTP");
            return;
        }
        setLoading(true);
        try {
            const { data } = await CmasterService.verifyOtp({
                user_id: userId,
                otp,
            });
            if (data.status) {   
                console.log("Success:", data.message);
                console.log("OTP:", otp);
                message.success(data.message || "OTP verified! Redirecting to login...");
                setShowOtpModal(false);

                setTimeout(() => {
                    window.location.href = "http://localhost:3001/login";
                }, 1500);
            } else {
                message.error(data.message || "Invalid OTP");
                console.log("Error side:", data.message);
            }
        } catch (err) {
            console.error("Network/Server Error:", err);
            message.error(err.message || "OTP verification failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login parent h-100 login-bg">
            <div className="text-center pt30">
                <img 
                    src={logo || "theme/img/sis-logo.png"} 
                    width="200" 
                    height="80"
                    style={{ objectFit: 'contain' }}
                    alt="logo" 
                />
            </div>
            <div
                className="login-bgimage"
                style={{
                    backgroundImage: `url(${loginBackground || require('../../img/login-bg-new.jpg')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    position: 'relative',
                    backgroundColor: loginBackground ? 'transparent' : '#6d6868ff'
                }}
            >
                <div className="container" style={{ padding: '0 15px', maxWidth: '1200px', width: '100%' }}>
                    <div className="login-box">
                        <div className="login-content round-input" style={{ padding: '30px 50px', boxSizing: 'border-box' }}>
                            <h3 className="heading" style={{ marginBottom: '20px' }}>Agent Registration</h3>

                            <form onSubmit={handleRegister} autoComplete="off" spellCheck="false" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                                {/* Full Name */}
                                <div className="form-group pt20" style={{ marginBottom: '15px' }}>
                                    <Input
                                        size="large"
                                        placeholder="Full Name"
                                        prefix={<UserOutlined />}
                                        value={values.fullName || ""}
                                        onChange={(e) =>
                                            setValues({ ...values, fullName: e.target.value })
                                        }
                                        disabled={loading}
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {/* Email */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <Input
                                        size="large"
                                        placeholder="Email ID"
                                        prefix={<MailOutlined />}
                                        value={values.email || ""}
                                        onChange={(e) =>
                                            setValues({ ...values, email: e.target.value })
                                        }
                                        disabled={loading}
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {/* Country Dropdown */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <AntdSelect
                                        size="large"
                                        placeholder="--Select Country--"
                                        showSearch
                                        prefix={<GlobalOutlined />}
                                        options={countries.map((v) => ({
                                            id: v.id,
                                            name: `${v.name} (${v.isd_code})`,
                                        }))}
                                        value={values.country_id}
                                        onChange={handleCountryChange}
                                        disabled={loading}
                                        allowClear
                                        onClear={() =>
                                            setValues({
                                                ...values,
                                                country_id: null,
                                                isd_code_country_id: null,
                                            })
                                        }
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                {/* Mobile with ISD code */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <div style={{
                                        display: 'flex',
                                        height: '40px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#009297'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#d9d9d9'}
                                    >
                                        <input
                                            type="text"
                                            value={
                                                countries.find((c) => c.id === values.country_id)?.isd_code || "+"
                                            }
                                            readOnly
                                            style={{
                                                width: '64px',
                                                minWidth: '64px',
                                                maxWidth: '64px',
                                                backgroundColor: '#f5f5f5',
                                                padding: '0 8px',
                                                textAlign: 'center',
                                                fontSize: '16px',
                                                border: 'none',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Mobile No."
                                            value={values.mobile || ""}
                                            onChange={(e) => setValues({ ...values, mobile: e.target.value })}
                                            maxLength={15}
                                            disabled={loading}
                                            style={{
                                                flex: 1,
                                                padding: '0 12px',
                                                fontSize: '16px',
                                                border: 'none',
                                                outline: 'none',
                                                minWidth: 0,
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Organization */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <Input
                                        size="large"
                                        placeholder="Firm / Organization Name"
                                        prefix={<HomeOutlined />}
                                        value={values.organization || ""}
                                        onChange={(e) =>
                                            setValues({ ...values, organization: e.target.value })
                                        }
                                        disabled={loading}
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {/* Register Button */}
                                <div className="form-actions pt5">
                                    <button type="submit" className="d-none"></button>
                                    <div
                                        className="pill-btn active fs16 pt10 pb10"
                                        onClick={handleRegister}
                                        style={{
                                            background: "linear-gradient(88deg, #009297, #3bc6cd)",
                                        }}
                                    >
                                        {loading ? "Processing..." : "Register"}
                                    </div>
                                </div>
                            </form>

                            <div className="text-center text-gray-700 mt-6">
                                Already Registered?{" "}
                                <Link
                                    to="/login"
                                    className="text-[#ffc20e] font-medium hover:underline hover:text-[#009297]"
                                >
                                    Click here to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Modal */}
            <Modal
                title="Enter OTP"
                open={showOtpModal}
                onCancel={() => setShowOtpModal(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setShowOtpModal(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="verify"
                        type="primary"
                        onClick={handleVerifyOtp}
                        loading={loading}
                    >
                        Verify OTP
                    </Button>,
                ]}
            >
                <Input
                    size="large"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />
            </Modal>
        </div>
    );
}
