/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef} from 'react';
import StudentService from "../../services/StudentService";
import CmasterService from "../../services/CmasterService";
import {RawHTML} from "../../utils/Controls";
import {AntdSelect, AntdDatepicker} from "../../utils/Antd";
import util from "../../utils/util";
import moment from 'moment';
import {
    Input,
    Button,
    message,
    Modal,
    List,
    Radio
} from 'antd';
const $=window.$;

export default function StuFollowup(props){
    const {cref}=props;
    const formRef=useRef({});
    const [isModalVisible, setModalVisible]=useState(false);
    const [cats, setCats]=useState([]);
    const [stuDtl, setStuDtl]=useState({});
    const [followups, setFollowups]=useState([]);
    
    const closeModal=()=>{
        setFollowups([]);
        setModalVisible(false);
    }

    const getFollowups=(stu_id)=>{
        util.showLoader();
        StudentService.followups({student_id:stu_id || stuDtl.id}).then(({data})=>{
            setFollowups(data.result.data);
        }).catch(e=>{
            message.error(e.message);
        }).finally(()=>{
            util.hideLoader();
        })
    }

    cref.current={
        ...cref.current,
        openFollowup:(dtl)=>{
            setStuDtl({...dtl});
            setModalVisible(true);
            getFollowups(dtl.id);
        }
    };

    useEffect(()=>{
        CmasterService.allFollowupCats({status:1}).then(({data})=>setCats(data.result.data));
    }, []);

    return (
        <Modal
            title={"Follow-ups: "+stuDtl.name+" ("+stuDtl.regno+")"}
            visible={isModalVisible}
            onCancel={closeModal}
            destroyOnClose
            maskClosable={false}
            width={1200}
            footer={null}
            style={{top:20}}
        >
            <div>
                <FollowupForm 
                    refOb={formRef} 
                    stuDtl={stuDtl} 
                    increaseFollowup={cref.current.increaseFollowup} 
                    getFollowups={getFollowups} 
                    cats={cats} 
                />

                <div className="d-flex bg-light p5 mb10">
                    <div className="my-auto uc bold600 fs13">{followups.length} Follow-ups</div>
                    <div className="my-auto ml-auto">
                        <Button size="small" type="primary" onClick={()=>formRef.current.open()}><i className="fa fa-plus mr5"></i> New Followup</Button>
                    </div>
                </div>
                <div className="cscroll border" style={{height:($(window).height()-175)+'px', marginTop:'-1px'}}>
                    <List
                        size="small"
                        dataSource={followups}
                        renderItem={item=>(
                            <List.Item>
                                <div style1={{paddingLeft:'12px', borderLeft:'3px solid #eee'}}>
                                    <div className="bold600">{item.cat} [{item.subcat}]</div>
                                    <div className="text-secondary fs11">Added by {item.created_by} on {util.getDate(item.created, 'DD MMM YYYY @ hh:mm A')}</div>
                                    <div className="email-body pt5 text-secondary">
                                        <RawHTML html={item.remarks} />
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </Modal>
    )
}

function FollowupForm(props){
    const {refOb, increaseFollowup, getFollowups, stuDtl, cats}=props;
    const [subcats, setSubcats]=useState([]);
    const [data, setData]=useState({});
    const [showModal, setShowModal]=useState(false);
    const handleChange=(v, k)=>{
        data[k]=v;
        setData({...data});
    }

    const closeModal=()=>{
        setData({});
        setShowModal(false);
    }

    const save=()=>{
        util.showLoader();
        StudentService.saveFollowup(data).then((res)=>{
            message.success(res.data.message || 'Added');
            increaseFollowup(data.next_followup_date);
            getFollowups();
            closeModal();
        }).catch(e=>{
            message.error(e.message);
        }).finally(()=>{
            util.hideLoader();
        })
    }

    refOb.current={
        open:()=>{
            setData({...data, student_id:stuDtl.id, folowup_required:'0', next_followup_date:null});
            setShowModal(true);
        }
    }

    return(
        <Modal
            title={"Add Followup"}
            visible={showModal}
            okText="Save"
            onOk={save}
            onCancel={closeModal}
            destroyOnClose
            maskClosable={false}
            width={600}
        >
            <div className="row mingap">
                <div className="col-md-12 form-group">
                    <label className="req">Category</label>
                    <div>
                        <AntdSelect
                            showSearch
                            options={cats.map(v=>{return {id:v.id, name:v.name}})}
                            value={data.cat_id}
                            onChange={v=>{
                                data.subcat_id=null;
                                let cat=cats.find(c=>c.id===v);
                                setSubcats(cat.subcats.map(c=>{return {id:c.id, name:c.name}}));

                                handleChange(v, 'cat_id');
                            }}
                        />
                    </div>
                </div>
                <div className="col-md-12 form-group">
                    <label className="req">Sub-Category</label>
                    <div>
                        <AntdSelect
                            showSearch
                            options={subcats}
                            value={data.subcat_id}
                            onChange={v=>{handleChange(v, 'subcat_id')}}
                        />
                    </div>
                </div>

                <div className="col-md-12 form-group">
                    <label className="req">Feedback/Remarks</label>
                    <Input.TextArea rows="6" value={data.remarks || ''} onChange={e=>handleChange(e.target.value, 'remarks')} />
                </div>

                <div className="col-md-6 form-group">
                    <label className="">Followup Required?</label>
                    <div className="pt5">
                        <Radio.Group
                            options={[{label:'No', value:'0'}, {label:'Yes', value:'1'}]}
                            value={data.folowup_required}
                            onChange={e=>{
                                data.next_date=null;
                                handleChange(e.target.value, 'folowup_required');
                            }}
                        />
                    </div>
                </div>
                <div className="col-md-6 form-group">
                    <label className={data.folowup_required==='1'?'req':''}>Next Followup Date</label>
                    <div>
                        <AntdDatepicker 
                            onChange={dt=>handleChange(dt, 'next_followup_date')} 
                            disabled={data.folowup_required!=='1'} 
                            disabledDate={current=>{
                                return current && current < moment().subtract(1, 'days').endOf('day');
                            }}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}