/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
//import StudentService from "../../services/StudentService";
import util from "../../utils/util";
import StuForm from './StuForm';

export default function ApplicationForm() {
    const navigate = useNavigate();
    const cref = useRef({});

    useEffect(() => {
    }, []);

    return (
        <div className="page-content">
            <div className="page-head-gradient" style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                <h2>Application Form</h2>
                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                        Reg. No: <span className="bold600">{util.getRegno()}</span>
                    </span>
                    <div className="pill-btn sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }} onClick={() => navigate("/dashboard")}>Go To Dashboard</div>
                </div>
            </div>

            <div className="page-pad">
                <StuForm cref={cref} />
            </div>
        </div>
    )
}