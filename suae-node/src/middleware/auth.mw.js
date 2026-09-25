const { trim } = require("../util/common.util");
const { validationResponse } = require("./validation.mw");
const { body } = require('express-validator');

exports.validateLogin = (req, res, next) => {
    try {
        const data = trim(req.body || {});
        if (!data.username) {
            throw new Error('Username required');
        }
        if (!data.password) {
            throw new Error('Password required');
        }

        next();
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
}

exports.checkAccess = (module, req) => {

}