import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Switch, Row, Col, Button, Card } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const FIELD_TYPES = [
  { label: "Text Input", value: "text" },
  { label: "Email", value: "email" },
  { label: "Phone / Tel", value: "tel" },
  { label: "Number", value: "number" },
  { label: "Date Picker", value: "date" },
  { label: "Dropdown (Select)", value: "select" },
  { label: "Radio Buttons (Yes / No / Options)", value: "radio" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Textarea (Multi-line)", value: "textarea" },
  { label: "File / Document Upload", value: "file" },
  { label: "Data Table / Repeater", value: "table" },
  { label: "Status Alert Bar", value: "alert" },
  { label: "Notice Card (Choice Lock/Info)", value: "card_alert" },
];

const DESKTOP_SIZES = [
  { label: "100% Width (col-md-12)", value: "col-md-12" },
  { label: "50% Width (col-md-6)", value: "col-md-6" },
  { label: "33% Width (col-md-4)", value: "col-md-4" },
  { label: "25% Width (col-md-3)", value: "col-md-3" },
];

export default function FieldModal({ visible, onCancel, onSave, fieldData, existingFields = [], existingGroups = [] }) {
  const [form] = Form.useForm();
  const [fieldType, setFieldType] = useState("text");
  const [optionsList, setOptionsList] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [hasCondition, setHasCondition] = useState(false);

  useEffect(() => {
    if (visible) {
      if (fieldData) {
        setFieldType(fieldData.field_type || "text");
        
        let opts = [];
        if (Array.isArray(fieldData.options)) {
          opts = fieldData.options.map(o => typeof o === 'string' ? { label: o, value: o } : o);
        } else if (typeof fieldData.options === 'object' && fieldData.options !== null) {
          // Could be options object for alert
        }
        setOptionsList(opts);

        let cols = [];
        if (Array.isArray(fieldData.table_columns)) {
          cols = fieldData.table_columns;
        }
        setTableColumns(cols);

        const cond = fieldData.conditional_rules;
        setHasCondition(Boolean(cond && cond.dependsOn));

        form.setFieldsValue({
          label: fieldData.label || "",
          field_name: fieldData.field_name || "",
          field_type: fieldData.field_type || "text",
          group_title: fieldData.group_title || "",
          placeholder: fieldData.placeholder || "",
          default_value: typeof fieldData.default_value === 'object' ? JSON.stringify(fieldData.default_value) : (fieldData.default_value || ""),
          is_required: Boolean(fieldData.is_required),
          desktop_size: fieldData.desktop_size || "col-md-6",
          help_text: fieldData.help_text || "",
          condition_field: cond?.dependsOn || "",
          condition_value: cond?.value || "Yes",
          alert_type: fieldData.options?.alert_type || "info",
          alert_text: fieldData.options?.text || "",
          alert_action: fieldData.options?.action_button || "",
          card_title: fieldData.options?.title || "",
          card_desc: fieldData.options?.description || "",
        });
      } else {
        form.resetFields();
        setFieldType("text");
        setOptionsList([{ label: "Option 1", value: "Option 1" }, { label: "Option 2", value: "Option 2" }]);
        setTableColumns([
          { key: "sn", label: "SN", type: "index" },
          { key: "col1", label: "Column 1", type: "text", required: true },
          { key: "col2", label: "Column 2", type: "select", options: ["Value 1", "Value 2"], required: true }
        ]);
        setHasCondition(false);
        form.setFieldsValue({
          field_type: "text",
          desktop_size: "col-md-6",
          is_required: true,
          condition_value: "Yes",
          alert_type: "info"
        });
      }
    }
  }, [visible, fieldData, form]);

  const handleLabelChange = (e) => {
    const val = e.target.value;
    if (!fieldData) {
      const autoKey = val.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");
      form.setFieldsValue({ field_name: autoKey });
    }
  };

  const handleAddOption = () => {
    setOptionsList([...optionsList, { label: `Option ${optionsList.length + 1}`, value: `Option ${optionsList.length + 1}` }]);
  };

  const handleOptionChange = (index, key, val) => {
    const next = [...optionsList];
    next[index] = { ...next[index], [key]: val };
    if (key === 'label' && (!next[index].value || next[index].value === optionsList[index].label)) {
      next[index].value = val;
    }
    setOptionsList(next);
  };

  const handleDeleteOption = (index) => {
    setOptionsList(optionsList.filter((_, i) => i !== index));
  };

  const handleAddColumn = () => {
    setTableColumns([...tableColumns, { key: `col_${Date.now()}`, label: "New Column", type: "text", required: true }]);
  };

  const handleColumnChange = (index, key, val) => {
    const next = [...tableColumns];
    next[index] = { ...next[index], [key]: val };
    if (key === 'label' && !next[index].key.startsWith('col_manual_')) {
      next[index].key = val.toLowerCase().replace(/[^a-z0-9]/g, "_");
    }
    setTableColumns(next);
  };

  const handleDeleteColumn = (index) => {
    setTableColumns(tableColumns.filter((_, i) => i !== index));
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      let finalOptions = null;
      let finalConditional = null;
      let finalTableCols = null;

      if (["select", "radio", "checkbox"].includes(values.field_type)) {
        finalOptions = optionsList;
      } else if (values.field_type === "alert") {
        finalOptions = {
          alert_type: values.alert_type || "info",
          text: values.alert_text || values.label,
          action_button: values.alert_action || null
        };
      } else if (values.field_type === "card_alert") {
        finalOptions = {
          icon: "fa-lock",
          title: values.card_title || values.label,
          description: values.card_desc || "",
          sub_text: values.placeholder || ""
        };
      }

      if (values.field_type === "table") {
        finalTableCols = tableColumns;
      }

      if (hasCondition && values.condition_field) {
        finalConditional = {
          dependsOn: values.condition_field,
          value: values.condition_value
        };
      }

      onSave({
        ...fieldData,
        ...values,
        is_required: values.is_required ? 1 : 0,
        options: finalOptions,
        conditional_rules: finalConditional,
        table_columns: finalTableCols
      });
    }).catch(() => {});
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          <i className="fa fa-pencil-alt mr2" style={{ color: "#009688" }}></i>
          {fieldData ? `Edit Field: ${fieldData.label}` : "Add New Dynamic Field"}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={fieldData ? "Update Field" : "Add Field"}
      cancelText="Cancel"
      destroyOnClose
      width={720}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Field Label / Title"
              name="label"
              rules={[{ required: true, message: "Please enter field label" }]}
            >
              <Input placeholder="e.g. First Name, Passport Number, Qualifications" onChange={handleLabelChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Field Name / Key (Unique identifier)"
              name="field_name"
              rules={[{ required: true, message: "Please enter field name" }]}
            >
              <Input placeholder="e.g. first_name, passport_no" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Field Type" name="field_type" rules={[{ required: true }]}>
              <Select onChange={(val) => setFieldType(val)}>
                {FIELD_TYPES.map((t) => (
                  <Select.Option key={t.value} value={t.value}>
                    {t.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Sub-Section / Group Header" name="group_title">
              <Select
                mode="combobox"
                placeholder="Select or type a group (e.g. Course of Interest, Contact Details)"
                allowClear
              >
                {existingGroups.map((g) => (
                  <Select.Option key={g} value={g}>
                    {g}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {!["table", "alert", "card_alert"].includes(fieldType) && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Placeholder Text" name="placeholder">
                <Input placeholder="e.g. Enter your first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Default Value" name="default_value">
                <Input placeholder="Default value if any" />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Desktop Grid Size" name="desktop_size">
              <Select>
                {DESKTOP_SIZES.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Required Field (*)" name="is_required" valuePropName="checked">
              <Switch checkedChildren="Required" unCheckedChildren="Optional" />
            </Form.Item>
          </Col>
        </Row>

        {/* Options Builder for Select / Radio / Checkbox */}
        {["select", "radio", "checkbox"].includes(fieldType) && (
          <Card size="small" title="Options List" style={{ marginBottom: 16, background: "#fafafa" }}>
            {optionsList.map((opt, idx) => (
              <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
                <Col span={11}>
                  <Input
                    placeholder="Option Label"
                    value={opt.label}
                    onChange={(e) => handleOptionChange(idx, "label", e.target.value)}
                  />
                </Col>
                <Col span={11}>
                  <Input
                    placeholder="Option Value"
                    value={opt.value}
                    onChange={(e) => handleOptionChange(idx, "value", e.target.value)}
                  />
                </Col>
                <Col span={2}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteOption(idx)}
                  />
                </Col>
              </Row>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddOption} block>
              Add Option
            </Button>
          </Card>
        )}

        {/* Table Columns Builder */}
        {fieldType === "table" && (
          <Card size="small" title="Table Columns Configuration" style={{ marginBottom: 16, background: "#fafafa" }}>
            {tableColumns.map((col, idx) => (
              <Row gutter={8} key={idx} style={{ marginBottom: 8 }} align="middle">
                <Col span={8}>
                  <Input
                    placeholder="Column Header"
                    value={col.label}
                    onChange={(e) => handleColumnChange(idx, "label", e.target.value)}
                  />
                </Col>
                <Col span={7}>
                  <Select
                    style={{ width: "100%" }}
                    value={col.type}
                    onChange={(val) => handleColumnChange(idx, "type", val)}
                  >
                    <Select.Option value="text">Text Input</Select.Option>
                    <Select.Option value="number">Number</Select.Option>
                    <Select.Option value="select">Dropdown</Select.Option>
                    <Select.Option value="file">File Upload</Select.Option>
                    <Select.Option value="index">SN / Index</Select.Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="Key"
                    value={col.key}
                    onChange={(e) => handleColumnChange(idx, "key", e.target.value)}
                  />
                </Col>
                <Col span={3}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteColumn(idx)}
                  />
                </Col>
              </Row>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddColumn} block>
              Add Table Column
            </Button>
          </Card>
        )}

        {/* Alert / Banner specific fields */}
        {fieldType === "alert" && (
          <Card size="small" title="Alert Banner Settings" style={{ marginBottom: 16, background: "#fafafa" }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Alert Type / Color" name="alert_type">
                  <Select>
                    <Select.Option value="success">Success (Green)</Select.Option>
                    <Select.Option value="warning">Warning (Yellow/Amber)</Select.Option>
                    <Select.Option value="info">Info (Blue)</Select.Option>
                    <Select.Option value="error">Error (Red)</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Action Button Label (Optional)" name="alert_action">
                  <Input placeholder="e.g. View, Edit, Retry" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Alert Message Text" name="alert_text">
              <Input.TextArea rows={2} placeholder="e.g. Document uploaded on 22 Jun 2026 @ 12:40 PM" />
            </Form.Item>
          </Card>
        )}

        {/* Card Alert Settings */}
        {fieldType === "card_alert" && (
          <Card size="small" title="Notice Card Settings" style={{ marginBottom: 16, background: "#fafafa" }}>
            <Form.Item label="Card Title" name="card_title">
              <Input placeholder="e.g. Choice Filling Locked" />
            </Form.Item>
            <Form.Item label="Card Description" name="card_desc">
              <Input.TextArea rows={2} placeholder="e.g. You have submitted your choices. The panel is now locked." />
            </Form.Item>
          </Card>
        )}

        {/* Conditional Visibility */}
        <Card size="small" title="Conditional Display Logic" style={{ background: "#fdfdfd" }}>
          <div style={{ marginBottom: 10 }}>
            <Switch
              checked={hasCondition}
              onChange={(checked) => setHasCondition(checked)}
              checkedChildren="Conditional"
              unCheckedChildren="Always Visible"
            />
            <span style={{ marginLeft: 10, fontSize: 13, color: "#666" }}>
              Show this field only when another field has a specific value (e.g. Show Passport fields only when "Do you have a valid passport?" is "Yes")
            </span>
          </div>

          {hasCondition && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Depends on Field" name="condition_field">
                  <Select placeholder="Select parent field">
                    {existingFields
                      .filter((f) => f.field_name !== fieldData?.field_name)
                      .map((f) => (
                        <Select.Option key={f.field_name} value={f.field_name}>
                          {f.label} ({f.field_name})
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="When Value Equals" name="condition_value">
                  <Input placeholder="e.g. Yes, 1, Option" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Card>
      </Form>
    </Modal>
  );
}
