/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import UserService from "../../services/UserService";
import util from "../../utils/util";
import { Table, Input, Button, message, Modal, Card, Row, Col, Tag, Typography, Switch } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import InstituteService from '../../services/InstituteService';

const { confirm } = Modal;
const { Text } = Typography;
const $ = window.$;

function AgentList({ refOb = { current: {} }, openForm }) {
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState({ p: 1, ps: 10 });
    const filterParamsRef = useRef({});
    const wh = $(window).height();

    const getList = (params = null, p = 1) => {
        if (params) filterParamsRef.current = params;
        setLoading(true);
        UserService.users({ ...filterParamsRef.current, p, ps: paging.ps, type: "AGENT" })
            .then(({ data }) => {
                // data.result.data.forEach((v) => (v.key = v.id));
                data.result.data = data.result.data.map(v => ({
                    ...v,
                    key: v.id,
                    masked: v.mask_status !== undefined ? Number(v.mask_status) : 0
                }));
                setResult(data.result.data);
                setPaging({ ...paging, p });
            })
            .catch((e) => message.error(e.message))
            .finally(() => setLoading(false));
    };

    const handleApprove = (agent) => {
        if (agent.status === 1) {
            message.info("Agent is already approved.");
            return;
        }
        confirm({
            title: "Approve this agent?",
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            cancelText: "No",
            onOk() {
                setLoading(true);
                UserService.approveAgent(agent.id)
                    .then(({ data }) => {
                        message.success(data.message || "Agent approved successfully");
                        getList(null, paging.p);
                    })
                    .catch((e) => message.error(e.message || "Approval failed"))
                    .finally(() => setLoading(false));
            },
        });
    };

    const handleBlock = (agent) => {
        if (agent.status === 0) {
            message.info("Agent is already blocked.");
            return;
        }
        confirm({
            title: "Are you sure you want to block this agent?",
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                setLoading(true);
                UserService.blockAgent(agent.id)
                    .then(({ data }) => {
                        message.success(data.message || "Agent blocked successfully");
                        getList(null, paging.p);
                    })
                    .catch((e) => message.error(e.message || "Something went wrong"))
                    .finally(() => setLoading(false));
            },
        });
    };

    const handleAgentAutoLogin = (email) => {
        console.log(email)
        if (!email) return message.error("Email not found");

        try {
            util.showLoader();
            const url = util.getAgentAutoLoginUrl(email);

            window.open(url, '_blank');

            message.success("Agent auto login opened in a new tab!");
        } catch (err) {
            console.error(err);
            message.error("Agent auto login failed!");
        } finally {
            util.hideLoader();
        }
    };

    const changeMaskStatus = (id, mask_status) => {
        message.destroy();

        // Optimistic UI update
        setResult(prev =>
            prev.map(item =>
                item.id === id ? { ...item, masked: mask_status } : item
            )
        );

        confirm({
            title: `Are you sure to ${mask_status === 1 ? 'Mask' : 'Unmask'} this agent?`,
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                setLoading(true);
                InstituteService.changeMaskStatus(id, mask_status)
                    .then(({ data }) => {
                        message.success(data.message || 'Updated');
                    })
                    .catch(e => {
                        message.error(e.message);
                        // revert if failed
                        setResult(prev =>
                            prev.map(item =>
                                item.id === id ? { ...item, masked: mask_status === 1 ? 0 : 1 } : item
                            )
                        );
                    })
                    .finally(() => setLoading(false));
            },
            onCancel() {
                // revert if cancelled
                setResult(prev =>
                    prev.map(item =>
                        item.id === id ? { ...item, masked: mask_status === 1 ? 0 : 1 } : item
                    )
                );
            },
        });
    };

    const deleteRecord = (id) => {
        confirm({
            title: "Do you want to delete this agent?",
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                setLoading(true);
                console.log(id);
                UserService.deleteUser(id)
                    .then(({ data }) => {
                        message.success(data.message || "Deleted");
                        getList(null, paging.p);
                    })
                    .catch((e) => message.error(e.message))
                    .finally(() => setLoading(false));
            },
        });
    };

    const cols = [
        {
            title: "Agent",
            render: (row) => (
                <div style={{ lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{row.fname} {row.lname}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 13, marginTop: 4 }}>
                        <span><Text type="secondary" style={{ fontSize: 13 }}>Username:</Text> <span style={{ fontWeight: 600 }}>{row.username}</span></span>
                        <span><Text type="secondary" style={{ fontSize: 13 }}>Code:</Text> <span style={{ fontWeight: 600 }}>{row.agent_code}</span></span>
                        <span><Text type="secondary" style={{ fontSize: 13 }}>Email:</Text> <span style={{ fontWeight: 600 }}>{row.email}</span></span>
                        <span><Text type="secondary" style={{ fontSize: 13 }}>Mobile:</Text> <span style={{ fontWeight: 600 }}>{row.mobile}</span></span>
                    </div>
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            align: 'center',
            render: (status) =>
                status === 1 ? <Tag color="green" style={{ fontSize: 13, fontWeight: 600, padding: '2px 10px', borderRadius: 6 }}>Active</Tag> : <Tag color="red" style={{ fontSize: 13, fontWeight: 600, padding: '2px 10px', borderRadius: 6 }}>Inactive</Tag>,
        },
        {
            title: "Auto Login",
            dataIndex: "email",
            width: 140,
            align: 'center',
            fixed: 'right',
            render: (email) => (
                <Button
                    size="small"
                    style={{
                        minWidth: 90,
                        padding: '0 10px',
                        fontSize: 13,
                        height: 30,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #588d93, #568cb1)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 600,
                        borderRadius: 6,
                    }}
                    onClick={() => handleAgentAutoLogin(email)}
                >
                    Auto Login
                </Button>
            ),
        },
        {
            title: "Approval",
            align: 'center',
            render: (row) =>
                row.status === 1 ? (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <Button size="small" disabled style={{ fontSize: 12, height: 28, borderRadius: 6, fontWeight: 600 }}>Approved</Button>
                        <Button size="small" danger ghost style={{ fontSize: 12, height: 28, borderRadius: 6, fontWeight: 600 }} onClick={() => handleBlock(row)}>Block</Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <Button size="small" ghost style={{ fontSize: 12, height: 28, borderRadius: 6, fontWeight: 600, background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none' }} onClick={() => handleApprove(row)}>Approve</Button>
                        <Button size="small" disabled style={{ fontSize: 12, height: 28, borderRadius: 6, fontWeight: 600 }}>Blocked</Button>
                    </div>
                ),
        },
        {
            title: "Masking",
            dataIndex: "masked",
            align: 'center',
            render: (masked, row) => (
                <Switch
                    checkedChildren="Masked"
                    unCheckedChildren="Unmasked"
                    checked={masked === 1}
                    onChange={checked => changeMaskStatus(row.id, checked ? 1 : 0)}
                />
            ),
        },
        {
            title: "Action",
            dataIndex: 'id',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (id, row) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <Button size="small" style={{ height: 28, borderRadius: 6 }} onClick={() => openForm(row)}>
                        <i className="fa fa-edit"></i>
                    </Button>
                    <Button size="small" danger style={{ height: 28, borderRadius: 6 }} onClick={() => deleteRecord(id)}>
                        <i className="fa fa-times-circle font-red"></i>
                    </Button>
                </div>
            ),
        }
    ];

    refOb.current = { getList };

    useEffect(() => {
        getList();
    }, []);

    return (
        <Table
            size="small"
            dataSource={result}
            columns={cols}
            loading={loading}
            scroll={{ y: wh - 285, x: 900 }}
            style={{ borderRadius: 12, overflow: 'hidden' }}
            pagination={{
                showTotal: (total, range) => (
                    <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13 }}>
                        {range[0]}–{range[1]} of {total} agents
                    </span>
                ),
                showSizeChanger: true,
                pageSize: paging.ps,
                current: paging.p,
                onChange: (p, ps) => setPaging({ p, ps }),
            }}
        />
    );
}

