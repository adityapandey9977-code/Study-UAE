/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import InstituteService from "../../services/InstituteService";
import FileService from "../../services/FileService";
import util from "../../utils/util";
import { Button, message, Image, Alert } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';

export default function Document(props) {
    const [data, setData] = useState({ data: [], page: {} });
    const sdataRef = useRef({ p: 1, ps: 50 });

    const getDocUrl = (url) => util.normalizeUploadsUrl(url, 'node');


 const list = (p, ps) => {
    sdataRef.current.p = p || 1;
    sdataRef.current.ps = ps || sdataRef.current.ps;
    
    const params = { 
        ...sdataRef.current,
        ...(props.instituteId && { institute_id: props.instituteId })
    };

    console.log('Fetching documents with params:', params); // Debug log

    InstituteService.documentInstitutes(params)
        .then(({ data }) => {
            console.log('Documents API Response:', data); // Debug log
            setData(data.result.data || []);
        })
        .catch(e => {
            console.error('Error fetching documents:', e); // Debug log
            message.error(e.message || 'Failed to load documents');
        });
};

    const handleOk = () => {
        message.destroy();
        util.showLoader();
        InstituteService.saveDocumentInstitute(data).then(({ data }) => {
            message.success(data.message || 'Saved');
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }

    const uploadDoc = async (e, rw, urlKey) => {
        // if (util.checkImage(e.target, 5) || util.checkPdf(e.target, 5)) {
        util.showLoader();
        try {
            let rs = await FileService.upload(e.target.files[0]);
            setData({ ...data, [rw]: rs.data.file_id, [urlKey]: rs.data.file_url });
        } catch (e) {
        }
        e.target.value = "";
        util.hideLoader();
        // }
    }

    useEffect(() => {
        list();
        return () => {
            message.destroy();
        }
    }, [props.instituteId]);

    return (
        <div className="page-content">
            {!props.InstituteListPage &&
            <div className="page-head-gradient">
                <h2>Institute Documents</h2>
            </div>}

            <div className={!props.InstituteListPage?"page-pad":""}>
                {!props.InstituteListPage &&
                <div className='mb15'>
                    <Alert message="After uploading documents click on 'Save' button" banner />
                </div>}

                <form onSubmit={e=>{e.preventDefault(); handleOk();}} autoComplete="off" spellCheck="false">
                    <div className="row mingap" style={{ justifyContent: 'center' }}>
                        <div className="col-md-6 form-group" style={{ maxWidth: 500 }}>
                            <label className="">Nirf File</label>
                            <div className='mb20'>
                                <div className='w200'>
                                    {
                                        data?.nirf_file_url?.includes('.pdf')
                                            ? <a href={getDocUrl(data?.nirf_file_url)} target="_blank" rel="noreferrer" className='wper100 d-block border text-center pt40 pb20'>
                                                <i className='fa fa-file-pdf fa-3x text-danger'></i>
                                            </a>
                                            : <Image className="wper100" src={getDocUrl(data?.nirf_file_url)}
                                                preview={{
                                                    mask: <><EyeOutlined /><DeleteOutlined className="mx-2" onClick={() => { setData({ ...data, nirf_file_url: '', nirf_file_id: null }) }} /></>
                                                }} />
                                    }


                                </div>
                                {!props.InstituteListPage &&
                                <label className="ant-btn mt-1 w200">
                                    <input type="file" className="d-none" accept="image/*, application/pdf" onChange={e => uploadDoc(e, 'nirf_file_id', 'nirf_file_url')} />
                                    <i className="fa fa-upload"></i> Upload File
                                </label>}
                            </div>

                            <label className="">Naac File</label>
                            <div className='mb20'>
                                <div className='w200'>
                                    {
                                        data?.naac_file_url?.includes('.pdf')
                                            ? <a href={getDocUrl(data?.naac_file_url)} target="_blank" rel="noreferrer" className='wper100 d-block border text-center pt40 pb20'>
                                                <i className='fa fa-file-pdf fa-3x text-danger'></i>
                                            </a>
                                            : <Image className="wper100" src={getDocUrl(data?.naac_file_url)}
                                                preview={{
                                                    mask: <><EyeOutlined /><DeleteOutlined className="mx-2" onClick={() => { setData({ ...data, naac_file_url: '', naac_file_id: null }) }} /></>
                                                }} />
                                    }

                                </div>
                                {!props.InstituteListPage &&
                                <label className="ant-btn mt-1 w200">
                                    <input type="file" className="d-none" accept="image/*, application/pdf" onChange={e => uploadDoc(e, 'naac_file_id', 'naac_file_url')} />
                                    <i className="fa fa-upload"></i> Upload File
                                </label>}
                            </div>

                            <label className="">National Institute File</label>
                            <div className='mb20'>
                                <div className='w200'>
                                    {
                                        data?.national_ins_file_url?.includes('.pdf')
                                            ? <a href={getDocUrl(data?.national_ins_file_url)} target="_blank" rel="noreferrer" className='wper100 d-block border text-center pt40 pb20'>
                                                <i className='fa fa-file-pdf fa-3x text-danger'></i>
                                            </a>
                                            : <Image className="wper100" src={getDocUrl(data?.national_ins_file_url)}
                                                preview={{
                                                    mask: <><EyeOutlined /><DeleteOutlined className="mx-2" onClick={() => { setData({ ...data, national_ins_file_url: '', national_ins_file_id: null }) }} /></>
                                                }} />
                                    }

                                </div>
                                {!props.InstituteListPage &&
                                <label className="ant-btn mt-1 w200">
                                    <input type="file" className="d-none" accept="image/*, application/pdf" onChange={e => uploadDoc(e, 'national_ins_file_id', 'national_ins_file_url')} />
                                    <i className="fa fa-upload"></i> Upload File
                                </label>}
                            </div>

                            <label className="">Eminence File</label>
                            <div className='mb20'>
                                <div className='w200'>
                                    {
                                        data?.eminence_file_url?.includes('.pdf')
                                            ? <a href={getDocUrl(data?.eminence_file_url)} target="_blank" rel="noreferrer" className='wper100 d-block border text-center pt40 pb20'>
                                                <i className='fa fa-file-pdf fa-3x text-danger'></i>
                                            </a>
                                            : <Image className="wper100" src={getDocUrl(data?.eminence_file_url)}
                                                preview={{
                                                    mask: <><EyeOutlined /><DeleteOutlined className="mx-2" onClick={() => { setData({ ...data, eminence_file_url: '', eminence_file_id: null }) }} /></>
                                                }} />
                                    }

                                </div>
                                {!props.InstituteListPage &&
                                <label className="ant-btn mt-1 w200">
                                    <input type="file" className="d-none" accept="image/*, application/pdf" onChange={e => uploadDoc(e, 'eminence_fil_id', 'eminence_file_url')} />
                                    <i className="fa fa-upload"></i> Upload File
                                </label>}
                            </div>

                            <label className="">Other File</label>
                            <div className='mb20'>
                                <div className='w200'>
                                    {
                                        data?.other_file_url?.includes('.pdf')
                                            ? <a href={getDocUrl(data?.other_file_url)} target="_blank" rel="noreferrer" className='wper100 d-block border text-center pt40 pb20'>
                                                <i className='fa fa-file-pdf fa-3x text-danger'></i>
                                            </a>
                                            : <Image className="wper100" src={getDocUrl(data?.other_file_url)}
                                                preview={{
                                                    mask: <><EyeOutlined /><DeleteOutlined className="mx-2" onClick={() => { setData({ ...data, other_file_url: '', other_file_id: null }) }} /></>
                                                }} />
                                    }
                                </div>
                                {!props.InstituteListPage &&
                                <label className="ant-btn mt-1 w200">
                                    <input type="file" className="d-none" accept="image/*, application/pdf" onChange={e => uploadDoc(e, 'other_file_id', 'other_file_url')} />
                                    <i className="fa fa-upload"></i> Upload File
                                </label>}
                            </div>
                        </div>
                        {!props.InstituteListPage &&
                        <div className="col-md-12 text-center">
                            <Button type="primary" onClick={handleOk} size="large" className="w200" style={{ background: 'linear-gradient(135deg, #588d93 0%, #568cb1 100%)', border: 'none', borderRadius: 8, fontWeight: 600 }}>Save </Button>
                        </div>}
                    </div>
                </form>
            </div>

        </div>
    )
}