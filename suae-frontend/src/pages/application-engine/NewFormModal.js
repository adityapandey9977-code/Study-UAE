import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Radio } from "antd";

export default function NewFormModal({ visible, onCancel, onCreate, existingForms = [] }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        form_name: "",
        form_title: "APPLICATION FORM",
        form_slug: "",
        form_description: "",
        template_source: "default",
        status: "active"
      });
    }
  }, [visible, form]);

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        onCreate(values);
      })
      .catch((errorInfo) => {
        // Validation errors are displayed in the form fields UI
      });
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/g, "");
    form.setFieldsValue({ form_slug: slug });
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          <i className="fa fa-plus-circle mr2" style={{ color: "#009688" }}></i>
          Create New Application Form
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create Form"
      cancelText="Cancel"
      destroyOnClose
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          form_title: "APPLICATION FORM",
          template_source: "default",
          status: "active"
        }}
      >
        <Form.Item
          label="Form Name"
          name="form_name"
          rules={[{ required: true, message: "Please enter form name" }]}
        >
          <Input placeholder="e.g. Master Program Application Form 2026" onChange={handleNameChange} />
        </Form.Item>

        <Form.Item
          label="Form Title (Shown at top of form)"
          name="form_title"
          rules={[{ required: true, message: "Please enter form title" }]}
        >
          <Input placeholder="e.g. APPLICATION FORM" />
        </Form.Item>

        <Form.Item label="Form Slug / Identifier" name="form_slug">
          <Input placeholder="e.g. master-program-application" />
        </Form.Item>

        <Form.Item label="Description (Optional)" name="form_description">
          <Input.TextArea rows={2} placeholder="Optional notes or description for this form" />
        </Form.Item>

        <Form.Item label="Initial Template / Starter Schema" name="template_source">
          <Radio.Group>
            <Radio value="default">Preload Standard 6-Tab Template (Recommended)</Radio>
            <Radio value="blank">Start with Blank Tab</Radio>
            {existingForms.length > 0 && (
              <Radio value="clone">Clone from Existing Form</Radio>
            )}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.template_source !== cur.template_source}
        >
          {({ getFieldValue }) =>
            getFieldValue("template_source") === "clone" ? (
              <Form.Item
                label="Select Form to Clone"
                name="clone_form_id"
                rules={[{ required: true, message: "Please select a form to clone" }]}
              >
                <Select placeholder="Choose form to clone from">
                  {existingForms.map((f) => (
                    <Select.Option key={f.id} value={f.id}>
                      {f.form_name} (ID: {f.id})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </Form>
    </Modal>
  );
}
