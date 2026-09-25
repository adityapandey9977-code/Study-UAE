/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import UserService from "../../services/UserService";
//import util from "../../utils/util";
import { Button, Modal, Input, Select, Spin, Tag, Table, Card, message } from 'antd';
import {
    PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { AntdTag } from "../../utils/Antd";

const { confirm } = Modal;

function FormModal({ data, handleClose, afterSave }) {
    const [fd, setFd] = useState({ ...data });
    const [saving, setSaving] = useState(false);

    const handleChange = (v, k) => {
        setFd({ ...fd, [k]: v });
    }

    const save = async () => {
        setSaving(true);
        const res = await UserService.saveAgentUrlLink(fd);
        if (res.success) {
            message.success(res.message);
            afterSave();
            handleClose();
        } else {
            message.error(res.message);
        }
        setSaving(false);
    }

    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} Url Link`}
            open
            okText="Save"
            cancelText="Close"
            onOk={save}
            onCancel={handleClose}
            okButtonProps={{ loading: saving }}
            destroyOnClose
            maskClosable={false}
            width={400}
            style={{ top: 20 }}
        >
            <div className="flex flex-col gap-4">
                <div>
                    <label className="req">Name</label>
                    <Input value={fd.name || ''} onChange={e => handleChange(e.target.value, 'name')} />
                </div>
                <div>
                    <label>Utm Source</label>
                    <Input value={fd.utm_source || ''} onChange={e => handleChange(e.target.value, 'utm_source')} />
                </div>
                <div>
                    <label className="req">Status</label>
                    <Select
                        className='w-full'
                        options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]}
                        value={`${fd.status}`}
                        onChange={v => handleChange(v, 'status')}
                    />
                </div>
            </div>
        </Modal>
    )
}

export default function AgentUrlLinks() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState([]);
    const [rowData, setRowData] = useState(null);

    const getList = async () => {
        setLoading(true);
        const res = await UserService.getAgentUrlLinks();
        setResult(res.map(v => ({ ...v, key: v.id })));
        setLoading(false);
    }

    const deleteRecord = (uid) => {
        const fn = async () => {
            const res = await UserService.deleteAgentUrlLink(uid);
            if (res.success) {
                message.success(res.message);
                getList();
            } else {
                message.error(res.message);
            }
        }

        confirm({
            title: `Do you want to delete this record?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                fn();
            },
            onCancel() {
            },
        })
    }

    const cols = [
        {
            title: 'Name',
            render: (row) => (
                <div>
                    <div className='font-semibold'>{row.name}</div>
                    <div className='mt-1'>
                        <a href={row.link} target='blank' className='text-[#4285f4]'>{row.link}</a>
                    </div>
                </div>
            )
        },
        // { title: 'Utm Source', dataIndex: 'utm_source' },
        {
            title: 'Status',
            dataIndex: 'status',
            width: "150px",
            render: (status) => <div>{status ? (<AntdTag type="success">Active</AntdTag>) : (<AntdTag type="danger">Inactive</AntdTag>)}</div>
        },
        {
  dataIndex: 'id',
  width: "86px",
  render: (id, row) => (
    <div className="text-center">
      <Button.Group size="small">
        <Button
          type="default"
          onClick={() => setRowData({ ...row })}
          className='flex items-center'
        >
          <EditOutlined />
        </Button>
        <Button
          type="default"
          onClick={() => deleteRecord(row.uid)}   // ← use row.uid
          className='flex items-center'
        >
          <DeleteOutlined className="text-[var(--danger)]" />
        </Button>
      </Button.Group>
    </div>
  )
}
    ]

    useEffect(() => {
        getList();
    }, []);

    return (
        <div className="page-content">
            <Spin spinning={loading}>
                <div className="page-head-gradient" style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                    <h2>Create Url Links</h2>
                    <Button type='primary' style={{ background: '#fff', color: '#588d93', border: 'none', fontWeight: 600, borderRadius: 8 }} onClick={() => setRowData({ status: '1' })}><PlusOutlined /> Create New</Button>
                </div>

                <div className="page-pad">
                    <Card bodyStyle={{ padding: 0 }}>
                        <Table
                            size='small'
                            columns={cols}
                            dataSource={result}
                            pagination={false}
                        />
                    </Card>
                </div>
            </Spin>

            {rowData !== null &&
                <FormModal
                    data={rowData}
                    handleClose={() => setRowData(null)}
                    afterSave={getList}
                />
            }
        </div>
    )
}