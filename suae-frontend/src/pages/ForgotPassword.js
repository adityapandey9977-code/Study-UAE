/* eslint-disable no-unused-vars */
// import React, { useState } from 'react';
// import { Link, useNavigate } from "react-router-dom";
// import Auth from "../services/AuthService";
// import util from "../utils/util";
// import { Input, message } from 'antd';
// import { MailOutlined } from '@ant-design/icons';

// export default function ForgotPassword() {
//     const navigate = useNavigate();
//     const [email, setEmail] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [sent, setSent] = useState(false); // To show success message

//     const isStudentDomain = window.location.href.indexOf("student.") >= 0;
//     const isInstituteDomain = window.location.href.indexOf("institute.") >= 0;
//     const isAgentDomain = window.location.href.indexOf("agent.") >= 0;
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!email) {
//             message.warning("Please enter your email.");
//             return;
//         }
//         setLoading(true);
//         message.destroy();
//         util.showLoader();
//         Auth.forgotPassword({ email })
//             .then(({ data }) => {
//                 util.hideLoader();
//                 setLoading(false);
//                 if (data.success) {
//                     setSent(true); // Show success screen
//                     setEmail('');
//                     message.success("Password reset link has been sent to your email.");
//                 } else {
//                     message.error(data.message || "Failed to send reset link.");
//                 }
//             })
//             .catch((err) => {
//                 util.hideLoader();
//                 setLoading(false);
//                 message.error(err.message || "An error occurred. Please try again.");
//             });
//     };
//     return (
//         <div className="login parent h-100 login-bg">
//             {/* Logo Section */}
//             <div className="text-center pt30">
//                 <img src="theme/img/sis-logo.png" width="200" alt="SIS Logo" />
//             </div>
//             {/* Background Image Wrapper */}
//             <div className="login-bgimage">
//                 <div className="container">
//                     <div className="login-box">
//                         <div className="login-content round-input p-6">
//                             <h3 className="heading text-center mb-4">
//                                 {isStudentDomain
//                                     ? 'Student'
//                                     : isInstituteDomain
//                                         ? 'Institute'
//                                         : isAgentDomain
//                                             ? 'Agent'
//                                             : 'Admin'}{' '}
//                                 Forgot Password
//                             </h3>

//                             {!sent ? (
//                                 /* Reset Password Request Form */
//                                 <form onSubmit={handleSubmit} autoComplete="off">
//                                     <div className="form-group pt20">
//                                         <Input
//                                             size="large"
//                                             type="email"
//                                             placeholder="Enter your email"
//                                             prefix={<MailOutlined className="site-form-item-icon" />}
//                                             value={email}
//                                             onChange={(e) => setEmail(e.target.value)}
//                                             autoFocus
//                                         />
//                                     </div>

//                                     <div className="form-actions pt5">
//                                         <button
//                                             type="submit"
//                                             disabled={loading}
//                                             className="pill-btn active fs16 pt10 pb10 w-full"
//                                             style={{
//                                                 background: "linear-gradient(88deg, #009297, #3bc6cd)",
//                                                 border: 'none',
//                                                 color: 'white',
//                                                 opacity: loading ? 0.7 : 1
//                                             }}
//                                         >
//                                             {loading ? 'Sending...' : 'Send Reset Link'}
//                                         </button>
//                                     </div>
//                                 </form>
//                             ) : (
//                                 /* Success Message After Email Sent */
//                                 <div className="text-center">
//                                     <div className="mb-4 text-green-500 text-lg">
//                                         ✅ Password reset link has been sent!
//                                     </div>
//                                     <p className="text-white mb-6">
//                                         Please check your inbox at <strong>{email}</strong> for instructions to reset your password.
//                                     </p>
//                                     <div
//                                         className="pill-btn fs16 pt10 pb10 cursor-pointer"
//                                         style={{
//                                             background: "linear-gradient(88deg, #009297, #3bc6cd)",
//                                             display: 'inline-block',
//                                             width: 'auto',
//                                             padding: '10px 20px'
//                                         }}
//                                         onClick={() => navigate('/login')}
//                                     >
//                                         Back to Login
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Back to Login Link */}
//                             {!sent && (
//                                 <div className="text-center mt-6">
//                                     <Link
//                                         to="/login"
//                                         className="text-[#ffc20e] font-medium hover:underline"
//                                     >
//                                         ← Back to Login
//                                     </Link>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }




