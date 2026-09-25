const WhatsappService =
    require("../services/whatsapp.service");

class FormOtpController {
    static sendOtp = async (req, res) => {
        try {
            const {
                isd_code_country_id,
                mobile
            } = req.body || {};

            const result =
                await WhatsappService.sendMobileOtp({
                    isd_code_country_id:
                        isd_code_country_id || null,
                    mobile
                });

            return res.status(200).json({
                status: true,
                message:
                    "OTP sent successfully on WhatsApp",
                result: {
                    sent: result.sent,
                    expires_in: result.expires_in,
                    mobile: result.mobile
                }
            });
        } catch (error) {
            console.error(
                "Send WhatsApp OTP error:",
                error.response?.data ||
                error.message
            );

            const isCooldown = String(
                error.message || ""
            ).includes("Please wait");

            return res
                .status(isCooldown ? 429 : 400)
                .json({
                    status: false,
                    message:
                        error.message ||
                        "Unable to send OTP on WhatsApp"
                });
        }
    };

    static verifyOtp = async (req, res) => {
        try {
            const {
                isd_code_country_id,
                mobile,
                otp
            } = req.body || {};

            const result =
                await WhatsappService
                    .verifyMobileOtpPublic({
                        isd_code_country_id:
                            isd_code_country_id ||
                            null,
                        mobile,
                        otp
                    });

            return res.status(200).json({
                status: true,
                message:
                    "Mobile number verified successfully",
                result
            });
        } catch (error) {
            console.error(
                "Verify WhatsApp OTP error:",
                error.message
            );

            return res.status(400).json({
                status: false,
                message:
                    error.message ||
                    "OTP verification failed"
            });
        }
    };

    static getCaptcha = async (req, res) => {
        try {
            const svgCaptcha = require("svg-captcha");
            const jwt = require("jsonwebtoken");
            const JWT_SECRET = process.env.JWT_SECRET || "study-uae-secret-key-2026";

            const captcha = svgCaptcha.createMathExpr({
                mathMin: 1,
                mathMax: 9,
                mathOperator: "+",
                color: true,
                noise: 1,
                background: "#ffffff"
            });

            const token = jwt.sign(
                { answer: String(captcha.text) },
                JWT_SECRET,
                { expiresIn: "15m" }
            );

            return res.status(200).json({
                status: true,
                token,
                question: captcha.data
            });
        } catch (error) {
            console.error("Captcha generation error:", error.message);
            return res.status(500).json({
                status: false,
                message: "Unable to generate CAPTCHA"
            });
        }
    };

    static verifyCaptcha = async (req, res) => {
        try {
            const jwt = require("jsonwebtoken");
            const JWT_SECRET = process.env.JWT_SECRET || "study-uae-secret-key-2026";
            const { token, answer } = req.body || {};

            if (!token || answer === undefined || answer === null || String(answer).trim() === "") {
                return res.status(400).json({
                    status: false,
                    message: "Please enter the CAPTCHA answer."
                });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                return res.status(400).json({
                    status: false,
                    message: "CAPTCHA expired or invalid. Please refresh."
                });
            }

            if (String(decoded.answer).trim() !== String(answer).trim()) {
                return res.status(400).json({
                    status: false,
                    message: "CAPTCHA answer is incorrect. Please try again."
                });
            }

            return res.status(200).json({
                status: true,
                message: "CAPTCHA verified successfully"
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                message: "CAPTCHA verification failed"
            });
        }
    };

    static submitForm = async (req, res) => {
        try {
            const payload = req.body || {};
            console.log("[Admissions Form Submitted]:", payload);
            return res.status(200).json({
                status: true,
                message: "Your application has been received successfully! Our admissions team will reach out shortly."
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                message: error.message || "Form submission failed"
            });
        }
    };

    static getFormBySlug = async (req, res) => {
        try {
            const { slug } = req.params;
            return res.status(200).json({
                status: true,
                data: {
                    slug: slug || "consult-form",
                    title: "Study in UAE Consultation",
                    status: "active"
                }
            });
        } catch (error) {
            return res.status(404).json({
                status: false,
                message: "Form not found"
            });
        }
    };
}

module.exports = FormOtpController;