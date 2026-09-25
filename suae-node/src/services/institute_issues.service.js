const db = require("../libraries/db");
const { currentDT } = require("../util/common.util");

const ISSUE_STATUSES = ["Open", "In Process", "Closed"];

class InstituteIssuesService {
    static buildUploadsFileUrl = (fileName, req) => {
        const name = (fileName || '').toString().trim();
        if (!name) return '';
        let base = (process.env.BASE_URL || process.env.BASE_URL_LOCAL || '').toString().trim();
        if (!base) {
            try {
                const host = req && req.get ? req.get('host') : '';
                const proto = req && req.protocol ? req.protocol : 'http';
                if (host) base = `${proto}://${host}/`;
            } catch (e) {
                base = '';
            }
        }
        if (base && !base.endsWith('/')) base += '/';
        try {
            return `${base}uploads/files/${encodeURIComponent(name)}`;
        } catch (e) {
            return `${base}uploads/files/${name}`;
        }
    }

    static resolveSessionRange = async (master_session_id) => {
        const id = Number(master_session_id);
        if (!id) return null;
        const session = await db.knex("master_session")
            .select(["id", "session_startdt", "session_enddt"])
            .where({ id })
            .first();
        if (!session) {
            throw new Error("Invalid master_session_id");
        }
        return session;
    }

    static createIssue = async (payload, req) => {
        const { institute_id } = req.currentUser || {};
        if (!institute_id) {
            throw new Error("Institute ID not found in user context");
        }

        const { cat_id, description, file_id = null } = payload || {};

        if (!cat_id) {
            throw new Error("Category is required");
        }

        if (!description) {
            throw new Error("Description is required");
        }

        const category = await this.getIssueCategoryById(cat_id);
        if (!category) {
            throw new Error("Invalid issue category");
        }

        const issueData = {
            institute_id,
            cat_id,
            description,
            file_id,
            status: "Open",
        };

        const issueId = await db.save("institute_issues", issueData, 2, req);

        return await this.getIssueById(issueId);
    }

    static getIssuesForInstitute = async (req) => {
        const { institute_id } = req.currentUser || {};
        if (!institute_id) {
            throw new Error("Institute ID not found in user context");
        }

        const { status, master_session_id } = req.query || {};

        const query = db.knex("institute_issues as ii")
            .select([
                "ii.id",
                "ii.institute_id",
                "ii.cat_id",
                "ii.description",
                "ii.file_id",
                "ii.status",
                "ii.created",
                "ii.updated",
                "ii.created_by",
                "ii.updated_by",
                db.knex.raw("COALESCE(cu.name, '') as created_by_name"),
                db.knex.raw("COALESCE(uu.name, '') as updated_by_name"),
                db.knex.raw("COALESCE(files.file_name, '') as file_name"),
                db.knex.raw(
                    "(SELECT COUNT(*) FROM institute_issues_replies iir WHERE iir.issue_id = ii.id) as reply_count"
                )
            ])
            .leftJoin({ cu: "users" }, "cu.id", "ii.created_by")
            .leftJoin({ uu: "users" }, "uu.id", "ii.updated_by")
            .leftJoin({ files: "files" }, "files.id", "ii.file_id")
            .where("ii.institute_id", institute_id)
            .orderBy("ii.created", "desc");

        if (master_session_id) {
            const session = await this.resolveSessionRange(master_session_id);
            query.andWhereRaw(
                "DATE(ii.created) >= DATE(?) AND DATE(ii.created) <= DATE(?)",
                [session.session_startdt, session.session_enddt]
            );
        }

        if (status) {
            if (!ISSUE_STATUSES.includes(status)) {
                throw new Error("Invalid status filter");
            }
            query.andWhere("ii.status", status);
        }

        const rows = await query;
        return (rows || []).map((r) => {
            const file_url = this.buildUploadsFileUrl(r.file_name, req);
            return file_url ? { ...r, file_url } : r;
        });
    }

    static getIssueCategories = async () => {
        return db.knex("master_issues_cats")
            .select(["id", "name", "display_order"])
            .where("status", 1)
            .orderBy("display_order", "asc")
            .orderBy("name", "asc");
    }

    static getIssuesForAdmin = async (req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error("Only super admin can access this endpoint");
        }

        const { status, institute_id, master_session_id } = req.query || {};

