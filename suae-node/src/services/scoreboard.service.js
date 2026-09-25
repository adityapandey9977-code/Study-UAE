const db = require("../libraries/db");

class ScoreboardService {
    static getSessionDateRange = async (sessionIdentifier) => {
        if (!sessionIdentifier) return null;
        
        let session;
        
        // Check if it's a numeric ID or session string like "2024-2025"
        if (/^\d+$/.test(sessionIdentifier)) {
            // Numeric ID
            session = await db.knex("master_session")
                .select(['session_startdt', 'session_enddt'])
                .where({ id: sessionIdentifier })
                .first();
        } else {
            // Session string format - try to match by year pattern
            // Extract years from session string like "2024-2025"
            const yearMatch = sessionIdentifier.match(/(\d{4})-(\d{4})/);
            if (yearMatch) {
                const [, startYear, endYear] = yearMatch;
                // Look for session that matches these years
                session = await db.knex("master_session")
                    .select(['session_startdt', 'session_enddt'])
                    .whereRaw('YEAR(session_startdt) = ?', [startYear])
                    .whereRaw('YEAR(session_enddt) = ?', [endYear])
                    .first();
            }
            
            // If no match found with year pattern, try exact match on created year or other patterns
            if (!session) {
                session = await db.knex("master_session")
                    .select(['session_startdt', 'session_enddt'])
                    .where('session_startdt', 'like', `%${sessionIdentifier}%`)
                    .orWhere('session_enddt', 'like', `%${sessionIdentifier}%`)
                    .first();
            }
        }
            
        if (!session) {
            throw new Error(`Session '${sessionIdentifier}' not found`);
        }
        
        return {
            start: session.session_startdt,
            end: session.session_enddt
        };
    }

