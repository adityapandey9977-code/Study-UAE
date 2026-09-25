const db = require("../libraries/db");

class StudentFeaturedListingService {
    static async getTopInstitutes(req) {
        const { isStudent, isClient, isInstitute, id: userId } = req.currentUser || {};
        const { student_id: studentIdParam } = req.query || {};

        const requestedStudentId = studentIdParam !== undefined ? Number(studentIdParam) : null;

        if (requestedStudentId !== null && (Number.isNaN(requestedStudentId) || requestedStudentId <= 0)) {
            const err = new Error("student_id must be a positive integer");
            err.status = 400;
            throw err;
        }

        if ((isClient || isInstitute) && requestedStudentId === null) {
            const err = new Error("student_id is required when accessed by super admin or institute users");
            err.status = 400;
            throw err;
        }

        if (!isStudent && !isClient && !isInstitute) {
            const err = new Error("Only authenticated students, institutes or super admins can access this endpoint");
            err.status = 403;
            throw err;
        }

        const student = await db.knex("students as s")
            .select(["s.id", "s.discipline_id", "s.ac_id", "s.user_id"])
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

        if (requestedStudentId !== null && !isClient && !isInstitute) {
            if (!isStudent || Number(student.user_id) !== Number(userId)) {
                const err = new Error("You are not allowed to access this student's data");
                err.status = 403;
                throw err;
            }
        }

        const disciplineId = Number(student.discipline_id) || null;
        const careerId = Number(student.ac_id) || null;

        if (!careerId || careerId <= 0) {
            const err = new Error("Student academic information is missing");
            err.status = 400;
            throw err;
        }

        if (!disciplineId || disciplineId <= 0) {
            const err = new Error("Student discipline information is missing");
            err.status = 400;
            throw err;
        }

        const { session } = req.query || {};
        const sessionFilter = typeof session === "string" ? session.trim() : "";

        const rows = await db.knex("institute_courses as ic")
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
            .leftJoin("institutes as i", "i.id", "ic.institute_id")
            .where("mc.discipline_id", disciplineId)
            .where("mc.career_id", careerId)
            .andWhere("ic.status", "1")
            .andWhere("i.status", "1")
            .modify((qb) => {
                if (sessionFilter) {
                    qb.andWhere("ic.session", "like", `%${sessionFilter}%`);
                }
            })
            .orderByRaw("CASE WHEN i.nirf IS NULL OR i.nirf = 0 THEN 1 ELSE 0 END")
            .orderBy("i.nirf", "asc")
            .orderBy("i.name", "asc")
            .limit(5);

        const institutes = rows.map((row) => {
            const nirfRank = row.nirf_rank ? Number(row.nirf_rank) : null;
            return {
                institute_course_id: row.institute_course_id,
                institute_course_status: row.institute_course_status,
                institute_id: row.institute_id,
                institute_name: row.institute_name,
                institute_type: row.institute_type,
                city: row.city,
                state_id: row.state_id,
                nirf_rank: Number.isFinite(nirfRank) && nirfRank > 0 ? nirfRank : null,
                specialization_id: row.specialization_id,
                specialization_name: row.specialization_name,
                course_id: row.course_id,
                course_name: row.course_name,
                career_id: row.course_career_id,
                discipline_id: row.course_discipline_id,
                discipline_name: row.discipline_name,
                session: row.course_session || null
            };
        });

        return {
            success: true,
            data: {
                student_id: student.id,
                discipline_id: disciplineId,
                academic_id: careerId,
                institutes
            }
        };
    }
}

module.exports = StudentFeaturedListingService;
