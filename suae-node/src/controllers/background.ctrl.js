// src/controllers/background.controller.js
const db = require('../libraries/db');
const BackgroundService = require('../services/background.service');

class BackgroundController {
    static async upload(req, res, next) {
        try {
            // Support both base64 upload and legacy file_url upload
            if (!req.body.image_data && !req.body.file_url) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Either image_data (base64) or file_url is required' 
                });
            }

            const backgroundData = {
                title: req.body.title || 'Background Image',
                description: req.body.description || '',
                is_active: false
            };

            // Check if image_data column exists
            const hasImageDataColumn = await db.knex.schema.hasColumn('backgrounds', 'image_data');

            // New base64 approach (if column exists)
            if (req.body.image_data && hasImageDataColumn) {
                backgroundData.image_data = req.body.image_data;
                backgroundData.mime_type = req.body.mime_type || 'image/jpeg';
                backgroundData.file_size = req.body.file_size || null;
            } 
            // Legacy file_url approach (backward compatibility)
            else if (req.body.file_url) {
                backgroundData.file_url = req.body.file_url;
                backgroundData.file_id = req.body.file_id || null;
            }
            // If base64 provided but column doesn't exist
            else if (req.body.image_data && !hasImageDataColumn) {
                return res.status(400).json({
                    success: false,
                    message: 'Database migration required. Please run the base64 migration script.'
                });
            }

            const background = await BackgroundService.create(backgroundData);
            
            res.status(201).json({
                success: true,
                data: background,
                message: 'Background added successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const backgrounds = await BackgroundService.getAll();
            res.json({
                success: true,
                data: backgrounds
            });
        } catch (error) {
            next(error);
        }
    }

    static async getActive(req, res, next) {
        try {
            const { title } = req.query;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Title parameter is required'
                });
            }

            const activeBackground = await db.knex('backgrounds')
                .where({
                    is_active: true,
                    title: title
                })
                .first();

            if (!activeBackground) {
                return res.json({
                    success: true,
                    data: null,
                    message: `No active background found for ${title}`
                });
            }

            // If image_data exists (base64), convert to data URL
            if (activeBackground.image_data && activeBackground.mime_type) {
                activeBackground.file_url = `data:${activeBackground.mime_type};base64,${activeBackground.image_data}`;
            }

            // Add cache control headers to prevent caching
            res.set({
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store'
            });

            res.json({
                success: true,
                data: activeBackground,
                message: `Active background retrieved successfully for ${title}`
            });
        } catch (error) {
            console.error('Error fetching active background:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async setActive(req, res, next) {
        try {
            const { id } = req.params;
            const background = await BackgroundService.setActive(id);
            
            if (!background) {
                return res.status(404).json({
                    success: false,
                    message: 'Background not found'
                });
            }

            res.json({
                success: true,
                data: background,
                message: 'Background set as active'
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const background = await BackgroundService.delete(id);
            
            if (!background) {
                return res.status(404).json({
                    success: false,
                    message: 'Background not found'
                });
            }

            res.json({
                success: true,
                message: 'Background deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BackgroundController;