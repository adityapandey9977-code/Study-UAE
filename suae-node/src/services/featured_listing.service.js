const db = require("../libraries/db");
const { trim } = require("../util/common.util");

class FeaturedListingService {
    static tableName = "featured_course_listings";
    static tableReady = false;
    static tableHasSession = false;

    static async ensureTable() {
        if (this.tableReady) {
            return;
        }

        const exists = await db.knex.schema.hasTable(this.tableName);
        if (!exists) {
            await db.knex.schema.createTable(this.tableName, (table) => {
                table.increments("id").primary();
                table.integer("discipline_id").unsigned().notNullable();
                table.integer("course_id").unsigned().notNullable();
                table.string("session", 50).nullable();
                table.integer("institute_id").unsigned().notNullable();
                table.integer("institute_course_id").unsigned().notNullable();
                table.integer("specialization_id").unsigned().nullable();
                table.text("custom_text").nullable();
                table.string("status", 20).notNullable().defaultTo("ACTIVE");
                table.timestamp("created").notNullable().defaultTo(db.knex.fn.now());
                table.timestamp("updated").notNullable().defaultTo(db.knex.fn.now());
                table.integer("created_by").unsigned().notNullable().defaultTo(0);
                table.integer("updated_by").unsigned().notNullable().defaultTo(0);
                table.unique(["discipline_id", "course_id"], "uq_featured_course_by_discipline_course");
            });
            this.tableHasSession = true;
        } else {
            const hasSession = await db.knex.schema.hasColumn(this.tableName, "session");
            if (!hasSession) {
                await db.knex.schema.alterTable(this.tableName, (table) => {
                    table.string("session", 50).nullable();
                });
            }
            this.tableHasSession = true;
        }

        this.tableReady = true;
    }

