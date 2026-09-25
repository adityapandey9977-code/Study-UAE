import React, { useState } from 'react';
import { Menu } from 'antd';

import AcadCareer from './AcadCareer';
import Boards from './Boards';
import Genders from './Genders';
import Disciplines from './Disciplines';
import CourseTypes from './CourseTypes';
import Courses from './courses';
import Currencies from './Currencies';
import Countries from './Countries';
import FollowupCats from './FollowupCats';
import EduQualifications from './EduQualifications';
import IssuesCats from './IssuesCats';
// import EmailTemplates from './EmailTemplates';
import LogoChange from './LogoChange';

export default function Index() {
    const [activeKey, setActiveKey] = useState('acad-careers');
    const tabs = [
        { k: 'acad-careers', lbl: 'Academic' },
        { k: 'genders', lbl: 'Genders' },
        { k: 'disciplines', lbl: 'Disciplines' },
        { k: 'course-types', lbl: 'Course Types' },
        { k: 'courses', lbl: 'Courses' },
        { k: 'currencies', lbl: 'Currencies' },
        { k: 'countries', lbl: 'Countries' },
        { k: 'followup-cats', lbl: 'Followup' },
        { k: 'EduQualifications', lbl: 'Edu Qual' },
        { k: 'IssuesCats', lbl: 'Issues Categories' },
    ];//.sort((a,b)=>(''+a.lbl).localeCompare(b.lbl));

    const goto = (e) => {
        setActiveKey(e.key);
    }

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <div>
                    <h2>
                        <i className="fa fa-sliders-h"></i> Masters
                    </h2>
                </div>
            </div>

            <div className="page-pad">
                <div style={{ marginBottom: 16, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    <Menu mode="horizontal" selectedKeys={[activeKey]} onClick={goto} style={{ borderRadius: 10, background: '#fff', border: '1px solid #e5e7eb', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexWrap: 'nowrap', gap: 0 }}>
                        {tabs.map((v, i) => (
                            <Menu.Item key={v.k} style={{ borderRadius: 8, margin: '2px 3px', fontWeight: 700, fontSize: 19, flex: '0 0 auto', padding: '0 18px' }}>{v.lbl}</Menu.Item>
                        ))}
                    </Menu>
                </div>

                {activeKey === 'acad-careers' && <AcadCareer />}
                {activeKey === 'boards' && <Boards type="Board" />}
                {activeKey === 'universities' && <Boards type="University" />}
                {activeKey === 'genders' && <Genders />}
                {activeKey === 'disciplines' && <Disciplines />}
                {activeKey === 'course-types' && <CourseTypes />}
                {activeKey === 'courses' && <Courses />}
                {activeKey === 'currencies' && <Currencies />}
                {activeKey === 'countries' && <Countries />}
                {activeKey === 'followup-cats' && <FollowupCats />}
                {activeKey === 'EduQualifications' && <EduQualifications />}
                {activeKey === 'IssuesCats' && <IssuesCats />}
            </div>
        </div>
    )
}