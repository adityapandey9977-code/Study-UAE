const { Router } = require("express");
const router = Router({ mergeParams: true });
const ejs = require("ejs");
const axios = require("axios");
const db = require("../libraries/db");
const StudentService = require("../services/student.service");
const WhatsappService = require("../services/whatsapp.service");
const { trim, sendEmail } = require("../util/common.util");
const { header } = require("express-validator");
const LogoController = require("./logo.ctrl");
const BackgroundController = require("./background.ctrl");

// In-memory cache for public institutes to eliminate remote DB latency
let institutesCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // Cache valid for 5 minutes

class PublicCtrl {
    static test = async (req, res) => {
        try {
            /* const dtl = await StudentService.getChoiceFillingdetail(1);
            if (dtl) {
                const html = await ejs.renderFile("src/views/email_institute_accepted.html", dtl);
                //sendEmail(dtl.stu.email, `Congratulations! You application accepted by your choice of Institutions`, html);
                const phonecode = (dtl.stu.isd_code || '91').replace('+', '');
                const msg = html.replace(/<\/?[^>]+(>|$)/g, "");
                await WhatsappService.sendMessage({ to: `${phonecode}${dtl.stu.mobile}`, msg }, req);
            } */

            return res.status(200).json({ message: 'Success' });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static testPdvPatientSearch = async (req, res) => {
        try {
            const body = req.body || {};
            const { data } = await axios.post("https://p360dashboarddev.gene.com/patientsearch", body, { header: { Authorization: 'Basic Og==' } });
            return res.status(200).json(data);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static assignStudentByAutomation = async (req, res) => {
        try {
            const { student_id, email, mobile } = trim(req.body || {});
            let resolvedStudentId = Number(student_id) || 0;

            if (!resolvedStudentId) {
                const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
                const normalizedMobile = mobile ? String(mobile).replace(/\D/g, '') : '';

                if (!normalizedEmail && !normalizedMobile) {
                    throw new Error('student_id or email/mobile required');
                }

                const [
                    hasStudentUserId,
                    hasStudentEmail,
                    hasStudentMobile,
                    hasUserEmail,
                    hasUserMobile,
                ] = await Promise.all([
                    db.knex.schema.hasColumn('students', 'user_id'),
                    db.knex.schema.hasColumn('students', 'email'),
                    db.knex.schema.hasColumn('students', 'mobile'),
                    db.knex.schema.hasColumn('users', 'email'),
                    db.knex.schema.hasColumn('users', 'mobile'),
                ]);

                const q = db.knex('students as s').select(['s.id']);
                if (hasStudentUserId && (hasUserEmail || hasUserMobile)) {
                    q.leftJoin('users as u', 'u.id', 's.user_id');
                }

                q.where((qb) => {
                    let hasAny = false;

                    if (normalizedEmail) {
                        if (hasStudentEmail) {
                            qb.orWhereRaw('LOWER(TRIM(s.email)) = ?', [normalizedEmail]);
                            hasAny = true;
                        } else if (hasStudentUserId && hasUserEmail) {
                            qb.orWhereRaw('LOWER(TRIM(u.email)) = ?', [normalizedEmail]);
                            hasAny = true;
                        }
                    }

                    if (normalizedMobile) {
                        if (hasStudentMobile) {
                            qb.orWhere('s.mobile', normalizedMobile);
                            hasAny = true;
                        } else if (hasStudentUserId && hasUserMobile) {
                            qb.orWhere('u.mobile', normalizedMobile);
                            hasAny = true;
                        }
                    }

                    if (!hasAny) {
                        qb.whereRaw('1 = 0');
                    }
                });

                const row = await q.orderBy('s.id', 'desc').first();
                resolvedStudentId = Number(row?.id || 0) || 0;
            }

            if (!resolvedStudentId) {
                return res.status(200).json({
                    message: '',
                    result: { assigned: false, reason: 'Student not found for provided criteria' }
                });
            }

            const result = await StudentService.autoAssignLeadByAutomation({ studentId: resolvedStudentId }, req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getInstitutes = async (req, res) => {
        try {
            const showAll = req.query.all === 'true' || req.query.cms === 'true';
            const now = Date.now();
            if (!showAll && institutesCache && (now - cacheTimestamp < CACHE_TTL)) {
                return res.status(200).json({ success: true, data: institutesCache });
            }

            const featuredRows = await db.knex("cms_featured_institute").select("institute_id");
            const featuredIds = new Set(featuredRows.map(r => r.institute_id));

            const list = await db.knex("institutes")
                .select("id", "name", "type", "city", "status", "mask_status", "logo_file_id", "banner_file_id", "website", "state_id", "pincode", "address", "naac", "nirf", "aicte", "nba", "nodal_name", "nodal_email")
                .orderBy("name", "asc");

            const rawBase = (process.env.ENVIRONMENT === 'dev' ? (process.env.BASE_URL_LOCAL || process.env.BASE_URL) : process.env.BASE_URL) || '';
            const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

            // Batch fetch file names for institute logos (resolves N+1 query issue)
            const logoFileIds = list.map(inst => inst.logo_file_id).filter(Boolean);
            const files = logoFileIds.length > 0
                ? await db.knex('files').select('id', 'file_name').whereIn('id', logoFileIds)
                : [];
            const filesMap = new Map(files.map(f => [f.id, f.file_name]));

            // Batch fetch all course mappings for approved institutes in one join query (resolves N+1 query issue)
            const approvedIds = list
                .filter(inst => inst.status === "Approved" || inst.status === "1" || inst.status === 1 || String(inst.status).toLowerCase() === "approved")
                .map(inst => inst.id);

            const allCourses = approvedIds.length > 0
                ? await db.knex("institute_courses as ic")
                    .join("master_specializations as ms", "ms.id", "ic.specialization_id")
                    .leftJoin("master_courses as mc", "mc.id", "ms.course_id")
                    .leftJoin("master_disciplines as md", "md.id", "mc.discipline_id")
                    .leftJoin("master_acad_careers as mac", "mac.id", "mc.career_id")
                    .select(
                        "ic.institute_id",
                        "ms.name as spec_name",
                        "md.name as disc_name",
                        "mc.name as course_name",
                        "mac.name as career_name"
                    )
                    .whereIn("ic.institute_id", approvedIds)
                    .andWhere("ic.status", "1")
                : [];

            // Group unique courses by institute (deduplicating by specialization name to handle multi-session and join duplicates)
            const coursesByInst = {};
            const seenCourses = new Set();
            for (const row of allCourses) {
                const uniqueKey = `${row.institute_id}-${row.spec_name}`;
                if (seenCourses.has(uniqueKey)) continue;
                seenCourses.add(uniqueKey);

                if (!coursesByInst[row.institute_id]) {
                    coursesByInst[row.institute_id] = [];
                }
                coursesByInst[row.institute_id].push(row);
            }

            const mapped = [];
            for (const inst of list) {
                const isApproved = inst.status === "Approved" || inst.status === "1" || inst.status === 1 || String(inst.status).toLowerCase() === "approved";
                if (!isApproved) continue;

                if (!showAll && inst.mask_status === 0) continue;

                const courseRows = coursesByInst[inst.id] || [];
                const courseCount = courseRows.length;
                const coursesDisplay = `${courseCount} Courses`;
                const programsDisplay = courseRows.map(r => r.spec_name).slice(0, 4).join(", ");

                let logoUrl = '';
                if (inst.logo_file_id && filesMap.has(inst.logo_file_id)) {
                    logoUrl = `${baseUrl}uploads/files/${filesMap.get(inst.logo_file_id)}`;
                }

                const fullProgramsList = courseRows.map(r => ({
                    title: r.spec_name,
                    course: r.course_name || r.spec_name,
                    discipline: r.disc_name || "General",
                    career: r.career_name || "Course"
                }));

                mapped.push({
                    id: inst.id,
                    name: inst.name,
                    city: inst.city || 'Dubai',
                    type: inst.type || 'Private',
                    image: logoUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80',
                    courses: coursesDisplay,
                    intake: "Sep / Jan",
                    scholarship: "Merit-based support available",
                    programs: programsDisplay,
                    note: inst.address ? `${inst.name} is located at ${inst.address}, ${inst.city}.` : `Strong fit for globally mobile students who want to study in ${inst.city || 'UAE'}.`,
                    isFeatured: featuredIds.has(inst.id),
                    featured: featuredIds.has(inst.id),
                    isListed: inst.mask_status !== 0,
                    mask_status: inst.mask_status,

                    // Specific database attributes
                    website: inst.website,
                    naac: inst.naac || 'N/A',
                    nirf: inst.nirf || 'N/A',
                    aicte: inst.aicte === 1 || inst.aicte === "1",
                    nba: inst.nba === 1 || inst.nba === "1",
                    nodal_name: inst.nodal_name,
                    nodal_email: inst.nodal_email,
                    isDbInstitute: true,
                    fullProgramsList: fullProgramsList
                });
            }

            // Save to in-memory cache
            institutesCache = mapped;
            cacheTimestamp = now;

            return res.status(200).json({ success: true, data: mapped });
        } catch (e) {
            return res.status(400).json({ success: false, message: e.message || 'Error' });
        }
    }

    static getSearchSuggestions = async (req, res) => {
        try {
            const query = String(req.query.q || "").trim();
            if (!query || query.length < 2) {
                return res.status(200).json({
                    success: true,
                    data: { universities: [], programs: [], courses: [] }
                });
            }

            const searchPattern = `%${query}%`;

            // 1. Search Universities (Approved/active/listed institutes only)
            const universities = await db.knex("institutes")
                .select("id", "name")
                .where("name", "like", searchPattern)
                .andWhere("mask_status", "!=", 0)
                .andWhere((qb) => {
                    qb.where("status", "Approved")
                        .orWhere("status", "1")
                        .orWhere("status", 1)
                        .orWhereRaw("LOWER(status) = ?", ["approved"]);
                })
                .limit(5);

            // 2. Search Programs (Disciplines)
            const programs = await db.knex("master_disciplines")
                .select("id", "name")
                .where("name", "like", searchPattern)
                .limit(5);

            // 3. Search Courses (Specializations joined with general courses)
            const courses = await db.knex("master_specializations as ms")
                .join("master_courses as mc", "mc.id", "ms.course_id")
                .select("ms.id", "ms.name as spec_name", "mc.name as course_name")
                .where((qb) => {
                    qb.where("ms.name", "like", searchPattern)
                        .orWhere("mc.name", "like", searchPattern);
                })
                .limit(5);

            const formattedCourses = courses.map(c => ({
                id: c.id,
                name: `${c.course_name} in ${c.spec_name}`
            }));

            return res.status(200).json({
                success: true,
                data: {
                    universities,
                    programs,
                    courses: formattedCourses
                }
            });
        } catch (e) {
            console.error("Error fetching search suggestions:", e);
            return res.status(500).json({
                success: false,
                message: e.message || "Internal server error"
            });
        }
    }

    static getDisciplines = async (req, res) => {
        try {
            const list = await db.knex("master_disciplines")
                .select("id", "name")
                .orderBy("name", "asc");
            return res.status(200).json({ success: true, data: list });
        } catch (error) {
            console.error("Error fetching disciplines:", error);
            return res.status(500).json({ success: false, message: error.message || "Error" });
        }
    }

    static getCareers = async (req, res) => {
        try {
            const list = await db.knex("master_acad_careers")
                .select("id", "name")
                .orderBy("name", "asc");
            return res.status(200).json({ success: true, data: list });
        } catch (error) {
            console.error("Error fetching careers:", error);
            return res.status(500).json({ success: false, message: error.message || "Error" });
        }
    }

    static clearCache = () => {
        institutesCache = null;
    };
}

router.clearCache = PublicCtrl.clearCache;

const WebsiteSettingsController = require("./website_settings.ctrl");

router.get('/test', PublicCtrl.test);
router.post('/patientsearch', PublicCtrl.testPdvPatientSearch);
router.post('/student/assign/by-automation', PublicCtrl.assignStudentByAutomation);

// Public endpoints for website settings
router.get('/website-settings', WebsiteSettingsController.getPublishedSettings);
router.get('/preview-draft', WebsiteSettingsController.getPreviewDraft);
router.get('/institutes', PublicCtrl.getInstitutes);
router.get('/search/suggestions', PublicCtrl.getSearchSuggestions);
router.get('/disciplines', PublicCtrl.getDisciplines);
router.get('/careers', PublicCtrl.getCareers);

// Public endpoints for logo and backgrounds (no authentication required)
router.get('/logo/active', LogoController.getActive);
router.get('/backgrounds/active', BackgroundController.getActive);

module.exports = router;