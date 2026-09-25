/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import StudentService from "../../services/StudentService";
import UserService from "../../services/UserService";
import { AntdSelect } from "../../utils/Antd";
import util from "../../utils/util";
import {
    message,
    Modal,
    Input,
} from 'antd';

const { TextArea } = Input;

export default function AssigntoForm(props) {
    const { cref } = props;
    const [isModalVisible, setModalVisible] = useState(false);
    const [stuDtl, setStuDtl] = useState({});
    const [users, setUsers] = useState([]);
    const [fd, setFd] = useState({});
    
    // Check if user is super admin (only super admin can edit assign to)
    const isSuperAdmin = util.isAdmin() === 1 || util.isClientAdmin() === 1;

    const closeModal = () => {
        setStuDtl({});
        setFd({});
        setModalVisible(false);
    }

    const assign = () => {
        if (!isSuperAdmin) {
            message.warning('Only super admin can change assignment');
            return;
        }
        
        if (!fd.assigned_to) {
            message.warning('Please select a user to assign');
            return;
        }
        
        util.showLoader();
        StudentService.assign(stuDtl.id, fd.assigned_to, fd.remark).then(({ data }) => {
            message.success(data.message);
            cref.current.updateRow(data.rowDtl);
            setModalVisible(false);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }

    cref.current = {
        ...cref.current,
        openAssignToForm: (dtl) => {
            setStuDtl({ ...dtl });
            setFd({ assigned_to: dtl.assigned_to, remark: dtl.remark || '' });
            setModalVisible(true);
        }
    };

    useEffect(() => {
        UserService.allUsers({ status: 1 }).then(({ data }) => setUsers(data.result.data));
    }, []);

    return (
        <Modal
            title="Assign To"
            visible={isModalVisible}
            onCancel={closeModal}
            onOk={assign}
            okText="Assign"
            okButtonProps={{ disabled: !isSuperAdmin }}
            destroyOnClose
            maskClosable={false}
            width={600}
        //style={{top:20}}
        >
            <div>
                <div className="d-flex">
                    <div className="w150">Student Name</div>
                    <div className="bold600"> : {stuDtl.name}</div>
                </div>
                <div className="d-flex mb10">
                    <div className="w150">Registration No.</div>
                    <div className="bold600"> : {stuDtl.regno}</div>
                </div>
                <div>
                    <label className="req">Assign To</label>
                    <AntdSelect
                        showSearch
                        sort
                        options={users.map(v => { return { id: v.id, name: `${v.name} ${v.role ? `(${v.role})` : ``}` } })}
                        value={fd.assigned_to}
                        onChange={v => { setFd({ ...fd, assigned_to: v }) }}
                        disabled={!isSuperAdmin}
                    />
                    {!isSuperAdmin && (
                        <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                            Only super admin can change assignment
                        </div>
                    )}
                </div>
                <div className="mt10">
                    <label>Remark</label>
                    <TextArea
                        rows={4}
                        placeholder="Enter remark or description (optional)"
                        value={fd.remark}
                        onChange={e => { setFd({ ...fd, remark: e.target.value }) }}
                        maxLength={500}
                        showCount
                        disabled={!isSuperAdmin}
                    />
                </div>
            </div>
        </Modal>
    )
}