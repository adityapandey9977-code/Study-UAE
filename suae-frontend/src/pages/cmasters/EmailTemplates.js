/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import CmasterService from "../../services/CmasterService";
import { If, Tinymce, GetTinymceContent } from "../../utils/Controls";
import { AntdPaging, AntdTag } from "../../utils/Antd";
import util from "../../utils/util";
import { TEMPLATE_TAGS } from "../../constants";
import {
    Input,
    Button,
    message,
    Modal,
    Select,
    Switch,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Option } = Select;
// const { TextArea } = Input;

/**
 * ==============================
 * Main Component: EmailTemplates
 * ==============================
 * - Lists all email templates
 * - Provides search, add, edit, and delete functionality
 */
export default function EmailTemplates() {
    const [result, setResult] = useState({ data: [], page: {} });
    const sdataRef = useRef({ p: 1, ps: 50 });
    const formRef = useRef();

    /** Fetch templates list with pagination */
    const list = (p, ps) => {
        sdataRef.current.p = p || 1;
        sdataRef.current.ps = ps || sdataRef.current.ps;

        util.showLoader();
        CmasterService.emailTemplates(sdataRef.current)
            .then(({ data }) => {
                const payload = (data && (data.result || data)) || {};
                let nextResult;

                if (Array.isArray(payload)) {
                    // If API returns simple array
                    nextResult = {
                        data: payload,
                        page: { start: 0, total: payload.length, total_records: payload.length, cur_page: 1 }
                    };
                } else if (payload && (payload.data || payload.page)) {
                    // If API returns paginated data
                    nextResult = {
                        data: payload.data || [],
                        page: payload.page || {}
                    };
                } else {
                    nextResult = { data: [], page: {} };
                }
                setResult(nextResult);
            })
            .catch(e => {
                message.error(e.message);
            })
            .finally(() => {
                util.hideLoader();
            });
    };

    /** Delete template by ID */
    const deleteRecord = (id) => {
        message.destroy();
        confirm({
            title: `Do you want to delete this email template?`,
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                CmasterService.deleteEmailTemplate(id)
                    .then(({ data }) => {
                        message.success(data.message || 'Deleted');
                        list();
                    })
                    .catch(e => {
                        message.error(e.message);
                    })
                    .finally(() => {
                        util.hideLoader();
                    });
            },
            onCancel() { }
        });
    };

    /** Load templates on mount */
    useEffect(() => {
        list();
        return () => { message.destroy(); };
    }, []);

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="page-head-gradient">
                <div>
                    <h2>
                        <i className="fa fa-envelope"></i> Email Templates
                    </h2>
                </div>
            </div>

            {/* Page Body */}
            <div className="page-pad">
                {/* Search + Add */}
                <div className="d-flex tbl-search-head">
                    <div className="my-auto">
                        <SearchForm dataRef={sdataRef} onSearch={list} />
                    </div>
                    <div className="ml-auto my-auto">
                        <Button onClick={() => formRef.current.openForm()} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}>
                            <i className="fa fa-plus mr5"></i> Add
                        </Button>
                    </div>
                </div>

                {/* Templates List */}
                <If cond={result.data.length}>
                    <div className="mb8" style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                        Showing {result.page.start + 1} - {result.page.start + result.page.total} of {result.page.total_records} records.
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-md table-striped table-hover m-0 email-templates-table">
                            <thead className="thead-light text-uppercase table-text-vmid">
                                <tr>
                                    <th className="w60">SN</th>
                                    <th>Name</th>
                                    <th className="col-subject">Subject</th>
                                    <th className="w100 col-type">Type</th>
                                    <th className="w100 col-lang">Language</th>
                                    <th className="w60">Status</th>
                                    <th className="w70">Action</th>
                                </tr>
                            </thead>
                            <tbody className="table-text-top">
                                {result.data.map((v, i) => (
                                    <tr key={i}>
                                        <td>{result.page.start + i + 1}.</td>
                                        <td>{v.name}</td>
                                        <td className="col-subject">{v.subject}</td>
                                        <td className="col-type">{v.type}</td>
                                        <td className="col-lang">{v.language}</td>
                                        <td className="nowrap">
                                            {v.status === 'ACTIVE'
                                                ? (<AntdTag style={{ background: '#181a19', color: '#fff', fontWeight: 600, borderRadius: 6, padding: '2px 10px', border: 'none' }}>Active</AntdTag>)
                                                : (<AntdTag type="danger">Inactive</AntdTag>)
                                            }
                                        </td>
                                        <td className="text-center">
                                            <Button.Group size="small">
                                                {/* Edit Button */}
                                                <Button
                                                    type="default"
                                                    onClick={async () => {
                                                        try {
                                                            util.showLoader();
                                                            const { data } = await CmasterService.getEmailTemplate(v.id);
                                                            const detail = data?.result || data;
                                                            formRef.current.openForm(detail);
                                                        } catch (e) {
                                                            message.error(e.message);
                                                        } finally {
                                                            util.hideLoader();
                                                        }
                                                    }}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </Button>
                                                {/* Delete Button */}
                                                <Button type="default" onClick={() => deleteRecord(v.id)}>
                                                    <i className="fa fa-times-circle font-red"></i>
                                                </Button>
                                            </Button.Group>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex tbl-foot-bx" style={{ justifyContent: 'center', marginTop: 12 }}>
                        <AntdPaging
                            onChange={list}
                            total={result.page.total_records}
                            current={result.page.cur_page}
                            pageSize={sdataRef.current.ps}
                            showSizeChanger
                            showTotal={(total, range) => (
                                <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13, marginRight: 12 }}>
                                    {range[0]}–{range[1]} of {total} templates
                                </span>
                            )}
                        />
                    </div>
                </If>

                {/* Empty State */}
                <If cond={!result.data.length}>
                    <div className="no-rec">No record found</div>
                </If>
            </div>

            {/* Add/Edit Modal */}
            <AddForm
                ref={formRef}
                callback={list}
                pageno={sdataRef.current.p}
            />
        </div>
    );
}