        const query = db.knex("institute_issues as ii")
            .select([
                "ii.id",
                "ii.institute_id",
                "ii.cat_id",
                "ii.description",
                "ii.file_id",
                "ii.status",
                "ii.created",
                "ii.updated",
                "ii.created_by",
                "ii.updated_by",
                db.knex.raw("COALESCE(cu.name, '') as created_by_name"),
                db.knex.raw("COALESCE(uu.name, '') as updated_by_name"),
                db.knex.raw("COALESCE(inst.name, '') as institute_name"),
                db.knex.raw("COALESCE(inst.city, '') as institute_city"),
                "inst.state_id",
                db.knex.raw("COALESCE(files.file_name, '') as file_name"),
                db.knex.raw(
                    "(SELECT COUNT(*) FROM institute_issues_replies iir WHERE iir.issue_id = ii.id) as reply_count"
                )
            ])
            .leftJoin({ cu: "users" }, "cu.id", "ii.created_by")
            .leftJoin({ uu: "users" }, "uu.id", "ii.updated_by")
            .leftJoin({ inst: "institutes" }, "inst.id", "ii.institute_id")
            .leftJoin({ files: "files" }, "files.id", "ii.file_id")
            .orderBy("ii.created", "desc");

        if (master_session_id) {
            const session = await this.resolveSessionRange(master_session_id);
            query.andWhereRaw(
                "DATE(ii.created) >= DATE(?) AND DATE(ii.created) <= DATE(?)",
                [session.session_startdt, session.session_enddt]
            );
        }

        if (status) {
            if (!ISSUE_STATUSES.includes(status)) {
                throw new Error("Invalid status filter");
            }
            query.andWhere("ii.status", status);
        }

        if (institute_id) {
            query.andWhere("ii.institute_id", institute_id);
        }