    static applySessionFilter = (query, dateRange, dateColumn = 'created') => {
        if (!dateRange) return query;
        
        return query.where(dateColumn, '>=', dateRange.start)
                   .where(dateColumn, '<=', dateRange.end);
    }
    static getStudentScoreboard = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error("Only super admin can access this endpoint");
        }

        const { session } = req.query || {};
        
        // Get session date range if session is provided
        const sessionDateRange = await this.getSessionDateRange(session);

        // Apply session filter to queries that use created dates
        let totalStudentsQuery = db.knex('students');
        let basicInfoQuery = db.knex('students').whereNotNull('basic_info_date');
        let additionalInfoQuery = db.knex('student_extra_info');
        let educationalInfoQuery = db.knex('student_edu_details');
        let backgroundInfoQuery = db.knex('students').whereNotNull('background_info_date');
        let choiceFillingQuery = db.knex('student_choice_fillings');
        let admissionOfferedQuery = db.knex('student_choice_fillings').where('ins_status', 'Accepted');
        let offerAcceptedQuery = db.knex('student_choice_fillings').where('stu_status', 'Accepted');
        let paymentProofQuery = db.knex('student_choice_fillings')
            .whereNotNull('payment_slip_file_id')
            .where('payment_slip_file_id', '!=', '');
        let enrolledQuery = db.knex('student_choice_fillings').where('adm_status', 'Approved');
        let visaLetterQuery = db.knex('student_letters')
            .whereNotNull('student_id')
            .where(builder => builder.where('student_visa', 1).orWhere('student_visa', '1'));
        let pickupScheduledQuery = db.knex('student_letters')
            .whereNotNull('student_id')
            .where(builder => builder.where('pickup', 1).orWhere('pickup', '1'));

        // Apply session filter if session is provided
        if (sessionDateRange) {
            totalStudentsQuery = this.applySessionFilter(totalStudentsQuery, sessionDateRange, 'created');
            basicInfoQuery = this.applySessionFilter(basicInfoQuery, sessionDateRange, 'created');
            additionalInfoQuery = this.applySessionFilter(additionalInfoQuery, sessionDateRange, 'created');
            educationalInfoQuery = this.applySessionFilter(educationalInfoQuery, sessionDateRange, 'created');
            backgroundInfoQuery = this.applySessionFilter(backgroundInfoQuery, sessionDateRange, 'created');
            choiceFillingQuery = this.applySessionFilter(choiceFillingQuery, sessionDateRange, 'created');
            admissionOfferedQuery = this.applySessionFilter(admissionOfferedQuery, sessionDateRange, 'created');
            offerAcceptedQuery = this.applySessionFilter(offerAcceptedQuery, sessionDateRange, 'created');
            paymentProofQuery = this.applySessionFilter(paymentProofQuery, sessionDateRange, 'created');
            enrolledQuery = this.applySessionFilter(enrolledQuery, sessionDateRange, 'created');
            visaLetterQuery = this.applySessionFilter(visaLetterQuery, sessionDateRange, 'created');
            pickupScheduledQuery = this.applySessionFilter(pickupScheduledQuery, sessionDateRange, 'created');
        }

        const [{ total_students }] = await totalStudentsQuery.count({ total_students: '*' });
        const [{ basic_info_completed }] = await basicInfoQuery.countDistinct({ basic_info_completed: 'id' });
        const [{ additional_info_completed }] = await additionalInfoQuery.countDistinct({ additional_info_completed: 'student_id' });
        const [{ educational_info_completed }] = await educationalInfoQuery.countDistinct({ educational_info_completed: 'student_id' });
        const [{ background_info_completed }] = await backgroundInfoQuery.countDistinct({ background_info_completed: 'id' });
        const [{ choice_filling_completed }] = await choiceFillingQuery.countDistinct({ choice_filling_completed: 'student_id' });
        const [{ admission_offered }] = await admissionOfferedQuery.countDistinct({ admission_offered: 'student_id' });
        const [{ offer_accepted }] = await offerAcceptedQuery.countDistinct({ offer_accepted: 'student_id' });
        const [{ payment_proof_uploaded }] = await paymentProofQuery.countDistinct({ payment_proof_uploaded: 'student_id' });
        const [{ enrolled }] = await enrolledQuery.countDistinct({ enrolled: 'student_id' });
        const [{ visa_letter_sent }] = await visaLetterQuery.countDistinct({ visa_letter_sent: 'student_id' });
        const [{ pickup_scheduled }] = await pickupScheduledQuery.countDistinct({ pickup_scheduled: 'student_id' });

        const result = {
            total_students: Number(total_students || 0),
            basic_info_completed: Number(basic_info_completed || 0),
            additional_info_completed: Number(additional_info_completed || 0),
            educational_info_completed: Number(educational_info_completed || 0),
            background_info_completed: Number(background_info_completed || 0),
            choice_filling_completed: Number(choice_filling_completed || 0),
            admission_offered: Number(admission_offered || 0),
            offer_accepted: Number(offer_accepted || 0),
            payment_proof_uploaded: Number(payment_proof_uploaded || 0),
            visa_letter_sent: Number(visa_letter_sent || 0),
            pickup_scheduled: Number(pickup_scheduled || 0),
            enrolled: Number(enrolled || 0)
        };

        // Add session filter info if session was applied
        if (sessionDateRange) {
            result.session_filter = {
                session,
                date_range: sessionDateRange
            };
        }

        return result;
    }

    static getInstituteScoreboard = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error("Only super admin can access this endpoint");
        }

        try {
            const { session } = req.query || {};
            
            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);

            // Get institute-wise statistics
            let instituteQuery = db.knex
                .select(
                    'i.id as institute_id',
                    'i.name as institute_name',
                    'i.type as institute_type',
                    'i.city',
                    'i.state_id',
                    // Total Choice Filled - using the corrected logic from dashboard
                    db.knex.raw('COUNT(DISTINCT CASE WHEN u.status = 1 AND scf.adm_status <> "Pending" THEN scf.student_id END) as total_choice_filled'),
                    // Admission Offered
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Accepted" THEN 1 END) as admission_offered'),
                    // Admission Rejected
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Rejected" THEN 1 END) as admission_rejected'),
                    // Accepted by Student
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as accepted_by_student'),
                    // Rejected by Student
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Rejected" THEN 1 END) as rejected_by_student'),
                    // Payment Proof Uploaded
                    db.knex.raw('COUNT(CASE WHEN scf.payment_slip_file_id IS NOT NULL AND scf.payment_slip_file_id != "" THEN 1 END) as payment_proof_uploaded'),
                    // Enrolled (payment status is Uploaded or Acknowledged)
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status IN ("Uploaded", "Acknowledged") THEN 1 END) as enrolled')
                )
                .from('institutes as i')
                .leftJoin('institute_courses as ic', 'ic.institute_id', 'i.id')
                .leftJoin('student_choice_fillings as scf', 'scf.institute_course_id', 'ic.id')
                .leftJoin('users as u', 'u.id', 'scf.student_id')
                .groupBy('i.id', 'i.name', 'i.type', 'i.city', 'i.state_id');

            // Apply session filter if session is provided
            if (sessionDateRange) {
                instituteQuery = this.applySessionFilter(instituteQuery, sessionDateRange, 'scf.created');
            }

            const instituteStats = await instituteQuery.orderByRaw('total_choice_filled DESC, i.name ASC');

            // Add ticket_visa_uploaded as placeholder (0) to each institute record
            const processedStats = instituteStats.map(inst => ({
                ...inst,
                ticket_visa_uploaded: 0 // Placeholder until visa tracking is implemented
            }));

            // Calculate overall summary
            const summary = {
                total_institutes: processedStats.length,
                total_choice_filled: processedStats.reduce((sum, inst) => sum + (inst.total_choice_filled || 0), 0),
                total_admission_offered: processedStats.reduce((sum, inst) => sum + (inst.admission_offered || 0), 0),
                total_admission_rejected: processedStats.reduce((sum, inst) => sum + (inst.admission_rejected || 0), 0),
                total_accepted_by_student: processedStats.reduce((sum, inst) => sum + (inst.accepted_by_student || 0), 0),
                total_rejected_by_student: processedStats.reduce((sum, inst) => sum + (inst.rejected_by_student || 0), 0),
                total_payment_proof_uploaded: processedStats.reduce((sum, inst) => sum + (inst.payment_proof_uploaded || 0), 0),
                total_ticket_visa_uploaded: 0, // Placeholder until visa tracking is implemented
                total_enrolled: processedStats.reduce((sum, inst) => sum + (inst.enrolled || 0), 0)
            };

            const result = {
                success: true,
                data: processedStats,
                summary: summary
            };

            // Add session filter info if session was applied
            if (sessionDateRange) {
                result.session_filter = {
                    session,
                    date_range: sessionDateRange
                };
            }

            return result;
        } catch (error) {
            console.error('Error in getInstituteScoreboard:', error);
            throw new Error('Failed to fetch institute scoreboard data');
        }
    }

    static getAgentScoreboard = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error("Only super admin can access this endpoint");
        }

        const { session } = req.query || {};
        
        // Get session date range if session is provided
        const sessionDateRange = await this.getSessionDateRange(session);

        // Agent level aggregates based on students mapped via students.agent_id
        // and their applications in student_choice_fillings
        // Note: Agents are stored in users table with type='AGENT'
        const agentQuery = db.knex
            .select(
                'u.id as agent_id',
                'u.name as agent_name',
                db.knex.raw('COUNT(DISTINCT s.id) as registered'),
                db.knex.raw('COUNT(DISTINCT scf.student_id) as choice_filled'),
                db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Accepted" THEN 1 END) as admission_offered'),
                db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Rejected" THEN 1 END) as admission_rejected'),
                db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as accepted_by_student'),
                db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Rejected" THEN 1 END) as rejected_by_student'),
                db.knex.raw('COUNT(CASE WHEN scf.payment_slip_file_id IS NOT NULL AND scf.payment_slip_file_id != "" THEN 1 END) as payment_proof_uploaded'),
                db.knex.raw('COUNT(CASE WHEN scf.adm_status = "Approved" THEN 1 END) as enrolled')
            )
            .from('users as u')
            .where('u.type', 'AGENT')
            .leftJoin('students as s', function () {
                this.on('s.agent_id', '=', 'u.id');
                if (sessionDateRange) {
                    this.andOn(db.knex.raw('s.created >= ?', [sessionDateRange.start]));
                    this.andOn(db.knex.raw('s.created <= ?', [sessionDateRange.end]));
                }
            })
            .leftJoin('student_choice_fillings as scf', function () {
                this.on('scf.student_id', '=', 's.id');
                if (sessionDateRange) {
                    this.andOn(db.knex.raw('scf.created >= ?', [sessionDateRange.start]));
                    this.andOn(db.knex.raw('scf.created <= ?', [sessionDateRange.end]));
                }
            })
            .groupBy('u.id', 'u.name');

        const agentStats = await agentQuery.orderBy('registered', 'desc');

        // Overall summary across agents
        const summary = {
            total_agents: agentStats.length,
            total_registered: agentStats.reduce((sum, r) => sum + Number(r.registered || 0), 0),
            total_choice_filled: agentStats.reduce((sum, r) => sum + Number(r.choice_filled || 0), 0),
            total_admission_offered: agentStats.reduce((sum, r) => sum + Number(r.admission_offered || 0), 0),
            total_admission_rejected: agentStats.reduce((sum, r) => sum + Number(r.admission_rejected || 0), 0),
            total_accepted_by_student: agentStats.reduce((sum, r) => sum + Number(r.accepted_by_student || 0), 0),
            total_rejected_by_student: agentStats.reduce((sum, r) => sum + Number(r.rejected_by_student || 0), 0),
            total_payment_proof_uploaded: agentStats.reduce((sum, r) => sum + Number(r.payment_proof_uploaded || 0), 0),
            total_enrolled: agentStats.reduce((sum, r) => sum + Number(r.enrolled || 0), 0)
        };

        const result = {
            success: true,
            data: agentStats,
            summary
        };

        // Add session filter info if session was applied
        if (sessionDateRange) {
            result.session_filter = {
                session,
                date_range: sessionDateRange
            };
        }

        return result;
    }
}

module.exports = ScoreboardService;


