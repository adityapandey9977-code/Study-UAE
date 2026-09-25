/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Alert } from "antd";
import Students from '../student/Students';

export default function InsStudents() {
    /* return (
        <div className="page-content">
            <div className="page-head uc d-flex">
                <div className="my-auto">
                    <h2>Students</h2>
                </div>
                <div className="my-auto ml-auto">
                </div>
            </div>

            <div className="page-pad">
                <Alert message="Once SIS Choice filling for Institutes will be closed. The List of Students will be show here those applied for your institute. You will be able to do further processing like Offer Letter generation &amp; Enrolment, etc." banner />
            </div>
        </div>
    ) */

    return (
        <Students />
    );
}