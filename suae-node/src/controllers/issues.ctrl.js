const { Router } = require("express");
const router = Router({ mergeParams: true });
const IssuesService = require("../services/issues.service");
const db = require("../libraries/db");


class IssuesCtrl {
    static getInstituteStudentIssues = async (req, res) => {
        try {
            const { isInstitute } = req.currentUser || {};
            if (!isInstitute) {
                return res.status(403).json({ message: "Only institutes can access this endpoint" });
            }

            const result = await IssuesService.getIssuesForInstitute(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }


    static deleteInstituteStudentIssue = async (req, res) => {
        try {
            const { isInstitute, isAdmin } = req.currentUser || {};
            if (!isInstitute && !isAdmin) {
                return res.status(403).json({ code: 403, message: "Only admins and institutes can access this endpoint" });
            }

            // Get ID from body or params
            const issueId = req.body.id || req.params.issueId;
            
            if (!issueId) {
                return res.status(400).json({ code: 400, message: "Issue ID is required" });
            }

            const result = await IssuesService.deleteIssueForInstitute(issueId, req);
            return res.status(200).json({ code: 200, message: 'Issue deleted successfully' });
        } catch (e) {
            return res.status(400).json({ code: 400, message: e.message || 'Error' });
        }
    }

    
    static getStudentIssuesByStudentId = async (req, res) => {
        try {
            const { student_id } = req.params;

            if (!student_id) {
                return res.status(400).json({ message: "Student ID is required" });
            }

            // Get total count of issues for this student
            const totalCount = await db.knex("student_issues")
                .where({ student_id })
                .count('* as count')
                .first();

            // Get all issues for this student
            const issues = await db.knex("student_issues")
                .select("id", "description", "status", "created", "updated")
                .where({ student_id })
                .orderBy('created', 'desc');

            return res.status(200).json({
                message: "Student issues retrieved successfully",
                total_count: parseInt(totalCount.count),
                issues: issues
            });

        } catch (e) {
            console.error('[Issues] Error:', e?.message || e);
            return res.status(400).json({ message: e.message || 'Error retrieving student issues' });
        }
    }
}


router.get('/student', IssuesCtrl.getInstituteStudentIssues);
router.get('/student/:student_id', IssuesCtrl.getStudentIssuesByStudentId);
router.delete('/student/:issueId', IssuesCtrl.deleteInstituteStudentIssue);
router.post('/student/delete', IssuesCtrl.deleteInstituteStudentIssue);


module.exports = router;


