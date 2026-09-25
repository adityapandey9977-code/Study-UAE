import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Upload, Card, Tooltip, Table, Space, Popconfirm } from 'antd';
import { UploadOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { If } from '../../utils/Controls';
import CmasterService from '../../services/CmasterService';
import util from '../../utils/util';

export default function LogoChange() {
    const [logos, setLogos] = useState([]);
    const [activeLogo, setActiveLogo] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const savingRef = useRef(false);

    // Load all logos from backend
    const loadLogos = async () => {
        try {
            setLoading(true);
            const { data } = await CmasterService.getAllLogos();
            
            if (data && data.success && Array.isArray(data.data)) {
                setLogos(data.data);
                const active = data.data.find(logo => logo.is_active);
                setActiveLogo(active || null);
            } else {
                // Handle unexpected response format
                setLogos([]);
                setActiveLogo(null);
            }
        } catch (e) {
            console.error('Error loading logos:', e);
            message.error(e.message || 'Failed to load logos');
            setLogos([]);
            setActiveLogo(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogos(); }, []);

    // Validate before upload
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) { 
            message.error('Only images are allowed'); 
            return Upload.LIST_IGNORE; 
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) { 
            message.error('Image must be smaller than 5MB'); 
            return Upload.LIST_IGNORE; 
        }

        setFileList([file]);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return false; // prevent auto upload
    };

    // Clear selection
    const clearSelection = () => {
        setFileList([]);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
    };

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:image/png;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // Upload and create new logo
    const handleUpload = async () => {
        if (!fileList.length || savingRef.current) return;
        
        savingRef.current = true;
        util.showLoader();
        
        try {
            const file = fileList[0];
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image must be smaller than 5MB');
            }
            
            // Convert image to base64
            const base64Data = await fileToBase64(file);
            
            // Create logo record with base64 data
            const logoData = {
                image_data: base64Data,
                mime_type: file.type,
                file_size: file.size,
                title: 'Logo',
                description: 'Uploaded from admin panel'
            };

            const { data: createData } = await CmasterService.createLogo(logoData);
            
            if (createData.success) {
                message.success('Logo uploaded successfully');
                clearSelection();
                await loadLogos();
                
                // Notify other components
                window.dispatchEvent(new Event('logoUpdated'));
            } else {
                throw new Error(createData.message || 'Failed to upload logo');
            }
        } catch (e) {
            console.error('Upload error:', e);
            
            // Check if it's a database migration error
            if (e.message && e.message.includes('migration')) {
                message.error('Database update required. Please contact your system administrator.');
            } else {
                message.error(e.message || 'Failed to upload logo');
            }
        } finally {
            util.hideLoader();
            savingRef.current = false;
        }
    };

    // Set logo as active
    const handleSetActive = async (id) => {
        util.showLoader();
        try {
            const { data } = await CmasterService.setActiveLogo(id);
            
            if (data.success) {
                message.success('Logo activated successfully');
                await loadLogos();
                
                // Notify Login page and other components to refresh
                window.dispatchEvent(new Event('logoUpdated'));
            }
        } catch (e) {
            message.error(e.message || 'Failed to activate logo');
        } finally {
            util.hideLoader();
        }
    };

    // Delete logo
    const handleDelete = async (id) => {
        util.showLoader();
        try {
            const { data } = await CmasterService.deleteLogo(id);
            
            if (data.success) {
                message.success('Logo deleted successfully');
                await loadLogos();
                
                // Notify other components
                window.dispatchEvent(new Event('logoUpdated'));
            }
        } catch (e) {
            message.error(e.message || 'Failed to delete logo');
        } finally {
            util.hideLoader();
        }
    };

    const columns = [
        {
            title: 'Preview',
            dataIndex: 'file_url',
            key: 'preview',
            width: 120,
            render: (url) => url ? (
                <div style={{ 
                    width: '80px', 
                    height: '60px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <img 
                        src={url} 
                        alt="Logo" 
                        style={{ 
                            width: '80px', 
                            height: '60px', 
                            objectFit: 'contain' 
                        }} 
                    />
                </div>
            ) : <span className="text-muted">No image</span>
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title) => {
                // Replace "Company Logo" with just "Logo"
                if (title === 'Company Logo') {
                    return 'Logo';
                }
                return title || 'Untitled';
            }
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'status',
            width: 100,
            render: (isActive) => (
                isActive ? (
                    <span className="text-success">
                        <CheckCircleOutlined /> Active
                    </span>
                ) : (
                    <span className="text-muted">Inactive</span>
                )
            )
        },
        {
            title: 'Uploaded',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    {!record.is_active && (
                        <Button 
                            type="primary" 
                            size="small"
                            onClick={() => handleSetActive(record.id)}
                        >
                            Set Active
                        </Button>
                    )}
                    <Popconfirm
                        title="Are you sure you want to delete this logo?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                            danger 
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="ml-4">
            <div className="page-head-gradient">
                <h2>Logo Management</h2>
            </div>
            <div className="page-pad">
                <style>{`
                    .logo-page-head{ padding-left:240px; }
                    @media (max-width: 1199px){ .logo-page-head{ padding-left:0; } }
                    .logo-card img{ max-width:100%; height:auto; }
                    .logo-actions{ gap:8px; flex-wrap:wrap; }
                `}</style>
                
                <div className="row mb-4">
                    <div className="col-lg-8 col-md-12 mx-auto">
                        <Card title="Current Active Logo" className="logo-card mb-4">
                            <div className="text-center mb10">
                                {activeLogo ? (
                                    <img 
                                        src={activeLogo.file_url} 
                                        alt="Active logo" 
                                        style={{ maxWidth: '100%', maxHeight: 200 }} 
                                    />
                                ) : (
                                    <div className="text-muted">No active logo set</div>
                                )}
                            </div>
                        </Card>

                        <Card title="Upload New Logo" className="logo-card">
                            <div className="d-flex logo-actions mb-3">
                                <Upload
                                    accept="image/*"
                                    beforeUpload={beforeUpload}
                                    showUploadList={false}
                                    maxCount={1}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        Choose Image
                                    </Button>
                                </Upload>
                                <Button 
                                    type="primary" 
                                    disabled={!fileList.length} 
                                    onClick={handleUpload}
                                >
                                    <i className="fa fa-upload mr5"></i>Upload
                                </Button>
                                <Button 
                                    disabled={!fileList.length} 
                                    onClick={clearSelection}
                                >
                                    <i className="fa fa-undo mr5"></i>Clear
                                </Button>
                            </div>
                            
                            {previewUrl && (
                                <div className="text-center mt10">
                                    <div className="text-secondary mb5">Preview</div>
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        style={{ maxWidth: '100%', maxHeight: 200 }} 
                                    />
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <Card title="All Logos">
                            <Table
                                columns={columns}
                                dataSource={logos}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 10 }}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
