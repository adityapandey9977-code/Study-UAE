const { Router } = require("express");
const router = Router({ mergeParams: true });
const AuthService = require("../services/auth.service");
const UserService = require("../services/user.service");
const { trim } = require("../util/common.util");
const { validateLogin } = require("../middleware/auth.mw");

class AuthCtrl {
    static login = async (req, res) => {
        try {
            const data = trim(req.body || {});
            const dtl = await AuthService.login(data);
            return res.status(200).json({ result: dtl, message: '' });
        } catch (e) {
            return res.status(401).json({ message: e.message || 'Error' });
        }
    }

    static loggedUserDtl = async (req, res) => {
        try {
            let dtl = {};
            dtl = await UserService.detail(req.currentUser?.id || 0);
            if (!dtl) {
                throw new Error("LoggedOut");
            }
            return res.status(200).json({ result: dtl, message: '' });
        } catch (e) {
            return res.status(403).json({ message: e.message || 'Error' });
        }
    }
}

router.post('/login', validateLogin, AuthCtrl.login);
router.get('/loggedUserDtl', AuthCtrl.loggedUserDtl);
module.exports = router;