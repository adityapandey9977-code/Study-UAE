const db = require("../libraries/db");

const { trim, sendEmail, currentDT } = require("../util/common.util");

const WhatsappService = require("./whatsapp.service");

const CAMPAIGN_STATUS = {

    DRAFT: "draft",

    SCHEDULED: "scheduled",

    SENDING: "sending",

    COMPLETED: "completed",

    CANCELLED: "cancelled"

};

const LOG_STATUS = {

    PENDING: "pending",

    SENT: "sent",

    DELIVERED: "delivered",

    FAILED: "failed"

};

const ALLOWED_CAMPAIGN_TYPES = ["email", "whatsapp"];

 const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

 const clampInt = (value, fallback, min, max) => {

     const n = Number.parseInt(value, 10);

     if (!Number.isFinite(n)) return fallback;

     return Math.min(Math.max(n, min), max);

 };

 const randomInt = (min, max) => {

     const lo = Math.min(min, max);

     const hi = Math.max(min, max);

     return Math.floor(lo + Math.random() * (hi - lo + 1));

 };

 const resolveStaggerSettings = (campaign, body) => {

     const raw = body?.stagger;

     const enabledByDefault = String(campaign?.type || "").toLowerCase() === "whatsapp";

     if (raw === false) {

         return { enabled: false, minMs: 0, maxMs: 0, firstMs: 0 };

     }

     const enabled = typeof raw === "object" && raw !== null

         ? Boolean(raw.enabled ?? true)

         : enabledByDefault;

     if (!enabled) {

         return { enabled: false, minMs: 0, maxMs: 0, firstMs: 0 };

     }

     const minDelaySec = clampInt(raw?.min_delay_sec, 120, 1, 60 * 60);

     const maxDelaySec = clampInt(raw?.max_delay_sec, 300, 1, 60 * 60);

     const firstDelaySec = clampInt(raw?.first_delay_sec, 0, 0, 60 * 60);

     return {

         enabled: true,

         minMs: minDelaySec * 1000,

         maxMs: maxDelaySec * 1000,

         firstMs: firstDelaySec * 1000

     };

 };

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

class CampaignService {

    static scheduledColumnChecked = false;

    static hasScheduledColumn = false;

    static forColumnChecked = false;

    static hasForColumn = false;

    static messageLogColumnSupport = null;

    static async supportsScheduledAt() {

        if (!this.scheduledColumnChecked) {

            try {

                this.hasScheduledColumn = await db.knex.schema.hasColumn("campaigns", "scheduled_at");

            } catch (e) {

                this.hasScheduledColumn = false;

            }

            this.scheduledColumnChecked = true;

        }

        return this.hasScheduledColumn;

    }

    static async supportsForColumn() {

        if (!this.forColumnChecked) {

            try {

                this.hasForColumn = await db.knex.schema.hasColumn("campaigns", "for");

            } catch (e) {

                this.hasForColumn = false;

            }

            this.forColumnChecked = true;

        }

        return this.hasForColumn;

    }

    static async getMessageLogColumnSupport() {

        if (!this.messageLogColumnSupport) {

            const support = {

                hasSentAt: false,

                hasDeliveredAt: false,

                hasCreatedAt: false

            };

            try {

                support.hasSentAt = await db.knex.schema.hasColumn("campaign_message_logs", "sent_at");

            } catch (e) { /* ignore */ }

            try {

                support.hasDeliveredAt = await db.knex.schema.hasColumn("campaign_message_logs", "delivered_at");

            } catch (e) { /* ignore */ }

            try {

                support.hasCreatedAt = await db.knex.schema.hasColumn("campaign_message_logs", "created_at");

            } catch (e) { /* ignore */ }

            this.messageLogColumnSupport = support;

        }

        return this.messageLogColumnSupport;

    }

    static getUserScope(req) {

        const { currentUser } = req;

        return {

            isAdmin: currentUser?.isClient,

            userId: currentUser?.id || 0

        };

    }

    static throwValidationError(message, details = null) {

        const error = new Error(message);

        error.status = 400;

        if (details) {

            error.details = details;

        }

        throw error;

    }

