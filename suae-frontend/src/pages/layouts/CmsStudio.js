import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './tpl/Header';
import util from "../../utils/util";

export default function CmsStudio() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!util.isLogged()) {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <>
            <Header hideSidebarToggle={true} showCmsBackLink={true} />
            <div className="cms-studio-shell">
                <div className="cms-studio-canvas">
                    <Outlet />
                </div>
            </div>

            <iframe id="printiframe" name='printiframe' className="d-none" title="Print" />
        </>
    );
}
