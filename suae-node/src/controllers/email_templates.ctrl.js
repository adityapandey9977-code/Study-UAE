const { Router } = require("express");
const router = Router({ mergeParams: true });
const EmailTemplatesService = require("../services/email_templates.service");

class EmailTemplatesCtrl {
    static list = async (req, res) => {
        try {
            const result = await EmailTemplatesService.list(req);
            return res.status(200).json({ message: '', ...result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static detail = async (req, res) => {
        try {
            const result = await EmailTemplatesService.detail(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(404).json({ message: e.message || 'Not found' });
        }
    }

    static create = async (req, res) => {
        try {
            const result = await EmailTemplatesService.create(req);
            return res.status(201).json({ message: 'Created', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static update = async (req, res) => {
        try {
            const result = await EmailTemplatesService.update(req);
            return res.status(200).json({ message: 'Updated', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static remove = async (req, res) => {
        try {
            const result = await EmailTemplatesService.remove(req);
            return res.status(200).json({ message: 'Deleted', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
}

router.get('/', EmailTemplatesCtrl.list);
router.get('/:id', EmailTemplatesCtrl.detail);
router.post('/', EmailTemplatesCtrl.create);
router.put('/:id', EmailTemplatesCtrl.update);
router.delete('/:id', EmailTemplatesCtrl.remove);

module.exports = router;


