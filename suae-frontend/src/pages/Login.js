import React, { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import Auth from "../services/AuthService"
import InstituteService from "../services/InstituteService"
import util from "../utils/util"
import { sdx } from "../sdx"
import EmailVerifyOtp from "./student/EmailVerifyOtp"
import backgroundEvents from "../utils/backgroundEvents";
import { useDynamicLogo } from "../hooks/useDynamicLogo"
import { Input, message } from "antd"
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons"

export default function Login() {
    const loginKey = new URLSearchParams(window.location.search).get("key")
    const navigate = useNavigate()
    const isMount = useRef(true)
    const otpModalRef = useRef({})
    const [values, setValues] = useState({})
    const [ipData, setIPData] = useState(null)
    const [hasRedirected, setHasRedirected] = useState(false)
    const [loginBackground, setLoginBackground] = useState(null);
    const valuesRef = useRef(values)
    const ipDataRef = useRef(ipData)

    useEffect(() => {
        valuesRef.current = values
    }, [values])

    useEffect(() => {
        ipDataRef.current = ipData
    }, [ipData])

    const logo = useDynamicLogo();

    const isStudentDomain = window.location.href.indexOf("student.") >= 0 || window.location.pathname.includes("/student-login")
    const isInstituteDomain = window.location.href.indexOf("institute.") >= 0 || window.location.pathname.includes("/institute-login")
    const isAgentDomain = window.location.href.indexOf("agent.") >= 0
    const isLoginPage = window.location.pathname.includes("/login") || window.location.pathname === "/" || window.location.pathname.includes("/student-login") || window.location.pathname.includes("/institute-login")

    console.log('Login component render:', {
        pathname: window.location.pathname,
        href: window.location.href,
        isLoginPage,
        isStudentDomain,
        isLogged: util.isLogged(),
        token: !!window.localStorage.getItem('token'),
        hasRedirected,
        loginBackground
    })

    useEffect(() => {
        const fetchLoginBackground = async () => {
            try {
                console.log('Fetching login background...');
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

    const login = useCallback((e, autoValues = null) => {
        if (e) e.preventDefault()
        message.destroy()
        //setLoading(true);
        util.showLoader()
        const payload = autoValues || valuesRef.current
        payload.ipdata = null
        const currentIpData = ipDataRef.current
        if (currentIpData) {
            payload.ipdata = {
                ip: currentIpData.ip,
                city: currentIpData.city,
                region_code: currentIpData.region_code,
                region: currentIpData.region,
                country_code: currentIpData.country_code,
                country_name: currentIpData.country_name,
            }
        }
        Auth.login(payload)
            .then(async ({ data }) => {
                util.hideLoader()

                // Extract result from response (backend returns { result: userData })
                const userData = data.result || data;

                if (userData.message === "STUEMAILNOTVERIFIED" || data.message === "STUEMAILNOTVERIFIED") {
                    let otpData = {
                        otp_token: userData.otp_token || data.otp_token,
                        stu_id_token: userData.stu_id_token || data.stu_id_token,
                    }
                    otpModalRef.current.open(otpData)
                    return
                }
                if (autoValues) {
                    userData.isAutoLoggedIn = 1
                } else {
                    userData.isAutoLoggedIn = 0
                }

                // Map nodetoken to the expected format
                if (userData.token && !userData.nodetoken) {
                    userData.nodetoken = userData.token;
                }
                if (userData.phptoken && !userData.token) {
                    userData.token = userData.phptoken;
                }

                util.setLoginInfoLocalStorage(userData)

                window.dispatchEvent(new Event("loginSuccess"))

                // Fix 1.2: Set institute context after successful login (BOTH auto-login AND manual login)
                if (userData.is_institute || userData.is_admin || userData.is_client_admin) {
                    try {
                        const { data: instituteData } =
                            await InstituteService.getInstituteId()
                        // Multiple fallback patterns for different API response structures
                        const fetchedId = Number(
                            instituteData?.data?.institute_id ||
                            instituteData?.institute_id ||
                            instituteData?.result?.institute_id ||
                            0
                        )
                        if (fetchedId) {
                            sdx.setData({ institute_id: fetchedId })
                            console.log(
                                "[login] Institute context set:",
                                fetchedId,
                                "user:",
                                userData.isAutoLoggedIn ? "auto-login" : "manual-login"
                            )
                        } else {
                            console.warn(
                                "[login] Institute ID not found in response:",
                                instituteData
                            )
                        }
                    } catch (error) {
                        console.warn("[login] Could not fetch institute ID:", error.message)
                        // Continue navigation even if institute ID fetch fails
                    }
                } else {
                    console.log(
                        "[login] Skipping institute context (not institute/admin user)"
                    )
                }

                if (userData.is_agent) {
                    navigate("/students")
                } else if (userData.is_student) {
                    navigate("/dashboard")
                } else if (userData.type === 'CLIENT' && userData.is_admin !== 1 && userData.is_client_admin !== 1) {
                    // Non-admin CLIENT users go to their first menu item (Students)
                    navigate("/students")
                } else {
                    // Admin users and institutes go to dashboard
                    navigate("/dashboard")
                }
            })
            .catch((e) => {
                message.error(e.message)
                util.hideLoader()
            })
            .finally(() => {
                if (isMount.current) {
                    //setLoading(false);
                    util.hideLoader()
                }
            })
    }, [navigate])

    const getIPData = async () => {
        const resp = await Auth.getIPData()
        setIPData(resp)
    }

    useEffect(() => {
        // Prevent multiple redirects
        if (hasRedirected) {
            console.log('Already redirected, skipping useEffect')
            return
        }

        console.log('Login useEffect - loginKey:', loginKey, 'isLogged:', util.isLogged(), 'isLoginPage:', isLoginPage, 'pathname:', window.location.pathname)

        if (loginKey) {
            console.log('Auto-login with key')
            login(0, { loginKey })
        } else {
            if (util.isLogged()) {
                console.log('User already logged in, checking user type for redirect')
                setHasRedirected(true)

                // Check user type and redirect accordingly
                if (util.isStudent()) {
                    navigate("/dashboard")
                } else if (util.isAgent()) {
                    navigate("/students")
                } else if (util.getUserType() === 'CLIENT' && util.isAdmin() !== 1 && util.isClientAdmin() !== 1) {
                    // Non-admin CLIENT users go to their first menu item (Students)
                    navigate("/students")
                } else {
                    // Admin users and institutes go to dashboard
                    navigate("/dashboard")
                }
                return // Important: return early to prevent further execution
            }

            // Only redirect to applynow if we're NOT on a login-related page
            if (isStudentDomain && !isLoginPage) {
                console.log('Student domain, not on login page, redirecting to applynow')
                setHasRedirected(true)
                navigate("/applynow")
                return
            }
        }

        // Only fetch IP data if we're staying on this page
        if (isStudentDomain && !loginKey && !util.isLogged()) {
            getIPData()
        }

        return () => {
            isMount.current = false
        }
    }, [login, loginKey, navigate, isLoginPage, isStudentDomain, hasRedirected]) // Add all dependencies

    return (
        <div className="login parent h-100 login-bg">
            <div className="text-center pt30">
                <a href="http://localhost:5173/">
                    <img
                        src={logo || "theme/img/sis-logo.png"}
                        width="200"
                        height="80"
                        style={{ objectFit: 'contain' }}
                        alt="Return to Landing Page"
                    />
                </a>
            </div>
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
                {/* Debug indicator */}
                {/* {loginBackground && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        zIndex: 1000
                    }}>
                        Custom Background Active
                    </div>
                )} */}
                <div className="container">
                    <div className="login-box">
                        <div className="login-content round-input">
                            <h3 className="heading">
                                {isStudentDomain
                                    ? "Student"
                                    : isInstituteDomain
                                        ? "Institute"
                                        : isAgentDomain
                                            ? "Agent"
                                            : "Admin"}{" "}
                                Login
                            </h3>

                            <form onSubmit={login} autoComplete="off" spellCheck="false">
                                <div className="form-group pt20">
                                    <Input
                                        size="large"
                                        placeholder="Email/Username"
                                        prefix={<UserOutlined className="site-form-item-icon" />}
                                        autoFocus
                                        value={values.username || ""}
                                        onChange={(e) =>
                                            setValues({ ...values, username: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <Input.Password
                                        size="large"
                                        placeholder="Password"
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        iconRender={(visible) =>
                                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                        }
                                        value={values.password || ""}
                                        onChange={(e) =>
                                            setValues({ ...values, password: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-actions pt5">
                                    {/* <Button type="danger" block loading={loading} htmlType="submit">Login</Button> */}

                                    <button type="submit" className="d-none"></button>
                                    <div
                                        className="pill-btn active fs16 pt10 pb10"
                                        onClick={login}
                                        style={{
                                            background: "linear-gradient(88deg, #009297, #3bc6cd)",
                                        }}
                                    >
                                        Login
                                    </div>
                                </div>
                            </form>

                            {(isStudentDomain || isInstituteDomain) && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                    {/* Register Section */}
                                    <div className="text-center text-gray-700 text-base">
                                        Not Registered Yet?{" "}
                                        <Link
                                            to={isStudentDomain ? "/applynow" : "/partnership"}
                                            className="font-medium text-[#009297] hover:underline hover:text-[#00666a]"
                                        >
                                            Click here to Register
                                        </Link>
                                    </div>
                                     {/* Forgot Password */}
                                    <div className="text-center sm:text-right ">
                                        <Link
                                            to={`/forgot-password?from=${encodeURIComponent(window.location.pathname)}`}
                                            className="text-[#009297] font-medium hover:underline hover:text-[#00666a]"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {isAgentDomain && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                    {/* Register Section */}
                                    <div className="text-center text-gray-700 text-base">
                                        Not Registered Yet?{" "}
                                        <a
                                            href="/agents/registration"
                                            rel="noopener noreferrer"
                                            className="text-[#009297] font-medium hover:underline hover:text-[#00666a]"
                                        >
                                            Click here to Register
                                        </a>
                                    </div>
                                    {/* Forgot Password */}
                                    <div className="text-center sm:text-right">
                                        <Link
                                            to={`/forgot-password?from=${encodeURIComponent(window.location.pathname)}`}
                                            className="text-[#009297] font-medium hover:underline hover:text-[#00666a]"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <EmailVerifyOtp refOb={otpModalRef} />
        </div>
    )
}
