/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import InstituteService from "../../services/InstituteService";
import util from "../../utils/util";
import Profile from "../user/Profile";
import About from "../institute/About";
import Courses from "../institute/Courses";
import Document from "../institute/Documents";
import BlackListCountry from './BlackListCountry';
import { Table, Input, Button, message, Modal, Card, Switch, Tabs, Row, Col, Typography } from 'antd';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { sdx } from '../../sdx';
// import CmasterService from '../../services/CmasterService';
const { confirm } = Modal;
const { Text } = Typography;
const $ = window.$;

function InstituteList({ refOb = { current: {} } }) {
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    //Get Inst id
    // const [instituteId, setInstituteId] = useState('');
    const [paging, setPaging] = useState({ p: 1, ps: 10 });
    const filterParamsRef = useRef({});
    const instituteModalRef = useRef({});
    const modules = util.getModules();

    // Simulate loading institute ID
    // useEffect(() => {
    //     // Example: fetch from API or from context
    //     const fetchId = async () => {
    //         const res = await CmasterService.getInstituteId();
    //         setInstituteId(res.data.data.institute_id);
    //     };
    //     fetchId();
    // }, [instituteId]);

    const getList = (params = null, p = 1) => {
        if (params) filterParamsRef.current = params;
        
        setLoading(true);
        InstituteService.all(filterParamsRef.current)
            .then(({ data }) => {
                const list = data.result.data.map(v => ({
                    ...v,
                    key: v.id,
                    masked: v.mask_status !== undefined ? Number(v.mask_status) : 0, // default 0
                    status: v.status !== undefined ? Number(v.status) : 0, // default 0
                }));
                setResult(list);
                setPaging({ ...paging, p });
            })
            .catch(e => {
                message.error(e.message);
            })
            .finally(() => setLoading(false));
    };

    // const changeMaskStatus = (id, mask_status) => {
    //     message.destroy();

    //     // Optimistic UI
    //     setResult(prev =>
    //         prev.map(item =>
    //             item.id === id ? { ...item, masked: mask_status } : item
    //         )
    //     );

    //     confirm({
    //         title: `Are you sure to ${mask_status === 1 ? 'Mask' : 'Unmask'} this institute?`,
    //         icon: <ExclamationCircleOutlined />,
    //         okText: 'Yes',
    //         okType: 'danger',
    //         cancelText: 'No',
    //         onOk() {
    //             setLoading(true);
    //             InstituteService.changeMaskStatus(id, mask_status)
    //                 .then(({ data }) => {
    //                     message.success(data.message || 'Updated');
    //                 })
    //                 .catch(e => {
    //                     message.error(e.message);
    //                     // revert if backend fails
    //                     setResult(prev =>
    //                         prev.map(item =>
    //                             item.id === id ? { ...item, masked: mask_status === 1 ? 0 : 1 } : item
    //                         )
    //                     );
    //                 })
    //                 .finally(() => setLoading(false));
    //         },
    //         onCancel() {
    //             // revert if user cancels
    //             setResult(prev =>
    //                 prev.map(item =>
    //                     item.id === id ? { ...item, masked: mask_status === 1 ? 0 : 1 } : item
    //                 )
    //             );
    //         },
    //     });
    // };

    const changeMaskStatus = (id, mask_status) => {
        message.destroy();

        confirm({
            title: `Are you sure to ${mask_status === 1 ? 'Mask' : 'Unmask'} this institute?`,
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                setLoading(true);
                // call API, update UI only on success
                InstituteService.changeMaskStatus(id, mask_status)
                    .then(({ data }) => {
                        message.success(data.message || 'Updated');

                        // update list only on success
                        setResult(prev =>
                            prev.map(item =>
                                item.id === id ? { ...item, masked: mask_status } : item
                            )
                        );
                    })
                    .catch(e => {
                        message.error(e.message || 'Failed to update');
                    })
                    .finally(() => setLoading(false));
            },
            onCancel() {
                // nothing to do — UI wasn't changed yet
            },
        });
    };


    const deleteRecord = (id) => {
        message.destroy();
        confirm({
            title: `Do you want to delete this institute?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                setLoading(true);
                InstituteService.delete(id).then(({ data }) => {
                    message.success(data.message || 'Deleted');
                    getList();
                }).catch(e => {
                    message.error(e.message);
                }).finally(() => {
                    setLoading(false);
                })
            },
            onCancel() {
            },
        })
    }

    const changeStatus = (id, status) => {
        message.destroy();
        confirm({
            title: `Are you sure to ${status ? 'approve' : 'disapprove'} this institute?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                setLoading(true);
                InstituteService.changeStatus(id, status).then(({ data }) => {
                    message.success(data.message || 'Updated');
                    getList(null, paging.p);
                }).catch(e => {
                    message.error(e.message);
                }).finally(() => {
                    setLoading(false);
                })
            },
            onCancel() {
            },
        })
    }

    const cols = [
        {
            title: 'Institute',
            render: (row) => (
                <div>
                    <Row align="middle" justify="space-between">
                        <div className='bold600'>{row.name}</div>
                        <div
                            className='fs11 link'
                            style={{ border: '1px solid #ccc', borderRadius: '12px', padding: '0px 8px' }}
                            onClick={() => { instituteModalRef.current.open(row) }}
                        >
                            View
                        </div>
                    </Row>
                    <div className='d-flex fs11 mt5' style={{ flexDirection: 'column' }}>
                        <a href={row.website} target="blank">{row.website}</a>
                        <div>
                            <Text type='secondary'>Type: </Text>
                            <Text type='secondary' strong>{row.type}</Text>
                        </div>
                        <div>
                            <Text type='secondary'>State: </Text>
                            <Text type='secondary' strong>{row.state}</Text>
                        </div>
                        <div>
                            <Text type='secondary'>City: </Text>
                            <Text type='secondary' strong>{row.city}</Text>
                        </div>
                        <div>
                            <Text type='secondary'>Pincode: </Text>
                            <Text type='secondary' strong>{row.pincode}</Text>
                        </div>
                    </div>
                </div>
            )
        },

        {
            title: 'Nodal',
            render: (row) => (
                <div>
                    <div className='bold600'>{row.nodal_name}</div>
                    <div className='d-flex fs11' style={{ flexDirection: 'column' }}>
                        <div>
                            <Text type='secondary'>Designation: </Text>
                            <Text type='secondary' strong>{row.nodal_designation}</Text>
                        </div>
                        <div>
                            <Text type='secondary'>Email: </Text>
                            <Text type='secondary' strong>{row.nodal_email}</Text>
                        </div>
                        <div>
                            <Text type='secondary'>Mobile: </Text>
                            <Text type='secondary' strong>{row.nodal_mobile}</Text>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Head',
            render: (row) => (
                <div>
                    <div className='bold600'>{row.head_name}</div>
                    <div className='d-flex fs11' style={{ flexDirection: 'column' }}>
                        <div>
                            <Text type='secondary'>Designation: </Text>
                            <Text type='secondary' strong>{row.head_designation}</Text>
                        </div>
                        <div>
                            <Text type='secondary'>Email: </Text>
                            <Text type='secondary' strong>{row.head_email} <i className='fa fa-info-circle' title='Will be used for login'></i></Text>
                        </div>
                        <div>
                            <Text type='secondary'>Mobile: </Text>
                            <Text type='secondary' strong>{row.head_mobile}</Text>
                        </div>
                        {modules['view_auto_login'] === 1 &&
                            <Button
                                type="primary"
                                size="small"
                                shape="round"
                                ghost
                                className='w-[120px]'
                                onClick={() => {
                                    const url = util.getInstituteAutoLoginUrl(row.head_email);
                                    window.open(url, '_blank');
                                }}
                            >
                                Auto Login
                            </Button>
                        }
                    </div>
                </div>
            )
        },

        {
            title: 'Status',
            dataIndex: 'status',
            render: (status, row) => (
                <div className="ant-switch-green">
                    <Switch
                        checkedChildren="Approved"
                        unCheckedChildren="Not Approved"
                        checked={status === 1}
                        onChange={checked => changeStatus(row.id, checked ? 1 : 0)}
                    />
                </div>
            )
        },

        {
            title: 'Masking',
            dataIndex: 'masked',
            render: (masked, row) => (
                <div className="ant-switch-blue">
                    {/* <Switch
                        checkedChildren="Masked"
                        unCheckedChildren="Unmasked"
                        checked={masked === 1}
                        onChange={checked => changeMaskStatus(row.id, checked ? 1 : 0)}
                    /> */}
                    <Switch
                        checkedChildren="Masked"
                        unCheckedChildren="Unmasked"
                        checked={masked === 1}
                        disabled={loading}
                        onChange={checked => changeMaskStatus(row.id, checked ? 1 : 0)}
                    />

                </div>
            )
        },

        {
            title: 'Registered On',
            dataIndex: 'created',
            width: "120px",
            render: (text) => <div>{util.getDate(text, 'DD MMM YYYY')}</div>/*  @ hh:mm A */
        },

        {
            title: 'Action',
            dataIndex: 'id',
            width: "80px",
            fixed: 'right',
            render: (id, row) => (
                <div className="text-center">
                    <Button.Group size="small">
                        <Button type="default" onClick={() => instituteModalRef.current.open(row)}>
                            <i className="fa fa-edit"></i>
                        </Button>
                        <Button type="default" onClick={() => deleteRecord(id)}>
                            <i className="fa fa-times-circle font-red"></i>
                        </Button>
                    </Button.Group>
                </div>
            )
        }
    ];

    refOb.current = {
        getList
    };

    useEffect(() => {
        getList();
    }, []);


    return (
        <div>
            <div className="tbl-pag-custom ant-table-text-top" style={{ overflow: 'hidden', borderRadius: 12 }}>
                <Table
                    size="small"
                    dataSource={result}
                    columns={cols}
                    loading={loading}
                    scroll={{ y: 480 }}
                    pagination={{
                        showTotal: (total, range) => (
                            <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13 }}>
                                {range[0]}–{range[1]} of {total} institutes
                            </span>
                        ),
                        showSizeChanger: true,
                        pageSize: paging.ps,
                        current: paging.p,
                        onChange: (p, ps) => {
                            setPaging({ p, ps });
                        },
                        style: { fontFamily: "'Plus Jakarta Sans', sans-serif" }
                    }}
                />
            </div>
            <InstituteModal
                refOb={instituteModalRef}
                callback={() => getList(filterParamsRef.current, paging.p)}
            />
        </div>
    )
}

