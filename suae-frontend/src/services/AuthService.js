/* eslint-disable import/no-anonymous-default-export */
import axioslib from "axios";
import axios from "../utils/axios";

class AuthService {
    objectToFormData(data) {
        const formData = new FormData();
        for (const key in data) {
            if (data[key] !== null && data[key] !== undefined) {
                if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
                    for (const subKey in data[key]) {
                        formData.append(`${key}[${subKey}]`, data[key][subKey]);
                    }
                } else {
                    formData.append(key, data[key]);
                }
            }
        }
        return formData;
    }

    login(data) {
        return axios.post("login", this.objectToFormData(data));
    }

    studentLoginWithOtp(data) {
        return axios.post("studentLoginWithOtp", this.objectToFormData(data));
    }
    forgotPassword(data) {
        return axios.post("forgotpassword", this.objectToFormData(data));
    }
    resetPassword(data) {
        return axios.post("resetpssword", this.objectToFormData(data));
    }
    async getIPData() {
        const endpoint = "https://api.ipdata.co/?api-key=91e73b3180486f90e627d9a6e00dfe66dfae18004b57e59b38dc7d42";
        try {
            const { data } = await axioslib.get(endpoint);
            return (data && data?.ip) ? data : null;
        } catch (e) {
            return null;
        }
    }
}

export default new AuthService();