const { Router } = require("express");
const router = Router({ mergeParams: true });
const ScoreboardService = require("../services/scoreboard.service");

class ScoreboardCtrl {
    static getStudentScoreboard = async (req, res) => {
        try {
            const result = await ScoreboardService.getStudentScoreboard(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteScoreboard = async (req, res) => {
        try {
            const result = await ScoreboardService.getInstituteScoreboard(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getAgentScoreboard = async (req, res) => {
        try {
            const result = await ScoreboardService.getAgentScoreboard(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
}

router.get('/student', ScoreboardCtrl.getStudentScoreboard);
router.get('/institute', ScoreboardCtrl.getInstituteScoreboard);
router.get('/agent', ScoreboardCtrl.getAgentScoreboard);

module.exports = router;


