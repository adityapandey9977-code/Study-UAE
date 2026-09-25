// import axios from "axios";
// import util from "./util";
// import { sdx } from "../sdx";

// const axiosInstance = axios.create({
//     baseURL: util.apiUrlNode
// });

// // Create a public axios instance without auth headers
// const axiosPublicInstance = axios.create({
//     baseURL: util.apiUrlNode
// });

// axiosInstance.interceptors.request.use(
//     (config) => {
//         config.headers = config.headers || {};
//         const url = typeof config.url === "string" ? config.url : "";
//         const isPublicEndpoint = url.startsWith("public/") || url.startsWith("/public/");

//         // Use ONLY Node token for Node API requests
//         const nodeToken = util.getNodeToken();
//         if (!isPublicEndpoint && nodeToken) {
//             config.headers.Authorization = nodeToken;
//             config.headers.authorization = nodeToken;
//         }
//         const isFileUpload = url.includes("/file/upload");
//         if (!isFileUpload && !isPublicEndpoint) {
//             config.headers.Sessionid = util.getSessionId();
//             config.headers["Cache-Control"] = "no-cache";
//             config.headers.Pragma = "no-cache";
//             config.headers.institute_id = sdx.institute_id;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// axiosInstance.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         if (typeof error.response === "undefined") {
//             error.response = {};
//         } else {
//             if (typeof error.response.data === "object") {
//                 if (typeof error.response.data?.message !== "undefined") {
//                     error.message = error.response.data?.message;
//                 }
//                 if (error.response.data.loggedOut === 1) {
//                     util.logout();
//                 }
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// export default axiosInstance;
// export { axiosPublicInstance };





import axios from "axios";
import util from "./util";
import { sdx } from "../sdx";

const axiosInstance = axios.create({
    baseURL: util.apiUrlNode,
});

const axiosPublicInstance = axios.create({
    baseURL: util.apiUrlNode,
});

axiosInstance.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};

        const url = typeof config.url === "string" ? config.url : "";
        const isPublicEndpoint =
            url.startsWith("public/") || url.startsWith("/public/");

        const nodeToken = util.getNodeToken();

        if (!isPublicEndpoint && nodeToken) {
            config.headers.Authorization = nodeToken;
            config.headers.authorization = nodeToken;
        }

        const isFileUpload = url.includes("/file/upload");

        if (!isFileUpload && !isPublicEndpoint) {
            const sessionId = util.getSessionId();

            if (sessionId) {
                config.headers.Sessionid = sessionId;
            }

            config.headers["Cache-Control"] = "no-cache";
            config.headers.Pragma = "no-cache";

            if (sdx.institute_id) {
                config.headers.institute_id = sdx.institute_id;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof error.response === "undefined") {
            error.response = {};
        } else if (typeof error.response.data === "object") {
            if (typeof error.response.data?.message !== "undefined") {
                error.message = error.response.data?.message;
            }

            if (error.response.data.loggedOut === 1) {
                util.logout();
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
export { axiosPublicInstance };