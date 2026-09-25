/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-useless-escape */
import moment from 'moment';
import {
    Modal,
    message
} from 'antd';
let $ = window.$;

class util {
    constructor() {
        this.sessionKey = 'sis_sessionid';
        this.apiUrl = '/';
        this.apiUrlNode = '/';

        const envApiUrl = process.env.REACT_APP_API_URL;
        const envApiUrlNode = process.env.REACT_APP_API_URL_NODE;
        const envUploadsUrl = process.env.REACT_APP_UPLOADS_URL;
        console.log("Environment variables:", envApiUrl, envApiUrlNode, envUploadsUrl);
        const isLocalRuntime = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLocalHostUrl = (url) => {
            if (!url || typeof url !== 'string') return false;
            const u = url.trim();
            if (!u) return false;
            return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(u);
        }

        const normalizeLocalDevUrl = (url) => {
            if (!isLocalHostUrl(url)) return url;

            try {
                const parsedUrl = new URL(url);
                return parsedUrl.toString();
            } catch (error) {
                return url;
            }
        };

        const hasValidApiUrl = !!(envApiUrl && (isLocalRuntime || !isLocalHostUrl(envApiUrl)));
        const hasValidApiUrlNode = !!(envApiUrlNode && (isLocalRuntime || !isLocalHostUrl(envApiUrlNode)));
        const hasValidUploadsUrl = !!(envUploadsUrl && (isLocalRuntime || !isLocalHostUrl(envUploadsUrl)));

        if (hasValidApiUrlNode) {
            this.apiUrlNode = normalizeLocalDevUrl(envApiUrlNode);
        } else {
            this.apiUrlNode = "http://localhost:5000/";
        }

        // Consolidated architecture: If PHP API is not specified, route all calls to Node
        this.apiUrl = envApiUrl ? normalizeLocalDevUrl(envApiUrl) : this.apiUrlNode;

        this.uploadsUrl = hasValidUploadsUrl
            ? envUploadsUrl
            : (this.apiUrlNode || this.apiUrl);
    }

    getOrigin = (baseUrl) => {
        try {
            return new URL(baseUrl).origin;
        } catch (e) {
            return "";
        }
    }

    normalizeUploadsUrl = (rawUrl, preferOrigin = "node") => {
        if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
        rawUrl = rawUrl.trim();
        if (rawUrl.startsWith("blob:")) return rawUrl;

        const nodeOrigin = this.getOrigin(this.apiUrlNode);
        const phpOrigin = this.getOrigin(this.apiUrl);
        const preferred = preferOrigin === "php" ? phpOrigin : nodeOrigin;
        const uploadsOrigin = this.getOrigin(this.uploadsUrl) || preferred;
        if (!uploadsOrigin) return rawUrl;

        try {
            const u = new URL(rawUrl);
            if (u.pathname && u.pathname.startsWith("/uploads/")) {
                return `${uploadsOrigin}${u.pathname}${u.search || ""}${u.hash || ""}`;
            }
            // If the URL contains /uploads/ in the path (even with another domain), rewrite to uploadsOrigin
            if (u.pathname && u.pathname.includes("/uploads/")) {
                const uploadsPath = u.pathname.substring(u.pathname.indexOf("/uploads/"));
                return `${uploadsOrigin}${uploadsPath}${u.search || ""}${u.hash || ""}`;
            }
            return rawUrl;
        } catch (e) {
        }

        if (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/")) {
            const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
            return `${uploadsOrigin}${path}`;
        }

        return rawUrl;
    }


    arr = (arg) => {
        return Array.isArray(arg) ? arg : [];
    }
    obj = (arg) => {
        return (typeof arg != "object" || arg === null) ? {} : arg;
    }

    getTimezoneOffset = () => {
        var d = new Date();
        return d.getTimezoneOffset();
    }

    getTimeZone = () => {
        var n = this.getTimezoneOffset();
        var sign = n >= 0 ? '-' : '+';
        n = Math.abs(n);

        var h = parseInt(n / 60);
        var m = n % 60;

        return sign + h + ':' + m;
    }

