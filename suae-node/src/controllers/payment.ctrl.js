const { Router } = require("express");
const router = Router({ mergeParams: true });
const fs = require('fs');
const path = require('path');
const PaymentService = require("../services/payment.service");
const { trim } = require("../util/common.util");

class PaymentCtrl {
    /**
     * Get list of students with payment slips for the logged-in institute
     * GET /payment/slips
     */
    static getPaymentSlips = async (req, res) => {
        try {
            const { isInstitute, id: user_id, institute_id } = req.currentUser;
            
            console.log('Payment slips request - User context:', { isInstitute, user_id, institute_id });
            
            let paymentSlips = [];
            if (isInstitute) {
                paymentSlips = await PaymentService.getPaymentSlipsForInstitute(req);
                console.log(`Found ${paymentSlips.length} payment slips for institute ${institute_id}`);
            } else if (req.currentUser.isStudent) {
                paymentSlips = await PaymentService.getPaymentSlipsForStudent(req);
                console.log(`Found ${paymentSlips.length} payment slips for student ${user_id}`);
            } else {
                return res.status(403).json({ message: "Access denied" });
            }
            
            const buildFileUrl = (created, fileName) => {
                try {
                    if (!created || !fileName) return null;
                    
                    // Files uploaded via PHP are stored on PHP server
                    // Use PHP_API_ENDPOINT to construct the URL
                    const phpBaseUrl = process.env.PHP_API_ENDPOINT;
                    console.log('Using PHP base URL for file building:', phpBaseUrl);
                    
                    // PHP stores files in /uploads/files/ directory
                    return `${phpBaseUrl}/uploads/files/${fileName}`;
                } catch (e) {
                    console.error('Error building file URL:', e);
                    return null;
                }
            };

            // Add download URL + direct file URL for each payment slip
            const paymentSlipsWithUrls = paymentSlips.map(slip => {
                const fileUrl = buildFileUrl(slip.file_created, slip.file_name);
                return {
                    ...slip,
                    user_id: slip.user_id ?? user_id,
                    institute_id: (slip.institute_id ?? institute_id),
                    download_url: `/payment/download/${slip.scf_id}`,
                    file_url: fileUrl
                };
            });

            return res.status(200).json({ 
                message: 'Payment slips retrieved successfully',
                data: paymentSlipsWithUrls 
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error retrieving payment slips' });
        }
    }

    /**
     * Download payment slip file
     * GET /payment/download/:scfId
     */
    static downloadPaymentSlip = async (req, res) => {
        try {
            const { isInstitute } = req.currentUser;
            const { scfId } = req.params;
            
            if (!scfId) {
                return res.status(400).json({ message: "Student choice filling ID is required" });
            }

            const paymentSlip = isInstitute
                ? await PaymentService.getPaymentSlipFile(scfId, req)
                : req.currentUser.isStudent
                    ? await PaymentService.getPaymentSlipFileForStudent(scfId, req)
                    : null;

            if (!paymentSlip) {
                return res.status(403).json({ message: "Access denied" });
            }
            
            if (!paymentSlip.payment_slip_file_id) {
                return res.status(404).json({ message: "File not found" });
            }

            // Get file information
            const file = await PaymentService.getFileById(paymentSlip.payment_slip_file_id);

            // Reconstruct file path based on creation date and filename
            // (uploads are stored under UP_PATH/YYYY/YYYY-MM/YYYY-MM-DD)
            const createdDate = new Date(file.created);
            const year = createdDate.getFullYear();
            const month = String(createdDate.getMonth() + 1).padStart(2, '0');
            const day = String(createdDate.getDate()).padStart(2, '0');
            const filePath = `${year}/${year}-${month}/${year}-${month}-${day}/${file.file_name}`;
            const fullFilePath = path.join(process.env.UP_PATH, filePath);
            
            // Check if file exists locally first
            if (fs.existsSync(fullFilePath)) {
                // File exists locally - serve it directly
                const fileName = `${paymentSlip.student_name}_payment_slip_${paymentSlip.specialization}${file.file_ext}`;
                
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                const ext = (file.file_ext || path.extname(file.file_name || '') || '').toLowerCase();
                const contentType =
                    ext === '.pdf' ? 'application/pdf' :
                    ext === '.png' ? 'image/png' :
                    (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' :
                    ext === '.webp' ? 'image/webp' :
                    ext === '.gif' ? 'image/gif' :
                    'application/octet-stream';
                res.setHeader('Content-Type', contentType);

                const fileStream = fs.createReadStream(fullFilePath);
                fileStream.pipe(res);

                fileStream.on('error', (error) => {
                    console.error('Error streaming file:', error);
                    if (!res.headersSent) {
                        return res.status(500).json({ message: 'Error downloading file' });
                    }
                });
            } else {
                // File not found locally - try to proxy from PHP backend
                console.log('File not found locally, attempting to proxy from PHP backend');
                
                // Build the PHP file URL
                const phpBaseUrl = process.env.PHP_API_ENDPOINT;
                console.log('Using PHP base URL for file proxy:', phpBaseUrl);
                const phpFileUrl = `${phpBaseUrl}/uploads/files/${file.file_name}`;
                
                console.log('Proxying file from:', phpFileUrl);
                
                // Use axios or https to fetch from PHP backend
                const https = require('https');
                const http = require('http');
                const protocol = phpFileUrl.startsWith('https') ? https : http;
                
                protocol.get(phpFileUrl, (phpRes) => {
                    if (phpRes.statusCode !== 200) {
                        console.error('PHP backend returned status:', phpRes.statusCode);
                        return res.status(404).json({ message: "File not found on PHP server" });
                    }
                    
                    // Set appropriate headers
                    const fileName = `${paymentSlip.student_name}_payment_slip_${paymentSlip.specialization}${file.file_ext}`;
                    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                    
                    const ext = (file.file_ext || path.extname(file.file_name || '') || '').toLowerCase();
                    const contentType =
                        ext === '.pdf' ? 'application/pdf' :
                        ext === '.png' ? 'image/png' :
                        (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' :
                        ext === '.webp' ? 'image/webp' :
                        ext === '.gif' ? 'image/gif' :
                        'application/octet-stream';
                    res.setHeader('Content-Type', contentType);
                    
                    // Pipe the response from PHP to client
                    phpRes.pipe(res);
                }).on('error', (error) => {
                    console.error('Error fetching from PHP backend:', error);
                    if (!res.headersSent) {
                        return res.status(500).json({ message: 'Error fetching file from PHP server' });
                    }
                });
            }

        } catch (e) {
            console.error('Payment slip download error:', e);
            return res.status(400).json({ message: e.message || 'Error downloading payment slip' });
        }
    }

    /**
     * Get payment slip statistics for the logged-in institute
     * GET /payment/stats
     */
    static getPaymentStats = async (req, res) => {
        try {
            const { isInstitute } = req.currentUser;

            const stats = await PaymentService.getPaymentSlipStats(req);
            
            return res.status(200).json({ 
                message: 'Payment statistics retrieved successfully',
                data: stats 
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error retrieving payment statistics' });
        }
    }

    /**
     * Get payment slip details for a specific student choice filling
     * GET /payment/details/:scfId
     */
    static getPaymentSlipDetails = async (req, res) => {
        try {
            const { isInstitute } = req.currentUser;
            
            if (!isInstitute) {
                return res.status(403).json({ message: "Only institutes can access this endpoint" });
            }

            const { scfId } = req.params;
            
            if (!scfId) {
                return res.status(400).json({ message: "Student choice filling ID is required" });
            }

            const paymentSlip = isInstitute
                ? await PaymentService.getPaymentSlipFile(scfId, req)
                : req.currentUser.isStudent
                    ? await PaymentService.getPaymentSlipFileForStudent(scfId, req)
                    : null;

            if (!paymentSlip) {
                return res.status(403).json({ message: "Access denied" });
            }
            
            return res.status(200).json({ 
                message: 'Payment slip details retrieved successfully',
                data: paymentSlip 
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error retrieving payment slip details' });
        }
    }
}

// Routes
router.get('/slips', PaymentCtrl.getPaymentSlips);
router.get('/download/:scfId', PaymentCtrl.downloadPaymentSlip);
router.get('/stats', PaymentCtrl.getPaymentStats);
router.get('/details/:scfId', PaymentCtrl.getPaymentSlipDetails);

module.exports = router;
