
const axios = require("axios");
const crypto = require("crypto");
const db = require("../libraries/db");
const { currentDT } = require("../util/common.util");

const fs = require("fs").promises;
const path = require("path");

const WHATSAPP_API_TOKEN =
    process.env.WHATSAPP_API_TOKEN;

const PHP_API_ENDPOINT =
    process.env.PHP_API_ENDPOINT;

const WP_PATH =
    process.env.WP_PATH;

const CLOUDWA_BASE = String(
    process.env.WHATSAPP_API_ENDPOINT ||
    "https://wa.cloudwaapi.com/api/"
).replace(/\/?$/, "/");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;



function resolveUploadsDir() {
    const projectRoot = path.join( __dirname, "..", ".." );

    const configured = process.env.UP_PATH;

    if (configured) {
        return path.isAbsolute(configured)
            ? configured
            : path.resolve(
                projectRoot,
                configured );
    }

    return path.join( projectRoot, "uploads" );
}

function extractQrBase64FromAny(raw) {
    if (!raw) {
        return "";
    }

    let text = "";

    if (typeof raw === "string") {
        text = raw;

        try {
            const obj = JSON.parse(text);

            if ( obj &&
                (
                    obj.base64 ||
                    obj.qr ||
                    obj.qrcode ||
                    obj.qrCode
                )
            ) {
                return (
                    obj.base64 ||
                    obj.qr ||
                    obj.qrcode ||
                    obj.qrCode ||
                    ""
                );
            }
        } catch (_) {  }

    } else if (typeof raw === "object") {
        if (
            raw.base64 ||
            raw.qr ||
            raw.qrcode ||
            raw.qrCode
        ) {
            return (
                raw.base64 ||
                raw.qr ||
                raw.qrcode ||
                raw.qrCode ||
                ""
            );
        }

        try {
            text = JSON.stringify(raw);
        } catch (_) {
            text = String(raw);
        }
    } else {
        text = String(raw);
    }

    let match = text.match(
        /"base64"\s*:\s*"([^"\\]+(?:\\.[^"\\]*)*)"/i
    );

    if (match && match[1]) {
        return match[1];
    }

    match = text.match(
        /data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=]+/i
    );

    if (match && match[0]) {
        return match[0];
    }

    return "";
}

async function loadStoredInstanceId() {
    try {
        const uploadsPath = resolveUploadsDir();

        const filePath = path.join( uploadsPath, "wa_instance_id.txt" );

        const data = await fs.readFile( filePath, "utf8" );

        return data.trim();

    } catch (_) {
        return "";
    }
}

async function persistInstanceId(instanceId) {
    const cleanInstanceId = String( instanceId || "" ).trim();

    if (!cleanInstanceId) {
        throw new Error(
            "instance_id is required"
        );
    }

    const uploadsPath = resolveUploadsDir();

    const filePath = path.join( uploadsPath, "wa_instance_id.txt"
    );

    await fs.mkdir ( path.dirname(filePath),
        {
            recursive: true
        }
    );

    await fs.writeFile( filePath, cleanInstanceId, "utf8" );

    return {
        success: true
    };
}


const otpStore = new Map();

function normalizeMobile(mobile) {
    const cleanMobile = String( mobile || "" )
        .replace(/\D/g, "")
        .trim();

    if (!cleanMobile) {
        throw new Error(
            "Mobile number is required"
        );
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        throw new Error(
            "Enter a valid 10-digit mobile number"
        );
    }

    return cleanMobile;
}

function normalizeOtp(otp) {
    const cleanOtp = String(
        otp || ""
    )
        .replace(/\D/g, "")
        .trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
        throw new Error(
            "Enter a valid 6-digit OTP"
        );
    }

    return cleanOtp;
}

function buildOtpKey(
    isdCodeCountryId,
    mobile
) {
    return `${isdCodeCountryId || "default"
        }_${mobile}`;
}

async function getPhoneCode(
    isdCodeCountryId
) {
    if (!isdCodeCountryId) {
        return "91";
    }

    const country = await db
        .knex("master_countries")
        .select("isd_code")
        .where({
            id: Number(isdCodeCountryId)
        })
        .first();

    return String(
        country?.isd_code || "91"
    ).replace(/\D/g, "");
}