    static normalizeDate(value) {

        if (!value) {

            return null;

        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {

            this.throwValidationError("scheduled_at must be a valid datetime");

        }

        return value;

    }

    static buildCreatePayload(body, { hasScheduledColumn, hasForColumn } = {}) {

        const errors = {};

        const payload = {};

        const name = body.name ? String(body.name).trim() : "";

        if (!name) {

            errors.name = ["name is required"];

        } else if (name.length < 3 || name.length > 120) {

            errors.name = ["name must be between 3 and 120 characters"];

        }

        payload.name = name;

        const type = body.type ? String(body.type).toLowerCase() : "";

        if (!type) {

            errors.type = ["type is required"];

        } else if (!ALLOWED_CAMPAIGN_TYPES.includes(type)) {

            errors.type = ["type must be either email or whatsapp"];

        }

        payload.type = type;

        payload.template_id = body.template_id || null;

        payload.sender_name = body.sender_name ? String(body.sender_name).trim() : null;

        payload.reply_to = body.reply_to ? String(body.reply_to).trim() : null;

        let senderEmail = body.sender_email ? String(body.sender_email).trim() : null;

        if (type === "email") {

            if (!senderEmail) {

                errors.sender_email = ["sender_email is required for email campaigns"];

            } else if (!EMAIL_REGEX.test(senderEmail)) {

                errors.sender_email = ["sender_email is invalid"];

            }

            if (!payload.sender_name) {

                errors.sender_name = ["sender_name is required for email campaigns"];

            }

            if (payload.reply_to && !EMAIL_REGEX.test(payload.reply_to)) {

                errors.reply_to = ["reply_to must be a valid email"];

            }

        } else {

            senderEmail = null;

            payload.reply_to = null;

        }

        payload.sender_email = senderEmail;

        if (hasForColumn) {

            const rawFor = body.for !== undefined ? body.for : body["for"];

            if (rawFor !== undefined) {

                const forValue = rawFor ? String(rawFor).trim() : "";

                payload["for"] = forValue || null;

            }

        }

          // Add status validation

    if (body.status) {

        const status = String(body.status).toLowerCase();

        if (Object.values(CAMPAIGN_STATUS).includes(status)) {

            payload.status = status;

        } else {

            errors.status = ["Invalid status value"];

        }

    }

        if (hasScheduledColumn) {

            payload.scheduled_at = this.normalizeDate(body.scheduled_at || null);

        }

        if (Object.keys(errors).length) {

            this.throwValidationError("Validation failed", errors);

        }

        return payload;

    }

    static applyUpdateValidation(body, campaign, { hasScheduledColumn, hasForColumn } = {}) {

        const errors = {};

        const updates = {};

        if (body.name !== undefined) {

            const name = String(body.name).trim();

            if (!name) {

                errors.name = ["name cannot be empty"];

            } else if (name.length < 3 || name.length > 120) {

                errors.name = ["name must be between 3 and 120 characters"];

            } else {

                updates.name = name;

            }

        }

        if (body.type !== undefined && String(body.type).toLowerCase() !== campaign.type) {

            errors.type = ["type cannot be changed after creation"];

        }

        if (body.template_id !== undefined) {

            updates.template_id = body.template_id || null;

        }

        if (body.sender_name !== undefined) {

            const senderName = body.sender_name ? String(body.sender_name).trim() : null;

            if (campaign.type === "email" && !senderName) {

                errors.sender_name = ["sender_name is required for email campaigns"];

            } else {

                updates.sender_name = senderName;

            }

        }

        if (body.sender_email !== undefined) {

            const senderEmail = body.sender_email ? String(body.sender_email).trim() : null;

            if (campaign.type === "email") {

                if (!senderEmail) {

                    errors.sender_email = ["sender_email is required for email campaigns"];

                } else if (!EMAIL_REGEX.test(senderEmail)) {

                    errors.sender_email = ["sender_email is invalid"];

                } else {

                    updates.sender_email = senderEmail;

                }

            } else {

                updates.sender_email = null;

            }

        }

        if (body.reply_to !== undefined) {

            if (campaign.type !== "email") {

                updates.reply_to = null;

            } else if (body.reply_to && !EMAIL_REGEX.test(body.reply_to)) {

                errors.reply_to = ["reply_to must be a valid email"];

            } else {

                updates.reply_to = body.reply_to ? String(body.reply_to).trim() : null;

            }

        }

        if (hasScheduledColumn && body.scheduled_at !== undefined) {

            updates.scheduled_at = this.normalizeDate(body.scheduled_at);

        }

        if (hasForColumn) {

            const rawFor = body.for !== undefined ? body.for : body["for"];

            if (rawFor !== undefined) {

                const forValue = rawFor ? String(rawFor).trim() : "";

                updates["for"] = forValue || null;

            }

        }

        if (Object.keys(errors).length) {

            this.throwValidationError("Validation failed", errors);

        }

        return updates;

    }

    static applyCampaignFilters(qb, filters, { hasScheduledColumn, hasForColumn } = {}) {

        if (filters.status && filters.status.length) {

            qb.whereIn("c.status", filters.status);

        }

        if (filters.type) {

            qb.where("c.type", filters.type);

        }

        if (filters.name) {

            const term = `%${filters.name}%`;

            qb.where("c.name", "like", term);

        }

        if (filters.search) {

            const term = `%${filters.search}%`;

            qb.where((sub) => {

                sub.where("c.name", "like", term);

            });

        }

        if (hasForColumn && filters.for) {

            const forValue = String(filters.for).toLowerCase();

            qb.whereRaw("LOWER(c.`for`) = ?", [forValue]);

        }

        if (filters.created_from) {

            qb.where("c.created_at", ">=", filters.created_from);

        }

        if (filters.created_to) {

            qb.where("c.created_at", "<=", filters.created_to);

        }

        if (hasScheduledColumn) {

            if (filters.scheduled_from) {

                qb.where("c.scheduled_at", ">=", filters.scheduled_from);

            }

            if (filters.scheduled_to) {

                qb.where("c.scheduled_at", "<=", filters.scheduled_to);

            }

        }

        if (filters.created_by) {

            qb.where("c.created_by", filters.created_by);

        }

    }

    static sanitizeCampaign(row) {

        if (!row) {

            return null;

        }

        const logsSummary = {

            pending: Number(row.pending_count || 0),

            sent: Number(row.sent_count || 0),

            delivered: Number(row.delivered_count || 0),

            failed: Number(row.failed_count || 0)

        };

        delete row.pending_count;

        delete row.sent_count;

        delete row.delivered_count;

        delete row.failed_count;

        return {

            ...row,

            recipient_count: Number(row.recipient_count || 0),

            logs_summary: logsSummary

        };

    }

    static async list(req) {

        const { isAdmin, userId } = this.getUserScope(req);

        const rawQuery = trim(req.query || {});

        const page = rawQuery.page ? Number(rawQuery.page) : 1;

        const pageSize = rawQuery.page_size ? Math.min(Number(rawQuery.page_size), 200) : 25;

        const filters = {

            status: rawQuery.status ? (Array.isArray(rawQuery.status) ? rawQuery.status : String(rawQuery.status).split(",").map((s) => s.trim()).filter(Boolean)).map((s) => String(s).toLowerCase()) : [],

            type: rawQuery.type || null,

            search: rawQuery.search || null,

            name: rawQuery.name || null,

            for: rawQuery.for || rawQuery["for"] || null,

            created_from: rawQuery.created_from || null,

            created_to: rawQuery.created_to || null,

            scheduled_from: rawQuery.scheduled_from || null,

            scheduled_to: rawQuery.scheduled_to || null,

            created_by: rawQuery.created_by || null,

            session_id: rawQuery.session_id || null

        };

        const hasScheduledColumn = await this.supportsScheduledAt();

        const hasForColumn = await this.supportsForColumn();

        const selectColumns = [

            "c.id",

            "c.name",

            "c.type",

            "c.template_id",

            "c.sender_name",

            "c.sender_email",

            "c.reply_to",

            hasForColumn ? "c.for" : db.knex.raw("NULL AS `for`"),

            "c.status",

            hasScheduledColumn ? "c.scheduled_at" : db.knex.raw("NULL AS scheduled_at"),

            "c.created_by",

            "c.created_at",

            "c.updated_at",

            db.knex.raw("COUNT(DISTINCT cr.id) AS recipient_count"),

            db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS pending_count", [LOG_STATUS.PENDING]),

            db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS sent_count", [LOG_STATUS.SENT]),

            db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS delivered_count", [LOG_STATUS.DELIVERED]),

            db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS failed_count", [LOG_STATUS.FAILED])

        ];

        const baseQuery = db.knex({ c: "campaigns" })

            .select(selectColumns)

            .leftJoin({ cr: "campaign_recipients" }, "cr.campaign_id", "c.id")

            .leftJoin({ cml: "campaign_message_logs" }, function () {

                this.on("cml.campaign_id", "=", "c.id").andOn("cml.campaign_recipient_id", "=", "cr.id");

            });

        if (!isAdmin) {

            baseQuery.where("c.created_by", userId);

        }

        this.applyCampaignFilters(baseQuery, filters, { hasScheduledColumn, hasForColumn });

        baseQuery.groupBy("c.id");

        const totalRow = await db.knex({ c: "campaigns" })

            .modify((qb) => {

                if (!isAdmin) {

                    qb.where("c.created_by", userId);

                }

                this.applyCampaignFilters(qb, filters, { hasScheduledColumn, hasForColumn });

            })

            .countDistinct({ total: "c.id" })

            .first();

        const totalItems = Number(totalRow?.total || 0);

        const offset = (page - 1) * pageSize;

        const orderByField = ["created_at", "name", "status"].includes(rawQuery.sort_by) ? rawQuery.sort_by : "created_at";

        const sortOrder = rawQuery.sort_order && ["asc", "desc"].includes(rawQuery.sort_order.toLowerCase()) ? rawQuery.sort_order : "desc";

        const rows = await baseQuery.clone()

            .orderBy(`c.${orderByField}`, sortOrder)

            .limit(pageSize)

            .offset(offset);

        const data = rows.map((row) => this.sanitizeCampaign({ ...row }));

        const totalPages = pageSize ? Math.ceil(totalItems / pageSize) : 1;

        return {

            data,

            meta: {

                page,

                page_size: pageSize,

                total_pages: totalPages,

                total_items: totalItems

            }

        };

    }

    static async getCampaignOrThrow(req, id) {

        const { isAdmin, userId } = this.getUserScope(req);

        const row = await db.knex("campaigns").where({ id }).first();

        if (!row) {

            const error = new Error("Campaign not found");

            error.status = 404;

            throw error;

        }

        if (!isAdmin && row.created_by !== userId) {

            const error = new Error("Access denied");

            error.status = 403;

            throw error;

        }

        return row;

    }

    static async detail(req) {

        const { id } = req.params;

        const campaign = await this.getCampaignOrThrow(req, id);

        const hasScheduledColumn = await this.supportsScheduledAt();

        const row = await db.knex({ c: "campaigns" })

            .select([

                "c.*",

                hasScheduledColumn ? db.knex.raw("c.scheduled_at") : db.knex.raw("NULL AS scheduled_at"),

                db.knex.raw("COUNT(DISTINCT cr.id) AS recipient_count"),

                db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS pending_count", [LOG_STATUS.PENDING]),

                db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS sent_count", [LOG_STATUS.SENT]),

                db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS delivered_count", [LOG_STATUS.DELIVERED]),

                db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS failed_count", [LOG_STATUS.FAILED])

            ])

            .leftJoin({ cr: "campaign_recipients" }, "cr.campaign_id", "c.id")

            .leftJoin({ cml: "campaign_message_logs" }, function () {

                this.on("cml.campaign_id", "=", "c.id").andOn("cml.campaign_recipient_id", "=", "cr.id");

            })

            .where("c.id", campaign.id)

            .groupBy("c.id")

            .first();

        return this.sanitizeCampaign(row || campaign);

    }

    static validateStatusTransition(currentStatus, nextStatus) {

        if (currentStatus === nextStatus) {

            return true;

        }

        const allowed = {

            [CAMPAIGN_STATUS.DRAFT]: [CAMPAIGN_STATUS.SCHEDULED, CAMPAIGN_STATUS.CANCELLED],

            [CAMPAIGN_STATUS.SCHEDULED]: [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.CANCELLED],

            [CAMPAIGN_STATUS.SENDING]: [CAMPAIGN_STATUS.COMPLETED, CAMPAIGN_STATUS.CANCELLED],

            [CAMPAIGN_STATUS.COMPLETED]: [],

            [CAMPAIGN_STATUS.CANCELLED]: []

        };

        return (allowed[currentStatus] || []).includes(nextStatus);

    }

    static async create(req) {

        const body = trim(req.body || {});

        const { userId } = this.getUserScope(req);

        const hasScheduledColumn = await this.supportsScheduledAt();

        const hasForColumn = await this.supportsForColumn();

        const validated = this.buildCreatePayload(body, { hasScheduledColumn, hasForColumn });

        const now = currentDT();

        console.log("validated", validated);

        const payload = {

            ...validated,

            status: validated.status || CAMPAIGN_STATUS.DRAFT,

            created_by: userId,

            created_at: now,

            updated_at: now

        };

        const [id] = await db.knex("campaigns").insert(payload);

        const created = await db.knex("campaigns").where({ id }).first();

        return created;

    }

    static async update(req) {

        const { id } = req.params;

        const campaign = await this.getCampaignOrThrow(req, id);

        const body = trim(req.body || {});

        const hasScheduledColumn = await this.supportsScheduledAt();

        const hasForColumn = await this.supportsForColumn();

        const updates = this.applyUpdateValidation(body, campaign, { hasScheduledColumn, hasForColumn });

        if (updates.status && !this.validateStatusTransition(campaign.status, updates.status)) {

            const error = new Error("Invalid status transition");

            error.status = 400;

            throw error;

        }

        if (Object.keys(updates).length === 0) {

            return campaign;

        }

        updates.updated_at = currentDT();

        await db.knex("campaigns").where({ id }).update(updates);

        return await db.knex("campaigns").where({ id }).first();

    }

    static async remove(req) {

        const { id } = req.params;

        const campaign = await this.getCampaignOrThrow(req, id);

        if (campaign.status !== CAMPAIGN_STATUS.DRAFT) {

            const error = new Error("Only draft campaigns can be deleted");

            error.status = 400;

            throw error;

        }

        await db.knex("campaign_message_logs").where({ campaign_id: id }).del();

        await db.knex("campaign_recipients").where({ campaign_id: id }).del();

        await db.knex("campaigns").where({ id }).del();

        return true;

    }

    static async addRecipients(req) {

        const { id } = req.params;

        const campaign = await this.getCampaignOrThrow(req, id);

        if (campaign.status !== CAMPAIGN_STATUS.DRAFT && campaign.status !== CAMPAIGN_STATUS.SCHEDULED) {

            const error = new Error("Recipients can only be added to draft or scheduled campaigns");

            error.status = 409;

            throw error;

        }

        const body = req.body || {};

        const studentIds = Array.isArray(body.student_ids) ? body.student_ids.map((x) => Number(x)).filter(Boolean) : [];

        const variables = body.variables || {};

        if (!studentIds.length) {

            const error = new Error("student_ids required");

            error.status = 400;

            throw error;

        }

        const uniqueIds = [...new Set(studentIds)];

        

        // Fetch student details with user information for auto-populating variables

        const students = await db.knex("students as s")

            .select([

                "s.id",

                "s.regno",

                "u.name",

                "u.email",

                "u.mobile"

            ])

            .leftJoin("users as u", "u.id", "s.user_id")

            .whereIn("s.id", uniqueIds);

            

        const validStudentIds = students.map((s) => s.id);

        const invalidIds = uniqueIds.filter((id) => !validStudentIds.includes(id));

        if (invalidIds.length) {

            const error = new Error(`Invalid students: ${invalidIds.join(", ")}`);

            error.status = 400;

            throw error;

        }

        const existing = await db.knex("campaign_recipients")

            .select("student_id")

            .where({ campaign_id: id })

            .whereIn("student_id", validStudentIds);

        const existingIds = new Set(existing.map((row) => row.student_id));

        const toInsert = validStudentIds.filter((sid) => !existingIds.has(sid));

        const now = currentDT();

        

        // Import autoLoginUrl function

        const { autoLoginUrl } = require("../util/leads.util");

        

        const rows = toInsert.map((sid) => {

            const student = students.find(s => s.id === sid);

            

            // Auto-populate common variables

            const autoVariables = {

                NAME: student?.name || "",

                name: student?.name || "",

                EMAIL: student?.email || "",

                email: student?.email || "",

                MOBILE: student?.mobile || "",

                mobile: student?.mobile || "",

                REGNO: student?.regno || "",

                regno: student?.regno || "",

                AUTO_LOGIN_URL: student?.email ? autoLoginUrl(student.email) : "",

                auto_login_url: student?.email ? autoLoginUrl(student.email) : "",

                SENDER_NAME: req.currentUser?.name || "",

                sender_name: req.currentUser?.name || "",

                SENDER_EMAIL: req.currentUser?.email || "",

                sender_email: req.currentUser?.email || "",

                SENDER_MOB: req.currentUser?.mobile || "",

                sender_mob: req.currentUser?.mobile || ""

            };

            

            // Merge with custom variables if provided

            const mergedVariables = {

                ...autoVariables,

                ...(variables && variables[sid] ? variables[sid] : {})

            };

            

            return {

                campaign_id: id,

                student_id: sid,

                variables_json: JSON.stringify(mergedVariables),

                created_at: now

            };

        });

        

        if (rows.length) {

            await db.knex("campaign_recipients").insert(rows);

        }

        return {

            inserted_count: rows.length,

            duplicates: [...existingIds]

        };

    }

    static parseJsonField(value) {

        if (!value) {

            return null;

        }

        if (typeof value === "object") {

            return value;

        }

        try {

            return JSON.parse(value);

        } catch (e) {

            return null;

        }

    }

    static async listRecipients(req) {

        const { id } = req.params;

        await this.getCampaignOrThrow(req, id);

        const rawQuery = trim(req.query || {});

        const page = rawQuery.page ? Number(rawQuery.page) : 1;

        const pageSize = rawQuery.page_size ? Math.min(Number(rawQuery.page_size), 200) : 25;

        const offset = (page - 1) * pageSize;

        const base = db.knex({ cr: "campaign_recipients" })

            .select([

                "cr.id",

                "cr.campaign_id",

                "cr.student_id",

                "cr.variables_json",

                "cr.created_at",

                { student_name: "u.name" },

                { student_email: "u.email" },

                { student_mobile: "u.mobile" },

                db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS pending_count", [LOG_STATUS.PENDING]),

                db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS sent_count", [LOG_STATUS.SENT]),

                db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS delivered_count", [LOG_STATUS.DELIVERED]),

                db.knex.raw("SUM(CASE WHEN cml.status = ? THEN 1 ELSE 0 END) AS failed_count", [LOG_STATUS.FAILED])

            ])

            .leftJoin({ s: "students" }, "s.id", "cr.student_id")

            .leftJoin({ u: "users" }, "u.id", "s.user_id")

            .leftJoin({ cml: "campaign_message_logs" }, function () {

                this.on("cml.campaign_recipient_id", "=", "cr.id");

            })

            .where("cr.campaign_id", id)

            .groupBy("cr.id");

        if (rawQuery.student_id) {

            base.where("cr.student_id", Number(rawQuery.student_id));

        }

        if (rawQuery.email) {

            base.where("u.email", rawQuery.email);

        }

        const totalRow = await db.knex("campaign_recipients").where({ campaign_id: id }).count({ total: "id" }).first();

        const totalItems = Number(totalRow?.total || 0);

        const rows = await base.clone().orderBy("cr.id", "desc").limit(pageSize).offset(offset);

        const data = rows.map((row) => ({

            id: row.id,

            campaign_id: row.campaign_id,

            student_id: row.student_id,

            variables_json: this.parseJsonField(row.variables_json),

            created_at: row.created_at,

            student: {

                name: row.student_name,

                email: row.student_email,

                mobile: row.student_mobile

            },

            logs_summary: {

                pending: Number(row.pending_count || 0),

                sent: Number(row.sent_count || 0),

                delivered: Number(row.delivered_count || 0),

                failed: Number(row.failed_count || 0)

            }

        }));

        const totalPages = pageSize ? Math.ceil(totalItems / pageSize) : 1;

        return {

            data,

            meta: {

                page,

                page_size: pageSize,

                total_pages: totalPages,

                total_items: totalItems

            }

        };

    }

    static async removeRecipient(req) {

        const { id, rid } = req.params;

        const campaign = await this.getCampaignOrThrow(req, id);

        if (campaign.status !== CAMPAIGN_STATUS.DRAFT && campaign.status !== CAMPAIGN_STATUS.SCHEDULED) {

            const error = new Error("Cannot remove recipients once campaign is sending or completed");

            error.status = 409;

            throw error;

        }

        const del = await db.knex("campaign_recipients").where({ id: rid, campaign_id: id }).del();

        if (!del) {

            const error = new Error("Recipient not found");

            error.status = 404;

            throw error;

        }

        await db.knex("campaign_message_logs").where({ campaign_recipient_id: rid }).del();

        return true;

    }

    static async listLogs(req) {

        const { id } = req.params;

        await this.getCampaignOrThrow(req, id);

        const rawQuery = trim(req.query || {});

        const page = rawQuery.page ? Number(rawQuery.page) : 1;

        const pageSize = rawQuery.page_size ? Math.min(Number(rawQuery.page_size), 200) : 50;

        const offset = (page - 1) * pageSize;

        const logColumnSupport = await this.getMessageLogColumnSupport();

        const logSelectColumns = [

            "cml.id",

            "cml.campaign_id",

            "cml.campaign_recipient_id",

            "cml.message_body",

            "cml.status",

            "cml.provider_message_id",

            logColumnSupport.hasSentAt ? "cml.sent_at" : db.knex.raw("NULL AS sent_at"),

            logColumnSupport.hasDeliveredAt ? "cml.delivered_at" : db.knex.raw("NULL AS delivered_at"),

            logColumnSupport.hasCreatedAt ? "cml.created_at" : db.knex.raw("NULL AS created_at"),

            { student_id: "cr.student_id" },

            { student_name: "u.name" },

            { student_email: "u.email" },

            { student_mobile: "u.mobile" }

        ];

        const base = db.knex({ cml: "campaign_message_logs" })

            .select(logSelectColumns)

            .leftJoin({ cr: "campaign_recipients" }, "cr.id", "cml.campaign_recipient_id")

            .leftJoin({ s: "students" }, "s.id", "cr.student_id")

            .leftJoin({ u: "users" }, "u.id", "s.user_id")

            .where("cml.campaign_id", id);

        if (rawQuery.status) {

            const statuses = Array.isArray(rawQuery.status) ? rawQuery.status : String(rawQuery.status).split(",");

            base.whereIn("cml.status", statuses);

        }

        if (rawQuery.recipient_id) {

            base.where("cml.campaign_recipient_id", Number(rawQuery.recipient_id));

        }

        if (rawQuery.student_id) {

            base.where("cr.student_id", Number(rawQuery.student_id));

        }

        const totalRow = await base.clone().count({ total: "cml.id" }).first();

        const totalItems = Number(totalRow?.total || 0);

        const rows = await base.clone().orderBy("cml.id", "desc").limit(pageSize).offset(offset);

        const totalPages = pageSize ? Math.ceil(totalItems / pageSize) : 1;

        const data = rows.map((row) => ({

            id: row.id,

            campaign_id: row.campaign_id,

            campaign_recipient_id: row.campaign_recipient_id,

            student_id: row.student_id,

            student: {

                name: row.student_name,

                email: row.student_email,

                mobile: row.student_mobile

            },

            message_body: row.message_body,

            status: row.status,

            provider_message_id: row.provider_message_id,

            sent_at: row.sent_at,

            delivered_at: row.delivered_at,

            created_at: row.created_at

        }));

        return {

            data,

            meta: {

                page,

                page_size: pageSize,

                total_pages: totalPages,

                total_items: totalItems

            }

        };

    }

    static async sendCampaign(req) {

        const { id } = req.params;

        const body = trim(req.body || {});

        const dryRun = Boolean(body.dry_run);

        const testRecipientIds = Array.isArray(body.test_recipient_ids) ? body.test_recipient_ids.map((x) => Number(x)).filter(Boolean) : null;

        const campaign = await this.getCampaignOrThrow(req, id);

        if (!dryRun && ![CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.SCHEDULED].includes(campaign.status)) {

            const error = new Error("Campaign cannot be sent in its current status");

            error.status = 409;

            throw error;

        }

        const recipientsQuery = db.knex({ cr: "campaign_recipients" })

            .select([

                "cr.id",

                "cr.student_id",

                "cr.variables_json",

                { user_id: "u.id" },

                { student_name: "u.name" },

                { student_email: "u.email" },

                { student_mobile: "u.mobile" },

                { country_id: "u.isd_code_country_id" }

            ])

            .leftJoin({ s: "students" }, "s.id", "cr.student_id")

            .leftJoin({ u: "users" }, "u.id", "s.user_id")

            .where("cr.campaign_id", id);

        if (testRecipientIds && testRecipientIds.length) {

            recipientsQuery.whereIn("cr.id", testRecipientIds);

        }

        const recipients = await recipientsQuery;

        if (!recipients.length) {

            const error = new Error("No recipients available for this campaign");

            error.status = 400;

            throw error;

        }

        const template = await this.fetchTemplateForCampaign(campaign);

        const preview = [];

        if (dryRun) {

            for (const rec of recipients.slice(0, 10)) {

                const variables = this.parseJsonField(rec.variables_json) || {};

                const messageBody = this.renderTemplate(template.body, variables);

                preview.push({

                    campaign_recipient_id: rec.id,

                    student_id: rec.student_id,

                    message_body: messageBody

                });

            }

            return {

                campaign_id: campaign.id,

                status: campaign.status,

                preview

            };

        }

        const now = currentDT();

        const logColumnSupport = await this.getMessageLogColumnSupport();

        await db.knex("campaigns").where({ id }).update({ status: CAMPAIGN_STATUS.SENDING, updated_at: now });

        const logRows = [];

        await db.knex.transaction(async (trx) => {

            // Import autoLoginUrl function

            const { autoLoginUrl } = require("../util/leads.util");

            

            for (const rec of recipients) {

                const existing = await trx("campaign_message_logs")

                    .where({ campaign_id: id, campaign_recipient_id: rec.id })

                    .orderBy("id", "desc")

                    .first();

                if (existing && existing.status === LOG_STATUS.SENT) {

                    continue;

                }

                

                // Parse stored variables

                let variables = this.parseJsonField(rec.variables_json) || {};

                

                // Enrich with runtime variables if not already present

                if (!variables.NAME && !variables.name) {

                    variables.NAME = rec.student_name || "";

                    variables.name = rec.student_name || "";

                }

                if (!variables.EMAIL && !variables.email) {

                    variables.EMAIL = rec.student_email || "";

                    variables.email = rec.student_email || "";

                }

                if (!variables.MOBILE && !variables.mobile) {

                    variables.MOBILE = rec.student_mobile || "";

                    variables.mobile = rec.student_mobile || "";

                }

                if (!variables.AUTO_LOGIN_URL && !variables.auto_login_url) {

                    variables.AUTO_LOGIN_URL = rec.student_email ? autoLoginUrl(rec.student_email) : "";

                    variables.auto_login_url = rec.student_email ? autoLoginUrl(rec.student_email) : "";

                }

                if (!variables.SENDER_NAME && !variables.sender_name) {

                    variables.SENDER_NAME = reqContext.currentUser?.name || campaign.sender_name || "";

                    variables.sender_name = reqContext.currentUser?.name || campaign.sender_name || "";

                }

                if (!variables.SENDER_EMAIL && !variables.sender_email) {

                    variables.SENDER_EMAIL = reqContext.currentUser?.email || campaign.sender_email || "";

                    variables.sender_email = reqContext.currentUser?.email || campaign.sender_email || "";

                }

                if (!variables.SENDER_MOB && !variables.sender_mob) {

                    variables.SENDER_MOB = reqContext.currentUser?.mobile || "";

                    variables.sender_mob = reqContext.currentUser?.mobile || "";

                }

                

                const messageBody = this.renderTemplate(template.body, variables);

                const insertPayload = {

                    campaign_id: id,

                    campaign_recipient_id: rec.id,

                    message_body: messageBody,

                    status: LOG_STATUS.PENDING

                };

                if (logColumnSupport.hasCreatedAt) {

                    insertPayload.created_at = now;

                }

                const [logId] = await trx("campaign_message_logs").insert(insertPayload);

                logRows.push({

                    id: logId,

                    ...insertPayload,

                    variables,

                    recipient: rec

                });

            }

        });

        const provider = this.selectProvider(campaign.type);

        const stagger = resolveStaggerSettings(campaign, body);

        const reqContext = { currentUser: req.currentUser, headers: req.headers };

        setImmediate(async () => {

            const results = [];

            try {

                for (let idx = 0; idx < logRows.length; idx += 1) {

                    const log = logRows[idx];

                    if (stagger.enabled) {

                        const delayMs = idx === 0

                            ? stagger.firstMs

                            : randomInt(stagger.minMs, stagger.maxMs);

                        if (delayMs > 0) {

                            await sleep(delayMs);

                        }

                    }

                    try {

                        const sendResult = await this.dispatchMessage(

                            provider,

                            campaign,

                            template,

                            log.recipient,

                            log.message_body,

                            reqContext

                        );

                        const successUpdate = {

                            status: sendResult.status,

                            provider_message_id: sendResult.provider_message_id || null

                        };

                        if (logColumnSupport.hasSentAt) {

                            successUpdate.sent_at = sendResult.sent_at || currentDT();

                        }

                        if (logColumnSupport.hasDeliveredAt) {

                            successUpdate.delivered_at = sendResult.delivered_at || null;

                        }

                        await db.knex("campaign_message_logs").where({ id: log.id }).update(successUpdate);

                        results.push({

                            campaign_message_log_id: log.id,

                            status: sendResult.status,

                            provider_message_id: sendResult.provider_message_id || null

                        });

                    } catch (err) {

                        const failureUpdate = {

                            status: LOG_STATUS.FAILED

                        };

                        if (logColumnSupport.hasSentAt) {

                            failureUpdate.sent_at = currentDT();

                        }

                        if (logColumnSupport.hasDeliveredAt) {

                            failureUpdate.delivered_at = null;

                        }

                        await db.knex("campaign_message_logs").where({ id: log.id }).update(failureUpdate);

                        results.push({

                            campaign_message_log_id: log.id,

                            status: LOG_STATUS.FAILED,

                            error: err.message

                        });

                    }

                }

            } catch (e) {

                try {

                    console.error("Campaign dispatch worker failed:", e);

                } catch (_) {

                    // ignore

                }

            } finally {

                try {

                    const summaryCounts = await db.knex("campaign_message_logs")

                        .where({ campaign_id: id })

                        .count({ total: "id" })

                        .first();

                    const failedCount = results.filter((r) => r.status === LOG_STATUS.FAILED).length;

                    const nextStatus = failedCount === 0 ? CAMPAIGN_STATUS.COMPLETED : CAMPAIGN_STATUS.SENDING;

                    await db.knex("campaigns").where({ id }).update({ status: nextStatus, updated_at: currentDT() });

                    if (Number(summaryCounts?.total || 0) === 0) {

                        await db.knex("campaigns").where({ id }).update({ status: CAMPAIGN_STATUS.SENDING, updated_at: currentDT() });

                    }

                } catch (e) {

                    try {

                        console.error("Campaign status update failed:", e);

                    } catch (_) {

                        // ignore

                    }

                }

            }

        });

        const summaryCounts = await db.knex("campaign_message_logs")

            .where({ campaign_id: id })

            .count({ total: "id" })

            .first();

        return {

            campaign_id: id,

            status: CAMPAIGN_STATUS.SENDING,

            queued_count: logRows.length,

            total_logs: Number(summaryCounts?.total || 0),

            provider: provider.name,

            stagger: stagger.enabled ? { enabled: true, min_ms: stagger.minMs, max_ms: stagger.maxMs } : { enabled: false }

        };

    }

    static async fetchTemplateForCampaign(campaign) {

        if (!campaign.template_id) {

            return {

                body: "",

                subject: campaign.name

            };

        }

        if (campaign.type === "email") {

            const tpl = await db.knex("email_templates").select(["id", "subject", "body"]).where({ id: campaign.template_id }).first();

            if (!tpl) {

                throw new Error("Email template not found");

            }

            return {

                body: tpl.body || "",

                subject: tpl.subject || campaign.name

            };

        }

        if (campaign.type === "whatsapp") {

            const tpl = await db.knex("whatsapp_templates").select(["id", "body", "name"]).where({ id: campaign.template_id }).first();

            if (!tpl) {

                throw new Error("WhatsApp template not found");

            }

            return {

                body: tpl.body || "",

                subject: tpl.name || campaign.name

            };

        }

        return {

            body: "",

            subject: campaign.name

        };

    }

    static renderTemplate(templateBody, variables) {

        if (!templateBody) {

            return "";

        }

        let rendered = templateBody;

        Object.entries(variables || {}).forEach(([key, value]) => {

            // Support multiple template formats:

            // 1. {{variable}} - double curly braces

            // 2. {%VARIABLE%} - curly braces with percent

            // 3. %VARIABLE% - percent signs only

            const patterns = [

                new RegExp(`{{\\s*${key}\\s*}}`, "gi"),

                new RegExp(`{%\\s*${key}\\s*%}`, "gi"),

                new RegExp(`%${key}%`, "gi")

            ];

            patterns.forEach(pattern => {

                rendered = rendered.replace(pattern, value != null ? String(value) : "");

            });

        });

        return rendered;

    }

    static selectProvider(type) {

        if (type === "email") {

            return {

                name: process.env.CAMPAIGN_EMAIL_PROVIDER || "emailProvider1",

                send: async ({ recipient, campaign, template, message }) => {

                    const subject = template.subject || campaign.name;

                    const result = await sendEmail(recipient.student_email, subject, message, campaign.sender_name, campaign.sender_email, campaign.reply_to);

                    if (!result?.success) {

                        const err = new Error("Email provider failed");

                        throw err;

                    }

                    return {

                        status: LOG_STATUS.SENT,

                        provider_message_id: result.resp?.messageId || null,

                        sent_at: currentDT()

                    };

                }

            };

        }

        if (type === "whatsapp") {

            return {

                name: process.env.CAMPAIGN_WHATSAPP_PROVIDER || "whatsappProvider1",

                send: async ({ recipient, message, req }) => {

                    const mobile = recipient.student_mobile;

                    if (!mobile) {

                        const err = new Error("Recipient mobile not found");

                        throw err;

                    }

                    let phonecode = "";

                    if (recipient.country_id) {

                        const country = await db.knex("master_countries").select("isd_code").where({ id: recipient.country_id }).first();

                        phonecode = (country?.isd_code || "91").replace("+", "");

                    }

                    const to = `${phonecode || "91"}${mobile}`;

                    const resp = await WhatsappService.sendMessage({ to, msg: message }, req);

                    if (resp?.status === "error") {

                        const err = new Error(resp.message || "WhatsApp provider failed");

                        throw err;

                    }

                    return {

                        status: LOG_STATUS.SENT,

                        provider_message_id: resp?.message_id || null,

                        sent_at: currentDT()

                    };

                }

            };

        }

        const err = new Error("No provider configured for campaign type");

        err.status = 400;

        throw err;

    }

    static async dispatchMessage(provider, campaign, template, recipient, message, req) {

        return provider.send({ recipient, campaign, template, message, req });

    }

}

module.exports = CampaignService;