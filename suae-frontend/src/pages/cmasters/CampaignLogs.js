// Create a new file: src/pages/cmasters/CampaignLogs.js
import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Space, Button, message, Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import CampaignService from '../../services/CampaignService';

const CampaignLogs = ({ campaignId, visible, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchLogs = async (params = {}) => {
        try {
            setLoading(true);
            const { current, pageSize, ...filters } = params;
            const response = await CampaignService.getCampaignLogs(campaignId, {
                page: current || 1,
                page_size: pageSize || 10,
                ...filters,
            });
            
            setLogs(response.data.data || []);
            setPagination({
                ...pagination,
                total: response.data.meta?.total_items || 0,
                current: response.data.meta?.page || 1,
                pageSize: response.data.meta?.page_size || 10,
            });
        } catch (error) {
            console.error('Error fetching logs:', error);
            message.error('Failed to load campaign logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && campaignId) {
            fetchLogs();
        }
    }, [visible, campaignId]);

    const columns = [
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                switch (status) {
                    case 'delivered':
                        color = 'success';
                        break;
                    case 'failed':
                        color = 'error';
                        break;
                    case 'sending':
                        color = 'processing';
                        break;
                    case 'pending':
                        color = 'warning';
                        break;
                }
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Student ID',
            dataIndex: 'student_id',
            key: 'student_id',
        },
        {
            title: 'Sent At',
            dataIndex: 'sent_at',
            key: 'sent_at',
            render: (date) => date ? new Date(date).toLocaleString() : 'Pending',
        },
        {
            title: 'Message',
            dataIndex: 'message_body',
            key: 'message',
            ellipsis: true,
        },
    ];

    return (
        <Modal
            title="Campaign Logs"
            visible={visible}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
            ]}
        >
            <Card
                title="Message Logs"
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchLogs({ ...pagination })}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} logs`,
                    }}
                    onChange={(pagination, filters) => {
                        fetchLogs({
                            ...pagination,
                            ...filters,
                        });
                    }}
                    scroll={{ x: true }}
                />
            </Card>
        </Modal>
    );
};

export default CampaignLogs;