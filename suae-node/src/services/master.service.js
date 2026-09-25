const db = require("../libraries/db");
const { trim, currentDT } = require("../util/common.util");

class MasterService {
    static countries = async (req) => {
        const { k = '' } = trim(req.query || {});
        const rs = await db.knex("master_countries as mc")
            .leftJoin("master_currencies as cur", "cur.id", "mc.currency_id")
            .select([
                'mc.id',
                'mc.name',
                'mc.code as iso2',
                'mc.code3 as iso3',
                'mc.isd_code as phone_code',
                'mc.status',
                'mc.currency_id',
                'cur.name as currency',
                'cur.full_name as currency_full_name'
            ])
            .where((qb) => {
                if (k.length) {
                    qb.where('mc.name', 'like', `%${k}%`);
                }
            })
            .orderBy("mc.id");
        return rs || [];
    }

    static states = async (req) => {
        const { k = '', status = '' } = trim(req.query || {});
        const rs = await db.knex("master_states")
            .select(['id', 'name', 'code'])
            .where((qb) => {
                if (status.length) {
                    qb.where({ status });
                }
                if (k.length) {
                    qb.where('name', 'like', `%${k}%`);
                }
            })
            .orderBy("id");

        return rs || [];
    }

    static ensureSuperAdmin(req) {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error("Only super admin can access this endpoint");
        }
    }

    static ensureSuperAdminOrInstitute(req) {
        const { isClient, isInstitute } = req.currentUser || {};
        if (!isClient && !isInstitute) {
            throw new Error("Only super admin or institute can access this endpoint");
        }
    }

    static sessions = async (req) => {
        const { k = '', status = '' } = trim(req.query || {});
        const rs = await db.knex("master_session")
            .select(['id', 'session_startdt', 'session_enddt', 'status', 'created', 'updated'])
            .where((qb) => {
                if (status.length) {
                    qb.where({ status });
                }
                if (k.length) {
                    qb.where('session_startdt', 'like', `%${k}%`)
                      .orWhere('session_enddt', 'like', `%${k}%`);
                }
            })
            .orderBy("id");

        return rs || [];
    }

    static validateSessionDates = async (session_startdt, session_enddt, excludeId = null) => {
        // Check if start date is after end date
        if (new Date(session_startdt) >= new Date(session_enddt)) {
            throw new Error('Session start date must be before session end date');
        }

        // Check for overlapping sessions
        let query = db.knex("master_session")
            .where((qb) => {
                qb.where('session_startdt', '<=', session_enddt)
                  .andWhere('session_enddt', '>=', session_startdt);
            });

        // Exclude current session when updating
        if (excludeId) {
            query = query.whereNot('id', excludeId);
        }

        const overlappingSessions = await query;
        
        if (overlappingSessions.length > 0) {
            const overlapping = overlappingSessions[0];
            throw new Error(
                `Session cannot be created: dates overlap with existing session (${overlapping.session_startdt} to ${overlapping.session_enddt}). ` +
                'New session must start after the previous session ends.'
            );
        }
    }

    static createSession = async (req) => {
        this.ensureSuperAdmin(req);
        const { session_startdt, session_enddt, status = 1 } = trim(req.body || {});
        
        if (!session_startdt) {
            throw new Error('Session start date is required');
        }
        if (!session_enddt) {
            throw new Error('Session end date is required');
        }

        // Validate session dates for overlaps
        await this.validateSessionDates(session_startdt, session_enddt);

        const insertedSession = await db.knex("master_session")
            .insert({
                session_startdt,
                session_enddt,
                status,
                created: currentDT(),
                updated: currentDT()
            })
            .returning(['id', 'session_startdt', 'session_enddt', 'status', 'created', 'updated']);

        return insertedSession[0];
    }

    static updateSession = async (req) => {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        const { session_startdt, session_enddt, status } = trim(req.body || {});
        
        if (!id) {
            throw new Error('Session ID is required');
        }

        const updateData = { updated: currentDT() };
        if (session_startdt) updateData.session_startdt = session_startdt;
        if (session_enddt) updateData.session_enddt = session_enddt;
        if (status !== undefined) updateData.status = status;

        // If dates are being updated, validate for overlaps
        if (session_startdt || session_enddt) {
            // Get current session data to use for validation
            const [currentSession] = await db.knex("master_session")
                .where({ id })
                .select(['session_startdt', 'session_enddt']);
            
            if (!currentSession) {
                throw new Error('Session not found');
            }

            const newStartDt = session_startdt || currentSession.session_startdt;
            const newEndDt = session_enddt || currentSession.session_enddt;
            
            await this.validateSessionDates(newStartDt, newEndDt, id);
        }

        const updatedSession = await db.knex("master_session")
            .where({ id })
            .update(updateData)
            .returning(['id', 'session_startdt', 'session_enddt', 'status', 'created', 'updated']);

        if (!updatedSession || updatedSession.length === 0) {
            throw new Error('Session not found');
        }

        return updatedSession[0];
    }

    static deleteSession = async (req) => {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        
        if (!id) {
            throw new Error('Session ID is required');
        }

        const deleted = await db.knex("master_session")
            .where({ id })
            .del();

        if (!deleted) {
            throw new Error('Session not found');
        }

        return { message: 'Session deleted successfully' };
    }

    static getSessionById = async (req) => {
        this.ensureSuperAdminOrInstitute(req);
        const { id } = req.params;
        
        if (!id) {
            throw new Error('Session ID is required');
        }

        const sessionData = await db.knex("master_session")
            .select(['id', 'session_startdt', 'session_enddt', 'status', 'created', 'updated'])
            .where({ id });

        if (!sessionData || sessionData.length === 0) {
            throw new Error('Session not found');
        }

        return sessionData[0];
    }

    static getInstituteCourses = async (req) => {
        this.ensureSuperAdmin(req);
        const { institute_id } = req.params;
        const { session, show_all = false } = req.query || {};
        
        if (!institute_id) {
            throw new Error('Institute ID is required');
        }

        let query = db.knex("institute_courses as ic")
            .select([
                'ic.id',
                'ic.institute_id',
                'ic.specialization_id',
                'ic.eligibility_creteria',
                'ic.nonsaarc_currency',
                'ic.nri_currency',
                'ic.indian_currency',
                'ic.saarc_currency',
                'ic.saarc_package_incentive1',
                'ic.status',
                'ic.created',
                'ic.updated',
                'ic.Mode_of_course',
                'ic.session',
                'sp.name as specialization_name',
                'i.name as institute_name'
            ])
            .leftJoin('master_specializations as sp', 'sp.id', 'ic.specialization_id')
            .leftJoin('institutes as i', 'i.id', 'ic.institute_id')
            .where('ic.institute_id', institute_id);

        // Apply session filter if session is provided and show_all is false
        if (session && show_all === 'false') {
            query = query.where('ic.session', 'like', `%${session}%`);
        }

        const courses = await query.orderBy('ic.created', 'desc');

        return {
            courses,
            total: courses.length,
            filter: {
                institute_id,
                session: session && show_all === 'false' ? session : null,
                show_all: show_all !== 'false'
            }
        };
    }

    static getInstituteCourseById = async (req) => {
        this.ensureSuperAdmin(req);
        const { institute_id, course_id } = req.params;
        
        if (!institute_id) {
            throw new Error('Institute ID is required');
        }
        if (!course_id) {
            throw new Error('Course ID is required');
        }

        const course = await db.knex("institute_courses as ic")
            .select([
                'ic.id',
                'ic.institute_id',
                'ic.specialization_id',
                'ic.eligibility_creteria',
                'ic.nonsaarc_currency',
                'ic.nri_currency',
                'ic.indian_currency',
                'ic.saarc_currency',
                'ic.saarc_package_incentive1',
                'ic.status',
                'ic.created',
                'ic.updated',
                'ic.Mode_of_course',
                'ic.session',
                'ic.saarc_fee_structure',
                'ic.nonsaarc_fee_structure',
                'ic.nri_fee_structure',
                'ic.indian_fee_structure',
                'sp.name as specialization_name',
                'i.name as institute_name'
            ])
            .leftJoin('master_specializations as sp', 'sp.id', 'ic.specialization_id')
            .leftJoin('institutes as i', 'i.id', 'ic.institute_id')
            .where('ic.institute_id', institute_id)
            .where('ic.id', course_id)
            .first();

        if (!course) {
            throw new Error('Course not found for this institute');
        }

        return course;
    }

    static async copyCoursesBatch(instituteId, { from_session, to_session, course_ids }) {
        // Start a transaction
        const trx = await db.knex.transaction();
        
        try {
            if (from_session === to_session) {
                throw new Error('Source session and target session cannot be the same');
            }

            // Get the courses to copy
            const coursesToCopy = await trx('institute_courses')
                .where('institute_id', instituteId)
                .whereIn('id', course_ids)
                .where('session', from_session)
                .select('*');

            if (coursesToCopy.length === 0) {
                throw new Error('No courses found for the specified session and IDs');
            }

            const existingTargetCourses = await trx('institute_courses')
                .where('institute_id', instituteId)
                .where('session', to_session)
                .select(['specialization_id', 'Mode_of_course']);

            const existingTargetCourseKeys = new Set(
                existingTargetCourses.map(c => `${c.specialization_id ?? ''}::${c.Mode_of_course ?? ''}`)
            );

            const coursesToInsert = coursesToCopy.filter(course => {
                const key = `${course.specialization_id ?? ''}::${course.Mode_of_course ?? ''}`;
                return !existingTargetCourseKeys.has(key);
            });

            const skippedCount = coursesToCopy.length - coursesToInsert.length;

            if (coursesToInsert.length === 0) {
                throw new Error(`Courses already exist for ${to_session} session`);
            }

            // Prepare new course entries with updated session
            const newCourses = coursesToInsert.map(course => {
                const { id, created, updated, ...rest } = course;
                return {
                    ...rest,
                    session: to_session,
                    created: new Date(),
                    updated: new Date()
                };
            });

            // Insert the new courses
            await trx('institute_courses').insert(newCourses);
            
            // Commit the transaction
            await trx.commit();

            return {
                success: true,
                message: `Successfully copied ${newCourses.length} courses to ${to_session} session`,
                count: newCourses.length,
                skipped: skippedCount
            };

        } catch (error) {
            // Rollback in case of error
            await trx.rollback();
            throw error;
        }
    }
}

module.exports = MasterService;