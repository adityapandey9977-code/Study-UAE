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
}

module.exports = FormOtpController;