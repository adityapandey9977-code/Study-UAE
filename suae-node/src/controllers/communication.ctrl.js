const { Router } = require("express");
const router = Router({ mergeParams: true });
const CommunicationService = require("../services/communication.service");
const { validateSendWhatsappToLead } = require("../middleware/communication.mw");
const { trim } = require("../util/common.util");

class CommunicationCtrl {
    static sendWhatsappToLead = async (req, res) => {
        try {
            const { msg, lead_id, auto_login_url } = trim(req.body || {});
            const result = await CommunicationService.sendWhatsappToLead({ msg, lead_id, auto_login_url }, req);
            return res.status(200).json({ message: 'Sent', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getSentWhatsappToLead = async (req, res) => {
        try {
            const result = await CommunicationService.getSentWhatsappToLead(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
}

router.post('/sendWhatsappToLead', validateSendWhatsappToLead, CommunicationCtrl.sendWhatsappToLead);
router.get('/getSentWhatsappToLead', CommunicationCtrl.getSentWhatsappToLead);

module.exports = router;