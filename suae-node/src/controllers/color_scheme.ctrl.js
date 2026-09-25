const { Router } = require("express");
const { validateToken } = require("../middleware/route.mw");
const ColorSchemeService = require("../services/color_scheme.service");

const router = Router({ mergeParams: true });

class ColorSchemeCtrl {
    static async list(req, res) {
        try {
            const result = await ColorSchemeService.list(req);
            return res.status(200).json({ message: "", result });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    }

    static async active(req, res) {
        try {
            const result = await ColorSchemeService.getActive();
            return res.status(200).json({ message: "", result });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    }

    static async detail(req, res) {
        try {
            const result = await ColorSchemeService.detail(req);
            return res.status(200).json({ message: "", result });
        } catch (e) {
            return res.status(404).json({ message: e.message || "Not found" });
        }
    }

    static async create(req, res) {
        try {
            const result = await ColorSchemeService.create(req);
            return res.status(201).json({ message: "Created", result });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    }

    static async update(req, res) {
        try {
            const result = await ColorSchemeService.update(req);
            return res.status(200).json({ message: "Updated", result });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    }

    static async remove(req, res) {
        try {
            const result = await ColorSchemeService.remove(req);
            return res.status(200).json({ message: "Deleted", result });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    }
}

router.get("/", ColorSchemeCtrl.list);
router.get("/active", ColorSchemeCtrl.active);
router.get("/:id", ColorSchemeCtrl.detail);

router.post("/", validateToken, ColorSchemeCtrl.create);
router.put("/:id", validateToken, ColorSchemeCtrl.update);
router.delete("/:id", validateToken, ColorSchemeCtrl.remove);

module.exports = router;
