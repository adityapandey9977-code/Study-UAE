const moment = require("moment");
const md5 = require('md5');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');

exports.createJwtToken = (data, expiresIn = '24h') => {
    const secret = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
    return jwt.sign(data, secret, { expiresIn });
}

exports.decodeJwtToken = (token) => {
    const secret = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
    if (!token) {
        return false;
    }
    try {
        return jwt.verify(token, secret);
    } catch (e) {
        return false;
    }
}

exports.md5Encode = (str, salt = 'b85b647582c729ff3e6d2d23fa8dc95e') => {
    return md5(str + salt);
}

exports.encryptPassword = (str, salt = 'app[007]') => {
    const hmac = crypto.createHmac('sha256', salt);
    const hashedText = hmac.update(str).digest('hex');
    return hashedText;
}

exports.zeroPad = (num, places) => String(num).padStart(places, '0');
exports.copyObj = (obj) => JSON.parse(JSON.stringify(obj));

exports.trim = (obj) => {
    const nn = exports.md5Encode(999);
    if (typeof obj === "string") {
        return obj.trim();
    }

    if (typeof obj === "object") {
        const newObj = { ...obj };
        for (let i in newObj) {
            if (typeof newObj[i] === "string") {
                newObj[i] = newObj[i].trim();
            }
        }
        return newObj;
    }

    return obj;
}

exports.getExt = (filename) => {
    var ext = /[^.]+$/.exec(filename);
    if (!ext) {
        return '';
    }
    ext = ext.toString();
    ext = ext.toLowerCase();
    return ext;
}

exports.arrayChunks = (arr, chunkSize) => {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

exports.getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.generateOtp = () => {
    if (process.env.ENVIRONMENT === 'dev') {
        return 123456;
    }
    return exports.getRandomNumber(111111, 999999);
}

exports.getUniqueId = () => {
    return Date.now() + '' + Math.round(Math.random() * 1E9);
}

exports.currentDT = () => moment().format('YYYY-MM-DD HH:mm:ss');

exports.toUtcDT = (localDT, utcOffset) => {
    return moment(localDT).subtract(utcOffset, 'minutes').format("YYYY-MM-DD HH:mm:ss");
}
exports.toLocalDT = (utcDT, utcOffset) => {
    return moment(utcDT).add(utcOffset, 'minutes').format("YYYY-MM-DD HH:mm:ss");
}

exports.getYmd = () => {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;

    return { y, m, d };
}

exports.sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

exports.pickValues = (allData, keys) => {
    const data = {};
    Object.keys(allData).forEach((k) => {
        if (keys.includes(k)) {
            data[k] = allData[k];
        }
    });
    return data;
}

exports.extractNames = (fullName) => {
    const nameParts = fullName.split(' ');

    // Extract first, middle, and last names
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    // Check if there are more than two parts to determine if there is a middle name
    let middleName = '';
    if (nameParts.length > 2) {
        middleName = nameParts.slice(1, -1).join(' '); // Join middle names if present
    }

    return {
        firstName,
        middleName,
        lastName,
    };
}

exports.formatName = (fName, mName, lName) => {
    return `${fName}${mName ? mName + " " : " "}${lName ? lName : ""}`.trim();
}

exports.maskEmail = (email) => {
    const atIndex = email.indexOf('@');
    const dotIndex = email.lastIndexOf('.');

    if (atIndex !== -1 && dotIndex !== -1 && dotIndex > atIndex) {
        const domain = email.substring(atIndex + 1, dotIndex);
        const tld = email.substring(dotIndex + 1);

        let maskedUserName = '';
        const username = email.substring(0, atIndex);

        if (username.length > 5) {
            const lastChar = username.substring(username.length - 2);
            maskedUserName = `${username.charAt(0)}${"*".repeat(username.length - 3)}${lastChar}`;
        } else if (username.length >= 4) {
            const lastChar = username.substring(username.length - 2);
            maskedUserName = `${"*".repeat(username.length - 2)}${lastChar}`;
        } else {
            const lastChar = username.substring(username.length - 1);
            maskedUserName = `${"*".repeat(username.length - 1)}${lastChar}`;
        }

        return maskedUserName + "@" + "*".repeat(domain.length) + `.${tld}`;
    } else {
        return email;
    }
}

exports.maskPhoneNo = (contact) => {
    // Extract the last 4 digits of the contact number
    var lastFourDigits = contact.slice(-4);

    // Mask all digits except the last 4
    var maskedContact = '******' + lastFourDigits;

    return maskedContact;
}

exports.simpleEncrypt = (str) => {
    const key = 'hello@#12345';
    let encrypted = '';
    for (let i = 0; i < str.length; i++) {
        encrypted += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return encodeURIComponent(btoa(encrypted));
}

exports.simpleDecrypt = (encrypted) => {
    const key = 'hello@#12345';
    encrypted = atob(decodeURIComponent(encrypted));
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
}

exports.sendEmail = async (to, subject, body, sender_name = null, sender_email = null, reply_to = null) => {
    let fromName = sender_name || 'Study UAE Scholarship';
    let fromEmail = sender_email || 'studyindiascholarships@gmail.com';
    let replyTo = reply_to || 'studyindiascholarships@gmail.com';

    const originalTo = to;
    const redirectTo = process.env.EMAIL_REDIRECT_TO ? String(process.env.EMAIL_REDIRECT_TO).trim() : "";

    // For non-production environments, optionally redirect to a test inbox.
    // If EMAIL_REDIRECT_TO is not set, send to the original recipient.
    // if (process.env.ENVIRONMENT !== 'prod' && redirectTo) {
    //     to = redirectTo;
    //     console.log(`[DEV MODE] Email redirected from: ${originalTo} to: ${to} with sender: ${fromEmail}`);
    // }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.sendinblue.com',
            port: 587,
            auth: {
                user: 'studyindiascholarships@gmail.com',
                pass: 'ysQK7EdV91S4kZDP'
            }
        });

        let resp = await transporter.sendMail({
            from: `${fromName} <${fromEmail}>`,
            to,
            subject,
            html: body,
            replyTo
        });

        const accepted = Array.isArray(resp?.accepted) ? resp.accepted : [];
        const rejected = Array.isArray(resp?.rejected) ? resp.rejected : [];
        const success = accepted.length > 0 && rejected.length === 0;

        console.log(`Email send attempted to: ${to}, from: ${fromEmail}, messageId: ${resp.messageId}`);
        return { success, resp, accepted, rejected, original_to: originalTo, final_to: to };
    } catch (e) {
        console.error('Email sending failed:', e);
        return { success: false, resp: e, error: e.message };
    }
}

