/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ClientService from "../services/ClientService";
import {If, PositiveNumInput} from "../utils/Controls";
import {AntdPaging, AntdSelect, AntdTag} from "../utils/Antd";
import util from "../utils/util";
import {
    Input,
    Button,
    message,
    Modal,
    Card
} from 'antd';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';
const { confirm } = Modal;

export default function Clients() {
    const [result, setResult] = useState({ data: [], page: {} });
    const sdataRef = useRef({ p: 1, ps: 25 });
    const formRef = useRef();

    const list = (p, ps) => {
        sdataRef.current.p = p || 1;
        sdataRef.current.ps = ps || sdataRef.current.ps;
        util.showLoader();
        ClientService.list(sdataRef.current).then(({ data }) => {
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
            title: 'Do you Want to delete this client?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                ClientService.delete(id).then(({ data }) => {
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

    useEffect(()=>{
        list();
        return ()=>{message.destroy()}
    }, []);

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <h2>Clients</h2>
            </div>

            <div className="page-pad">
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
                                    <th>Business Name</th>
                                    <th className="w150">Admin Name</th>
                                    <th className="w60">Status</th>
                                    <th className="w70"></th>
                                </tr>
                            </thead>
                            <tbody className="table-text-top">
                                {result.data.map((v, i) => (
                                    <tr key={i}>
                                        <td>{result.page.start + i + 1}.</td>
                                        <td>
                                            {v.client_name}
                                        </td>
                                        <td>
                                            {v.name}
                                            <div className="note-text">({v.email})</div>
                                        </td>
                                        <td className="nowrap">
                                            {v.status ? (<AntdTag type="success">Active</AntdTag>) : (<AntdTag type="danger">Inactive</AntdTag>)}
                                        </td>
                                        <td className="text-center">
                                            <Button.Group size="small">
                                                <Button type="default" onClick={() => formRef.current.openForm(v)}>
                                                    <i className="fa fa-edit"></i>
                                                </Button>
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

            <AddForm
                ref={formRef}
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

const AddForm = forwardRef((props, ref)=>{
    let {callback, pageno}=props;
    const [showForm, setShowForm]=useState(false);
    let [data, setData]=useState({});
    const handleChange=(v, k)=>{
        data[k]=v;
        setData({...data});
    }
    const save=()=>{
        message.destroy();
        util.showLoader();
        ClientService.save(data).then(({data})=>{
            message.success(data.message || 'Saved');
            callback(data.id?pageno:1);
            setShowForm(false);
        }).catch(e=>{
            message.error(e.message);
        }).finally(()=>{
            util.hideLoader();
        })
    }
    const closeForm=()=>{
        setShowForm(false);
    }

    useImperativeHandle(ref, ()=>({
        openForm(dtl){
            setData(dtl?{...dtl}:{status:'1'});
            setShowForm(true);
        }
    }));

    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} Client`}
            visible={showForm}
            okText="Save"
            onOk={save}
            onCancel={closeForm}
            destroyOnClose
            maskClosable={false}
            width={800}
        >
            <form onSubmit={e => { e.preventDefault(); save() }} autoComplete="off" spellCheck="false">
                <div className="mb15">
                    <Card size="small" type="inner" title="Company Detail">
                        <div className="">
                            <div className="row mingap">
                                <div className="col-md-8 form-group">
                                    <label className="req">Business Name</label>
                                    <Input value={data.client_name || ''} onChange={e => handleChange(e.target.value, 'client_name')} />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label className="req">Phone Number</label>
                                    <Input value={data.phone1 || ''} onChange={e => handleChange(e.target.value, 'phone1')} />
                                </div>
                                <div className="col-md-12 form-group">
                                    <label className="req">Address</label>
                                    <Input value={data.address || ''} onChange={e => handleChange(e.target.value, 'address')} />
                                </div>

                                <div className="col-md-4 form-group">
                                    <label className="req">City</label>
                                    <Input value={data.city || ''} onChange={e => handleChange(e.target.value, 'city')} />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label className="req">Pincode</label>
                                    <Input value={data.pincode || ''} onChange={e => handleChange(e.target.value, 'pincode')} />
                                </div>
                                <div className="col-md-4 form-group">
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
                    </Card>
                </div>

                <div className="mb15">
                    <Card size="small" type="inner" title="Admin User Detail">
                        <div className="row mingap">
                            <div className="col-md-4 form-group">
                                <label className="req">Name</label>
                                <Input value={data.name || ''} onChange={e => handleChange(e.target.value, 'name')} />
                            </div>
                            <div className="col-md-4 form-group">
                                <label className="req">Email</label>
                                <Input value={data.email || ''} onChange={e => handleChange(e.target.value, 'email')} />
                            </div>
                            <div className="col-md-4 form-group">
                                <label className="req">Mobile</label>
                                <PositiveNumInput className="form-control" value={data.mobile || ''} onChange={v => handleChange(v, 'mobile')} type="int" maxLength="10" />
                            </div>
                            <div className="col-md-4 form-group">
                                <label className="req">
                                    Username
                                </label>
                                <Input value={data.username || ''} onChange={e => handleChange(e.target.value, 'username')} />
                            </div>
                            <div className="col-md-4 form-group">
                                <label className="">Password</label>
                                <Input value={data.password || ''} onChange={e => handleChange(e.target.value, 'password')} />
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </Modal>
    )
});