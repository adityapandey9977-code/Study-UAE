import React from 'react';
import { useNavigate } from 'react-router-dom';
import util from '../../utils/util';

export default function StuDashTop(props) {
    const navigate = useNavigate();
    const { active } = props;

    const goto = (to) => {
        navigate("/student-application/" + to);
    }

    return (
        <div className="page-head-gradient" style={{ padding: '12px 24px', justifyContent: 'space-between', flexDirection: 'row' }}>
            <div className="d-flex align-items-center">
                <div className="d-flex align-items-center">
                    <div className={"pill-btn mr15 " + (active === 1 ? 'active' : '')} onClick={() => navigate("/dashboard")} style={{ background: active === 1 ? '#fff' : 'rgba(255,255,255,0.2)', color: active === 1 ? '#588d93' : '#fff', border: 'none' }}><i className="fa fa-home mr2"></i> Dashboard</div>
                    <div className={"pill-btn mr15 " + (active === 2 ? 'active' : '')} onClick={() => goto(1)} style={{ background: active === 2 ? '#fff' : 'rgba(255,255,255,0.2)', color: active === 2 ? '#588d93' : '#fff', border: 'none' }}><i className="fa fa-address-card mr2"></i> Basic Information</div>
                    <div className={"pill-btn mr15 " + (active === 3 ? 'active' : '')} onClick={() => goto(2)} style={{ background: active === 3 ? '#fff' : 'rgba(255,255,255,0.2)', color: active === 3 ? '#588d93' : '#fff', border: 'none' }}><i className="fa fa-university mr2"></i> Academic Information</div>
                    <div className={"pill-btn mr15 " + (active === 4 ? 'active' : '')} onClick={() => goto(3)} style={{ background: active === 4 ? '#fff' : 'rgba(255,255,255,0.2)', color: active === 4 ? '#588d93' : '#fff', border: 'none' }}><i className="fa fa-newspaper mr2"></i> Background Information</div>
                    <div className={"pill-btn mr15 " + (active === 5 ? 'active' : '')} onClick={() => goto(4)} style={{ background: active === 5 ? '#fff' : 'rgba(255,255,255,0.2)', color: active === 5 ? '#588d93' : '#fff', border: 'none' }}><i className="fa fa-hand-pointer mr2"></i> Choice Filling</div>
                </div>
                <div className="ml-auto d-flex align-items-center">
                    <div className="pr15" style={{ color: '#fff', fontWeight: 500 }}>
                        Reg. No: <span className="bold600">{util.getRegno()}</span>
                    </div>
                    <div className="pill-btn sm" onClick={(e) => util.logout(e, navigate)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}><i className="fa fa-sign-out-alt mr2"></i> Logout</div>
                </div>
            </div>
        </div>
    )
}