async function sendMobileOtp({
    isd_code_country_id,
    mobile
}) {
    const cleanMobile =
        normalizeMobile(mobile);

    if (!WHATSAPP_API_TOKEN) {
        throw new Error(
            "WHATSAPP_API_TOKEN is not configured"
        );
    }

    const key = buildOtpKey( isd_code_country_id, cleanMobile );

    const previousOtp =
        otpStore.get(key);

    if (
        previousOtp?.lastSentAt &&
        Date.now() -
        previousOtp.lastSentAt <
        OTP_RESEND_COOLDOWN_MS
    ) {
        const remainingSeconds =
            Math.ceil(
                (
                    OTP_RESEND_COOLDOWN_MS -
                    (
                        Date.now() -
                        previousOtp.lastSentAt
                    )
                ) / 1000
            );

        throw new Error(
            `Please wait ${remainingSeconds} seconds before requesting another OTP`
        );
    }

    const otp = crypto
        .randomInt(
            100000,
            1000000
        )
        .toString();

    const phoneCode = await getPhoneCode(
            isd_code_country_id
        );

    const destination = `${phoneCode}${cleanMobile}`;

    otpStore.set(key, {
        otp,
        expiresAt:
            Date.now() +
            OTP_EXPIRY_MS,
        lastSentAt:
            Date.now(),
        attempts: 0
    });

    const whatsappPayload = {
        to: destination,
        type: "text",
        msg:
            `Your SUAE verification code is ${otp}. ` +
            "This code is valid for 5 minutes. " +
            "Do not share this OTP with anyone."
    };

    try {
        const providerResponse = await sendMessage
            (
                whatsappPayload
            );

        return {
            sent: true,
            expires_in: 300,
            mobile:
                `******${cleanMobile.slice(-4)}`,
            provider_response:
                providerResponse
        };
    } catch (error) {
        otpStore.delete(key);

        console.error(
            "CloudWA OTP sending failed:",
            error.response?.data ||
            error.message
        );

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Unable to send OTP on WhatsApp"
        );
    }
}



async function verifyMobileOtpPublic({
    isd_code_country_id,
    mobile,
    otp
}) {
    const cleanMobile = normalizeMobile(mobile);

    const cleanOtp = normalizeOtp(otp);

    const key = buildOtpKey(
        isd_code_country_id,
        cleanMobile
    );

    const stored = otpStore.get(key);

    if (!stored) {
        throw new Error(
            "OTP not found. Please request a new OTP"
        );
    }

    if (
        Date.now() >
        stored.expiresAt
    ) {
        otpStore.delete(key);

        throw new Error(
            "OTP expired. Please request a new OTP"
        );
    }

    if (
        Number(stored.attempts || 0) >=
        OTP_MAX_ATTEMPTS
    ) {
        otpStore.delete(key);

        throw new Error(
            "Too many invalid attempts. Please request a new OTP"
        );
    }

    if (stored.otp !== cleanOtp) {
        stored.attempts =
            Number(
                stored.attempts || 0
            ) + 1;

        otpStore.set(
            key,
            stored
        );

        const attemptsLeft =
            OTP_MAX_ATTEMPTS -
            stored.attempts;

        throw new Error(
            attemptsLeft > 0
                ? `Invalid OTP. ${attemptsLeft} attempts remaining`
                : "Too many invalid attempts. Please request a new OTP"
        );
    }

    otpStore.delete(key);

    return {
        verified: true,
        mobile:
            `******${cleanMobile.slice(-4)}`
    };
}