    convertToCSVBlob = (objArray, header) => {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '', line = '', index;
        for (index in header) {
            if (line !== '') line += ',';
            line += header[index];
        }
        str += line + '\r\n';

        for (var i = 0; i < array.length; i++) {
            line = '';
            for (index in header) {
                if (line !== '') line += ',';
                line += (!array[i][index] ? ' ' : ('\"' + array[i][index] + '\"'));
            }
            str += line + '\r\n';
        }

        return new Blob([str], { type: "text/csv;charset=utf-8" });
    }

    copyObj = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    }

    getExt = (filename) => {
        var ext = /[^.]+$/.exec(filename);
        if (!ext) {
            return '';
        }
        ext = ext.toString();
        ext = ext.toLowerCase();
        return ext;
    }

    checkImageExt = (filename) => {
        if (!filename) {
            return false;
        }
        var ext = /[^.]+$/.exec(filename);
        if (!ext) {
            return false;
        }
        ext = ext.toString();
        ext = ext.toLowerCase();
        var exts = ['jpg', 'jpeg', 'png'];
        if (exts.indexOf(ext) !== -1)
            return true;

        return false;
    }

    checkPdfExt = (filename) => {
        if (!filename) {
            return false;
        }
        var ext = /[^.]+$/.exec(filename);
        if (!ext) {
            return false;
        }
        ext = ext.toString();
        ext = ext.toLowerCase();
        var exts = ['pdf'];
        if (exts.indexOf(ext) !== -1)
            return true;

        return false;
    }

    checkVideoExt = (filename) => {
        if (!filename) {
            return false;
        }
        var ext = /[^.]+$/.exec(filename);
        if (!ext) {
            return false;
        }
        ext = ext.toString();
        ext = ext.toLowerCase();
        var exts = ['mp4', 'webp', 'mkv', 'mov'];
        if (exts.indexOf(ext) !== -1)
            return true;

        return false;
    }

    checkImage = (ob, size_mb) => {
        var obj = $(ob);
        var err = false;
        if (!this.checkImageExt(obj.val())) {
            err = true;
            Modal.error({
                title: 'Image Error!',
                content: 'Invalid image! Only .jpg and .png images are allowed.',
            });
        }

        if (!err) {
            var file = obj[0];
            var size = file.files[0].size / 1024;
            if (!size_mb) {
                size_mb = 2;
            }
            var maxs = size_mb * 1024;
            if (size > maxs) {
                err = true;
                Modal.error({
                    title: "Image Size Error!",
                    content: "Can't upload! This image is larger than " + size_mb + " MB.",
                });
            }
        }

        if (err) {
            obj.val('');
        }
        return !err;
    }

    checkPdf = (ob, size_mb) => {
        var obj = $(ob);
        var err = false;
        if (!this.checkPdfExt(obj.val())) {
            err = true;
            Modal.error({
                title: 'Pdf File Error!',
                content: 'Invalid pdf file!',
            });
        }

        if (!err) {
            var file = obj[0];
            var size = file.files[0].size / 1024;
            if (!size_mb) {
                size_mb = 2;
            }
            var maxs = size_mb * 1024;
            if (size > maxs) {
                err = true;
                Modal.error({
                    title: 'Pdf File Size Error!',
                    content: "Can't upload! This file is larger than " + size_mb + " MB.",
                });
            }
        }

        if (err) {
            obj.val('');
        }
        return !err;
    }

    checkImagePdf = (ob, size_mb) => {
        var obj = $(ob);
        var err = false;
        if (!this.checkImageExt(obj.val()) && !this.checkPdfExt(obj.val())) {
            err = true;
            Modal.error({
                title: 'File Error!',
                content: 'Invalid file! Only .jpg, .png and .pdf are allowed.',
            });
        }
        if (!err) {
            var file = obj[0];
            var size = file.files[0].size / 1024;
            if (!size_mb) {
                size_mb = 2;
            }
            var maxs = size_mb * 1024;
            if (size > maxs) {
                err = true;
                Modal.error({
                    title: 'File Size Error!',
                    content: "Can't upload! This file is larger than " + size_mb + " MB.",
                });
            }
        }

        if (err) {
            obj.val('');
        }
        return !err;
    }

    checkVideo = (ob, size_mb) => {
        var obj = $(ob);
        var err = false;
        if (!this.checkVideoExt(obj.val())) {
            err = true;
            Modal.error({
                title: 'Video File Error!',
                content: 'Invalid video! Only .mp4, .webp, .mkv and .mov are allowed.',
            });
        }

        if (!err) {
            var file = obj[0];
            var size = file.files[0].size / 1024;
            if (!size_mb) {
                size_mb = 100;
            }
            var maxs = size_mb * 1024;
            if (size > maxs) {
                err = true;
                Modal.error({
                    title: 'Video File Size Error!',
                    content: "Can't upload! This image is larger than " + size_mb + " MB.",
                });
            }
        }

        if (err) {
            obj.val('');
        }
        return !err;
    }

    copyToClipboard = (str, showSuccess = false) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(str).then(() => {
                if (showSuccess) {
                    message.success("Copied");
                }
            })
        } else {
            message.error("Browser Not compatible");
        }
    }

    showLoader = () => {
        var el = '<div class="bodycover"></div><div class="loader"><i class="fa fa-spin fa-circle-notch"></i></div>';
        $(".bodycover,.loader").remove();
        $("body").prepend(el);
    }

    hideLoader = () => {
        $(".bodycover,.loader").remove();
    }

    showAlertMsg = (msg, type, t) => {
        t = t ? t : 4000;
        type = type ? type : 'S';
        var el;

        if (type === 'S') {
            el = `<div class="alertmsg">
                        <div class="alert alert-success shadow" role="alert">
                            <i class="fa fa-check-circle"></i> ${msg}
                        </div>
                    </div>`;
        } else {
            el = `<div class="alertmsg">
                        <div class="alert alert-danger shadow" role="alert">
                            <i class="fa fa-times-circle"></i> ${msg}
                        </div>
                    </div>`;
        }

        $(".alertmsg").remove();
        $("body").prepend(el);
        $(".alertmsg").delay(t).fadeOut('slow');
    }

    hideAlertMsg = () => {
        $(".alertmsg").remove();
    }

    showModal = (obj, fullHeight, fixFullHeight, decreaseHeight) => {
        let n = 150;
        if (obj.find(".modal-dialog").hasClass("modal-fullx")) {
            n = 116;
        }
        if (obj.find(".modal-dialog").hasClass("modal-full")) {
            n = 130;
        }
        if (decreaseHeight) {
            n = decreaseHeight * 1;
        }
        if (obj.find(".modal-footer").length === 0) {
            n = n - 63;
        }
        if (fullHeight) {
            var h = $(window).outerHeight() - n;
            if (fixFullHeight) {
                obj.find(".modal-body").css({ 'overflow': 'Auto', 'height': h + 'px' });
            } else {
                obj.find(".modal-body").css({ 'overflow': 'Auto', 'max-height': h + 'px' });
            }
        }

        obj.modal();
        obj.find(".modal-body").scrollTop(0);

        if (obj.hasClass('no-backdrop')) {
            $('.modal-backdrop').remove();
        }
    }

    hideModal = (obj) => {
        obj.modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }

    redirect = (url) => {
        window.location.href = url;
    }

    nv = (v) => {
        v = $.trim(v);
        if (isNaN(v))
            v = 0;
        return v * 1;
    }

    getDistance = (lat1, lon1, lat2, lon2) => {
        var R = 6371; // km
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var lt1 = lat1 * Math.PI / 180;
        var lt2 = lat2 * Math.PI / 180;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lt1) * Math.cos(lt2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    inWords = (num) => {
        if (!this.nv(num)) {
            return '';
        }
        var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        if ((num = num.toString()).length > 9) return 'overflow';
        var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; var str = '';
        str += (n[1] !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
        str += (n[2] !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
        str += (n[3] !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
        str += (n[4] !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
        str += (n[5] !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + '' : '';
        return str.trim();
    }

    getDate = (d, df) => {
        if (!d) {
            d = new Date();
        }

        // Check if the date is valid using moment
        const momentDate = moment(d);
        if (!momentDate.isValid()) {
            return "-"; // Return dash for invalid dates
        }

        if (df) {
            d = momentDate.format(df);
        } else {
            d = momentDate.format("DD MMM YYYY - hh:mm A")
        }
        return d;
    }

    toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })

    resizeImage = (imgOb, w) => {
        var sw = imgOb.naturalWidth || imgOb.width;
        var sh = imgOb.naturalHeight || imgOb.height;

        var h = 0;
        if (sw <= w) {
            w = sw;
            h = sh;
        } else {
            h = Math.round((w / sw) * sh);
        }

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');

        ctx.drawImage(imgOb, 0, 0, w, h);
        //$(this.srcImgOb).attr('src', canvas.toDataURL("image/jpeg"));
        return canvas;
    }

    imageDataToFile = (imageData) => {
        const byteCharacters = atob(imageData.split(';base64,')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        let blob = new Blob([byteArray], { type: "image/jpeg" });
        let filename = (new Date().getTime()) + "" + Math.floor(Math.random() * 100) + ".jpg";

        return new File([blob], filename, { type: "image/jpeg" });
    }

    printUrl = (url) => {
        $("#iframe_print").attr('src', url + '?print=1');
    }

    roundTo = (num, places) => {
        return +(Math.round(num + "e+" + places) + "e-" + places);
    }

    simpleEncrypt = (str) => {
        const key = 'hello@#12345';
        let encrypted = '';
        for (let i = 0; i < str.length; i++) {
            encrypted += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return encodeURIComponent(window.btoa(encrypted));
    }

    simpleDecrypt = (encrypted) => {
        const key = 'hello@#12345';
        encrypted = window.atob(decodeURIComponent(encrypted));
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decrypted;
    };

    queryStringToJSON = (qs) => {
        qs = qs || window.location.search.slice(1);
        if (qs.charAt(0) === '?') {
            qs = qs.slice(1);
        }

        const pairs = qs.split('&');
        const result = {};
        pairs.forEach(function (p) {
            const pair = p.split('=');
            const key = pair[0];
            const value = decodeURIComponent(pair[1] || '');
            if (result[key]) {
                if (Object.prototype.toString.call(result[key]) === '[object Array]') {
                    result[key].push(value);
                } else {
                    result[key] = [result[key], value];
                }
            } else {
                result[key] = value;
            }
        });
        return JSON.parse(JSON.stringify(result));
    }

    /** */
    setLoginInfoLocalStorage = (data) => {
        let { token, nodetoken, name, modules, type, is_client_admin, is_admin, is_student, gender, regno, is_institute, is_agent, isAutoLoggedIn, user_filters } = data;
        const user_id = data?.user_id || data?.id || data?.uid || data?.userId || data?.userid || '';
        const agent_user_id = data?.agent_user_id || data?.agent_userid || data?.agentUserId || data?.agent_id || (is_agent ? user_id : '');
        const email = data?.email || data?.user_email || data?.userEmail || '';
        const mobile = data?.mobile || data?.user_mobile || data?.userMobile || '';
        window.localStorage['token'] = token;
        window.localStorage['nodetoken'] = nodetoken;
        window.localStorage['name'] = name;
        window.localStorage['modules'] = JSON.stringify(modules);
        window.localStorage['user_type'] = type;
        window.localStorage['is_client_admin'] = is_client_admin;
        window.localStorage['is_admin'] = is_admin;
        window.localStorage['is_student'] = is_student;
        window.localStorage['gender'] = gender;
        window.localStorage['regno'] = regno;
        window.localStorage['is_institute'] = is_institute;
        window.localStorage['is_agent'] = is_agent;
        window.localStorage['isAutoLoggedIn'] = isAutoLoggedIn || 0;
        window.localStorage['user_id'] = user_id;
        window.localStorage['agent_user_id'] = agent_user_id;
        if (email) window.localStorage['email'] = email;
        if (mobile) window.localStorage['mobile'] = mobile;

        // Store user_filters for lead filtering (strategy-based filtering)
        if (user_filters && typeof user_filters === 'object') {
            window.localStorage['user_filters'] = JSON.stringify(user_filters);
        } else {
            window.localStorage.removeItem('user_filters');
        }
    }

    setSessionId = () => {
        window.localStorage[this.sessionKey] = Date.now() + '' + Math.round(Math.random() * 1E9);;
    }

    getSessionId = () => {
        let sessionid = window.localStorage[this.sessionKey] || '';
        if (!sessionid) {
            this.setSessionId();
            return window.localStorage[this.sessionKey] || '';
        } else {
            return sessionid;
        }
    }
    getToken = () => {
        return window.localStorage['token'] || window.localStorage['nodetoken'] || '';
    }
    getNodeToken = () => {
        return window.localStorage['nodetoken'] || window.localStorage['token'] || '';
    }

    isAutoLoggedIn = () => {
        return ((window.localStorage['isAutoLoggedIn'] || 0) * 1) === 1;
    }

    getLoggedName = () => {
        return window.localStorage['name'];
    }

    getLoggedEmail = () => {
        return window.localStorage['email'] || '';
    }

    getLoggedMobile = () => {
        return window.localStorage['mobile'] || '';
    }
    getModules = () => {
        try {
            const m = window.localStorage.getItem("modules");
            if (!m || m === "undefined" || m === "null") {
                return {};
            }
            const parsed = JSON.parse(m);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (e) {
            console.error("Error parsing modules:", e);
            window.localStorage.removeItem("modules");
            return {};
        }
    }

    getUserType = () => {
        return window.localStorage['user_type'];
    }
    isClientAdmin = () => {
        return window.localStorage['is_client_admin'] * 1;
    }
    isAdmin = () => {
        return window.localStorage['is_admin'] * 1;
    }
    isStudent = () => {
        return window.localStorage['is_student'] * 1;
    }
    getGender = () => {
        return window.localStorage['gender'];
    }
    getRegno = () => {
        return window.localStorage['regno'] || '';
    }
    getUserId = () => {
        return window.localStorage['user_id'] || '';
    }
    getAgentUserId = () => {
        return window.localStorage['agent_user_id'] || '';
    }
    isInstitute = () => {
        return window.localStorage['is_institute'] * 1;
    }
    isAgent = () => {
        const v = window.localStorage['is_agent'];
        if (v === true || v === 'true') return 1;
        if (v === 1 || v === '1') return 1;
        return (v * 1) || 0;
    }
    isLogged = () => {
        if (typeof window.localStorage['token'] !== "undefined" && window.localStorage['token'] !== '') {
            return true;
        }
        return false;
    }
    noOfDecimal = () => {
        return 3;
    }
    logout = (e, navigate) => {
        if (e) e.preventDefault();
        window.localStorage.clear();
        window.sessionStorage.clear();

        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        // Redirect to the dashboard login page
        window.location.href = "/";
    }

    mergeTemplateTags = (text, values = {}) => {
        if (text === null || typeof text === 'undefined') return text;
        let out = String(text);
        if (!values || typeof values !== 'object') return out;

        Object.keys(values).forEach((k) => {
            const v = values[k];
            if (v === null || typeof v === 'undefined') return;
            const token1 = `%${k}%`;
            const token2 = `{%${k}%}`;
            out = out.split(token2).join(String(v));
            out = out.split(token1).join(String(v));
        });

        return out;
    }

    getStudentAutoLoginUrl = (email = '') => {
        const key = this.simpleEncrypt(email);
        return window.origin + "/login?key=" + key;
    }

    getInstituteAutoLoginUrl = (email = '') => {
        const key = this.simpleEncrypt(email);
        return window.origin + "/login?key=" + key;
    }

    getAgentAutoLoginUrl = (email = '') => {
        const key = this.simpleEncrypt(email);
        return window.origin + "/login?key=" + key;
    }
}

export default new util();