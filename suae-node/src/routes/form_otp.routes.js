const { Router } = require("express");

const FormOtpController =
    require("../controllers/form_otp.ctrl");

const router = Router({
    mergeParams: true
});

router.post(
    "/send-otp",
    FormOtpController.sendOtp
);

router.post(
    "/verify-otp",
    FormOtpController.verifyOtp
);

module.exports = router;