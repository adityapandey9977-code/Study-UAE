/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState} from 'react';
import {Tabs} from 'antd';
import Courses from './Courses';
import Specialization from './Specializations';

export default function Index(){
    const [activeTab, setActiveTab]=useState('Courses');
    const [course_id, setCourseId]=useState(null);
    const changeTab=async(tab, course_id)=>{
        if(course_id){
            setCourseId(course_id);
            await new Promise(r=>setTimeout(r, 200));
        }
        setActiveTab(tab);
    }

    return(
        <div className="ml15">
            <Tabs activeKey={activeTab} onChange={changeTab}>
                <Tabs.TabPane tab="Courses" key="Courses">
                    {activeTab==='Courses' && <Courses changeTab={changeTab} />}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Specializations" key="Specializations">
                    {activeTab==='Specializations' && <Specialization course_id={course_id} />}
                </Tabs.TabPane>
            </Tabs>
        </div>
    )
}