const db = require("../libraries/db");
const { trim } = require("../util/common.util");

class ColorSchemeService {
    static tableName = "color_schemes";

    static ensureSuperAdmin(req) {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error("Only super admin can access this endpoint");
        }
    }

    static normalizeBody(req) {
        let body = req.body;
        if (typeof body === "string") {
            try { body = JSON.parse(body); } catch (e) { body = {}; }
        }
        return trim(body || {});
    }

    static parseStatus(value, { required = false } = {}) {
        if (value === undefined || value === null) {
            return required ? "INACTIVE" : undefined;
        }
        const str = `${value}`.trim().toUpperCase();
        if (!str) {
            return required ? "INACTIVE" : undefined;
        }
        if (["ACTIVE", "1", "TRUE", "YES", "ENABLED"].includes(str)) {
            return "ACTIVE";
        }
        if (["INACTIVE", "0", "FALSE", "NO", "DISABLED"].includes(str)) {
            return "INACTIVE";
        }
        throw new Error("Invalid status value. Use ACTIVE or INACTIVE");
    }

    static ensureColorPayload(data) {
        const requiredFields = ["name", "primary_color", "secondary_color", "accent_color", "neutral_color"];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`${field.replace(/_/g, ' ')} is required`);
            }
        }
    }

    static formatRow(row) {
        if (!row) {
            return null;
        }
        return {
            ...row,
            is_active: row.status === "ACTIVE",
        };
    }

    static buildPayload(data) {
        const allowed = ["name", "primary_color", "secondary_color", "accent_color", "neutral_color", "status"];
        const payload = {};
        for (const key of allowed) {
            if (data[key] !== undefined) {
                payload[key] = typeof data[key] === "string" ? data[key].trim() : data[key];
            }
        }
        if (payload.status !== undefined) {
            payload.status = this.parseStatus(payload.status, { required: true });
        }
        return payload;
    }

    static async list(req) {
        const { status } = trim(req.query || {});
        const qb = db.knex(this.tableName)
            .select(["id", "name", "primary_color", "secondary_color", "accent_color", "neutral_color", "status", "created", "updated"])
            .orderBy("id", "desc");

        const filterStatus = this.parseStatus(status);
        if (filterStatus) {
            qb.where({ status: filterStatus });
        }

        const rows = await qb;
        return rows.map((row) => this.formatRow(row));
    }

    static async getActive() {
        const row = await db.knex(this.tableName)
            .select(["id", "name", "primary_color", "secondary_color", "accent_color", "neutral_color", "status", "created", "updated"])
            .where({ status: "ACTIVE" })
            .orderBy("updated", "desc")
            .first();
        return this.formatRow(row);
    }

    static async findById(id) {
        if (!id) {
            return null;
        }
        const row = await db.knex(this.tableName).where({ id }).first();
        return row || null;
    }

    static async detail(req) {
        const { id } = req.params;
        const row = await this.findById(id);
        if (!row) {
            throw new Error("Color scheme not found");
        }
        return this.formatRow(row);
    }

    static async create(req) {
        this.ensureSuperAdmin(req);
        const raw = this.normalizeBody(req);
        const payload = this.buildPayload(raw);
        this.ensureColorPayload(payload);
        if (!payload.status) {
            payload.status = "INACTIVE";
        }

        return await db.knex.transaction(async (trx) => {
            if (payload.status === "ACTIVE") {
                await trx(this.tableName).update({ status: "INACTIVE" });
            }
            const id = await db.save(this.tableName, payload, 2, req, trx);
            const row = await trx(this.tableName).where({ id }).first();
            return this.formatRow(row);
        });
    }

    static async update(req) {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error("Color scheme not found");
        }

        const raw = this.normalizeBody(req);
        const payload = this.buildPayload(raw);
        if (!Object.keys(payload).length) {
            throw new Error("No fields to update");
        }

        const merged = { ...existing, ...payload };
        this.ensureColorPayload(merged);
        payload.id = id * 1;

        return await db.knex.transaction(async (trx) => {
            if (payload.status === "ACTIVE") {
                await trx(this.tableName).update({ status: "INACTIVE" });
            }
            const savedId = await db.save(this.tableName, payload, 2, req, trx);
            const row = await trx(this.tableName).where({ id: savedId }).first();
            return this.formatRow(row);
        });
    }

    static async remove(req) {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error("Color scheme not found");
        }
        const deleted = await db.delete(this.tableName, { id });
        return { success: deleted > 0 };
    }
}

module.exports = ColorSchemeService;
