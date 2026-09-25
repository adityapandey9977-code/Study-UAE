import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Card, Tabs, List, Modal, Form, Input, Spin } from 'antd';
import { UploadOutlined, CheckCircleOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import CmasterService from '../../services/CmasterService';
import { useNavigate } from 'react-router-dom';
import FileService from '../../services/FileService';
import backgroundEvents from '../../utils/backgroundEvents';

const { TabPane } = Tabs;
const { TextArea } = Input;

const BACKGROUND_TYPES = {
    LOGIN: 'Login Background',
    REGISTRATION: 'Registration Background'
};

export default function LoginBackgroundChange() {
    const [isClientAdmin, setIsClientAdmin] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState('LOGIN');
    const [backgrounds, setBackgrounds] = useState({ LOGIN: [], REGISTRATION: [] });
    const [activeBackgrounds, setActiveBackgrounds] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();


    // Check if user is client admin on component mount
    useEffect(() => {
        const checkAdmin = async () => {
            const isAdmin = localStorage.getItem("is_client_admin") === "1";
            setIsClientAdmin(isAdmin);
            if (!isAdmin) {
                message.warning('You do not have permission to access this page');
                navigate('/dashboard'); // Redirect to dashboard if not admin
            } else {
                setIsInitialized(true); // Set initialized to true when admin check passes
            }
        };

        checkAdmin();
    }, [navigate]);

    useEffect(() => {
        if (isClientAdmin && isInitialized) {
            loadBackgrounds();
        }
    }, [isClientAdmin, isInitialized]);

    const onActivate = async (id, type) => {
        try {
            const response = await CmasterService.activateBackground(id);
            if (response.data && response.data.success) {
                message.success('Background activated successfully');
                console.log('Background activated, triggering updates for type:', type);
                // Update the active background in state
                const backgroundToActivate = backgrounds[type]?.find(bg => bg.id === id);
                if (backgroundToActivate) {
                    setActiveBackgrounds(prev => ({
                        ...prev,
                        [type]: backgroundToActivate
                    }));
                }
                
                // Trigger background update on login page
                localStorage.setItem('backgroundUpdated', Date.now().toString());
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('backgroundUpdated'));
                
                // Also notify via event system
                backgroundEvents.notifyBackgroundChanged(type);
                
                loadBackgrounds(); // Refresh the list
            } else {
                throw new Error(response.data?.message || 'Failed to activate background');
            }
        } catch (error) {
            console.error('Error activating background:', error);
            message.error(error.message || 'Failed to activate background');
        }
    };

    const onDelete = async (id) => {
        try {
            const response = await CmasterService.deleteBackground(id);
            if (response.data && response.data.success) {
                message.success('Background deleted successfully');
                loadBackgrounds(); // Refresh the list
            } else {
                throw new Error(response.data?.message || 'Failed to delete background');
            }
        } catch (error) {
            console.error('Error deleting background:', error);
            message.error(error.message || 'Failed to delete background');
        }
    };

    const loadBackgrounds = async () => {
        if (!isClientAdmin) {
            console.log('Not a client admin, skipping background load');
            return;
        }

        setLoading(true);
        try {
            console.log('Fetching backgrounds...');

            // Load all backgrounds
            const allBackgroundsRes = await CmasterService.getBackgrounds();
            console.log('All backgrounds response:', allBackgroundsRes);

            // Load active backgrounds for both types
            const [activeLoginRes, activeRegRes] = await Promise.all([
                CmasterService.getActiveBackground(BACKGROUND_TYPES.LOGIN),
                CmasterService.getActiveBackground(BACKGROUND_TYPES.REGISTRATION)
            ]);

            console.log('Active backgrounds responses:', {
                login: activeLoginRes?.data,
                registration: activeRegRes?.data
            });

            // Process all backgrounds
            const allBackgrounds = allBackgroundsRes?.data?.data || [];

            // Filter backgrounds by type
            const loginBgs = allBackgrounds.filter(
                bg => bg?.title?.toLowerCase() === BACKGROUND_TYPES.LOGIN.toLowerCase()
            );

            const regBgs = allBackgrounds.filter(
                bg => bg?.title?.toLowerCase() === BACKGROUND_TYPES.REGISTRATION.toLowerCase()
            );

            console.log('Processed backgrounds:', { loginBgs, regBgs });

            // Update available backgrounds
            setBackgrounds({
                LOGIN: loginBgs,
                REGISTRATION: regBgs
            });

            // Process active backgrounds
            const newActiveBackgrounds = {};

            if (activeLoginRes?.data?.success && activeLoginRes.data.data) {
                newActiveBackgrounds.LOGIN = activeLoginRes.data.data;
                console.log('Setting active login background:', newActiveBackgrounds.LOGIN);
            } else {
                console.warn('No active login background found or error occurred');
            }

            if (activeRegRes?.data?.success && activeRegRes.data.data) {
                newActiveBackgrounds.REGISTRATION = activeRegRes.data.data;
                console.log('Setting active registration background:', newActiveBackgrounds.REGISTRATION);
            } else {
                console.warn('No active registration background found or error occurred');
            }

            console.log('Updating active backgrounds state with:', newActiveBackgrounds);
            setActiveBackgrounds(prev => ({
                ...prev,
                ...newActiveBackgrounds
            }));

        } catch (error) {
            console.error('Error in loadBackgrounds:', error);
            message.error('Failed to load backgrounds');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (values) => {
        if (!values.file || !values.file.length) {
            message.error('Please select a file to upload');
            return;
        }

        try {
            setUploading(true);
            const file = values.file[0].originFileObj;

            // 1. First upload the file
            let fileId, fileUrl;
            try {
                const fileUploadRes = await FileService.upload(file);
                fileId = fileUploadRes.data.file_id;
                fileUrl = fileUploadRes.data.file_url;

                if (!fileId || !fileUrl) {
                    throw new Error("File upload failed, no file_id or file_url returned");
                }
            } catch (err) {
                console.error('File upload error:', err);
                throw new Error(err.message || "File upload failed");
            }

            // 2. Then save the background with the file details
            const response = await CmasterService.uploadBackground({
                file_url: fileUrl,
                file_id: fileId,
                title: BACKGROUND_TYPES[activeTab],
                description: values.description
            });

            if (response.data.success) {
                message.success('Background uploaded successfully');
                setIsModalVisible(false);
                form.resetFields();
                loadBackgrounds();
            }
        } catch (error) {
            console.error('Error in handleUpload:', error);
            message.error(error.message || 'Failed to upload background');
        } finally {
            setUploading(false);
        }
    };

    const activateBackground = async (id) => {
        try {
            const response = await CmasterService.activateBackground(id);
            if (response.data.success) {
                message.success('Background set as active');
                loadBackgrounds();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to activate background');
        }
    };

    const deleteBackground = async (id) => {
        try {
            const response = await CmasterService.deleteBackground(id);
            if (response.data.success) {
                message.success('Background deleted successfully');
                loadBackgrounds();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to delete background');
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Image must be smaller than 5MB!');
            return Upload.LIST_IGNORE;
        }
        return false; // Return false to handle upload manually
    };

    useEffect(() => {
        loadBackgrounds();
    }, []);

    const handleTabChange = (key) => {
        setActiveTab(key);
    };
    return (
        <div>
            <div className="page-head-gradient" style={{ padding: '18px 24px' }}>
                <h2>Change Background Image</h2>
            </div>

            <div className="page-pad">
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane tab="Login Background" key="LOGIN">
                    <BackgroundList
                        backgrounds={backgrounds[activeTab]}
                        activeBackground={activeBackgrounds[activeTab]}
                        onActivate={(id) => onActivate(id, activeTab)}
                        onDelete={onDelete}
                        onAddNew={() => setIsModalVisible(true)}
                        loading={loading}
                    />
                </TabPane>
                <TabPane tab="Registration Background" key="REGISTRATION">
                    <BackgroundList
                        backgrounds={backgrounds[activeTab]}
                        activeBackground={activeBackgrounds[activeTab]}
                        onActivate={(id) => onActivate(id, activeTab)}
                        onDelete={onDelete}
                        onAddNew={() => setIsModalVisible(true)}
                        loading={loading}
                    />
                </TabPane>
            </Tabs>

            <Modal
                title={`Add New ${BACKGROUND_TYPES[activeTab]}`}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    onFinish={handleUpload}
                    layout="vertical"
                    disabled={uploading}
                >
                    <Form.Item
                        name="file"
                        label="Background Image"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => {
                            if (Array.isArray(e)) return e;
                            return e && e.fileList;
                        }}
                        rules={[{ required: true, message: 'Please upload an image' }]}
                    >
                        <Upload
                            beforeUpload={beforeUpload}
                            listType="picture-card"
                            maxCount={1}
                            accept="image/*"
                            fileList={form.getFieldValue('file')}
                        >
                            {form.getFieldValue('file')?.length ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                        <TextArea rows={4} disabled={uploading} />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={uploading}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            </div>
        </div>
    );
}

const BackgroundList = ({
    backgrounds,
    activeBackground,
    onActivate,
    onDelete,
    onAddNew,
    loading
}) => {
    if (loading) {
        return <div className="text-center"><Spin size="large" /></div>;
    }


    return (
        <div>
            <Button
                type="primary"
                onClick={onAddNew}
                style={{ marginBottom: 16 }}
                icon={<UploadOutlined />}
            >
                Add New Background
            </Button>

            <div className="active-background" style={{ marginBottom: 24 }}>
                <h3>Active Background:</h3>
                {activeBackground ? (
                    <Card
                        style={{ width: '100%', marginBottom: 16 }}
                        cover={
                            <div style={{ padding: 16 }}>
                                <img
                                    alt={activeBackground.title}
                                    src={activeBackground.file_url}
                                    style={{
                                        width: '100%',
                                        maxHeight: '300px',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        }
                    >
                        <Card.Meta
                            title={activeBackground.title}
                            description={
                                <>
                                    <p>{activeBackground.description}</p>
                                    <small>
                                        Last updated: {new Date(activeBackground.updated_at).toLocaleString()}
                                    </small>
                                </>
                            }
                        />
                    </Card>
                ) : (
                    <p>No active background set</p>
                )}
            </div>

            <h3>Available Backgrounds:</h3>
            <List
                grid={{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={backgrounds}
                loading={loading}
                style={{ padding: '0 16px' }}
                renderItem={item => (
                    <List.Item style={{ padding: '8px 0' }}>
                        <Card
                            style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
                            bodyStyle={{ padding: '12px' }}
                            cover={
                                <div style={{ height: '120px', overflow: 'hidden' }}>
                                    <img
                                        alt={item.title}
                                        src={item.file_url}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center'
                                        }}
                                    />
                                </div>
                            }
                            actions={[
                                <Button
                                    type={item.is_active ? 'primary' : 'default'}
                                    icon={<CheckOutlined />}
                                    onClick={() => !item.is_active && onActivate(item.id)}
                                    disabled={item.is_active}
                                >
                                    {item.is_active ? 'Active' : 'Set as Active'}
                                </Button>,
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        Modal.confirm({
                                            title: 'Delete Background',
                                            content: 'Are you sure you want to delete this background?',
                                            onOk: () => onDelete(item.id)
                                        });
                                    }}
                                >
                                    Delete
                                </Button>
                            ]}
                        >
                            <Card.Meta
                                title={<div style={{ fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>}
                                description={
                                    <div style={{ fontSize: '12px' }}>
                                        <div style={{
                                            height: '36px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            marginBottom: '4px'
                                        }}>
                                            {item.description}
                                        </div>
                                        <div style={{ color: '#8c8c8c' }}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};