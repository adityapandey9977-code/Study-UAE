const db = require("../libraries/db");
const { trim } = require("../util/common.util");

class EmailTemplatesService {
    static normalizeRequestBody(req) {
        let bodyData = req.body;
        if (typeof bodyData === 'string') {
            try { bodyData = JSON.parse(bodyData); } catch (e) { bodyData = {}; }
        }
        if (bodyData && typeof bodyData === 'object') {
            // Common wrappers from some clients
            if (bodyData.data !== undefined) {
                const wrapped = bodyData.data;
                if (typeof wrapped === 'string') {
                    try { bodyData = JSON.parse(wrapped); } catch (e) { bodyData = {}; }
                } else {
                    bodyData = wrapped;
                }
            } else if (bodyData.payload !== undefined) {
                const wrapped = bodyData.payload;
                if (typeof wrapped === 'string') {
                    try { bodyData = JSON.parse(wrapped); } catch (e) { bodyData = {}; }
                } else {
                    bodyData = wrapped;
                }
            }
        }
        return bodyData || {};
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
            const err = new Error("Only super admin or institute can access this endpoint");
            err.status = 403;
            throw err;
        }
    }

    static async list(req) {
        this.ensureSuperAdminOrInstitute(req);
        const { p, ps, k = '', type = '', status = '' } = trim(req.query || {});
        const qb = db.knex("email_templates").select([
            'id', 'name', 'subject', 'type', 'status', 'language', 'description', 'created', 'updated'
        ]).where((q) => {
            if (k) {
                q.where('name', 'like', `%${k}%`).orWhere('subject', 'like', `%${k}%`).orWhere('description', 'like', `%${k}%`);
            }
            if (type) {
                q.andWhere({ type });
            }
            if (status) {
                q.andWhere({ status });
            }
        }).orderBy('id', 'desc');

        return await db.pagedRows(qb, p, ps || 20);
    }

    static async detail(req) {
        this.ensureSuperAdminOrInstitute(req);
        const { id } = req.params;
        const row = await db.knex('email_templates').where({ id }).first();
        if (!row) {
            throw new Error('Template not found');
        }
        return row;
    }

    static async create(req) {
        this.ensureSuperAdmin(req);
        const raw = this.normalizeRequestBody(req);
        const data = trim(raw || {});
        const allowed = ['name', 'subject', 'body', 'type', 'status', 'variables', 'language', 'description', 'is_html'];
        const payload = {};
        for (const k of allowed) {
            if (data[k] !== undefined) payload[k] = data[k];
        }
        // Coerce types
        if (payload.is_html !== undefined) {
            payload.is_html = [true, 'true', 1, '1', 'yes', 'on'].includes(payload.is_html) ? 1 : 0;
        }
        if (!payload.name || !payload.subject || !payload.body) {
            throw new Error('name, subject and body are required');
        }
        if (typeof payload.variables === 'string') {
            try { payload.variables = JSON.parse(payload.variables); } catch (e) { /* leave as string */ }
        }
        if (payload.variables && typeof payload.variables !== 'string') {
            try { payload.variables = JSON.stringify(payload.variables); } catch (e) { /* ignore */ }
        }
        const id = await db.save('email_templates', payload, 2, req);
        return await db.knex('email_templates').where({ id }).first();
    }

    static async update(req) {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        const raw = this.normalizeRequestBody(req);
        const data = trim(raw || {});
        const allowed = ['name', 'subject', 'body', 'type', 'status', 'variables', 'language', 'description', 'is_html'];
        const payload = { id: id * 1 };
        for (const k of allowed) {
            if (data[k] !== undefined) payload[k] = data[k];
        }
        if (payload.is_html !== undefined) {
            payload.is_html = [true, 'true', 1, '1', 'yes', 'on'].includes(payload.is_html) ? 1 : 0;
        }
        if (typeof payload.variables === 'string') {
            try { payload.variables = JSON.parse(payload.variables); } catch (e) { /* leave as string */ }
        }
        if (payload.variables && typeof payload.variables !== 'string') {
            try { payload.variables = JSON.stringify(payload.variables); } catch (e) { /* ignore */ }
        }
        const savedId = await db.save('email_templates', payload, 2, req);
        if (!savedId) {
            throw new Error('Update failed');
        }
        return await db.knex('email_templates').where({ id }).first();
    }

    static async remove(req) {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        const del = await db.delete('email_templates', { id });
        return { success: del > 0 };
    }
}

module.exports = EmailTemplatesService;


