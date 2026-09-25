import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utils/axios';
import { message, Modal } from 'antd';
import util from '../../utils/util';
import './css/web-settings.css';

const getOptionsArray = (optionsVal) => {
  if (!optionsVal) return [];
  if (Array.isArray(optionsVal)) return optionsVal;
  if (typeof optionsVal === 'string') {
    try {
      const parsed = JSON.parse(optionsVal);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
};

export default function FormWidgets({ onBack }) {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('list'); // 'list' | 'new' | 'edit' | 'submissions'
  const [currentWidget, setCurrentWidget] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [subFormId, setSubFormId] = useState(null);

  // Shortcode modal state
  const [embedWidget, setEmbedWidget] = useState(null);
  const [redirectType, setRedirectType] = useState('thankyou');

  const isSuperAdmin = util.isAdmin() === 1 || util.isClientAdmin() === 1;

  const fetchWidgets = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`api/forms?page=${p}&limit=${limit}`);
      if (res.data && res.data.status) {
        setWidgets(res.data.data || []);
        if (res.data.meta) {
          setTotalPages(res.data.meta.total_pages || 1);
        }
      }
    } catch (err) {
      console.error("Error fetching form widgets from PHP API:", err);
      message.error("Failed to load form widgets");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchWidgets(page);
  }, [fetchWidgets, page]);

  async function handleToggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await axiosInstance.post(`api/form/status/`, {
        form_id: id,
        status: newStatus
      });
      if (res.data && res.data.status) {
        message.success(`Form status updated to ${newStatus}`);
        fetchWidgets(page);
      } else {
        throw new Error(res.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      message.error(err.message || "Failed to update status");
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this form widget? All associated fields will be deleted.")) return;
    try {
      const res = await axiosInstance.post(`api/form/delete/${id}`, {
        _method: 'DELETE'
      });
      if (res.data && res.data.status) {
        message.success("Form widget deleted successfully");
        fetchWidgets(page);
      } else {
        throw new Error(res.data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting form widget:", err);
      message.error(err.message || "Failed to delete form widget");
    }
  };

  const handleEditClick = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`api/form/${id}/`);
      if (res.data && res.data.status && res.data.data) {
        const raw = res.data.data;
        setCurrentWidget({
          id: raw.id,
          form_name: raw.form_name || '',
          form_title: raw.form_title || '',
          form_description: raw.form_description || '',
          form_logo_image: raw.form_logo_image ? util.normalizeUploadsUrl(raw.form_logo_image, 'php') : '',
          form_slug: raw.form_slug || '',
          form_class: raw.form_class || 'admission-form',
          form_id: raw.form_id || 'contactForm1',
          background_color: raw.background_color || '#ffffff',
          form_color: raw.form_color || '#000000',
          input_text_color: raw.input_text_color || '#000000',
          heading_color: raw.heading_color || '#000000',
          subheading_color: raw.subheading_color || '#666666',
          button_color: raw.button_color || '#182b67',
          button_text_color: raw.button_text_color || '#ffffff',
          button_value: raw.button_value || '',
          otp_channel: raw.otp_channel || 'SMS',
          require_declaration: raw.require_declaration === 1 || raw.require_declaration === true,
          declaration_text: raw.declaration_text || '',
          desktop_width: raw.desktop_width || '800px',
          desktop_height: raw.desktop_height || 'auto',
          mobile_width: raw.mobile_width || '100%',
          mobile_height: raw.mobile_height || 'auto',
          status: raw.status || 'active',
          fields: (raw.fields || []).map(f => {
            let mappedType = f.field_type;
            if (f.field_type === 'select') {
              if (f.field_name === 'country_id') mappedType = 'select_country';
              else if (f.field_name === 'course_id') mappedType = 'select_course';
              else if (f.field_name === 'academic_career_id' || f.field_name === 'academic_career' || f.field_name === 'acadmic_career') mappedType = 'select_academic_career';
              else if (f.field_name === 'discipline_id') mappedType = 'select_discipline';
              else if (f.field_name === 'otp_channel') mappedType = 'otp_channel';
              else if (f.field_name === 'isd_code') mappedType = 'select_isd_code';
            } else if (f.field_type === 'password' && f.field_name === 'confirm_password') {
              mappedType = 'confirm_password';
            }

            let mapField = '';
            if (f.field_name === 'fname') {
              // Distinguish first name vs father's name mapping based on label or map_field if stored
              if (f.map_field) {
                mapField = f.map_field;
              } else {
                const labelLower = String(f.label || '').toLowerCase();
                if (labelLower.includes('father')) {
                  mapField = 'father_name';
                } else {
                  mapField = 'first_name';
                }
              }
            }
            else if (f.field_name === 'lname') mapField = 'last_name';
            else if (f.field_name === 'full_name' || f.field_name === 'name') mapField = 'name';
            else if (f.field_name === 'email') mapField = 'email';
            else if (f.field_name === 'mobile') mapField = 'mobile';
            else if (f.field_name === 'gender') mapField = 'gender';
            else if (f.field_name === 'dob') mapField = 'dob';
            else if (f.field_name === 'father') mapField = 'father_name';
            else if (f.field_name === 'mother') mapField = 'mother_name';
            else if (f.field_name === 'academic_career') mapField = 'academic_career';
            else if (f.field_name === 'discipline') mapField = 'discipline';
            else if (f.field_name === 'course_id') mapField = 'course_id';
            else if (f.field_name === 'country_id') mapField = 'country_id';
            else if (f.field_name === 'state') mapField = 'state';
            else if (f.field_name === 'city') mapField = 'city';
            else if (f.field_name === 'address') mapField = 'address';

            return {
              ...f,
              field_type: mappedType,
              map_field: f.map_field || mapField,
              is_required: Number(f.is_required) === 1,
              validation_rules: typeof f.validation_rules === 'string' ? JSON.parse(f.validation_rules) : (f.validation_rules || null),
              options: typeof f.options === 'string' ? JSON.parse(f.options) : (f.options || null)
            };
          })
        });
        setMode('edit');
      }
    } catch (err) {
      console.error("Error fetching form details:", err);
      message.error("Failed to load form widget settings");
    } finally {
      setLoading(false);
    }
  };

  const handleNewClick = () => {
    setCurrentWidget({
      form_name: 'New Custom Form',
      form_title: 'Apply Now to Your Dream University in the UAE .',
      form_description: 'Share your details and our admissions team will help you shortlist universities, compare programs, and plan your next step.',
      form_logo_image: '',
      form_slug: 'new-custom-form',
      form_class: 'admission-form',
      form_id: 'contactForm1',
      background_color: '#ffffff',
      form_color: '#000000',
      input_text_color: '#000000',
      heading_color: '#000000',
      subheading_color: '#666666',
      button_color: '#182b67',
      button_text_color: '#ffffff',
      button_value: 'Submit',
      otp_channel: 'SMS',
      require_declaration: false,
      declaration_text: '',
      desktop_width: '800px',
      desktop_height: 'auto',
      mobile_width: '100%',
      mobile_height: 'auto',
      status: 'active',
      fields: [
        { label: 'Full Name', field_name: 'name', field_type: 'text', placeholder: 'Enter full name', is_required: true, field_class: 'form-control', field_id: 'fullName', desktop_size: 'col-md-6', mobile_size: 'col-12', validation_rules: { min: 3, max: 50 }, options: null, field_order: 1 },
        { label: 'Email Address', field_name: 'email', field_type: 'email', placeholder: 'Enter email address', is_required: true, field_class: 'form-control', field_id: 'email', desktop_size: 'col-md-6', mobile_size: 'col-12', validation_rules: { max: 100 }, options: null, field_order: 2 }
      ]
    });
    setMode('new');
  };

  const fetchSubmissions = async (formId) => {
    setSubmissionsLoading(true);
    setSubFormId(formId);
    try {
      const res = await axiosInstance.get(`api/form/submissions/${formId}`);
      if (res.data && res.data.status) {
        setSubmissions(res.data.data || []);
        setMode('submissions');
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      message.error("Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleFieldChange = (index, key, val) => {
    const updatedFields = [...(currentWidget.fields || [])];
    updatedFields[index] = {
      ...updatedFields[index],
      [key]: val
    };
    if (key === 'field_type') {
      if (val === 'select_country') {
        updatedFields[index].label = 'Country';
        updatedFields[index].field_name = 'country_id';
        updatedFields[index].placeholder = 'Select Country';
      } else if (val === 'select_course') {
        updatedFields[index].label = 'Course';
        updatedFields[index].field_name = 'course_id';
        updatedFields[index].placeholder = 'Select Course';
      } else if (val === 'select_academic_career') {
        updatedFields[index].label = 'Academic Career';
        updatedFields[index].field_name = 'academic_career';
        updatedFields[index].placeholder = 'Select Academic Career';
      } else if (val === 'select_discipline') {
        updatedFields[index].label = 'Discipline';
        updatedFields[index].field_name = 'discipline_id';
        updatedFields[index].placeholder = 'Select Discipline';
      } else if (val === 'confirm_password') {
        updatedFields[index].label = 'Confirm Password';
        updatedFields[index].field_name = 'confirm_password';
        updatedFields[index].placeholder = 'Confirm Password';
      } else if (val === 'password') {
        updatedFields[index].label = 'Password';
        updatedFields[index].field_name = 'password';
        updatedFields[index].placeholder = 'Enter password';
      } else if (val === 'email') {
        updatedFields[index].label = 'Email Address';
        updatedFields[index].field_name = 'email';
        updatedFields[index].placeholder = 'Enter email address';
      } else if (val === 'otp_channel') {
        updatedFields[index].label = 'OTP Channel';
        updatedFields[index].field_name = 'otp_channel';
        updatedFields[index].placeholder = 'Select OTP Channel';
        updatedFields[index].options = [
          { label: 'Whatsapp', value: 'Whatsapp' },
          { label: 'SMS', value: 'SMS' }
        ];
      } else if (val === 'select_isd_code') {
        updatedFields[index].label = 'Country Code';
        updatedFields[index].field_name = 'isd_code';
        updatedFields[index].placeholder = 'Select Country Code';
      }
    }
    setCurrentWidget(prev => ({
      ...prev,
      fields: updatedFields
    }));
  };

  const handleMapFieldChange = (index, mapVal) => {
    const updatedFields = [...(currentWidget.fields || [])];
    updatedFields[index] = {
      ...updatedFields[index],
      map_field: mapVal
    };
    if (mapVal) {
      let fieldName = mapVal;
      if (mapVal === 'first_name') fieldName = 'fname';
      else if (mapVal === 'last_name') fieldName = 'lname';
      else if (mapVal === 'father_name') fieldName = 'father';
      else if (mapVal === 'mother_name') fieldName = 'mother';
      else if (mapVal === 'name') fieldName = 'name';
      
      updatedFields[index].field_name = fieldName;
    }
    setCurrentWidget(prev => ({
      ...prev,
      fields: updatedFields
    }));
  };

  const isFieldNameDisabled = (field) => {
    if (field.map_field) return true;
    return ['email', 'password', 'confirm_password', 'select_academic_career', 'select_country', 'select_discipline', 'select_course', 'otp_channel', 'select_isd_code'].includes(field.field_type);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', '');

    try {
      message.loading({ content: 'Uploading logo...', key: 'logoupload' });
      const res = await axiosInstance.post('file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const payload = res?.data?.result || res?.data || {};
      const fileUrl = payload.file_url ?? payload.url ?? res?.data?.file_url;

      if (fileUrl) {
        const finalUrl = util.normalizeUploadsUrl(fileUrl, 'php');
        setCurrentWidget(prev => ({
          ...prev,
          form_logo_image: finalUrl
        }));
        message.success({ content: 'Logo uploaded successfully', key: 'logoupload' });
      } else {
        throw new Error('Upload succeeded but no file URL returned');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      message.error({ content: 'Failed to upload logo image', key: 'logoupload' });
    }
  };

  const addField = () => {
    const newOrder = (currentWidget.fields || []).length + 1;
    setCurrentWidget(prev => ({
      ...prev,
      fields: [
        ...(prev.fields || []),
        {
          label: 'New Field',
          field_name: 'new_field_' + Date.now(),
          field_type: 'text',
          placeholder: 'Enter details',
          is_required: false,
          field_class: 'form-control',
          field_id: 'field_' + newOrder,
          desktop_size: 'col-md-6',
          mobile_size: 'col-12',
          validation_rules: null,
          options: null,
          field_order: newOrder
        }
      ]
    }));
  };

  const removeField = (index) => {
    setCurrentWidget(prev => ({
      ...prev,
      fields: (prev.fields || []).filter((_, i) => i !== index).map((f, i) => ({ ...f, field_order: i + 1 }))
    }));
  };

  const swapFields = (index1, index2) => {
    if (
      index1 < 0 ||
      index1 >= (currentWidget.fields || []).length ||
      index2 < 0 ||
      index2 >= (currentWidget.fields || []).length
    ) {
      return;
    }
    const updatedFields = [...(currentWidget.fields || [])];
    const temp = updatedFields[index1];
    updatedFields[index1] = updatedFields[index2];
    updatedFields[index2] = temp;

    setCurrentWidget(prev => ({
      ...prev,
      fields: updatedFields.map((f, i) => ({ ...f, field_order: i + 1 }))
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Format fields schema to match PHP API expectations
    const formattedFields = (currentWidget.fields || []).map((f) => {
      let validation_rules = f.validation_rules;
      if (typeof validation_rules === 'string') {
        try { validation_rules = JSON.parse(validation_rules); } catch (e) { }
      }
      let options = f.options;
      if (typeof options === 'string') {
        try { options = JSON.parse(options); } catch (e) { }
      }
      
      let dbType = f.field_type;
      if (['select_country', 'select_course', 'select_academic_career', 'select_discipline', 'otp_channel', 'select_isd_code'].includes(dbType)) {
        dbType = 'select';
      } else if (dbType === 'confirm_password') {
        dbType = 'password';
      }

      return {
        ...f,
        field_type: dbType,
        is_required: f.is_required ? 1 : 0,
        validation_rules: validation_rules || null,
        options: options || null
      };
    });

    const payload = {
      ...currentWidget,
      require_declaration: currentWidget.require_declaration ? 1 : 0,
      fields: formattedFields
    };

    try {
      if (mode === 'new') {
        const res = await axiosInstance.post('api/form/create', payload);
        if (res.data && res.data.status) {
          message.success("Form widget created successfully");
          setMode('list');
          fetchWidgets(page);
        } else {
          throw new Error(res.data.message || "Failed to create");
        }
      } else {
        const res = await axiosInstance.post(`api/form/update/${currentWidget.id}`, {
          ...payload,
          _method: 'PUT'
        });
        if (res.data && res.data.status) {
          message.success("Form widget updated successfully");
          setMode('list');
          fetchWidgets(page);
        } else {
          throw new Error(res.data.message || "Failed to update");
        }
      }
    } catch (err) {
      console.error("Error saving form widget:", err);
      message.error(err.message || "Failed to save form widget settings");
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="hero-editor-card">
        <div style={{ fontSize: '48px', color: '#e73d4a', marginBottom: '20px', textAlign: 'center' }}>
          <i className="fa fa-exclamation-triangle" />
        </div>
        <h3 style={{ textAlign: 'center' }}>Access Denied</h3>
        <p style={{ color: '#666', fontSize: '15px', textAlign: 'center' }}>Only Super Admins are authorized to manage form widgets on this platform.</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="button" className="btn-back" onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getSubmissionsColumns = () => {
    if (submissions.length === 0) return [];
    const keys = new Set();
    submissions.forEach(sub => {
      if (sub.submission_data) {
        let parsed = sub.submission_data;
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch (e) { }
        }
        Object.keys(parsed || {}).forEach(k => keys.add(k));
      }
    });
    return Array.from(keys);
  };

  const getEmbedCodes = (w, type = 'thankyou') => {
    if (!w) return { jsShort: '', iframeShort: '' };
    const slug = w.form_slug;
    const apiOrigin = (util && util.apiUrlNode ? util.apiUrlNode : window.location.origin).replace(/\/+$/, '');
    const panelOrigin = window.location.origin;
    const redirectUrl = type === 'thankyou' 
      ? `${panelOrigin}/thank-you` 
      : `${panelOrigin}/student-login`;
    const jsShort = `<div class="suae-dynamic-form" data-slug="${slug}"></div>\n<script src="${apiOrigin}/theme/js/form-embed.js"></script>`;
    
    let iframeShort;
    if (type === 'login') {
      iframeShort = `<iframe src="${apiOrigin}/api/form/embed/${slug}" width="100%" height="600" frameborder="0" style="border:none;"></iframe>`;
    } else if (type === 'dynamic_height') {
      iframeShort = `<iframe src="${apiOrigin}/api/form/embed/${slug}" class="suae-iframe-embed" data-slug="${slug}" width="100%" height="600" frameborder="0" style="border:none;"></iframe>\n \n<script>\nwindow.addEventListener("message", function(e) {\n    if (e.data && e.data.type === "suae-form-resize") {\n        var iframes = document.querySelectorAll("iframe");\n        for (var i = 0; i < iframes.length; i++) {\n            var iframe = iframes[i];\n            if (iframe.src.indexOf("/form/embed/" + e.data.slug) !== -1 || iframe.getAttribute("data-slug") === e.data.slug) {\n                iframe.style.height = e.data.height + "px";\n            }\n        }\n    }\n});\n</script>`;
    } else if (type === 'js_code') {
      iframeShort = jsShort;
    } else if (type === 'js_code_thankyou') {
      iframeShort = `<div class="suae-dynamic-form" data-slug="${slug}" data-redirect-url="${panelOrigin}/thank-you"></div>\n<script src="${apiOrigin}/theme/js/form-embed.js"></script>`;
    } else {
      iframeShort = `<iframe src="${apiOrigin}/api/form/embed/${slug}?redirect_url=${redirectUrl}" width="100%" height="600" frameborder="0" style="border:none;"></iframe>`;
    }
    return { jsShort, iframeShort };
  };

  return (
    <div className="hero-editor-card form-widgets-page">
      <style>{`
        .form-widgets-page {
          padding: 20px 22px !important;
          min-height: auto !important;
          overflow: visible !important;
        }

        .form-widgets-page > .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 0 16px !important;
          margin: 0 !important;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-widgets-page > .editor-header h3 {
          margin: 0 0 4px !important;
          font-size: 24px;
          line-height: 1.2;
        }

        .form-widgets-page > .editor-header p {
          margin: 0 !important;
          color: #64748b;
        }

        .form-widgets-page .editor-body {
          padding: 16px 0 0 !important;
        }

        .form-widgets-page .cms-widgets-table-container {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
        }

        .form-widgets-page .cms-widgets-table-container table {
          margin-top: 0 !important;
          min-width: 980px;
        }

        .form-widgets-page .cms-widgets-table-container th,
        .form-widgets-page .cms-widgets-table-container td {
          padding: 10px 12px !important;
          vertical-align: middle;
        }

        .form-widgets-page .cms-widgets-table-container tbody tr:last-child {
          border-bottom: 0 !important;
        }

        .form-widgets-page .cms-widgets-table-container td:last-child {
          white-space: nowrap;
        }

        .form-widgets-page .cms-widgets-table-container td:last-child button {
          margin-right: 6px !important;
          padding: 6px 10px !important;
        }

        .form-widgets-page .cms-widgets-table-container td:last-child button:last-child {
          margin-right: 0 !important;
        }

        .form-widgets-page .form-builder-layout {
          display: grid !important;
         
          /* grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr) !important; */  
          gap: 20px !important;
          margin-top: 0 !important;
          align-items: start;
        }

        .form-widgets-page .form-builder-controls {
          height: calc(100vh - 235px) !important;
          max-height: calc(100vh - 235px) !important;
          overflow-y: auto !important;
          padding: 18px !important;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          scrollbar-width: thin;
        }

        .form-widgets-page .form-builder-controls .cms-field-group {
          margin-top: 0 !important;
        }

        .form-widgets-page .form-builder-controls .cms-field-group + .cms-field-group {
          margin-top: 20px !important;
          padding-top: 18px;
          border-top: 1px solid #e5e7eb;
        }

        .form-widgets-page .cms-field-grid.two-col {
          gap: 12px !important;
          margin-bottom: 14px !important;
        }

        .form-widgets-page .cms-field-grid.three-col {
          gap: 12px !important;
        }

        .form-widgets-page .field {
          min-width: 0;
        }

        .form-widgets-page .field label {
          display: block;
          margin-bottom: 6px;
        }

        .form-widgets-page .editor-input,
        .form-widgets-page .editor-textarea {
          width: 100%;
          box-sizing: border-box;
        }

        .form-widgets-page .form-builder-preview-pane {
          position: sticky;
          top: 16px;
          height: calc(100vh - 235px) !important;
          max-height: calc(100vh - 235px) !important;
          padding: 18px !important;
          justify-content: flex-start !important;
          overflow-y: auto !important;
          border: 1px solid #e2e8f0;
          scrollbar-width: thin;
        }

        .form-widgets-page .screenshot-form-card {
          max-width: 100% !important;
          padding: 20px !important;
          gap: 13px !important;
        }

        .form-widgets-page .editor-footer {
          margin-top: 18px !important;
          padding: 16px 0 0 !important;
        }

        @media (max-width: 1180px) {
          .form-widgets-page .form-builder-layout {
            grid-template-columns: 1fr !important;
          }

          .form-widgets-page .form-builder-controls {
            max-height: none;
            overflow: visible;
          }

          .form-widgets-page .form-builder-preview-pane {
            position: static;
            min-height: auto;
          }
        }

        @media (max-width: 768px) {
          .form-widgets-page {
            padding: 16px !important;
          }

          .form-widgets-page > .editor-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-widgets-page > .editor-header > div:last-child {
            width: 100%;
            flex-wrap: wrap;
          }

          .form-widgets-page .cms-field-grid.two-col,
          .form-widgets-page .cms-field-grid.three-col {
            grid-template-columns: 1fr !important;
          }

          .form-widgets-page .screenshot-form-card > div[style*="flex: 1"] {
                flex-basis: 100% !important;
          }
        }
      `}</style>
      <div className="editor-header">
        <div>
          <h3>Custom Form Widgets</h3>
          <p>Create and customize multiple PHP-backed database forms</p>
        </div>

        {mode === 'list' ? (
          <div className="form-widgets-header-actions">
            <button
              type="button"
              className="form-widget-header-btn form-widget-header-btn-primary"
              onClick={handleNewClick}
            >
              <i className="fa fa-plus" />
              <span>Create New Widget</span>
            </button>

            <button
              type="button"
              className="form-widget-header-btn form-widget-header-btn-secondary"
              onClick={onBack}
            >
              <i className="fa fa-arrow-left" />
              <span>Back</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="form-widget-header-btn form-widget-header-btn-secondary"
            onClick={() => setMode('list')}
          >
            <i className="fa fa-arrow-left" />
            <span>Cancel & Back</span>
          </button>
        )}
      </div>

      {loading && mode === 'list' ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <i className="fa fa-spinner fa-spin" style={{ fontSize: '24px', marginRight: '10px' }} />
          Loading widgets...
        </div>
      ) : mode === 'list' ? (
        <div className="editor-body">
          {widgets.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #ddd', borderRadius: '8px', color: '#666' }}>
              No custom form widgets found. Click "Create New Widget" above to build your first lead capture widget!
            </div>
          ) : (
            <div className="cms-widgets-table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', background: '#f9f9f9', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Form Name</th>
                    <th style={{ padding: '12px' }}>Slug</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Active Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {widgets.map((w) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', color: '#888' }}>#{w.id}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{w.form_name}</td>
                      <td style={{ padding: '12px', color: '#555' }}><code>{w.form_slug}</code></td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(w.id, w.status)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: w.status === 'active' ? '#22c55e' : '#cbd5e1'
                          }}
                          title={w.status === 'active' ? "Active Form" : "Inactive Form"}
                        >
                          <i className={`fa ${w.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off'}`} />
                          <span style={{ fontSize: '13px', marginLeft: '6px', color: w.status === 'active' ? '#15803d' : '#64748b' }}>
                            {w.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => { setEmbedWidget(w); setRedirectType('thankyou'); }}
                          style={{
                            marginRight: '8px',
                            padding: '6px 12px',
                            border: '1px solid #10b981',
                            color: '#10b981',
                            background: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa fa-code" style={{ marginRight: '4px' }} />
                          Embed Code
                        </button>
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => fetchSubmissions(w.id)}
                          style={{
                            marginRight: '8px',
                            padding: '6px 12px',
                            border: '1px solid #4f46e5',
                            color: '#4f46e5',
                            background: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa fa-list" style={{ marginRight: '4px' }} />
                          Submission Data
                        </button>
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => handleEditClick(w.id)}
                          style={{
                            marginRight: '8px',
                            padding: '6px 12px',
                            border: '1px solid #182b67',
                            color: '#182b67',
                            background: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa fa-edit" style={{ marginRight: '4px' }} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => handleDelete(w.id)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            background: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa fa-trash" style={{ marginRight: '4px' }} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ padding: '6px 12px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: 'center' }}>Page {page} of {totalPages}</span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={{ padding: '6px 12px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : mode === 'submissions' ? (
        <div className="editor-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4>Submissions Log for Form ID #{subFormId}</h4>
            {/* <button type="button" className="btn-back" onClick={() => setMode('list')}>
              Back to List
            </button> */}
          </div>
          {submissionsLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <i className="fa fa-spinner fa-spin" style={{ fontSize: '24px' }} />
            </div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #ddd', borderRadius: '8px' }}>
              No submissions recorded yet for this form.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', background: '#f9f9f9', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    {getSubmissionsColumns().map(col => (
                      <th key={col} style={{ padding: '12px', textTransform: 'capitalize' }}>{col.replace('_', ' ')}</th>
                    ))}
                    <th style={{ padding: '12px' }}>IP Address</th>
                    <th style={{ padding: '12px' }}>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => {
                    let subData = sub.submission_data || {};
                    if (typeof subData === 'string') {
                      try { subData = JSON.parse(subData); } catch (e) { }
                    }
                    return (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', color: '#888' }}>#{sub.id}</td>
                        {getSubmissionsColumns().map(col => (
                          <td key={col} style={{ padding: '12px' }}>
                            {subData[col] !== undefined ? String(subData[col]) : '-'}
                          </td>
                        ))}
                        <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>{sub.ip_address}</td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>{sub.created_at}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Edit / Create Form Builder View */
        <form onSubmit={handleSave}>
          <div className="editor-body">
            <div className="form-builder-layout">

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px', height: 'calc(100vh - 300px)', minHeight: '600px' }}>

                {/* Form customizer controls */}
                <div className="form-builder-controls" style={{ overflowY: 'auto', paddingRight: '12px', height: '100%' }}>
                  <div className="cms-field-group">
                    <h4 className="editor-section-title">Form Configuration</h4>
                    <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="field">
                        <label>Form Display Name</label>
                        <input
                          className="editor-input"
                          value={currentWidget.form_name || ''}
                          onChange={(e) => {
                            const name = e.target.value;
                            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            setCurrentWidget({ ...currentWidget, form_name: name, form_slug: slug });
                          }}
                          required
                        />
                      </div>
                      <div className="field">
                        <label>Form Slug (unique URL slug)</label>
                        <input
                          className="editor-input"
                          value={currentWidget.form_slug || ''}
                          onChange={(e) => setCurrentWidget({ ...currentWidget, form_slug: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="field">
                        <label>Form Class (CSS styling class)</label>
                        <input
                          className="editor-input"
                          value={currentWidget.form_class || ''}
                          onChange={(e) => setCurrentWidget({ ...currentWidget, form_class: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Form ID selector</label>
                        <input
                          className="editor-input"
                          value={currentWidget.form_id || ''}
                          onChange={(e) => setCurrentWidget({ ...currentWidget, form_id: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="field">
                        <label>Background Color</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            className="editor-input"
                            style={{ flex: 1 }}
                            value={currentWidget.background_color || ''}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, background_color: e.target.value })}
                          />
                          <input
                            type="color"
                            value={currentWidget.background_color || '#ffffff'}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, background_color: e.target.value })}
                            style={{ width: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="field">
                        <label>Desktop Width</label>
                        <input
                          className="editor-input"
                          value={currentWidget.desktop_width || ''}
                          onChange={(e) => setCurrentWidget({ ...currentWidget, desktop_width: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Mobile Width</label>
                        <input
                          className="editor-input"
                          value={currentWidget.mobile_width || ''}
                          onChange={(e) => setCurrentWidget({ ...currentWidget, mobile_width: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="cms-field-group" style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', background: '#f8fafc' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Form Logo</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {currentWidget.form_logo_image ? (
                          <div style={{ position: 'relative', width: '64px', height: '64px', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              key={currentWidget.form_logo_image}
                              src={currentWidget.form_logo_image}
                              alt="Logo Thumbnail"
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                            <button
                              type="button"
                              onClick={() => setCurrentWidget({ ...currentWidget, form_logo_image: '' })}
                              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <div style={{ width: '64px', height: '64px', border: '1px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: '#fff', fontSize: '10px', textAlign: 'center', padding: '4px' }}>
                            No Logo Chosen
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                          <input
                            type="text"
                            className="editor-input"
                            value={currentWidget.form_logo_image || ''}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, form_logo_image: e.target.value })}
                            placeholder="Or paste direct image URL..."
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          />
                          <label
                            htmlFor="logo-file-input"
                            style={{ display: 'inline-block', width: 'fit-content', padding: '6px 12px', background: '#182b67', color: 'white', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', margin: 0 }}
                          >
                            <i className="fa fa-upload" style={{ marginRight: '6px' }} />
                            Upload Logo
                          </label>
                          <input
                            id="logo-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="field">
                        <label>Input Text Color</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            className="editor-input"
                            style={{ flex: 1 }}
                            value={currentWidget.input_text_color || ''}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, input_text_color: e.target.value })}
                          />
                          <input
                            type="color"
                            value={currentWidget.input_text_color || '#000000'}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, input_text_color: e.target.value })}
                            style={{ width: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label>Button Text / Value</label>
                        <input
                          className="editor-input"
                          value={currentWidget.button_value || ''}
                          onChange={(e) => setCurrentWidget({ ...currentWidget, button_value: e.target.value })}
                          placeholder="e.g. Submit, Register Now"
                        />
                      </div>
                    </div>

                    <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="field">
                        <label>Heading Color</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            className="editor-input"
                            style={{ flex: 1 }}
                            value={currentWidget.heading_color || ''}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, heading_color: e.target.value })}
                          />
                          <input
                            type="color"
                            value={currentWidget.heading_color || '#000000'}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, heading_color: e.target.value })}
                            style={{ width: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label>Subheading Color</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            className="editor-input"
                            style={{ flex: 1 }}
                            value={currentWidget.subheading_color || ''}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, subheading_color: e.target.value })}
                          />
                          <input
                            type="color"
                            value={currentWidget.subheading_color || '#666666'}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, subheading_color: e.target.value })}
                            style={{ width: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="field">
                        <label>Button Background Color</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            className="editor-input"
                            style={{ flex: 1 }}
                            value={currentWidget.button_color || ''}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, button_color: e.target.value })}
                          />
                          <input
                            type="color"
                            value={currentWidget.button_color || '#182b67'}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, button_color: e.target.value })}
                            style={{ width: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label>Button Text Color</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            className="editor-input"
                            style={{ flex: 1 }}
                            value={currentWidget.button_text_color || ''}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, button_text_color: e.target.value })}
                          />
                          <input
                            type="color"
                            value={currentWidget.button_text_color || '#ffffff'}
                            onChange={(e) => setCurrentWidget({ ...currentWidget, button_text_color: e.target.value })}
                            style={{ width: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="field" style={{ marginBottom: '20px' }}>
                      <label>Form Title Headline</label>
                      <input
                        className="editor-input"
                        value={currentWidget.form_title || ''}
                        onChange={(e) => setCurrentWidget({ ...currentWidget, form_title: e.target.value })}
                        placeholder="e.g. Apply Now to Your Dream University in the UAE"
                      />
                    </div>

                    <div className="field" style={{ marginBottom: '20px' }}>
                      <label>Form Description Subtitle</label>
                      <textarea
                        className="editor-textarea"
                        rows={3}
                        value={currentWidget.form_description || ''}
                        onChange={(e) => setCurrentWidget({ ...currentWidget, form_description: e.target.value })}
                        placeholder="e.g. Share your details and our admissions team will help you..."
                      />
                    </div>



                    <div className="field" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="require_declaration_checkbox"
                        checked={!!currentWidget.require_declaration}
                        onChange={(e) => setCurrentWidget({ ...currentWidget, require_declaration: e.target.checked })}
                      />
                      <label htmlFor="require_declaration_checkbox" style={{ fontWeight: 'bold', cursor: 'pointer', margin: 0 }}>
                        Require Declaration Checkbox
                      </label>
                    </div>

                    {currentWidget.require_declaration && (
                      <div className="field" style={{ marginBottom: '20px' }}>
                        <label>Declaration Text</label>
                        <textarea
                          className="editor-textarea"
                          rows={3}
                          value={currentWidget.declaration_text || ''}
                          onChange={(e) => setCurrentWidget({ ...currentWidget, declaration_text: e.target.value })}
                          placeholder="e.g. I authorize Study in UAE Scholarship to contact me via call, email, SMS, or WhatsApp and agree to the Terms & Privacy Policy."
                        />
                      </div>
                    )}
                  </div>

                  <div className="cms-field-group" style={{ marginTop: '30px' }}>
                    <h4 className="editor-section-title">Customize Input Fields</h4>
                    <p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>
                      Define structural custom field variables to build the dynamic form list.
                    </p>

                    {(currentWidget.fields || []).map((field, index) => (
                      <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '15px', marginBottom: '15px', position: 'relative', background: '#fcfcfc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#182b67' }}>Field #{index + 1}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => swapFields(index, index - 1)}
                                disabled={index === 0}
                                style={{ border: '1px solid #cbd5e1', background: index === 0 ? '#f1f5f9' : '#fff', color: index === 0 ? '#94a3b8' : '#475569', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '11px', padding: 0 }}
                                title="Move Up"
                              >
                                <i className="fa fa-arrow-up" />
                              </button>
                              <button
                                type="button"
                                onClick={() => swapFields(index, index + 1)}
                                disabled={index === (currentWidget.fields || []).length - 1}
                                style={{ border: '1px solid #cbd5e1', background: index === (currentWidget.fields || []).length - 1 ? '#f1f5f9' : '#fff', color: index === (currentWidget.fields || []).length - 1 ? '#94a3b8' : '#475569', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: index === (currentWidget.fields || []).length - 1 ? 'not-allowed' : 'pointer', fontSize: '11px', padding: 0 }}
                                title="Move Down"
                              >
                                <i className="fa fa-arrow-down" />
                              </button>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeField(index)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                            <i className="fa fa-trash" />
                          </button>
                        </div>

                        <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
                          <div className="field">
                            <label>Field Name</label>
                             <input
                              className="editor-input"
                              value={field.field_name || ''}
                              onChange={(e) => handleFieldChange(index, 'field_name', e.target.value)}
                              disabled={isFieldNameDisabled(field)}
                              style={isFieldNameDisabled(field) ? { background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : {}}
                              required
                            />
                          </div>
                          <div className="field">
                            <label>Map to Database Field</label>
                            <select
                              className="editor-input"
                              value={field.map_field || ''}
                              onChange={(e) => handleMapFieldChange(index, e.target.value)}
                            >
                              <option value="">Custom Field (No Mapping)</option>
                              <option value="name">Full Name (name)</option>
                              <option value="first_name">First Name (fname)</option>
                              <option value="last_name">Last Name (lname)</option>
                              <option value="email">Email Address (email)</option>
                              <option value="mobile">Mobile Number (mobile)</option>
                              <option value="gender">Gender (gender)</option>
                              <option value="dob">Date of Birth (dob)</option>
                              <option value="father_name">Father's Name (father)</option>
                              <option value="mother_name">Mother's Name (mother)</option>
                              <option value="academic_career">Academic Career (academic_career)</option>
                              <option value="discipline">Discipline (discipline)</option>
                              <option value="course_id">Course (course_id)</option>
                              <option value="country_id">Country (country_id)</option>
                              <option value="state">State (state)</option>
                              <option value="city">City (city)</option>
                              <option value="address">Address (address)</option>
                            </select>
                          </div>
                        </div>

                        <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
                          <div className="field" style={{ gridColumn: 'span 2' }}>
                            <label>Display Label</label>
                            {(field.field_type === 'checkbox' || field.field_type === 'textarea') ? (
                              <textarea
                                className="editor-input"
                                style={{ width: '100%', minHeight: '60px', padding: '8px', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '12px' }}
                                value={field.label || ''}
                                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                                required
                              />
                            ) : (
                              <input
                                className="editor-input"
                                value={field.label || ''}
                                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                                required
                              />
                            )}
                          </div>
                        </div>

                        <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
                          <div className="field">
                            <label>Field Type</label>
                             <select
                              className="editor-input"
                              value={field.field_type || 'text'}
                              onChange={(e) => handleFieldChange(index, 'field_type', e.target.value)}
                            >
                              <option value="text">Text Input</option>
                              <option value="email">Email</option>
                              <option value="mobile">Mobile / Phone</option>
                              <option value="password">Password Input</option>
                              <option value="confirm_password">Confirm Password</option>
                              <option value="number">Number Input</option>
                              <option value="date">Date picker field</option>
                              <option value="textarea">Multi-line text area</option>
                              <option value="select">Dropdown Options</option>
                              <option value="select_country">Select Country (Dynamic)</option>
                              <option value="select_isd_code">Country Code (Dynamic)</option>
                              <option value="select_course">Select Course (Dynamic)</option>
                              <option value="select_academic_career">Select Academic Career (Dynamic)</option>
                              <option value="select_discipline">Select Discipline (Dynamic)</option>
                              <option value="radio">Radio Option Group</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="captcha">Math Captcha</option>
                              <option value="otp">OTP input validation</option>
                              <option value="otp_channel">OTP Channel (Whatsapp / SMS)</option>
                            </select>
                          </div>
                          <div className="field">
                            <label>Placeholder Text</label>
                            <input
                              className="editor-input"
                              value={field.placeholder || ''}
                              onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="cms-field-grid two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div className="field">
                            <label>Desktop Grid Width</label>
                            <select
                              className="editor-input"
                              value={field.desktop_size || 'col-md-6'}
                              onChange={(e) => handleFieldChange(index, 'desktop_size', e.target.value)}
                            >
                              <option value="col-md-3">col-md-3 (25% Width)</option>
                              <option value="col-md-4">col-md-4 (33% Width)</option>
                              <option value="col-md-6">col-md-6 (50% Width)</option>
                              <option value="col-md-12">col-md-12 (100% Width)</option>
                            </select>
                          </div>
                          <div className="field">
                            <label>Mobile Grid Width</label>
                            <select
                              className="editor-input"
                              value={field.mobile_size || 'col-12'}
                              onChange={(e) => handleFieldChange(index, 'mobile_size', e.target.value)}
                            >
                              <option value="col-6">col-6 (50% Width)</option>
                              <option value="col-12">col-12 (100% Width)</option>
                            </select>
                          </div>
                        </div>
                        <div className="field" style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: '#555' }}>
                            <input
                              type="checkbox"
                              checked={!!field.is_required}
                              onChange={(e) => handleFieldChange(index, 'is_required', e.target.checked)}
                            />
                            Required field
                          </label>
                        </div>

                        {(field.field_type === 'select' || field.field_type === 'radio' || field.field_type === 'checkbox') && (() => {
                          const optionsList = getOptionsArray(field.options);

                          const handleUpdateOption = (optIdx, fieldKey, newVal) => {
                            const listCopy = [...optionsList];
                            if (!listCopy[optIdx]) {
                              listCopy[optIdx] = { label: '', value: '' };
                            }
                            listCopy[optIdx] = {
                              ...listCopy[optIdx],
                              [fieldKey]: newVal
                            };
                            handleFieldChange(index, 'options', listCopy);
                          };

                          const handleAddOption = () => {
                            const listCopy = [...optionsList, { label: '', value: '' }];
                            handleFieldChange(index, 'options', listCopy);
                          };

                          const handleRemoveOption = (optIdx) => {
                            const listCopy = optionsList.filter((_, i) => i !== optIdx);
                            handleFieldChange(index, 'options', listCopy);
                          };

                          return (
                            <div style={{ marginTop: '15px', padding: '15px', border: '1px solid #d6e2ee', borderRadius: '0.9rem', background: '#f8fafc' }}>
                              <label style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: '#182b67', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>
                                Configure Options (Label & Value)
                              </label>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                                {optionsList.map((opt, optIdx) => (
                                  <div key={optIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      className="editor-input"
                                      style={{ flex: 1, height: '36px', fontSize: '12px' }}
                                      placeholder="Label (e.g. Male)"
                                      value={opt.label || ''}
                                      onChange={(e) => handleUpdateOption(optIdx, 'label', e.target.value)}
                                    />
                                    <input
                                      type="text"
                                      className="editor-input"
                                      style={{ flex: 1, height: '36px', fontSize: '12px' }}
                                      placeholder="Value (e.g. male)"
                                      value={opt.value || ''}
                                      onChange={(e) => handleUpdateOption(optIdx, 'value', e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      style={{
                                        height: '36px',
                                        padding: '0 12px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.6rem',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseOver={(e) => e.target.style.background = '#dc2626'}
                                      onMouseOut={(e) => e.target.style.background = '#ef4444'}
                                      onClick={() => handleRemoveOption(optIdx)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                style={{
                                  width: '100%',
                                  height: '36px',
                                  background: '#182b67',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.6rem',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  marginBottom: '15px',
                                  transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#12204c'}
                                onMouseOut={(e) => e.target.style.background = '#182b67'}
                                onClick={handleAddOption}
                              >
                                + Add Option Row
                              </button>

                              <div className="field">
                                <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em' }}>Options List JSON (Generated Automatically)</label>
                                <textarea
                                  rows={3}
                                  className="editor-textarea"
                                  style={{ background: '#f1f5f9', fontFamily: 'monospace', fontSize: '11px', cursor: 'not-allowed' }}
                                  readOnly
                                  value={JSON.stringify(optionsList, null, 2)}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {(field.field_type === 'text' || field.field_type === 'email' || field.field_type === 'mobile' || field.field_type === 'otp' || field.field_type === 'password' || field.field_type === 'confirm_password' || field.field_type === 'number') && (
                          <div className="field" style={{ marginTop: '15px' }}>
                            <label>Validation rules (JSON string, e.g. min/max bounds)</label>
                            <input
                              className="editor-input"
                              placeholder='{"min": 3, "max": 50} or {"length": 6}'
                              value={field.validation_rules ? (typeof field.validation_rules === 'string' ? field.validation_rules : JSON.stringify(field.validation_rules)) : ''}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  handleFieldChange(index, 'validation_rules', parsed);
                                } catch (err) {
                                  handleFieldChange(index, 'validation_rules', e.target.value);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <button type="button" className="btn-add-link" onClick={addField} style={{ width: '100%', padding: '10px', border: '1px dashed #182b67', color: '#182b67', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}>
                      <i className="fa fa-plus" style={{ marginRight: '6px' }} />
                      Add Custom Input Field
                    </button>
                  </div>
                </div>

                {/* Form Live Preview mirroring the user's screenshot layout */}
                <div className="form-builder-preview-pane" style={{ background: '#f1f5f9', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
                    Live Interactive Form Preview
                  </span>

                  {/* Visual form wrapper replicating the screenshot */}
                  <div
                    className="screenshot-form-card"
                    style={{
                      backgroundColor: currentWidget.background_color || "#ffffff",
                      color: currentWidget.form_color || "#000000",
                      borderRadius: "16px",
                      padding: "24px",
                      boxShadow: "0 10px 25px rgba(0,0,0,.1)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      boxSizing: "border-box"
                    }}
                  >
                    {/* Header Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {currentWidget.form_logo_image && (
                        <img
                          key={currentWidget.form_logo_image}
                          src={currentWidget.form_logo_image}
                          alt="Study in UAE Logo"
                          style={{ height: '32px', objectFit: 'contain' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      {!currentWidget.form_logo_image && (
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: currentWidget.input_text_color || '#182b67', display: 'flex', flexDirection: 'column' }}>
                          <span>STUDY IN</span>
                          <span style={{ color: '#d97706' }}>UAE</span>
                        </div>
                      )}
                    </div>

                    {/* Headline & Subtitle */}
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', color: currentWidget.heading_color || currentWidget.input_text_color || '#1e3a8a', margin: '0 0 6px 0', lineHeight: '1.2' }}>
                        {currentWidget.form_title || 'Apply Now to Your Dream University in the UAE .'}
                      </h3>
                      <p style={{ fontSize: '12px', color: currentWidget.subheading_color || currentWidget.input_text_color || '#64748b', margin: 0, lineHeight: '1.4' }}>
                        {currentWidget.form_description || 'Share your details and our admissions team will help you shortlist universities, compare programs, and plan your next step.'}
                      </p>
                    </div>

                    {/* Form fields grid */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 0', margin: '10px 0' }}>
                      {(currentWidget.fields || []).map((field, idx) => {
                        const widthClass = field.desktop_size || 'col-md-6';
                        const isSingleCheckbox = field.field_type === 'checkbox' && (!Array.isArray(field.options) || field.options.length === 0);

                        let flexBasis = '50%';
                        if (isSingleCheckbox || widthClass === 'col-md-12') flexBasis = '100%';
                        if (widthClass === 'col-md-4') flexBasis = '33.3%';
                        if (widthClass === 'col-md-3') flexBasis = '25%';

                        // Render different field components based on field_type
                        return (
                          <div key={idx} style={{ flexBasis: flexBasis, padding: '0 6px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {!isSingleCheckbox && (
                              <label style={{ fontSize: '11px', fontWeight: 'bold', color: currentWidget.input_text_color || '#374151' }}>
                                {field.label || 'Label'} {field.is_required && <span style={{ color: '#ef4444' }}>*</span>}
                              </label>
                            )}

                             {field.field_type === 'otp_channel' ? (
                              <select disabled style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', background: '#f9fafb', width: '100%', color: currentWidget.input_text_color || '#000000' }}>
                                <option value="">Select OTP Channel</option>
                                <option value="Whatsapp">Whatsapp</option>
                                <option value="SMS">SMS</option>
                              </select>
                            ) : ['select', 'select_country', 'select_course', 'select_academic_career', 'select_discipline', 'select_isd_code'].includes(field.field_type) ? (
                              <select disabled style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', background: '#f9fafb', width: '100%', color: currentWidget.input_text_color || '#000000' }}>
                                <option>
                                  {field.placeholder || (
                                    field.field_type === 'select_country' ? 'Select Country' :
                                    field.field_type === 'select_isd_code' ? 'Select Country Code' :
                                    field.field_type === 'select_course' ? 'Select Course' :
                                    field.field_type === 'select_academic_career' ? 'Select Academic Career' :
                                    field.field_type === 'select_discipline' ? 'Select Discipline' :
                                    'Select option'
                                  )}
                                </option>
                                {Array.isArray(field.options) && field.options.map((opt, oidx) => (
                                  <option key={oidx}>{opt.label}</option>
                                ))}
                              </select>
                            ) : field.field_type === 'radio' ? (
                              <div style={{ display: 'flex', gap: '12px', margin: '4px 0', color: currentWidget.input_text_color || '#000000' }}>
                                {Array.isArray(field.options) && field.options.map((opt, oidx) => (
                                  <label key={oidx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                                    <input type="radio" disabled checked={oidx === 0} />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                            ) : field.field_type === 'checkbox' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0', color: currentWidget.input_text_color || '#000000' }}>
                                {Array.isArray(field.options) && field.options.length > 0 ? (
                                  field.options.map((opt, oidx) => (
                                    <label key={oidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                                      <input type="checkbox" disabled checked={oidx === 0} style={{ margin: 0 }} />
                                      <span>{opt.label}</span>
                                    </label>
                                  ))
                                ) : (
                                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: currentWidget.input_text_color || '#475569', cursor: 'default', lineHeight: '1.4', margin: '4px 0' }}>
                                    <input type="checkbox" disabled checked style={{ marginTop: '2px' }} />
                                    <span>
                                      {field.label || 'Accept terms & conditions'} {field.is_required && <span style={{ color: '#ef4444' }}>*</span>}
                                    </span>
                                  </label>
                                )}
                              </div>
                            ) : field.field_type === 'textarea' ? (
                              <textarea disabled placeholder={field.placeholder || ''} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', background: '#f9fafb', width: '100%', minHeight: '60px', color: currentWidget.input_text_color || '#000000' }} />
                            ) : field.field_type === 'otp' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="text"
                                  disabled
                                  placeholder={field.placeholder || 'Enter OTP'}
                                  style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', background: '#f9fafb', color: currentWidget.input_text_color || '#000000' }}
                                />
                                <button type="button" style={{ padding: '0 12px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #1e3a8a', background: 'white', color: '#1e3a8a', borderRadius: '6px', cursor: 'default' }}>
                                  Send OTP
                                </button>
                              </div>
                            ) : field.field_type === 'captcha' ? (
                              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                <div style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', background: '#f3f4f6', flex: 1, textAlign: 'center', fontWeight: 'bold', color: currentWidget.input_text_color || '#000000' }}>
                                  4 + 1 = ?
                                </div>
                                <input
                                  type="text"
                                  disabled
                                  placeholder="Enter answer"
                                  style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', background: '#f9fafb', color: currentWidget.input_text_color || '#000000' }}
                                />
                              </div>
                            ) : (
                              <input
                                type={
                                  field.field_type === 'email' ? 'email' :
                                    field.field_type === 'password' || field.field_type === 'confirm_password' ? 'password' :
                                      field.field_type === 'number' ? 'number' :
                                        field.field_type === 'date' ? 'date' :
                                          field.field_type === 'mobile' ? 'tel' : 'text'
                                }
                                disabled
                                placeholder={field.placeholder || ''}
                                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', background: '#f9fafb', width: '100%', color: currentWidget.input_text_color || '#000000' }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Consent Checkbox */}
                    {currentWidget.require_declaration && (
                      <label style={{ display: 'flex', gap: '8px', fontSize: '10px', color: currentWidget.input_text_color || '#475569', cursor: 'default', lineHeight: '1.4', margin: '4px 0 12px 0' }}>
                        <input type="checkbox" disabled checked style={{ marginTop: '2px' }} />
                        <span>
                          {currentWidget.declaration_text || 'I authorize Study in UAE Scholarship to contact me via call, email, SMS, or WhatsApp and agree to the Terms & Privacy Policy.'}
                        </span>
                      </label>
                    )}

                    {/* Full width action button */}
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: currentWidget.button_color || '#fde047',
                        color: currentWidget.button_text_color || '#1e3a8a',
                        fontWeight: '800',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {currentWidget.button_value || 'Apply Now'}
                    </button>

                  </div>
                </div>

              </div>
            </div>

            <div className="editor-footer" style={{ borderTop: '1px solid #eee', padding: '20px 0', marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button type="button" className="btn-cancel" onClick={() => setMode('list')} style={{ padding: '10px 20px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                Cancel
              </button>
              <button type="submit" className="btn-save" disabled={saving} style={{ padding: '10px 24px', background: '#182b67', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      )}
      {/* Shortcode Embed modal */}
      <Modal
        title="Get Embed Shortcodes"
        visible={!!embedWidget}
        onCancel={() => setEmbedWidget(null)}
        footer={null}
        width={600}
      >
        {embedWidget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            <div>
              {/* Redirect Destination Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '13px', color: '#334155' }}>
                  Select Redirect Destination on Form Submit:
                </label>
                <select
                  value={redirectType}
                  onChange={(e) => setRedirectType(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    color: '#334155'
                  }}
                >
                  <option value="thankyou">Thank You Page (/thank-you)</option>
                  <option value="login">Student Login Page (/student-login)</option>
                  <option value="dynamic_height">Dynamic Height Form</option>
                  <option value="js_code">JS Code Option</option>
                  <option value="js_code_thankyou">JS Code with Thank You redirect</option>
                </select>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {(redirectType === 'js_code' || redirectType === 'js_code_thankyou') ? 'JS Embedding Code' : 'iframe Embedding Code'}
              </p>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                {(redirectType === 'js_code' || redirectType === 'js_code_thankyou')
                  ? 'Copy and paste this code to dynamically render the form widget on your website page:'
                  : 'Copy and paste this code to embed the form inside a responsive iframe container on your website page:'}
              </p>
              {redirectType === 'login' && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#b91c1c', 
                  fontWeight: 'bold', 
                  background: '#fee2e2', 
                  border: '1px solid #fca5a5', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  marginBottom: '12px', 
                  display: 'inline-block' 
                }}>
                  Email and Password fields are mandatory for this form
                </div>
              )}
              <textarea
                id="embed-iframe-code-area"
                readOnly
                rows={redirectType === 'dynamic_height' ? 14 : (redirectType === 'js_code' || redirectType === 'js_code_thankyou') ? 2 : 4}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '12px' }}
                value={getEmbedCodes(embedWidget, redirectType).iframeShort}
                onClick={(e) => { e.target.select(); document.execCommand('copy'); message.success('Copied to clipboard!'); }}
              />
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#182b67',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  marginLeft: 'auto'
                }}
                onClick={() => {
                  const area = document.getElementById('embed-iframe-code-area');
                  if (area) {
                    area.select();
                    document.execCommand('copy');
                    message.success('Copied to clipboard!');
                  }
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#111f4d'}
                onMouseOut={(e) => e.currentTarget.style.background = '#182b67'}
              >
                <i className="fa fa-copy" /> Copy Code
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              * Click inside the text area above to quickly select and copy the iframe code.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
