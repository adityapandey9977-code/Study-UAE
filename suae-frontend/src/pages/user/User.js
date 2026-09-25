/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import UserService from "../../services/UserService";
import { If } from "../../utils/Controls";
import { AntdPaging, AntdSelect, AntdTag } from "../../utils/Antd";
import util from "../../utils/util";
import Tabs, { PageHeading } from "./Tabs";
import {
    Input,
    Button,
    message,
    Modal,
} from 'antd';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';
const { confirm } = Modal;

export default function User({ type = 'CLIENT' }) {
    const [result, setResult] = useState({ data: [], page: {} });
    const sdataRef = useRef({ p: 1, ps: 25, type });
    const formRef = useRef();
    const [roles, setRoles] = useState([]);

    const list = (p, ps) => {
        sdataRef.current.p = p || 1;
        sdataRef.current.ps = ps || sdataRef.current.ps;
        util.showLoader();
        UserService.users(sdataRef.current).then(({ data }) => {
            setResult(data.result);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }

    const handleApprove = (agent) => {
        if (agent.status) {
            message.info("Agent is already active.");
            return;
        }
        util.showLoader();
        UserService.approveAgent(agent.id)
            .then(({ data }) => {
                message.success(data.message || "Agent approved successfully");
                list();
            })
            .catch(e => {
                message.error(e.message || "Approval failed");
            })
            .finally(() => {
                util.hideLoader();
            });
    };

    const handleBlock = (agent) => {
        if (!agent.status) {
            message.info("Agent is already blocked.");
            return;
        }

        confirm({
            title: 'Are you sure you want to block this agent?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                UserService.blockAgent(agent.id)
                    .then(({ data }) => {
                        message.success(data.message || "Agent blocked successfully");
                        list();
                    })
                    .catch(e => {
                        message.error(e.message || "Something went wrong");
                    })
                    .finally(() => {
                        util.hideLoader();
                    });
            }
        });
    };

    const deleteRecord = (id) => {
        message.destroy();
        confirm({
            title: 'Do you Want to delete this user?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                UserService.deleteUser(id).then(({ data }) => {
                    message.success(data.message || 'Deleted');
                    list();
                }).catch(e => {
                    const serverMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message;
                    try { console.error('deleteUser failed:', e?.response?.data || e); } catch (err) { }
                    message.error(serverMsg);
                }).finally(() => {
                    util.hideLoader();
                })
            },
            onCancel() {
            },
        })
    }
    useEffect(() => {
        list();

        UserService.roles({ all: true }).then(res => { setRoles([...res.data.result.data]) })
        return () => { message.destroy() }
    }, []);

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <h2><PageHeading /></h2>
            </div>

            <div className="page-pad">
                <div className="tabbable-custom">
                    <Tabs active={type === "AGENT" ? "agents" : "users"} />
                    <div className="tab-content">
                        <div className="tab-pane fade1 show active">
                            {result.data.length > 0 &&
                                <div className="text-secondary mb8">
                                    Showing {result.page.start + 1} - {result.page.start + result.page.total} of {result.page.total_records} records.
                                </div>
                            }

                            <div className="d-flex tbl-search-head">
                                <div className="my-auto">
                                    <SearchForm dataRef={sdataRef} onSearch={list} />
                                </div>
                                <div className="ml-auto my-auto">
                                    <Button type="primary" onClick={() => formRef.current.openForm()}><i className="fa fa-plus mr5"></i> Add</Button>
                                </div>
                            </div>

                            <If cond={result.data.length}>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-md table-striped table-hover m-0">
                                        <thead className="thead-light text-uppercase table-text-vmid">
                                            <tr>
                                                <th className="w20">SN</th>
                                                <th className="w150">First Name</th>
                                                <th className="w150">Last Name</th>
                                                {type === 'AGENT' &&
                                                    <th className="w100">Code</th>
                                                }
                                                <th className='w400'>Email</th>
                                                <th className="w120">Mobile No.</th>
                                                <th className="w100">Username</th>
                                                <th className='w70'>Auto Login</th>
                                                <th className="w60">Status</th>
                                                <th className='w60 text-center'>Approval</th>
                                                <th className="w70">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-text-top">
                                            {result.data.map((v, i) => (
                                                <tr key={i}>
                                                    <td>{result.page.start + i + 1}.</td>
                                                    <td>{v.fname}</td>
                                                    <td>{v.lname}</td>
                                                    {type === 'AGENT' &&
                                                        <td>{v.agent_code}</td>
                                                    }
                                                    <td>{v.email}</td>
                                                    <td>{v.mobile}</td>
                                                    <td>{v.username}</td>
                                                    <td>
                                                        <Button
                                                            size="small"
                                                            type="primary"
                                                            onClick={() => {
                                                                let url;
                                                                if (v.is_student) {
                                                                    url = util.getStudentAutoLoginUrl(v.email);
                                                                } else if (v.is_institute) {
                                                                    url = util.getInstituteAutoLoginUrl(v.email);
                                                                } else {
                                                                    url = util.getAgentAutoLoginUrl(v.email);
                                                                }
                                                                window.open(url, '_blank');
                                                            }}
                                                        >
                                                            Open
                                                        </Button>
                                                    </td>
                                                    <td className="nowrap">
                                                        {v.status ? (<AntdTag color="green">Active</AntdTag>) : (<AntdTag color="red">Inactive</AntdTag>)}
                                                    </td>
                                                    <td className="nowrap">
                                                        {v.status === 1 ? (
                                                            <>
                                                                <Button
                                                                    size="small"
                                                                    disabled
                                                                    style={{
                                                                        backgroundColor: '#e6f4ea',
                                                                        borderColor: '#c3e6cb',
                                                                        color: '#155724',
                                                                        marginRight: '6px'
                                                                    }}
                                                                >
                                                                    Approved
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    style={{
                                                                        backgroundColor: '#f8d7da',
                                                                        borderColor: '#f5c6cb',
                                                                        color: '#721c24'
                                                                    }}
                                                                    onClick={() => handleBlock(v)}
                                                                >
                                                                    Block
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="small"
                                                                    style={{
                                                                        backgroundColor: '#e6f4ea',
                                                                        borderColor: '#c3e6cb',
                                                                        color: '#155724',
                                                                        marginRight: '6px'
                                                                    }}
                                                                    onClick={() => handleApprove(v)}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    disabled
                                                                    style={{
                                                                        backgroundColor: '#f8d7da',
                                                                        borderColor: '#f5c6cb',
                                                                        color: '#721c24'
                                                                    }}
                                                                >
                                                                    Blocked
                                                                </Button>
                                                            </>
                                                        )}
                                                    </td>

                                                    <td className="text-center">
                                                        <Button.Group size="small">
                                                            <Button type="default" onClick={() => formRef.current.openForm(v)}><i className="fa fa-edit"></i></Button>
                                                            <Button type="default" onClick={() => deleteRecord(v.id)}><i className="fa fa-times-circle font-red"></i></Button>
                                                        </Button.Group>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex tbl-foot-bx">
                                    <AntdPaging
                                        onChange={list}
                                        total={result.page.total_records}
                                        current={result.page.cur_page}
                                        pageSize={sdataRef.current.ps}
                                        showSizeChanger
                                    />
                                </div>
                            </If>
                            <If cond={!result.data.length}>
                                <div className="no-rec">No record found</div>
                            </If>
                        </div>
                    </div>
                </div>
            </div>

            <AddForm
                ref={formRef}
                callback={list}
                pageno={sdataRef.current.p}
                roles={roles}
                type={type}
            />
        </div>
    )
}

const SearchForm = (props) => {
    let { dataRef, onSearch } = props;
    let [data, setData] = useState({ ...dataRef.current });
    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }
    useEffect(() => {
        dataRef.current = { ...data };
    }, [data]);

    useEffect(() => {
        setData({ ...data, p: dataRef.current.p, ps: dataRef.current.ps });
    }, [dataRef.current.p, dataRef.current.ps]);

    return (
        <form onSubmit={e => e.preventDefault()} autoComplete="off" spellCheck="false">
            <div className="d-flex">
                <div>
                    <Input placeholder="Search" allowClear value={data.k} onChange={e => handleChange(e.target.value, 'k')} />
                </div>
                <div>
                    <Button type="primary" icon={<i className="fa fa-search fs13"></i>} onClick={() => onSearch()}></Button>
                </div>
            </div>
        </form>
    )
}

