/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import StudentService from "../../services/StudentService";
import CmasterService from "../../services/CmasterService";
import AuthService from "../../services/AuthService";
import util from "../../utils/util";
import { AntdSelect } from "../../utils/Antd";
import EmailVerifyOtp from "./EmailVerifyOtp";
import backgroundEvents from "../../utils/backgroundEvents";
import { useDynamicLogo } from "../../hooks/useDynamicLogo";
import { message, Modal, Input, Checkbox, Popover } from "antd";

// let $ = window.$;

export default function Registration() {
  const { search } = useLocation();
  const { agent_uid } = useParams();
  const navigate = useNavigate();

  // const [genders, setGenders] = useState([]);
  const [countries, setCountries] = useState([]);
  const [acadCareers, setAcadCareers] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [data, setData] = useState({
    privacy_check: true, // mandatory checkbox
    updates_check: true, // mandatory checkbox
    // other fields...
  });

  const [ipData, setIPData] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPasswordTip, setShowPasswordTip] = useState(false);
  const [agentInfo, setAgentInfo] = useState(null);

  const [registrationBackground, setRegistrationBackground] = useState(null);

  // Use dynamic logo hook
  const logo = useDynamicLogo();

  const otpModalRef = useRef({});
  // Add this near your other state declarations

  // Add this effect to fetch the registration background
  useEffect(() => {
    const fetchRegistrationBackground = async () => {
      try {
        const response = await CmasterService.getActiveBackground('Registration Background');
        if (response.data?.success && response.data.data?.file_url) {
          setRegistrationBackground(response.data.data.file_url);
        }
      } catch (error) {
        console.error('Error fetching registration background:', error);
      }
    };

    fetchRegistrationBackground();

    // Listen for background updates
    const handleBackgroundUpdate = () => {
      console.log('Registration background update event received, fetching new background...');
      fetchRegistrationBackground();
    };

    // Listen for storage events (when background is updated from admin panel)
    window.addEventListener('storage', handleBackgroundUpdate);

    // Also listen for custom events (for same-tab updates)
    window.addEventListener('backgroundUpdated', handleBackgroundUpdate);

    // Subscribe to background events
    const unsubscribe = backgroundEvents.subscribe((type) => {
      console.log('Registration background event received for type:', type);
      if (type === 'REGISTRATION') {
        fetchRegistrationBackground();
      }
    });

    return () => {
      window.removeEventListener('storage', handleBackgroundUpdate);
      window.removeEventListener('backgroundUpdated', handleBackgroundUpdate);
      unsubscribe();
    };
  }, []);
  const handleChange = (v, k) => {
    data[k] = v;
    setData({ ...data });

    // Clear error on input change
    if (errors[k]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[k];
        return newErr;
      });
    }
  };

  // Handle country change and auto-fill country code
  const handleCountryChange = (countryId) => {
    handleChange(countryId, "country_id");

    const selectedCountry = countries.find((c) => c.id === countryId);
    if (selectedCountry) {
      handleChange(selectedCountry.id, "isd_code_country_id");
    }
  };

  const register = () => {
    let currentErrors = {};

    // Check if both checkboxes are checked
    if (!data.privacy_check || !data.updates_check) {
      message.error('Please accept both the privacy policy and updates agreement to continue');
      return;
    }

    // Validate full_name is entered
    if (!data.full_name || data.full_name.trim() === "") {
      currentErrors.full_name = "Full name is required";
    }

    // Validate country
    if (!data.country_id) {
      currentErrors.country_id = "Country is required";
    }

    // Validate country code
    if (!data.isd_code_country_id) {
      currentErrors.isd_code_country_id = "Country code is required";
    }

    // Validate mobile
    if (!data.mobile || data.mobile.trim() === "") {
      currentErrors.mobile = "Mobile number is required";
    } else if (!/^\d+$/.test(data.mobile.replace(/\D/g, ""))) {
      currentErrors.mobile = "Mobile number must contain only digits";
    }

    // Validate email
    if (!data.email || data.email.trim() === "") {
      currentErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      currentErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!data.password || data.password.trim() === "") {
      currentErrors.password = "Password is required";
    } else {
      // Password validation regex:
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
      if (!passwordRegex.test(data.password)) {
        currentErrors.password =
          "Password should be at least 8 characters and include uppercase, lowercase, and a special character.";
      }
    }

    // Validate confirm password
    if (!data.cpassword || data.cpassword.trim() === "") {
      currentErrors.cpassword = "Confirm password is required";
    } else if (data.password !== data.cpassword) {
      currentErrors.cpassword = "Password and confirm password do not match";
    }

    // Validate academic career
    if (!data.ac_id) {
      currentErrors.ac_id = "Academic career is required";
    }

    // Validate discipline
    if (!data.discipline_id) {
      currentErrors.discipline_id = "Discipline is required";
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      // Show first error message
      const firstError = Object.values(currentErrors)[0];
      message.error(firstError);
      return;
    }

    message.destroy();
    util.showLoader();

    // Split full_name into first_name and last_name here before sending
    const nameParts = data.full_name.trim().split(" ");
    data.fname = nameParts[0];
    data.lname = nameParts.slice(1).join(" ") || "";
    data.utm = search;
    data.agent_uid = agent_uid || null;
    data.ipdata = null;

    // Debug: Log utm and agent_uid to verify both are captured
    console.log('Registration Data - UTM:', data.utm, 'Agent UID:', data.agent_uid);

    if (ipData) {
      data.ipdata = {
        ip: ipData.ip,
        city: ipData.city,
        region_code: ipData.region_code,
        region: ipData.region,
        country_code: ipData.country_code,
        country_name: ipData.country_name,
      };
    }

    // Clean mobile number: digits only, without country code prefix
    data.mobile = (data.mobile || "").replace(/\D/g, "");

    StudentService.register(data)
      .then((res) => {
        message.success(res.data.message || "Registered");

        const createdStudentId = Number(
          res?.data?.result?.dtl?.id ||
          res?.data?.result?.dtl?.student_id ||
          res?.data?.result?.id ||
          res?.data?.result?.student_id ||
          res?.data?.student_id ||
          0
        ) || null;

        if (createdStudentId || data.email || data.mobile) {
          const assignPayload = createdStudentId
            ? { student_id: createdStudentId }
            : {
              email: data.email || '',
              mobile: data.mobile || '',
            };

          const tryAssign = async (attempt = 1) => {
            try {
              await StudentService.assignByAutomationPublic(assignPayload);
              return;
            } catch (e) {
              if (attempt >= 4) return;
              const delayMs = attempt * 800;
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              return tryAssign(attempt + 1);
            }
          };

          Promise.resolve(tryAssign()).catch(() => null);
        }

        // Only send/open OTP if second checkbox is checked
        // if (data.updates_check) {
        //   otpModalRef.current.open({
        //     isd_code_country_id: data.isd_code_country_id,
        //     mobile: data.mobile,
        //     email: data.email,
        //     whatsapp_also: "Y",
        //   });
        // } else {
        //   // If student didn’t select updates, do NOT send OTP
        //   message.info("Registered successfully. OTP not required.");
        // }
        if (data.privacy_check && data.updates_check) {
          otpModalRef.current.open({
            isd_code_country_id: data.isd_code_country_id,
            mobile: data.mobile,
            email: data.email,
            whatsapp_also: "Y",
          });
        } else {
          message.info("Registered successfully. OTP not required.");
        }
      })
      .catch((e) => {
        message.error(e.message);
      })
      .finally(() => {
        util.hideLoader();
      });
  };

  const getIPData = async () => {
    const resp = await AuthService.getIPData();
    setIPData(resp);
  };

  useEffect(() => {
    // CmasterService.genders({ status: 1 }).then(res => setGenders(res.data.result.data));
    CmasterService.allCountries({ status: 1 }).then((res) =>
      setCountries(res.data.result.data)
    );
    CmasterService.acadCareers({ status: 1 }).then((res) =>
      setAcadCareers(res.data.result.data)
    );
    CmasterService.allDisciplines({ status: 1 }).then((res) =>
      setDisciplines(res.data.result.data)
    );
    getIPData();

    // Verify agent link if agent_uid is present
    if (agent_uid) {
      console.log('Agent UID from URL:', agent_uid);
      // You can add an API call here to verify the agent link and get agent details
      // This would help show agent information on the registration page
    }
  }, []);

  const isPasswordInvalid = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    return !passwordRegex.test(password || "");
  };
  return (
    <div
      className="h-100 cscroll round-input"
      style={{ position: "fixed", left: 0, right: 0, top: 0, bottom: 0 }}
    >
      <div
        className="text-white p8"
        style={{ background: "var(--theme-green-dark)" }}
      >
        <div className="container">
          <div className="d-flex align-items-center fs13">
            <div className="pr20">
              <img
                src={logo || "theme/img/sis-logo.png"}
                width="150"
                height="50"
                style={{ objectFit: 'contain' }}
                alt=""
              />
            </div>
            <div className="pr3 font-green1">
              <i className="fa fa-envelope"></i>
            </div>
            <div className="pr30">info@studyuaescholarship.com</div>
            <div className="ml-auto">
              <div className="d-flex">
                <div className="pr3 font-green1">
                  <i className="fa fa-user-circle"></i>
                </div>
                <div
                  className="cpointer"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Student Login
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div style={{ background: 'var(--theme-green-dark)' }}>
                <div className="container">
                    <div className="fs22 text-white pt15 pb15">Student Registration Form</div>
                </div>
            </div> */}

      <div className="relative h-[93vh] w-full max-w-full overflow-hidden">
        {/* Background Image */}
        <img
          src={require("../../img/hero1.jpg")}
          alt="Background"
          className="absolute top-0 left-0 w-full h-[95vh] object-cover z-[1] brightness-[0.75]"
        />

        {/* Form Container */}
        <div className="relative h-[93vh] w-full max-w-full overflow-hidden">
          {/* Background Image */}
          <img
            src={registrationBackground || require("../../img/hero1.jpg")}
            alt="Background"
            className="absolute top-0 left-0 w-full h-full object-cover z-[1] brightness-[0.75]"
          />

          {/* Responsive Form Wrapper */}
          <div className="relative z-[2] h-full w-full flex items-center justify-center lg:justify-end px-4">
            <div className="w-[90vw] max-w-[450px] bg-white/90 rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.3)] lg:mr-10">
              <div className="text-[20px] md:text-[22px] text-black font-semibold text-center mb-4">
                Student Registration Form
              </div>

              {/* Agent Link Indicator */}
              {agent_uid && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <p className="text-sm text-blue-800 font-medium mb-0">
                      Registering through agent referral link
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <Input
                    size="middle"
                    placeholder="Full Name"
                    value={data.full_name || ""}
                    onChange={(e) => handleChange(e.target.value, "full_name")}
                    status={errors.full_name ? "error" : ""}
                    className="placeholder-gray-500 w-full"
                  />
                  {errors.full_name && (
                    <div className="text-red-600 text-xs mt-1">{errors.full_name}</div>
                  )}
                </div>

                {/* Country */}
                <div className=" form-container md:col-span-2">
                  <AntdSelect
                    size="middle"
                    placeholder="--Country--"
                    showSearch
                    options={countries.map((v) => ({ id: v.id, name: v.name }))}
                    value={data.country_id}
                    onChange={handleCountryChange}
                    className="placeholder-gray-500 w-full"
                    status={errors.country_id ? "error" : ""}
                  />
                  {errors.country_id && (
                    <div className="text-red-600 text-xs mt-1">{errors.country_id}</div>
                  )}
                </div>

                {/* Mobile */}
                <div className=" md:col-span-2 flex h-[30px] focus-within:ring-1 focus-within:ring-[#009297] focus-within:rounded-full transition-all border border-gray-300 rounded-full hover:ring-1 hover:ring-[#009297]">
                  <input
                    type="text"
                    value={
                      countries.find((c) => c.id === data.country_id)?.isd_code || "+"
                    }
                    readOnly
                    className=" w-12 bg-gray-100 px-2 py-2 text-center text-sm placeholder-gray-500 border-none rounded-l-full focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Mobile No."
                    value={data.mobile || ""}
                    onChange={(e) => handleChange(e.target.value, "mobile")}
                    maxLength={15}
                    className=" text-[15.4px]  flex-1 px-2 py-2 text-sm placeholder-gray-500 border-none rounded-r-full focus:outline-none"
                    style={{
                      borderColor: errors.mobile ? "#ff4d4f" : undefined,
                    }}
                  />
                </div>
                {errors.mobile && (
                  <div className="text-red-600 text-xs mt-1 md:col-span-2">{errors.mobile}</div>
                )}

                {/* Email */}
                <div className="md:col-span-2">
                  <Input
                    size="middle"
                    placeholder="Email"
                    value={data.email || ""}
                    onChange={(e) => handleChange(e.target.value, "email")}
                    className="placeholder-gray-500 w-full"
                    status={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <div className="text-red-600 text-xs mt-1">{errors.email}</div>
                  )}
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <Popover
                    content={
                      <ul className="text-xs w-[260px] list-disc pl-4">
                        <li
                          style={{
                            color: /[A-Z]/.test(data.password || "") ? "green" : errors.password ? "red" : "#555",
                          }}
                        >
                          One uppercase letter
                        </li>
                        <li
                          style={{
                            color: /[a-z]/.test(data.password || "") ? "green" : errors.password ? "red" : "#555",
                          }}
                        >
                          One lowercase letter
                        </li>
                        <li
                          style={{
                            color: /\W/.test(data.password || "") ? "green" : errors.password ? "red" : "#555",
                          }}
                        >
                          One special character
                        </li>
                        <li
                          style={{
                            color: (data.password || "").length >= 8 ? "green" : errors.password ? "red" : "#555",
                          }}
                        >
                          At least 8 characters
                        </li>
                      </ul>
                    }
                    open={showPasswordTip}
                    placement="top"  // Changed from "top" to "left"
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  >
                    <Input
                      size="middle"
                      type="password"
                      placeholder="Password"
                      value={data.password || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChange(val, "password");

                        const invalid = isPasswordInvalid(val);
                        setShowPasswordTip(invalid);

                        if (!invalid && errors.password) {
                          setErrors((prev) => {
                            const newErr = { ...prev };
                            delete newErr.password;
                            return newErr;
                          });
                        }
                      }}
                      maxLength={20}
                      status={errors.password ? "error" : ""}
                      className="placeholder-gray-500 w-full"
                      onFocus={() => {
                        if (isPasswordInvalid(data.password)) {
                          setShowPasswordTip(true);
                        }
                      }}
                      onBlur={() => setShowPasswordTip(false)}
                    />
                  </Popover>
                  {errors.password && (
                    <div className="text-red-600 text-xs mt-1">{errors.password}</div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="md:col-span-2">
                  <Input
                    size="middle"
                    type="password"
                    placeholder="Confirm Password"
                    value={data.cpassword || ""}
                    onChange={(e) => handleChange(e.target.value, "cpassword")}
                    maxLength={20}
                    className="placeholder-gray-500 w-full"
                    status={errors.cpassword ? "error" : ""}
                  />
                  {errors.cpassword && (
                    <div className="text-red-600 text-xs mt-1">{errors.cpassword}</div>
                  )}
                </div>
              </div>

              <h4 className="mt-3 mb-1 font-medium text-sm text-gray-700">
                Course of Interest
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className=" form-container md:col-span-2">
                  <AntdSelect
                    size="middle"
                    placeholder="--Career--"
                    showSearch
                    options={acadCareers.map((v) => ({ id: v.id, name: v.name }))}
                    value={data.ac_id}
                    onChange={(v) => handleChange(v, "ac_id")}
                    className="placeholder-black w-full"
                    status={errors.ac_id ? "error" : ""}
                  />
                  {errors.ac_id && (
                    <div className="text-red-600 text-xs mt-1">{errors.ac_id}</div>
                  )}
                </div>
                <div className=" form-container md:col-span-2">
                  <AntdSelect
                    size="middle"
                    placeholder="--Discipline--"
                    showSearch
                    options={disciplines.map((v) => ({ id: v.id, name: v.name }))}
                    value={data.discipline_id}
                    onChange={(v) => {
                      data.specialization_id = null;
                      handleChange(v, "discipline_id");
                    }}
                    className="placeholder-black w-full"
                    status={errors.discipline_id ? "error" : ""}
                  />
                  {errors.discipline_id && (
                    <div className="text-red-600 text-xs mt-1">{errors.discipline_id}</div>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start mt-3 text-xs text-secondary">
                <Checkbox
                  checked={data.privacy_check}
                  onChange={(e) => setData({ ...data, privacy_check: e.target.checked })}
                  className="mt-1"
                />
                <p className="ml-2 mb-0">
                  I accept the{" "}
                  <a href="/applynow" className="underline">
                    privacy policy
                  </a>
                  and would like to receive further updates about programme.
                  <span className="text-red-500 ml-1">*</span>
                </p>
              </div>

              <div className="flex items-start mt-3 text-xs text-secondary">
                <Checkbox
                  checked={data.updates_check}
                  onChange={(e) => setData({ ...data, updates_check: e.target.checked })}
                  className="mt-1"
                />
                <p className="ml-2 mb-0">
                  I would like to receive updates, reminders and notifications on my contact number.
                  <span className="text-red-500 ml-1">*</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap mt-4 items-center justify-between">
                <button
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white w-36 text-base py-1.5 mb-2"
                  onClick={register}
                >
                  Register
                </button>
                <p className="text-sm">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="underline cursor-pointer text-blue-400"
                  >
                    Login
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmailVerifyOtp refOb={otpModalRef} />
    </div>
  );
}
