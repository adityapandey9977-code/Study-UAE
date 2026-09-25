const { Router } = require("express");
const fs = require("fs");
const path = require("path");
const StudentLettersService = require("../services/student_letters.service");
const {
    validateListEligible,
    validateScfParam,
    validateUploadInstituteLetter,
    validateUploadStudentVisa,
    validateReviewDecision,
    validatePickupPayload
} = require("../middleware/student_letters.mw");

const router = Router({ mergeParams: true });

class StudentLettersCtrl {
    static handleError(res, error) {
        const status = error.status || 500;
        const payload = { message: error.message || "Error" };
        if (error.details) {
            payload.details = error.details;
        }
        return res.status(status).json(payload);
    }

    static async listEligible(req, res) {
        try {
            const data = await StudentLettersService.listEligible(req);
            return res.status(200).json({ message: "", data });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async getDetail(req, res) {
        try {
            const { scfId } = req.params;
            const data = await StudentLettersService.getDetail(Number(scfId), req);
            return res.status(200).json({ message: "", data });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async uploadAdmissionLetter(req, res) {
        try {
            const { scfId } = req.params;
            const { file_id } = req.body;
            const data = await StudentLettersService.uploadAdmissionLetter({ scfId: Number(scfId), fileId: file_id }, req);
            return res.status(200).json({ message: "Admission letter uploaded", data });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async uploadVisaLetter(req, res) {
        try {
            const { scfId } = req.params;
            const { file_id } = req.body;
            const data = await StudentLettersService.uploadVisaLetter({ scfId: Number(scfId), fileId: file_id }, req);
            return res.status(200).json({ message: "Visa letter uploaded", data });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async uploadStudentVisa(req, res) {
        try {
            const { scfId } = req.params;
            const { file_id } = req.body;
            const data = await StudentLettersService.uploadStudentVisa({ scfId: Number(scfId), fileId: file_id }, req);
            return res.status(200).json({ message: "Student visa uploaded", data });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async reviewStudentVisa(req, res) {
        try {
            const { scfId } = req.params;
            const { decision } = req.body;
            const data = await StudentLettersService.reviewStudentVisa({ scfId: Number(scfId), decision }, req);
            return res.status(200).json({ message: "Student visa review updated", data });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async uploadPickupSchedule(req, res) {
        try {
            const { scfId } = req.params;
            const { pickup, file_id } = req.body;
            const data = await StudentLettersService.uploadPickupSchedule({ scfId: Number(scfId), pickup, fileId: file_id }, req);
            return res.status(200).json({ message: "Pickup schedule uploaded", data });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async downloadFile(kind, req, res) {
        try {
            const { scfId } = req.params;
            
            let meta;
            try {
                meta = await StudentLettersService.getFileFor(kind, Number(scfId), req);
            } catch (error) {
                // If file not found (404), return a user-friendly message
                if (error.status === 404) {
                    const kindLabel = kind.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return res.status(404).json({ 
                        message: `${kindLabel} has not been uploaded yet for this student`
                    });
                }
                throw error;
            }

            const basePath = path.resolve(process.env.UP_PATH || 'uploads');
            const candidates = [
                path.resolve(basePath, meta.relative_path),
                path.resolve('/var/www/html/uploads', meta.relative_path),
                path.resolve(__dirname, '../../uploads', meta.relative_path),
                path.resolve(__dirname, '../uploads', meta.relative_path),
                path.resolve(process.cwd(), 'uploads', meta.relative_path)
            ];
            const fullPath = candidates.find(c => fs.existsSync(c)) || candidates[0];
            
            // Check if file exists locally
            if (fs.existsSync(fullPath)) {
                const fileName = `${meta.suggested_name}${path.extname(fullPath) || ''}`;
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Content-Type', 'application/octet-stream');

                const stream = fs.createReadStream(fullPath);
                stream.pipe(res);
                stream.on('error', () => {
                    if (!res.headersSent) {
                        return res.status(500).json({ message: 'Error downloading file' });
                    }
                });
                return;
            }

            // File not found locally - try to proxy from PHP backend
            console.log(`File not found locally (${fullPath}), attempting to proxy from PHP backend for download`);
            
            const fileName = path.basename(meta.relative_path);
            let phpBaseUrl = (process.env.PHP_API_ENDPOINT || 'https://suae-php.questdigiflex.com').replace(/\/+$/, '');
            const phpFileUrl = `${phpBaseUrl}/uploads/files/${fileName}`;
            
            console.log('Proxying download from:', phpFileUrl);
            
            const https = require('https');
            const http = require('http');
            const protocol = phpFileUrl.startsWith('https') ? https : http;
            
            protocol.get(phpFileUrl, (phpRes) => {
                if (phpRes.statusCode !== 200) {
                    console.error('PHP backend returned status:', phpRes.statusCode);
                    const kindLabel = kind.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return res.status(404).json({ 
                        message: `${kindLabel} file not found. It may not have been uploaded yet.`
                    });
                }
                
                // Set appropriate headers for download
                const downloadFileName = `${meta.suggested_name}${path.extname(fileName) || ''}`;
                res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                
                // Pipe the response from PHP to client
                phpRes.pipe(res);
            }).on('error', (error) => {
                console.error('Error fetching from PHP backend:', error);
                if (!res.headersSent) {
                    const kindLabel = kind.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return res.status(404).json({ 
                        message: `${kindLabel} not available. Please ensure it has been uploaded.`
                    });
                }
            });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async viewFile(kind, req, res) {
        try {
            const { scfId } = req.params;
            
            let meta;
            try {
                meta = await StudentLettersService.getFileFor(kind, Number(scfId), req);
            } catch (error) {
                // If file not found (404), return a user-friendly message
                if (error.status === 404) {
                    const kindLabel = kind.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return res.status(404).json({ 
                        message: `${kindLabel} has not been uploaded yet for this student`
                    });
                }
                throw error;
            }

            const basePath = path.resolve(process.env.UP_PATH || 'uploads');
            const candidates = [
                path.resolve(basePath, meta.relative_path),
                path.resolve('/var/www/html/uploads', meta.relative_path),
                path.resolve(__dirname, '../../uploads', meta.relative_path),
                path.resolve(__dirname, '../uploads', meta.relative_path),
                path.resolve(process.cwd(), 'uploads', meta.relative_path)
            ];
            const fullPath = candidates.find(c => fs.existsSync(c)) || candidates[0];
            const fileExists = fs.existsSync(fullPath);
            
            console.log(`Attempting to view ${kind} for scfId ${scfId}:`, {
                relative_path: meta.relative_path,
                fullPath,
                exists: fileExists,
                UP_PATH: process.env.UP_PATH
            });

            // Check if file exists locally
            if (fileExists) {
                const ext = path.extname(fullPath).toLowerCase();
                const mime =
                    ext === '.pdf' ? 'application/pdf' :
                    ext === '.png' ? 'image/png' :
                    (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' :
                    ext === '.webp' ? 'image/webp' :
                    ext === '.gif' ? 'image/gif' :
                    'application/octet-stream';
                res.setHeader('Content-Disposition', 'inline');
                res.setHeader('Content-Type', mime);

                const stream = fs.createReadStream(fullPath);
                stream.pipe(res);
                stream.on('error', (err) => {
                    console.error('Error streaming file:', err);
                    if (!res.headersSent) {
                        return res.status(500).json({ message: 'Error streaming file' });
                    }
                });
                return;
            }

            // File not found locally - try to proxy from PHP backend
            console.log(`File not found locally (${fullPath}), attempting to proxy from PHP backend`);
            
            const fileName = path.basename(meta.relative_path);
            let phpBaseUrl = (process.env.PHP_API_ENDPOINT || 'https://suae-php.questdigiflex.com').replace(/\/+$/, '');
            const phpFileUrl = `${phpBaseUrl}/uploads/files/${fileName}`;
            
            console.log('Proxying file from:', phpFileUrl);
            
            const https = require('https');
            const http = require('http');
            const protocol = phpFileUrl.startsWith('https') ? https : http;
            
            protocol.get(phpFileUrl, (phpRes) => {
                if (phpRes.statusCode !== 200) {
                    console.error('PHP backend returned status:', phpRes.statusCode);
                    const kindLabel = kind.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return res.status(404).json({ 
                        message: `${kindLabel} file not found. It may not have been uploaded yet.`
                    });
                }
                
                // Set appropriate headers
                const ext = path.extname(fileName).toLowerCase();
                const mime =
                    ext === '.pdf' ? 'application/pdf' :
                    ext === '.png' ? 'image/png' :
                    (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' :
                    ext === '.webp' ? 'image/webp' :
                    ext === '.gif' ? 'image/gif' :
                    'application/octet-stream';
                res.setHeader('Content-Disposition', 'inline');
                res.setHeader('Content-Type', mime);
                
                // Pipe the response from PHP to client
                phpRes.pipe(res);
            }).on('error', (error) => {
                console.error('Error fetching from PHP backend:', error);
                if (!res.headersSent) {
                    const kindLabel = kind.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return res.status(404).json({ 
                        message: `${kindLabel} not available. Please ensure it has been uploaded.`
                    });
                }
            });
        } catch (error) {
            console.error('Error in viewFile:', error);
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    static async deleteAllDocuments(req, res) {
        try {
            const { scfId } = req.params;
            const data = await StudentLettersService.deleteAllDocuments({ scfId: Number(scfId) }, req);
            return res.status(200).json({ message: "All documents deleted successfully", data });
        } catch (error) {
            return StudentLettersCtrl.handleError(res, error);
        }
    }

    
}

router.get("/", validateListEligible, StudentLettersCtrl.listEligible);
router.get("/:scfId", validateScfParam, StudentLettersCtrl.getDetail);
router.post("/:scfId/admission-letter", validateUploadInstituteLetter, StudentLettersCtrl.uploadAdmissionLetter);
router.post("/:scfId/visa-letter", validateUploadInstituteLetter, StudentLettersCtrl.uploadVisaLetter);
router.post("/:scfId/student-visa", validateUploadStudentVisa, StudentLettersCtrl.uploadStudentVisa);
router.post("/:scfId/student-visa/review", validateReviewDecision, StudentLettersCtrl.reviewStudentVisa);
router.post("/:scfId/pickup", validatePickupPayload, StudentLettersCtrl.uploadPickupSchedule);
router.get("/:scfId/admission-letter/download", validateScfParam, (req, res) => StudentLettersCtrl.downloadFile('admission-letter', req, res));
router.get("/:scfId/visa-letter/download", validateScfParam, (req, res) => StudentLettersCtrl.downloadFile('visa-letter', req, res));
router.get("/:scfId/student-visa/download", validateScfParam, (req, res) => StudentLettersCtrl.downloadFile('student-visa', req, res));
router.get("/:scfId/pickup/download", validateScfParam, (req, res) => StudentLettersCtrl.downloadFile('pickup', req, res));
router.get("/:scfId/offer-letter/download", validateScfParam, (req, res) => StudentLettersCtrl.downloadFile('offer-letter', req, res));
router.get("/:scfId/payment-proof/download", validateScfParam, (req, res) => StudentLettersCtrl.downloadFile('payment-proof', req, res));

router.get("/:scfId/admission-letter/view", validateScfParam, (req, res) => StudentLettersCtrl.viewFile('admission-letter', req, res));
router.get("/:scfId/visa-letter/view", validateScfParam, (req, res) => StudentLettersCtrl.viewFile('visa-letter', req, res));
router.get("/:scfId/student-visa/view", validateScfParam, (req, res) => StudentLettersCtrl.viewFile('student-visa', req, res));
router.get("/:scfId/pickup/view", validateScfParam, (req, res) => StudentLettersCtrl.viewFile('pickup', req, res));
router.get("/:scfId/offer-letter/view", validateScfParam, (req, res) => StudentLettersCtrl.viewFile('offer-letter', req, res));
router.get("/:scfId/payment-proof/view", validateScfParam, (req, res) => StudentLettersCtrl.viewFile('payment-proof', req, res));

// Payment slip routes
router.post("/:scfId/payment-slip", validateUploadInstituteLetter, async (req, res) => {
    try {
        const { scfId } = req.params;
        const { file_id } = req.body;
        const data = await StudentLettersService.uploadPaymentSlip({ scfId: Number(scfId), fileId: file_id }, req);
        return res.status(200).json({ message: "Payment slip uploaded", data });
    } catch (error) {
        return StudentLettersCtrl.handleError(res, error);
    }
});
router.get("/:scfId/payment-slip/download", validateScfParam, (req, res) => StudentLettersCtrl.downloadFile('payment-slip', req, res));
router.get("/:scfId/payment-slip/view", validateScfParam, (req, res) => StudentLettersCtrl.viewFile('payment-slip', req, res));


// Payment Proof From Student

router.post("/:scfId/payment-proof", validateUploadInstituteLetter, async (req, res) => {
    try {
        const { scfId } = req.params;
        const { file_id,student_id , user_id } = req.body;
        const data = await StudentLettersService.uploadStudentPaymentProof({ scfId: Number(scfId), fileId: file_id, student_id, user_id }, req);
        return res.status(200).json({ message: "Payment slip uploaded", data });
    } catch (error) {
        return StudentLettersCtrl.handleError(res, error);
    }
});

// Ticket routes
router.post("/:scfId/ticket", validateUploadInstituteLetter, async (req, res) => {
    try {
        const { scfId } = req.params;
        const { file_id } = req.body;
        const data = await StudentLettersService.uploadTicket({ scfId: Number(scfId), fileId: file_id }, req);
        return res.status(200).json({ message: "Ticket uploaded", data });
    } catch (error) {
        return StudentLettersCtrl.handleError(res, error);
    }
});
router.get("/:scfId/ticket/download", validateScfParam, (req, res) => StudentLettersCtrl.downloadFile('ticket', req, res));
router.get("/:scfId/ticket/view", validateScfParam, (req, res) => StudentLettersCtrl.viewFile('ticket', req, res));

// Delete all documents for a student
router.delete("/:scfId/documents", validateScfParam, StudentLettersCtrl.deleteAllDocuments);




















module.exports = router;