        const rows = await query;
        return (rows || []).map((r) => {
            const file_url = this.buildUploadsFileUrl(r.file_name, req);
            return file_url ? { ...r, file_url } : r;
        });
    }

    static updateIssueStatus = async (issueId, status, req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error("Only super admin can update institute issues");
        }

        if (!issueId) {
            throw new Error("Issue ID is required");
        }

        if (!status) {
            throw new Error("Status is required");
        }

        if (!ISSUE_STATUSES.includes(status)) {
            throw new Error("Invalid status provided");
        }

        const existingIssue = await db.knex("institute_issues").where({ id: issueId }).first();

        if (!existingIssue) {
            throw new Error("Issue not found");
        }

        await db.save("institute_issues", { id: issueId, status }, 2, req);

        return await this.getIssueById(issueId);
    }

    static getIssueById = async (issueId) => {
        if (!issueId) {
            return null;
        }

        const row = await db.knex("institute_issues as ii")
            .select([
                "ii.id",
                "ii.institute_id",
                "ii.cat_id",
                "ii.description",
                "ii.file_id",
                "ii.status",
                "ii.created",
                "ii.updated",
                "ii.created_by",
                "ii.updated_by",
                db.knex.raw("COALESCE(cu.name, '') as created_by_name"),
                db.knex.raw("COALESCE(uu.name, '') as updated_by_name"),
                db.knex.raw("COALESCE(inst.name, '') as institute_name"),
                db.knex.raw("COALESCE(inst.city, '') as institute_city"),
                "inst.state_id",
                db.knex.raw("COALESCE(files.file_name, '') as file_name"),
                db.knex.raw(
                    "(SELECT COUNT(*) FROM institute_issues_replies iir WHERE iir.issue_id = ii.id) as reply_count"
                )
            ])
            .leftJoin({ cu: "users" }, "cu.id", "ii.created_by")
            .leftJoin({ uu: "users" }, "uu.id", "ii.updated_by")
            .leftJoin({ inst: "institutes" }, "inst.id", "ii.institute_id")
            .leftJoin({ files: "files" }, "files.id", "ii.file_id")
            .where("ii.id", issueId)
            .first();

        if (!row) return null;
        const file_url = this.buildUploadsFileUrl(row.file_name, null);
        return file_url ? { ...row, file_url } : row;
    }

    static getIssueReplies = async (issueId, req) => {
        if (!issueId) {
            return [];
        }

        await this.ensureIssueAccess(issueId, req);

        return db.knex("institute_issues_replies as iir")
            .select([
                "iir.id",
                "iir.issue_id",
                "iir.file_id",
                "iir.msg",
                "iir.created",
                "iir.created_by",
                db.knex.raw("COALESCE(u.name, '') as created_by_name"),
                db.knex.raw("COALESCE(files.file_name, '') as file_name"),
                db.knex.raw("COALESCE(files.file_ext, '') as file_ext"),
                db.knex.raw("COALESCE(files.file_size, 0) as file_size")
            ])
            .leftJoin({ u: "users" }, "u.id", "iir.created_by")
            .leftJoin({ files: "files" }, "files.id", "iir.file_id")
            .where("iir.issue_id", issueId)
            .orderBy("iir.created", "asc");
    }

    static addIssueReply = async (issueId, payload, req) => {
        if (!issueId) {
            throw new Error("Issue ID is required");
        }

        await this.ensureIssueAccess(issueId, req);

        const { file_id = null, msg } = payload || {};

        const message = (msg || "").toString().trim();
        if (!message) {
            throw new Error("Message is required");
        }

        const data = {
            issue_id: issueId,
            file_id,
            msg: message,
            created: currentDT(),
            created_by: req.currentUser?.id || 0,
        };

        const ids = await db.knex("institute_issues_replies").insert(data);
        const replyId = ids[0] || false;
        if (!replyId) {
            throw new Error("Failed to add reply");
        }

        return db.knex("institute_issues_replies as iir")
            .select([
                "iir.id",
                "iir.issue_id",
                "iir.file_id",
                "iir.msg",
                "iir.created",
                "iir.created_by",
                db.knex.raw("COALESCE(u.name, '') as created_by_name"),
                db.knex.raw("COALESCE(files.file_name, '') as file_name"),
                db.knex.raw("COALESCE(files.file_ext, '') as file_ext"),
                db.knex.raw("COALESCE(files.file_size, 0) as file_size")
            ])
            .leftJoin({ u: "users" }, "u.id", "iir.created_by")
            .leftJoin({ files: "files" }, "files.id", "iir.file_id")
            .where("iir.id", replyId)
            .first();
    }

    static ensureIssueAccess = async (issueId, req) => {
        const issue = await this.getIssueById(issueId);
        if (!issue) {
            throw new Error("Issue not found");
        }

        const { isClient, isInstitute, institute_id } = req.currentUser || {};

        if (isClient) {
            return issue;
        }

        const instituteId = institute_id ? Number(institute_id) : null;
        const issueInstituteId = issue.institute_id ? Number(issue.institute_id) : null;

        if (isInstitute && instituteId && issueInstituteId && instituteId === issueInstituteId) {
            return issue;
        }

        throw new Error("You do not have permission to access this issue");
    }

    static getIssueCategoryById = async (catId) => {
        if (!catId) {
            return null;
        }

        return db.knex("master_issues_cats")
            .select(["id", "name", "display_order", "status", "client_id"])
            .where({ id: catId, status: 1 })
            .first();
    }

    static deleteIssue = async (issueId, req) => {
        if (!issueId) {
            throw new Error("Issue ID is required");
        }

        const { isAdmin, isInstitute, institute_id } = req.currentUser || {};

        // Check if issue exists
        const issue = await db.knex("institute_issues")
            .where({ id: issueId })
            .first();

        if (!issue) {
            throw new Error("Issue not found");
        }

        // If admin, allow deletion without institute check
        if (isAdmin) {
            // Delete replies first (foreign key constraint)
            await db.knex("institute_issues_replies")
                .where({ issue_id: issueId })
                .del();
            
            // Delete the issue
            await db.knex("institute_issues")
                .where({ id: issueId })
                .del();
            
            return { success: true };
        }

        // For institutes, verify ownership
        if (isInstitute && institute_id) {
            if (Number(issue.institute_id) !== Number(institute_id)) {
                throw new Error("You do not have permission to delete this issue");
            }

            // Delete replies first
            await db.knex("institute_issues_replies")
                .where({ issue_id: issueId })
                .del();
            
            // Delete the issue
            await db.knex("institute_issues")
                .where({ id: issueId })
                .del();
            
            return { success: true };
        }

        throw new Error("Unauthorized to delete this issue");
    }
}

InstituteIssuesService.STATUSES = ISSUE_STATUSES;

module.exports = InstituteIssuesService;
