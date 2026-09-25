/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Auth from "../services/AuthService";
import CmasterService from "../services/CmasterService";
import util from "../utils/util";
import { useDynamicLogo } from "../hooks/useDynamicLogo";
import { Input, message } from 'antd';
import { LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifiedToken, setVerifiedToken] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    
    // Use dynamic logo hook
    const logo = useDynamicLogo();

    // Extract token from query string
    const getToken = () => {
        const params = new URLSearchParams(location.search);
        return params.get('token');
    };
    const token = getToken();

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            message.error("Invalid or missing reset token.");
            navigate('/forgot-password');
            return;
        }
        setVerifiedToken(true);
    }, [token, navigate]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password || password.trim() === '') {
            message.warning("Password field is required.");
            return;
        }
        if (password.length < 8) {
            message.warning("Password must be at least 8 characters long.");
            return;
        }
        setLoading(true);
        message.destroy();
        util.showLoader();

        Auth.resetPassword({ token, password })
            .then(({ data }) => {
                util.hideLoader();
                setLoading(false);
                if (data.success) {
                    setSubmitSuccess(true);
                    navigate('/login');
                    message.success("Password has been reset successfully!");
                } else {
                    message.error(data.message || "Failed to reset password.");
                }
            })
            .catch((err) => {
                util.hideLoader();
                setLoading(false);
                const errorMsg = err.response?.data?.message || err.message || "An error occurred. Please try again.";
                message.error(errorMsg);
            });
    };

    if (!verifiedToken) {
        return null;
    }

    return (
        <div className="login parent h-100 login-bg">
            {/* Logo */}
            <div className="text-center pt30">
                <img src={logo || "theme/img/sis-logo.png"} width="200" alt="SIS Logo" />
            </div>

            {/* Background Wrapper */}
            <div className="login-bgimage">
                <div className="container">
                    <div className="login-box">
                        <div className="login-content round-input p-6">
                            <h3 className="heading text-center mb-4">Set New Password</h3>

                            {!submitSuccess ? (
                                <form onSubmit={handleSubmit} autoComplete="off">
                                    {/* New Password */}
                                    <div className="form-group pt20">
                                        <Input.Password
                                            size="large"
                                            placeholder="New Password"
                                            prefix={<LockOutlined />}
                                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="form-actions pt10">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="pill-btn active fs16 pt10 pb10 w-full"
                                            style={{
                                                background: "linear-gradient(88deg, #009297, #3bc6cd)",
                                                border: 'none',
                                                color: 'white',
                                                opacity: loading ? 0.7 : 1
                                            }}
                                        >
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* Success Screen */
                                <div className="text-center">
                                    <div className="mb-4 text-green-500 text-lg">✅ Password Updated!</div>
                                    <p className="text-gray-700 mb-6">Your password has been successfully reset.</p>
                                    <div
                                        className="pill-btn fs16 pt10 pb10 cursor-pointer inline-block"
                                        style={{
                                            background: "linear-gradient(88deg, #009297, #3bc6cd)",
                                            padding: '10px 20px'
                                        }}
                                        onClick={() => navigate('/login')}
                                    >
                                        Go to Login
                                    </div>
                                </div>
                            )}

                            {/* Back Link */}
                            {!submitSuccess && (
                                <div className="text-center mt-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-[#009297] font-medium hover:underline hover:text-[#00666a] bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        ← Back to Forgot Password
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}