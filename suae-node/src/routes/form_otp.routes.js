const { Router } = require("express");
const FormOtpController = require("../controllers/form_otp.ctrl");

const router = Router({
    mergeParams: true
});

// Captcha routes
router.get("/captcha", FormOtpController.getCaptcha);
router.post("/verify-captcha", FormOtpController.verifyCaptcha);

// OTP routes
router.post("/send-otp", FormOtpController.sendOtp);
router.post("/verify-otp", FormOtpController.verifyOtp);

// Form submission & dynamic form details
router.post("/submit", FormOtpController.submitForm);
router.get("/slug/:slug", FormOtpController.getFormBySlug);

module.exports = router;