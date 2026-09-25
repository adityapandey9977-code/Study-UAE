/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import StudentService from "../../services/StudentService";
import CmasterService from "../../services/CmasterService";
import FileService from "../../services/FileService";
import util from "../../utils/util";
import { AntdSelect, AntdDatepicker } from "../../utils/Antd";
import moment from "moment";
import MobileVerifyOtp from "./MobileVerifyOtp";
import EmailVerifyOtp from "./EmailVerifyOtp";
import ChoiceFilling from "./ChoiceFilling";

import {
  Button,
  message,
  Modal,
  Tabs,
  Input,
  Divider,
  Alert,
  Image,
  Radio,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
const { confirm } = Modal;

const $ = window.$;

const nodeOrigin = (() => {
  try {
    return new URL(util.apiUrlNode).origin;
  } catch (e) {
    return "";
  }
})();

const resolveUploadsUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
  if (rawUrl.startsWith("blob:")) return rawUrl;

  try {
    const parsed = new URL(rawUrl);
    // If it's already a full URL (PHP or Node), return as-is
    return rawUrl;
  } catch (e) {
    // If it's a relative path, prepend the Node origin
    if (nodeOrigin && (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/"))) {
      const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
      return `${nodeOrigin}${path}`;
    }
    return rawUrl;
  }
};

export default function StuForm(props) {
  const { cref } = props;
  const [isModalVisible, setModalVisible] = useState(false);
  const [stuDtl, setStuDtl] = useState({});

  const closeModal = () => {
    setModalVisible(false);
  };

  const getStuDtl = (id) => {
    util.showLoader();
    StudentService.detail(id)
      .then((res) => {
        setStuDtl(res.data.result || {});
      })
      .catch((e) => {
        message.error(e.message);
      })
      .finally(() => {
        util.hideLoader();
      });
  };

  cref.current = {
    ...cref.current,
    openStuForm: (id) => {
      setModalVisible(true);
      if (id) {
        getStuDtl(id);
      } else {
        setStuDtl({});
      }
    },
  };

  useEffect(() => {
    if (util.isStudent()) {
      getStuDtl();
    }
  }, []);

  return (
    <>
      {util.isStudent() === 1 ? (
        <Form
          cref={cref}
          stuDtl={stuDtl}
          setStuDtl={setStuDtl}
          getStuDtl={getStuDtl}
        />
      ) : (
        <Modal
          title={stuDtl.id ? "View Student" : "Add Student"}
          visible={isModalVisible}
          onCancel={closeModal}
          destroyOnClose
          maskClosable={false}
          width={1300}
          footer={null}
          bodyStyle={{ paddingTop: 0 }}
          style={{ top: 50 }}
        >
          <div>
            <Form
              cref={cref}
              stuDtl={stuDtl}
              setStuDtl={setStuDtl}
              getStuDtl={getStuDtl}
            />
          </div>
        </Modal>
      )}
    </>
  );
}

function Form(props) {
  const { cref, stuDtl, setStuDtl } = props;
  const { step } = useParams();
  const [countries, setCountries] = useState([]);
  const [acadCareers, setAcadCareers] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  //const [specializations, setSpecializations]=useState([]);
  const [genders, setGenders] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  const [activeTab, setActiveTab] = useState(step || "1");
  const changeTab = (tab) => {
    // Prevent navigation to other tabs if mobile is not verified
    if (util.isStudent() === 1 && Number(stuDtl.mobile_verified) !== 1 && tab !== "1") {
      message.warning("Please verify your mobile number first before proceeding to other sections.");
      return;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    CmasterService.allCountries({ status: 1 }).then((res) =>
      setCountries(res.data.result.data)
    );
    CmasterService.acadCareers({ status: 1 }).then((res) =>
      setAcadCareers(res.data.result.data)
    );
    CmasterService.allDisciplines({ status: 1 }).then((res) =>
      setDisciplines(res.data.result.data)
    );
    //CmasterService.allSpecializations({status:1}).then(res=>setSpecializations(res.data.result.data));
    CmasterService.genders({ status: 1 }).then((res) =>
      setGenders(res.data.result.data)
    );
    CmasterService.allEduQualifications({ status: 1 }).then((res) =>
      setQualifications(res.data.result.data)
    );
  }, []);

  useEffect(() => { }, [stuDtl]);

  let contentHeight = util.isStudent() ? null : $(window).height() - 220;

  return (
    <Tabs activeKey={activeTab} onChange={changeTab} destroyInactiveTabPane>
      <Tabs.TabPane
        tab={
          <div className="text-center">
            <div
              className={"pill-btn mb5 " + (activeTab === "1" ? "active" : "")}
            >
              <i className="fa fa-address-card mr2"></i> Basic Information
            </div>
            {stuDtl.basic_info_date ? (
              <div className="fs11 font-green-jungle">
                <i className="fa fa-check-circle"></i> Completed
              </div>
            ) : (
              <div className="fs11 font-red">Pending</div>
            )}
          </div>
        }
        key="1"
      >
        <BasicInfoForm
          {...{
            cref,
            contentHeight,
            countries,
            acadCareers,
            disciplines,
            genders,
            stuDtl,
            setStuDtl,
            changeTab,
          }}
        />
      </Tabs.TabPane>

      <Tabs.TabPane
        tab={
          <div className="text-center">
            <div
              className={
                "pill-btn mb5 " +
                (activeTab === "2"
                  ? "active"
                  : util.isStudent() === 1 && Number(stuDtl.mobile_verified) !== 1
                  ? "disabled"
                  : "")
              }
            >
              <i className="fa fa-university mr2"></i> Educational
              Info/Documents
            </div>
            {stuDtl.edu_info_date ? (
              <div className="fs11 font-green-jungle">
                <i className="fa fa-check-circle"></i> Completed
              </div>
            ) : (
              <div className="fs11 font-red">
                {util.isStudent() === 1 && Number(stuDtl.mobile_verified) !== 1 ? "Mobile verification required" : "Pending"}
              </div>
            )}
          </div>
        }
        key="2"
      >
        <EduInfoForm
          {...{
            cref,
            contentHeight,
            qualifications,
            stuDtl,
            setStuDtl,
            changeTab,
          }}
        />
      </Tabs.TabPane>

      <Tabs.TabPane
        tab={
          <div className="text-center">
            <div
              className={
                "pill-btn mb5 " +
                (activeTab === "3"
                  ? "active"
                  : util.isStudent() === 1 && Number(stuDtl.mobile_verified) !== 1
                  ? "disabled"
                  : "")
              }
            >
              <i className="fa fa-newspaper mr2"></i> Background Information
            </div>
            {stuDtl.background_info_date ? (
              <div className="fs11 font-green-jungle">
                <i className="fa fa-check-circle"></i> Completed
              </div>
            ) : (
              <div className="fs11 font-red">
                {util.isStudent() === 1 && Number(stuDtl.mobile_verified) !== 1 ? "Mobile verification required" : "Pending"}
              </div>
            )}
          </div>
        }
        key="3"
      >
        <BackgrounfInfoForm
          {...{ cref, contentHeight, countries, stuDtl, setStuDtl, changeTab }}
        />
      </Tabs.TabPane>

      <Tabs.TabPane
        tab={
          <div className="text-center">
            <div
              className={
                "pill-btn mb5 " +
                (activeTab === "4"
                  ? "active"
                  : util.isStudent() === 1 && Number(stuDtl.mobile_verified) !== 1
                  ? "disabled"
                  : "")
              }
            >
              <i className="fa fa-hand-pointer mr2"></i> Student Choice Fill
            </div>
            {stuDtl.course_choice_date ? (
              <div className="fs11 font-green-jungle">
                <i className="fa fa-check-circle"></i> Completed
              </div>
            ) : (
              <div className="fs11 font-red">
                {util.isStudent() === 1 && Number(stuDtl.mobile_verified) !== 1 ? "Mobile verification required" : "Pending"}
              </div>
            )}
          </div>
        }
        key="4"
      >
        {util.isStudent() === 1 ? (
          <StuChoiceForm {...{ cref, contentHeight, stuDtl, setStuDtl }} />
        ) : (
          <div className="cscroll" style={{ height: contentHeight }}>
            <Alert
              message="Course selection is available only for students."
              type="info"
              showIcon={false}
              action={
                <Button
                  size="small"
                  type="primary"
                  onClick={() => cref?.current?.openAppliedCourses?.(stuDtl)}
                  disabled={!cref?.current?.openAppliedCourses || !stuDtl?.id}
                >
                  View Selected Courses
                </Button>
              }
            />
          </div>
        )}

      </Tabs.TabPane>
    </Tabs>
  );
}

function BasicInfoForm(props) {
  const { cref, contentHeight, stuDtl, setStuDtl, changeTab } = props;
  const [countries, setCountries] = useState([]);
  const [acadCareers, setAcadCareers] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [genders, setGenders] = useState([]);
  let [data, setData] = useState({});
  const otpModalRef = useRef({});
  const otpModalRefEmail = useRef({});
  const modules = util.getModules();

  const resolveMasterSessionId = () => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const urlSessionId = qs.get("master_session_id");
      if (urlSessionId) {
        const parsed = parseInt(urlSessionId, 10);
        if (parsed) return parsed;
      }
    } catch (e) {
      // ignore
    }

    try {
      const raw = localStorage.getItem("selectedSession");
      const selected = raw ? JSON.parse(raw) : null;
      if (selected && selected.key) return selected.key;
      if (selected && selected.id) return selected.id;
    } catch (e) {
      // ignore
    }

    return null;
  };

  const handleChange = (v, k) => {
    if (k === "country_id") {
      // When Country changes → also set ISD code
      const selected = countries.find((c) => c.id === v);
      if (selected) {
        data.isd_code_country_id = selected.id;
      }
    }

    data[k] = v;
    setData({ ...data });
  };

  const save = () => {
    message.destroy();
    util.showLoader();
    if (data.master_session_id) {
      data.master_session_id = String(data.master_session_id);
    } else {
      const masterSessionId = resolveMasterSessionId();
      if (masterSessionId) {
        data.master_session_id = String(masterSessionId);
      }
    }
    StudentService.saveBasicInfo(data)
      .then((res) => {
        message.success(res.data.message || "Registered");
        setStuDtl(res.data.result.dtl);

        const createdStudentId = Number(res?.data?.result?.dtl?.id || res?.data?.result?.dtl?.student_id || 0) || null;
        if (!data.id && createdStudentId) {
          Promise.resolve(StudentService.assignByAutomation({ student_id: createdStudentId }))
            .catch(() => null);
        }

        if (!data.id) {
          cref.current.getStudentsList(1);
        } else {
          if (cref.current.updateRow) {
            cref.current.updateRow(res.data.result.rowDtl);
          }
        }
        changeTab("2");
      })
      .catch((e) => {
        message.error(e.message);
      })
      .finally(() => {
        util.hideLoader();
      });
  };

  const sendWhatsappOtp = () => {
    otpModalRef.current.open({
      isd_code_country_id: data.isd_code_country_id,
      mobile: data.mobile,
    });
  };

  const sendEmailOtp = () => {
    otpModalRefEmail.current.open({ email: data.email }, true);
  };

  const setMobileVerified = () => {
    for (let k in data) {
      stuDtl[k] = data[k];
    }
    setStuDtl({
      ...stuDtl,
      mobile_verified: 1,
      isd_code_country_id: data.isd_code_country_id,
      mobile: data.mobile,
    });
  };

  const setEmailVerified = () => {
    for (let k in data) {
      stuDtl[k] = data[k];
    }
    setStuDtl({ ...stuDtl, email_verified: 1, email: data.email });
  };

  useEffect(() => {
    setCountries(props.countries);
  }, [props.countries]);

  useEffect(() => {
    setAcadCareers(props.acadCareers);
  }, [props.acadCareers]);

  useEffect(() => {
    setDisciplines(props.disciplines);
  }, [props.disciplines]);

  useEffect(() => {
    setGenders(props.genders);
  }, [props.genders]);

  useEffect(() => {
    const {
      id,
      user_id,
      fname,
      lname,
      email,
      country_id,
      isd_code_country_id,
      mobile,
      gender_id,
      dob,
      father_name,
      mother_name,
      resident_country_id,
      resident_address,
      resident_state,
      resident_city,
      discipline_id,
      ac_id,
    } = stuDtl;
    setData({
      id,
      user_id,
      fname,
      lname,
      email,
      country_id,
      isd_code_country_id,
      mobile,
      gender_id,
      dob,
      father_name,
      mother_name,
      resident_country_id: resident_country_id || null, // ✅ independent
      resident_address,
      resident_state,
      resident_city,
      discipline_id,
      ac_id,
    });
  }, [stuDtl]);

  return (
    <div className="cscroll pr10" style={{ height: contentHeight }}>
      <div style={{ overflow: "hidden" }}>
        <div className="row mingap">
          <div className="col-md-4 form-group">
            <label className="req">First Name</label>
            <Input
              value={data.fname || ""}
              onChange={(e) => handleChange(e.target.value, "fname")}
            />
          </div>
          <div className="col-md-4 form-group">
            <label className="req">Last Name</label>
            <Input
              value={data.lname || ""}
              onChange={(e) => handleChange(e.target.value, "lname")}
            />
          </div>
          <div className="col-md-4 form-group">
            <label className="req">Email</label>
            <Input
              value={data.email || ""}
              onChange={(e) => handleChange(e.target.value, "email")}
              disabled={stuDtl.email_verified === 1}
              suffix={
                stuDtl.email_verified === 1 ? (
                  <i className="fa fa-check-circle font-green-jungle"></i>
                ) : (
                  <div>
                    {util.isStudent() === 1 && (
                      <button
                        type="button"
                        className="btn green !h-[22px] !py-[2px] !leading-[8px]"
                        onClick={sendEmailOtp}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                )
              }
            />
          </div>

          <div className="col-md-4 form-group">
            <label className="req">Gender</label>
            <div>
              <AntdSelect
                showSearch
                options={genders.map((v) => ({ id: v.id, name: v.name }))}
                value={data.gender_id}
                onChange={(v) => handleChange(v, "gender_id")}
              />
            </div>
          </div>

          <div className="col-md-4 form-group">
            <label className="req">Date of Birth</label>
            <div>
              <AntdDatepicker
                value={data.dob}
                onChange={(dt) => handleChange(dt, "dob")}
                disabledDate={(current) =>
                  current && current > moment().subtract(0, "days").endOf("day")
                }
              />
            </div>
          </div>

          {/* Country drives Country Code */}
          <div className="col-md-4 form-group">
            <label className="req">Country</label>
            <div>
              <AntdSelect
                showSearch
                options={countries.map((v) => ({
                  id: v.id,
                  name: v.name,
                }))}
                value={data.country_id}
                onChange={(v) => handleChange(v, "country_id")}
              />
            </div>
          </div>

          <div className="col-md-4 form-group">
            <label className="req">Father Name</label>
            <Input
              value={data.father_name || ""}
              onChange={(e) => handleChange(e.target.value, "father_name")}
            />
          </div>

          <div className="col-md-4 form-group">
            <label className="req">Mother Name</label>
            <Input
              value={data.mother_name || ""}
              onChange={(e) => handleChange(e.target.value, "mother_name")}
            />
          </div>
        </div>

        <Divider orientation="left">Course of Interest</Divider>
        <div className="row mingap">
          <div className="col-md-4 form-group">
            <label className="req">Academic Career</label>
            <div>
              <AntdSelect
                showSearch
                options={acadCareers.map((v) => ({
                  id: v.id,
                  name: v.name,
                }))}
                value={data.ac_id}
                onChange={(v) => handleChange(v, "ac_id")}
              />
            </div>
          </div>

          <div className="col-md-4 form-group">
            <label className="req">Discipline</label>
            <div>
              <AntdSelect
                showSearch
                options={disciplines.map((v) => ({
                  id: v.id,
                  name: v.name,
                }))}
                value={data.discipline_id}
                onChange={(v) => {
                  data.specialization_id = null;
                  handleChange(v, "discipline_id");
                }}
              />
            </div>
          </div>
        </div>

        <Divider orientation="left">Contact Details</Divider>
        <div className="row mingap">
          <div className="col-md-4 form-group">
            <label className="req">Country Code</label>
            <div>
              <AntdSelect
                showSearch
                options={countries.map((v) => ({
                  id: v.id,
                  name: `${v.isd_code} (${v.name})`,
                }))}
                value={data.isd_code_country_id}
                disabled={true} // ✅ depends only on Country
              />
            </div>
          </div>
          <div className="col-md-4 form-group">
            <label className="req">Mobile No. (Whatsapp)</label>
            <div>
              <Input
                value={data.mobile || ""}
                onChange={(e) => handleChange(e.target.value, "mobile")}
                disabled={Number(stuDtl.mobile_verified) === 1}
                maxLength="10"
                suffix={
                  Number(stuDtl.mobile_verified) === 1 ? (
                    <i className="fa fa-check-circle font-green-jungle"></i>
                  ) : null
                }
              />
            </div>
          </div>
          {util.isStudent() === 1 && Number(stuDtl.mobile_verified) !== 1 && (
            <>
              <div className="col-md-4 form-group">
                <label className="">&nbsp;</label>
                <div>
                  <button
                    type="button"
                    className="btn green-jungle"
                    onClick={sendWhatsappOtp}
                  >
                    <i className="fab fa-whatsapp"></i> Verify
                  </button>
                </div>
              </div>
              <div className="col-md-12 form-group">
                <div className="font-red uc bold600 mb5">Instructions :</div>
                If a student has an Indian Number,
                <br />
                <br />
                Country Code: 91
                <br />
                Mobile Number: 98587XXXXX
                <br />
                <br />
                From the Country Code drop-down select: 91(India)
                <br />
                <br />
                In the Contact Number input field, fill your mobile number:
                98587XXXXX
                <br />
                Please do NOT fill 9198587XXXXX (Country Code + Mobile Number)
                in Mobile Number field.
                <br />
              </div>
            </>
          )}
        </div>

        <Divider orientation="left">Resident Details</Divider>
        <div className="row mingap">
          <div className="col-md-12 form-group">
            <label className="req">Address</label>
            <div>
              <Input
                value={data.resident_address || ""}
                onChange={(e) =>
                  handleChange(e.target.value, "resident_address")
                }
              />
            </div>
          </div>
          <div className="col-md-4 form-group">
            <label className="req">Country</label>
            <div>
              <AntdSelect
                showSearch
                options={countries.map((v) => ({
                  id: v.id,
                  name: v.name,
                }))}
                value={data.resident_country_id}
                onChange={(v) => handleChange(v, "resident_country_id")}
              />
            </div>
          </div>
          <div className="col-md-4 form-group">
            <label className="req">State</label>
            <div>
              <Input
                value={data.resident_state || ""}
                onChange={(e) => handleChange(e.target.value, "resident_state")}
              />
            </div>
          </div>
          <div className="col-md-4 form-group">
            <label className="req">City</label>
            <div>
              <Input
                value={data.resident_city || ""}
                onChange={(e) => handleChange(e.target.value, "resident_city")}
              />
            </div>
          </div>
        </div>

        {(modules["add_students"] === 1 ||
          (modules["edit_students"] === 1 && data.id) ||
          util.isStudent() === 1) && (
            <div className="pt10">
              <Button type="primary" size="large" onClick={save}>
                Save &amp; Continue
              </Button>
            </div>
          )}
      </div>

      <MobileVerifyOtp
        refOb={otpModalRef}
        setMobileVerified={setMobileVerified}
        studentId={stuDtl?.id}
        stuName={`${data.fname} ${data.lname}`}
      />
      <EmailVerifyOtp
        refOb={otpModalRefEmail}
        setEmailVerified={setEmailVerified}
        stuName={`${data.fname} ${data.lname}`}
      />
    </div>
  );
}

function EduInfoForm(props) {
  const { cref, contentHeight, qualifications, stuDtl, setStuDtl, changeTab } =
    props;
  const [edu_details, setEduDetails] = useState([]);
  const modules = util.getModules();
  const validateEducationInfo = () => {
    for (let i = 0; i < edu_details.length; i++) {
      const row = edu_details[i];

      // Every qualification should have a result status
      if (!row.result_status) {
        message.warning(`Please select Result Status for "${row.name}"`);
        return false;
      }

      // If Declared, check for year, marks, and file
      if (row.result_status === "Declared") {
        if (!row.passing_year) {
          message.warning(`Please enter Passing Year for "${row.name}"`);
          return false;
        }
        if (!row.marks) {
          message.warning(`Please enter Marks for "${row.name}"`);
          return false;
        }
        if (!row.file_url) {
          message.warning(`Please upload Document for "${row.name}"`);
          return false;
        }
      }
    }
    // Generic rules based on available qualifications:
    // - If 10th, 12th, and Graduation exist (higher careers like UG/PG etc.),
    //   then 10th and 12th must be Declared (Graduation can be Awaited).
    // - If only 10th and 12th exist (Diploma-type), then 10th must be Declared
    //   but 12th may be Awaited.
    const tenthRow = edu_details.find((r) =>
      r.name.includes("Secondary School / Class X")
    );
    const twelfthRow = edu_details.find((r) =>
      r.name.includes("Higher Secondary / Class XII")
    );
    const graduationRow = edu_details.find((r) =>
      r.name.toLowerCase().includes("graduation")
    );

    if (tenthRow || twelfthRow || graduationRow) {
      if (graduationRow) {
        // Careers that include Graduation: require 10th and 12th to be Declared
        if (!tenthRow || tenthRow.result_status !== "Declared") {
          message.warning(
            "Please mark 10th result as 'Declared' before continuing."
          );
          return false;
        }

        if (!twelfthRow || twelfthRow.result_status !== "Declared") {
          message.warning(
            "Please mark 12th result as 'Declared' before continuing."
          );
          return false;
        }
      } else {
        // Only 10th/12th present (Diploma-type): require 10th to be Declared
        if (tenthRow && tenthRow.result_status !== "Declared") {
          message.warning(
            "Please mark 10th result as 'Declared' before continuing."
          );
          return false;
        }
      }
    }

    return true; // All checks passed
  };

  const save = () => {
    message.destroy();
    if (!validateEducationInfo()) {
      return;
    }

    util.showLoader();
    StudentService.saveEducationInfo({ student_id: stuDtl.id, edu_details })
      .then((res) => {
        message.success(res.data.message || "Updated");
        setStuDtl(res.data.result.dtl);
        if (cref.current.updateRow) {
          cref.current.updateRow(res.data.result.rowDtl);
        }
        changeTab("3");
      })
      .catch((e) => {
        message.error(e.message);
      })
      .finally(() => {
        util.hideLoader();
      });
  };

  const uploadDoc = async (e, rw) => {
    if (util.checkImage(e.target, 5)) {
      util.showLoader();
      try {
        let rs = await FileService.upload(e.target.files[0]);
        // Node upload API returns payload under `data.result` (file_id, url, etc.)
        const payload = rs?.data?.result || rs?.data || {};
        rw.file_id = payload.file_id;
        rw.file_url = payload.url || payload.file_url;
        setEduDetails([...edu_details]);
      } catch (e) { }
      e.target.value = "";
      util.hideLoader();
    }
  };

  const verifyDoc = () => {
    message.destroy();
    confirm({
      title: "Are you sure to verify document?",
      icon: <ExclamationCircleOutlined />,
      content: "",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        util.showLoader();
        StudentService.verifyDoc(stuDtl.id)
          .then((res) => {
            message.success(res.data.message || "Verified");
            setStuDtl(res.data.result.dtl);
            if (cref.current.updateRow) {
              cref.current.updateRow(res.data.result.rowDtl);
            }
          })
          .catch((e) => {
            message.error(e.message);
          })
          .finally(() => {
            util.hideLoader();
          });
      },
      onCancel() { },
    });
  };

  useEffect(() => {
    let sq = [];
    let filteredQualifications = qualifications;

    if (stuDtl.ac_id === 4 || stuDtl.ac_id === "4") {
      // PostGraduate: include 10th, 12th, Graduation
      const allowedNames = [
        "Secondary School / Class X / O Level / Equivalent Qualification",
        "Higher Secondary / Class XII / A level / Equivalent Qualification",
        "Graduation",
      ];
      filteredQualifications = qualifications.filter((q) =>
        allowedNames.includes(q.name)
      );
      // console.log("filteredQualifications", filteredQualifications);
    }
    else if (stuDtl.ac_id === 1 || stuDtl.ac_id === "1" || stuDtl.ac_id === 5 || stuDtl.ac_id === "5") {
      // Diploma and UnderGraduate: include only 10th and 12th
      const allowedNames = [
        "Secondary School / Class X / O Level / Equivalent Qualification",
        "Higher Secondary / Class XII / A level / Equivalent Qualification",
      ];
      filteredQualifications = qualifications.filter((q) =>
        allowedNames.includes(q.name)
      );
    }
    else {
      // Other academic careers: include all
      filteredQualifications = [...qualifications];
    }

    // Ensure stable display order for common qualifications (10th -> 12th -> Graduation)
    // while preserving the original API order for other qualifications.
    const orderMap = {
      "Secondary School / Class X / O Level / Equivalent Qualification": 1,
      "Higher Secondary / Class XII / A level / Equivalent Qualification": 2,
      Graduation: 3,
    };
    filteredQualifications = (filteredQualifications || [])
      .map((q, idx) => ({ q, idx }))
      .sort((a, b) => {
        const oa = orderMap[a.q?.name] ?? 999;
        const ob = orderMap[b.q?.name] ?? 999;
        if (oa !== ob) return oa - ob;
        return a.idx - b.idx;
      })
      .map(({ q }) => q);

    // Build edu_details based on filteredQualifications
    filteredQualifications.forEach((v) => {
      let dtl = stuDtl.edu_details?.find((sq) => sq.qualification_id === v.id);
      if (dtl) {
        sq.push({ ...dtl });
      } else {
        sq.push({
          qualification_id: v.id,
          name: v.name,
          passing_year: "",
          marks: "",
        });
      }
    });

    setEduDetails(sq);
  }, [stuDtl.ac_id, stuDtl.edu_details, qualifications]);

  return (
    <div className="cscroll pr10" style={{ height: contentHeight }}>
      {stuDtl.basic_info_date ? (
        <div>
          <div className="table-responsive">
            <table className="table table-bordered table-sm1 table-striped1 table-hover1 m-0">
              <thead className="thead-light text-uppercase table-text-vmid font-md">
                <tr>
                  <th className="w20">SN</th>
                  <th>Qualification</th>
                  <th className="w150">Result Status</th>
                  <th className="w150">Passing Year</th>
                  <th className="w150">Marks</th>
                  <th className="w200">Document (Image Only)</th>
                </tr>
              </thead>
              <tbody className="table-text-top">
                {edu_details
                  .filter((rw) => {
                    if (stuDtl.ac_id === 6 || stuDtl.ac_id === "6") {
                      // Diploma: only show 10th and 12th
                      return (
                        rw.name.includes("Secondary School / Class X") ||
                        rw.name.includes("Higher Secondary / Class XII")
                      );
                    }
                    // For other academic careers, show all
                    return true;
                  })
                  .map((rw, i) => (
                    <tr key={i}>
                      <td>{i + 1}.</td>
                      <td>{rw.name}</td>
                      <td>
                        <AntdSelect
                          allowClear
                          options={["Declared", "Awaited"]}
                          value={rw.result_status}
                          onChange={(v) => {
                            const isTenth = rw.name.includes("Secondary School / Class X");
                            const isTwelfth = rw.name.includes("Higher Secondary / Class XII");

                            // Find 10th and 12th standard entries
                            const tenthIndex = edu_details.findIndex(ed =>
                              ed.name.includes("Secondary School / Class X")
                            );
                            const twelfthIndex = edu_details.findIndex(ed =>
                              ed.name.includes("Higher Secondary / Class XII")
                            );

                            // Rule 1: If 12th is being set to 'Declared', 10th must be 'Declared'
                            if (isTwelfth && v === 'Declared' && tenthIndex !== -1) {
                              const tenthStatus = edu_details[tenthIndex].result_status;
                              if (tenthStatus !== 'Declared') {
                                message.warning('You must declare your 10th result before declaring your 12th result.');
                                return;
                              }
                            }

                            // Rule 2: If 10th is being set to 'Awaited', check 12th is not 'Declared'
                            if (isTenth && v === 'Awaited' && twelfthIndex !== -1) {
                              const twelfthStatus = edu_details[twelfthIndex].result_status;
                              if (twelfthStatus === 'Declared') {
                                message.warning('Cannot mark 10th as \'Awaited\' when 12th is already \'Declared\'');
                                return;
                              }
                            }

                            // Rule 3: If 12th is 'Declared', prevent changing 10th to 'Awaited'
                            if (isTenth && v === 'Awaited' && twelfthIndex !== -1) {
                              const twelfthStatus = edu_details[twelfthIndex].result_status;
                              if (twelfthStatus === 'Declared') {
                                message.warning('Cannot mark 10th as \'Awaited\' when 12th is already \'Declared\'');
                                return;
                              }
                            }

                            // Rule 4: Prevent both from being 'Awaited'
                            if (v === 'Awaited') {
                              const otherIndex = isTenth ? twelfthIndex : tenthIndex;
                              if (otherIndex !== -1 && edu_details[otherIndex].result_status === 'Awaited') {
                                message.warning('10th and 12th results cannot both be marked as \'Awaited\'');
                                return;
                              }
                            }

                            rw.result_status = v;
                            rw.passing_year = "";
                            rw.marks = "";
                            rw.file_url = "";
                            rw.file_id = "";
                            setEduDetails([...edu_details]);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          placeholder="Passing Year"
                          value={rw.passing_year}
                          disabled={rw.result_status !== "Declared"}
                          onChange={(e) => {
                            rw.passing_year = e.target.value;
                            setEduDetails([...edu_details]);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          placeholder="Marks"
                          value={rw.marks}
                          disabled={rw.result_status !== "Declared"}
                          onChange={(e) => {
                            rw.marks = e.target.value;
                            setEduDetails([...edu_details]);
                          }}
                        />
                      </td>
                      <td>
                        <div className="d-flex">
                          <div className="my-auto1 pr10">
                            <label
                              className="ant-btn m-0"
                              disabled={rw.result_status !== "Declared"}
                            >
                              <input
                                type="file"
                                className="d-none"
                                accept="image/*"
                                onChange={(e) => uploadDoc(e, rw)}
                                disabled={rw.result_status !== "Declared"}
                              />
                              <i className="fa fa-upload"></i> Upload
                            </label>
                          </div>
                          <div className="my-auto1 w50">
                            {rw.file_url && (
                              <div>
                                <Image
                                  src={resolveUploadsUrl(rw.file_url)}
                                  className="mw-100"
                                  preview={{ mask: "View" }}
                                />
                                <div
                                  className="fs11 text-center font-red cpointer"
                                  onClick={() => {
                                    rw.file_url = "";
                                    rw.file_id = "";
                                    setEduDetails([...edu_details]);
                                  }}
                                >
                                  Delete
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {(modules["edit_students"] === 1 || util.isStudent() === 1) && (
            <div className="pt20">
              <Button type="primary" size="large" onClick={save}>
                Save &amp; Continue
              </Button>
            </div>
          )}

          <Divider />
          <div>
            {stuDtl.doc_uploaded_on ? (
              <div>
                <Alert
                  message={
                    "Document uploaded on " +
                    util.getDate(
                      stuDtl.doc_uploaded_on,
                      "DD MMM YYYY @ hh:mm A"
                    )
                  }
                  type="success"
                  showIcon
                />
                <div className="pt10">
                  {!stuDtl.doc_verified_on ? (
                    <Alert
                      message="Verification pending!"
                      type="warning"
                      showIcon
                      action={
                        <>
                          {modules["verify_document"] === 1 && (
                            <Button
                              size="small"
                              type="primary"
                              onClick={verifyDoc}
                            >
                              Verify Now
                            </Button>
                          )}
                        </>
                      }
                    />
                  ) : (
                    <Alert
                      message={
                        "Document verified on " +
                        util.getDate(
                          stuDtl.doc_verified_on,
                          "DD MMM YYYY @ hh:mm A"
                        ) +
                        " by " +
                        stuDtl.doc_verified_by_name
                      }
                      type="success"
                      showIcon
                    />
                  )}
                </div>
              </div>
            ) : (
              <Alert
                message="Document not uploaded yet!"
                type="warning"
                showIcon
              />
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Alert
            message="Basic information is not completed yet!"
            type="warning"
            showIcon={false}
            banner
          />
        </div>
      )}
    </div>
  );
}

function UploadIDDocPhoto({ dataKey, data, setData }) {
  const id_key = dataKey;
  const url_key = dataKey.replace("_id", "_url");
  const uploadDoc = async (e) => {
    if (util.checkImage(e.target, 5)) {
      util.showLoader();
      try {
        let rs = await FileService.upload(e.target.files[0]);
        const payload = rs?.data?.result || rs?.data || {};
        setData({
          ...data,
          [id_key]: payload.file_id,
          [url_key]: payload.url || payload.file_url,
        });
      } catch (e) { }

      util.hideLoader();
    } else {
      message.error("Please upload image file only.");
    }

    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2 w-[200px]">
      <div className="">
        <label className="ant-btn m-0 w-full">
          <input
            type="file"
            className="d-none"
            accept="image/*"
            onChange={(e) => uploadDoc(e)}
          />
          <i className="fa fa-upload"></i> Browse File
        </label>
      </div>
      <div className="">
        {data[url_key] && (
          <div className="border p-1">
            <Image
              src={resolveUploadsUrl(data[url_key])}
              className="w-full"
              preview={{ mask: "View" }}
            />
            <div
              className="fs11 text-center font-red cpointer"
              onClick={() => {
                setData({ ...data, [id_key]: null, [url_key]: null });
              }}
            >
              Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BackgrounfInfoForm(props) {
  const { cref, contentHeight, countries, stuDtl, setStuDtl, changeTab } = props;
  const [data, setData] = useState({ references: [] });
  const modules = util.getModules();
  const handleChange = (v, k) => {
    data[k] = v;
    if (k === "has_passport") {
      data.has_passport_applied = "N";
    }
    setData({ ...data });
  };
  const save = () => {
    message.destroy();
    // Validate passport details
    if (data.has_passport === "Y") {
      if (!data.name_on_passport) {
        message.error("Please enter Name as per Passport.");
        return;
      }
      if (!data.passport_number) {
        message.error("Please enter Passport Number.");
        return;
      }
      if (!data.passport_issuing_authority) {
        message.error("Please enter Issuing Authority.");
        return;
      }
      if (!data.passport_expiry_date) {
        message.error("Please select Passport Expiry Date.");
        return;
      }
      if (!data.passport_issue_country_id) {
        message.error("Please select Passport Issue Country.");
        return;
      }
      if (!data.idphoto_front_file_id) {
        message.error("Please upload Front Photo of Passport/National ID.");
        return;
      }
      if (!data.idphoto_back_file_id) {
        message.error("Please upload Back Photo of Passport/National ID.");
        return;
      }
    }
    // Validate citizenship number if Y
    if (data.has_citizenship_no === "Y") {
      if (!data.citizenship_no) {
        message.error("Please enter Citizenship Number.");
        return;
      }
      if (!data.idphoto_front_file_id) {
        message.error("Please upload Front Photo of Passport/National ID.");
        return;
      }
      if (!data.idphoto_back_file_id) {
        message.error("Please upload Back Photo of Passport/National ID.");
        return;
      }
    }

    // --- START: New Validations for Reference Details ---
    const seenMobileNumbers = new Set();
    for (let i = 0; i < data.references.length; i++) {
      const ref = data.references[i];
      // Check if State/City is filled
      if (!ref.city_state) {
        message.error(`Please enter State/City for Reference ${i + 1}.`);
        return;
      }

      // Validate Email (must contain @)
      if (ref.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.email)) {
        message.error(`Please enter a valid email address for Reference ${i + 1}.`);
        return;
      }




      // Validate Mobile Number (must be 10 digits)
      if (ref.contact_no) {
        if (!/^\d{1,20}$/.test(ref.contact_no)) {
          message.error(`Mobile number for Reference ${i + 1} must be exactly 10 digits.`);
          return;
        }
        // Validate Unique Mobile Number
        if (seenMobileNumbers.has(ref.contact_no)) {
          message.error(`Mobile number for Reference ${i + 1} is duplicated. Please enter a unique number.`);
          return;
        }
        seenMobileNumbers.add(ref.contact_no);
      }
    }
    // --- END: New Validations for Reference Details ---

    // 🔒 New Mandatory Rule: Must have either valid passport, applied passport (with ref), or citizenship number
    if (data.has_passport === "N" && data.has_passport_applied === "N" && data.has_citizenship_no === "N") {
      message.error("You must have a Passport, or have applied for it, or provide a Citizenship Number.");
      return;
    }

    // If applied for passport, reference number is mandatory
    if (data.has_passport_applied === "Y" && !data.passport_file_ref_no) {
      message.error("Please enter your Passport File Reference Number.");
      return;
    }

    // If no passport but citizenship required
    if (data.has_passport === "N" && data.has_citizenship_no === "N" && data.has_passport_applied !== "Y") {
      message.error("Please provide at least Citizenship Number or Passport details to continue.");
      return;
    }

    util.showLoader();
    data.student_id = stuDtl.id;
    console.log("Saving background info:", data);
    StudentService.saveBackgroundInfo(data)
      .then((res) => {
        message.success(res.data.message || "Updated");
        setStuDtl(res.data.result.dtl);
        if (cref.current.updateRow) {
          cref.current.updateRow(res.data.result.rowDtl);
        }
        if (changeTab) {
          changeTab("4");
        }
      })
      .catch((e) => {
        message.error(e.message);
      })
      .finally(() => {
        util.hideLoader();
      });
  };
  useEffect(() => {
    let refdata = {
      name: "",
      email: "",
      contact_no: "",
      address: "",
      country: null,
      state: "",
      city: "",
      area: "",
    };
    let dataob = stuDtl.background_details || {
      has_passport: "N",
      has_passport_applied: "N",
      has_citizenship_no: "N",
      references: [],
    };
    if (dataob.references.length <= 0) {
      dataob.references = [{ ...refdata }, { ...refdata }];
    }
    setData({ ...dataob });
  }, [stuDtl]);
  return (
    <div className="cscroll pr10" style={{ height: contentHeight }}>
      {stuDtl.edu_info_date ? (
        <div>
          <div className="mb-4">
            <div className="border p10 mb10">
              <div className="d-flex bold600">
                <div className="my-auto w300">
                  Do you have a valid passport?
                </div>
                <div className="my-auto w200">
                  <Radio.Group
                    value={data.has_passport}
                    onChange={(e) =>
                      handleChange(e.target.value, "has_passport")
                    }
                  >
                    <Radio value="Y">Yes</Radio>
                    <Radio value="N">No</Radio>
                  </Radio.Group>
                </div>
              </div>
              {data.has_passport === "Y" && (
                <div className="mt10 p10 bg-light">
                  <div className="row mingap">
                    <div className="col-md-4 form-group">
                      <label className="req">Name As Per Passport</label>
                      <Input
                        value={data.name_on_passport || ""}
                        onChange={(e) =>
                          handleChange(e.target.value, "name_on_passport")
                        }
                      />
                    </div>
                    <div className="col-md-4 form-group">
                      <label className="req">Passport Number</label>
                      <Input
                        value={data.passport_number || ""}
                        onChange={(e) =>
                          handleChange(e.target.value, "passport_number")
                        }
                      />
                    </div>
                    <div className="col-md-4 form-group">
                      <label className="req">Issuing Authority</label>
                      <Input
                        value={data.passport_issuing_authority || ""}
                        onChange={(e) =>
                          handleChange(
                            e.target.value,
                            "passport_issuing_authority"
                          )
                        }
                      />
                    </div>
                    <div className="col-md-4 form-group">
                      <label className="req">Passport Expiry Date</label>
                      <AntdDatepicker
                        value={data.passport_expiry_date}
                        onChange={(dt) =>
                          handleChange(dt, "passport_expiry_date")
                        }
                      />
                    </div>
                    <div className="col-md-4 form-group">
                      <label className="req">Passport Issue Country</label>
                      <AntdSelect
                        showSearch
                        options={countries.map((v) => {
                          return { id: v.id, name: v.name };
                        })}
                        value={data.passport_issue_country_id}
                        onChange={(v) => {
                          handleChange(v, "passport_issue_country_id");
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {data.has_passport === "N" && (
              <div className="border p10 mb10">
                <div className="d-flex bold600">
                  <div className="my-auto w300">
                    Have you applied for the passport?
                  </div>
                  <div className="my-auto w200">
                    <Radio.Group
                      value={data.has_passport_applied}
                      onChange={(e) =>
                        handleChange(e.target.value, "has_passport_applied")
                      }
                    >
                      <Radio value="Y">Yes</Radio>
                      <Radio value="N">No</Radio>
                    </Radio.Group>
                  </div>
                </div>
                {data.has_passport_applied === "Y" && (
                  <div className="mt10 p10 bg-light">
                    <div className="row mingap">
                      <div className="col-md-4 form-group">
                        <label className="req">
                          Passport File Reference Number
                        </label>
                        <Input
                          value={data.passport_file_ref_no || ""}
                          onChange={(e) =>
                            handleChange(e.target.value, "passport_file_ref_no")
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="border p10 mb10">
              <div className="d-flex bold600">
                <div className="my-auto w300">
                  Do you have a Citizenship number?
                </div>
                <div className="my-auto w200">
                  <Radio.Group
                    value={data.has_citizenship_no}
                    onChange={(e) =>
                      handleChange(e.target.value, "has_citizenship_no")
                    }
                  >
                    <Radio value="Y">Yes</Radio>
                    <Radio value="N">No</Radio>
                  </Radio.Group>
                </div>
              </div>
              {data.has_citizenship_no === "Y" && (
                <div className="mt10 p10 bg-light">
                  <div className="row mingap">
                    <div className="col-md-4 form-group">
                      <label className="req">Citizenship Number</label>
                      <Input
                        value={data.citizenship_no || ""}
                        onChange={(e) =>
                          handleChange(e.target.value, "citizenship_no")
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {(data.has_passport === "Y" || data.has_citizenship_no === "Y") && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="border p-2">
                <div className="font-semibold mb-2">
                  National-Id/Citizenship/Passport Front Photo
                  {(data.has_passport === "Y" || data.has_citizenship_no === "Y") && (
                    <span className="text-danger ml-1">*</span>
                  )}
                </div>
                <UploadIDDocPhoto
                  dataKey="idphoto_front_file_id"
                  data={data}
                  setData={setData}
                />
              </div>
              <div className="border p-2">
                <div className="font-semibold mb-2">
                  National-Id/Citizenship/Passport Back Photo
                  {(data.has_passport === "Y" || data.has_citizenship_no === "Y") && (
                    <span className="text-danger ml-1">*</span>
                  )}
                </div>
                <UploadIDDocPhoto
                  dataKey="idphoto_back_file_id"
                  data={data}
                  setData={setData}
                />
              </div>
            </div>
          )}
          <div>
            <div className="uc bold600 mb5">Reference Details</div>
            <div className="table-responsive">
              <table className="table table-bordered table-sm table-striped table-hover m-0">
                <thead className="thead-light text-uppercase table-text-vmid font-md">
                  <tr>
                    <th className="w20">SN</th>
                    <th className="req">Name</th>
                    <th className="req">Contact Number</th>
                    <th className="req w200">Country</th>
                    <th className="req w200">State/City</th>
                    <th className="req w200">Email</th>
                    {/* Removed Address, State, Area headers */}
                  </tr>
                </thead>
                <tbody className="table-text-vmid">
                  {data.references.map((rw, i) => (
                    <tr key={i}>
                      <td>{i + 1}.</td>
                      <td>
                        <Input
                          value={rw.name}
                          onChange={(e) => {
                            rw.name = e.target.value;
                            setData({ ...data });
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          maxLength={20}
                          value={rw.contact_no}
                          onChange={(e) => {
                            // Allow only digits and limit to 10 characters
                            const value = e.target.value.replace(/\D/g, '').slice(0, 20);
                            rw.contact_no = value;
                            setData({ ...data });
                          }}
                          placeholder="Contact Number"
                        />
                      </td>
                      <td>
                        <AntdSelect
                          showSearch
                          options={[...new Set(countries.map((v) => v.name))]}
                          value={rw.country || null}
                          onChange={(e) => {
                            rw.country = e;
                            setData({ ...data });
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          value={rw.city_state}
                          required
                          onChange={(e) => {
                            rw.city_state = e.target.value; // update row data
                            setData({ ...data }); // update main data
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          value={rw.email}
                          onChange={(e) => {
                            rw.email = e.target.value;
                            setData({ ...data });
                          }}
                          placeholder="Enter valid email"
                        />
                      </td>
                      {/* Removed Address, State, City, Area input cells */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {(modules["edit_students"] === 1 || util.isStudent() === 1) && (
            <div className="pt20">
              <Button type="primary" size="large" onClick={save}>
                Save &amp; Submit
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <Alert
            message="Educational information is not completed yet!"
            type="warning"
            showIcon={false}
            banner
          />
        </div>
      )}
    </div>
  );
}

function StuChoiceForm({ contentHeight, stuDtl, setStuDtl }) {
  //const [data, setData]=useState({});
  /* const handleChange=(v, k)=>{
        data[k]=v;
        setData({...data});
    } */

  useEffect(() => { }, []);

  if (!stuDtl.background_info_date) {
    return (
      <div className="text-center">
        <Alert
          message="Your previous steps are not completed yet!"
          type="warning"
          showIcon={false}
          banner
        />
      </div>
    );
  }

  return (
    <div className="cscroll" style={{ height: contentHeight }}>
      {/* <div className="text-center">
                <Alert message="Student choice filling is not started yet!" type="warning" showIcon={false} banner />
            </div> */}

      <ChoiceFilling {...{ stuDtl, setStuDtl }} />
    </div>
  );
}