async function markStudentMobileVerified(
    {
        student_id,
        isd_code_country_id,
        mobile
    },
    req
) {
    const studentId = Number(student_id || 0);

    const cleanMobile = String(mobile || "").trim();

    const isdId =
        isd_code_country_id
            ? Number(
                isd_code_country_id
            )
            : null;

    let student = null;

    if (studentId) {
        student = await db
            .knex("students")
            .select([
                "id",
                "user_id"
            ])
            .where({
                id: studentId
            })
            .first();

        if (!student) {
            throw new Error(
                "Student not found"
            );
        }

        const isStudentUser = req?.currentUser?.isStudent;

        const currentUserId =
            Number(
                req?.currentUser?.id ||
                0
            );

        if (
            isStudentUser &&
            currentUserId &&
            Number(student.user_id) !==
            currentUserId
        ) {
            throw new Error(
                "Not authorized"
            );
        }
    } else {
        const isStudentUser = req?.currentUser?.isStudent;

        const currentUserId =
            Number(
                req?.currentUser?.id ||
                0
            );

        if (
            isStudentUser &&
            currentUserId
        ) {
            student = await db
                .knex("students")
                .select([
                    "id",
                    "user_id"
                ])
                .where({
                    user_id:
                        currentUserId
                })
                .first();

            if (!student) {
                throw new Error(
                    "Student not found"
                );
            }
        } else {
            if (!cleanMobile) {
                throw new Error(
                    "mobile is required"
                );
            }

            let userQuery = db
                .knex("users")
                .select(["id"])
                .where({
                    mobile:
                        cleanMobile
                });

            if (isdId) {
                userQuery =
                    userQuery.andWhere({
                        isd_code_country_id:
                            isdId
                    });
            }

            const user = await userQuery.first();

            if (!user) {
                throw new Error(
                    "User not found for this mobile number"
                );
            }

            student = await db
                .knex("students")
                .select([
                    "id",
                    "user_id"
                ])
                .where({
                    user_id: user.id
                })
                .first();

            if (!student) {
                throw new Error(
                    "Student not found for this mobile number"
                );
            }
        }
    }

    if (student?.user_id) {
        const userPatch = {};

        if (cleanMobile) {
            userPatch.mobile =
                cleanMobile;
        }

        if (isdId) {
            userPatch.isd_code_country_id =
                isdId;
        }

        if (
            Object.keys(userPatch)
                .length
        ) {
            await db.save(
                "users",
                {
                    id:
                        student.user_id,
                    ...userPatch
                },
                1,
                req
            );
        }
    }

    await db.save(
        "students",
        {
            id: student.id,
            mobile_verified: 1,
            mobile_verified_on:
                currentDT()
        },
        1,
        req
    );

    return {
        student_id:
            student.id,
        mobile_verified: 1
    };
}



async function verifyMobileOtpAndPersist(
    {
        isd_code_country_id,
        mobile,
        otp,
        student_id
    },
    req
) {
    const base =
        await verifyMobileOtpPublic({
            isd_code_country_id,
            mobile,
            otp
        });

    const persisted =
        await markStudentMobileVerified(
            {
                student_id,
                isd_code_country_id,
                mobile
            },
            req
        );

    return {
        ...base,
        ...persisted
    };
}



async function fetchQrCode(
    instanceId
) {
    try {
        const url =
            `${CLOUDWA_BASE}get_qrcode`;

        const methods = [
            "get",
            "post"
        ];

        let lastResponse = null;

        for (
            const method of methods
        ) {
            const response =
                await axios({
                    method,
                    url,
                    params: {
                        instance_id:
                            instanceId,
                        access_token:
                            WHATSAPP_API_TOKEN
                    },
                    responseType:
                        "json",
                    timeout: 15000,
                    validateStatus:
                        () => true
                });

            lastResponse =
                response;

            const qr =
                extractQrBase64FromAny(
                    response.data
                );

            if (qr) {
                return qr;
            }
        }

        console.error(
            "QR response:",
            lastResponse?.status,
            lastResponse?.data
        );

        const status =
            lastResponse?.status;

        let body = "";

        if (
            typeof lastResponse?.data ===
            "string"
        ) {
            body =
                lastResponse.data;
        } else if (
            lastResponse?.data
        ) {
            try {
                body =
                    JSON.stringify(
                        lastResponse.data
                    );
            } catch (_) {
                body =
                    String(
                        lastResponse.data
                    );
            }
        }

        throw new Error(
            `CloudWA get_qrcode responded with ${status || "unknown"
            }: ${body}`
        );
    } catch (error) {
        console.error(
            "QR error:",
            error.response?.data ||
            error.message
        );

        const status =
            error?.response?.status;

        const cloudMessage =
            error?.response?.data
                ?.message ||
            error?.message ||
            "Unknown CloudWA error";

        throw new Error(
            `CloudWA QR error (${status || "no-status"
            }): ${cloudMessage}`
        );
    }
}

