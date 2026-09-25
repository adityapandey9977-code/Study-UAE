import axios from "axios";
import util from "./util";
import { sdx } from "../sdx";

const axiosInstance = axios.create({
    baseURL: util.apiUrl
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const url = config.url || '';
        const isAuthEndpoint = (
            url.indexOf('login') === 0 ||
            url.indexOf('studentLoginWithOtp') === 0 ||
            url.indexOf('forgotpassword') === 0 ||
            url.indexOf('resetpssword') === 0
        );

        if (!isAuthEndpoint) {
            config.headers.Authorization = util.getToken();
            config.headers.authorization = util.getToken();
            config.headers.timezoneoffset = util.getTimezoneOffset();
            // Do not await any network calls here to avoid circular dependencies/hangs
            config.headers.institute_id = sdx.institute_id;
            config.headers.Sessionid = util.getSessionId();
            // config.headers.isAutoLoggedIn = util.isAutoLoggedIn();
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (typeof error.response === "undefined") {
            error.response = {};
        } else {
            if (typeof error.response.data === "object") {
                if (typeof error.response.data?.message !== "undefined") {
                    error.message = error.response.data?.message;
                }
                if (error.response.data.loggedOut === 1) {
                    util.logout();
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;