// src/controllers/image_base64.ctrl.js
const { Router } = require("express");
const router = Router({ mergeParams: true });
const multer = require('multer');
const fs = require('fs');

// Store in memory for base64 conversion
const storage = multer.memoryStorage();

// Allow only image files
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only image files (PNG, JPG, JPEG, GIF, WEBP) are allowed!'));
        }
    }
});

class ImageBase64Ctrl {
    static uploadToBase64 = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false,
                    message: 'No file uploaded' 
                });
            }

            // Convert buffer to base64
            const base64Data = req.file.buffer.toString('base64');
            const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;

            const result = {
                image_data: base64Data,
                data_uri: dataUri, // Full data URI for direct use in <img> tags
                mime_type: req.file.mimetype,
                file_size: req.file.size,
                original_name: req.file.originalname
            };

            console.log('[upload-base64] success, size:', req.file.size, 'type:', req.file.mimetype);
            
            return res.status(200).json({ 
                success: true,
                message: 'Image converted to base64 successfully', 
                result 
            });
        } catch (e) {
            console.error('[upload-base64] error:', e?.message || e);
            return res.status(400).json({ 
                success: false,
                message: e.message || 'Error converting image to base64' 
            });
        }
    }
}

router.post('/upload-base64', upload.single('file'), ImageBase64Ctrl.uploadToBase64);

module.exports = router;
