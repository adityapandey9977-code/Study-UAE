const db = require("../libraries/db");

class DashboardService {
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

    static getStudentScoreboardCorrected = async (req) => {
        try {
            const { session } = req.query || {};
            
            // Get session ID for filtering
            let sessionId = null;
            let sessionInfo = null;
            
            if (session) {
                // First try to get session by ID or name
                if (/^\d+$/.test(session)) {
                    sessionId = parseInt(session);
                    sessionInfo = await db.knex("master_session")
                        .select(['id', 'session_startdt', 'session_enddt'])
                        .where({ id: sessionId })
                        .first();
                } else {
                    // Try to find session by year pattern like "2025-2026"
                    const yearMatch = session.match(/(\d{4})-(\d{4})/);
                    if (yearMatch) {
                        const [, startYear, endYear] = yearMatch;
                        sessionInfo = await db.knex("master_session")
                            .select(['id', 'session_startdt', 'session_enddt'])
                            .whereRaw('YEAR(session_startdt) = ?', [startYear])
                            .whereRaw('YEAR(session_enddt) = ?', [endYear])
                            .first();
                        sessionId = sessionInfo?.id;
                    }
                }
                
                if (!sessionInfo) {
                    throw new Error(`Session '${session}' not found`);
                }
            }

            // Helper function to apply session filter using master_session_id
            const applySessionFilter = (query, tableName = 'students') => {
                if (sessionId) {
                    if (tableName === 'students') {
                        return query.where('master_session_id', sessionId);
                    } else if (tableName === 'student_choice_fillings') {
                        return query.join('students as s', 's.id', 'student_choice_fillings.student_id')
                                   .where('s.master_session_id', sessionId);
                    } else if (tableName === 'student_letters') {
                        return query.join('students as s', 's.id', 'student_letters.student_id')
                                   .where('s.master_session_id', sessionId);
                    }
                }
                return query;
            };

            // Count only students with meaningful data (not NULL values)
            const stats = {};

            // 1. Total Students (registered) - filter by session
            let totalStudentsQuery = db.knex('students').count('* as count');
            totalStudentsQuery = applySessionFilter(totalStudentsQuery, 'students');
            const [{ count: totalStudents }] = await totalStudentsQuery;

            // 2. Registration Completed (students with created date)
            let registrationQuery = db.knex('students')
                .count('* as count')
                .whereNotNull('created');
            registrationQuery = applySessionFilter(registrationQuery, 'students');
            const [{ count: registrationCompleted }] = await registrationQuery;

            // 3. Basic Info Completed (students with basic_info_date)
            let basicInfoQuery = db.knex('students')
                .count('* as count')
                .whereNotNull('basic_info_date');
            basicInfoQuery = applySessionFilter(basicInfoQuery, 'students');
            const [{ count: basicInfoCompleted }] = await basicInfoQuery;

            // 4. Educational Info Completed (students with edu_info_date)
            let eduInfoQuery = db.knex('students')
                .count('* as count')
                .whereNotNull('edu_info_date');
            eduInfoQuery = applySessionFilter(eduInfoQuery, 'students');
            const [{ count: educationalInfoCompleted }] = await eduInfoQuery;

            // 5. Background Info Pending (students who haven't uploaded docs yet)
            let docNotUploadedQuery = db.knex('students')
                .count('* as count')
                .whereNull('doc_uploaded_on');
            docNotUploadedQuery = applySessionFilter(docNotUploadedQuery, 'students');
            const [{ count: backgroundInfoCompleted }] = await docNotUploadedQuery;

            // 6. Choice Filling Completed (students with course_choice_date)
            let choiceFillingQuery = db.knex('students')
                .count('* as count')
                .whereNotNull('course_choice_date');
            choiceFillingQuery = applySessionFilter(choiceFillingQuery, 'students');
            const [{ count: choiceFillingCompleted }] = await choiceFillingQuery;

            // 7. Admission Offered (choice fillings with ins_status = 'Accepted' AND ins_status_dt not null)
            let admissionOfferedQuery = db.knex('student_choice_fillings')
                .count('* as count')
                .where('ins_status', 'Accepted')
                .whereNotNull('ins_status_dt');
            admissionOfferedQuery = applySessionFilter(admissionOfferedQuery, 'student_choice_fillings');
            const [{ count: admissionOffered }] = await admissionOfferedQuery;

            // 8. Offer Accepted (choice fillings with stu_status = 'Accepted' AND stu_status_dt not null)
            let offerAcceptedQuery = db.knex('student_choice_fillings')
                .count('* as count')
                .where('stu_status', 'Accepted')
                .whereNotNull('stu_status_dt');
            offerAcceptedQuery = applySessionFilter(offerAcceptedQuery, 'student_choice_fillings');
            const [{ count: offerAccepted }] = await offerAcceptedQuery;

            // 9. Payment Proof Uploaded (choice fillings with payment_slip_file_id not null AND payment_slip_dt not null)
            let paymentProofQuery = db.knex('student_choice_fillings')
                .count('* as count')
                .whereNotNull('payment_slip_file_id')
                .whereNotNull('payment_slip_dt')
                .where('payment_slip_file_id', '!=', '');
            paymentProofQuery = applySessionFilter(paymentProofQuery, 'student_choice_fillings');
            const [{ count: paymentProof }] = await paymentProofQuery;

            // 10. Visa Letters (student_letters with student_visa = 1)
            let visaLettersQuery = db.knex('student_letters')
                .count('* as count')
                .where('student_visa', 1);
            visaLettersQuery = applySessionFilter(visaLettersQuery, 'student_letters');
            const [{ count: visaLetters }] = await visaLettersQuery;

            // 11. Pickup Scheduled (student_letters with pickup = 1)
            let pickupScheduledQuery = db.knex('student_letters')
                .count('* as count')
                .where('pickup', 1);
            pickupScheduledQuery = applySessionFilter(pickupScheduledQuery, 'student_letters');
            const [{ count: pickupScheduled }] = await pickupScheduledQuery;

            // 12. Enrolled (choice fillings with payment_status = 'Acknowledged' or final status)
            let enrolledQuery = db.knex('student_choice_fillings')
                .count('* as count')
                .whereIn('payment_status', ['Acknowledged', 'Completed', 'Verified']);
            enrolledQuery = applySessionFilter(enrolledQuery, 'student_choice_fillings');
            const [{ count: enrolled }] = await enrolledQuery;

            return {
                success: true,
                session_filter: sessionInfo ? { 
                    session, 
                    session_id: sessionId,
                    date_range: {
                        start: sessionInfo.session_startdt,
                        end: sessionInfo.session_enddt
                    }
                } : null,
                student_scoreboard: {
                    total_students: Number(totalStudents || 0),
                    registration_completed: Number(registrationCompleted || 0),
                    basic_info_completed: Number(basicInfoCompleted || 0),
                    educational_info_completed: Number(educationalInfoCompleted || 0),
                    background_info_completed: Number(backgroundInfoCompleted || 0),
                    choice_filling_completed: Number(choiceFillingCompleted || 0),
                    admission_offered: Number(admissionOffered || 0),
                    offer_accepted: Number(offerAccepted || 0),
                    payment_proof: Number(paymentProof || 0),
                    visa_letters: Number(visaLetters || 0),
                    pickup_scheduled: Number(pickupScheduled || 0),
                    enrolled: Number(enrolled || 0)
                }
            };
        } catch (error) {
            console.error('Error in getStudentScoreboardCorrected:', error);
            throw new Error('Failed to fetch corrected student scoreboard data');
        }
    }

