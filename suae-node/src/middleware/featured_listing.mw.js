const { query, body, param } = require("express-validator");
const { validationResponse } = require("./validation.mw");

const intField = (validator, field, { required = true, gt = 0 } = {}) => {
    const rule = validator(field);
    if (required) {
        rule.exists({ checkFalsy: true }).withMessage(`${field} is required`).bail();
    } else {
        rule.optional({ nullable: true });
    }
    return rule.isInt({ gt }).withMessage(`${field} must be a positive integer`);
};

exports.validateListAvailableCoursesQuery = [
    intField(query, "discipline_id"),
    intField(query, "course_id"),
    intField(query, "institute_id", { required: false }),
    query("session")
        .optional({ checkFalsy: true })
        .isLength({ min: 3 })
        .withMessage("session must be at least 3 characters"),
    validationResponse
];

exports.validateAdminGetQuery = [
    validationResponse
];

exports.validateAdminSetBody = [
    intField(body, "discipline_id"),
    intField(body, "course_id"),
    intField(body, "institute_course_id"),
    body("custom_text")
        .optional({ nullable: true })
        .isLength({ max: 2000 })
        .withMessage("custom_text cannot exceed 2000 characters"),
    body("status")
        .optional({ nullable: true })
        .isString()
        .withMessage("status must be a string"),
    validationResponse
];

exports.validateAdminDeleteQuery = [
    intField(query, "discipline_id"),
    intField(query, "course_id"),
    validationResponse
];

exports.validateAdminUpdateParams = [
    intField(param, "id"),
    validationResponse
];

exports.validateAdminUpdateBody = [
    intField(body, "discipline_id", { required: false }),
    intField(body, "course_id", { required: false }),
    intField(body, "institute_course_id", { required: false }),
    body("custom_text")
        .optional({ nullable: true })
        .isLength({ max: 2000 })
        .withMessage("custom_text cannot exceed 2000 characters"),
    body("status")
        .optional({ nullable: true })
        .isString()
        .withMessage("status must be a string"),
    validationResponse
];

exports.validateAdminDeleteParams = [
    intField(param, "id"),
    validationResponse
];
