/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-useless-escape */
import moment from 'moment';
import {
    Modal,
    message
} from 'antd';
let $ = window.$;

class utilnew {
    constructor() {
        this.hideLoaderFn = () => { };
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
                line += ((!array[i][index] && array[i][index] !== 0 && array[i][index] !== '0') ? ' ' : ('\"' + array[i][index] + '\"'));
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

    getDate = (d, df, utcToClient, clientToUtc) => {
        if (utcToClient === true && d) {
            const tzoffset = this.getTimezoneOffset() * -1;
            d = moment(d).add(tzoffset, 'minutes');
        }

        if (clientToUtc === true && d) {
            const tzoffset1 = this.getTimezoneOffset();
            d = moment(d).add(tzoffset1, 'minutes');
        }

        if (!d) {
            d = new Date();
        }
        if (df) {
            d = moment(d).format(df);
        } else {
            d = moment(d).format('DD MMM YYYY');
        }
        return d;
    }

    quickDateRanges = () => {
        let obj = {
            Today: { from: moment().format('DD MMM YYYY'), to: moment().format('DD MMM YYYY') },
            Yesterday: { from: moment().subtract(1, 'days').format('DD MMM YYYY'), to: moment().subtract(1, 'days').format('DD MMM YYYY') },
            Week: { from: moment().startOf('week').format('DD MMM YYYY'), to: moment().endOf('week').format('DD MMM YYYY') },
            Month: { from: moment().startOf('month').format('DD MMM YYYY'), to: moment().endOf('month').format('DD MMM YYYY') },
            Year: { from: moment().startOf('year').format('DD MMM YYYY'), to: moment().endOf('year').format('DD MMM YYYY') },
        }
        return obj;
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

    roundTo = (num, places) => {
        return +(Math.round(num + "e+" + places) + "e-" + places);
    }

    showLoader = (msg) => {
        this.hideLoaderFn = message.loading(msg || "Loading...", 0);
    }
    hideLoader = () => {
        this.hideLoaderFn();
    }

    zeroPad = (num, places) => String(num).padStart(places, '0');

    removeTags = (str) => {
        if ((str === null) || (str === ''))
            return false;
        else
            str = str.toString();

        return str.replace(/(<([^>]+)>)/ig, '');
    }

    copyToClipboard = (str, showSuccess = false) => {
        /* const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el); */

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
    }

    stripTags = (html) => {
        return (('' + html || '')).replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/gi, " ");
    }

    printHtmlFromIframe = (html) => {
        const cssUrl = "theme/css/iframe-print-css.css?1.00";
        $("#printiframe").contents().find("head").html(`<link rel="stylesheet" href="${cssUrl}" />`);
        $("#printiframe").contents().find("body").html(`${html}`);
        setTimeout(() => {
            document.getElementById('printiframe').contentWindow.print();
        }, 500);

        /* $("#printiframe").attr('srcdoc', `<link rel="stylesheet" href="${cssUrl}" />${html}`);
        setTimeout(()=>{
            document.getElementById('printiframe').contentWindow.print();
        }, 200); */
    }
}

export default new utilnew();