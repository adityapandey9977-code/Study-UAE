import React from "react";
import { Card, Row, Col, Typography, Button, Divider, Modal, Tag, Table, message, Input, Popconfirm, Space } from "antd";
import CmasterService from "../../services/CmasterService";
import themeLoader from "../../utils/themeLoader";

export default function ColorThemeManager() {
    const [refreshKey, setRefreshKey] = React.useState(0);

    const DEFAULT_VARS = React.useMemo(() => ({
        "--theme-green-dark": "#00666a",   // Header
        "--theme-green-light": "#009297", // Sidebar
        "--theme-orange": "#fd8a52",      // Accent
    }), []);

    const [selectedVar, setSelectedVar] = React.useState("--theme-green-dark");
    const [pendingColor, setPendingColor] = React.useState("");
    const confirmOpenRef = React.useRef(false);

    const applyVars = (vars) => {
        const root = document.documentElement;
        Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    };

    const readCssVar = (key) => {
        try {
            const root = document.documentElement;
            const val = getComputedStyle(root).getPropertyValue(key);
            return (val || "").trim();
        } catch {
            return currentVars[key];
        }
    };

    // Get the color to display in preview (shows pending color if exists)
    const getPreviewColor = (key) => {
        if (key === selectedVar && pendingColor) {
            return pendingColor;
        }
        return readCssVar(key) || currentVars[key];
    };

    const handleDeleteTheme = async (record) => {
        const id = record.id || record._id || record.name;
        try {
            await CmasterService.deleteTheme(id);
            setThemes((prev) => prev.filter(t => (t.id || t._id) !== (record.id || record._id)));
            message.success('Theme deleted');
            // If the deleted theme was active, fall back to defaults
            const wasActive = record.status === 'ACTIVE' || record.is_active === true;
            if (wasActive) {
                resetDefaults();
            }
        } catch (e) {
            message.error('Failed to delete theme');
        }
    };

    const saveTheme = async () => {
        if (!newThemeName || savingTheme) return;
        // Read the currently applied CSS variables so the saved theme matches what the user sees
        const payload = {
            name: newThemeName,
            primary_color: readCssVar('--theme-green-dark') || currentVars['--theme-green-dark'],
            secondary_color: readCssVar('--theme-green-light') || currentVars['--theme-green-light'],
            accent_color: readCssVar('--theme-orange') || currentVars['--theme-orange'],
            neutral_color: '#F0F4F8',
            status: 'INACTIVE',
        };
        try {
            setSavingTheme(true);
            await CmasterService.saveTheme(payload);
            message.success('Theme saved successfully');
            setNewThemeName("");
            fetchThemes();
        } catch (e) {
            message.error('Failed to save theme');
        } finally {
            setSavingTheme(false);
        }
    };

    const loadSavedVars = React.useCallback(() => {
        try {
            const raw = localStorage.getItem("app-theme-vars");
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }, []);

    const currentVars = React.useMemo(() => ({ ...DEFAULT_VARS, ...loadSavedVars() }), [DEFAULT_VARS, loadSavedVars]);

    React.useEffect(() => {
        // On mount, apply saved vars (or defaults if none)
        applyVars(currentVars);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveVar = (key, value) => {
        // Apply the color live
        applyVars({ [key]: value });
        // Update the localStorage cache so it persists on refresh
        const saved = loadSavedVars();
        const next = { ...saved, [key]: value };
        localStorage.setItem("app-theme-vars", JSON.stringify(next));
    };

    const resetDefaults = () => {
        // Use themeLoader to clear cache and apply defaults consistently
        themeLoader.clearCache();
    };

    const confirmResetDefaults = () => {
        Modal.confirm({
            title: 'Reset to Default Theme?',
            content: 'This will restore the default colors for Header, Sidebar, and Accent on this browser.',
            okText: 'Reset',
            cancelText: 'Cancel',
            okButtonProps: { danger: true },
            onOk: () => resetDefaults(),
        });
    };

    const parts = [
        { key: "--theme-green-dark", label: "Header" },
        { key: "--theme-green-light", label: "Sidebar" },
        { key: "--theme-orange", label: "Accent" },
    ];

    const currentColor = (key) => readCssVar(key) || currentVars[key];

    const { Title, Text } = Typography;
    const [newThemeName, setNewThemeName] = React.useState("");
    const [savingTheme, setSavingTheme] = React.useState(false);

    // Backend-managed presets
    const [themes, setThemes] = React.useState([]);
    const [loadingThemes, setLoadingThemes] = React.useState(false);

    const fetchThemes = React.useCallback(async () => {
        try {
            setLoadingThemes(true);
            const res = await CmasterService.getThemes();
            const raw = Array.isArray(res.data?.result) ? res.data.result : (Array.isArray(res.data) ? res.data : []);
            const list = raw.map((t) => ({
                ...t,
                status: typeof t.is_active === 'boolean' ? (t.is_active ? 'ACTIVE' : 'INACTIVE') : (t.status || 'INACTIVE'),
            }));
            setThemes(list);
            // If no theme is active in backend, ensure UI falls back to default colors
            const anyActive = list.some(t => t.status === 'ACTIVE');
            if (!anyActive) {
                resetDefaults();
            }
        } catch (e) {
            message.error('Failed to load themes');
        } finally {
            setLoadingThemes(false);
        }
    }, []);

    React.useEffect(() => { fetchThemes(); }, [fetchThemes]);

    const applyPresetLocally = (t) => {
        if (!t) return;
        const saved = (() => { try { return JSON.parse(localStorage.getItem('app-theme-vars') || '{}'); } catch { return {}; } })();
        const next = {
            ...saved,
            '--theme-green-dark': t.primary_color || saved['--theme-green-dark'],
            '--theme-green-light': t.secondary_color || saved['--theme-green-light'],
            '--theme-orange': t.accent_color || saved['--theme-orange'],
        };
        localStorage.setItem('app-theme-vars', JSON.stringify(next));
        applyVars({
            '--theme-green-dark': next['--theme-green-dark'],
            '--theme-green-light': next['--theme-green-light'],
            '--theme-orange': next['--theme-orange'],
        });
    };

    // const activateTheme = (record) => {
    //     const id = record.id || record._id;
    //     Modal.confirm({
    //         title: `Set ${record.name} as active theme?`,
    //         okText: 'Activate',
    //         cancelText: 'Cancel',
    //         onOk: async () => {
    //             try {
    //                 // Send minimal payload to maximize backend compatibility
    //                 await CmasterService.activateTheme(id, { status: 'ACTIVE' });
    //                 // Fetch latest themes and apply the one marked active by backend
    //                 const res = await CmasterService.getThemes();
    //                 const raw = Array.isArray(res.data?.result) ? res.data.result : (Array.isArray(res.data) ? res.data : []);
    //                 const list = raw.map((t) => ({
    //                     ...t,
    //                     status: typeof t.is_active === 'boolean' ? (t.is_active ? 'ACTIVE' : 'INACTIVE') : (t.status || 'INACTIVE'),
    //                 }));
    //                 setThemes(list);
    //                 const active = list.find(t => t.status === 'ACTIVE');
    //                 if (active) {
    //                     applyPresetLocally(active);
    //                 }
    //                 message.success('Theme activated');
    //             } catch (e) {
    //                 message.error(e?.response?.data?.message || 'Failed to activate theme');
    //             }
    //         }
    //     });
    // };

    const activateTheme = (record) => {
        const id = record.id || record._id;
        Modal.confirm({
            title: `Set ${record.name} as active theme?`,
            okText: 'Activate',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await CmasterService.activateTheme(id, { status: 'ACTIVE', is_active: true });

                    // Refresh from backend
                    const res = await CmasterService.getThemes();
                    const raw = Array.isArray(res.data?.result) ? res.data.result : (Array.isArray(res.data) ? res.data : []);
                    const list = raw.map((t) => ({
                        ...t,
                        status: typeof t.is_active === 'boolean' ? (t.is_active ? 'ACTIVE' : 'INACTIVE') : (t.status || 'INACTIVE'),
                    }));
                    setThemes(list);

                    // Apply the theme that backend marks ACTIVE
                    const active = list.find(t => t.status === 'ACTIVE');
                    if (active) {
                        applyPresetLocally(active);
                        // Sync the localStorage cache so all panels see the new theme on refresh
                        themeLoader.cacheTheme(active);
                    }

                    message.success('Theme activated and will persist on page refresh');
                } catch (e) {
                    message.error(e?.response?.data?.message || 'Failed to activate theme');
                }
            }
        });
    };


    const confirmApply = (newColor) => {
        if (confirmOpenRef.current) return;
        confirmOpenRef.current = true;
        Modal.confirm({
            title: `Apply ${parts.find(x => x.key === selectedVar)?.label} Color?`,
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>New color:</span>
                    <span style={{ width: 18, height: 18, borderRadius: 6, border: '1px solid #eee', background: newColor }} />
                </div>
            ),
            okText: 'Apply',
            cancelText: 'Cancel',
            onOk: () => { saveVar(selectedVar, newColor); setPendingColor(""); confirmOpenRef.current = false; },
            onCancel: () => { setPendingColor(""); confirmOpenRef.current = false; },
        });
    };

    return (
        <div key={refreshKey}>
            <div className="page-head-gradient" style={{ padding: '18px 24px' }}>
                <h2>Color Scheme</h2>
            </div>

            <div className="page-pad">
                <Row justify="start">
                    <Col xs={24} sm={22} md={20} lg={18} xl={16} xxl={14} style={{ maxWidth: 1000 }}>
                        <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(0,0,0,.05)' }}>
                        <div style={{ marginBottom: 24 }}>
                            <Title level={3} style={{ margin: 0 }}>Theme & Color Manager</Title>
                            <Text type="secondary">Create, manage, and activate custom color themes for your application.</Text>
                        </div>

                        {/* Step 1: Available Themes List */}
                        <Card
                            title={<Text strong style={{ fontSize: 16 }}>Step 1: Available Themes</Text>}
                            type="inner"
                            size="small"
                            bodyStyle={{ padding: 16 }}
                            style={{ borderRadius: 12, marginBottom: 16 }}
                            extra={
                                <Button
                                    onClick={() => {
                                        // Force complete component re-render
                                        setRefreshKey(prev => prev + 1);
                                        // Reload theme from backend
                                        themeLoader.loadActiveTheme();
                                    }}
                                    loading={loadingThemes}
                                    icon={<i className="fa fa-sync" />}
                                >
                                    Refresh
                                </Button>
                            }
                        >
                            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                                Select a theme from the list below and click "Activate" to apply it across the application.
                            </Text>
                            <Table
                                size="small"
                                rowKey={(r) => r.id || r._id || r.name}
                                dataSource={themes}
                                loading={loadingThemes}
                                pagination={false}
                                scroll={{ y: 300 }}
                                onRow={(record) => ({
                                    style: record.status === 'ACTIVE' ? { background: 'rgba(24,144,255,0.06)' } : undefined,
                                })}
                                columns={[
                                    {
                                        title: 'Theme Name',
                                        dataIndex: 'name',
                                        key: 'name',
                                        render: (name, record) => (
                                            <Space>
                                                <Text strong={record.status === 'ACTIVE'}>{name}</Text>
                                                {record.status === 'ACTIVE' && <Tag color="blue">Active</Tag>}
                                            </Space>
                                        )
                                    },
                                    {
                                        title: 'Color Preview',
                                        key: 'preview',
                                        render: (_, r) => (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span title="Header" style={{ width: 40, height: 20, borderRadius: 4, background: r.primary_color, border: '1px solid #e5e7eb' }} />
                                                <span title="Sidebar" style={{ width: 40, height: 20, borderRadius: 4, background: r.secondary_color, border: '1px solid #e5e7eb' }} />
                                                <span title="Accent" style={{ width: 20, height: 20, borderRadius: '50%', background: r.accent_color, border: '1px solid #e5e7eb' }} />
                                            </div>
                                        )
                                    },
                                    {
                                        title: 'Actions',
                                        key: 'action',
                                        align: 'right',
                                        render: (_, r) => (
                                            <Space>
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    disabled={r.status === 'ACTIVE'}
                                                    onClick={(e) => { e.stopPropagation(); activateTheme(r); }}
                                                >
                                                    {r.status === 'ACTIVE' ? 'Active' : 'Activate'}
                                                </Button>
                                                <Popconfirm
                                                    title="Delete theme?"
                                                    description={`Are you sure you want to delete "${r.name}"?`}
                                                    okText="Delete"
                                                    okButtonProps={{ danger: true }}
                                                    cancelText="Cancel"
                                                    onConfirm={() => handleDeleteTheme(r)}
                                                >
                                                    <Button
                                                        danger
                                                        size="small"
                                                        disabled={r.status === 'ACTIVE'}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Popconfirm>
                                            </Space>
                                        )
                                    }
                                ]}
                            />
                        </Card>

                        <Divider>OR</Divider>

                        {/* Step 2: Create New Theme */}
                        <Card
                            title={<Text strong style={{ fontSize: 16 }}>Step 2: Create New Theme</Text>}
                            type="inner"
                            size="small"
                            bodyStyle={{ padding: 16 }}
                            style={{ borderRadius: 12, marginBottom: 16 }}
                        >
                            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                Customize colors for different parts of the application, then save as a new theme.
                            </Text>

                            {/* Color Selection */}
                            <div style={{ marginBottom: 16 }}>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>Select Component to Customize:</Text>
                                <Row gutter={[12, 12]}>
                                    {parts.map((p) => (
                                        <Col xs={24} sm={12} md={8} key={p.key}>
                                            <Card
                                                hoverable
                                                onClick={() => setSelectedVar(p.key)}
                                                bodyStyle={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}
                                                style={{
                                                    borderRadius: 12,
                                                    borderColor: selectedVar === p.key ? '#1890ff' : undefined,
                                                    borderWidth: selectedVar === p.key ? 2 : 1,
                                                    boxShadow: selectedVar === p.key ? '0 0 0 2px rgba(24,144,255,.2)' : undefined,
                                                }}
                                            >
                                                <span style={{ width: 24, height: 24, borderRadius: 6, background: currentColor(p.key), border: '1px solid #e5e7eb' }} />
                                                <Text strong>{p.label}</Text>
                                                {selectedVar === p.key && <Tag color="blue" style={{ marginLeft: 'auto' }}>Selected</Tag>}
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>

                            {/* Color Picker */}
                            <Card type="inner" size="small" bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, marginBottom: 16, background: '#fafafa' }}>
                                <Text strong>{`Choose ${parts.find(x => x.key === selectedVar)?.label || 'Color'} Color:`}</Text>
                                <Row align="middle" gutter={16} style={{ marginTop: 12 }}>
                                    <Col>
                                        <input
                                            type="color"
                                            value={pendingColor || currentColor(selectedVar)}
                                            onChange={(e) => setPendingColor(e.target.value)}
                                            style={{ width: 60, height: 40, border: '1px solid #d9d9d9', borderRadius: 6, padding: 4, cursor: 'pointer' }}
                                        />
                                    </Col>
                                    <Col>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            border: '2px solid #d9d9d9',
                                            boxShadow: '0 2px 4px rgba(0,0,0,.1)',
                                            background: pendingColor || currentColor(selectedVar)
                                        }} />
                                    </Col>
                                    <Col flex="auto">
                                        <Text code style={{ fontSize: 14 }}>{pendingColor || currentColor(selectedVar)}</Text>
                                    </Col>
                                    {pendingColor && pendingColor !== currentColor(selectedVar) && (
                                        <>
                                            <Col>
                                                <Button type="primary" onClick={() => confirmApply(pendingColor)}>Apply Color</Button>
                                            </Col>
                                            <Col>
                                                <Button onClick={() => setPendingColor("")}>Cancel</Button>
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </Card>

                            {/* Live Preview */}
                            <Card type="inner" size="small" bodyStyle={{ padding: 16 }} style={{ borderRadius: 8, marginBottom: 16, background: '#fafafa' }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>Live Preview:</Text>
                                <div>
                                    <div style={{ width: '100%', height: 40, borderRadius: 8, background: getPreviewColor("--theme-green-dark"), marginBottom: 8, display: 'flex', alignItems: 'center', paddingLeft: 16 }}>
                                        <Text style={{ color: 'white', fontWeight: 500 }}>Header</Text>
                                    </div>
                                    <Row gutter={8}>
                                        <Col span={6}>
                                            <div style={{ width: '100%', height: 80, borderRadius: 8, background: getPreviewColor("--theme-green-light"), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: 'white', fontSize: 12 }}>Sidebar</Text>
                                            </div>
                                        </Col>
                                        <Col span={18}>
                                            <div style={{ position: 'relative', width: '100%', height: 80, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', padding: 12 }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>Content Area</Text>
                                                <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: getPreviewColor("--theme-orange") }} />
                                                    <Text type="secondary" style={{ fontSize: 11 }}>Accent</Text>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Card>

                            {/* Save Theme */}
                            <div style={{ background: '#f0f5ff', padding: 16, borderRadius: 8, border: '1px solid #adc6ff' }}>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>Save Your Custom Theme:</Text>
                                <Row gutter={12} align="middle">
                                    <Col flex="auto">
                                        <Input
                                            size="large"
                                            placeholder="Enter theme name (e.g., Dark Blue, Corporate Red)"
                                            value={newThemeName}
                                            onChange={(e) => setNewThemeName(e.target.value)}
                                            allowClear
                                        />
                                    </Col>
                                    <Col>
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={saveTheme}
                                            disabled={!newThemeName}
                                            loading={savingTheme}
                                            icon={<i className="fa fa-save" style={{ marginRight: 8 }} />}
                                        >
                                            Save Theme
                                        </Button>
                                    </Col>
                                </Row>
                                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                                    After saving, your theme will appear in the list above. Click "Activate" to apply it.
                                </Text>
                            </div>
                        </Card>

                        <Divider />

                        {/* Reset Option */}
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text type="secondary">Need to start over?</Text>
                            </Col>
                            <Col>
                                <Button onClick={confirmResetDefaults} danger>
                                    <i className="fa fa-undo" style={{ marginRight: 8 }} />
                                    Reset to Default Theme
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            </div>
        </div>
    );
}
