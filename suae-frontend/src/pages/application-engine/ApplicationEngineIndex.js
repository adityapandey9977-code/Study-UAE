/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  Radio,
  Tag,
  Space,
  Tooltip,
  Modal,
  message,
  Popconfirm,
  Empty,
  Spin,
  Dropdown,
  Menu,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FormOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import ApplicationEngineService from "../../services/ApplicationEngineService";
import TabModal from "./TabModal";
import FieldModal from "./FieldModal";
import NewFormModal from "./NewFormModal";
import DynamicFormPreview from "./DynamicFormPreview";

export default function ApplicationEngineIndex() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formsList, setFormsList] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [currentForm, setCurrentForm] = useState(null);

  const [activeTabId, setActiveTabId] = useState(null);
  const [viewMode, setViewMode] = useState("builder"); // "builder" | "preview"

  // Modal states
  const [tabModalVisible, setTabModalVisible] = useState(false);
  const [editingTab, setEditingTab] = useState(null);

  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [newFormModalVisible, setNewFormModalVisible] = useState(false);

  // Load Forms on mount
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const res = await ApplicationEngineService.listForms();
      const list = res?.data?.data || [];
      setFormsList(list);

      if (list.length > 0) {
        const defaultOrFirst = list.find((f) => f.is_default) || list[0];
        setSelectedFormId(defaultOrFirst.id);
        await loadFormDetail(defaultOrFirst.id);
      }
    } catch (err) {
      message.error(err.message || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  const loadFormDetail = async (formId) => {
    setLoading(true);
    try {
      const res = await ApplicationEngineService.getFormById(formId);
      const formObj = res?.data?.data;
      if (formObj) {
        setCurrentForm(formObj);
        if (formObj.sections && formObj.sections.length > 0) {
          setActiveTabId(formObj.sections[0].id);
        }
      }
    } catch (err) {
      message.error(err.message || "Failed to load form details");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (formId) => {
    setSelectedFormId(formId);
    loadFormDetail(formId);
  };

  const activeSection = (currentForm?.sections || []).find((s) => s.id === activeTabId) || currentForm?.sections?.[0];

  // Tab operations with instant database sync
  const handleOpenAddTab = () => {
    setEditingTab(null);
    setTabModalVisible(true);
  };

  const handleOpenEditTab = (tab) => {
    setEditingTab(tab);
    setTabModalVisible(true);
  };

  const handleSaveTab = async (tabData) => {
    if (!currentForm) return;
    try {
      const payload = {
        ...tabData,
        form_id: currentForm.id,
        step_order: tabData.step_order || (currentForm.sections?.length || 0) + 1,
      };

      const res = await ApplicationEngineService.saveSection(payload);
      const savedSec = res?.data?.data;

      message.success(`Tab "${savedSec?.section_name || tabData.section_name}" saved to database!`);
      setTabModalVisible(false);

      // Reload form to get synced DB state
      await loadFormDetail(currentForm.id);
      if (savedSec?.id) {
        setActiveTabId(savedSec.id);
      }
    } catch (err) {
      message.error(err.message || "Failed to save tab");
    }
  };

  const handleDeleteTab = async (tabId) => {
    if (!currentForm) return;
    try {
      if (typeof tabId === "number" || !String(tabId).startsWith("new_")) {
        await ApplicationEngineService.deleteSection(tabId);
      }
      message.success("Tab deleted successfully from database");
      await loadFormDetail(currentForm.id);
    } catch (err) {
      message.error(err.message || "Failed to delete tab");
    }
  };

  const handleMoveTab = async (index, direction) => {
    if (!currentForm || !currentForm.sections) return;
    const sections = [...currentForm.sections];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIdx];
    sections[targetIdx] = temp;

    sections.forEach((s, i) => {
      s.step_order = i + 1;
    });

    const updatedForm = { ...currentForm, sections };
    setCurrentForm(updatedForm);

    try {
      await ApplicationEngineService.saveFullSchema(currentForm.id, updatedForm);
    } catch (e) {
      console.error(e);
    }
  };

  // Field operations with instant database sync into form_fields table
  const handleOpenAddField = (groupTitle = null) => {
    setEditingField({
      group_title: groupTitle,
      field_type: "text",
      desktop_size: "col-md-6",
      is_required: 1,
    });
    setFieldModalVisible(true);
  };

  const handleOpenEditField = (field) => {
    setEditingField(field);
    setFieldModalVisible(true);
  };

  const handleSaveField = async (fieldData) => {
    if (!currentForm || !activeSection) return;

    try {
      const payload = {
        ...fieldData,
        form_id: currentForm.id,
        section_id: activeSection.id,
        field_order: fieldData.field_order || (activeSection.fields?.length || 0) + 1,
      };

      const res = await ApplicationEngineService.saveField(payload);
      const savedField = res?.data?.data;

      message.success(`Field "${savedField?.label || fieldData.label}" saved directly to form_fields table!`);
      setFieldModalVisible(false);

      // Reload form to get synced DB state
      await loadFormDetail(currentForm.id);
    } catch (err) {
      message.error(err.message || "Failed to save field");
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!currentForm || !activeSection) return;
    try {
      if (typeof fieldId === "number" || !String(fieldId).startsWith("new_")) {
        await ApplicationEngineService.deleteField(fieldId);
      }
      message.success("Field deleted successfully from form_fields table");
      await loadFormDetail(currentForm.id);
    } catch (err) {
      message.error(err.message || "Failed to delete field");
    }
  };

  const handleCloneField = async (field) => {
    if (!currentForm || !activeSection) return;

    try {
      const { id, created_at, updated_at, ...rest } = field;
      const clonePayload = {
        ...rest,
        form_id: currentForm.id,
        section_id: activeSection.id,
        label: `${field.label} (Copy)`,
        field_name: `${field.field_name}_copy_${Date.now().toString().slice(-4)}`,
        field_order: (activeSection.fields?.length || 0) + 1,
      };

      await ApplicationEngineService.saveField(clonePayload);
      message.success(`Cloned field "${field.label}" and saved to form_fields table!`);
      await loadFormDetail(currentForm.id);
    } catch (err) {
      message.error(err.message || "Failed to clone field");
    }
  };

  const handleMoveField = async (index, direction) => {
    if (!currentForm || !activeSection) return;
    const sections = [...currentForm.sections];
    const secIdx = sections.findIndex((s) => s.id === activeSection.id);
    if (secIdx === -1) return;

    const fields = [...(sections[secIdx].fields || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const temp = fields[index];
    fields[index] = fields[targetIdx];
    fields[targetIdx] = temp;

    fields.forEach((f, i) => {
      f.field_order = i + 1;
    });

    sections[secIdx].fields = fields;
    const updatedForm = { ...currentForm, sections };
    setCurrentForm(updatedForm);

    try {
      await ApplicationEngineService.saveFullSchema(currentForm.id, updatedForm);
    } catch (e) {
      console.error(e);
    }
  };

  // Save full schema to backend
  const handleSaveSchemaToBackend = async () => {
    if (!currentForm || !currentForm.id) return;
    setSaving(true);
    try {
      const res = await ApplicationEngineService.saveFullSchema(currentForm.id, currentForm);
      message.success("Application Form Schema synchronized and saved successfully!");
      if (res?.data?.data) {
        setCurrentForm(res.data.data);
      }
    } catch (err) {
      message.error(err.message || "Failed to save schema");
    } finally {
      setSaving(false);
    }
  };

  // Create new form with template support
  const handleCreateNewForm = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        form_name: formData.form_name,
        form_title: formData.form_title || "APPLICATION FORM",
        form_description: formData.form_description || "",
        form_slug: formData.form_slug || "",
        template_source: formData.template_source || "default",
        clone_form_id: formData.clone_form_id || null,
        status: "active",
      };

      const res = await ApplicationEngineService.saveForm(payload);
      const created = res?.data?.data;

      if (created) {
        message.success(`Form "${created.form_name}" created with 6 default tabs and fields!`);
        setNewFormModalVisible(false);
        await loadForms();
        setSelectedFormId(created.id);
        await loadFormDetail(created.id);
      }
    } catch (err) {
      message.error(err.message || "Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  // Delete Form
  const handleDeleteForm = () => {
    if (!selectedFormId) return;
    if (formsList.length <= 1) {
      message.warning("You cannot delete the only remaining application form.");
      return;
    }

    const formToDelete = formsList.find((f) => f.id === selectedFormId);

    Modal.confirm({
      title: "Delete Application Form?",
      content: `Are you sure you want to delete "${formToDelete?.form_name || 'this form'}"? All associated tabs and fields will be permanently deleted.`,
      okText: "Yes, Delete Form",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setLoading(true);
        try {
          await ApplicationEngineService.deleteForm(selectedFormId);
          message.success(`Form "${formToDelete?.form_name}" deleted successfully!`);
          await loadForms();
        } catch (err) {
          message.error(err.message || "Failed to delete form");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Collect all unique existing group titles for combobox
  const existingGroups = Array.from(
    new Set(
      (activeSection?.fields || [])
        .map((f) => f.group_title)
        .filter((g) => Boolean(g))
    )
  );

  return (
    <div className="page-content" style={{ background: "#f4f6f8", minHeight: "100vh", padding: "16px 24px" }}>
      {/* Top Header Bar */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: "linear-gradient(135deg, #00897b, #004d40)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 20,
              boxShadow: "0 3px 8px rgba(0,137,123,0.3)",
            }}
          >
            <i className="fa fa-cogs"></i>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#263238", lineHeight: 1.2 }}>
              Application Engine
            </div>
            <div style={{ fontSize: 12, color: "#78909c", marginTop: 2 }}>
              Build dynamic multi-tab application forms with customizable fields & real-time preview
            </div>
          </div>
        </div>

        {/* Form Selector & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Select
            style={{ width: 280 }}
            value={selectedFormId}
            onChange={handleFormChange}
            loading={loading}
          >
            {formsList.map((f) => (
              <Select.Option key={f.id} value={f.id}>
                {f.form_name} {f.is_default ? " (Default Active)" : ""}
              </Select.Option>
            ))}
          </Select>

          <Button
            icon={<PlusOutlined />}
            onClick={() => setNewFormModalVisible(true)}
            style={{ borderRadius: 4 }}
          >
            New Form
          </Button>

          <Tooltip title={formsList.length <= 1 ? "Cannot delete the only form" : "Delete current form"}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteForm}
              disabled={formsList.length <= 1}
              style={{ borderRadius: 4 }}
            >
              Delete Form
            </Button>
          </Tooltip>

          {/* Mode Switcher */}
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
            style={{ marginLeft: 8 }}
          >
            <Radio.Button value="builder">
              <FormOutlined className="mr1" /> Form Builder
            </Radio.Button>
            <Radio.Button value="preview">
              <EyeOutlined className="mr1" /> Live Preview
            </Radio.Button>
          </Radio.Group>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSaveSchemaToBackend}
            style={{
              background: "#009688",
              borderColor: "#009688",
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            Save Form Schema
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip="Loading Application Engine Schema..." />
        </div>
      ) : viewMode === "preview" ? (
        /* LIVE INTERACTIVE PREVIEW MODE */
        <DynamicFormPreview
          formSchema={currentForm}
          onTabChangeExternal={(tabId) => setActiveTabId(tabId)}
        />
      ) : (
        /* BUILDER MODE */
        <div>
          {/* Tabs Navigation Bar */}
          <Card
            bordered={false}
            style={{
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              marginBottom: 16,
              padding: "4px 8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#37474f", marginRight: 6 }}>
                  APPLICATION TABS:
                </span>
                {(currentForm?.sections || []).map((sec, idx) => {
                  const isActive = sec.id === activeTabId;
                  const fieldCount = (sec.fields || []).length;

                  return (
                    <div
                      key={sec.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: isActive ? "#00897b" : "#f0f4f4",
                        color: isActive ? "#fff" : "#00695c",
                        border: isActive ? "1px solid #00796b" : "1px solid #d0e0e0",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setActiveTabId(sec.id)}
                    >
                      <i className={`fa ${sec.icon || "fa-file-alt"}`}></i>
                      <span>{sec.section_name}</span>
                      <Tag
                        color={isActive ? "#004d40" : "#b2dfdb"}
                        style={{
                          margin: 0,
                          fontSize: 11,
                          lineHeight: "16px",
                          borderRadius: 10,
                          color: isActive ? "#fff" : "#004d40",
                          border: "none",
                        }}
                      >
                        {fieldCount}
                      </Tag>

                      {/* Tab Action Menu */}
                      <Dropdown
                        trigger={["click"]}
                        overlay={
                          <Menu>
                            <Menu.Item
                              key="edit"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.domEvent.stopPropagation();
                                handleOpenEditTab(sec);
                              }}
                            >
                              Edit Tab Name & Icon
                            </Menu.Item>
                            <Menu.Item
                              key="moveLeft"
                              icon={<ArrowUpOutlined />}
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.domEvent.stopPropagation();
                                handleMoveTab(idx, -1);
                              }}
                            >
                              Move Tab Left
                            </Menu.Item>
                            <Menu.Item
                              key="moveRight"
                              icon={<ArrowDownOutlined />}
                              disabled={idx === (currentForm?.sections || []).length - 1}
                              onClick={(e) => {
                                e.domEvent.stopPropagation();
                                handleMoveTab(idx, 1);
                              }}
                            >
                              Move Tab Right
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              key="delete"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.domEvent.stopPropagation();
                                Modal.confirm({
                                  title: `Delete Tab "${sec.section_name}"?`,
                                  content: "All fields inside this tab will be removed.",
                                  okText: "Yes, Delete",
                                  okType: "danger",
                                  onOk: () => handleDeleteTab(sec.id),
                                });
                              }}
                            >
                              Delete Tab
                            </Menu.Item>
                          </Menu>
                        }
                      >
                        <div
                          style={{
                            marginLeft: 4,
                            padding: "0 4px",
                            cursor: "pointer",
                            opacity: 0.8,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreOutlined />
                        </div>
                      </Dropdown>
                    </div>
                  );
                })}
              </div>

              {/* Add Tab Button */}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleOpenAddTab}
                style={{
                  borderRadius: 20,
                  borderColor: "#009688",
                  color: "#009688",
                  fontWeight: 600,
                }}
              >
                Add New Tab
              </Button>
            </div>
          </Card>

          {/* Active Tab's Fields Builder Canvas */}
          {activeSection ? (
            <Card
              bordered={false}
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                minHeight: 500,
              }}
            >
              {/* Tab Info Banner & Add Field Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 16,
                  borderBottom: "1px solid #f0f0f0",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#263238" }}>
                    <i className={`fa ${activeSection.icon || "fa-file-alt"} mr2`} style={{ color: "#009688" }}></i>
                    Configuring: {activeSection.section_name}
                  </div>
                  <div style={{ fontSize: 12, color: "#78909c" }}>
                    Key: <code>{activeSection.section_key}</code> | Total Fields:{" "}
                    <strong>{(activeSection.fields || []).length}</strong>
                  </div>
                </div>

                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenAddField()}
                    style={{
                      background: "#009688",
                      borderColor: "#009688",
                      borderRadius: 4,
                      fontWeight: 600,
                    }}
                  >
                    Add Field to Tab
                  </Button>
                </Space>
              </div>

              {/* Fields List organized by Groups */}
              {(activeSection.fields || []).length === 0 ? (
                <Empty
                  description={
                    <div>
                      <p>No fields added to this tab yet.</p>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenAddField()}
                        style={{ background: "#009688", borderColor: "#009688" }}
                      >
                        Add First Field
                      </Button>
                    </div>
                  }
                  style={{ margin: "60px 0" }}
                />
              ) : (
                renderBuilderFields(activeSection.fields)
              )}
            </Card>
          ) : (
            <Card style={{ textAlign: "center", padding: 60 }}>
              <p>No tabs available. Click below to add your first tab.</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddTab}>
                Add Application Tab
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Tab Config Modal */}
      <TabModal
        visible={tabModalVisible}
        onCancel={() => setTabModalVisible(false)}
        onSave={handleSaveTab}
        tabData={editingTab}
      />

      {/* Field Config Modal */}
      <FieldModal
        visible={fieldModalVisible}
        onCancel={() => setFieldModalVisible(false)}
        onSave={handleSaveField}
        fieldData={editingField}
        existingFields={activeSection?.fields || []}
        existingGroups={existingGroups}
      />

      {/* New Form Modal */}
      <NewFormModal
        visible={newFormModalVisible}
        onCancel={() => setNewFormModalVisible(false)}
        onCreate={handleCreateNewForm}
        existingForms={formsList}
      />
    </div>
  );

  function renderBuilderFields(fields) {
    const groups = [];
    let currentGroup = { title: null, fields: [] };

    fields.forEach((f, idx) => {
      const groupTitle = f.group_title || null;
      if (groupTitle !== currentGroup.title) {
        if (currentGroup.fields.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = { title: groupTitle, fields: [{ ...f, origIndex: idx }] };
      } else {
        currentGroup.fields.push({ ...f, origIndex: idx });
      }
    });
    if (currentGroup.fields.length > 0) {
      groups.push(currentGroup);
    }

    return groups.map((grp, gIdx) => (
      <div
        key={gIdx}
        style={{
          marginBottom: 24,
          background: "#fafbfc",
          padding: "16px 20px",
          borderRadius: 8,
          border: "1px solid #eaedf0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            paddingBottom: 8,
            borderBottom: "1px dashed #d9d9d9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#00796b",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {grp.title ? grp.title : "GENERAL FIELDS"}
            </span>
            <Tag color="#e0f2f1" style={{ color: "#00695c", border: "none" }}>
              {grp.fields.length} {grp.fields.length === 1 ? "field" : "fields"}
            </Tag>
          </div>

          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleOpenAddField(grp.title)}
            style={{ fontSize: 12 }}
          >
            Add Field to {grp.title || "Section"}
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {grp.fields.map((field) => {
            const fIdx = field.origIndex;
            return (
              <Col span={24} key={field.id || field.field_name}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 6,
                    padding: "12px 16px",
                    border: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    transition: "all 0.2s ease",
                  }}
                  className="field-card-item"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Reorder Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowUpOutlined style={{ fontSize: 11 }} />}
                        disabled={fIdx === 0}
                        onClick={() => handleMoveField(fIdx, -1)}
                        style={{ height: 18, width: 22 }}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowDownOutlined style={{ fontSize: 11 }} />}
                        disabled={fIdx === fields.length - 1}
                        onClick={() => handleMoveField(fIdx, 1)}
                        style={{ height: 18, width: 22 }}
                      />
                    </div>

                    {/* Field Info */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                          {field.label}
                        </span>
                        {field.is_required ? (
                          <Tag color="red" style={{ fontSize: 10, lineHeight: "16px", margin: 0 }}>
                            Required *
                          </Tag>
                        ) : (
                          <Tag color="default" style={{ fontSize: 10, lineHeight: "16px", margin: 0 }}>
                            Optional
                          </Tag>
                        )}
                        <Tag color="blue" style={{ fontSize: 10, lineHeight: "16px", margin: 0 }}>
                          {field.field_type?.toUpperCase()}
                        </Tag>
                        <Tag color="geekblue" style={{ fontSize: 10, lineHeight: "16px", margin: 0 }}>
                          {field.desktop_size}
                        </Tag>
                        {field.conditional_rules && (
                          <Tag color="purple" style={{ fontSize: 10, lineHeight: "16px", margin: 0 }}>
                            Conditional ({field.conditional_rules.dependsOn} = {field.conditional_rules.value})
                          </Tag>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                        Key: <code>{field.field_name}</code>
                        {field.placeholder && (
                          <span style={{ marginLeft: 10 }}>Placeholder: "{field.placeholder}"</span>
                        )}
                        {field.default_value && (
                          <span style={{ marginLeft: 10 }}>Default: "{String(field.default_value).slice(0, 30)}"</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Space>
                    <Tooltip title="Edit Field Config">
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEditField(field)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip title="Clone Field">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => handleCloneField(field)}
                      />
                    </Tooltip>
                    <Tooltip title="Delete Field">
                      <Popconfirm
                        title={`Delete field "${field.label}"?`}
                        onConfirm={() => handleDeleteField(field.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Tooltip>
                  </Space>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    ));
  }
}