export default function Institutes() {
    const [filterFd, setFilterFd] = useState({ k: '' });
    const listRef = useRef({});

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <div>
                    <h2>
                        <i className="fa fa-university"></i> Institutes
                    </h2>
                    <p className="ph-subtitle">
                        Manage and track all institutes
                    </p>
                </div>
            </div>

            <div className="page-pad">
                <style>{`.institute-search-input .ant-input::placeholder { color: #64748b !important; font-weight: 600 !important; font-size: 14px !important; opacity: 1 !important; }`}</style>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <i className="fa fa-search" style={{ color: '#475569', fontSize: 14 }}></i>
                        <Input
                            placeholder="Search institutes..."
                            allowClear
                            value={filterFd.k}
                            onChange={e => setFilterFd({ ...filterFd, k: e.target.value })}
                            onPressEnter={() => listRef.current.getList(filterFd)}
                            style={{ background: 'transparent', border: 'none', boxShadow: 'none', fontWeight: 500, color: '#1e293b', width: 280, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            className="institute-search-input"
                        />
                        <Button onClick={() => listRef.current.getList(filterFd)} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, height: 32, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            Search
                        </Button>
                    </div>
                </div>

                <Card size="small" bodyStyle={{ padding: 0 }}>
                    <div className='bdr-top'>
                        <InstituteList refOb={listRef} />
                    </div>
                </Card>
            </div>
        </div>
    )
}

const InstituteModal = (props) => {
    let { refOb, callback } = props;
    const [showModal, setShowModal] = useState(false);
    let [data, setData] = useState({});
    const [activeTab, setActiveTab] = useState('profile');

    const changeTab = (tab) => setActiveTab(tab);
    const handleCancel = () => setShowModal(false);

    refOb.current = {
        open: (dtl) => {
            setData(dtl);
            setActiveTab('profile');
            setShowModal(true);
        },
    };

    useEffect(() => {
        if (showModal) {
            sdx.institute_id = data.id;
        } else {
            sdx.institute_id = null;
        }
    }, [data, showModal]);

    return (
        <Modal
            title={`Details of ${data?.name}`}
            open={showModal}
            onCancel={handleCancel}
            destroyOnClose
            maskClosable={false}
            width={1100}
            style={{ top: 50 }}
            footer={null}
        >
            <div style={{ margin: '-15px 0 0 0' }}>
                <Tabs activeKey={activeTab} onChange={changeTab}>
                    <Tabs.TabPane tab="Profile" key="profile">
                        <Profile InstituteListPage={true} callback={callback} instituteId={data.id} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="About" key="about">
                        <About InstituteListPage={true} instituteId={data.id} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Documents" key="documents">
                        <Document InstituteListPage={true} instituteId={data.id}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Courses" key="courses">
                        <Courses InstituteListPage={true} instituteId={data.id} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="BlackList" key="blacklist">
                        <BlackListCountry
                            InstituteListPage={true}
                            instituteId={data.id}
                        />
                    </Tabs.TabPane>
                </Tabs>
            </div>
        </Modal>
    );
};