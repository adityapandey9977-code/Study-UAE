const { Router } = require("express");
const router = Router({ mergeParams: true });
const UserService = require("../services/user.service");
const { pickValues, trim, getUniqueId } = require("../util/common.util");

class UserCtrl {
    static saveAgentUrlLink = async (req, res) => {
        try {
            const { id: user_id } = req.currentUser;
            const post = trim(req.body || {});
            if (!post.name) {
                throw new Error("Name required!");
            }
            // const data = pickValues(post, ['id', 'name', 'utm_source', 'status']);
            // const data = pickValues(post, ['id', 'name', 'utm_source', 'status', 'short_code']);
            const data = { ...post };

            data.agent_id = user_id;
            data.utm_source = data.utm_source || null;
            if (!data.id) {
                data.uid = getUniqueId();
                // Generate a unique 6-character short code
                const shortCode = await UserService.generateUniqueShortCode();
                data.short_code = shortCode;
            }

            await UserService.saveAgentUrlLink(data, req);
            return res.status(200).json({ message: 'Saved successfully' });
        } catch (e) {
            const msg = e.message.includes('Duplicate entry') ? "Duplicate entry" : e.message;
            return res.status(400).json({ message: msg || 'Error' });
        }
    }

    static getUserFilters = async (req, res) => {
        try {
            const { user_id } = req.params;
            const userId = user_id || req.currentUser?.id;
            
            if (!userId) {
                throw new Error('User ID required');
            }
            
            const result = await UserService.getUserFilters(userId);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static deleteUser = async (req, res) => {
        try {
            const result = await UserService.deleteUser(req.body, req);
            return res.status(200).json(result);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static deleteAgentUrlLink = async (req, res) => {
        try {
            const result = await UserService.deleteAgentUrlLink(req.body, req);
            return res.status(200).json(result);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getAgentUrlLinks = async (req, res) => {
        try {
            const result = await UserService.getAgentUrlLinks(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getAllUsers = async (req, res) => {
        try {
            const result = await UserService.getAllUsers(req.query);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
}

router.get('/ALL', UserCtrl.getAllUsers);
router.post('/deleteUser', UserCtrl.deleteUser);
router.post('/deleteAgentUrlLink', UserCtrl.deleteAgentUrlLink);
router.post('/saveAgentUrlLink', UserCtrl.saveAgentUrlLink);
router.get('/getAgentUrlLinks', UserCtrl.getAgentUrlLinks);
router.get('/filters/:user_id?', UserCtrl.getUserFilters);

module.exports = router;