/**
 * =================
 * Search Form (Top)
 * =================
 * - Allows searching templates
 */
const SearchForm = ({ dataRef, onSearch }) => {
    const [data, setData] = useState({ ...dataRef.current });

    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    };

    useEffect(() => {
        dataRef.current = { ...data };
    }, [data]);

    useEffect(() => {
        setData({ ...data, p: dataRef.current.p, ps: dataRef.current.ps });
    }, [dataRef.current.p, dataRef.current.ps]);

    return (
        <form onSubmit={e => e.preventDefault()} autoComplete="off" spellCheck="false">
            <style>{`.email-tpl-search .ant-input::placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 14px !important; opacity: 1 !important; }`}</style>
            <div className="d-flex email-tpl-search" style={{ gap: 8 }}>
                <div>
                    <Input
                        placeholder="Search"
                        allowClear
                        value={data.k}
                        onChange={e => handleChange(e.target.value, 'k')}
                    />
                </div>
                <div>
                    <Button
                        icon={<i className="fa fa-search fs13"></i>}
                        onClick={() => onSearch()}
                        style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 6, height: 32 }}
                    />
                </div>
            </div>
        </form>
    );
};

/**
 * ============================
 * AddForm (Modal: Add / Edit)
 * ============================
 * - Handles both adding new templates and editing existing ones
 */
