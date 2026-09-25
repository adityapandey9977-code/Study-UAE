const { Router } = require("express");
const router = Router({ mergeParams: true });
const { initialSetup, validateToken } = require("../middleware/route.mw");
const authRoutes = require('../controllers/auth.ctrl');
const backgroundCtrl = require('../controllers/background.ctrl');
const logoCtrl = require('../controllers/logo.ctrl');

const db = require("../libraries/db");

/** Public routes */
router.use('/public', require('../controllers/public.ctrl'));
router.use('/public/reviews', require('../controllers/review.ctrl').publicRouter);

router.get('/', (req, res) => {
    return res.status(200).json({
        message: 'SIS UAE API is running',
        status: 'ok'
    });
});

router.get('/s/:code', async (req, res) => {
    try {
        const { code } = req.params;

        // Find the record where UID ends with the code
        const record = await db.knex("agent_url_links")
            .where({ short_code: code })
            .first();

        if (!record) {
            return res.status(404).send("Invalid or expired link");
        }

        // Build the final URL with UID and UTM parameters if they exist
        let finalUrl = `${process.env.APPLICANT_PANEL_URL}applynow/${record.uid}`;
        const params = new URLSearchParams();

        if (record.utm_source) {
            params.append('utm_source', record.utm_source);
        }

        const queryString = params.toString();
        if (queryString) {
            finalUrl += `?${queryString}`;
        }

        return res.redirect(finalUrl);
    } catch (error) {
        console.error('Error processing short URL:', error);
        return res.status(500).send("Internal server error");
    }
});

router.use('/', authRoutes);
router.use('/', require('./legacy_compat.routes'));

router.use(initialSetup);

router.use('/color-schemes', require('../controllers/color_scheme.ctrl'));

/** Token authentication - Skip for public routes */ 
// student import uses bearer or session header
router.use((req, res, next) => {
    const originalUrl = String(req.originalUrl || '');
    const isPublicAuthRoute =
        originalUrl === '/login' ||
        originalUrl === '/studentLoginWithOtp' ||
        originalUrl === '/forgotpassword' ||
        originalUrl === '/resetpssword' ||
        originalUrl.startsWith('/cmaster') ||
        originalUrl.startsWith('/api/form');

    if (originalUrl === '/public' || originalUrl.startsWith('/public/') || isPublicAuthRoute) {
        return next();
    }
    return validateToken(req, res, next);
});

/** Private routes */
router.use('/master', require('./master.routes'));
router.use('/dashboard', require('../controllers/dashboard.ctrl'));
router.use('/whatsapp', require('../controllers/whatsapp.ctrl'));
router.use('/communication', require('../controllers/communication.ctrl'));
router.use('/campaigns', require('../controllers/campaign.ctrl'));
router.use('/user', require('../controllers/user.ctrl'));
router.use('/student/letters', require('../controllers/student_letters.ctrl'));
router.use('/student', require('../controllers/student.ctrl'));
router.use('/students', require('../controllers/student.ctrl'));
router.use('/lead-automations', require('../controllers/lead_automation.ctrl'));
router.use('/payment', require('../controllers/payment.ctrl'));
router.use('/issues', require('../controllers/issues.ctrl'));
router.use('/issue-type-count', require('../controllers/issueTypeCount.ctrl'));
router.use('/institute', require('../controllers/institute.ctrl'));
//Email sending for student by admin if issue is resolve
router.use('/super-admin-email', require('../controllers/superAdminEmail.ctrl'));
// Mount notifications controller at root level to handle both /notifications and /student-notifications
router.use('/', require('../controllers/notifications.ctrl'));
router.use('/scoreboard', require('../controllers/scoreboard.ctrl'));
router.use('/featured-listings', require('../controllers/featured_listing.ctrl'));
router.use('/email-templates', require('../controllers/email_templates.ctrl'));
router.use('/whatsapp-templates', require('../controllers/whatsapp_templates.ctrl'));
router.use('/chat', require('../live_chat_and_calling/chat_calling.routes'));
router.use('/file', require('../controllers/file.ctrl'));
router.use('/image', require('../controllers/image_base64.ctrl'));
router.use('/master/reviews', require('../controllers/review.ctrl').masterRouter);
router.use('/application-engine', require('../controllers/application_engine.ctrl'));

// Background routes (authenticated)
router.post('/backgrounds', backgroundCtrl.upload);
router.get('/backgrounds', backgroundCtrl.getAll);
router.post('/backgrounds/:id/activate', backgroundCtrl.setActive);
router.delete('/backgrounds/:id', backgroundCtrl.delete);

// Logo routes (authenticated)
router.post('/logos', logoCtrl.upload);
router.get('/logos', logoCtrl.getAll);
router.post('/logos/:id/activate', logoCtrl.setActive);
router.delete('/logos/:id', logoCtrl.delete);

module.exports = router;