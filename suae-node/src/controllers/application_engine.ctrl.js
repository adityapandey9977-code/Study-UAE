const { Router } = require("express");
const router = Router({ mergeParams: true });
const ApplicationEngineService = require("../services/application_engine.service");

class ApplicationEngineCtrl {
  static handleError(res, error) {
    console.error("ApplicationEngineCtrl Error:", error);
    const status = error.status || 500;
    const payload = { message: error.message || "An unexpected error occurred" };
    if (error.details) {
      payload.details = error.details;
    }
    return res.status(status).json(payload);
  }

  static async listForms(req, res) {
    try {
      const data = await ApplicationEngineService.listForms(req);
      return res.status(200).json({ message: "Forms retrieved successfully", data });
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async getActiveForm(req, res) {
    try {
      const data = await ApplicationEngineService.getActiveForm(req);
      return res.status(200).json({ message: "Active form schema retrieved", data });
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async getFormById(req, res) {
    try {
      const { id } = req.params;
      const data = await ApplicationEngineService.getFormById(id);
      return res.status(200).json({ message: "Form details retrieved", data });
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async saveForm(req, res) {
    try {
      const data = await ApplicationEngineService.saveForm(req.body, req);
      return res.status(200).json({ message: "Form saved successfully", data });
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async saveSection(req, res) {
    try {
      const data = await ApplicationEngineService.saveSection(req.body, req);
      return res.status(200).json({ message: "Section saved successfully", data });
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async deleteSection(req, res) {
    try {
      const { id } = req.params;
      const data = await ApplicationEngineService.deleteSection(id);
      return res.status(200).json(data);
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async saveField(req, res) {
    try {
      const data = await ApplicationEngineService.saveField(req.body, req);
      return res.status(200).json({ message: "Field saved successfully", data });
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async deleteForm(req, res) {
    try {
      const { id } = req.params;
      const data = await ApplicationEngineService.deleteForm(id);
      return res.status(200).json(data);
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async deleteField(req, res) {
    try {
      const { id } = req.params;
      const data = await ApplicationEngineService.deleteField(id);
      return res.status(200).json(data);
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }

  static async saveFullSchema(req, res) {
    try {
      const { id } = req.params;
      const data = await ApplicationEngineService.saveFullSchema(id, req.body, req);
      return res.status(200).json({ message: "Full form schema saved successfully", data });
    } catch (error) {
      return ApplicationEngineCtrl.handleError(res, error);
    }
  }
}

// Router routes
router.get("/forms", ApplicationEngineCtrl.listForms);
router.get("/active", ApplicationEngineCtrl.getActiveForm);
router.get("/forms/:id", ApplicationEngineCtrl.getFormById);
router.post("/forms", ApplicationEngineCtrl.saveForm);
router.delete("/forms/:id", ApplicationEngineCtrl.deleteForm);
router.post("/sections", ApplicationEngineCtrl.saveSection);
router.delete("/sections/:id", ApplicationEngineCtrl.deleteSection);
router.post("/fields", ApplicationEngineCtrl.saveField);
router.delete("/fields/:id", ApplicationEngineCtrl.deleteField);
router.post("/forms/:id/full-schema", ApplicationEngineCtrl.saveFullSchema);

module.exports = router;
