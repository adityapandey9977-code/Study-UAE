/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
//import {useNavigate} from 'react-router-dom';
import InstituteService from "../../services/InstituteService";
import util from "../../utils/util";
import { RawHTML } from "../../utils/Controls";
import { AntdSelect, AntdPaging } from "../../utils/Antd";
import { Table, Input, Button, message, Modal, List, Spin, Card } from 'antd';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import StudentService from '../../services/StudentService';
const { confirm } = Modal;
const $ = window.$;

export default function Notifications() {
    //const navigate=useNavigate();
    const [result, setResult] = useState({ data: [], page: {} });
    const [isTableLoading, setTableLoading] = useState(false);
    const sdataRef = useRef({ p: 1, ps: (util.isStudent() === 1 || util.isInstitute() === 1) ? 10 : 50 });
    const formRef = useRef({});
    const isAutoRefresh = useRef(false);
    const resultKey = useRef('');

    const cols = [
        /* {
            title:"SR",
            dataIndex:"key",
            width:"40px",
            render:(i)=><div className="nowrap">{result.page.start+i+1}.</div>
        },
        */
        {
            title: 'Notification',
            dataIndex: 'title',
            render: (text, row) => (
                <div>
                    <div className="bold600">{text}</div>
                    <div className="ellipsis note-text">{row.description}</div>
                </div>
            )
        },
        {
            title: 'Created On',
            dataIndex: 'created',
            width: "170px",
            render: (text) => <div>{util.getDate(text, 'DD MMM YYYY @ hh:mm A')}</div>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            width: "100px",
            render: (v) => (
                <div>
                    {String(v) === '1' ? 'Active' : (String(v) === '0' ? 'Inactive' : '-')}
                </div>
            )
        },
        {
            title: '',
            dataIndex: 'id',
            width: "86px",
            render: (id, row) => (
                <div className="text-center">
                    <Button.Group size="small">
                        <Button type="default" onClick={() => formRef.current.open(row)}>
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

    const deleteRecord = (id) => {
        message.destroy();
        confirm({
            title: `Do you want to delete this notification?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                setTableLoading(true);
                InstituteService.deleteNotification(id).then(({ data }) => {
                    message.success(data.message || 'Deleted');
                    list();
                }).catch(e => {
                    message.error(e.message);
                }).finally(() => {
                    setTableLoading(false);
                })
            },
            onCancel() {
            },
        })
    }

    const list = (p, ps, isAuto) => {
        if (!isAuto) {
            $(".ant-table-body, .cscroll").scrollTop(0);
            setTableLoading(true);
        }

        sdataRef.current.p = p || 1;
        sdataRef.current.ps = ps || sdataRef.current.ps;

        const apiCall = util.isStudent() === 1
            ? StudentService.notifications(sdataRef.current)
            : InstituteService.notifications(sdataRef.current);

        apiCall.then(({ data }) => {
            if (resultKey.current !== data.result_key) {
                resultKey.current = data.result_key;
                let rows = (data.result && data.result.data) ? data.result.data : [];
                const seenIds = new Set();
                rows = rows.filter(r => {
                    const rid = String(r?.id ?? '');
                    if (!rid) return true;
                    if (seenIds.has(rid)) return false;
                    seenIds.add(rid);
                    return true;
                });
                rows.forEach((v, i) => { v.key = v.id ?? i; });
                setResult({ ...data.result, data: rows });
            }
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            setTableLoading(false);
        })
    }

    const view = (id, title, description) => {
        Modal.info({
            title,
            content: (
                <div>
                    <RawHTML html={description} />
                </div>
            ),
            onOk() { },
        });

        // if (util.isInstitute()) {
        //     InstituteService.markNotificationRead(id);
        // }
        if (util.isInstitute() === 1) {
            InstituteService.markNotificationRead(id).catch(() => { });
        } else if (util.isStudent() === 1) {
            StudentService.markNotificationRead(id).catch(() => { });
        }

    }

    const autoReload = () => {
        isAutoRefresh.current = setInterval(() => {
            if (sdataRef.current.p === 1 && util.isInstitute() === 1 && window.location.href.indexOf("localhost") < 0) {
                list(1, sdataRef.current.ps, true);
            }
        }, 5000);
    }

    useEffect(() => {
        list();
        autoReload();
        return () => {
            clearInterval(isAutoRefresh.current);
            message.destroy();
        }
    }, []);

    const wh = $(window).height();

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <div>
                    <h2>
                        <i className="fa fa-sync-alt"></i> SIS Updates
                    </h2>
                </div>
            </div>

            <div className="page-pad">
                <Card size="small" bordered={true}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <SearchForm dataRef={sdataRef} onSearch={list} />
                        </div>
                        {util.isStudent() !== 1 && util.isInstitute() !== 1 &&
                            <div>
                                <Button onClick={() => formRef.current.open()} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}><i className="fa fa-plus mr5"></i> Add New</Button>
                            </div>
                        }
                    </div>
                </Card>
                <div className="pt10">
                    {util.isStudent() === 1 || util.isInstitute() === 1 ? (
                        <div>
                            {result.data.length > 0 &&
                                <div className="mb8" style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                                    {result.data.length} records found.
                                </div>
                            }
                            <div className="position-relative">
                                <Spin spinning={isTableLoading}>
                                    <div className="border cscroll" style={{ }}>
                                        <List
                                            size="small"
                                            dataSource={result.data}
                                            renderItem={(item, i) => (
                                                <List.Item style={{ padding: '12px 8px' }}>
                                                    <div className="cpointer" onClick={() => view(item.id, item.title, item.description)}>
                                                        <div style={{ fontWeight: item.isread ? 600 : 700, fontSize: 15, color: '#1e293b' }}>{i + 1}. {item.title}</div>
                                                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Sent on {util.getDate(item.created, 'DD MMM YYYY @ hh:mm A')}</div>
                                                        <div style={{ fontSize: 13, color: '#475569', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                </Spin>
                            </div>

                            <div className='paging-box' style={{ justifyContent: 'center', marginTop: 12 }}>
                                <AntdPaging
                                    onChange={list}
                                    total={result.page.total_records}
                                    current={result.page.cur_page}
                                    pageSize={sdataRef.current.ps}
                                    showSizeChanger
                                    showTotal={(total, range) => (
                                        <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13, marginRight: 12 }}>
                                            {range[0]}–{range[1]} of {total} updates
                                        </span>
                                    )}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div>
                                {result.data.length > 0 &&
                                    <div className="mb8" style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                                        Showing {result.page.start + 1} - {result.page.start + result.page.total} of {result.page.total_records} records.
                                    </div>}

                                <Card size="small" bordered={true} bodyStyle={{ padding: 0 }}>
                                    <Table
                                        size="small"
                                        bordered={false}
                                        dataSource={result.data}
                                        columns={cols}
                                        loading={isTableLoading}
                                        scroll={{ y: wh - 320 }}
                                        pagination={false}
                                        className="stripped"
                                    />

                                    <div className='paging-box' style={{ justifyContent: 'center', marginTop: 12 }}>
                                        <AntdPaging
                                            onChange={list}
                                            total={result.page.total_records}
                                            current={result.page.cur_page}
                                            pageSize={sdataRef.current.ps}
                                            showSizeChanger
                                            showTotal={(total, range) => (
                                                <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13, marginRight: 12 }}>
                                                    {range[0]}–{range[1]} of {total} updates
                                                </span>
                                            )}
                                        />
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AddForm
                refOb={formRef}
                callback={list}
                pageno={sdataRef.current.p}
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
            <style>{`.sis-search .ant-input::placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 14px !important; opacity: 1 !important; } .sis-search .ant-select-selection__placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 14px !important; opacity: 1 !important; }`}</style>
            <div className="d-flex sis-search" style={{ gap: 8 }}>
                <div>
                    <Input placeholder="Search" allowClear value={data.k} onChange={e => handleChange(e.target.value, 'k')} />
                </div>
                {util.isStudent() === 1 &&
                    <div className="w150">
                        <AntdSelect
                            placeholder="All"
                            allowClear
                            options={[{ value: '1', label: "Read" }, { value: '2', label: "Unread" }]}
                            value={data.status}
                            onChange={v => { handleChange(v, 'status') }}
                        />
                    </div>
                }
                <div>
                    <Button icon={<i className="fa fa-search fs13"></i>} onClick={() => onSearch()} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 6, height: 32 }}></Button>
                </div>
            </div>
        </form>
    )
}

const AddForm = (props) => {
    let { callback, pageno, refOb } = props;
    const [showModal, setShowModal] = useState(false);
    let [data, setData] = useState({});
    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }
    const handleOk = () => {
        message.destroy();
        util.showLoader();
        InstituteService.saveNotification(data).then(({ data }) => {
            message.success(data.message || 'Saved');
            callback(data.id ? pageno : 1);
            setShowModal(false);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }
    const handleCancel = () => {
        setShowModal(false);
    }

    refOb.current = {
        ...refOb.current,
        open: (dtl) => {
            setData(dtl ? { ...dtl, status: String(dtl.status ?? '1') } : { status: '1' });
            setShowModal(true);
        }
    }

    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} Notification`}
            visible={showModal}
            okText="Save"
            onOk={handleOk}
            onCancel={handleCancel}
            destroyOnClose
            maskClosable={false}
            width={600}
        >
            <form onSubmit={e => { e.preventDefault(); handleOk() }} autoComplete="off" spellCheck="false">
                <div className="row mingap">
                    <div className="col-md-12 form-group">
                        <label className="req">Title</label>
                        <Input value={data.title || ''} onChange={e => handleChange(e.target.value, 'title')} />
                    </div>
                    <div className="col-md-12 form-group">
                        <label className="req">Description</label>
                        <Input.TextArea rows="4" value={data.description || ''} onChange={e => handleChange(e.target.value, 'description')} />
                    </div>
                    <div className="col-md-6 form-group">
                        <label className="req">Status</label>
                        <AntdSelect
                            placeholder="Select"
                            options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]}
                            value={String(data.status ?? '1')}
                            onChange={v => handleChange(v, 'status')}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    )
}