/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Input,
  Select,
  Radio,
  DatePicker,
  Button,
  Space,
  message,
  Card,
  Checkbox,
} from "antd";
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  LockOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";

export default function DynamicFormPreview({ formSchema, onTabChangeExternal }) {
  const [activeTabId, setActiveTabId] = useState(null);
  const [formData, setFormData] = useState({});
  const [tabCompletion, setTabCompletion] = useState({});

  const sections = formSchema?.sections || [];

  useEffect(() => {
    if (sections.length > 0) {
      if (!activeTabId || !sections.some((s) => s.id === activeTabId)) {
        setActiveTabId(sections[0].id);
      }
    }
  }, [sections]);

  // Initialize form default values
  useEffect(() => {
    if (formSchema?.sections) {
      const initialData = {};
      const initialCompletion = {};

      formSchema.sections.forEach((sec) => {
        initialCompletion[sec.id] = true; // Mark as completed initially for showcase preview
        (sec.fields || []).forEach((field) => {
          if (field.default_value !== undefined && field.default_value !== null) {
            initialData[field.field_name] = field.default_value;
          } else if (field.field_type === "radio" && Array.isArray(field.options) && field.options.length > 0) {
            initialData[field.field_name] = field.options[0].value || field.options[0].label;
          }
        });
      });

      setFormData((prev) => ({ ...initialData, ...prev }));
      setTabCompletion(initialCompletion);
    }
  }, [formSchema]);

  const activeSection = sections.find((s) => s.id === activeTabId) || sections[0];

  const handleInputChange = (fieldName, val) => {
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleNextTab = () => {
    if (!activeSection) return;
    const currentIndex = sections.findIndex((s) => s.id === activeSection.id);
    setTabCompletion((prev) => ({ ...prev, [activeSection.id]: true }));

    if (currentIndex < sections.length - 1) {
      const nextTab = sections[currentIndex + 1];
      setActiveTabId(nextTab.id);
      message.success(`Progress saved! Moving to "${nextTab.section_name}"`);
    } else {
      message.success("Application Form submitted successfully in Preview Mode!");
    }
  };

  // Group fields inside the active section
  const renderFieldsByGroups = () => {
    if (!activeSection || !activeSection.fields) return null;

    const fields = activeSection.fields;
    const groups = [];
    let currentGroup = { title: null, fields: [] };

    fields.forEach((f) => {
      const groupTitle = f.group_title || null;
      if (groupTitle !== currentGroup.title) {
        if (currentGroup.fields.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = { title: groupTitle, fields: [f] };
      } else {
        currentGroup.fields.push(f);
      }
    });
    if (currentGroup.fields.length > 0) {
      groups.push(currentGroup);
    }

    return groups.map((grp, gIdx) => (
      <div key={gIdx} style={{ marginBottom: 20 }}>
        {grp.title && (
          <div style={{ position: "relative", margin: "24px 0 16px 0" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 1,
                background: "#e0e0e0",
                zIndex: 1,
              }}
            ></div>
            <span
              style={{
                position: "relative",
                zIndex: 2,
                background: "#fff",
                padding: "0 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {grp.title}
            </span>
          </div>
        )}

        <Row gutter={[20, 16]}>
          {grp.fields.map((field) => {
            // Check conditional visibility
            if (field.conditional_rules?.dependsOn) {
              const depVal = formData[field.conditional_rules.dependsOn];
              if (depVal !== field.conditional_rules.value) {
                return null;
              }
            }

            const colSpan = getColSpan(field.desktop_size);

            return (
              <Col span={colSpan} key={field.id || field.field_name} id={`field_col_${field.field_name}`}>
                {renderSingleField(field)}
              </Col>
            );
          })}
        </Row>
      </div>
    ));
  };

  const getColSpan = (desktopSize) => {
    switch (desktopSize) {
      case "col-md-12":
        return 24;
      case "col-md-6":
        return 12;
      case "col-md-4":
        return 8;
      case "col-md-3":
        return 6;
      default:
        return 12;
    }
  };

  const renderSingleField = (field) => {
    const val = formData[field.field_name];
    const isReq = field.is_required;

    switch (field.field_type) {
      case "text":
      case "tel":
      case "number":
        return (
          <div className="form-group mb-0">
            <label className="field-label-preview">
              {field.label} {isReq ? <span style={{ color: "#ff4d4f" }}>*</span> : null}
            </label>
            <Input
              placeholder={field.placeholder || `Enter ${field.label}`}
              value={val || ""}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="form-control-preview"
            />
          </div>
        );

      case "email":
        return (
          <div className="form-group mb-0">
            <label className="field-label-preview">
              {field.label} {isReq ? <span style={{ color: "#ff4d4f" }}>*</span> : null}
            </label>
            <div style={{ position: "relative" }}>
              <Input
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={val || ""}
                onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                className="form-control-preview"
                style={{ paddingRight: 32 }}
              />
              <CheckCircleFilled
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#52c41a",
                  fontSize: 16,
                }}
              />
            </div>
          </div>
        );

      case "date":
        let momentVal = val ? (moment.isMoment(val) ? val : moment(val, ["YYYY-MM-DD", "DD MMM YYYY", "YYYY/MM/DD"])) : null;
        if (momentVal && !momentVal.isValid()) momentVal = null;

        return (
          <div className="form-group mb-0">
            <label className="field-label-preview">
              {field.label} {isReq ? <span style={{ color: "#ff4d4f" }}>*</span> : null}
            </label>
            <DatePicker
              style={{ width: "100%", height: 38, borderRadius: 4 }}
              format="DD MMM YYYY"
              value={momentVal}
              placeholder={field.placeholder || "Select date"}
              onChange={(d, dateStr) => handleInputChange(field.field_name, dateStr)}
            />
          </div>
        );

      case "select":
        const opts = Array.isArray(field.options) ? field.options : [];
        return (
          <div className="form-group mb-0">
            <label className="field-label-preview">
              {field.label} {isReq ? <span style={{ color: "#ff4d4f" }}>*</span> : null}
            </label>
            <Select
              style={{ width: "100%", height: 38 }}
              placeholder={field.placeholder || `Select ${field.label}`}
              value={val}
              onChange={(v) => handleInputChange(field.field_name, v)}
            >
              {opts.map((o, idx) => {
                const optLabel = typeof o === "string" ? o : o.label;
                const optVal = typeof o === "string" ? o : o.value;
                return (
                  <Select.Option key={idx} value={optVal}>
                    {optLabel}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        );

      case "radio":
        const radioOpts = Array.isArray(field.options) ? field.options : [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }];
        return (
          <div className="form-group mb-0" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <label className="field-label-preview" style={{ marginBottom: 0 }}>
              {field.label} {isReq ? <span style={{ color: "#ff4d4f" }}>*</span> : null}
            </label>
            <Radio.Group
              value={val || radioOpts[0]?.value}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            >
              {radioOpts.map((ro, idx) => (
                <Radio key={idx} value={typeof ro === "string" ? ro : ro.value}>
                  {typeof ro === "string" ? ro : ro.label}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        );

      case "file":
        return (
          <div className="form-group mb-0">
            <label className="field-label-preview">
              {field.label} {isReq ? <span style={{ color: "#ff4d4f" }}>*</span> : null}
            </label>
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                padding: "12px 16px",
                background: "#fafafa",
                display: "inline-block",
                minWidth: 160,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <Button size="small" icon={<UploadOutlined />} style={{ fontSize: 12 }}>
                  Browse File
                </Button>
              </div>
              <div
                style={{
                  width: 90,
                  height: 90,
                  border: "1px solid #eee",
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: field.field_name.includes("front") ? "#7928ca" : "#ff7900",
                  color: "#fff",
                  position: "relative",
                }}
              >
                {field.field_name.includes("front") ? (
                  <span style={{ fontSize: 32, fontWeight: 900 }}>&gt;</span>
                ) : (
                  <i className="fa fa-lightbulb" style={{ fontSize: 32 }}></i>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: -18,
                    fontSize: 11,
                    color: "#ff4d4f",
                    cursor: "pointer",
                  }}
                  onClick={() => message.info("Delete simulated in preview")}
                >
                  Delete
                </div>
              </div>
            </div>
          </div>
        );

      case "table":
        let rawRows = val;
        if (typeof rawRows === "string") {
          try {
            rawRows = JSON.parse(rawRows);
          } catch (e) {
            rawRows = [];
          }
        }
        if (!Array.isArray(rawRows)) rawRows = [];

        // Prepopulate fixed standard rows matching StuForm.js if empty
        if (rawRows.length === 0) {
          if (field.field_name === "qualifications_table") {
            rawRows = [
              { sn: 1, qualification: "Secondary School / Class X / O Level / Equivalent Qualification", result_status: "Declared", passing_year: "", marks: "", document: "" },
              { sn: 2, qualification: "Higher Secondary / Class XII / A level / Equivalent Qualification", result_status: "Declared", passing_year: "", marks: "", document: "" },
              { sn: 3, qualification: "Graduation", result_status: "Declared", passing_year: "", marks: "", document: "" }
            ];
          } else if (field.field_name === "reference_details_table") {
            rawRows = [
              { sn: 1, name: "", contact_number: "", country: null, state_city: "", email: "" },
              { sn: 2, name: "", contact_number: "", country: null, state_city: "", email: "" }
            ];
          } else if (field.field_name === "selected_choices_table") {
            rawRows = [
              { sn: 1, institute_name: "", course_name: "", specialization: "", mode_of_course: "offline" }
            ];
          }
        }

        const columnsConfig = field.table_columns || [];

        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div className="field-label-preview" style={{ marginBottom: 0, fontWeight: 700 }}>
                {field.label}
              </div>
            </div>

            <div style={{ border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e8e8e8", textAlign: "left" }}>
                    {columnsConfig.map((col, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: "10px 14px",
                          fontWeight: 600,
                          color: "#555",
                          borderRight: "1px solid #eee",
                          width: col.width || "auto",
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawRows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: "1px solid #f0f0f0", background: rIdx % 2 === 0 ? "#fff" : "#fafafa" }}>
                      {columnsConfig.map((col, cIdx) => {
                        const isAwaited = row.result_status === "Awaited";
                        const isFieldDisabled = isAwaited && ["passing_year", "marks", "document"].includes(col.key);

                        return (
                          <td key={cIdx} style={{ padding: "10px 14px", borderRight: "1px solid #eee" }}>
                            {col.key === "sn" ? (
                              rIdx + 1 + "."
                            ) : col.key === "qualification" ? (
                              <span style={{ fontWeight: 500, color: "#333" }}>{row[col.key]}</span>
                            ) : col.type === "select" ? (
                              <Select
                                size="small"
                                style={{ width: "100%" }}
                                value={row[col.key] || col.options?.[0]}
                                onChange={(v) => {
                                  const next = [...rawRows];
                                  next[rIdx][col.key] = v;
                                  if (v === "Awaited") {
                                    next[rIdx].passing_year = "";
                                    next[rIdx].marks = "";
                                    next[rIdx].document = "";
                                  }
                                  handleInputChange(field.field_name, next);
                                }}
                              >
                                {(col.options || ["Declared", "Awaited"]).map((op, oIdx) => (
                                  <Select.Option key={oIdx} value={op}>
                                    {op}
                                  </Select.Option>
                                ))}
                              </Select>
                            ) : col.type === "file" ? (
                              <Space align="center">
                                <Button
                                  size="small"
                                  icon={<UploadOutlined />}
                                  style={{ fontSize: 11 }}
                                  disabled={isFieldDisabled}
                                >
                                  Upload
                                </Button>
                                {row[col.key] && (
                                  <span style={{ fontSize: 11, color: "#00897b" }}>
                                    <i className="fa fa-check-circle mr1"></i> Attached
                                  </span>
                                )}
                              </Space>
                            ) : (
                              <Input
                                size="small"
                                placeholder={isFieldDisabled ? "N/A (Awaited)" : (col.label || "")}
                                disabled={isFieldDisabled}
                                value={row[col.key] || ""}
                                onChange={(e) => {
                                  const next = [...rawRows];
                                  next[rIdx][col.key] = e.target.value;
                                  handleInputChange(field.field_name, next);
                                }}
                                style={{ width: "100%" }}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "checkbox":
        const checkOpts = Array.isArray(field.options) ? field.options : [{ label: field.label, value: "1" }];
        return (
          <div className="form-group mb-0" style={{ padding: "10px 0" }}>
            <Checkbox
              checked={val === "1" || val === true || val === 1}
              onChange={(e) => handleInputChange(field.field_name, e.target.checked ? "1" : "0")}
              style={{ fontSize: 13, fontWeight: 500, color: "#333", lineHeight: 1.5 }}
            >
              {checkOpts[0]?.label || field.label} {isReq ? <span style={{ color: "#ff4d4f" }}>*</span> : null}
            </Checkbox>
          </div>
        );

      case "alert":
        const alertOpts = field.options || {};
        const alertType = alertOpts.alert_type || "info";
        const isSuccess = alertType === "success";
        const isWarning = alertType === "warning";
        const isInfo = alertType === "info" || (!isSuccess && !isWarning);

        const bgColor = isSuccess ? "#f6ffed" : isWarning ? "#fffbe6" : "#e6f7ff";
        const borderColor = isSuccess ? "#b7eb8f" : isWarning ? "#ffe58f" : "#91d5ff";
        const textColor = isSuccess ? "#389e0d" : isWarning ? "#d48806" : "#0050b3";

        return (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 6,
              border: `1px solid ${borderColor}`,
              background: bgColor,
              color: textColor,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {alertOpts.title && (
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: textColor, display: "flex", alignItems: "center", gap: 8 }}>
                <i className={`fa ${alertOpts.icon || "fa-certificate"}`}></i>
                <span>{alertOpts.title}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ lineHeight: 1.6, color: "#444" }}>
                {!alertOpts.title && (
                  isSuccess ? (
                    <CheckCircleFilled style={{ color: "#52c41a", fontSize: 16, marginRight: 8 }} />
                  ) : (
                    <ExclamationCircleFilled style={{ color: "#faad14", fontSize: 16, marginRight: 8 }} />
                  )
                )}
                <span>{alertOpts.text || field.label}</span>
              </div>
              {alertOpts.action_button && (
                <Button size="small" style={{ borderColor: "#d9d9d9", fontSize: 12, marginLeft: 12 }}>
                  {alertOpts.action_button}
                </Button>
              )}
            </div>
          </div>
        );

      case "card_alert":
        const cardOpts = field.options || {};
        return (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 4,
              border: "1px solid #adc6ff",
              background: "#f0f5ff",
              color: "#1d39c4",
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <LockOutlined style={{ fontSize: 22, marginTop: 2, color: "#2f54eb" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#1d39c4" }}>
                {cardOpts.title || "Choice Filling Locked"}
              </div>
              <div style={{ fontSize: 13, color: "#595959", marginBottom: 4 }}>
                {cardOpts.description || "You have submitted your choices. The panel is now locked and you cannot select more courses."}
              </div>
              <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 500 }}>
                {cardOpts.sub_text || "Total Applied: 2 course(s)"}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="form-group mb-0">
            <label className="field-label-preview">{field.label}</label>
            <Input
              value={val || ""}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="form-control-preview"
            />
          </div>
        );
    }
  };

  const isLastTab = activeSection && sections[sections.length - 1]?.id === activeSection.id;

  return (
    <div className="dynamic-app-form-wrapper" style={{ background: "#fbfcfd", minHeight: "100%", paddingBottom: 40 }}>
      {/* Top Header matching Screenshot */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          background: "#fff",
          borderBottom: "1px solid #eef2f5",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: "#009688", letterSpacing: "0.5px" }}>
          {formSchema?.form_title || "APPLICATION FORM"}
        </div>
      </div>

      {/* Tabs Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 24px 10px 24px",
          background: "#fff",
          borderBottom: "1px solid #eaeaea",
          overflowX: "auto",
        }}
      >
        {sections.map((sec) => {
          const isActive = sec.id === activeTabId;
          const isDone = tabCompletion[sec.id];

          return (
            <div
              key={sec.id}
              onClick={() => {
                setActiveTabId(sec.id);
                if (onTabChangeExternal) onTabChangeExternal(sec.id);
              }}
              style={{
                cursor: "pointer",
                textAlign: "center",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 18px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  background: isActive ? "#00897b" : "#e0f2f1",
                  color: isActive ? "#fff" : "#00695c",
                  boxShadow: isActive ? "0 2px 6px rgba(0,137,123,0.3)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <i className={`fa ${sec.icon || "fa-file-alt"}`}></i>
                <span>{sec.section_name}</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, fontWeight: 500 }}>
                {isDone ? (
                  <span style={{ color: "#2e7d32" }}>
                    <CheckCircleFilled style={{ fontSize: 10, marginRight: 3 }} /> Completed
                  </span>
                ) : (
                  <span style={{ color: "#d32f2f" }}>Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Fields Canvas */}
      <div style={{ maxWidth: 1200, margin: "24px auto 0 auto", padding: "0 20px" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            border: "1px solid #eaedf0",
            padding: "10px 14px",
          }}
        >
          {renderFieldsByGroups()}

          {/* Action Button matching screenshot */}
          <div style={{ marginTop: 30, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
            <Button
              type="primary"
              size="large"
              style={{
                background: "#009688",
                borderColor: "#009688",
                fontWeight: 600,
                borderRadius: 4,
                padding: "0 28px",
                height: 42,
              }}
              onClick={handleNextTab}
            >
              {isLastTab ? "Save & Submit" : "Save & Continue"}
            </Button>
          </div>
        </Card>
      </div>

      {/* CSS Enhancements */}
      <style>{`
        .field-label-preview {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #444;
          margin-bottom: 6px;
        }
        .form-control-preview {
          height: 38px;
          border-radius: 4px;
          border-color: #d9d9d9;
          font-size: 13px;
        }
        .form-control-preview:focus, .form-control-preview:hover {
          border-color: #009688;
        }
      `}</style>
    </div>
  );
}
