const { Router } = require("express");
const router = Router({ mergeParams: true });
const validator = require("../middleware/master.mw");
const MasterCtrl = require('../controllers/master.ctrl');
const BackgroundCtrl = require('../controllers/background.ctrl');

router.get('/countries', MasterCtrl.countries);
router.get('/states', MasterCtrl.states);

// Master Session CRUD routes
router.get('/sessions', MasterCtrl.sessions);
router.post('/sessions', validator.validateCreateSession, MasterCtrl.createSession);
router.put('/sessions/:id', validator.validateUpdateSession, MasterCtrl.updateSession);
router.delete('/sessions/:id', MasterCtrl.deleteSession);
router.get('/sessions/:id', MasterCtrl.getSessionById);

// Institute Courses routes
router.get('/institute/:institute_id/courses',
    validator.validateInstituteId,
    validator.validateInstituteCoursesQuery,
    MasterCtrl.getInstituteCourses);
router.get('/institute/:institute_id/courses/:course_id',
    validator.validateCourseId,
    MasterCtrl.getInstituteCourseById);

// Copy courses between sessions
router.post('/institute/:institute_id/courses/copy',
    validator.validateCopyCourses,
    MasterCtrl.copyCoursesBatch
);

// Website CMS Settings routes
const WebsiteSettingsController = require('../controllers/website_settings.ctrl');
router.get('/website-settings', WebsiteSettingsController.getSettings);
router.post('/website-settings', WebsiteSettingsController.saveSectionSettings);
router.post('/website-settings/preview-token', WebsiteSettingsController.createPreviewToken);
router.post('/website-settings/feature-institute', WebsiteSettingsController.featureInstitute);
router.post('/website-settings/toggle-list-institute', WebsiteSettingsController.toggleListInstitute);

module.exports = router;