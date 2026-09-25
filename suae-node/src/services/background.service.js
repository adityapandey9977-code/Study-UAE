// src/services/background.service.js
const db = require('../libraries/db');

class BackgroundService {
    static async create(backgroundData) {
        const [id] = await db.knex('backgrounds').insert({
            ...backgroundData,
            created_at: new Date(),
            updated_at: new Date()
        });
        return this.getById(id);
    }

    static async getAll() {
        const backgrounds = await db.knex('backgrounds').select('*').orderBy('created_at', 'desc');
        
        // Convert base64 to data URLs for display
        return backgrounds.map(background => {
            if (background.image_data && background.mime_type && !background.file_url) {
                background.file_url = `data:${background.mime_type};base64,${background.image_data}`;
            }
            return background;
        });
    }

    static async getById(id) {
        return db.knex('backgrounds').where({ id }).first();
    }

    static async update(id, updateData) {
        await db.knex('backgrounds')
            .where({ id })
            .update({
                ...updateData,
                updated_at: new Date()
            });
        return this.getById(id);
    }

    static async delete(id) {
        const background = await this.getById(id);
        if (!background) return null;

        // Note: We don't need to handle file deletion as it's managed by the file service
        await db.knex('backgrounds').where({ id }).del();
        return background;
    }

    static async setActive(id) {
        // Get the background to activate
        const background = await this.getById(id);
        if (!background) return null;

        // Set all backgrounds with the same title to inactive first
        await db.knex('backgrounds')
            .where({ title: background.title })
            .update({ is_active: false });
        
        // Set the selected one as active
        await db.knex('backgrounds')
            .where({ id })
            .update({ is_active: true, updated_at: new Date() });

        return this.getById(id);
    }

    static async getActive() {
        return db.knex('backgrounds').where({ is_active: true }).first();
    }
}

module.exports = BackgroundService;