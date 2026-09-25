// src/services/logo.service.js
const db = require('../libraries/db');

class LogoService {
    static async create(logoData) {
        const [id] = await db.knex('logos').insert({
            ...logoData,
            created_at: new Date(),
            updated_at: new Date()
        });
        return this.getById(id);
    }

    static async getAll() {
        const logos = await db.knex('logos').select('*').orderBy('created_at', 'desc');
        
        // Convert base64 to data URLs for display
        return logos.map(logo => {
            if (logo.image_data && logo.mime_type && !logo.file_url) {
                logo.file_url = `data:${logo.mime_type};base64,${logo.image_data}`;
            }
            return logo;
        });
    }

    static async getById(id) {
        return db.knex('logos').where({ id }).first();
    }

    static async update(id, updateData) {
        await db.knex('logos')
            .where({ id })
            .update({
                ...updateData,
                updated_at: new Date()
            });
        return this.getById(id);
    }

    static async delete(id) {
        const logo = await this.getById(id);
        if (!logo) return null;

        await db.knex('logos').where({ id }).del();
        return logo;
    }

    static async setActive(id) {
        // Set all logos to inactive first
        await db.knex('logos').update({ is_active: false });
        
        // Set the selected one as active
        await db.knex('logos')
            .where({ id })
            .update({ is_active: true, updated_at: new Date() });

        return this.getById(id);
    }

    static async getActive() {
        return db.knex('logos').where({ is_active: true }).first();
    }
}

module.exports = LogoService;