async function getQRCode(req) {
    const instanceId = await loadStoredInstanceId();

    if (!instanceId) {
        throw new Error(
            "WhatsApp instance is not configured. " +
            "Create or connect a CloudWA instance and save its instance_id inside uploads/wa_instance_id.txt"
        );
    }

    try {
        const qrBase64 =
            await fetchQrCode(
                instanceId
            );

        return {
            instance_id:
                instanceId,
            base64:
                qrBase64,
            qr_url: "",
            status: "qr"
        };
    } catch (error) {
        const message = error?.message || "";

        const lowerMessage = message.toLowerCase();

        const status200WithoutQr =
            message.includes(
                "CloudWA get_qrcode failed with status 200"
            ) ||
            message.includes(
                "CloudWA get_qrcode responded with 200"
            );

        if (
            (
                (
                    lowerMessage.includes(
                        "open"
                    ) ||
                    lowerMessage.includes(
                        "opened"
                    )
                ) &&
                lowerMessage.includes(
                    "dashboard"
                )
            ) ||
            status200WithoutQr
        ) {
            return {
                instance_id:
                    instanceId,
                base64: "",
                qr_url: "",
                status:
                    "connected",
                cloudwa_message:
                    "WhatsApp instance is already connected. You can send messages.",
                reconnect_url:
                    `${CLOUDWA_BASE}create_instance?access_token=${WHATSAPP_API_TOKEN}`
            };
        }

        if (
            /expired|expire|invalid|not\s*found|closed/i.test(
                message
            )
        ) {
            throw new Error(
                "WhatsApp CloudWA instance is expired or invalid. Create a new instance and update uploads/wa_instance_id.txt"
            );
        }

        throw error;
    }
}



async function sendMessage(
    {
        to,
        msg = "",
        type = "text"
    },
    req
) {
    const instanceId = await loadStoredInstanceId();

    if (!instanceId) {
        throw new Error(
            "WhatsApp instance is not configured. Connect WhatsApp and save instance_id"
        );
    }

    if (!WHATSAPP_API_TOKEN) {
        throw new Error(
            "WHATSAPP_API_TOKEN is not configured"
        );
    }

    const cleanNumber =
        String(to || "")
            .replace(/\D/g, "")
            .trim();

    if (!cleanNumber) {
        throw new Error(
            "WhatsApp recipient number is required"
        );
    }

    if (!msg) {
        throw new Error(
            "WhatsApp message is required"
        );
    }

    const response = await axios.get(
            `${CLOUDWA_BASE}send`,
            {
                params: {
                    number:
                        cleanNumber,
                    type,
                    message:
                        String(msg),
                    instance_id:
                        instanceId,
                    access_token:
                        WHATSAPP_API_TOKEN
                },
                timeout: 15000,
                validateStatus:
                    () => true
            }
        );

    if (
        response.status < 200 ||
        response.status >= 300
    ) {
        throw new Error(
            response.data?.message ||
            `CloudWA returned HTTP ${response.status}`
        );
    }

    if (
        response.data?.status ===
        false ||
        response.data?.success ===
        false
    ) {
        throw new Error(
            response.data?.message ||
            "CloudWA rejected the message"
        );
    }

    return response.data;
}


async function getSentMessages(req) {
    const {
        isClient,
        isInstitute,
        institute_id
    } = req.currentUser;

    const {
        p,
        ps,
        lead_id
    } = req.query || {};

    if (
        !isClient &&
        !isInstitute
    ) {
        throw new Error(
            "Not authorized"
        );
    }

    let query = db
        .knex(
            "leads_sent_whatsapp as lsw"
        )
        .select([
            "lsw.id",
            "lsw.lead_id",
            "lsw.institute_id",
            "lsw.msg",
            "lsw.created",
            "lsw.created_by"
        ])
        .orderBy(
            "lsw.created",
            "desc"
        );

    if (isInstitute) {
        query = query.where(
            "lsw.institute_id",
            institute_id || 0
        );
    }

    if (lead_id) {
        query = query.where(
            "lsw.lead_id",
            Number(lead_id)
        );
    }

    return db.pagedRows(
        query,
        p,
        ps
    );
}

async function setInstanceId(
    instanceId
) {
    const data = await persistInstanceId( instanceId );

    return {
        instance_id:
            instanceId,
        php: data
    };
}


module.exports = {
    getQRCode,
    sendMessage,
    getSentMessages,
    setInstanceId,
    sendMobileOtp,

    // Public website consultation form
    verifyMobileOtpPublic,

    // Existing student flow compatibility
    verifyMobileOtp:
        verifyMobileOtpAndPersist,

    verifyMobileOtpAndPersist
};




