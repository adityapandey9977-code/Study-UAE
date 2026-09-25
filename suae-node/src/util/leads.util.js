const moment = require("moment");
const { simpleEncrypt } = require("../util/common.util");

exports.autoLoginUrl = (email) => {
    const baseUrl = String(process.env.STU_WEB_URL || process.env.APPLICANT_PANEL_URL || '').trim();
    const normalizedBaseUrl = baseUrl && !baseUrl.endsWith('/') ? `${baseUrl}/` : baseUrl;
    return `${normalizedBaseUrl}login?key=${simpleEncrypt(email)}`;
}