const { body, param, query } = require('express-validator');
const { validationResponse } = require("./validation.mw");

exports.validaSaveIssueCategory = [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('status').trim().notEmpty().withMessage('Status is required'),
    validationResponse
];

exports.validateCreateSession = [
    body('session_startdt').trim().notEmpty().withMessage('Session start date is required'),
    body('session_enddt').trim().notEmpty().withMessage('Session end date is required'),
    body('status').optional().trim().isInt({ min: 0, max: 1 }).withMessage('Status must be 0 or 1'),
    validationResponse
];

exports.validateUpdateSession = [
    body('session_startdt').optional().trim().notEmpty().withMessage('Session start date cannot be empty'),
    body('session_enddt').optional().trim().notEmpty().withMessage('Session end date cannot be empty'),
    body('status').optional().trim().isInt({ min: 0, max: 1 }).withMessage('Status must be 0 or 1'),
    validationResponse
];

exports.validateInstituteId = [
    param('institute_id').trim().notEmpty().withMessage('Institute ID is required')
        .isInt({ min: 1 }).withMessage('Institute ID must be a positive integer'),
    validationResponse
];

exports.validateCourseId = [
    param('institute_id').trim().notEmpty().withMessage('Institute ID is required')
        .isInt({ min: 1 }).withMessage('Institute ID must be a positive integer'),
    param('course_id').trim().notEmpty().withMessage('Course ID is required')
        .isInt({ min: 1 }).withMessage('Course ID must be a positive integer'),
    validationResponse
];

exports.validateInstituteCoursesQuery = [
    query('session').optional().trim().isLength({ min: 3 }).withMessage('Session must be at least 3 characters'),
    query('show_all').optional().trim().isIn(['true', 'false']).withMessage('show_all must be true or false'),
    validationResponse
];

exports.validateCopyCourses = [
    param('institute_id').isInt({ min: 1 }).withMessage('Valid Institute ID is required'),
    body('from_session').notEmpty().withMessage('Source session is required'),
    body('to_session').notEmpty().withMessage('Target session is required'),
    body('course_ids').isArray({ min: 1 }).withMessage('At least one course ID is required'),
    body('course_ids.*').isInt({ min: 1 }).withMessage('Each course ID must be a positive integer'),
    validationResponse
];