const AddForm = forwardRef((props, ref) => {
    const { callback, pageno } = props;
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState({});

    const [htmlMode, setHtmlMode] = useState(false);
const [htmlText, setHtmlText] = useState('');
    const [attrSubject, setAttrSubject] = useState(undefined);
    const [attrBody, setAttrBody] = useState(undefined);

    const insertAtCursor = (el, text) => {
        if (!el) return;
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        const next = el.value.substring(0, start) + text + el.value.substring(end);
        el.value = next;
        el.focus({ preventScroll: true });
        el.selectionStart = el.selectionEnd = start + text.length;
        return next;
    };

    /** Update local state when form inputs change */
    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    };

    /** Save form data (Add or Update) */
    const save = () => {
        message.destroy();
        util.showLoader();

        // const submitData = {
        //     ...data,
        //     // Always pick content from TinyMCE editor for body
        //     body: GetTinymceContent("ta_template_body"),
        //     is_html: data.is_html ? 1 : 0
        // };
        const submitData = {
  ...data,
  body: htmlMode ? htmlText : GetTinymceContent("ta_template_body"),
  is_html: data.is_html ? 1 : 0
};

        const apiCall = submitData.id
            ? CmasterService.updateEmailTemplate(submitData.id, submitData)
            : CmasterService.saveEmailTemplate(submitData);

        apiCall
            .then(({ data: res }) => {
                message.success(res.message || 'Saved');
                callback(submitData.id ? pageno : 1); // Refresh list
                setShowForm(false);
            })
            .catch(e => {
                message.error(e.message);
            })
            .finally(() => {
                util.hideLoader();
            });
    };

    /** Expose openForm to parent */
    useImperativeHandle(ref, () => ({
        // openForm(dtl) {
        //     if (dtl) {
        //         // Editing existing record
        //         setData({
        //             ...dtl,
        //             is_html: dtl.is_html === 1 || dtl.is_html === true
        //         });
        //     } else {
        //         // Adding new record
        //         setData({
        //             status: 'ACTIVE',
        //             language: 'en',
        //             is_html: true,
        //             type: 'Follow up'
        //         });
        //     }
        //     setShowForm(true);
        // }
        openForm(dtl) {
  if (dtl) {
    setData({
      ...dtl,
      is_html: dtl.is_html === 1 || dtl.is_html === true
    });
    setHtmlText(dtl.body || '');    // <-- initialize textarea when editing
  } else {
    setData({
      status: 'ACTIVE',
      language: 'en',
      is_html: true,
      type: 'Follow up'
    });
    setHtmlText('');
  }
  setShowForm(true);
}
    }));

    /** Template types */
    const templateTypes = [
        { value: 'Follow Up', label: 'Follow Up' },
        { value: 'Bulk Campaign', label: 'Bulk Campaign' },
        { value: 'Both', label: 'Both' }
    ];

    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} Email Template`}
            open={showForm}
            okText="Save"
            onOk={save}
            onCancel={() => setShowForm(false)}
            destroyOnClose
            maskClosable={false}
            width={1000}
            styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        >
            <form onSubmit={e => { e.preventDefault(); save(); }} autoComplete="off" spellCheck="false">
                <div className="row mingap">
                    {/* Name */}
                    <div className="col-md-6 form-group">
                        <label className="req">Name</label>
                        <Input value={data.name || ''} onChange={e => handleChange(e.target.value, 'name')} />
                    </div>

                    {/* Type */}
                    <div className="col-md-6 form-group">
                        <label className="req">Type</label>
                        <Select value={data.type} onChange={v => handleChange(v, 'type')} style={{ width: '100%' }} getPopupContainer={triggerNode => triggerNode.parentNode}>
                            {templateTypes.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                        </Select>
                    </div>

                    {/* Subject */}
                    <div className="col-md-12 form-group">
                        <label className="req">Subject</label>
                        <div className="mb-1">
                            <Select
                                placeholder="Insert attribute"
                                style={{ width: 250 }}
                                value={attrSubject}
                                onChange={(v) => {
                                    const token = `{%${v}%}`;
                                    const el = document.getElementById('email_template_subject');
                                    const next = insertAtCursor(el, token);
                                    handleChange(next ?? (data.subject || '') + token, 'subject');
                                    setAttrSubject(undefined);
                                }}
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                            >
                                {TEMPLATE_TAGS.map((t) => (
                                    <Option key={t} value={t}>{`{%${t}%}`}</Option>
                                ))}
                            </Select>
                        </div>
                        <Input id="email_template_subject" value={data.subject || ''} onChange={e => handleChange(e.target.value, 'subject')} />
                    </div>

                    {/* Language */}
                    <div className="col-md-6 form-group">
                        <label className="req">Language</label>
                        <Select value={data.language} onChange={v => handleChange(v, 'language')} style={{ width: '100%' }} getPopupContainer={triggerNode => triggerNode.parentNode}>
                            <Option value="en">English</Option>
                            <Option value="es">Spanish</Option>
                            <Option value="fr">French</Option>
                            <Option value="de">German</Option>
                            <Option value="it">Italian</Option>
                            <Option value="pt">Portuguese</Option>
                            <Option value="ru">Russian</Option>
                            <Option value="zh">Chinese</Option>
                            <Option value="ja">Japanese</Option>
                            <Option value="ko">Korean</Option>
                            <Option value="ar">Arabic</Option>
                            <Option value="hi">Hindi</Option>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="col-md-6 form-group">
                        <label className="req">Status</label>
                        <Select value={data.status} onChange={v => handleChange(v, 'status')} style={{ width: '100%' }} getPopupContainer={triggerNode => triggerNode.parentNode}>
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="col-md-12 form-group">
                        <label>Description</label>
                        <Input value={data.description || ''} onChange={e => handleChange(e.target.value, 'description')} />
                    </div>

                    {/* Body */}
                    {/* <div className="col-md-12 form-group">
                        <label className="req">Body</label>
                        <Tinymce id="ta_template_body" data={data.body} />
                    </div> */}
<div className="col-md-12 form-group">
  <label className="req">Body</label>

  {/* Toggle buttons */}
  <div style={{ marginBottom: 8 }}>
    <Button size="small" type={htmlMode ? 'default' : 'primary'} onClick={() => setHtmlMode(false)} style={{ marginRight: 8 }}>
      Visual
    </Button>
    <Button size="small" type={htmlMode ? 'primary' : 'default'} onClick={() => setHtmlMode(true)}>
      HTML Source
    </Button>
  </div>

  <div style={{ marginBottom: 8 }}>
    <Select
      placeholder="Insert attribute"
      style={{ width: 250 }}
      value={attrBody}
      onChange={(v) => {
        const token = `{%${v}%}`;
        if (htmlMode) {
          const el = document.getElementById('email_template_body_html');
          const next = insertAtCursor(el, token);
          setHtmlText(next ?? (htmlText || '') + token);
        } else {
          const ed = window.tinymce?.get?.('ta_template_body');
          if (ed) {
            ed.execCommand('mceInsertContent', false, token);
          }
        }
        setAttrBody(undefined);
      }}
      getPopupContainer={triggerNode => triggerNode.parentNode}
    >
      {TEMPLATE_TAGS.map((t) => (
        <Option key={t} value={t}>{`{%${t}%}`}</Option>
      ))}
    </Select>
  </div>

  {/* Visual editor (TinyMCE) */}
  <div style={{ display: htmlMode ? 'none' : 'block' }}>
    <Tinymce id="ta_template_body" data={data.body} />
  </div>

  {/* Plain textarea for raw HTML */}
  <div style={{ display: htmlMode ? 'block' : 'none' }}>
    <textarea
      id="email_template_body_html"
      value={htmlText}
      onChange={e => setHtmlText(e.target.value)}
      rows={12}
      style={{ width: '100%', fontFamily: 'monospace', padding: 8, boxSizing: 'border-box' }}
      placeholder="<p>Paste raw HTML here</p>"
    />
  </div>
</div>


                    {/* Is HTML */}
                    <div className="col-md-6 form-group">
                        <label>Is HTML</label>
                        <div>
                            <Switch checked={data.is_html} onChange={v => handleChange(v, 'is_html')} />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
});
