// src/controllers/logo.ctrl.js
const db = require('../libraries/db');
const LogoService = require('../services/logo.service');
const crypto = require('crypto');

class LogoController {
    static async upload(req, res, next) {
        try {
            let file_url = req.body.file_url;
            let file_id = req.body.file_id;

            // Support base64 upload (image_data + mime_type) from LogoChange.js
            if (!file_url && req.body.image_data && req.body.mime_type) {
                const { image_data, mime_type } = req.body;
                file_url = `data:${mime_type};base64,${image_data}`;
                file_id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
            }

            if (!file_url) {
                return res.status(400).json({
                    success: false,
                    message: 'Either file_url or image_data with mime_type is required'
                });
            }

            const logoData = {
                file_url,
                file_id: file_id || crypto.randomBytes(16).toString('hex'),
                is_active: false,
                title: req.body.title || 'Logo',
                description: req.body.description || 'Uploaded from admin panel'
            };

            // Check if image_data column exists
            const hasImageDataColumn = await db.knex.schema.hasColumn('logos', 'image_data');

            // New base64 approach (if column exists)
            if (req.body.image_data && hasImageDataColumn) {
                logoData.image_data = req.body.image_data;
                logoData.mime_type = req.body.mime_type || 'image/png';
                logoData.file_size = req.body.file_size || null;
            } 
            // Legacy file_url approach (backward compatibility)
            else if (req.body.file_url) {
                logoData.file_url = req.body.file_url;
                logoData.file_id = req.body.file_id || null;
            }
            // If base64 provided but column doesn't exist
            else if (req.body.image_data && !hasImageDataColumn) {
                return res.status(400).json({
                    success: false,
                    message: 'Database migration required. Please run the base64 migration script.'
                });
            }

            const logo = await LogoService.create(logoData);

            res.status(201).json({
                success: true,
                data: logo,
                message: 'Logo added successfully'
            });
        } catch (error) {
            console.error('Logo upload error:', error);
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const logos = await LogoService.getAll();
            res.json({
                success: true,
                data: logos
            });
        } catch (error) {
            next(error);
        }
    }

    static async getActive(req, res, next) {
        try {
            const activeLogo = await db.knex('logos')
                .where({ is_active: true })
                .first();

            if (!activeLogo) {
                return res.json({
                    success: false,
                    data: null,
                    message: 'No active logo found'
                });
            }

            // If image_data exists (base64), convert to data URL
            if (activeLogo.image_data && activeLogo.mime_type) {
                activeLogo.file_url = `data:${activeLogo.mime_type};base64,${activeLogo.image_data}`;
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
                data: activeLogo,
                message: 'Active logo retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching active logo:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async setActive(req, res, next) {
        try {
            const { id } = req.params;
            const logo = await LogoService.setActive(id);

            if (!logo) {
                return res.status(404).json({
                    success: false,
                    message: 'Logo not found'
                });
            }

            res.json({
                success: true,
                data: logo,
                message: 'Logo set as active'
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const logo = await LogoService.delete(id);

            if (!logo) {
                return res.status(404).json({
                    success: false,
                    message: 'Logo not found'
                });
            }

            res.json({
                success: true,
                message: 'Logo deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LogoController;
