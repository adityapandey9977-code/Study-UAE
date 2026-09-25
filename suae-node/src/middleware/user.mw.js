const { body } = require('express-validator');
const { validationResponse } = require("./validation.mw");

exports.validateSave = [
    body('role_id')
        .trim()
        .notEmpty().withMessage('Choose a role'),

    body('fname')
        .trim()
        .notEmpty().withMessage('First Name is required'),
    body('lname')
        .trim()
        .notEmpty().withMessage('Last Name is required'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email is not valid'),

    body('mobile')
        .trim()
        //.notEmpty().withMessage('Mobile is required')
        .optional(),
    //.isMobilePhone().withMessage('Valid mobile number is required'),

    // body('password')
    //     .trim()
    //     .optional()
    //     .notEmpty().withMessage('Password is required'),

    body('status')
        .trim()
        .notEmpty().withMessage('Status is required')
        .isInt({ min: 0, max: 1 }).withMessage('Status must be either 0 or 1'),

    validationResponse
];


exports.validateUpdateProfile = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email is not valid'),

    body('mobile')
        .trim()
        //.notEmpty().withMessage('Mobile is required')
        .optional(),
    //.isMobilePhone().withMessage('Valid mobile number is required'),
    validationResponse
]

exports.validateChangePassword = [
    body('currentPassword')
        .trim()
        .notEmpty().withMessage('Old password is required'),

    body('newPassword')
        .trim()
        .notEmpty().withMessage('New password is required'),

    body('confirmNewPassword')
        .trim()
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    validationResponse
]