    static ensureSuperAdmin(req) {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            const err = new Error("Only super admin can access this endpoint");
            err.status = 403;
            throw err;
        }
    }

    static parseStatus(value, { required = false } = {}) {
        if (value === undefined || value === null) {
            return required ? "ACTIVE" : undefined;
        }
        const str = `${value}`.trim().toUpperCase();
        if (!str) {
            return required ? "ACTIVE" : undefined;
        }
        if (["ACTIVE", "1", "TRUE", "YES"].includes(str)) {
            return "ACTIVE";
        }
        if (["INACTIVE", "0", "FALSE", "NO"].includes(str)) {
            return "INACTIVE";
        }
        const err = new Error("Invalid status value. Use ACTIVE or INACTIVE");
        err.status = 400;
        throw err;
    }

    static normalizePayload(data) {
        if (typeof data === "string") {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {};
            }
        }
        return trim(data || {});
    }

    static formatInstituteCourse(row) {
        if (!row) {
            return null;
        }

        const nirfRank = row.nirf_rank ? Number(row.nirf_rank) : null;
        const normalizedNirf = Number.isFinite(nirfRank) && nirfRank > 0 ? nirfRank : null;

        const courseMeta = row.course_id ? {
            id: row.course_id,
            name: row.course_name,
            discipline_id: row.course_discipline_id,
            discipline_name: row.discipline_name || null
        } : null;

        const disciplineMeta = row.course_discipline_id ? {
            id: row.course_discipline_id,
            name: row.discipline_name || null
        } : null;

        return {
            institute_course_id: row.institute_course_id,
            institute_course_status: row.institute_course_status,
            institute_id: row.institute_id,
            institute_name: row.institute_name,
            institute_type: row.institute_type,
            city: row.city,
            state_id: row.state_id,
            nirf_rank: normalizedNirf,
            specialization_id: row.specialization_id,
            specialization_name: row.specialization_name,
            course_id: row.course_id,
            course_name: row.course_name,
            course_discipline_id: row.course_discipline_id,
            course_career_id: row.course_career_id,
            discipline_name: row.discipline_name || null,
            session: row.course_session || null,
            course_meta: courseMeta,
            discipline_meta: disciplineMeta
        };
    }

    static buildInstituteCourseQuery({
        disciplineId = null,
        careerId = null,
        session = null,
        onlyActive = false
    } = {}) {
        const qb = db.knex("institute_courses as ic")
            .select([
                "ic.id as institute_course_id",
                "ic.status as institute_course_status",
                "ic.session as course_session",
                "ic.specialization_id",
                "i.id as institute_id",
                "i.name as institute_name",
                "i.type as institute_type",
                "i.city",
                "i.state_id",
                "i.nirf as nirf_rank",
                "ms.id as specialization_id",
                "ms.name as specialization_name",
                "mc.id as course_id",
                "mc.name as course_name",
                "mc.discipline_id as course_discipline_id",
                "mc.career_id as course_career_id",
                "md.name as discipline_name"
            ])
            .leftJoin("master_specializations as ms", "ms.id", "ic.specialization_id")
            .leftJoin("master_courses as mc", "mc.id", "ms.course_id")
            .leftJoin("master_disciplines as md", "md.id", "mc.discipline_id")
            .leftJoin("institutes as i", "i.id", "ic.institute_id");

        if (disciplineId !== null) {
            qb.where("mc.discipline_id", Number(disciplineId));
        }

        if (careerId !== null) {
            qb.where("mc.career_id", Number(careerId));
        }

        if (onlyActive) {
            qb.andWhere("ic.status", "1").andWhere("i.status", "1");
        }

        if (typeof session === "string" && session.trim()) {
            qb.andWhere("ic.session", "like", `%${session.trim()}%`);
        }

        return qb;
    }

    static formatFeaturedRow(row, instituteCourse = null) {
        if (!row) {
            return null;
        }

        const formattedCourse = this.formatInstituteCourse(instituteCourse);
        return {
            id: row.id,
            discipline_id: row.discipline_id,
            course_id: row.course_id,
            session: row.session || null,
            institute_id: row.institute_id,
            institute_course_id: row.institute_course_id,
            specialization_id: row.specialization_id,
            custom_text: row.custom_text || null,
            status: row.status,
            is_active: row.status === "ACTIVE",
            created: row.created,
            updated: row.updated,
            institute_course: formattedCourse,
            course_meta: formattedCourse?.course_meta || null,
            discipline_meta: formattedCourse?.discipline_meta || null
        };
    }

    static async fetchSuggestedInstituteCourses(
        disciplineId,
        academicId,
        { excludeInstituteCourseId = null, session = null } = {}
    ) {
        const qb = this.buildInstituteCourseQuery({
            disciplineId,
            careerId: academicId,
            session,
            onlyActive: true
        })
            .orderByRaw("CASE WHEN i.nirf IS NULL OR i.nirf = 0 THEN 1 ELSE 0 END")
            .orderBy("i.nirf", "asc")
            .orderBy("i.name", "asc");

        if (excludeInstituteCourseId) {
            qb.whereNot("ic.id", Number(excludeInstituteCourseId));
        }

        const rows = await qb;
        return rows.map((row) => this.formatInstituteCourse(row));
    }

    static async fetchInstituteCourse(instituteCourseId) {
        if (!instituteCourseId) {
            return null;
        }

        const row = await this.buildInstituteCourseQuery()
            .where("ic.id", instituteCourseId)
            .first();

        if (!row) {
            return null;
        }

        return row;
    }

    static async listAvailableCourses(req) {
        this.ensureSuperAdmin(req);
        const { discipline_id, course_id, institute_id, session } = trim(req.query || {});

        const disciplineId = Number(discipline_id);
        const careerId = Number(course_id);

        if (Number.isNaN(disciplineId) || disciplineId <= 0) {
            const err = new Error("Invalid discipline_id");
            err.status = 400;
            throw err;
        }

        if (Number.isNaN(careerId) || careerId <= 0) {
            const err = new Error("Invalid course_id");
            err.status = 400;
            throw err;
        }

        const qb = this.buildInstituteCourseQuery({
            disciplineId,
            careerId,
            session,
            onlyActive: true
        })
            .orderByRaw("CASE WHEN i.nirf IS NULL OR i.nirf = 0 THEN 1 ELSE 0 END")
            .orderBy("i.nirf", "asc")
            .orderBy("i.name", "asc");

        if (institute_id) {
            qb.andWhere("i.id", Number(institute_id));
        }

        const rows = await qb;
        return rows.map((row) => this.formatInstituteCourse(row));
    }

    static async getFeaturedForAdmin(req) {
        this.ensureSuperAdmin(req);
        await this.ensureTable();

        const { session } = trim(req.query || {});
        const sessionFilter = typeof session === "string" ? session.trim() : "";

        const rows = await db.knex(this.tableName).select("*").orderBy("updated", "desc");

        if (!rows || rows.length === 0) {
            return [];
        }

        const results = [];
        for (const row of rows) {
            const instituteCourse = await this.fetchInstituteCourse(row.institute_course_id);
            results.push(this.formatFeaturedRow(row, instituteCourse));
        }
        return results;
    }

    static async setFeaturedCourse(req) {
        this.ensureSuperAdmin(req);
        await this.ensureTable();

        const raw = this.normalizePayload(req.body);
        const disciplineId = Number(raw.discipline_id);
        const careerId = Number(raw.course_id);
        const instituteCourseId = Number(raw.institute_course_id);
        const customText = raw.custom_text ? String(raw.custom_text).trim() : null;
        const status = this.parseStatus(raw.status ?? "ACTIVE", { required: true });

        if (Number.isNaN(disciplineId) || disciplineId <= 0) {
            const err = new Error("discipline_id is required");
            err.status = 400;
            throw err;
        }

        if (Number.isNaN(careerId) || careerId <= 0) {
            const err = new Error("course_id is required");
            err.status = 400;
            throw err;
        }

        if (Number.isNaN(instituteCourseId) || instituteCourseId <= 0) {
            const err = new Error("institute_course_id is required");
            err.status = 400;
            throw err;
        }

        if (customText && customText.length > 2000) {
            const err = new Error("custom_text cannot exceed 2000 characters");
            err.status = 400;
            throw err;
        }

        const instituteCourse = await this.fetchInstituteCourse(instituteCourseId);
        if (!instituteCourse) {
            const err = new Error("Institute course not found");
            err.status = 404;
            throw err;
        }

        const sessionValue = raw.session
            ? String(raw.session).trim()
            : (instituteCourse.course_session ? String(instituteCourse.course_session).trim() : "");
        const sessionToSave = sessionValue ? sessionValue : null;

        if (Number(instituteCourse.course_career_id) !== careerId) {
            const err = new Error("Institute course does not belong to the provided course");
            err.status = 400;
            throw err;
        }

        if (Number(instituteCourse.course_discipline_id) !== disciplineId) {
            const err = new Error("Institute course does not belong to the provided discipline");
            err.status = 400;
            throw err;
        }

        const existing = await db.knex(this.tableName)
            .where({ discipline_id: disciplineId, course_id: careerId })
            .first();

        const payload = {
            discipline_id: disciplineId,
            course_id: careerId,
            session: sessionToSave,
            institute_id: instituteCourse.institute_id,
            institute_course_id: instituteCourseId,
            specialization_id: instituteCourse.specialization_id || null,
            custom_text: customText,
            status
        };

        if (existing) {
            payload.id = existing.id;
        }

        const savedId = await db.save(this.tableName, payload, 2, req);
        const savedRow = await db.knex(this.tableName).where({ id: savedId }).first();
        const latestInstituteCourse = await this.fetchInstituteCourse(savedRow.institute_course_id);
        return this.formatFeaturedRow(savedRow, latestInstituteCourse);
    }

    static async deleteFeaturedCourse(req) {
        this.ensureSuperAdmin(req);
        await this.ensureTable();

        const { discipline_id, course_id } = trim(req.query || {});
        const disciplineId = Number(discipline_id);
        const courseId = Number(course_id);

        if (Number.isNaN(disciplineId) || disciplineId <= 0 || Number.isNaN(courseId) || courseId <= 0) {
            const err = new Error("discipline_id and course_id are required");
            err.status = 400;
            throw err;
        }

        const deleted = await db.delete(this.tableName, { discipline_id: disciplineId, course_id: courseId });
        return { success: deleted > 0, deleted };
    }

    static async updateFeaturedCourseById(req) {
        this.ensureSuperAdmin(req);
        await this.ensureTable();

        const id = Number(req.params?.id);
        if (Number.isNaN(id) || id <= 0) {
            const err = new Error("Invalid id");
            err.status = 400;
            throw err;
        }

        const existing = await db.knex(this.tableName).where({ id }).first();
        if (!existing) {
            const err = new Error("Featured listing not found");
            err.status = 404;
            throw err;
        }

        const raw = this.normalizePayload(req.body);

        const nextDisciplineId = raw.discipline_id !== undefined && raw.discipline_id !== null
            ? Number(raw.discipline_id)
            : Number(existing.discipline_id);
        const nextCareerId = raw.course_id !== undefined && raw.course_id !== null
            ? Number(raw.course_id)
            : Number(existing.course_id);
        const nextInstituteCourseId = raw.institute_course_id !== undefined && raw.institute_course_id !== null
            ? Number(raw.institute_course_id)
            : Number(existing.institute_course_id);
        const nextCustomText = raw.custom_text !== undefined
            ? (raw.custom_text ? String(raw.custom_text).trim() : null)
            : (existing.custom_text || null);
        const nextStatus = raw.status !== undefined
            ? this.parseStatus(raw.status, { required: true })
            : this.parseStatus(existing.status, { required: true });

        if (Number.isNaN(nextDisciplineId) || nextDisciplineId <= 0) {
            const err = new Error("discipline_id must be a positive integer");
            err.status = 400;
            throw err;
        }

        if (Number.isNaN(nextCareerId) || nextCareerId <= 0) {
            const err = new Error("course_id must be a positive integer");
            err.status = 400;
            throw err;
        }

        if (Number.isNaN(nextInstituteCourseId) || nextInstituteCourseId <= 0) {
            const err = new Error("institute_course_id must be a positive integer");
            err.status = 400;
            throw err;
        }

        if (nextCustomText && nextCustomText.length > 2000) {
            const err = new Error("custom_text cannot exceed 2000 characters");
            err.status = 400;
            throw err;
        }

        const instituteCourse = await this.fetchInstituteCourse(nextInstituteCourseId);
        if (!instituteCourse) {
            const err = new Error("Institute course not found");
            err.status = 404;
            throw err;
        }

        const sessionValue = raw.session
            ? String(raw.session).trim()
            : (instituteCourse.course_session ? String(instituteCourse.course_session).trim() : "");
        const sessionToSave = sessionValue ? sessionValue : (existing.session || null);

        if (Number(instituteCourse.course_career_id) !== nextCareerId) {
            const err = new Error("Institute course does not belong to the provided course");
            err.status = 400;
            throw err;
        }

        if (Number(instituteCourse.course_discipline_id) !== nextDisciplineId) {
            const err = new Error("Institute course does not belong to the provided discipline");
            err.status = 400;
            throw err;
        }

        if (nextDisciplineId !== Number(existing.discipline_id) || nextCareerId !== Number(existing.course_id)) {
            const conflicting = await db.knex(this.tableName)
                .where({ discipline_id: nextDisciplineId, course_id: nextCareerId })
                .andWhereNot({ id })
                .first();

            if (conflicting) {
                const err = new Error("A featured listing already exists for the provided discipline and course");
                err.status = 409;
                throw err;
            }
        }

        const payload = {
            id,
            discipline_id: nextDisciplineId,
            course_id: nextCareerId,
            session: sessionToSave,
            institute_id: instituteCourse.institute_id,
            institute_course_id: nextInstituteCourseId,
            specialization_id: instituteCourse.specialization_id || null,
            custom_text: nextCustomText,
            status: nextStatus
        };

        const savedId = await db.save(this.tableName, payload, 2, req);
        const savedRow = await db.knex(this.tableName).where({ id: savedId }).first();
        const latestInstituteCourse = await this.fetchInstituteCourse(savedRow.institute_course_id);
        return this.formatFeaturedRow(savedRow, latestInstituteCourse);
    }

    static async deleteFeaturedCourseById(req) {
        this.ensureSuperAdmin(req);
        await this.ensureTable();

        const id = Number(req.params?.id);
        if (Number.isNaN(id) || id <= 0) {
            const err = new Error("Invalid id");
            err.status = 400;
            throw err;
        }

        const deleted = await db.delete(this.tableName, { id });
        return { success: deleted > 0, deleted };
    }

    static async getFeaturedForStudent(req) {
        const { isStudent, id: userId } = req.currentUser || {};
        const { student_id: studentIdParam } = req.query || {};
        const requestedStudentId = studentIdParam !== undefined ? Number(studentIdParam) : null;
        const { session } = req.query || {};
        const sessionFilter = typeof session === "string" ? session.trim() : "";

        if (!userId) {
            const err = new Error("Only authenticated users can access this endpoint");
            err.status = 403;
            throw err;
        }

        if (requestedStudentId !== null && (Number.isNaN(requestedStudentId) || requestedStudentId <= 0)) {
            const err = new Error("student_id must be a positive integer");
            err.status = 400;
            throw err;
        }

        if (!isStudent && requestedStudentId === null) {
            const err = new Error("student_id is required when accessed by non-student users");
            err.status = 400;
            throw err;
        }

        const student = await db.knex("students as s")
            .select([
                "s.id",
                "s.discipline_id",
                "s.ac_id",
                "s.user_id"
            ])
            .modify((qb) => {
                if (requestedStudentId !== null) {
                    qb.where({ "s.id": requestedStudentId });
                } else {
                    qb.where({ "s.user_id": Number(userId) });
                }
            })
            .first();

        if (!student) {
            const err = new Error("Student profile not found");
            err.status = 404;
            throw err;
        }

        if (isStudent && Number(student.user_id) !== Number(userId)) {
            const err = new Error("You are not allowed to access this student's data");
            err.status = 403;
            throw err;
        }

        let disciplineId = Number(student.discipline_id) || null;
        const academicId = Number(student.ac_id) || null;

        if (!academicId || academicId <= 0) {
            const err = new Error("Student academic information is missing");
            err.status = 400;
            throw err;
        }

        if (!disciplineId || disciplineId <= 0) {
            const err = new Error("Student discipline information is missing");
            err.status = 400;
            throw err;
        }

        await this.ensureTable();

        let matchedAcademicTrack = true;
        const findFeaturedRow = async (where = {}, { allowLegacySessionFallback = false } = {}) => {
            const base = () => db.knex(this.tableName)
                .where({
                    ...where,
                    status: "ACTIVE"
                })
                .orderBy("updated", "desc")
                .orderBy("id", "desc");

            if (sessionFilter) {
                const match = await base()
                    .andWhere("session", "like", `%${sessionFilter}%`)
                    .first();
                if (match) return match;

                if (allowLegacySessionFallback) {
                    return base()
                        .andWhere((qb) => {
                            qb.whereNull("session").orWhere("session", "");
                        })
                        .first();
                }
                return null;
            }

            return base().first();
        };

        let row = await findFeaturedRow({
            discipline_id: disciplineId,
            course_id: academicId
        }, { allowLegacySessionFallback: true });

        if (!row) {
            matchedAcademicTrack = false;
            row = await findFeaturedRow({
                discipline_id: disciplineId
            }, { allowLegacySessionFallback: true });
        }

        let instituteCourse = null;
        if (row?.institute_course_id) {
            if (sessionFilter) {
                instituteCourse = await this.buildInstituteCourseQuery({ session: sessionFilter })
                    .where("ic.id", Number(row.institute_course_id))
                    .first();
            }
            if (!instituteCourse && !sessionFilter) {
                instituteCourse = await this.fetchInstituteCourse(row.institute_course_id);
            }
        }

        if (!instituteCourse && row?.institute_id && row?.specialization_id) {
            if (sessionFilter) {
                instituteCourse = await this.buildInstituteCourseQuery({ session: sessionFilter })
                    .where("ic.institute_id", Number(row.institute_id))
                    .andWhere("ic.specialization_id", Number(row.specialization_id))
                    .orderBy("ic.updated", "desc")
                    .orderBy("ic.id", "desc")
                    .first();
            }
            if (!instituteCourse && !sessionFilter) {
                instituteCourse = await this.buildInstituteCourseQuery()
                    .where("ic.institute_id", Number(row.institute_id))
                    .andWhere("ic.specialization_id", Number(row.specialization_id))
                    .orderBy("ic.updated", "desc")
                    .orderBy("ic.id", "desc")
                    .first();
            }
        }

        const suggestions = await this.fetchSuggestedInstituteCourses(disciplineId, academicId, {
            excludeInstituteCourseId: instituteCourse?.institute_course_id || null,
            session: sessionFilter || null
        });

        if (!row) {
            return {
                success: true,
                data: null,
                suggestions,
                meta: {
                    student_id: student.id,
                    discipline_id: disciplineId,
                    academic_id: academicId,
                    matched_academic_track: false,
                    session: sessionFilter || null
                }
            };
        }

        return {
            success: true,
            data: this.formatFeaturedRow(row, instituteCourse),
            suggestions,
            meta: {
                student_id: student.id,
                discipline_id: disciplineId,
                academic_id: academicId,
                matched_academic_track: matchedAcademicTrack,
                session: sessionFilter || null
            }
        };
    }
}

module.exports = FeaturedListingService;
