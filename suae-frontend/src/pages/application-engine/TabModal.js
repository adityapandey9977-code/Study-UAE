import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Switch, Space } from "antd";

const ICON_OPTIONS = [
  { label: "Address Card (Personal)", value: "fa-address-card" },
  { label: "University (Academic/Edu)", value: "fa-university" },
  { label: "Newspaper (Background)", value: "fa-newspaper" },
  { label: "User Shield (Guardian)", value: "fa-user-shield" },
  { label: "Hand Pointer (Choice Fill)", value: "fa-hand-pointer" },
  { label: "File Signature (Declaration)", value: "fa-file-signature" },
  { label: "File / Document", value: "fa-file-alt" },
  { label: "ID Card", value: "fa-id-card" },
  { label: "Graduation Cap", value: "fa-graduation-cap" },
  { label: "Certificate", value: "fa-certificate" },
  { label: "User Check", value: "fa-user-check" },
  { label: "List / Check", value: "fa-list-check" },
  { label: "Award / Trophy", value: "fa-award" },
  { label: "Upload / Cloud", value: "fa-cloud-upload-alt" },
  { label: "Info Circle", value: "fa-info-circle" },
  { label: "Sliders / Config", value: "fa-sliders-h" },
];

export default function TabModal({ visible, onCancel, onSave, tabData }) {
  const [form] = Form.useForm();
  const [selectedIcon, setSelectedIcon] = useState("fa-file-alt");

  useEffect(() => {
    if (visible) {
      if (tabData) {
        form.setFieldsValue({
          section_name: tabData.section_name || "",
          section_key: tabData.section_key || "",
          icon: tabData.icon || "fa-file-alt",
          step_order: tabData.step_order || 1,
          is_active: tabData.is_active !== undefined ? Boolean(tabData.is_active) : true,
          description: tabData.description || "",
        });
        setSelectedIcon(tabData.icon || "fa-file-alt");
      } else {
        form.resetFields();
        form.setFieldsValue({
          icon: "fa-file-alt",
          is_active: true,
          step_order: 1,
        });
        setSelectedIcon("fa-file-alt");
      }
    }
  }, [visible, tabData, form]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!tabData) {
      const autoKey = val.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");
      form.setFieldsValue({ section_key: autoKey });
    }
  };

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        onSave({
          ...tabData,
          ...values,
          is_active: values.is_active ? 1 : 0,
        });
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          <i className={`fa ${selectedIcon} mr2`} style={{ color: "#009688" }}></i>
          {tabData ? "Edit Application Form Tab" : "Add New Application Tab"}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={tabData ? "Update Tab" : "Create Tab"}
      cancelText="Cancel"
      destroyOnClose
      width={540}
    >
      <Form form={form} layout="vertical" initialValues={{ is_active: true, icon: "fa-file-alt" }}>
        <Form.Item
          label="Tab Name / Title"
          name="section_name"
          rules={[{ required: true, message: "Please enter tab name" }]}
        >
          <Input
            placeholder="e.g. Basic Information, Educational Info, Certificates"
            onChange={handleNameChange}
          />
        </Form.Item>

        <Form.Item
          label="Tab Key (Internal identifier)"
          name="section_key"
          rules={[{ required: true, message: "Please enter tab key" }]}
        >
          <Input placeholder="e.g. basic_info, edu_info, custom_tab" />
        </Form.Item>

        <Form.Item label="Tab Icon" name="icon">
          <Select
            showSearch
            onChange={(val) => setSelectedIcon(val)}
            optionLabelProp="label"
          >
            {ICON_OPTIONS.map((opt) => (
              <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                <Space>
                  <i className={`fa ${opt.value}`} style={{ width: 20, color: "#009688" }}></i>
                  <span>{opt.label}</span>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Description / Tooltip (Optional)" name="description">
          <Input placeholder="Short description for this step" />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Form.Item label="Tab Status" orientation="horizontal" name="is_active" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" orientation="horizontal" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
