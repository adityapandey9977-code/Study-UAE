const { body } = require('express-validator');
const { validationResponse } = require("./validation.mw");

exports.validateSave = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required'),

    validationResponse
];