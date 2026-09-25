/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { Menu } from 'antd';
import SessionManagement from './SessionManagement';
import ColorThemeManager from './ColorThemeManager';
import RecommendationBadgeSettings from './RecommendationBadgeSettings';
import LogoChange from './LogoChange';
import LoginBackgroundChange from './LoginBackgroundChange';
// Future settings components can be imported here

export default function SettingsIndex() {
    const [activeKey, setActiveKey] = useState('session-management');

    const tabs = [
        { k: 'session-management', lbl: 'Session Management' },
        { k: 'color-scheme', lbl: 'Color Scheme' },
        { k: 'recommendation-badge', lbl: 'Recommendation Badge' },
        { k: 'logo-change', lbl: 'Change Logo' },
        { k: 'student-bg-change', lbl: 'Change Background Image' },
    ];

    const goto = (e) => {
        setActiveKey(e.key);
    };

    return (
        <div className="page-content">
            <div className="d-flex">
                {/* Left menu */}
                <div className="w220" style={{ overflow: 'auto', height: 'calc(100% - 50px)' }}>
                    <Menu
                        mode="vertical"
                        selectedKeys={[activeKey]}
                        onClick={goto}
                        className="fixed-master-left-nav"
                    >
                        {tabs.map((v) => (
                            <Menu.Item key={v.k}>{v.lbl}</Menu.Item>
                        ))}
                    </Menu>
                </div>

                {/* Right content */}
                <div className="flex-grow-1 page-pad">
                    {activeKey === 'session-management' && <SessionManagement />}
                    {activeKey === 'color-scheme' && <ColorThemeManager />}
                    {activeKey === 'recommendation-badge' && <RecommendationBadgeSettings />}
                    {activeKey === 'logo-change' && <LogoChange />}
                     {activeKey === 'student-bg-change' && <LoginBackgroundChange />}
                </div>
            </div>
        </div>
    );
}
