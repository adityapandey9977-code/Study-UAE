/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import InstituteService from "../../services/InstituteService";
import FileService from "../../services/FileService";
import util from "../../utils/util";
import { Input, Button, message, Switch, Radio, Image, Row, Col, Card } from 'antd';
import { AntdDatepicker } from '../../utils/Antd';

export default function About({ InstituteListPage = false, instituteId }) {
    const [data, setData] = useState({ data: [], page: {} });
    const sdataRef = useRef({ p: 1, ps: 50 });

    const normalizePhotoUrl = (rawUrl, version) => {
        const u = util.normalizeUploadsUrl(rawUrl, 'node');
        if (!u || typeof u !== 'string') return u;
        if (u.startsWith('blob:')) return u;
        const v = version || Date.now();
        return `${u}${u.includes('?') ? '&' : '?'}v=${v}`;
    };

    const list = (p, ps) => {
    util.showLoader();
    sdataRef.current.p = p || 1;
    sdataRef.current.ps = ps || sdataRef.current.ps;
    
    const params = { 
        ...sdataRef.current,
        ...(instituteId && { institute_id: instituteId }) 
    };


    InstituteService.aboutInstitutes(params)
        .then(({ data }) => {
            const row = data?.result?.data
                ? data.result.data
                : {
                    wifi_facility: 'N',
                    elibrary: 'N',
                    internation_stu_onboarding: 'N',
                    hostel_facility: 'N',
                    medical_insurance: 'N',
                    internation_stu_visa: 'N',
                    internation_stu_cultural: 'N',
                    internation_stu_arival_welcome: 'N',
                    medical_facility: 'N',
                    internation_stu_induction: 'N'
                };

            setData({
                ...row,
                about_photo_url: normalizePhotoUrl(row?.about_photo_url, row?.about_photo_id),
                excellence_area_photo_url: normalizePhotoUrl(row?.excellence_area_photo_url, row?.excellence_area_photo_id),
                focus_area_photo_url: normalizePhotoUrl(row?.focus_area_photo_url, row?.focus_area_photo_id),
                notable_research_photo_url: normalizePhotoUrl(row?.notable_research_photo_url, row?.notable_research_photo_id),
                academic_facilities_photo_url: normalizePhotoUrl(row?.academic_facilities_photo_url, row?.academic_facilities_photo_id),
                library_database_photo_url: normalizePhotoUrl(row?.library_database_photo_url, row?.library_database_photo_id),
            });
        })
        .catch(e => {
            console.error('API Error:', e); // Debug log
            message.error(e.message || 'Failed to load data');
        })
        .finally(() => {
            util.hideLoader();
        });
};
console.log("data:::",data)
console.log("InstituteListPage",InstituteListPage)
    const uploadDoc = async (e, rw, urlKey) => {
        if (util.checkImage(e.target, 5)) {
            util.showLoader();
            try {
                let rs = await FileService.upload(e.target.files[0]);
                setData({ ...data, [rw]: rs.data.file_id, [urlKey]: rs.data.file_url });
            } catch (e) {
            }
            e.target.value = "";
            util.hideLoader();
        }
    }

    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }

    const handleOk = () => {
        message.destroy();
        util.showLoader();
        InstituteService.saveAboutInstitute(data).then(({ data }) => {
            message.success(data.message || 'Saved');
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }

    useEffect(() => {
        list();
        return () => {
            message.destroy();
        }
    }, [instituteId]);

    return (
        <div className="page-content">
            {!InstituteListPage &&
                <div className="page-head-gradient">
                    <h2>Institute About</h2>
                </div>
            }

            <div className={!InstituteListPage ? "page-pad" : ""}>
                <form onSubmit={e => { e.preventDefault(); handleOk(); }} autoComplete="off" spellCheck="false">
                    <Row gutter={[32, 32]}>
                        <Col span="12">
                            <Card size='small' title="About Institute" type="inner" className='mb15'>
                                <div>
                                    <Input.TextArea rows="4" value={data.about || ''} onChange={e => handleChange(e.target.value, 'about')} />
                                    <div className='w200 mt-2'>
                                        <Image key={data?.about_photo_url || 'about_photo_url'} className="wper100" src={data?.about_photo_url} preview={{ mask: "View" }} />
                                    </div>
                                    <label className="ant-btn mt-1 w200">
                                        <input type="file" className="d-none" accept="image/*" onChange={e => uploadDoc(e, 'about_photo_id', 'about_photo_url')} />
                                        <i className="fa fa-upload"></i> Upload Photo
                                    </label>
                                </div>
                            </Card>

                            <Card size='small' title="Area of Excellance" type="inner" className='mb15'>
                                <div>
                                    <Input.TextArea rows="4" value={data.excellence_area || ''} onChange={e => handleChange(e.target.value, 'excellence_area')} />
                                    <div className='w200 mt-2'>
                                        <Image key={data?.excellence_area_photo_url || 'excellence_area_photo_url'} className="wper100" src={data?.excellence_area_photo_url} preview={{ mask: "View" }} />
                                    </div>
                                    <label className="ant-btn mt-1 w200">
                                        <input type="file" className="d-none" accept="image/*" onChange={e => uploadDoc(e, 'excellence_area_photo_id', 'excellence_area_photo_url')} />
                                        <i className="fa fa-upload"></i> Upload Photo
                                    </label>
                                </div>
                            </Card>

                            <Card size='small' title="Research Capability and Focus Area" type="inner" className='mb15'>
                                <div>
                                    <Input.TextArea rows="4" value={data.focus_area || ''} onChange={e => handleChange(e.target.value, 'focus_area')} />
                                    <div className='w200 mt-2'>
                                        <Image key={data?.focus_area_photo_url || 'focus_area_photo_url'} className="wper100" src={data?.focus_area_photo_url} preview={{ mask: "View" }} />
                                    </div>
                                    <label className="ant-btn mt-1 w200">
                                        <input type="file" className="d-none" accept="image/*" onChange={e => uploadDoc(e, 'focus_area_photo_id', 'focus_area_photo_url')} />
                                        <i className="fa fa-upload"></i> Upload Photo
                                    </label>
                                </div>
                            </Card>

                            <Card size='small' title="Notable Research / Publication" type="inner" className='mb15'>
                                <div>
                                    <Input.TextArea rows="4" value={data.notable_research || ''} onChange={e => handleChange(e.target.value, 'notable_research')} />
                                    <div className='w200 mt-2'>
                                        <Image key={data?.notable_research_photo_url || 'notable_research_photo_url'} className="wper100" src={data?.notable_research_photo_url} preview={{ mask: "View" }} />
                                    </div>
                                    <label className="ant-btn mt-1 w200">
                                        <input type="file" className="d-none" accept="image/*" onChange={e => uploadDoc(e, 'notable_research_photo_id', 'notable_research_photo_url')} />
                                        <i className="fa fa-upload"></i> Upload Photo
                                    </label>
                                </div>
                            </Card>

                            <Card size='small' title="Academic Facilities" type="inner" className='mb15'>
                                <div>
                                    <Input.TextArea rows="4" value={data.academic_facilities || ''} onChange={e => handleChange(e.target.value, 'academic_facilities')} />
                                    <div className='w200 mt-2'>
                                        <Image key={data?.academic_facilities_photo_url || 'academic_facilities_photo_url'} className="wper100" src={data?.academic_facilities_photo_url} preview={{ mask: "View" }} />
                                    </div>
                                    <label className="ant-btn mt-1 w200">
                                        <input type="file" className="d-none" accept="image/*" onChange={e => uploadDoc(e, 'academic_facilities_photo_id', 'academic_facilities_photo_url')} />
                                        <i className="fa fa-upload"></i> Upload Photo
                                    </label>
                                </div>
                            </Card>

                            <Card size='small' title="Library Database" type="inner">
                                <div>
                                    <Input.TextArea rows="4" value={data.library_database || ''} onChange={e => handleChange(e.target.value, 'library_database')} />
                                    <div className='w200 mt-2'>
                                        <Image key={data?.library_database_photo_url || 'library_database_photo_url'} className="wper100" src={data?.library_database_photo_url} preview={{ mask: "View" }} />
                                    </div>
                                    <label className="ant-btn mt-1 w200">
                                        <input type="file" className="d-none" accept="image/*" onChange={e => uploadDoc(e, 'library_database_photo_id', 'library_database_photo_url')} />
                                        <i className="fa fa-upload"></i> Upload Photo
                                    </label>
                                </div>
                            </Card>
                        </Col>

                        <Col span="12">
                            <div className='position-relative'>
                                {/* <div style={{position:'absolute', zIndex:1, left:0, top:0, width:'100%', height:'100%'}}></div> */}
                                <Card size='small' className='mb15'>
                                    <label className="">Established Year</label>
                                    <div className='w200'>
                                        <AntdDatepicker value={data.established_year} format="YYYY" picker="year" onChange={dt => handleChange(dt, 'established_year')} />
                                    </div>
                                </Card>
                                <Card size='small' className='mb15'>
                                    <label className="">Student Strength (Per Year)</label>
                                    <div className='mb15 w200'>
                                        <Input type="number" value={data.student_strength || ''} onChange={e => handleChange(e.target.value, 'student_strength')} />
                                    </div>
                                    <label className="">International Student Intake (Per Year)</label>
                                    <div className='w200'>
                                        <Input type="number" value={data.international_student_intake || ''} onChange={e => handleChange(e.target.value, 'international_student_intake')} />
                                    </div>
                                </Card>

                                <Card size='small' className='mb15'>
                                    <label className="w280">Wifi Facilities :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'wifi_facility') }}
                                        checked={data.wifi_facility === 'Y'}
                                    />
                                    <div>&nbsp;</div>
                                    <label className="w280">E-Library :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'elibrary') }}
                                        checked={data.elibrary === 'Y'}
                                    />
                                    <div>&nbsp;</div>
                                    <label className="w280">International Student Onboarding :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'internation_stu_onboarding') }}
                                        checked={data.internation_stu_onboarding === 'Y'}
                                    />
                                    <div>&nbsp;</div>
                                    <label className="w280">Hostel Facility :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'hostel_facility') }}
                                        checked={data.hostel_facility === 'Y'}
                                    />
                                    <div>&nbsp;</div>
                                    <label className="w280">Medical Insurance :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'medical_insurance') }}
                                        checked={data.medical_insurance === 'Y'}
                                    />
                                </Card>

                                <Card size='small' title="Facilities for International Students" type="inner" className='mb15'>
                                    <label className="w280">International Student Visa :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'internation_stu_visa') }}
                                        checked={data.internation_stu_visa === 'Y'}
                                    />
                                    <div>&nbsp;</div>
                                    <label className="w280">International Student Cultural :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'internation_stu_cultural') }}
                                        checked={data.internation_stu_cultural === 'Y'}
                                    />
                                    <div>&nbsp;</div>
                                    <label className="w280">International Student Arrival Welcome :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'internation_stu_arival_welcome') }}
                                        checked={data.internation_stu_arival_welcome === 'Y'}
                                    />
                                    <div>&nbsp;</div>
                                    <label className="w280">Medical Facility :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'medical_facility') }}
                                        checked={data.medical_facility === 'Y'}
                                    />
                                    <div>&nbsp;</div>
                                    <label className="w280">International Student Induction :</label>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={e => { handleChange((e ? 'Y' : 'N'), 'internation_stu_induction') }}
                                        checked={data.internation_stu_induction === 'Y'}
                                    />
                                </Card>

                                <Card size='small' className='mb15'>
                                    <label className="w280">Type of Institute :</label>
                                    <Radio.Group onChange={(e) => { handleChange(e.target.value, 'institute_type') }} value={data.institute_type}>
                                        <Radio value={'Public'}>Public</Radio>
                                        <Radio value={'Private'}>Private</Radio>
                                    </Radio.Group>
                                    <div>&nbsp;</div>
                                    <label className="w280">Coed Status :</label>
                                    <Radio.Group onChange={(e) => { handleChange(e.target.value, 'coed_status') }} value={data.coed_status}>
                                        <Radio value={'Men'}>Men</Radio>
                                        <Radio value={'Women'}>Women</Radio>
                                        <Radio value={'Co-Ed'}>Co-Ed</Radio>
                                    </Radio.Group>
                                    <div>&nbsp;</div>
                                    <label className="w280">Cuisine Served :</label>
                                    <Radio.Group onChange={(e) => { handleChange(e.target.value, 'cuisine_served') }} value={data.cuisine_served}>
                                        <Radio value={'Veg'}>Veg</Radio>
                                        <Radio value={'Non-Veg'}>Non Veg</Radio>
                                        <Radio value={'Both'}>Both</Radio>
                                    </Radio.Group>
                                </Card>

                                <Card size='small'>
                                    <label className="">Food Cost (USD)</label>
                                    <div className='w200'>
                                        <Input type="number" value={data.food_cost || ''} onChange={e => handleChange(e.target.value, 'food_cost')} />
                                    </div>
                                    <div>&nbsp;</div>

                                    <label className="">Accomodation Cost (USD)</label>
                                    <div className='w200'>
                                        <Input type="number" value={data.accommodation_cost || ''} onChange={e => handleChange(e.target.value, 'accommodation_cost')} />
                                    </div>
                                    <div>&nbsp;</div>

                                    <label className="">Maintanance Cost (USD)</label>
                                    <div className='w200'>
                                        <Input type="number" value={data.maintenance_cost || ''} onChange={e => handleChange(e.target.value, 'maintenance_cost')} />
                                    </div>
                                    <div>&nbsp;</div>

                                    <label className="">Miscellaneous Cost (USD)</label>
                                    <div className='w200'>
                                        <Input type="number" value={data.miscellaneous_cost || ''} onChange={e => handleChange(e.target.value, 'miscellaneous_cost')} />
                                    </div>
                                </Card>
                            </div>
                        </Col>
                    </Row>

                    <div className="pt20 text-center">
                        <Button type="primary" onClick={handleOk} size="large" className='w200' style={{ background: 'linear-gradient(135deg, #588d93 0%, #568cb1 100%)', border: 'none', borderRadius: 8, fontWeight: 600 }}>Save</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}