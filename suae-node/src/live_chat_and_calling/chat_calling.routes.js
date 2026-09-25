const { Router } = require("express");
const router = Router({ mergeParams: true });
const { validateToken } = require("../middleware/route.mw");

const { ChatController, uploadAudio, uploadFile, flexibleUpload } = require("./chat.controller");
const CallController = require("./call.controller");
const AdminChatCallController = require("./admin_chat_call.controller");

// ====================================================
// 1. MOBILE APP CHAT & CALLING ENDPOINTS (STUDENTS & COUNSELLORS)
// ====================================================

// Send Chat Message via REST API
router.post("/send-message", validateToken, ChatController.sendMessage);
router.post("/send", validateToken, ChatController.sendMessage);

// Mark Messages Read via REST API
router.post("/mark-read", validateToken, ChatController.markRead);

// Chat History between logged-in user and partner
router.get("/history", validateToken, ChatController.history);

// Upload voice note (accepts field 'audio', 'file', 'attachment', 'voice', etc.)
router.post("/upload-audio", validateToken, flexibleUpload(uploadAudio), ChatController.uploadAudio);

// Upload chat attachment - images, files, PDFs (accepts field 'file', 'image', 'attachment', 'document', etc.)
router.post("/upload-file", validateToken, flexibleUpload(uploadFile), ChatController.uploadFile);

// Offline sync for missed messages
router.get("/sync-messages", validateToken, ChatController.syncMessages);

// Unread message count badges
router.get("/unread-counts", validateToken, ChatController.unreadCounts);

// Recent conversation threads
router.get("/recent-threads", validateToken, ChatController.recentThreads);

// User's call history
router.get("/call-history", validateToken, CallController.history);

// ====================================================
// 2. SUPER ADMIN MONITORING & AUDIT ENDPOINTS
// ====================================================

// Overview of all student-counsellor conversations
router.get("/admin/conversations", validateToken, AdminChatCallController.conversations);

// View full chat history between any student and counsellor
router.get("/admin/history", validateToken, AdminChatCallController.chatHistory);

// Super Admin platform-wide call logs with analytics
router.get("/admin/call-logs", validateToken, AdminChatCallController.callLogs);

module.exports = router;
