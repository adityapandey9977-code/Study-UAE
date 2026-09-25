/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import StudentService from "../../services/StudentService";
import { RawHTML } from "../../utils/Controls";
import util from "../../utils/util";
import { TEMPLATE_TAGS } from "../../constants";
import {
    Button,
    message,
    Modal,
    Tabs,
    List,
    Input,
    Tag
} from 'antd';
import CmasterService from '../../services/CmasterService';
const $ = window.$;

export default function StuSendWhatsapp(props) {
    const { cref } = props;
    const [isModalVisible, setModalVisible] = useState(false);
    const [stuDtl, setStuDtl] = useState({});
    const [activeTab, setActiveTab] = useState('1');
    const [sentWhatsapp, setSentWhatsapp] = useState([]);

    const closeModal = () => {
        setSentWhatsapp([]);
        setModalVisible(false);
    }

    const getSentWhatsapp = async (stu_id) => {
        util.showLoader();
        const result = await StudentService.getSentWhatsapp({ lead_id: stu_id || stuDtl.id });
        setSentWhatsapp(result);
        util.hideLoader();
    }

    const changeTab = (tab) => {
        setActiveTab(tab);
    }

    cref.current = {
        ...cref.current,
        openSendWhatsapp: (dtl) => {
            setStuDtl({ ...dtl });
            setActiveTab('1');
            setModalVisible(true);
            getSentWhatsapp(dtl.id);
        }
    };

    useEffect(() => {
    }, []);

    return (
        <Modal
            title={"Send Whatsapp: " + stuDtl.name + " (" + stuDtl.regno + ")"}
            open={isModalVisible}
            onCancel={closeModal}
            destroyOnClose
            maskClosable={false}
            width={1200}
            footer={null}
            bodyStyle={{ paddingTop: 0 }}
            style={{ top: 20 }}
        >
            <div>
                <Tabs activeKey={activeTab} onChange={changeTab}>
                    <Tabs.TabPane tab="Send New Whatsapp" key="1">
                        <SendForm
                            stuDtl={stuDtl}
                            increaseSentWhatsapp={cref.current.increaseSentWhatsapp}
                            getSentWhatsapp={getSentWhatsapp}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<span>List Of Sent Whatsapp <span className="badge badge-primary pt3">{sentWhatsapp.length}</span></span>} key="2">
                        {activeTab === '2' &&
                            <div>
                                <div className="cscroll border" style={{ height: ($(window).height() - 175) + 'px' }}>
                                    <List
                                        size="small"
                                        //bordered
                                        dataSource={sentWhatsapp}
                                        renderItem={item => (
                                            <List.Item>
                                                <div style1={{ paddingLeft: '12px', borderLeft: '3px solid #eee' }}>
                                                    <div className="bold600">{item.subject}</div>
                                                    <div className="text-secondary fs11">Sent by {item.sent_by} on {util.getDate(item.created, 'DD MMM YYYY @ hh:mm A')}</div>
                                                    <div className="email-body pt5 text-secondary">
                                                        <RawHTML html={item.msg} />
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
            </div>
        </Modal>
    )
}

function SendForm(props) {
    const { increaseSentWhatsapp, getSentWhatsapp } = props;
    const [data, setData] = useState({ msg: '' });
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
            CmasterService.whatsappTemplates()
                .then(({ data }) => {
                    console.log("Raw WhatsApp templates data:", data);
                    // First, check if data.data exists and is an array
                    const templatesList = Array.isArray(data.data) ? data.data : [];
                    console.log("All WhatsApp templates:", templatesList);
                    
                    // Filter for active templates with type "Follow up" (case-insensitive) or "Both"
                    const activeTemplates = templatesList.filter(template => {
                        const isActive = template.status === "ACTIVE";
                        const normalizedType = template.type?.toLowerCase().trim();
                        const isFollowUpOrBoth = normalizedType === "follow up" || normalizedType === "both";
                        console.log(`WhatsApp Template: ${template.name}, Active: ${isActive}, Type: "${template.type}", Normalized: "${normalizedType}", Include: ${isActive && isFollowUpOrBoth}`);
                        return isActive && isFollowUpOrBoth;
                    });
                    
                    console.log("Filtered WhatsApp templates:", activeTemplates);
                    setTemplates(activeTemplates);
                })
                .catch(e => {
                    console.error("Error fetching WhatsApp templates:", e);
                    message.error(e.message || 'Failed to load WhatsApp templates');
                });
        }
    }, [props.stuDtl.id]);

    // ✅ Updated: Fetch full template on select
    const handleTemplateSelect = (templateId) => {
        if (!templateId) return;

        CmasterService.getWhatsappTemplate(templateId)
            .then(({ data }) => {
                const template = data.result; // Assuming API returns { result: {subject, body} }

                const values = getMergeValues();
                const rawMsg = template.msg || template.body || '';
                const mergedMsg = util.mergeTemplateTags(rawMsg, values);

                setData(prev => ({
                    ...prev,
                    template_id: templateId,
                    msg: mergedMsg
                }));
            })
            .catch(e => message.error(e.message));
    };

    const send = async () => {
        util.showLoader();

        const values = getMergeValues();
        const payload = {
            ...data,
            msg: util.mergeTemplateTags(data.msg || '', values),
        };
        const res = await StudentService.sendWhatsapp(payload);
        if (res.success) {
            message.success(res.message || 'Success');
            setData({ ...data, template_id: '', msg: '' });
            increaseSentWhatsapp();
            getSentWhatsapp();
        } else {
            message.error(res.message || 'Failed')
        }
        util.hideLoader();
    }

    const insertTag = (tag, ta) => {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        var finText = ta.value.substring(0, start) + tag + ta.value.substring(end);
        ta.value = finText;
        ta.focus({ preventScroll: true });
        ta.selectionEnd = start + tag.length;

        const newFd = { ...data };
        newFd.msg = document.getElementById("inputMsg")?.value || '';

        setData(newFd);
    }

    useEffect(() => {
        setData({ ...data, lead_id: props.stuDtl.id, isd_code: props.stuDtl.isd_code, mobile: props.stuDtl.mobile, auto_login_url: util.getStudentAutoLoginUrl(props.stuDtl.email) });
    }, [props.stuDtl]);


    return (
        <div className="cscroll" style={{ height: ($(window).height() - 175) + 'px' }}>
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text w120 req">Whatsapp To</span>
                    </div>
                    <input type="text" className="form-control" value={`${data.isd_code}-${data.mobile}`} onChange={() => { }} disabled />
                </div>
            </div>

            {/* WhatsApp Template */}
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text w120">Templates</span>
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

            <div className="form-group">
                <label className="req">Message</label>
                <div className="flex flex-wrap gap-2 mb-1">
                    {TEMPLATE_TAGS.map((tag) => (
                        <div key={tag}>
                            <Tag
                                color="#f50"
                                className="cursor-pointer noselect"
                                onClick={() => {
                                    insertTag(`%${tag}%`, document.getElementById("inputMsg"))
                                }}
                            >
                                {`%${tag}%`}
                            </Tag>
                        </div>
                    ))}
                </div>
                <div>
                    <Input.TextArea id="inputMsg" rows="6" value={data.msg} onChange={e => setData({ ...data, msg: e.target.value })} />
                </div>
            </div>

            <div>
                <Button type="primary" onClick={send}>Send</Button>
            </div>
        </div>
    )
}