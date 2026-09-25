const db = require("../libraries/db");

class IssuesService {
    /**
     * Return student issues for courses belonging to the logged-in institute
     */
    static getIssuesForInstitute = async (req) => {
        const { institute_id } = req.currentUser || {};
        if (!institute_id) {
            throw new Error("Institute ID not found in user context");
        }

        // Join student_issues -> students -> users and ensure the student has a choice for this institute via scf -> institute_courses
        const rows = await db.knex({ si: 'student_issues' })
            .distinct([
                'si.id as issue_id',
                'si.student_id',
                'si.cat_id',
                'si.description',
                'si.file_id',
                'si.status',
                'si.created',
                'si.updated',
                'si.created_by',
                'si.updated_by',
                'u.name as student_name',
                'u.email as student_email',
                'u.mobile as student_mobile',
                's.id as student_id',
                's.regno as student_regno',
                'sp.name as specialization',
                'ic.id as institute_course_id',
            ])
            .join({ s: 'students' }, 's.id', 'si.student_id')
            .join({ u: 'users' }, 'u.id', 's.user_id')
            .join({ scf: 'student_choice_fillings' }, 'scf.student_id', 's.id')
            .join({ ic: 'institute_courses' }, 'ic.id', 'scf.institute_course_id')
            .leftJoin({ sp: 'master_specializations' }, 'sp.id', 'ic.specialization_id')
            .where('ic.institute_id', institute_id)
            .orderBy('si.created', 'desc');

        return rows;
    }

    /**
     * Delete a student issue if it belongs to the logged-in institute scope or if user is admin
     */
    static deleteIssueForInstitute = async (issueId, req) => {
        const { institute_id, isAdmin } = req.currentUser || {};
        
        if (!issueId) {
            throw new Error("Issue ID is required");
        }

        // If admin, allow deletion without institute check
        if (isAdmin) {
            const issueExists = await db.knex('student_issues')
                .where({ id: issueId })
                .first('id');
            
            if (!issueExists) {
                throw new Error("Issue not found");
            }
            
            await db.knex('student_issues').where({ id: issueId }).del();
            return { success: true };
        }

        // For institutes, verify the issue is linked to this institute
        if (!institute_id) {
            throw new Error("Institute ID not found in user context");
        }

        // Verify the issue is linked to this institute through student's choice filling
        const exists = await db.knex({ si: 'student_issues' })
            .join({ s: 'students' }, 's.id', 'si.student_id')
            .join({ scf: 'student_choice_fillings' }, 'scf.student_id', 's.id')
            .join({ ic: 'institute_courses' }, 'ic.id', 'scf.institute_course_id')
            .where('si.id', issueId)
            .where('ic.institute_id', institute_id)
            .first('si.id');

        if (!exists) {
            throw new Error("Issue not found for this institute");
        }

        await db.knex('student_issues').where({ id: issueId }).del();
        return { success: true };
    }
}

module.exports = IssuesService;


