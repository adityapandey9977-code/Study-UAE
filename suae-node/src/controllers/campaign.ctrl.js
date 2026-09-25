const { Router } = require("express");
const router = Router({ mergeParams: true });
const CampaignService = require("../services/campaign.service");

class CampaignCtrl {
    static handleError(res, error) {
        const status = error.status || 500;
        const payload = {
            message: error.message || "Error"
        };
        if (error.details) {
            payload.details = error.details;
        }
        return res.status(status).json(payload);
    }

    static async list(req, res) {
        try {
            const result = await CampaignService.list(req);
            return res.status(200).json({ message: "", ...result });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async detail(req, res) {
        try {
            const data = await CampaignService.detail(req);
            return res.status(200).json({ message: "", data });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async create(req, res) {
        try {
            const data = await CampaignService.create(req);
            return res.status(201).json({ message: "Created", data });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async update(req, res) {
        try {
            const data = await CampaignService.update(req);
            return res.status(200).json({ message: "Updated", data });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async remove(req, res) {
        try {
            await CampaignService.remove(req);
            return res.status(200).json({ message: "Deleted" });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async addRecipients(req, res) {
        try {
            const data = await CampaignService.addRecipients(req);
            return res.status(200).json({ message: "Recipients added", data });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async listRecipients(req, res) {
        try {
            const result = await CampaignService.listRecipients(req);
            return res.status(200).json({ message: "", ...result });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async removeRecipient(req, res) {
        try {
            await CampaignService.removeRecipient(req);
            return res.status(200).json({ message: "Recipient removed" });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async listLogs(req, res) {
        try {
            const result = await CampaignService.listLogs(req);
            return res.status(200).json({ message: "", ...result });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }

    static async send(req, res) {
        try {
            const data = await CampaignService.sendCampaign(req);
            return res.status(200).json({ message: "Send started", data });
        } catch (e) {
            return CampaignCtrl.handleError(res, e);
        }
    }
}

router.get("/", CampaignCtrl.list);
router.get("/:id", CampaignCtrl.detail);
router.post("/", CampaignCtrl.create);
router.put("/:id", CampaignCtrl.update);
router.delete("/:id", CampaignCtrl.remove);

router.post("/:id/recipients", CampaignCtrl.addRecipients);
router.get("/:id/recipients", CampaignCtrl.listRecipients);
router.delete("/:id/recipients/:rid", CampaignCtrl.removeRecipient);

router.get("/:id/logs", CampaignCtrl.listLogs);
router.post("/:id/send", CampaignCtrl.send);

module.exports = router;
