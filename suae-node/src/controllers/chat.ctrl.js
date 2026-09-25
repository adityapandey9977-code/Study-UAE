const { Router } = require("express");
const router = Router({ mergeParams: true });
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const db = require("../libraries/db");
const { validateToken } = require("../middleware/route.mw");
const { getExt } = require("../util/common.util");

// Multer Storage Configuration for voice/audio uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const upPath = process.env.UP_PATH || "uploads";
        const dir = path.join(upPath, "audio");

        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        } catch (e) {
            console.error("[chat-upload] Error creating audio upload directory:", e);
            cb(e);
        }
    },
    filename: function (req, file, cb) {
        const ext = getExt(file.originalname) || "webm";
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        cb(null, name);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit voice notes to 10MB
});

class ChatCtrl {
    /**
     * Retrieve Chat History between current user and partner_id
     * GET /api/chat/history?partner_id=123&limit=50&before_id=456
     */
    static history = async (req, res) => {
        try {
            const partnerId = req.query.partner_id ? Number(req.query.partner_id) : null;
            const limit = req.query.limit ? Number(req.query.limit) : 50;
            const beforeId = req.query.before_id ? Number(req.query.before_id) : null;
            const currentUserId = req.currentUser.id;

            if (!partnerId) {
                return res.status(400).json({ success: false, message: "partner_id is required" });
            }

            let query = db.knex("lc_messages")
                .where((builder) => {
                    builder.where({ sender_id: currentUserId, receiver_id: partnerId })
                           .orWhere({ sender_id: partnerId, receiver_id: currentUserId });
                });

            if (beforeId) {
                query = query.where("id", "<", beforeId);
            }

            const messages = await query
                .orderBy("id", "desc")
                .limit(limit);

            // Return in chronological order
            return res.status(200).json({
                success: true,
                messages: messages.reverse()
            });
        } catch (err) {
            console.error("[chat-history] Error loading chat history:", err);
            return res.status(400).json({ success: false, message: err.message || "Failed to retrieve history" });
        }
    }

    /**
     * Upload Audio Voice Note
     * POST /api/chat/upload-audio
     */
    static uploadAudio = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No audio file uploaded" });
            }

            // Construct client-accessible static URL path
            // For example: /uploads/audio/1784631245-123456.webm
            const relativePath = `/uploads/audio/${req.file.filename}`;

            return res.status(200).json({
                success: true,
                file_path: relativePath
            });
        } catch (err) {
            console.error("[chat-upload-audio] Audio upload failed:", err);
            return res.status(400).json({ success: false, message: err.message || "Audio file upload failed" });
        }
    }

    /**
     * Sync Offline Messages (Unread messages since a specific message ID)
     * GET /api/chat/sync-messages?last_message_id=123
     */
    static syncMessages = async (req, res) => {
        try {
            const lastMessageId = req.query.last_message_id ? Number(req.query.last_message_id) : null;
            const currentUserId = req.currentUser.id;

            if (lastMessageId === null || isNaN(lastMessageId)) {
                return res.status(400).json({ success: false, message: "last_message_id is required" });
            }

            const messages = await db.knex("lc_messages")
                .where({ receiver_id: currentUserId })
                .where("id", ">", lastMessageId)
                .orderBy("id", "asc");

            return res.status(200).json({
                success: true,
                messages
            });
        } catch (err) {
            console.error("[chat-sync] Message synchronization failed:", err);
            return res.status(400).json({ success: false, message: err.message || "Failed to sync messages" });
        }
    }

    /**
     * Get Unread Messages Counts (Grouped by sender)
     * GET /chat/unread-counts
     */
    static unreadCounts = async (req, res) => {
        try {
            const currentUserId = req.currentUser.id;
            const counts = await db.knex("lc_messages")
                .select("sender_id")
                .count("* as count")
                .where({ receiver_id: currentUserId, is_read: 0 })
                .groupBy("sender_id");

            return res.status(200).json({
                success: true,
                result: counts.map(c => ({
                    sender_id: c.sender_id,
                    unread_count: Number(c.count || 0)
                }))
            });
        } catch (err) {
            console.error("[chat-unread] Error fetching unread counts:", err);
            return res.status(400).json({ success: false, message: err.message || "Failed to fetch unread counts" });
        }
    }

    /**
     * Get Recent Conversation Threads with last message & unread count
     * GET /chat/recent-threads
     */
    static recentThreads = async (req, res) => {
        try {
            const currentUserId = req.currentUser.id;

            // Find all unique partners
            const partners = await db.knex("lc_messages")
                .select(db.knex.raw(`
                    CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                    END as partner_id
                `, [currentUserId]))
                .where({ sender_id: currentUserId })
                .orWhere({ receiver_id: currentUserId })
                .groupBy("partner_id");

            const threads = [];
            for (const p of partners) {
                const partnerId = p.partner_id;
                
                // Get partner user details
                const partnerDetails = await db.knex("users")
                    .select("id", "name", "email", "mobile", "type")
                    .where({ id: partnerId })
                    .first();

                if (!partnerDetails) continue;

                // Get last message in conversation
                const lastMsg = await db.knex("lc_messages")
                    .where(builder => {
                        builder.where({ sender_id: currentUserId, receiver_id: partnerId })
                               .orWhere({ sender_id: partnerId, receiver_id: currentUserId });
                    })
                    .orderBy("id", "desc")
                    .first();

                // Get unread count from this partner
                const unreadCount = await db.knex("lc_messages")
                    .where({ sender_id: partnerId, receiver_id: currentUserId, is_read: 0 })
                    .count("* as count")
                    .first();

                threads.push({
                    partner: partnerDetails,
                    last_message: lastMsg,
                    unread_count: Number(unreadCount?.count || 0)
                });
            }

            // Sort threads by last message created_at descending
            threads.sort((a, b) => {
                const aTime = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
                const bTime = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
                return bTime - aTime;
            });

            return res.status(200).json({
                success: true,
                result: threads
            });
        } catch (err) {
            console.error("[chat-threads] Error fetching recent threads:", err);
            return res.status(400).json({ success: false, message: err.message || "Failed to fetch threads" });
        }
    }
}

// Router Mappings
router.get("/history", validateToken, ChatCtrl.history);
router.post("/upload-audio", validateToken, upload.single("audio"), ChatCtrl.uploadAudio);
router.get("/sync-messages", validateToken, ChatCtrl.syncMessages);
router.get("/unread-counts", validateToken, ChatCtrl.unreadCounts);
router.get("/recent-threads", validateToken, ChatCtrl.recentThreads);

module.exports = router;
