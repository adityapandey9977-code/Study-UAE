/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import UserService from "../../services/UserService";
import { If } from "../../utils/Controls";
import { AntdPaging, AntdTag, AntdSelect } from "../../utils/Antd";
import util from "../../utils/util";
import Tabs, { PageHeading } from "./Tabs";
import {
    Input,
    Button,
    message,
    Modal,
    Divider,
    Checkbox
} from 'antd';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';
const { confirm } = Modal;

export default function Role() {
    const [result, setResult] = useState({ data: [], page: {} });
    const [modules, setModules] = useState([]);
    const sdataRef = useRef({ p: 1, ps: 25 });
    const formRef = useRef();

    const list = (p, ps) => {
        sdataRef.current.p = p || 1;
        sdataRef.current.ps = ps || sdataRef.current.ps;
        util.showLoader();
        UserService.roles(sdataRef.current).then(({ data }) => {
            setResult(data.result);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }

    const deleteRecord = (id) => {
        message.destroy();
        confirm({
            title: 'Do you Want to delete this role?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                UserService.deleteRole(id).then(({ data }) => {
                    message.success(data.message || 'Deleted');
                    list();
                }).catch(e => {
                    message.error(e.message);
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
        UserService.modules().then(res => {
            setModules([...res.data.data])
        })
        return () => { message.destroy() }
    }, []);

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <h2><PageHeading /></h2>
            </div>

            <div className="page-pad">
                <div className="tabbable-custom">
                    <Tabs active="roles" />
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
                                                <th>Role Name</th>
                                                <th className="w60">Status</th>
                                                <th className="w70">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-text-top">
                                            {result.data.map((v, i) => (
                                                <tr key={i}>
                                                    <td>{result.page.start + i + 1}.</td>
                                                    <td>{v.title}</td>

                                                    <td className="nowrap">
                                                        {v.status ? (<AntdTag type="success">Active</AntdTag>) : (<AntdTag type="danger">Inactive</AntdTag>)}
                                                    </td>
                                                    <td className="text-center">
                                                        <Button.Group size="small">
                                                            <Button type="default" disabled={v.id * 1 < 3} onClick={() => formRef.current.openForm(v)}><i className="fa fa-edit"></i></Button>
                                                            <Button type="default" disabled={v.id * 1 < 3} onClick={() => deleteRecord(v.id)}><i className="fa fa-times-circle font-red"></i></Button>
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
                modules={modules}
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
    let { callback, pageno, modules } = props;
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState(null);
    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }
    const save = () => {
        message.destroy();
        util.showLoader();
        UserService.saveRole(data).then(({ data }) => {
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
            setData(dtl ? { ...dtl } : { app_modules: [], status: '1', leads_show_type: 'ALL' });
            setShowForm(true);
        }
    }));

    return (
        <Modal
            title={`${data?.id ? 'Edit' : 'Add'} Role`}
            open={showForm}
            okText="Save"
            onOk={save}
            onCancel={closeForm}
            destroyOnClose
            maskClosable={false}
            width={1000}
        >
            <form onSubmit={e => { e.preventDefault(); save() }} autoComplete="off" spellCheck="false">
                {data !== null &&
                    <div className="noselect">
                        <div className="row mingap">
                            <div className="col-md-6 form-group">
                                <label className="req">Role Name</label>
                                <div className="mb5">
                                    <Input value={data.title || ''} onChange={e => handleChange(e.target.value, 'title')} />
                                </div>
                            </div>

                            <div className="col-md-6 form-group">
                                <label className="req">Show Leads</label>
                                <div className="mb5">
                                    <AntdSelect
                                        options={['ALL', 'ASSIGNED']}
                                        value={data.leads_show_type}
                                        onChange={v => handleChange(v, 'leads_show_type')}
                                    />
                                </div>
                            </div>

                            <div className="col-md-12 form-group">
                                <Divider orientation="left" className="text-secondary mb-0">Module Access</Divider>

                                <div className="row mingap">
                                    {
                                        modules.map((v, i) => (
                                            <div className="col-md-4 py-1" key={i}>
                                                <Checkbox
                                                    checked={data.app_modules?.includes(v.id)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            data.app_modules.push(v.id);
                                                        } else {
                                                            data.app_modules.splice(data.app_modules.indexOf(v.id), 1);
                                                        }
                                                        setData({ ...data });
                                                    }}
                                                >
                                                    {v.name}
                                                </Checkbox>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </form>
        </Modal>
    )
})