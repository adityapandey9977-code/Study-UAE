const { Router } = require("express");
const router = Router({ mergeParams: true });
const { body, param, query } = require("express-validator");
const { validationResponse } = require("../middleware/validation.mw");
const InstituteIssuesService = require("../services/institute_issues.service");
const db = require("../libraries/db");
const { trim, currentDT, getYmd, getExt } = require("../util/common.util");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const importStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { y, m, d } = getYmd();
        const upPath = process.env.UP_PATH || 'uploads/';
        const dir = `${upPath}${y}/${y}-${m}/${y}-${m}-${d}`;
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        } catch (e) {
            return cb(e);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = getExt(file.originalname) || 'none';
        const name = Date.now() + '' + Math.round(Math.random() * 1E9) + '.' + ext;
        cb(null, name);
    },
});

const importUpload = multer({
    storage: importStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExt = ['csv'];
        const ext = getExt(file.originalname);
        if (allowedExt.includes(ext)) {
            return cb(null, true);
        }
        cb(null, false);
        return cb(new Error('File type not allowed! Only CSV files are supported.'));
    }
});

class InstituteCtrl {
    static buildLogoBannerResult = async (instituteId) => {
        const institute = await db.knex('institutes')
            .select(['logo_file_id', 'banner_file_id'])
            .where({ id: instituteId })
            .first();

        const logoFileId = institute?.logo_file_id || null;
        const bannerFileId = institute?.banner_file_id || null;

        const logoFile = logoFileId ? await db.knex('files').select(['file_name']).where({ id: logoFileId }).first() : null;
        const bannerFile = bannerFileId ? await db.knex('files').select(['file_name']).where({ id: bannerFileId }).first() : null;

        const rawBase = (process.env.ENVIRONMENT === 'dev' ? (process.env.BASE_URL_LOCAL || process.env.BASE_URL) : process.env.BASE_URL) || '';
        const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

        return {
            logo_file_id: logoFileId,
            banner_file_id: bannerFileId,
            logo_file_name: logoFile?.file_name || null,
            banner_file_name: bannerFile?.file_name || null,
            logo_file_url: logoFile?.file_name ? `${baseUrl}uploads/files/${logoFile.file_name}` : '',
            banner_file_url: bannerFile?.file_name ? `${baseUrl}uploads/files/${bannerFile.file_name}` : '',
        };
    }
    static createIssue = async (req, res) => {
        try {
            const { isInstitute } = req.currentUser || {};
            if (!isInstitute) {
                return res.status(403).json({ message: "Only institutes can create issues" });
            }

            const data = trim(req.body || {});
            const issue = await InstituteIssuesService.createIssue(data, req);
            return res.status(201).json({ message: "Issue created successfully", result: issue });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    static getIssues = async (req, res) => {
        try {
            const { isInstitute } = req.currentUser || {};
            if (!isInstitute) {
                return res.status(403).json({ message: "Only institutes can view their issues" });
            }

            const issues = await InstituteIssuesService.getIssuesForInstitute(req);
            return res.status(200).json({ message: "", result: issues });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    static getIssuesForAdmin = async (req, res) => {
        try {
            const { isClient } = req.currentUser || {};
            if (!isClient) {
                return res.status(403).json({ message: "Only super admin can access this endpoint" });
            }

            const issues = await InstituteIssuesService.getIssuesForAdmin(req);
            return res.status(200).json({ message: "", result: issues });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    static updateIssueStatus = async (req, res) => {
        try {
            const { isClient } = req.currentUser || {};
            if (!isClient) {
                return res.status(403).json({ message: "Only super admin can update institute issues" });
            }

            const { issueId } = req.params;
            const { status } = trim(req.body || {});
            const issue = await InstituteIssuesService.updateIssueStatus(issueId, status, req);
            return res.status(200).json({ message: "Issue updated successfully", result: issue });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    static getIssueReplies = async (req, res) => {
        try {
            const { issueId } = req.params;
            const replies = await InstituteIssuesService.getIssueReplies(issueId, req);
            return res.status(200).json({ message: "", result: replies });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    }

    static addIssueReply = async (req, res) => {
        try {
            const { issueId } = req.params;
            const data = trim(req.body || {});
            const reply = await InstituteIssuesService.addIssueReply(issueId, data, req);
            return res.status(201).json({ message: "Reply added successfully", result: reply });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    }

    static deleteIssue = async (req, res) => {
        try {
            const { isAdmin, isInstitute } = req.currentUser || {};
            if (!isAdmin && !isInstitute) {
                return res.status(403).json({ code: 403, message: "Only admins and institutes can delete issues" });
            }

            // Get ID from body or params
            const issueId = req.body.id || req.params.issueId;
            
            if (!issueId) {
                return res.status(400).json({ code: 400, message: "Issue ID is required" });
            }

            await InstituteIssuesService.deleteIssue(issueId, req);
            return res.status(200).json({ code: 200, message: "Issue deleted successfully" });
        } catch (e) {
            return res.status(400).json({ code: 400, message: e.message || "Error" });
        }
    }

    static logoAndBanner = async (req, res) => {
        try {
            const { isClient, institute_id: selfInstituteId } = req.currentUser || {};
            const headerInstituteId = req.headers.institute_id || req.headers.Institute_id;
            const instituteId = isClient ? (headerInstituteId || req.query.institute_id || selfInstituteId) : selfInstituteId;
            if (!instituteId) {
                return res.status(400).json({ message: 'Institute not found' });
            }

            const result = await InstituteCtrl.buildLogoBannerResult(instituteId);

            return res.status(200).json({ code: 200, message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static saveLogoBanner = async (req, res) => {
        try {
            const { isClient, institute_id: selfInstituteId } = req.currentUser || {};
            const headerInstituteId = req.headers.institute_id || req.headers.Institute_id;
            const instituteId = isClient ? (headerInstituteId || req.body?.institute_id || selfInstituteId) : selfInstituteId;
            if (!instituteId) {
                return res.status(400).json({ message: 'Institute not found' });
            }

            const post = trim(req.body || {});
            const logoFileId = post.logo_file_id || null;
            const bannerFileId = post.banner_file_id || null;

            await db.knex('institutes')
                .where({ id: instituteId })
                .update({
                    logo_file_id: logoFileId,
                    banner_file_id: bannerFileId,
                    updated: currentDT(),
                });

            const result = await InstituteCtrl.buildLogoBannerResult(instituteId);
            return res.status(200).json({ code: 200, message: 'Saved successfully', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static importCourses = async (req, res) => {
        try {
            const { isInstitute, institute_id: authInstId } = req.currentUser || {};
            // Accept institute_id from query/body if admin/client, otherwise force authInstId
            const instituteId = isInstitute ? authInstId : Number(req.body.institute_id || req.query.institute_id);

            if (!instituteId) {
                return res.status(400).json({ message: "Institute ID is required" });
            }
            if (!req.file) {
                return res.status(400).json({ message: "No CSV file uploaded" });
            }

            const results = [];
            const absolutePath = req.file.path;

            // Helper to clean key names
            const cleanKey = (key) => String(key || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');

            // Parse CSV
            await new Promise((resolve, reject) => {
                fs.createReadStream(absolutePath)
                    .pipe(csv({
                        mapHeaders: ({ header }) => cleanKey(header)
                    }))
                    .on('data', (data) => results.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            // Cleanup uploaded file
            try {
                fs.unlinkSync(absolutePath);
            } catch (e) {}

            const summary = { total: 0, created: 0, updated: 0, skipped: 0, errors: 0, error_rows: [] };

            for (const [index, row] of results.entries()) {
                summary.total++;
                try {
                    const rowNum = index + 1;
                    const specName = row.specialization || row.specialisation;
                    const courseName = row.course;
                    const mode = row.mode_of_course || row.mode;
                    const sessionVal = row.session;

                    if (!specName || !courseName || !mode || !sessionVal) {
                        summary.skipped++;
                        summary.error_rows.push({
                            row: rowNum,
                            message: "Missing required fields (Specialization, Course, Mode of Course, or Session)"
                        });
                        continue;
                    }

                    // Resolve specialization_id
                    const specRecord = await db.knex('master_specializations as sp')
                        .join('master_courses as c', 'c.id', 'sp.course_id')
                        .select('sp.id')
                        .where('sp.name', specName.trim())
                        .where('c.name', courseName.trim())
                        .first();

                    if (!specRecord) {
                        summary.skipped++;
                        summary.error_rows.push({
                            row: rowNum,
                            message: `Specialization "${specName}" for Course "${courseName}" not found in master records`
                        });
                        continue;
                    }

                    // Build fee structures for saarc, nonsaarc, nri, indian
                    const buildFeeStructure = (prefix) => {
                        const fee = {};
                        const suffixes = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
                        suffixes.forEach(suffix => {
                            fee[`without_hostel${suffix}`] = row[`${prefix}_without_hostel${suffix}`] || '';
                            fee[`with_hostel${suffix}`] = row[`${prefix}_with_hostel${suffix}`] || '';
                        });
                        fee['total_package_without_hostel'] = row[`${prefix}_total_package_without_hostel`] || '';
                        fee['total_package_with_hostel'] = row[`${prefix}_total_package_with_hostel`] || '';
                        return JSON.stringify(fee);
                    };

                    const courseData = {
                        institute_id: instituteId,
                        specialization_id: specRecord.id,
                        eligibility_creteria: row.eligibility_criteria || row.eligibility || '',
                        nonsaarc_currency: row.nonsaarc_currency || row.non_saarc_currency || 'USD',
                        nri_currency: row.nri_currency || 'USD',
                        indian_currency: row.indian_currency || 'INR',
                        saarc_currency: row.saarc_currency || 'USD',
                        saarc_package_incentive1: row.saarc_package_incentive1 || '',
                        saarc_fee_structure: buildFeeStructure('saarc'),
                        nonsaarc_fee_structure: buildFeeStructure('nonsaarc'),
                        nri_fee_structure: buildFeeStructure('nri'),
                        indian_fee_structure: buildFeeStructure('indian'),
                        Mode_of_course: mode.trim(),
                        session: String(sessionVal).trim(),
                        status: 1,
                        updated: currentDT(),
                        updated_by: req.currentUser?.id || 0
                    };

                    // Check if already exists for this institute, specialization, and session
                    const existing = await db.knex('institute_courses')
                        .where({
                            institute_id: instituteId,
                            specialization_id: specRecord.id,
                            session: String(sessionVal).trim()
                        })
                        .first();

                    if (existing) {
                        await db.knex('institute_courses')
                            .where({ id: existing.id })
                            .update(courseData);
                        summary.updated++;
                    } else {
                        courseData.created = currentDT();
                        courseData.created_by = req.currentUser?.id || 0;
                        await db.knex('institute_courses').insert(courseData);
                        summary.created++;
                    }

                } catch (err) {
                    summary.errors++;
                    summary.error_rows.push({
                        row: index + 1,
                        message: err.message
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Import completed',
                result: summary
            });

        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error importing courses' });
        }
    }
}

router.post(
    "/issues",
    [
        body("cat_id").isInt({ gt: 0 }).withMessage("cat_id must be a positive integer"),
        body("description").isString().trim().notEmpty().withMessage("description is required"),
        body("file_id").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("file_id must be a positive integer"),
        validationResponse,
    ],
    InstituteCtrl.createIssue
);

router.get(
    "/issues",
    [
        query("status")
            .optional()
            .isIn(["Open", "In Process", "Closed"])
            .withMessage("Invalid status filter"),
        query("master_session_id")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("master_session_id must be a positive integer"),
        validationResponse,
    ],
    InstituteCtrl.getIssues
);

router.get(
    "/issues/admin",
    [
        query("status")
            .optional()
            .isIn(["Open", "In Process", "Closed"])
            .withMessage("Invalid status filter"),
        query("institute_id")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("institute_id must be a positive integer"),
        query("master_session_id")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("master_session_id must be a positive integer"),
        validationResponse,
    ],
    InstituteCtrl.getIssuesForAdmin
);

router.patch(
    "/issues/:issueId",
    [
        param("issueId").isInt({ gt: 0 }).withMessage("issueId must be a positive integer"),
        body("status")
            .isIn(["Open", "In Process", "Closed"])
            .withMessage("Invalid status value"),
        validationResponse,
    ],
    InstituteCtrl.updateIssueStatus
);

router.get(
    "/issues/:issueId/replies",
    [
        param("issueId").isInt({ gt: 0 }).withMessage("issueId must be a positive integer"),
        validationResponse,
    ],
    InstituteCtrl.getIssueReplies
);

router.post(
    "/issues/:issueId/replies",
    [
        param("issueId").isInt({ gt: 0 }).withMessage("issueId must be a positive integer"),
        body("msg").isString().trim().notEmpty().withMessage("msg is required"),
        body("file_id").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("file_id must be a positive integer"),
        validationResponse,
    ],
    InstituteCtrl.addIssueReply
);

router.post(
    "/issues/delete",
    [
        body("id").notEmpty().withMessage("Issue ID is required"),
        validationResponse,
    ],
    InstituteCtrl.deleteIssue
);

router.delete(
    "/issues/:issueId",
    [
        param("issueId").isInt({ gt: 0 }).withMessage("issueId must be a positive integer"),
        validationResponse,
    ],
    InstituteCtrl.deleteIssue
);

router.get('/logoAndBanner', InstituteCtrl.logoAndBanner);
router.post(
    '/saveLogoBanner',
    [
        body('logo_file_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('logo_file_id must be a positive integer'),
        body('banner_file_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('banner_file_id must be a positive integer'),
        body('institute_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('institute_id must be a positive integer'),
        validationResponse,
    ],
    InstituteCtrl.saveLogoBanner
);

router.post('/courses/import', importUpload.single('file'), InstituteCtrl.importCourses);

module.exports = router;
