/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import CmasterService from '../../services/CmasterService';
import {If} from "../../utils/Controls";
import {AntdPaging, AntdSelect, AntdTag} from "../../utils/Antd";
import util from "../../utils/util";
import{
    Input,
    Button,
    message,
    Modal,
    Divider
} from 'antd';
import{
    ExclamationCircleOutlined,
} from '@ant-design/icons';
const {confirm}=Modal;

export default function FollowupCats(){
    const [result, setResult]=useState({data:[], page:{}});
    const sdataRef=useRef({p: 1, ps: 50});
    const formRef=useRef();
    const list=(p, ps)=>{
        sdataRef.current.p=p || 1;
        sdataRef.current.ps=ps || sdataRef.current.ps;
        util.showLoader();
        CmasterService.followupCats(sdataRef.current).then(({data})=>{
            setResult(data.result);
        }).catch(e => {
            message.error(e.message);
        }).finally(()=>{
            util.hideLoader();
        })
    }

    const deleteRecord=(id)=>{
        message.destroy();
        confirm({
            title: `Do you Want to delete this category?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                CmasterService.deleteFollowupCat(id).then(({data})=>{
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
        });
    }

    useEffect(()=>{
        list();
        return ()=>{message.destroy()}
    }, []);

    return (
        <div>
            <div className="page-head-gradient">
                <h2>Followup Categories</h2>
            </div>

            <div className="page-pad">
                <If cond={result.data.length}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 8 }}>
                        Showing {result.page.start + 1} - {result.page.start + result.page.total} of {result.page.total_records} records.
                    </div>
                </If>

                <div className="d-flex tbl-search-head">
                    <div className="my-auto">
                        <SearchForm dataRef={sdataRef} onSearch={list} />
                    </div>
                    <div className="ml-auto my-auto">
                        <Button type="primary" style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', border: 'none', fontWeight: 600 }} onClick={() => formRef.current.openForm()}><i className="fa fa-plus mr5"></i> Add</Button>
                    </div>
                </div>

                <If cond={result.data.length}>
                    <div className="table-responsive">
                        <table className="table table-bordered table-md table-striped table-hover m-0">
                            <thead className="thead-light text-uppercase table-text-vmid">
                                <tr>
                                    <th className="w20">SN</th>
                                    <th>Category Name</th>
                                    <th className="w130">Display Order</th>
                                    <th className="w60">Status</th>
                                    <th className="w70"></th>
                                </tr>
                            </thead>
                            <tbody className="table-text-top">
                                {result.data.map((v, i) => (
                                    <tr key={i}>
                                        <td>{result.page.start + i + 1}.</td>
                                        <td>
                                            {v.name}
                                            <div className="pt1 note-text">
                                                <span className="bold600">{v.subcats.length}</span> subcategories.
                                            </div>
                                        </td>
                                        <td>{v.display_order}</td>
                                        <td className="nowrap">
                                            {v.status ? (<AntdTag type="success">Active</AntdTag>) : (<AntdTag type="danger">Inactive</AntdTag>)}
                                        </td>
                                        <td className="text-center">
                                            <div className="btn-group btn-group-solid">
                                                <button type="button" className="btn btn-xs default" onClick={()=>formRef.current.openForm(v)}><i className="fa fa-edit"></i></button>
                                                <button type="button" className="btn btn-xs red" onClick={()=>deleteRecord(v.id)}><i className="fa fa-times-circle"></i></button>
                                            </div>
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
                            showTotal={(total, range) => (
                                <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13, marginRight: 12 }}>
                                    {range[0]}–{range[1]} of {total} records
                                </span>
                            )}
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

const SearchForm=(props)=>{
    let {dataRef, onSearch}=props;
    let [data, setData]=useState({ ...dataRef.current });
    const handleChange=(v, k)=>{
        data[k]=v;
        setData({ ...data });
    }
    useEffect(()=>{
        dataRef.current={...data};
    }, [data]);

    useEffect(() => {
        setData({ ...data, p: dataRef.current.p, ps: dataRef.current.ps });
    }, [dataRef.current.p, dataRef.current.ps]);

    return (
        <form onSubmit={e => e.preventDefault()} autoComplete="off" spellCheck="false">
            <style>{`.cmasters-sf .ant-input::placeholder { color: #000 !important; font-weight: 700 !important; font-size: 14px !important; opacity: 1 !important; }`}</style>
            <div className="d-flex cmasters-sf">
                <div>
                    <Input placeholder="Search" allowClear value={data.k} onChange={e=>handleChange(e.target.value, 'k')} />
                </div>
                <div>
                    <Button type="primary" style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', border: 'none', fontWeight: 600 }} icon={<i className="fa fa-search fs13"></i>} onClick={()=>onSearch()}></Button>
                </div>
            </div>
        </form>
    )
}

const AddForm=forwardRef((props, ref)=>{
    let { callback, pageno } = props;
    const [showModal, setShowModal] = useState(false);
    let [data, setData]=useState({subcats:[]});
    const handleChange=(v, k, obj)=>{
        if(obj){
            obj[k]=v;
        }else{
            data[k]=v;
        }
        setData({...data});
    }
    const handleOk=()=>{
        message.destroy();
        util.showLoader();
        CmasterService.saveFollowupCat(data).then(({data}) => {
            message.success(data.message || 'Saved');
            callback(data.id?pageno:1);
            setShowModal(false);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }
    const handleCancel=()=>{
        setShowModal(false);
    }

    const deleteSubcat=(id, i)=>{
        if(id){
            confirm({
                title: `Are you sure to delete this sub-category?`,
                icon: <ExclamationCircleOutlined />,
                content: '',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk() {
                    util.showLoader();
                    CmasterService.deleteFollowupCat(id).then((res)=>{
                        message.success(res.data.message || 'Deleted');
                        data.subcats.splice(i, 1);
                        setData({...data});
                        callback(data.id?pageno:1);
                    }).catch(e=>{
                        message.error(e.message);
                    }).finally(()=>{
                        util.hideLoader();
                    })
                },
                onCancel() {
                },
            });
        }else{
            data.subcats.splice(i, 1);
            setData({...data});
        }
    }

    useImperativeHandle(ref, ()=>({
        openForm(dtl){
            setData(dtl?{...dtl}:{subcats:[], status:'1'});
            setShowModal(true);
        }
    }));

    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} Followup Category`}
            visible={showModal}
            okText="Save"
            onOk={handleOk}
            onCancel={handleCancel}
            destroyOnClose
            maskClosable={false}
            width={1000}
        >
            <form onSubmit={e=> {e.preventDefault(); handleOk()}} autoComplete="off" spellCheck="false">
                <div className="row mingap">
                    <div className="col-md-8">
                        <label className="req">Category Name</label>
                        <Input value={data.name || ''} onChange={e => handleChange(e.target.value, 'name')} />
                    </div>
                    <div className="col-md-2">
                        <label className="">Display Order</label>
                        <Input value={data.display_order || ''} onChange={e=>handleChange(parseInt(e.target.value), 'display_order')} />
                    </div>
                    <div className="col-md-2">
                        <label className="req">Status</label>
                        <div>
                            <AntdSelect
                                options={[{value:'1', label:"Active"}, {value:'0', label:"Inactive"}]}
                                value={data.status}
                                onChange={v=>{handleChange(v, 'status')}}
                            />
                        </div>
                    </div>
                </div>

                <Divider orientation="left">Subcategories</Divider>
                <div className="">
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm table-striped table-hover m-0">
                            <thead className="thead-light text-uppercase table-text-vmid">
                                <tr>
                                    <th className="w20">SN</th>
                                    <th>Sub Category Name</th>
                                    <th className="w130">Display Order</th>
                                    <th className="w100">Status</th>
                                    <th className="w50"></th>
                                </tr>
                            </thead>

                            <tbody className="table-text-vmid">
                                {data.subcats.map((v,i)=>(
                                    <tr key={i}>
                                        <td>{i+1}.</td>
                                        <td>
                                            <Input size="small" value={v.name || ''} onChange={e=>handleChange(e.target.value, 'name', v)} />
                                        </td>
                                        <td>
                                            <Input size="small" value={v.display_order || ''} onChange={e=>handleChange(parseInt(e.target.value), 'display_order', v)} />
                                        </td>
                                        <td>
                                            <AntdSelect
                                                size="small"
                                                options={[{value:'1', label:"Active"}, {value:'0', label:"Inactive"}]}
                                                value={v.status}
                                                onChange={val=>{handleChange(val, 'status', v)}}
                                            />
                                        </td>

                                        <td className="text-center">
                                            <button type="button" className="btn btn-xs red" onClick={()=>deleteSubcat(v.id, i)}>
                                                <i className="fa fa-times-circle"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                <tr>
                                    <td colSpan="5">
                                        <Button type="dashed" size="small" onClick={()=>{data.subcats.push({status:'1'}); setData({...data})}}>
                                            <i className="fa fa-plus mr5 fs11"></i> Add
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </Modal>
    )
})