const AddForm = forwardRef((props, ref) => {
    let { callback, pageno, roles, type } = props;
    const [showForm, setShowForm] = useState(false);
    let [data, setData] = useState({});
    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }
    const save = () => {
        message.destroy();
        util.showLoader();
        UserService.saveUser({ ...data, type }).then(({ data }) => {
            message.success(data.message || 'Saved');
            callback(data.id ? pageno : 1);
            setShowForm(false);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }
    const closeForm = () => {
        setShowForm(false);
    }

    useImperativeHandle(ref, () => ({
        openForm(dtl) {
            setData(dtl ? { ...dtl } : { status: '1' });
            setShowForm(true);
        }
    }));

    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} ${type === 'AGENT' ? 'Agent' : 'User'}`}
            open={showForm}
            okText="Save"
            onOk={save}
            onCancel={closeForm}
            destroyOnClose
            maskClosable={false}
            width={400}
        >
            <form onSubmit={e => { e.preventDefault(); save() }} autoComplete="off" spellCheck="false">
                <div className="">
                    <div className="row mingap">
                        {type !== 'AGENT' &&
                            <div className="col-md-12 form-group">
                                <label className="req">Role</label>
                                <div>
                                    <AntdSelect showSearch options={roles} value={data.role_id} onChange={v => { handleChange(v, 'role_id') }} />
                                </div>
                            </div>
                        }
                        <div className="col-md-12 form-group">
                            <label className="req">First Name</label>
                            <Input value={data.fname || ''} onChange={e => handleChange(e.target.value, 'fname')} />
                        </div>
                        <div className="col-md-12 form-group">
                            <label className="">Last Name</label>
                            <Input value={data.lname || ''} onChange={e => handleChange(e.target.value, 'lname')} />
                        </div>

                        <div className="col-md-12 form-group">
                            <label className="req">Email</label>
                            <Input value={data.email || ''} onChange={e => handleChange(e.target.value, 'email')} />
                        </div>

                        <div className="col-md-12 form-group">
                            <label className="req">Mobile</label>
                            <div>
                                <Input value={data.mobile || ''} onChange={e => handleChange(e.target.value, 'mobile')} />
                            </div>
                        </div>

                        <div className="col-md-12 form-group">
                            <label >Username</label>
                            <Input value={data.username || ''} onChange={e => handleChange(e.target.value, 'username')} />
                        </div>
                        <div className="col-md-12 form-group">
                            <label className="">Password</label>
                            <div>
                                <Input onChange={e => handleChange(e.target.value, 'password')} />
                            </div>
                        </div>

                        <div className="col-md-12 form-group">
                            <label className="req">Status</label>
                            <div>
                                <AntdSelect
                                    options={[{ value: '1', label: "Active" }, { value: '0', label: "Inactive" }]}
                                    value={data.status}
                                    onChange={v => { handleChange(v, 'status') }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </Modal>
    )
})
