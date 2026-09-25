const db = require("../libraries/db");
const { trim } = require("../util/common.util");

class WhatsappTemplatesService {
    static toDisplayType(category) {
        const raw = String(category || '').trim();
        if (!raw) {
            return 'Follow Up';
        }

        const upper = raw.toUpperCase();
        const directMap = {
            FOLLOW_UP: 'Follow Up',
            BULK_CAMPAIGN: 'Bulk Campaign',
            NOTIFICATION: 'Notification',
        };
        if (directMap[upper]) {
            return directMap[upper];
        }

        const parts = upper
            .replace(/\s+/g, '_')
            .split('_')
            .filter(Boolean)
            .map((w) => w.charAt(0) + w.slice(1).toLowerCase());

        return parts.join(' ');
    }

    static normalizeCategory(input) {
        const raw = String(input || '').trim();
        if (!raw) {
            return '';
        }
        return raw.toUpperCase().replace(/\s+/g, '_');
    }

    static ensureSuperAdmin(req) {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error("Only super admin can access this endpoint");
        }
    }

    static normalizeRequestBody(req) {
        let bodyData = req.body;

        // If body is already an object, use it directly
        if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
            return { ...req.body };
        }
        if (typeof bodyData === 'string') {
            try { bodyData = JSON.parse(bodyData); } catch (e) { bodyData = {}; }
        }
        if (bodyData && typeof bodyData === 'object') {
            if (bodyData.data !== undefined) {
                const wrapped = bodyData.data;
                if (typeof wrapped === 'string') {
                    try { bodyData = JSON.parse(wrapped); } catch (e) { bodyData = {}; }
                } else { bodyData = wrapped; }
            } else if (bodyData.payload !== undefined) {
                const wrapped = bodyData.payload;
                if (typeof wrapped === 'string') {
                    try { bodyData = JSON.parse(wrapped); } catch (e) { bodyData = {}; }
                } else { bodyData = wrapped; }
            }
        }
        return bodyData || {};
    }

    static async list(req) {
        this.ensureSuperAdmin(req);
        const { p, ps, k = '', category = '', status = '' } = trim(req.query || {});
        const qb = db.knex("whatsapp_templates")
            .select(['id','name','language','category','status','media_type','description','body as message','created','updated'])
            .where((q) => {
                if (k) {
                    q.where('name', 'like', `%${k}%`).orWhere('description', 'like', `%${k}%`);
                }
                if (category) { q.andWhere({ category }); }
                if (status) { q.andWhere({ status }); }
            })
            .orderBy('id','desc');

        const result = await db.pagedRows(qb, p, ps || 20);
        result.data = (result.data || []).map((row) => ({
            ...row,
            status: row.status || 'ACTIVE',
            type: this.toDisplayType(row.category),
        }));

        return result;
    }

    static async detail(req) {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        const row = await db.knex('whatsapp_templates').where({ id }).first();
        if (!row) { throw new Error('Template not found'); }
        return {
            ...row,
            status: row.status || 'ACTIVE',
            type: this.toDisplayType(row.category),
        };
    }

    static async create(req) {
    this.ensureSuperAdmin(req);
    
    
    const raw = this.normalizeRequestBody(req);
    const data = { ...raw };    
    const categoryInput = data.type || data.category || 'FOLLOW_UP';

    const payload = {
        name: String(data.name || '').trim(),
        category: this.normalizeCategory(categoryInput) || 'FOLLOW_UP',
        status: String(data.status || 'DRAFT').toUpperCase(),
        language: String(data.language || 'en').toLowerCase(),
        body: String(data.body || data.message || '').trim(),
        header: data.header ? String(data.header).trim() : null,
        footer: data.footer ? String(data.footer).trim() : null,
        media_type: String(data.media_type || 'TEXT').toUpperCase(),
        description: data.description ? String(data.description).trim() : null,
        buttons: data.buttons || null,
        variables: data.variables || '{}'
    };

    if (!payload.name || !payload.body) {
        throw new Error('Name and body are required');
    }

    try {
        
        if (payload.buttons) {
            try {
                payload.buttons = JSON.stringify(
                    typeof payload.buttons === 'string' 
                        ? JSON.parse(payload.buttons)
                        : payload.buttons
                );
            } catch (e) {
                console.error('Error parsing buttons:', e);
                payload.buttons = null;
            }
        }
        try {
            payload.variables = JSON.stringify(
                typeof payload.variables === 'string'
                    ? JSON.parse(payload.variables)
                    : (payload.variables || {})
            );
        } catch (e) {
            console.error('Error parsing variables:', e);
            payload.variables = '{}';
        }
    } catch (e) {
        console.error('Error processing JSON fields:', e);
        throw new Error('Invalid JSON in buttons or variables');
    }

    const id = await db.save('whatsapp_templates', payload, 2, req);
    if (!id) {
        throw new Error('Failed to save template');
    }

   
    const savedTemplate = await db.knex('whatsapp_templates').where({ id }).first();
    return {
        ...savedTemplate,
        status: savedTemplate?.status || 'ACTIVE',
        type: this.toDisplayType(savedTemplate?.category),
    };
}
    static async update(req) {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        const raw = this.normalizeRequestBody(req);
        const data = trim(raw || {});
        console.log('DEBUG update raw payload:', raw);
        console.log('DEBUG update trimmed data:', data);

        const categoryInput = data.type || data.category;
        const normalizedCategory = this.normalizeCategory(categoryInput);
        console.log('DEBUG categoryInput:', categoryInput, '=> normalizedCategory:', normalizedCategory);


        const payload = {
            id: id * 1, // Ensure ID is a number
            name: data.name,
            category: normalizedCategory, // do NOT fallback to undefined
            status: data.status ? data.status.toUpperCase() : undefined,
            language: data.language,
            body: data.body || data.message,
            header: data.header,
            footer: data.footer,
            buttons: data.buttons,
            variables: data.variables,
            media_type: data.media_type ? data.media_type.toUpperCase() : undefined,
            description: data.description
        };
        console.log('DEBUG update payload before DB save:', payload);


        const updateData = { ...payload };
        delete updateData.id; // don't include id in the update set
        const updatedRows = await db.knex('whatsapp_templates')
            .where({ id })
            .update(updateData);
        console.log('DEBUG Knex update returned updatedRows:', updatedRows);

        await db.knex.raw('UPDATE whatsapp_templates SET category = ? WHERE id = ?', [normalizedCategory, id]);
        console.log('DEBUG forced raw category update to:', normalizedCategory);
        const saved = await db.knex('whatsapp_templates').where({ id }).first();
        console.log('DEBUG reloaded from DB after update:', saved);
        return {
            ...saved,
            status: saved?.status || 'ACTIVE',
            type: this.toDisplayType(saved?.category),
        };
    }

    static async remove(req) {
        this.ensureSuperAdmin(req);
        const { id } = req.params;
        const del = await db.delete('whatsapp_templates', { id });
        return { success: del > 0 };
    }
}

module.exports = WhatsappTemplatesService;


