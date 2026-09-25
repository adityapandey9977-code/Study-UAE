const { pickValues, trim } = require("../util/common.util");
const { checkAccess } = require("../middleware/auth.mw");
const MasterService = require("../services/master.service");

class MasterCtrl {
    static countries = async (req, res) => {
        try {
            const result = await MasterService.countries(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static states = async (req, res) => {
        try {
            const result = await MasterService.states(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static sessions = async (req, res) => {
        try {
            const result = await MasterService.sessions(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static createSession = async (req, res) => {
        try {
            const result = await MasterService.createSession(req);
            return res.status(201).json({ message: 'Session created successfully', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static updateSession = async (req, res) => {
        try {
            const result = await MasterService.updateSession(req);
            return res.status(200).json({ message: 'Session updated successfully', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static deleteSession = async (req, res) => {
        try {
            const result = await MasterService.deleteSession(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getSessionById = async (req, res) => {
        try {
            const result = await MasterService.getSessionById(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteCourses = async (req, res) => {
        try {
            const result = await MasterService.getInstituteCourses(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteCourseById = async (req, res) => {
        try {
            const result = await MasterService.getInstituteCourseById(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static copyCoursesBatch = async (req, res) => {
        try {
            const { institute_id } = req.params;
            const result = await MasterService.copyCoursesBatch(institute_id, req.body);
            return res.status(200).json({ 
                message: result.message,
                result: {
                    success: result.success,
                    count: result.count,
                    skipped: result.skipped
                }
            });
        } catch (e) {
            return res.status(400).json({ 
                message: e.message || 'Failed to copy courses',
                success: false
            });
        }
    }
}

module.exports = MasterCtrl;