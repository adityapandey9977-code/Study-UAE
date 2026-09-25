/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import {
    DownloadOutlined, PrinterOutlined
} from '@ant-design/icons';
const $ = window.$;

export function PrintPreviewFromUrl(props) {
    var { refOb, url } = props;
    const [reportUrl, setReportUrl] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const close = () => {
        setShowModal(false);
    }

    const print = () => {
        const iframe = document.getElementById('report_preview_iframe');
        iframe.contentWindow.postMessage('print', '*');
    }

    const download = () => {
        reportUrl.includes('?');
        window.location.href = reportUrl + (reportUrl.includes('?') ? '&' : '?') + 'type=PDF';
    }

    useEffect(() => {
        setReportUrl(url);
    }, [url]);

    refOb.current = {
        open: (contenturl) => {
            if (contenturl) {
                setReportUrl(contenturl);
            }
            setShowModal(true);
        },
        print,
        download
    }
    const wh = $(window).height();

    return (
        <Modal
            title={`Print Preview`}
            open={showModal}
            onCancel={close}
            destroyOnClose
            maskClosable={false}
            width="1000px"
            style={{ top: 20 }}
            bodyStyle={{ padding: 0 }}
            footer={(
                <div className="d-flex justify-content-between">
                    <div>
                        <Button onClick={close}>Close</Button>
                    </div>

                    <div>
                        <Button onClick={print} className="mr5"><PrinterOutlined /> Print</Button>
                        <Button type="primary" onClick={download}><DownloadOutlined /> Download</Button>
                    </div>
                </div>
            )}
        >
            <div>
                {reportUrl &&
                    <UrlIframe report_url={reportUrl} height={wh - 200} />
                }
            </div>
        </Modal>
    )
}

export function UrlIframe(props) {
    const { refOb, report_url, height } = props;
    const [render, reRender] = useState(false);

    const print = () => {
        const iframe = document.getElementById('report_preview_iframe');
        iframe.contentWindow.postMessage('print', '*');
    }

    const download = () => {
        window.location.href = report_url + (report_url.includes('?') ? '&' : '?') + 'type=PDF';
    }

    useEffect(() => {
        reRender(!render);
    }, [report_url, height]);

    if (refOb) {
        refOb.current = {
            print,
            download
        }
    }

    return (
        <iframe src={report_url} id="report_preview_iframe" name="report_preview_iframe" title="Print Preview" style={{
            height: height || '100%', border: 'none', width: '100%', overflow: 'auto', display: 'block', margin: 0, padding: 0, lineHeight: 0
        }} />
    );
}