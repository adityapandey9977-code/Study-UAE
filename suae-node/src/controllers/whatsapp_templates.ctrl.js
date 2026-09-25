const { Router } = require("express");
const router = Router({ mergeParams: true });
const WhatsappTemplatesService = require("../services/whatsapp_templates.service");

class WhatsappTemplatesCtrl {
    static list = async (req, res) => {
        try {
            const result = await WhatsappTemplatesService.list(req);
            return res.status(200).json({ message: '', ...result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static detail = async (req, res) => {
        try {
            const result = await WhatsappTemplatesService.detail(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(404).json({ message: e.message || 'Not found' });
        }
    }

    static create = async (req, res) => {
        try {
            const result = await WhatsappTemplatesService.create(req);
            return res.status(201).json({ message: 'Created', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static update = async (req, res) => {
        try {
            const result = await WhatsappTemplatesService.update(req);
            return res.status(200).json({ message: 'Updated', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static remove = async (req, res) => {
        try {
            const result = await WhatsappTemplatesService.remove(req);
            return res.status(200).json({ message: 'Deleted', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
}

router.get('/', WhatsappTemplatesCtrl.list);
router.get('/:id', WhatsappTemplatesCtrl.detail);
router.post('/', WhatsappTemplatesCtrl.create);
router.put('/:id', WhatsappTemplatesCtrl.update);
router.delete('/:id', WhatsappTemplatesCtrl.remove);

module.exports = router;


