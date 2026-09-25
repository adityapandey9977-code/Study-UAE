const moment = require("moment");
const md5 = require('md5');
const UserService = require("../services/user.service");
const { decodeJwtToken } = require("../util/common.util");

exports.initialSetup = async (req, res, next) => {
    const originalUrl = String(req.originalUrl || '');
    if (originalUrl === '/public' || originalUrl.startsWith('/public/')) {
        req.currentUser = null;
        return next();
    }

    req.sessionid = req.headers.sessionid || req.headers.Sessionid;
    let token = req.headers.authorization || req.headers.Authorization || '';
    token = token.replace("Bearer ", "").trim();

    if (token) {
        const decodedToken = decodeJwtToken(token);
        if (decodedToken?.id) {
            req.currentUser = await UserService.detail(decodedToken.id);

            if (!req.currentUser) {
                return res.status(403).json({ message: 'Authorization failed' });
            }
            if (!req.currentUser.status) {
                return res.status(403).json({ message: 'You are not active anymore!' });
            }
            return next();
        }

        const tokenArr = token.split(":");
        const id = tokenArr[0];
        const idMd5 = tokenArr?.[1] || '';
        if (tokenArr.length < 2 || md5(id) !== idMd5) {
            return res.status(403).json({ message: 'Authorization failed' });
        }
        
        req.currentUser = await UserService.detail(id);

        // Fallback: Check if id is a student table ID (students.id)
        if (!req.currentUser) {
            const db = require("../libraries/db");
            const studentRec = await db.knex("students").select("user_id").where({ id }).first();
            if (studentRec && studentRec.user_id) {
                req.currentUser = await UserService.detail(studentRec.user_id);
            }
        }

        if (!req.currentUser) {
            return res.status(403).json({ message: 'Authorization failed' });
        }
        if (!req.currentUser.status) {
            return res.status(403).json({ message: 'You are not active anymore!' });
        }
    } else {
        req.currentUser = null;
    }
    next();
}

exports.validateToken = (req, res, next) => {
    if (!req.currentUser) {
        return res.status(403).json({ message: 'Authorization failed!' });
    } else {
        next();
    }
}
