const { Router } = require("express");
const router = Router({ mergeParams: true });
const { checkAccess } = require("../middleware/auth.mw");
const validator = require("../middleware/whatsapp.mw");
const WhatsappService = require("../services/whatsapp.service");
const { pickValues, trim } = require("../util/common.util");

class WhatsappCtrl {
    static getQRCode = async (req, res) => {
        try {
            const result = await WhatsappService.getQRCode(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static sendMessage = async (req, res) => {
        try {
            const { to, msg } = trim(req.body || {});
            const data = {
                to,
                msg
            };
            const result = await WhatsappService.sendMessage(data, req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static listSent = async (req, res) => {
        try {
            const result = await WhatsappService.getSentMessages(req);
            return res.status(200).json({ message: 'OK', ...result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static setInstanceId = async (req, res) => {
        try {
            const { instance_id } = trim(req.body || {});
            if (!instance_id) {
                return res.status(400).json({ message: 'instance_id is required' });
            }
            const result = await WhatsappService.setInstanceId(instance_id);
            return res.status(200).json({ message: 'Instance updated', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static sendMobileOtp = async (req, res) => {
        try {
            const { isd_code_country_id, mobile } = trim(req.body || {});
            const result = await WhatsappService.sendMobileOtp({ isd_code_country_id, mobile });
            return res.status(200).json({ message: 'OTP sent successfully', ...result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static verifyMobileOtp = async (req, res) => {
        try {
            const { isd_code_country_id, mobile, otp, student_id } = trim(req.body || {});
            const result = await WhatsappService.verifyMobileOtp({ isd_code_country_id, mobile, otp, student_id }, req);
            return res.status(200).json({ message: 'OTP verified successfully', ...result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
}

router.post('/get-qr-code', WhatsappCtrl.getQRCode);
router.post('/send-message', WhatsappCtrl.sendMessage);
router.get('/sent', WhatsappCtrl.listSent);
router.post('/set-instance-id', WhatsappCtrl.setInstanceId);
router.post('/send-mobile-otp', WhatsappCtrl.sendMobileOtp);
router.post('/verify-mobile-otp', WhatsappCtrl.verifyMobileOtp);

module.exports = router;
