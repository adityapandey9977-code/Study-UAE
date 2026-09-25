/* eslint-disable no-unused-vars */
import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import util from "../../utils/util";
//import FileService from "../../services/FileService";
import ClientService from '../../services/ClientService';
import WhatsappService from '../../services/WhatsappService';
//import {If} from "../../utils/Controls";
import {
    message,
    Divider,
    Button,
    Spin,
    Card
} from 'antd';
//let $=window.$;

const CompanyDetailForm = forwardRef((props, ref) => {
    const [loading, setLoading] = useState(false);
    const [imgBase64, setImgBase64] = useState('');
    const [waStatus, setWaStatus] = useState('');
    const [waReconnectUrl, setWaReconnectUrl] = useState('');

    //const imgInputRef=useRef();
    //const imgRef=useRef();
    const formRef = useRef();

    const [d, setData] = useState({
        data: {},
        logo_file_id: ''
    });

    //const [countries, setCountries]=useState([]);
    const render = () => { setData({ ...d }); }

    const handleChange = (e) => {
        d.data[e.target.name] = e.target.value;
        render();
    }

    /* const onImageBrowse=async(e)=>{
        d.data.logo_url='';
        if(util.checkImage(e.target, 5)){
            d.data.logo_url=await util.toBase64(e.target.files[0]);
        }
        render();
    } */

    const save = async (e) => {
        if (e) { e.preventDefault(); }
        let fd = new FormData(formRef.current);

        /*if(!d.data.logo_url){
            util.showAlertMsg("Company logo required!", "E");
            return;
        }
        if(imgInputRef.current.value && !d.logo_file_id){
            let file=imgInputRef.current.files[0];
            let rs=await FileService.upload(file, d.data.id);
            if(rs.data.code===200){
                d.logo_file_id=rs.data.file_id;
            }else{
                return;
            }
        }
        if(d.logo_file_id){
            fd.append("logo_file_id", d.logo_file_id);
        }*/

        util.showLoader();
        ClientService.save(fd).then(async ({ data }) => {
            message.success(data.message);

            const instanceId = d?.data?.wa_instance_id;
            if (instanceId) {
                const rs = await WhatsappService.setInstanceId(instanceId);
                if (!rs.success) {
                    message.error(rs.message);
                }
            }
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        });
    }

    const getQRCode = async () => {

        //await WhatsappService.sendMessage({ to: '919560696566', msg: 'Hello Peppa' });
        setLoading(true);
        const res = await WhatsappService.getQRCode();
        if (res.success) {
            const result = res.result || {};

            const prevInstanceId = d?.data?.wa_instance_id;
            d.data.wa_instance_id = result.instance_id;

            if (result.instance_id && String(prevInstanceId || '').trim() !== String(result.instance_id).trim()) {
                const persist = await WhatsappService.setInstanceId(result.instance_id);
                if (!persist.success) {
                    message.error(persist.message);
                }
            }

            if (result.status === 'connected') {
                setWaStatus('connected');
                setImgBase64('');
                setWaReconnectUrl(result.reconnect_url || '');

                if (result.cloudwa_message) {
                    message.info(result.cloudwa_message);
                } else {
                    message.info('WhatsApp instance is already connected. You can send messages without scanning a new QR code.');
                }
            } else {
                setWaStatus('needs_qr');
                setImgBase64(result.base64 || '');
                setWaReconnectUrl('');
            }
        } else {
            message.error(res.message);
            setImgBase64('');
            setWaStatus('');
            setWaReconnectUrl('');
        }

        setLoading(false);
    }

    const init = () => {
        util.showLoader();
        ClientService.detail().then(({ data }) => {
            d.data = data.result;
            render();
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        });
    }
    useEffect(() => {
        init();
        // eslint-disable-next-line
    }, []);

    useImperativeHandle(ref, () => ({
    }));

    return (
        <div>
            <form autoComplete="off" spellCheck="false" onSubmit={save} ref={formRef}>
                <div className="">
                    <Divider orientation="left">Company Details</Divider>
                    <div className="row mingap">
                        <div className="form-group col-md-3">
                            <label className="req">Business Name</label>
                            <input type="text" className="form-control" name="client_name" value={d.data.client_name || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group col-md-3">
                            <label className="req">Phone Number</label>
                            <input type="text" className="form-control" name="phone1" value={d.data.phone1 || ''} onChange={handleChange} maxLength="10" />
                        </div>
                        <div className="form-group col-md-3">
                            <label className="req">City</label>
                            <input type="text" className="form-control" name="city" value={d.data.city || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group col-md-3">
                            <label className="req">Pincode</label>
                            <input type="text" className="form-control" name="pincode" value={d.data.pincode || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group col-md-12">
                            <label className="req">Address</label>
                            <input className="form-control" name="address" value={d.data.address || ''} onChange={handleChange} maxLength="255" />
                        </div>

                        {/* <div className="form-group1 col-md-12">
                            <label className="req">Logo</label>
                            <input type="file" className="form-control form-control-sm" accept="image/*" ref={imgInputRef} onChange={e=>onImageBrowse(e)} />
                            <If cond={d.data.logo_url}>
                                <div className="pt5 w50">
                                    <img src={d.data.logo_url} className="mw-100" ref={imgRef} alt="" />
                                </div>
                            </If>
                        </div> */}
                    </div>

                    <Divider orientation="left">Admin User Detail</Divider>
                    <div className="row mingap">
                        <div className="col-md-3 form-group">
                            <label className="req">Name</label>
                            <input type="text" className="form-control" name="name" value={d.data.name || ''} onChange={handleChange} />
                        </div>
                        <div className="col-md-3 form-group">
                            <label className="req">Email</label>
                            <input type="text" className="form-control" name="email" value={d.data.email || ''} onChange={handleChange} />
                        </div>
                        <div className="col-md-3 form-group">
                            <label className="req">Mobile</label>
                            <input type="text" className="form-control" name="mobile" value={d.data.mobile || ''} onChange={handleChange} maxLength="10" />
                        </div>
                        <div className="col-md-3 form-group">
                            <label className="req">Username</label>
                            <input type="text" className="form-control" name="username" value={d.data.username || ''} onChange={handleChange} />
                        </div>
                    </div>

                    <Divider orientation="left">Whatsapp Instance</Divider>
                    {waStatus === 'connected' && (
                        <div className="row mingap">
                            <div className="col-md-12">
                                <span className="text-success small">WhatsApp status: Connected</span>
                                {waReconnectUrl && (
                                    <div className="mt-1 small">
                                        <div>
                                            If you want to connect WhatsApp again with a new instance, open this URL in your browser to create a new instance ID:
                                        </div>
                                        <div>
                                            <a href={waReconnectUrl} target="_blank" rel="noopener noreferrer">{waReconnectUrl}</a>
                                        </div>
                                        <div>
                                            Copy the instance_id shown on that page, update it in the Instance ID field here, click Update, and then generate the QR code again to log in.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {waStatus && waStatus !== 'connected' && (
                        <div className="row mingap">
                            <div className="col-md-6">
                                <span className="text-warning small">WhatsApp status: Waiting for QR scan</span>
                            </div>
                        </div>
                    )}
                    <div className="row mingap">
                        <div className="col-md-3 form-group">
                            <label className="">Instance ID</label>
                            <input type="text" className="form-control" name="wa_instance_id" value={d.data.wa_instance_id || ''} onChange={handleChange} />
                        </div>
                        <div className="col-md-3 form-group">
                            <label className="">&nbsp;</label>
                            <div><button type="button" className="btn btn-info" onClick={save}>Update</button></div>
                        </div>
                    </div>

                    <div className='mt-3'>
                        <Card
                            size='small'
                            title={(
                                <div>
                                    <div>Scan Whatsapp</div>
                                    <div className="text-[11px]">If you generate QR code then you need to scan otherwise you will not be able to send message</div>
                                </div>
                            )}
                            extra={(
                                <Button type="primary" onClick={getQRCode} loading={loading}>{imgBase64 !== "" ? "Regenerate" : "Generate"} QR Code</Button>
                            )}
                        >
                            <Spin spinning={loading}>
                                <div className="min-h-[200px] text-center pt-2">
                                    {!!imgBase64 &&
                                        <img alt="" src={imgBase64} width={200} />
                                    }
                                </div>
                                {!!imgBase64 &&
                                    <div className="text-center pt-2">
                                        Scan the QR Code above with whatsapp
                                    </div>
                                }
                            </Spin>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
})

export default CompanyDetailForm;