const { query, param, body } = require("express-validator");
const { validationResponse } = require("./validation.mw");

const numericField = (validator, field, { required = true } = {}) => {
    const rule = validator(field);
    if (required) {
        rule.exists({ checkFalsy: true }).withMessage(`${field} is required`).bail();
    } else {
        rule.optional({ nullable: true });
    }
    return rule.isInt({ gt: 0 }).withMessage(`${field} must be a positive integer`);
};

exports.validateListEligible = [
    query("institute_id")
        .optional({ nullable: true })
        .isInt({ gt: 0 })
        .withMessage("institute_id must be a positive integer"),
    query("search")
        .optional({ nullable: true })
        .isLength({ min: 2 })
        .withMessage("search must be at least 2 characters"),
    validationResponse
];

exports.validateScfParam = [
    numericField(param, "scfId"),
    validationResponse
];

exports.validateUploadInstituteLetter = [
    numericField(param, "scfId"),
    body("file_id")
        .exists({ checkFalsy: true })
        .withMessage("file_id is required")
        .bail()
        .isLength({ min: 1, max: 250 })
        .withMessage("file_id must be between 1 and 250 characters"),
    validationResponse
];

exports.validateUploadStudentVisa = [
    numericField(param, "scfId"),
    body("file_id")
        .exists({ checkFalsy: true })
        .withMessage("file_id is required")
        .bail()
        .isLength({ min: 1, max: 250 })
        .withMessage("file_id must be between 1 and 250 characters"),
    validationResponse
];

exports.validateReviewDecision = [
    numericField(param, "scfId"),
    body("decision")
        .exists({ checkFalsy: true })
        .withMessage("decision is required")
        .bail()
        .isIn(["APPROVED", "REJECTED"])
        .withMessage("decision must be APPROVED or REJECTED"),
    validationResponse
];

exports.validatePickupPayload = [
    numericField(param, "scfId"),
    body("pickup")
        .optional({ nullable: true })
        .isLength({ max: 5000 })
        .withMessage("pickup details cannot exceed 5000 characters"),
    body("file_id")
        .optional({ nullable: true })
        .isLength({ min: 1, max: 250 })
        .withMessage("file_id must be between 1 and 250 characters when provided"),
    validationResponse
];