// ---------- Add/Edit Form Modal ----------
const AddEditAgentForm = forwardRef(({ callback }, ref) => {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState({ status: '1' });

    const handleChange = (v, k) => { setData({ ...data, [k]: v }); }

    const save = () => {
        message.destroy();
        util.showLoader();
        UserService.saveUser({ ...data, type: 'AGENT' })
            .then(({ data }) => {
                message.success(data.message || "Saved");
                callback(data.id ? 1 : 1); // reload page 1
                setShowForm(false);
            })
            .catch(e => message.error(e.message))
            .finally(() => util.hideLoader());
    };

    useImperativeHandle(ref, () => ({
        openForm(dtl) {
            setData(dtl ? { ...dtl } : { status: '1' });
            setShowForm(true);
        }
    }));

    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} Agent`}
            open={showForm}
            okText="Save"
            onOk={save}
            onCancel={() => setShowForm(false)}
            destroyOnClose
            maskClosable={false}
            width={400}
        >
            <form onSubmit={e => { e.preventDefault(); save(); }}>
                <div className="row mingap">
                    <div className="col-md-12 form-group">
                        <label className="req">First Name</label>
                        <Input value={data.fname || ''} onChange={e => handleChange(e.target.value, 'fname')} />
                    </div>
                    <div className="col-md-12 form-group">
                        <label>Last Name</label>
                        <Input value={data.lname || ''} onChange={e => handleChange(e.target.value, 'lname')} />
                    </div>
                    <div className="col-md-12 form-group">
                        <label className="req">Email</label>
                        <Input value={data.email || ''} onChange={e => handleChange(e.target.value, 'email')} />
                    </div>
                    <div className="col-md-12 form-group">
                        <label className="req">Mobile</label>
                        <Input value={data.mobile || ''} onChange={e => handleChange(e.target.value, 'mobile')} />
                    </div>
                    <div className="col-md-12 form-group">
                        <label>Username</label>
                        <Input value={data.username || ''} onChange={e => handleChange(e.target.value, 'username')} />
                    </div>
                    <div className="col-md-12 form-group">
                        <label>Password</label>
                        <Input onChange={e => handleChange(e.target.value, 'password')} />
                    </div>
                    <div className="col-md-12 form-group">
                        <label className="req">Status</label>
                        <select value={data.status} onChange={e => handleChange(e.target.value, 'status')}>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
});

// ---------- Main Component ----------
export default function Agents() {
    const [filterFd, setFilterFd] = useState({ k: '' });
    const listRef = useRef({});
    const formRef = useRef();
    

    const openForm = (agent) => formRef.current.openForm(agent);

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <div>
                    <h2>
                        <i className="fa fa-users"></i> Agents
                    </h2>
                    <p className="ph-subtitle">
                        Manage and track all registered agents
                    </p>
                </div>
            </div>

            <div className="page-pad">
                <Card size="small" bodyStyle={{ padding: 0 }}>
                    <div className="above-tbl-filter-pad">
                        <style>{`.agent-search .ant-input::placeholder { color: #000 !important; font-weight: 700 !important; font-size: 14px !important; opacity: 1 !important; }`}</style>
                        <Row align="middle" gutter={[5, 5]}>
                            <Col>
                                <Input
                                    placeholder="Search agents..."
                                    allowClear
                                    value={filterFd.k}
                                    onChange={(e) => setFilterFd({ ...filterFd, k: e.target.value })}
                                    style={{ width: 200 }}
                                    className="agent-search"
                                />
                            </Col>
                            <Col>
                                <Button
                                    icon={<SearchOutlined />}
                                    onClick={() => listRef.current.getList(filterFd)}
                                    style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}
                                >
                                    Search
                                </Button>
                            </Col>
                            <Col flex="auto" />
                            <Col>
                                <Button icon={<PlusOutlined />} onClick={() => openForm()} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}>
                                    Add Agent
                                </Button>
                            </Col>
                        </Row>
                    </div>
                    <div className="bdr-top">
                        <AgentList refOb={listRef} openForm={openForm} />
                    </div>
                </Card>
            </div>

            <AddEditAgentForm ref={formRef} callback={(p) => listRef.current.getList(filterFd, p)} />
        </div>
    );
}
