/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import StudentService from "../../services/StudentService";
import { Tinymce, GetTinymceContent, SetTinymceContent, RawHTML } from "../../utils/Controls";
import util from "../../utils/util";
import { TEMPLATE_TAGS } from "../../constants";
import {
    Button,
    message,
    Modal,
    Tabs,
    List,
    Tag
} from 'antd';
import CmasterService from '../../services/CmasterService';
const $ = window.$;

export default function StuSendEmail(props) {
    const { cref } = props;
    const [isModalVisible, setModalVisible] = useState(false);
    const [stuDtl, setStuDtl] = useState({});
    const [activeTab, setActiveTab] = useState('1');
    const [sentEmails, setSentEmails] = useState([]);

    const closeModal = () => {
        setSentEmails([]);
        setModalVisible(false);
    }

    const getSentEmails = (stu_id = null) => {
        util.showLoader();
        StudentService.allSentEmails({ student_id: stu_id || stuDtl.id })
            .then(({ data }) => {
                setSentEmails(data.result.data);
            })
            .catch(e => message.error(e.message))
            .finally(() => util.hideLoader());
    }

    const changeTab = (tab) => setActiveTab(tab);

    // Expose function to open modal from parent
    cref.current = {
        ...cref.current,
        openSendEmail: (dtl) => {
            setStuDtl({ ...dtl });
            setActiveTab('1');
            setModalVisible(true);
            getSentEmails(dtl.id);
        }
    };

    return (
        <Modal
            title={`Send Email: ${stuDtl.name} (${stuDtl.regno})`}
            open={isModalVisible}
            onCancel={closeModal}
            destroyOnClose
            maskClosable={false}
            width={1200}
            footer={null}
            bodyStyle={{ paddingTop: 0 }}
            style={{ top: 20 }}
        >
            <Tabs activeKey={activeTab} onChange={changeTab}>
                <Tabs.TabPane tab="Send New Email" key="1">
                    <SendEmailForm
                        stuDtl={stuDtl}
                        increaseSentEmail={cref.current.increaseSentEmail}
                        getSentEmails={getSentEmails}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>List Of Sent Emails <span className="badge badge-primary pt3">{sentEmails.length}</span></span>} key="2">
                    {activeTab === '2' &&
                        <div>
                            <div className="cscroll border" style={{ height: ($(window).height() - 175) + 'px' }}>
                                <List
                                    size="small"
                                    dataSource={sentEmails}
                                    renderItem={item => (
                                        <List.Item>
                                            <div style1={{ paddingLeft: '12px', borderLeft: '3px solid #eee' }}>
                                                <div className="bold600">{item.subject}</div>
                                                <div className="text-secondary fs11">Sent by {item.sent_by} on {util.getDate(item.created, 'DD MMM YYYY @ hh:mm A')}</div>
                                                <div className="email-body pt5 text-secondary">
                                                    <RawHTML html={item.body} />
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </div>
                    }
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    )
}

function SendEmailForm(props) {
    const { increaseSentEmail, getSentEmails } = props;
    const [data, setData] = useState({ body: '' });
    const [templates, setTemplates] = useState([]);

    const getMergeValues = () => {
        const s = props.stuDtl || {};
        return {
            REGNO: s.regno || '',
            NAME: s.name || '',
            MOBILE: s.mobile || '',
            EMAIL: s.email || '',
            AUTO_LOGIN_URL: util.getStudentAutoLoginUrl(s.email || ''),
            SENDER_NAME: util.getLoggedName() || '',
            SENDER_EMAIL: util.getLoggedEmail() || '',
            SENDER_MOB: util.getLoggedMobile() || '',
        };
    };

    useEffect(() => {
        if (props.stuDtl.id) {
            CmasterService.emailTemplates()
                .then(({ data }) => {
                    console.log("Raw templates data:", data);
                    // First, check if data.data exists and is an array
                    const templatesList = Array.isArray(data.data) ? data.data : [];
                    console.log("All templates:", templatesList);
                    
                    // Filter for active templates with type "Follow up" (case-insensitive) or "Both"
                    const activeTemplates = templatesList.filter(template => {
                        const isActive = template.status === "ACTIVE";
                        const normalizedType = template.type?.toLowerCase().trim();
                        const isFollowUpOrBoth = normalizedType === "follow up" || normalizedType === "both";
                        console.log(`Template: ${template.name}, Active: ${isActive}, Type: "${template.type}", Normalized: "${normalizedType}", Include: ${isActive && isFollowUpOrBoth}`);
                        return isActive && isFollowUpOrBoth;
                    });
                    
                    console.log("Filtered templates:", activeTemplates);
                    setTemplates(activeTemplates);
                })
                .catch(e => {
                    console.error("Error fetching email templates:", e);
                    message.error(e.message || 'Failed to load email templates');
                });
        }
    }, [props.stuDtl.id]);


    // Update email data when student changes
    useEffect(() => {
        setData(prev => ({ ...prev, student_id: props.stuDtl.id, email_to: props.stuDtl.email }));
    }, [props.stuDtl]);

    const send = () => {
        util.showLoader();

        const rawBody = GetTinymceContent("ta_email_body");
        const values = getMergeValues();
        const payload = {
            ...data,
            subject: util.mergeTemplateTags(data.subject || '', values),
            body: util.mergeTemplateTags(rawBody || '', values),
        };
        StudentService.sendEmail(payload)
            .then((res) => {
                message.success(res.data.message || 'Sent');
                setData({ ...data, template_id: '', cc: '', subject: '', body: '' });
                SetTinymceContent("ta_email_body", "");
                increaseSentEmail();
                getSentEmails();
            })
            .catch(e => message.error(e.message))
            .finally(() => util.hideLoader());
    };

    const insertTag = (tag, ta) => {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        ta.value = ta.value.substring(0, start) + tag + ta.value.substring(end);
        ta.focus({ preventScroll: true });
        ta.selectionEnd = start + tag.length;

        setData(prev => ({
            ...prev,
            subject: document.getElementById("inputSubject")?.value || '',
            body: document.getElementById("inputBody")?.value || ''
        }));
    };

    // ✅ Updated: Fetch full template on select
    const handleTemplateSelect = (templateId) => {
        if (!templateId) return;

        CmasterService.getEmailTemplate(templateId)
            .then(({ data }) => {
                const template = data.result; // Assuming API returns { result: {subject, body} }

                const values = getMergeValues();
                const mergedSubject = util.mergeTemplateTags(template.subject || '', values);
                const mergedBody = util.mergeTemplateTags(template.body || '', values);

                setData(prev => ({
                    ...prev,
                    template_id: templateId,
                    subject: mergedSubject,
                    body: mergedBody
                }));

                // Update TinyMCE content
                if (window.tinymce.get("ta_email_body")) {
                    window.tinymce.get("ta_email_body").setContent(mergedBody || '');
                }
            })
            .catch(e => message.error(e.message));
    };

    return (
        <div className="cscroll" style={{ height: ($(window).height() - 175) + 'px' }}>
            {/* Email To */}
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text w100 req">Email To</span>
                    </div>
                    <input type="text" className="form-control" value={data.email_to} disabled />
                </div>
            </div>

            {/* Email Template */}
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text w100">Templates</span>
                    </div>
                    <select
                        className="form-control"
                        value={data.template_id || ''}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                    >
                        <option value="">-- Select Template --</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* CC */}
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text w100">CC</span>
                    </div>
                    <input
                        type="text"
                        className="form-control"
                        value={data.cc || ''}
                        onChange={e => setData({ ...data, cc: e.target.value })}
                    />
                </div>
            </div>

            {/* Subject */}
            <div className="form-group">
                <div className='mb-1'>
                    <div className="flex flex-wrap gap-2">
                        {TEMPLATE_TAGS.map(tag => (
                            <Tag
                                key={tag}
                                color="#f50"
                                className="cursor-pointer noselect"
                                onClick={() => insertTag(`%${tag}%`, document.getElementById("inputSubject"))}
                            >
                                {`%${tag}%`}
                            </Tag>
                        ))}
                    </div>
                </div>
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text w100 req">Subject</span>
                    </div>
                    <input
                        type="text"
                        id="inputSubject"
                        className="form-control"
                        value={data.subject || ''}
                        onChange={e => setData({ ...data, subject: e.target.value })}
                    />
                </div>
            </div>

            {/* Email Body */}
            <div className="form-group">
                <label className="req">Email Body</label>
                <div className="mb-1 flex flex-wrap gap-2">
                    {TEMPLATE_TAGS.map(tag => (
                        <Tag
                            key={tag}
                            color="#f50"
                            className="cursor-pointer noselect"
                            onClick={() => window.tinymce.activeEditor.execCommand('mceInsertContent', false, `%${tag}%`)}
                        >
                            {`%${tag}%`}
                        </Tag>
                    ))}
                </div>
                <Tinymce id="ta_email_body" data={data.body} />
            </div>

            {/* Send Button */}
            <div>
                <Button type="primary" onClick={send}>Send</Button>
            </div>
        </div>
    );
}