exports.sendSms = async (mob, sms) => {
    const apiKey = "";
    const senderID = "";
    const feedID = "300029";

    // if (process.env.ENVIRONMENT !== 'prod') {
    //     return { status: true, resp: true };
    // }
    mob = "9958808167";
    try {
        sms = encodeURIComponent(sms);
        const url = `http://api.enrcloud.com/singlesms?mobile=${mob}&msg=${sms}&api_key=${apiKey}&senderid=${senderID}&feedid=${feedID}&short=1`; //&templateid=1107170684902530001
        const { data } = await axios.get(url);
        //console.log(data);
        return data;
    } catch (e) {
        return { status: false, resp: e };
    }
}

/**
 * Convert file ID to file URL
 * @param {number} fileId - File ID from database
 * @param {Object} fileInfo - Optional file info object with file_name and created date
 * @returns {string|null} - Full file URL or null
 */
exports.buildFileUrl = (fileId, fileInfo = null) => {
    if (!fileId) return null;
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000/';
    
    // If we have file info with name and created date, build the full path
    if (fileInfo && fileInfo.file_name && fileInfo.created) {
        const created = moment(fileInfo.created);
        const year = created.format('YYYY');
        const month = created.format('YYYY-MM');
        const day = created.format('YYYY-MM-DD');
        
        return `${baseUrl}uploads/${year}/${month}/${day}/${fileInfo.file_name}`;
    }
    
    // Fallback: return a download endpoint URL
    return `${baseUrl}file/download/${fileId}`;
}

/**
 * Get file info by ID and build URL
 * @param {number} fileId - File ID from database
 * @returns {Promise<string|null>} - Full file URL or null
 */
exports.getFileUrlById = async (fileId) => {
    if (!fileId) return null;
    
    const db = require("../libraries/db");
    
    try {
        const file = await db.knex("files")
            .select(['id', 'file_name', 'file_ext', 'created'])
            .where("id", fileId)
            .first();
        
        if (!file) return null;
        
        return exports.buildFileUrl(fileId, file);
    } catch (e) {
        console.error('Error getting file URL:', e);
        return null;
    }
}
