const { Router } = require("express");
const router = Router({ mergeParams: true });
const { checkAccess } = require("../middleware/auth.mw");
const DashboardService = require("../services/dashboard.service");
const db = require("../libraries/db");

class DashboardCtrl {
    static getStudentsByFilter = async (req, res) => {
        try {
            const result = await DashboardService.getStudentsByFilter(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static assignStudentsToSession = async (req, res) => {
        try {
            const { student_ids, session_id } = req.body;
            
            if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
                return res.status(400).json({ message: 'student_ids array is required' });
            }
            
            if (!session_id) {
                return res.status(400).json({ message: 'session_id is required' });
            }
            
            // Verify session exists
            const session = await db.knex('master_session')
                .where({ id: session_id })
                .first();
                
            if (!session) {
                return res.status(400).json({ message: 'Invalid session_id' });
            }
            
            // Update students
            const updated = await db.knex('students')
                .whereIn('id', student_ids)
                .update({ 
                    master_session_id: session_id,
                    updated: db.knex.fn.now()
                });
            
            return res.status(200).json({
                message: `Successfully assigned ${updated} students to session ${session_id}`,
                result: {
                    updated_count: updated,
                    session_id: session_id,
                    student_ids: student_ids
                }
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getUnassignedStudents = async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            
            // Get students with master_session_id = 0 or NULL
            const query = db.knex('students as s')
                .select([
                    's.id',
                    's.regno',
                    's.master_session_id',
                    's.created',
                    'u.name as student_name',
                    'u.email as student_email',
                    'u.mobile as student_mobile'
                ])
                .leftJoin('users as u', 'u.id', 's.user_id')
                .where(function() {
                    this.where('s.master_session_id', 0)
                        .orWhereNull('s.master_session_id');
                })
                .orderBy('s.created', 'desc');

            const result = await db.pagedRows(query, page, limit);
            
            return res.status(200).json({
                message: 'Unassigned students (master_session_id = 0 or NULL)',
                result
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static debugStudentSession = async (req, res) => {
        try {
            const { session } = req.query || {};
            
            // Debug: Check session lookup
            console.log('Debug: Looking for session:', session);
            
            let sessionInfo = null;
            if (session) {
                if (/^\d+$/.test(session)) {
                    sessionInfo = await db.knex("master_session")
                        .select(['id', 'session_startdt', 'session_enddt'])
                        .where({ id: parseInt(session) })
                        .first();
                } else {
                    const yearMatch = session.match(/(\d{4})-(\d{4})/);
                    if (yearMatch) {
                        const [, startYear, endYear] = yearMatch;
                        sessionInfo = await db.knex("master_session")
                            .select(['id', 'session_startdt', 'session_enddt'])
                            .whereRaw('YEAR(session_startdt) = ?', [startYear])
                            .whereRaw('YEAR(session_enddt) = ?', [endYear])
                            .first();
                    }
                }
            }
            
            console.log('Debug: Found session info:', sessionInfo);
            
            // Debug: Check all sessions
            const allSessions = await db.knex("master_session")
                .select(['id', 'session_startdt', 'session_enddt'])
                .orderBy('id', 'desc')
                .limit(10);
            console.log('Debug: All recent sessions:', allSessions);
            
            // Debug: Check students with session info
            const studentsWithSession = await db.knex('students')
                .select(['id', 'regno', 'master_session_id', 'created'])
                .whereNotNull('master_session_id')
                .orderBy('id', 'desc')
                .limit(10);
            console.log('Debug: Recent students with session:', studentsWithSession);
            
            // Debug: Count students by session
            const studentsBySession = await db.knex('students')
                .select('master_session_id')
                .count('* as count')
                .whereNotNull('master_session_id')
                .groupBy('master_session_id')
                .orderBy('count', 'desc');
            console.log('Debug: Students count by session:', studentsBySession);
            
            // Debug: Check if session field exists and has data
            const sessionFieldCheck = await db.knex('students')
                .select(['master_session_id'])
                .whereNotNull('master_session_id')
                .limit(5);
            console.log('Debug: Session field check:', sessionFieldCheck);
            
            // Debug: Total students without session filter
            const totalStudentsAll = await db.knex('students').count('* as count');
            console.log('Debug: Total students (no filter):', totalStudentsAll);
            
            // Debug: Students for specific session
            if (sessionInfo) {
                const studentsForSession = await db.knex('students')
                    .count('* as count')
                    .where('master_session_id', sessionInfo.id);
                console.log(`Debug: Students for session ${sessionInfo.id}:`, studentsForSession);
            }
            
            return res.status(200).json({
                message: 'Debug info',
                result: {
                    session_lookup: sessionInfo,
                    all_sessions: allSessions,
                    students_with_session: studentsWithSession,
                    students_by_session: studentsBySession,
                    session_field_check: sessionFieldCheck,
                    total_students_all: totalStudentsAll
                }
            });
        } catch (e) {
            console.error('Debug error:', e);
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
    static getStudentScoreboardCorrected = async (req, res) => {
        try {
            const result = await DashboardService.getStudentScoreboardCorrected(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteAcceptanceStats = async (req, res) => {
        try {
            const result = await DashboardService.getInstituteAcceptanceStats(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getOverallStats = async (req, res) => {
        try {
            const result = await DashboardService.getOverallStats(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getStatusBreakdown = async (req, res) => {
        try {
            const result = await DashboardService.getStatusBreakdown(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteSummary = async (req, res) => {
        try {
            const { institute_id } = req.params;
            if (!institute_id) {
                return res.status(400).json({ message: 'Institute ID is required' });
            }
            const result = await DashboardService.getInstituteSummary(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteEmailsSent = async (req, res) => {
        try {
            const { institute_id } = req.params;
            if (!institute_id) {
                return res.status(400).json({ message: 'Institute ID is required' });
            }
            const result = await DashboardService.getInstituteEmailsSent(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteWhatsappsSent = async (req, res) => {
        try {
            const { institute_id } = req.params;
            if (!institute_id) {
                return res.status(400).json({ message: 'Institute ID is required' });
            }
            const result = await DashboardService.getInstituteWhatsappsSent(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteCourseWiseSummary = async (req, res) => {
        try {
            const { institute_id } = req.params;
            if (!institute_id) {
                return res.status(400).json({ message: 'Institute ID is required' });
            }
            const result = await DashboardService.getInstituteCourseWiseSummary(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstituteCountryWiseSummary = async (req, res) => {
        try {
            const { institute_id } = req.params;
            if (!institute_id) {
                return res.status(400).json({ message: 'Institute ID is required' });
            }
            const result = await DashboardService.getInstituteCountryWiseSummary(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getGenderRatio = async (req, res) => {
        try {
            const result = await DashboardService.getGenderRatio(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getUserStats = async (req, res) => {
        try {
            const result = await DashboardService.getUserStats(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getStudentIssuesStats = async (req, res) => {
        try {
            const result = await DashboardService.getStudentIssuesStats(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getStudentAgeRangeStats = async (req, res) => {
        try {
            const result = await DashboardService.getStudentAgeRangeStats(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getTopInstitutes = async (req, res) => {
        try {
            const result = await DashboardService.getTopInstitutes(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getTopCountries = async (req, res) => {
        try {
            const result = await DashboardService.getTopCountries(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
}

router.get('/students-by-filter', DashboardCtrl.getStudentsByFilter);
router.post('/assign-students-to-session', DashboardCtrl.assignStudentsToSession);
router.get('/unassigned-students', DashboardCtrl.getUnassignedStudents);
router.get('/debug-student-session', DashboardCtrl.debugStudentSession);
router.get('/student-scoreboard-corrected', DashboardCtrl.getStudentScoreboardCorrected);
router.get('/institute-acceptance-stats', DashboardCtrl.getInstituteAcceptanceStats);
router.get('/overall-stats', DashboardCtrl.getOverallStats);
router.get('/status-breakdown', DashboardCtrl.getStatusBreakdown);
router.get('/institute/:institute_id/summary', DashboardCtrl.getInstituteSummary);
router.get('/institute/:institute_id/emails-sent', DashboardCtrl.getInstituteEmailsSent);
router.get('/institute/:institute_id/whatsapp-sent', DashboardCtrl.getInstituteWhatsappsSent);
router.get('/institute/:institute_id/course-summary', DashboardCtrl.getInstituteCourseWiseSummary);
router.get('/institute/:institute_id/country-summary', DashboardCtrl.getInstituteCountryWiseSummary);
router.get('/gender-ratio', DashboardCtrl.getGenderRatio);
router.get('/user-stats', DashboardCtrl.getUserStats);
router.get('/issues-stats', DashboardCtrl.getStudentIssuesStats);
router.get('/age-range', DashboardCtrl.getStudentAgeRangeStats);
router.get('/top-institutes', DashboardCtrl.getTopInstitutes);
router.get('/top-countries', DashboardCtrl.getTopCountries);

module.exports = router;
