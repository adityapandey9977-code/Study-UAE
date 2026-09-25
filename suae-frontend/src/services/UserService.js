/* eslint-disable no-unused-vars */
/* eslint-disable import/no-anonymous-default-export */
import axios from "../utils/axios";
import axiosnode from "../utils/axiosnode";

class UserService {
    modules(params) {
        return axios.get("modules", { params });
    }

    roles(params) {
        return axios.get("roles" + (params.all ? '/ALL' : ''), { params });
    }
    saveRole(data) {
        return axios.post("saveRole", data);
    }
    deleteRole(id) {
        return axios.post("deleteRole", { id });
    }

    users(params) {
        return axios.get("users?k&p=1&ps=25&type=ALL", { params });
    }
    allUsers(params) {
        return axiosnode.get("user/ALL", { params });
    }
    saveUser(data) {
        return axios.post("saveUser", data);
    }
    deleteUser(id, extra = {}) {
        // Use Node endpoint for safe deletion (handles foreign keys)
        return axiosnode.post("user/deleteUser", { id, user_id: id, uid: id, ...extra });
    }

    profileDetail() {
        return axios.get("profileDetail");
    }
    
    // Get user filters for lead allocation
    getUserFilters(user_id) {
        return axios.get(`user/filters/${user_id || ''}`);
    }
    updateProfile(data) {
        return axios.post("updateProfile", data);
    }
    changePassword(data) {
        return axios.post("changePassword", data);
    }
    saveLogoBanner(data) {
        return axiosnode.post("institute/saveLogoBanner", data);
    }
    logoAndBanner() {
        return axiosnode.get("institute/logoAndBanner");
    }

    async saveAgentUrlLink(payload) {
        try {
            const { data } = await axiosnode.post("user/saveAgentUrlLink", payload);
            return { ...data, success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async deleteAgentUrlLink(uid) {
        try {
            const { data } = await axiosnode.post("user/deleteAgentUrlLink", { uid });
            return { ...data, success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async getAgentUrlLinks(params) {
        try {
            const { data } = await axiosnode.get("user/getAgentUrlLinks", { params });
            return data?.result || [];
        } catch (e) {
            return [];
        }
    }

    approveAgent(id) {
        return axios.post(`/admin/approve-agent/${id}`);
    }

    blockAgent(id) {
        return axios.post(`admin/block/${id}`)
    }

}

export default new UserService();