    static getInstituteAcceptanceStats = async (req) => {
        try {
            const { session } = req.query || {};
            
            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);
            
            let query = db.knex
                .select(
                    'i.id as institute_id',
                    'i.name as institute_name',
                    'i.type as institute_type',
                    'i.city',
                    'i.state_id',
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as accepted_students'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Rejected" THEN 1 END) as rejected_students'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Pending" THEN 1 END) as pending_students'),
                    db.knex.raw('COUNT(*) as total_applications')
                )
                .from('student_choice_fillings as scf')
                .join('institute_courses as ic', 'scf.institute_course_id', 'ic.id')
                .join('institutes as i', 'ic.institute_id', 'i.id');

            // Apply session filter on scf.created date
            query = this.applySessionFilter(query, sessionDateRange, 'scf.created');

            const result = await query
                .groupBy('i.id', 'i.name', 'i.type', 'i.city', 'i.state_id')
                .orderBy('accepted_students', 'desc');

            return {
                success: true,
                data: result,
                total_institutes: result.length,
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null,
                summary: {
                    total_accepted: result.reduce((sum, item) => sum + (item.accepted_students || 0), 0),
                    total_rejected: result.reduce((sum, item) => sum + (item.rejected_students || 0), 0),
                    total_pending: result.reduce((sum, item) => sum + (item.pending_students || 0), 0),
                    total_applications: result.reduce((sum, item) => sum + (item.total_applications || 0), 0)
                }
            };
        } catch (error) {
            console.error('Error in getInstituteAcceptanceStats:', error);
            throw new Error('Failed to fetch institute acceptance statistics');
        }
    }

    static getInstituteEmailsSent = async (req) => {
        try {
            const { institute_id } = req.params || {};
            if (!institute_id) {
                throw new Error('Institute ID is required');
            }

            const { session } = req.query || {};

            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);

            let query = db.knex('student_sent_emails')
                .count('* as emails_sent')
                .where({ institute_id });

            // Apply session filter on created date
            query = this.applySessionFilter(query, sessionDateRange, 'created');

            const row = await query.first();

            return {
                success: true,
                data: { emails_sent: parseInt(row?.emails_sent, 10) || 0 },
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getInstituteEmailsSent:', error);
            throw new Error('Failed to fetch institute emails sent count');
        }
    }

    static getInstituteWhatsappsSent = async (req) => {
        try {
            const { institute_id } = req.params || {};
            if (!institute_id) {
                throw new Error('Institute ID is required');
            }

            const { session } = req.query || {};

            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);

            let query = db.knex('leads_sent_whatsapp')
                .count('* as whatsapps_sent')
                .where({ institute_id });

            // Apply session filter on created date
            query = this.applySessionFilter(query, sessionDateRange, 'created');

            const row = await query.first();

            return {
                success: true,
                data: { whatsapps_sent: parseInt(row?.whatsapps_sent, 10) || 0 },
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getInstituteWhatsappsSent:', error);
            throw new Error('Failed to fetch institute WhatsApp sent count');
        }
    }

    static getInstituteCourseWiseSummary = async (req) => {
        try {
            const { institute_id } = req.params || {};
            if (!institute_id) {
                throw new Error('Institute ID is required');
            }

            const { session } = req.query || {};

            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);

            // Get course-wise detailed statistics for an institute
            let courseQuery = db.knex
                .select(
                    'ic.id as course_id',
                    'sp.name as course_name',
                    'sp.id as specialization_id',
                    db.knex.raw('COUNT(DISTINCT scf.student_id) as unique_students'),
                    db.knex.raw('COUNT(*) as total_applications'),
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Accepted" THEN 1 END) as admission_offered'),
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Rejected" THEN 1 END) as admission_rejected'),
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Pending" THEN 1 END) as admission_pending'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as accepted_by_student'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Rejected" THEN 1 END) as rejected_by_student'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Pending" THEN 1 END) as student_pending'),
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status = "Uploaded" THEN 1 END) as payment_proof_uploaded'),
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status = "Acknowledged" THEN 1 END) as payment_acknowledged'),
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status = "Rejected" THEN 1 END) as payment_rejected'),
                    db.knex.raw('COUNT(CASE WHEN scf.offer_letter_file_id IS NOT NULL THEN 1 END) as offer_letters_sent'),
                    db.knex.raw('COUNT(CASE WHEN scf.adm_status = "Approved" THEN 1 END) as admin_approved'),
                    db.knex.raw('COUNT(CASE WHEN scf.adm_status = "Rejected" THEN 1 END) as admin_rejected'),
                    db.knex.raw('COUNT(CASE WHEN scf.adm_status = "Pending" THEN 1 END) as admin_pending')
                )
                .from('institute_courses as ic')
                .leftJoin('master_specializations as sp', 'ic.specialization_id', 'sp.id')
                .leftJoin('student_choice_fillings as scf', 'ic.id', 'scf.institute_course_id')
                .where('ic.institute_id', institute_id)
                .groupBy('ic.id', 'sp.name', 'sp.id');

            // Apply session filter on scf.created date
            courseQuery = this.applySessionFilter(courseQuery, sessionDateRange, 'scf.created');

            const courseStats = await courseQuery.orderBy('total_applications', 'desc');

            // Calculate summary statistics
            const summary = {
                total_courses: courseStats.length,
                total_applications: courseStats.reduce((sum, course) => sum + (course.total_applications || 0), 0),
                total_unique_students: courseStats.reduce((sum, course) => sum + (course.unique_students || 0), 0),
                total_admission_offered: courseStats.reduce((sum, course) => sum + (course.admission_offered || 0), 0),
                total_accepted_by_student: courseStats.reduce((sum, course) => sum + (course.accepted_by_student || 0), 0),
                total_payment_proof_uploaded: courseStats.reduce((sum, course) => sum + (course.payment_proof_uploaded || 0), 0)
            };

            return {
                success: true,
                data: courseStats,
                summary: summary,
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getInstituteCourseWiseSummary:', error);
            throw new Error('Failed to fetch institute course-wise summary');
        }
    }

    static getInstituteCountryWiseSummary = async (req) => {
        try {
            const { institute_id } = req.params || {};
            if (!institute_id) {
                throw new Error('Institute ID is required');
            }

            const { session } = req.query || {};

            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);

            // Get country-wise student statistics for an institute
            let countryQuery = db.knex
                .select(
                    'c.id as country_id',
                    'c.name as country_name',
                    'c.code as country_code',
                    'c.code3 as country_code3',
                    'c.isd_code',
                    'c.country_group',
                    db.knex.raw('COUNT(DISTINCT s.id) as unique_students'),
                    db.knex.raw('COUNT(*) as total_applications'),
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Accepted" THEN 1 END) as admission_offered'),
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Rejected" THEN 1 END) as admission_rejected'),
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Pending" THEN 1 END) as admission_pending'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as accepted_by_student'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Rejected" THEN 1 END) as rejected_by_student'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Pending" THEN 1 END) as student_pending'),
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status = "Uploaded" THEN 1 END) as payment_proof_uploaded'),
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status = "Acknowledged" THEN 1 END) as payment_acknowledged'),
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status = "Rejected" THEN 1 END) as payment_rejected'),
                    db.knex.raw('COUNT(CASE WHEN scf.offer_letter_file_id IS NOT NULL THEN 1 END) as offer_letters_sent'),
                    db.knex.raw('COUNT(CASE WHEN scf.adm_status = "Approved" THEN 1 END) as admin_approved'),
                    db.knex.raw('COUNT(CASE WHEN scf.adm_status = "Rejected" THEN 1 END) as admin_rejected'),
                    db.knex.raw('COUNT(CASE WHEN scf.adm_status = "Pending" THEN 1 END) as admin_pending')
                )
                .from('student_choice_fillings as scf')
                .join('institute_courses as ic', 'scf.institute_course_id', 'ic.id')
                .join('students as s', 'scf.student_id', 's.id')
                .join('master_countries as c', 's.country_id', 'c.id')
                .where('ic.institute_id', institute_id)
                .groupBy('c.id', 'c.name', 'c.code', 'c.code3', 'c.isd_code', 'c.country_group');

            // Apply session filter on scf.created date
            countryQuery = this.applySessionFilter(countryQuery, sessionDateRange, 'scf.created');

            const countryStats = await countryQuery.orderBy('unique_students', 'desc');

            // Calculate summary statistics
            const summary = {
                total_countries: countryStats.length,
                total_unique_students: countryStats.reduce((sum, country) => sum + (country.unique_students || 0), 0),
                total_applications: countryStats.reduce((sum, country) => sum + (country.total_applications || 0), 0),
                total_admission_offered: countryStats.reduce((sum, country) => sum + (country.admission_offered || 0), 0),
                total_accepted_by_student: countryStats.reduce((sum, country) => sum + (country.accepted_by_student || 0), 0),
                total_payment_proof_uploaded: countryStats.reduce((sum, country) => sum + (country.payment_proof_uploaded || 0), 0)
            };

            return {
                success: true,
                data: countryStats,
                summary: summary,
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getInstituteCountryWiseSummary:', error);
            throw new Error('Failed to fetch institute country-wise summary');
        }
    }

    static getInstituteSummary = async (req) => {
        try {
            const { institute_id } = req.params || {};
            if (!institute_id) {
                throw new Error('Institute ID is required');
            }

            const { session } = req.query || {};

            const sessionDateRange = await this.getSessionDateRange(session);

            const baseQuery = this.applySessionFilter(
                db.knex('student_choice_fillings as scf')
                    .join('institute_courses as ic', 'scf.institute_course_id', 'ic.id')
                    .where('ic.institute_id', institute_id),
                sessionDateRange,
                'scf.created'
            );

            const aggregated = await baseQuery.clone()
                .select(
                    db.knex.raw('COUNT(*) as choice_filled'),
                    db.knex.raw('SUM(CASE WHEN scf.ins_status = "Accepted" THEN 1 ELSE 0 END) as admission_offered'),
                    db.knex.raw('SUM(CASE WHEN scf.ins_status = "Rejected" THEN 1 ELSE 0 END) as admission_rejected'),
                    db.knex.raw('SUM(CASE WHEN scf.stu_status = "Accepted" THEN 1 ELSE 0 END) as accepted_by_student'),
                    db.knex.raw('SUM(CASE WHEN scf.stu_status = "Rejected" THEN 1 ELSE 0 END) as rejected_by_student'),
                    db.knex.raw('SUM(CASE WHEN scf.payment_status IN ("Uploaded", "Acknowledged") THEN 1 ELSE 0 END) as enrolled'),
                    db.knex.raw('SUM(CASE WHEN scf.payment_slip_file_id IS NOT NULL THEN 1 ELSE 0 END) as payment_proof_uploaded')
                )
                .first();

            const choiceFilledRow = await baseQuery.clone()
                .join('users as u', 'u.id', 'scf.student_id')
                .where('u.status', 1)
                .andWhereNot('scf.adm_status', 'Pending')
                .countDistinct({ total_students_filled: 'scf.student_id' })
                .first();

            const data = aggregated || {};

            return {
                success: true,
                data: {
                    choice_filled: parseInt(choiceFilledRow?.total_students_filled, 10) || 0,
                    admission_offered: parseInt(data.admission_offered, 10) || 0,
                    admission_rejected: parseInt(data.admission_rejected, 10) || 0,
                    accepted_by_student: parseInt(data.accepted_by_student, 10) || 0,
                    rejected_by_student: parseInt(data.rejected_by_student, 10) || 0,
                    enrolled: parseInt(data.enrolled, 10) || 0,
                    payment_proof_uploaded: parseInt(data.payment_proof_uploaded, 10) || 0
                },
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getInstituteSummary:', error);
            throw new Error('Failed to fetch institute summary');
        }
    }

    static getOverallStats = async (req) => {
        try {
            const { session } = req.query || {};
            
            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);
            
            let query = db.knex
                .select(
                    db.knex.raw('COUNT(DISTINCT scf.student_id) as total_students'),
                    db.knex.raw('COUNT(DISTINCT ic.institute_id) as total_institutes'),
                    db.knex.raw('COUNT(DISTINCT scf.institute_course_id) as total_courses'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as total_accepted'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Rejected" THEN 1 END) as total_rejected'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Pending" THEN 1 END) as total_pending')
                )
                .from('student_choice_fillings as scf')
                .join('institute_courses as ic', 'scf.institute_course_id', 'ic.id');

            // Apply session filter on scf.created date
            query = this.applySessionFilter(query, sessionDateRange, 'scf.created');

            const overallStats = await query.first();

            return {
                success: true,
                data: overallStats,
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getOverallStats:', error);
            throw new Error('Failed to fetch overall statistics');
        }
    }

    static getStatusBreakdown = async (req) => {
        try {
            const { session } = req.query || {};
            
            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);
            
            let query = db.knex
                .select(
                    db.knex.raw('DATE_FORMAT(scf.stu_status_dt, "%Y-%m") as month'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as accepted'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Rejected" THEN 1 END) as rejected'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Pending" THEN 1 END) as pending')
                )
                .from('student_choice_fillings as scf')
                .whereNotNull('scf.stu_status_dt');

            // Apply session filter on scf.created date
            query = this.applySessionFilter(query, sessionDateRange, 'scf.created');

            const statusBreakdown = await query
                .groupBy(db.knex.raw('DATE_FORMAT(scf.stu_status_dt, "%Y-%m")'))
                .orderBy('month', 'desc')
                .limit(12);

            return {
                success: true,
                data: statusBreakdown,
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getStatusBreakdown:', error);
            throw new Error('Failed to fetch status breakdown');
        }
    }

    static getGenderRatio = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error('Only super admin can access this endpoint');
        }

        try {
            const { session } = req.query || {};
            
            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);
            
            let query = db.knex('students as s')
                .leftJoin('master_genders as mg', 'mg.id', 's.gender_id')
                .select([
                    db.knex.raw("COALESCE(mg.name, 'Unknown') as gender"),
                    db.knex.raw('COUNT(*) as count')
                ]);

            // Apply session filter on s.created date
            query = this.applySessionFilter(query, sessionDateRange, 's.created');

            const rows = await query.groupBy(db.knex.raw("COALESCE(mg.name, 'Unknown')"));

            const total = rows.reduce((sum, r) => sum + Number(r.count || 0), 0);
            const data = rows.map(r => ({
                gender: r.gender,
                count: Number(r.count || 0),
                percentage: total ? Math.round((Number(r.count || 0) / total) * 100) : 0
            }));

            return {
                success: true,
                data,
                summary: { total },
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getGenderRatio:', error);
            throw new Error('Failed to fetch gender ratio');
        }
    }

    static getUserStats = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error('Only super admin can access this endpoint');
        }

        try {
            const { session } = req.query || {};
            
            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);
            
            let query = db.knex('users')
                .select([
                    'type',
                    db.knex.raw('COUNT(*) as count'),
                    db.knex.raw('COUNT(CASE WHEN status = 1 THEN 1 END) as active_count'),
                    db.knex.raw('COUNT(CASE WHEN status = 0 THEN 1 END) as inactive_count')
                ]);

            // Apply session filter on created date
            query = this.applySessionFilter(query, sessionDateRange, 'created');

            const rows = await query.groupBy('type');

            const total = rows.reduce((sum, r) => sum + Number(r.count || 0), 0);
            const data = rows.map(r => ({
                type: r.type,
                count: Number(r.count || 0),
                active_count: Number(r.active_count || 0),
                inactive_count: Number(r.inactive_count || 0),
                percentage: total ? Math.round((Number(r.count || 0) / total) * 100) : 0
            }));

            return {
                success: true,
                data,
                summary: { total },
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getUserStats:', error);
            throw new Error('Failed to fetch user statistics');
        }
    }

    static getStudentIssuesStats = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error('Only super admin can access this endpoint');
        }

        try {
            const { session } = req.query || {};
            
            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);
            
            let query = db.knex('student_issues as si')
                .select([
                    'si.status as status',
                    db.knex.raw('COUNT(*) as count')
                ]);

            // Apply session filter on si.created date
            query = this.applySessionFilter(query, sessionDateRange, 'si.created');

            const rows = await query.groupBy('si.status');

            // Normalize to include all statuses even if zero
            const statuses = ['Open', 'In Process', 'Closed'];
            const map = Object.fromEntries(rows.map(r => [r.status, Number(r.count || 0)]));
            const data = statuses.map(s => ({ status: s, count: map[s] || 0 }));
            const total = data.reduce((sum, r) => sum + r.count, 0);

            return {
                success: true,
                data,
                summary: { total },
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getStudentIssuesStats:', error);
            throw new Error('Failed to fetch student issues statistics');
        }
    }

    static getStudentAgeRangeStats = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error('Only super admin can access this endpoint');
        }

        try {
            const { session } = req.query || {};

            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);

            // Compute age in years and bucket into ranges
            const ageExpr = db.knex.raw('TIMESTAMPDIFF(YEAR, s.dob, CURDATE())');

            let query = db.knex('students as s')
                .select([
                    db.knex.raw(`SUM(CASE WHEN s.dob IS NULL THEN 1 ELSE 0 END) as unknown`),
                    db.knex.raw(`SUM(CASE WHEN s.dob IS NOT NULL AND ${ageExpr} < 18 THEN 1 ELSE 0 END) as under_18`),
                    db.knex.raw(`SUM(CASE WHEN s.dob IS NOT NULL AND ${ageExpr} BETWEEN 18 AND 21 THEN 1 ELSE 0 END) as _18_21`),
                    db.knex.raw(`SUM(CASE WHEN s.dob IS NOT NULL AND ${ageExpr} BETWEEN 22 AND 25 THEN 1 ELSE 0 END) as _22_25`),
                    db.knex.raw(`SUM(CASE WHEN s.dob IS NOT NULL AND ${ageExpr} BETWEEN 26 AND 30 THEN 1 ELSE 0 END) as _26_30`),
                    db.knex.raw(`SUM(CASE WHEN s.dob IS NOT NULL AND ${ageExpr} BETWEEN 31 AND 35 THEN 1 ELSE 0 END) as _31_35`),
                    db.knex.raw(`SUM(CASE WHEN s.dob IS NOT NULL AND ${ageExpr} BETWEEN 36 AND 40 THEN 1 ELSE 0 END) as _36_40`),
                    db.knex.raw(`SUM(CASE WHEN s.dob IS NOT NULL AND ${ageExpr} > 40 THEN 1 ELSE 0 END) as above_40`)
                ]);

            // Apply session filter on s.created date
            query = this.applySessionFilter(query, sessionDateRange, 's.created');

            const row = await query.first();

            const data = [
                { range: 'Under 18', count: Number(row?.under_18 || 0) },
                { range: '18-21', count: Number(row?._18_21 || 0) },
                { range: '22-25', count: Number(row?._22_25 || 0) },
                { range: '26-30', count: Number(row?._26_30 || 0) },
                { range: '31-35', count: Number(row?._31_35 || 0) },
                { range: '36-40', count: Number(row?._36_40 || 0) },
                { range: 'Above 40', count: Number(row?.above_40 || 0) },
                { range: 'Unknown', count: Number(row?.unknown || 0) }
            ];

            const total = data.reduce((sum, b) => sum + b.count, 0);
            const withPercent = data.map(b => ({
                ...b,
                percentage: total ? Math.round((b.count / total) * 100) : 0
            }));

            return {
                success: true,
                data: withPercent,
                summary: { total },
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getStudentAgeRangeStats:', error);
            throw new Error('Failed to fetch student age range stats');
        }
    }

    static getTopInstitutes = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error('Only super admin can access this endpoint');
        }

        try {
            const { session } = req.query || {};

            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);

            // Aggregate institute performance metrics
            let query = db.knex
                .select([
                    'i.id as institute_id',
                    'i.name as institute_name',
                    'i.type as institute_type',
                    'i.city',
                    'i.state_id',
                    db.knex.raw('COUNT(*) as total_applications'),
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Accepted" THEN 1 END) as admission_offered'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as accepted_by_student'),
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status IN ("Uploaded", "Acknowledged") THEN 1 END) as enrolled')
                ])
                .from('student_choice_fillings as scf')
                .join('institute_courses as ic', 'scf.institute_course_id', 'ic.id')
                .join('institutes as i', 'ic.institute_id', 'i.id')
                .groupBy('i.id', 'i.name', 'i.type', 'i.city', 'i.state_id');

            // Apply session filter on scf.created date
            query = this.applySessionFilter(query, sessionDateRange, 'scf.created');

            const rows = await query
                .orderBy([{ column: 'enrolled', order: 'desc' }, { column: 'admission_offered', order: 'desc' }])
                .limit(10);

            const data = rows.map(r => {
                const applications = Number(r.total_applications || 0);
                const offered = Number(r.admission_offered || 0);
                const accepted = Number(r.accepted_by_student || 0);
                const enrolled = Number(r.enrolled || 0);

                const toPct = (num, den) => (den ? Math.round((num / den) * 100) : 0);

                return {
                    institute_id: r.institute_id,
                    institute_name: r.institute_name,
                    institute_type: r.institute_type,
                    city: r.city,
                    state_id: r.state_id,
                    total_applications: applications,
                    admission_offered: offered,
                    accepted_by_student: accepted,
                    enrolled: enrolled,
                    offer_rate: toPct(offered, applications),
                    acceptance_rate: toPct(accepted, applications),
                    enrollment_rate: toPct(enrolled, applications)
                };
            });

            return {
                success: true,
                data,
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getTopInstitutes:', error);
            throw new Error('Failed to fetch top institutes stats');
        }
    }

    static getTopCountries = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error('Only super admin can access this endpoint');
        }

        try {
            const { session } = req.query || {};

            // Get session date range if session is provided
            const sessionDateRange = await this.getSessionDateRange(session);

            // Country performance based on originating student country
            let query = db.knex
                .select([
                    'c.id as country_id',
                    'c.name as country_name',
                    'c.code as country_code',
                    'c.code3 as country_code3',
                    db.knex.raw('COUNT(*) as total_applications'),
                    db.knex.raw('COUNT(CASE WHEN scf.ins_status = "Accepted" THEN 1 END) as admission_offered'),
                    db.knex.raw('COUNT(CASE WHEN scf.stu_status = "Accepted" THEN 1 END) as accepted_by_student'),
                    db.knex.raw('COUNT(CASE WHEN scf.payment_status IN ("Uploaded", "Acknowledged") THEN 1 END) as enrolled')
                ])
                .from('student_choice_fillings as scf')
                .join('students as s', 's.id', 'scf.student_id')
                .join('master_countries as c', 'c.id', 's.country_id')
                .groupBy('c.id', 'c.name', 'c.code', 'c.code3');

            // Apply session filter on scf.created date
            query = this.applySessionFilter(query, sessionDateRange, 'scf.created');

            const rows = await query
                .orderBy([{ column: 'enrolled', order: 'desc' }, { column: 'admission_offered', order: 'desc' }])
                .limit(10);

            const data = rows.map(r => {
                const applications = Number(r.total_applications || 0);
                const offered = Number(r.admission_offered || 0);
                const accepted = Number(r.accepted_by_student || 0);
                const enrolled = Number(r.enrolled || 0);
                const toPct = (num, den) => (den ? Math.round((num / den) * 100) : 0);
                return {
                    country_id: r.country_id,
                    country_name: r.country_name,
                    country_code: r.country_code,
                    country_code3: r.country_code3,
                    total_applications: applications,
                    admission_offered: offered,
                    accepted_by_student: accepted,
                    enrolled: enrolled,
                    offer_rate: toPct(offered, applications),
                    acceptance_rate: toPct(accepted, applications),
                    enrollment_rate: toPct(enrolled, applications)
                };
            });

            return {
                success: true,
                data,
                session_filter: sessionDateRange ? {
                    session,
                    date_range: sessionDateRange
                } : null
            };
        } catch (error) {
            console.error('Error in getTopCountries:', error);
            throw new Error('Failed to fetch top countries stats');
        }
    }

    static async getStudentsByFilter(req) {
        try {
            const { filter, session, page = 1, page_size = 20, search } = req.query || {};
            
            if (!filter) {
                throw new Error('Filter parameter is required');
            }

            // Get session ID for filtering
            let sessionId = null;
            let sessionInfo = null;
            
            if (session) {
                if (/^\d+$/.test(session)) {
                    sessionId = parseInt(session);
                    sessionInfo = await db.knex("master_session")
                        .select(['id', 'session_startdt', 'session_enddt'])
                        .where({ id: sessionId })
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
                        sessionId = sessionInfo?.id;
                    }
                }
            }

            // Base query for students
            let query = db.knex('students as s')
                .select([
                    's.id',
                    's.regno',
                    's.master_session_id',
                    's.created',
                    's.basic_info_date',
                    's.edu_info_date',
                    's.doc_uploaded_on',
                    's.course_choice_date',
                    's.dob',
                    's.father_name',
                    's.mother_name',
                    'u.name as student_name',
                    'u.email as student_email',
                    'u.mobile as student_mobile',
                    'u.status as user_status',
                    'mc.name as country_name',
                    'md.name as discipline_name',
                    'mg.name as gender_name'
                ])
                .leftJoin('users as u', 'u.id', 's.user_id')
                .leftJoin('master_countries as mc', 'mc.id', 's.country_id')
                .leftJoin('master_disciplines as md', 'md.id', 's.discipline_id')
                .leftJoin('master_genders as mg', 'mg.id', 's.gender_id');

            // Apply session filter
            if (sessionId) {
                query = query.where('s.master_session_id', sessionId);
            }

            // Apply specific filter based on the filter parameter
            switch (filter) {
                case 'registration_completed':
                    query = query.whereNotNull('s.created');
                    break;
                    
                case 'basic_info_completed':
                    query = query.whereNotNull('s.basic_info_date');
                    break;
                    
                case 'educational_info_completed':
                    query = query.whereNotNull('s.edu_info_date');
                    break;
                    
                case 'background_info_completed':
                    query = query.whereNotNull('s.doc_uploaded_on');
                    break;
                    
                case 'choice_filling_completed':
                    query = query.whereNotNull('s.course_choice_date');
                    break;
                    
                case 'admission_offered':
                    query = query
                        .join('student_choice_fillings as scf', 's.id', 'scf.student_id')
                        .where('scf.ins_status', 'Accepted')
                        .whereNotNull('scf.ins_status_dt')
                        .select([
                            's.id',
                            's.regno',
                            's.master_session_id',
                            's.created',
                            'u.name as student_name',
                            'u.email as student_email',
                            'u.mobile as student_mobile',
                            'scf.ins_status',
                            'scf.ins_status_dt',
                            'i.name as institute_name',
                            'ms.name as specialization_name'
                        ])
                        .leftJoin('institute_courses as ic', 'ic.id', 'scf.institute_course_id')
                        .leftJoin('institutes as i', 'i.id', 'ic.institute_id')
                        .leftJoin('master_specializations as ms', 'ms.id', 'ic.specialization_id');
                    break;
                    
                case 'offer_accepted':
                    query = query
                        .join('student_choice_fillings as scf', 's.id', 'scf.student_id')
                        .where('scf.stu_status', 'Accepted')
                        .whereNotNull('scf.stu_status_dt')
                        .select([
                            's.id',
                            's.regno',
                            's.master_session_id',
                            's.created',
                            'u.name as student_name',
                            'u.email as student_email',
                            'u.mobile as student_mobile',
                            'scf.stu_status',
                            'scf.stu_status_dt',
                            'i.name as institute_name',
                            'ms.name as specialization_name'
                        ])
                        .leftJoin('institute_courses as ic', 'ic.id', 'scf.institute_course_id')
                        .leftJoin('institutes as i', 'i.id', 'ic.institute_id')
                        .leftJoin('master_specializations as ms', 'ms.id', 'ic.specialization_id');
                    break;
                    
                case 'payment_proof':
                    query = query
                        .join('student_choice_fillings as scf', 's.id', 'scf.student_id')
                        .whereNotNull('scf.payment_slip_file_id')
                        .whereNotNull('scf.payment_slip_dt')
                        .where('scf.payment_slip_file_id', '!=', '')
                        .select([
                            's.id',
                            's.regno',
                            's.master_session_id',
                            's.created',
                            'u.name as student_name',
                            'u.email as student_email',
                            'u.mobile as student_mobile',
                            'scf.payment_status',
                            'scf.payment_slip_dt',
                            'i.name as institute_name',
                            'ms.name as specialization_name'
                        ])
                        .leftJoin('institute_courses as ic', 'ic.id', 'scf.institute_course_id')
                        .leftJoin('institutes as i', 'i.id', 'ic.institute_id')
                        .leftJoin('master_specializations as ms', 'ms.id', 'ic.specialization_id');
                    break;
                    
                case 'visa_letters':
                    query = query
                        .join('student_letters as sl', 's.id', 'sl.student_id')
                        .where('sl.student_visa', 1)
                        .select([
                            's.id',
                            's.regno',
                            's.master_session_id',
                            's.created',
                            'u.name as student_name',
                            'u.email as student_email',
                            'u.mobile as student_mobile',
                            'sl.created as letter_created'
                        ]);
                    break;
                    
                case 'pickup_scheduled':
                    query = query
                        .join('student_letters as sl', 's.id', 'sl.student_id')
                        .where('sl.pickup', 1)
                        .select([
                            's.id',
                            's.regno',
                            's.master_session_id',
                            's.created',
                            'u.name as student_name',
                            'u.email as student_email',
                            'u.mobile as student_mobile',
                            'sl.created as letter_created'
                        ]);
                    break;
                    
                case 'enrolled':
                    query = query
                        .join('student_choice_fillings as scf', 's.id', 'scf.student_id')
                        .whereIn('scf.payment_status', ['Acknowledged', 'Completed', 'Verified'])
                        .select([
                            's.id',
                            's.regno',
                            's.master_session_id',
                            's.created',
                            'u.name as student_name',
                            'u.email as student_email',
                            'u.mobile as student_mobile',
                            'scf.payment_status',
                            'i.name as institute_name',
                            'ms.name as specialization_name'
                        ])
                        .leftJoin('institute_courses as ic', 'ic.id', 'scf.institute_course_id')
                        .leftJoin('institutes as i', 'i.id', 'ic.institute_id')
                        .leftJoin('master_specializations as ms', 'ms.id', 'ic.specialization_id');
                    break;
                    
                default:
                    throw new Error(`Invalid filter: ${filter}. Valid filters are: registration_completed, basic_info_completed, educational_info_completed, background_info_completed, choice_filling_completed, admission_offered, offer_accepted, payment_proof, visa_letters, pickup_scheduled, enrolled`);
            }

            // Apply search filter
            if (search) {
                query = query.where((qb) => {
                    qb.where('u.name', 'like', `%${search}%`)
                      .orWhere('u.email', 'like', `%${search}%`)
                      .orWhere('s.regno', 'like', `%${search}%`)
                      .orWhere('u.mobile', 'like', `%${search}%`);
                });
            }

            // Order by most recent
            query = query.orderBy('s.created', 'desc');

            // Apply pagination
            const result = await db.pagedRows(query, page, page_size);

            return {
                success: true,
                filter,
                session_filter: sessionInfo ? { 
                    session, 
                    session_id: sessionId,
                    date_range: {
                        start: sessionInfo.session_startdt,
                        end: sessionInfo.session_enddt
                    }
                } : null,
                ...result
            };
        } catch (error) {
            console.error('Error in getStudentsByFilter:', error);
            throw new Error(error.message || 'Failed to fetch filtered students');
        }
    }
}

module.exports = DashboardService;
