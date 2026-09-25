const { Router } = require("express");
const { getYmd, getExt, currentDT } = require("../util/common.util");
const router = Router({ mergeParams: true });
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require("../libraries/db");

const { ensureUploadDirectory } = require("../util/upload_dirs.util");

// store uploads under UP_PATH/YYYY/YYYY-MM/YYYY-MM-DD
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try { console.log('[upload] content-type:', req.headers['content-type']); } catch (e) {}
        try {
            const { dayDir, basePath } = ensureUploadDirectory();
            req._uploadBase = basePath;
            console.log('[upload] resolved destination dir:', dayDir);
            cb(null, dayDir);
        } catch (err) {
            console.error('[upload] failed to ensure upload directory:', err?.message || err);
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        const ext = getExt(file.originalname) || 'none';
        const name = Date.now() + '' + Math.round(Math.random() * 1E9) + '.' + ext;
        console.log('[upload] saving file:', file.originalname, '->', name);
        cb(null, name);
    },
});

// allow common doc/image/video + csv for import
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000 * 1024 * 100 }, //100mb
    fileFilter: (req, file, cb) => {
        const allowedExt = 'gif|jpg|jpeg|png|pdf|doc|xls|ppt|docx|xlsx|pptx|mp4|webp|mkv|avi|mov|csv'.split("|");
        const ext = getExt(file.originalname);
        if (allowedExt.includes(ext?.toLowerCase())) {
            return cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('File type not allowed!'));
        }
    }
});

class FileCtrl {
    static upload = async (req, res) => {
        try {
            console.log('[upload] handler start, file:', !!req.file);
            
            // Check if file was uploaded
            if (!req.file) {
                console.error('[upload] No file received in request');
                return res.status(400).json({ 
                    message: 'No file uploaded. Please select a file to upload.',
                    result: null 
                });
            }
            
            const ext = getExt(req.file.filename);
            const upPath = req._uploadBase || path.resolve(process.env.UP_PATH || 'uploads');
            let destination = path.relative(upPath, req.file.destination).replace(/\\/g, '/');
            if (destination.startsWith('/')) destination = destination.substring(1);
            const relativePath = destination ? `${destination}/${req.file.filename}` : req.file.filename;

            // Choose correct base URL for uploads based on environment
            let baseUrl = process.env.ENVIRONMENT === 'dev' ? process.env.BASE_URL_LOCAL : process.env.BASE_URL;
            if (!baseUrl) {
                baseUrl = process.env.BASE_URL_LOCAL || process.env.BASE_URL || '';
            }
            if (baseUrl && !baseUrl.endsWith('/')) {
                baseUrl += '/';
            }
            const url = `${baseUrl}uploads/${relativePath}`;

            // Save file record to database
            const fileData = {
                title: req.file.originalname || req.file.filename,
                file_name: req.file.filename,
                file_ext: '.' + ext,
                file_size: req.file.size,
                is_image: req.file.mimetype && req.file.mimetype.includes("image/") ? 1 : 0,
                is_pdf: (req.file.mimetype && req.file.mimetype.includes("/pdf")) || ext === 'pdf' ? 1 : 0,
                path: relativePath,  // Store the relative path
                created_by: req.currentUser?.id || 0,
                updated_by: req.currentUser?.id || 0,
                created: currentDT(),
                updated: currentDT()
            };

            const fileId = await db.save("files", fileData, 1, req);

            const result = {
                file_id: fileId,
                file_name: req.file.filename,
                file_ext: '.' + ext,
                file_size: req.file.size,
                is_image: fileData.is_image,
                is_pdf: fileData.is_pdf,
                path: relativePath,
                url
            };

            console.log('[upload] success path:', relativePath, 'url:', url, 'file_id:', fileId);
            return res.status(200).json({ message: 'File uploaded successfully', result });
        } catch (e) {
            console.error('[upload] error:', e?.message || e);
            return res.status(400).json({ message: e.message || 'Error uploading file', result: req.file });
        }
    }

    static download = async (req, res) => {
        try {
            const fileId = req.params.id;
            
            if (!fileId) {
                return res.status(400).json({ message: 'File ID is required' });
            }

            // Get file information from database
            const file = await db.knex("files")
                .select(['id', 'file_name', 'file_ext', 'file_size', 'path', 'created'])
                .where("id", fileId)
                .first();

            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }

            // Build file path
            const upPath = path.resolve(process.env.UP_PATH || 'uploads');
            let filePath;
            
            if (file.path) {
                filePath = path.join(upPath, file.path);
            } else {
                // Fallback: reconstruct path from created date
                const created = new Date(file.created);
                const year = created.getFullYear();
                const month = String(created.getMonth() + 1).padStart(2, '0');
                const day = String(created.getDate()).padStart(2, '0');
                filePath = path.join(upPath, String(year), `${year}-${month}`, `${year}-${month}-${day}`, file.file_name);
            }

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.error('[download] file not found at path:', filePath);
                return res.status(404).json({ message: 'File not found on disk' });
            }

            // Set appropriate headers
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `inline; filename="${file.file_name}"`);
            
            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            
        } catch (e) {
            console.error('[download] error:', e?.message || e);
            return res.status(500).json({ message: e.message || 'Error downloading file' });
        }
    }
}

router.post('/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('[upload] multer error:', err.message || err);
            return res.status(400).json({
                status: false,
                message: err.message || 'File upload error'
            });
        }
        FileCtrl.upload(req, res, next);
    });
});
router.get('/download/:id', FileCtrl.download);

module.exports = router;