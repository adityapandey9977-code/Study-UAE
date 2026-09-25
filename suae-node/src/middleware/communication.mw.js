const { body } = require('express-validator');
const { validationResponse } = require("./validation.mw");

exports.validateSendWhatsappToLead = [
    body('lead_id')
        .trim()
        .notEmpty().withMessage('Lead ID is required'),
    body('msg')
        .trim()
        .notEmpty().withMessage('Message is required'),

    validationResponse
];

exports.validateSendEmailToLead = [
    body('lead_id').trim().notEmpty().withMessage('Lead ID is required'),
    body('sub').trim().notEmpty().withMessage('Subject is required'),
    body('msg').trim().notEmpty().withMessage('Message is required'),
    validationResponse
];

exports.validateSendSmsToLead = [
    body('lead_id').trim().notEmpty().withMessage('Lead ID is required'),
    body('msg').trim().notEmpty().withMessage('Message is required'),
    validationResponse
];