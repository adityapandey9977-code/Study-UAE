import React, { useEffect } from 'react';
//import {useStateIfMounted} from "use-state-if-mounted";
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './tpl/Header';
import Leftnavs from './tpl/Leftnavs';
import util from "../../utils/util";
//let $=window.$;

export default function Default() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!util.isLogged()) {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <>
            <Header />
            <div className="page-container">
                <div className="page-content-wrapper">
                    <Leftnavs />

                    <Outlet />
                </div>
            </div>

            <iframe id="printiframe" name='printiframe' className="d-none" title="Print" />
        </>
    )
}