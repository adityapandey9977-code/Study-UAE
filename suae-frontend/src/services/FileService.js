/* eslint-disable import/no-anonymous-default-export */
import axios from "../utils/axios";
import axiosnode from "../utils/axiosnode";
import util from "../utils/util";
import {
    message
} from 'antd';

class FileService {
    upload = (file, client_id) => new Promise((resolve, reject) => {
        let fd = new FormData();
        fd.append("client_id", client_id || '');
        fd.append('file', file);
        // Use PHP backend for file upload
        axios.post("file/upload", fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            const payload = res?.data?.result || res?.data || {};
            if (res.data && typeof res.data === 'object') {
                const fileUrl = payload.file_url ?? payload.url ?? res.data.file_url;
                res.data = {
                    ...res.data,
                    ...payload,
                    file_id: payload.file_id ?? res.data.file_id,
                    file_url: util.normalizeUploadsUrl(fileUrl, 'php'),
                };
            }
            resolve(res);
        }).catch(e => {
            message.error(e.message);
            reject(false);
        }).finally(() => {
        })
    })

    uploadPhp = (file, client_id) => new Promise((resolve, reject) => {
        let fd = new FormData();
        fd.append("client_id", client_id || '');
        fd.append('file', file);
        axios.post("file/upload", fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            const payload = res?.data?.result || res?.data || {};
            if (res.data && typeof res.data === 'object') {
                const fileUrl = payload.file_url ?? payload.url ?? res.data.file_url;
                res.data = {
                    ...res.data,
                    ...payload,
                    file_id: payload.file_id ?? res.data.file_id,
                    file_url: util.normalizeUploadsUrl(fileUrl, 'php'),
                };
            }
            resolve(res);
        }).catch(e => {
            message.error(e.message);
            reject(false);
        }).finally(() => {
        })
    })

    uploadNode = (file) => new Promise((resolve, reject) => {
        let fd = new FormData();
        fd.append('file', file);
        axiosnode.post("/file/upload", fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            const payload = res?.data?.result || res?.data || {};
            if (payload && res.data && typeof res.data === 'object') {
                const fileUrl = payload.url ?? payload.file_url ?? res.data.file_url;
                res.data = {
                    ...res.data,
                    ...payload,
                    file_id: payload.file_id ?? res.data.file_id,
                    path: payload.path ?? res.data.path,
                    file_url: util.normalizeUploadsUrl(fileUrl, 'node'),
                };
            }
            resolve(res);
        }).catch(e => {
            const errMsg = e?.response?.data?.message || e.message;
            message.error(errMsg);
            reject(e);
        }).finally(() => {
        })
    })
}

export default new FileService();