/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import Auth from "../services/AuthService";
import util from "../utils/util";
import { useDynamicLogo } from "../hooks/useDynamicLogo";
import backgroundEvents from "../utils/backgroundEvents";
import { Input, message } from 'antd';
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { search } = useLocation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false); // To show success message
    const [loginBackground, setLoginBackground] = useState(null);
    
    // Use dynamic logo hook
    const logo = useDynamicLogo();

    const queryParams = new URLSearchParams(search);
    const fromPath = queryParams.get("from") || "";

    const isStudentDomain = window.location.href.indexOf("student.") >= 0 || fromPath.includes("student-login");
    const isInstituteDomain = window.location.href.indexOf("institute.") >= 0 || fromPath.includes("institute-login");
    const isAgentDomain = window.location.href.indexOf("agent.") >= 0;

    // Fetch dynamic login background
    useEffect(() => {
        const fetchLoginBackground = async () => {
            try {
                console.log('Fetching login background for forgot password...');
                const CmasterService = (await import('../services/CmasterService')).default;
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            message.warning("Please enter your email.");
            return;
        }
        setLoading(true);
        message.destroy();
        util.showLoader();
        Auth.forgotPassword({ email })
            .then(({ data }) => {
                util.hideLoader();
                setLoading(false);
                
                // Workaround: Check if message indicates success even if success flag is false
                // This handles backend returning success:false with "sent" message
                const messageText = data.message || '';
                const isActuallySuccess = data.success || 
                                         messageText.toLowerCase().includes('sent') ||
                                         messageText.toLowerCase().includes('reset link');
                
                if (isActuallySuccess) {
                    setSent(true);
                    setEmail('');
                    message.success(messageText || "Password reset link has been sent to your email.");
                } else {
                    message.error(messageText || "Failed to send reset link.");
                }
            })
            .catch((err) => {
                util.hideLoader();
                setLoading(false);
                message.error(err.message || "An error occurred. Please try again.");
            });
    };
    return (
        <div className="login parent h-100 login-bg">
            {/* Logo Section */}
            <div className="text-center pt30">
                <img 
                    src={logo || "theme/img/sis-logo.png"} 
                    width="200" 
                    height="80"
                    style={{ objectFit: 'contain' }}
                    alt="SIS Logo" 
                />
            </div>
            {/* Background Image Wrapper */}
            <div
                className="login-bgimage"
                style={{
                    backgroundImage: `url(${loginBackground || require('../img/login-bg-new.jpg')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    position: 'relative',
                    backgroundColor: loginBackground ? 'transparent' : '#6d6868ff'
                }}
            >
                <div className="container">
                    <div className="login-box">
                        <div className="login-content round-input p-6">
                            <h3 className="heading text-center mb-4">
                                {isStudentDomain
                                    ? 'Student'
                                    : isInstituteDomain
                                        ? 'Institute'
                                        : isAgentDomain
                                            ? 'Agent'
                                            : 'Admin'}{' '}
                                Forgot Password
                            </h3>

                            {!sent ? (
                                /* Reset Password Request Form */
                                <form onSubmit={handleSubmit} autoComplete="off">
                                    <div className="form-group pt20">
                                        <Input
                                            size="large"
                                            type="email"
                                            placeholder="Enter your email"
                                            prefix={<MailOutlined className="site-form-item-icon" />}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="form-actions pt5">
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
                                            {loading ? 'Sending...' : 'Send Reset Link'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* Success Message After Email Sent */
                                <div className="text-center">
                                    <div className="forgot-password-success-icon mb-4">
                                        <CheckCircleOutlined />
                                    </div>
                                    <div className="mb-4 text-green-600 text-lg font-semibold">
                                        Password reset link has been sent!
                                    </div>
                                    <p className="text-gray-700 mb-6">
                                        Please check your inbox at <strong>{email}</strong> for instructions to reset your password.
                                    </p>
                                    <div
                                        className="pill-btn fs16 pt10 pb10 cursor-pointer"
                                        style={{
                                            background: "linear-gradient(88deg, #009297, #3bc6cd)",
                                            display: 'inline-block',
                                            width: 'auto',
                                            padding: '10px 20px'
                                        }}
                                        onClick={() => navigate(fromPath ? (fromPath.startsWith('/') ? fromPath : `/${fromPath}`) : '/login')}
                                    >
                                        Back to Login
                                    </div>
                                </div>
                            )}

                            {/* Back to Login Link */}
                            {!sent && (
                                <div className="text-center mt-6">
                                    <Link
                                        to={fromPath ? (fromPath.startsWith('/') ? fromPath : `/${fromPath}`) : '/login'}
                                        className="text-[#009297] font-medium hover:underline hover:text-[#00666a]"
                                    >
                                        ← Back to Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}