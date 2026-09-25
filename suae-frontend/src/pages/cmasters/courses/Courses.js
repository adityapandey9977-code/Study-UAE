/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import CmasterService from "../../../services/CmasterService";
import {If} from "../../../utils/Controls";
import {AntdPaging, AntdSelect, AntdTag} from "../../../utils/Antd";
import util from "../../../utils/util";
import{
    Input,
    Button,
    message,
    Modal
} from 'antd';
import{
    ExclamationCircleOutlined,
} from '@ant-design/icons';
const {confirm}=Modal;

export default function Courses(props){
    const [result, setResult]=useState({data:[], page:{}});
    const [courseTypes, setCourseTypes]=useState([]);
    const [careers, setCareers]=useState([]);
    const [disciplines, setDisciplines]=useState([]);

    const sdataRef=useRef({p:1, ps:50});
    const formRef=useRef();

    const list=(p, ps)=>{
        sdataRef.current.p=p || 1;
        sdataRef.current.ps=ps || sdataRef.current.ps;
        util.showLoader();
        CmasterService.courses(sdataRef.current).then(({data})=>{
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
            title: 'Do you Want to delete this course?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                CmasterService.deleteCourse(id).then(({data})=>{
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

    const goToSpecialization=(course_id)=>{
        //props.changeTab('Specializations', course_id);
    }

    useEffect(()=>{
        list();

        CmasterService.courseTypes({status:1}).then(({data})=>setCourseTypes(data.result.data));
        CmasterService.acadCareers({status:1}).then(({data})=>setCareers(data.result.data));
        CmasterService.disciplines({status:1}).then(({data})=>setDisciplines(data.result.data));

        return ()=>{message.destroy()}
    }, []);

    return (
        <div>
            <div className="">
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
                                    <th>Course Name</th>
                                    <th className="w150">Discipline</th>
                                    <th className="w150"></th>
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
                                            <div className="note-text pt3">
                                                <div className="d-flex">
                                                    <div className="w80">Course Type</div> : <div className="bold600 pl5">{v.course_type}</div>
                                                </div>
                                                <div className="d-flex">
                                                    <div className="w80">Acad. Career</div> : <div className="bold600 pl5">{v.acad_career}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{v.discipline}</td>
                                        <td>
                                            <button type="button" className="btn btn-sm btn-primary nowrap" onClick={()=>goToSpecialization(v.id)}>
                                                Specialization <span className="badge badge-warning">{v.specialization_count}</span>
                                            </button>
                                        </td>
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
                {...{courseTypes, careers, disciplines}}
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
    let {callback, pageno, courseTypes, careers, disciplines}=props;
    const [showModal, setShowModal]=useState(false);
    let [data, setData]=useState({});
    const handleChange=(v, k)=>{
        data[k]=v;
        setData({...data});
    }
    const handleOk=()=>{
        message.destroy();
        util.showLoader();
        CmasterService.saveCourse(data).then(({data}) => {
            message.success(data.message || 'Saved');
            callback(data.id?pageno:1);
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

    useImperativeHandle(ref, ()=>({
        openForm(dtl){
            setData(dtl?{...dtl}:{ status:'1'});
            setShowModal(true);
        }
    }));

    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} Course`}
            visible={showModal}
            okText="Save"
            onOk={handleOk}
            onCancel={handleCancel}
            destroyOnClose
            maskClosable={false}
            width={600}
        >
            <form onSubmit={e=> {e.preventDefault(); handleOk()}} autoComplete="off" spellCheck="false">
                <div className="row mingap">
                    <div className="col-md-12 form-group">
                        <label className="req">Name</label>
                        <Input value={data.name || ''} onChange={e => handleChange(e.target.value, 'name')} />
                    </div>
                    
                    <div className="col-md-12 form-group">
                        <label className="req">Course Type</label>
                        <div>
                            <AntdSelect
                                options={courseTypes}
                                value={data.type_id}
                                onChange={v=>{handleChange(v, 'type_id')}}
                            />
                        </div>
                    </div>
                    <div className="col-md-12 form-group">
                        <label className="req">Academic Career</label>
                        <div>
                            <AntdSelect
                                options={careers}
                                value={data.career_id}
                                onChange={v=>{handleChange(v, 'career_id')}}
                            />
                        </div>
                    </div>
                    <div className="col-md-12 form-group">
                        <label className="req">Discipline</label>
                        <div>
                            <AntdSelect
                                options={disciplines}
                                value={data.discipline_id}
                                onChange={v=>{handleChange(v, 'discipline_id')}}
                            />
                        </div>
                    </div>
                    {/* <div className="col-md-12 form-group">
                        <label className="">ERP Code</label>
                        <Input value={data.erp_code || ''} onChange={e=>handleChange(e.target.value.toUpperCase(), 'erp_code')} />
                    </div> */}
                    {/* <div className="col-md-12 form-group">
                        <label className="">Display Order</label>
                        <Input value={data.display_order || ''} onChange={e=>handleChange(parseInt(e.target.value), 'display_order')} />
                    </div> */}
                    <div className="col-md-6 form-group">
                        <label className="">Duration</label>
                        <Input value={data.duration || ''} onChange={e=>handleChange(parseInt(e.target.value), 'duration')} />
                    </div>
                    <div className="col-md-6 form-group">
                        <label className="req">Duration Type</label>
                        <div>
                            <AntdSelect
                                options={[{value:'Month', label:"Month"}, {value:'Year', label:"Year"}]}
                                value={data.duration_type}
                                onChange={v=>{handleChange(v, 'duration_type')}}
                            />
                        </div>
                    </div>                    
                    <div className="col-md-12 form-group">
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
            </form>
        </Modal>
    )
})