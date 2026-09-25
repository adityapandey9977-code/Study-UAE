const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ChatCallingService = require("./chat_calling.service");
const { getExt } = require("../util/common.util");

/**
 * Safely get and ensure an uploads directory exists and is writable
 */
function getSafeUploadDir(subfolder) {
  const candidates = [];
  // 1. Try local node uploads folder first
  candidates.push(path.resolve(__dirname, "../../uploads", subfolder));
  // 2. Try configured UP_PATH
  if (process.env.UP_PATH && typeof process.env.UP_PATH === "string") {
    candidates.push(path.resolve(process.env.UP_PATH, subfolder));
  }
  // 3. Try process.cwd()/uploads
  candidates.push(path.resolve(process.cwd(), "uploads", subfolder));

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch (err) {
      console.warn(`[chat-upload] Upload dir candidate "${dir}" not writable:`, err.message);
    }
  }

  // Fallback to /tmp/uploads
  const tmpDir = path.resolve("/tmp/uploads", subfolder);
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

// Multer Storage Configuration for voice/audio uploads
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const dir = getSafeUploadDir("audio");
      cb(null, dir);
    } catch (e) {
      console.error("[chat-upload] Error setting audio directory:", e);
      cb(null, getSafeUploadDir("audio"));
    }
  },
  filename: function (req, file, cb) {
    const rawExt = getExt(file.originalname) || "webm";
    const ext = rawExt.toLowerCase();
    const name = `audio-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    cb(null, name);
  }
});

// Multer Storage Configuration for general file & media uploads (images, PDFs, documents)
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const dir = getSafeUploadDir("chat_files");
      cb(null, dir);
    } catch (e) {
      console.error("[chat-upload] Error setting file directory:", e);
      cb(null, getSafeUploadDir("chat_files"));
    }
  },
  filename: function (req, file, cb) {
    const rawExt = getExt(file.originalname) || "bin";
    const ext = rawExt.toLowerCase();
    const name = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    cb(null, name);
  }
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // Max 50MB for audio notes
});

const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // Max 100MB for file attachments
});

/**
 * Flexible multer middleware that handles any field name and catches errors cleanly
 */
const flexibleUpload = (multerInstance) => {
  return (req, res, next) => {
    multerInstance.any()(req, res, (err) => {
      if (err) {
        console.error("[chat-upload] Multer error during upload:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed"
        });
      }

      // Assign first uploaded file to req.file for controller convenience
      if (!req.file && req.files && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  };
};

class ChatController {
  /**
   * Send a chat message via HTTP REST API
   * POST /chat/send-message (or POST /chat/send)
   * Body: { receiver_id, message_type, content, file_path }
   */
  static sendMessage = async (req, res) => {
    try {
      const currentUserId = req.currentUser.id;
      const { receiver_id, message_type = "text", content, file_path } = req.body || {};

      if (!receiver_id) {
        return res.status(400).json({ success: false, message: "receiver_id is required" });
      }

      if (!content && !file_path) {
        return res.status(400).json({ success: false, message: "content or file_path is required" });
      }

      const savedMessage = await ChatCallingService.saveMessage({
        sender_id: currentUserId,
        receiver_id: Number(receiver_id),
        message_type: message_type || "text",
        content: content || null,
        file_path: file_path || null
      });

      const enrichedMessage = {
        ...savedMessage,
        sender_name: req.currentUser.name || req.currentUser.fname || "User",
        sender_type: req.currentUser.type
      };

      // Broadcast over Socket.io if active
      try {
        const socketService = require("./socket.service");
        if (socketService.io) {
          socketService.io.to(`user_${receiver_id}`).emit("new-message", enrichedMessage);
          socketService.io.to(`user_${receiver_id}`).emit("new-notification", {
            type: "chat_message",
            title: `New message from ${enrichedMessage.sender_name}`,
            body: savedMessage.message_type === "text"
              ? (content || "New message")
              : `Sent a ${savedMessage.message_type} attachment`,
            message: enrichedMessage
          });
        }
      } catch (sockErr) {
        console.error("[chat-send-message] Socket broadcast notice:", sockErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Message sent successfully",
        result: enrichedMessage
      });
    } catch (err) {
      console.error("[chat-send-message] Error sending message:", err);
      return res.status(400).json({ success: false, message: err.message || "Failed to send message" });
    }
  };

  /**
   * Mark messages as read via HTTP REST API
   * POST /chat/mark-read
   * Body: { partner_id }
   */
  static markRead = async (req, res) => {
    try {
      const currentUserId = req.currentUser.id;
      const { partner_id } = req.body || {};

      if (!partner_id) {
        return res.status(400).json({ success: false, message: "partner_id is required" });
      }

      const updatedCount = await ChatCallingService.markMessagesRead(Number(partner_id), currentUserId);

      // Notify sender over Socket.io
      try {
        const socketService = require("./socket.service");
        if (socketService.io) {
          socketService.io.to(`user_${partner_id}`).emit("messages-marked-read", {
            reader_id: currentUserId
          });
        }
      } catch (sockErr) {
        console.error("[chat-mark-read] Socket broadcast notice:", sockErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Messages marked as read",
        updated_count: updatedCount
      });
    } catch (err) {
      console.error("[chat-mark-read] Error marking read:", err);
      return res.status(400).json({ success: false, message: err.message || "Failed to mark read" });
    }
  };

  /**
   * Retrieve Chat History between current user and partner_id
   * GET /chat/history?partner_id=123&limit=50&before_id=456
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

      const messages = await ChatCallingService.getChatHistory(currentUserId, partnerId, {
        limit,
        before_id: beforeId
      });

      return res.status(200).json({
        success: true,
        messages
      });
    } catch (err) {
      console.error("[chat-history] Error loading history:", err);
      return res.status(400).json({ success: false, message: err.message || "Failed to retrieve history" });
    }
  };

  /**
   * Upload Voice Note / Audio Message
   * POST /chat/upload-audio
   */
  static uploadAudio = async (req, res) => {
    try {
      const file = req.file || (req.files && req.files[0]);
      if (!file) {
        return res.status(400).json({ success: false, message: "No audio file received" });
      }

      const relativePath = `/uploads/audio/${file.filename}`;
      const baseUrl = (process.env.BASE_URL_LOCAL || process.env.BASE_URL || "").replace(/\/$/, "");
      const fullUrl = baseUrl ? `${baseUrl}${relativePath}` : relativePath;

      return res.status(200).json({
        success: true,
        message: "Audio uploaded successfully",
        file_path: relativePath,
        url: fullUrl,
        full_url: fullUrl,
        filename: file.filename,
        original_name: file.originalname,
        message_type: "audio",
        size: file.size
      });
    } catch (err) {
      console.error("[chat-upload-audio] Audio upload failed:", err);
      return res.status(400).json({ success: false, message: err.message || "Audio file upload failed" });
    }
  };

  /**
   * Upload Chat Attachment (Images, Documents, PDFs)
   * POST /chat/upload-file
   */
  static uploadFile = async (req, res) => {
    try {
      const file = req.file || (req.files && req.files[0]);
      if (!file) {
        return res.status(400).json({ success: false, message: "No file received" });
      }

      const relativePath = `/uploads/chat_files/${file.filename}`;
      const ext = (getExt(file.originalname) || "").toLowerCase();
      
      let detectedType = "file";
      if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic"].includes(ext)) {
        detectedType = "image";
      } else if (["mp3", "wav", "webm", "m4a", "ogg", "aac", "opus"].includes(ext)) {
        detectedType = "audio";
      }

      const baseUrl = (process.env.BASE_URL_LOCAL || process.env.BASE_URL || "").replace(/\/$/, "");
      const fullUrl = baseUrl ? `${baseUrl}${relativePath}` : relativePath;

      return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        file_path: relativePath,
        url: fullUrl,
        full_url: fullUrl,
        filename: file.filename,
        original_name: file.originalname,
        message_type: detectedType,
        size: file.size
      });
    } catch (err) {
      console.error("[chat-upload-file] File upload failed:", err);
      return res.status(400).json({ success: false, message: err.message || "File upload failed" });
    }
  };

  /**
   * Sync Offline Messages (Unread messages since a specific message ID)
   * GET /chat/sync-messages?last_message_id=123
   */
  static syncMessages = async (req, res) => {
    try {
      const lastMessageId = req.query.last_message_id ? Number(req.query.last_message_id) : null;
      const currentUserId = req.currentUser.id;

      if (lastMessageId === null || isNaN(lastMessageId)) {
        return res.status(400).json({ success: false, message: "last_message_id is required" });
      }

      const messages = await ChatCallingService.getSyncMessages(currentUserId, lastMessageId);

      return res.status(200).json({
        success: true,
        messages
      });
    } catch (err) {
      console.error("[chat-sync] Message synchronization failed:", err);
      return res.status(400).json({ success: false, message: err.message || "Failed to sync messages" });
    }
  };

  /**
   * Get Unread Messages Counts (Grouped by sender)
   * GET /chat/unread-counts
   */
  static unreadCounts = async (req, res) => {
    try {
      const currentUserId = req.currentUser.id;
      const counts = await ChatCallingService.getUnreadCounts(currentUserId);

      return res.status(200).json({
        success: true,
        result: counts
      });
    } catch (err) {
      console.error("[chat-unread] Error fetching unread counts:", err);
      return res.status(400).json({ success: false, message: err.message || "Failed to fetch unread counts" });
    }
  };

  /**
   * Get Recent Conversation Threads with last message & unread count
   * GET /chat/recent-threads
   */
  static recentThreads = async (req, res) => {
    try {
      const currentUserId = req.currentUser.id;
      const threads = await ChatCallingService.getRecentThreads(currentUserId);

      return res.status(200).json({
        success: true,
        result: threads
      });
    } catch (err) {
      console.error("[chat-threads] Error fetching recent threads:", err);
      return res.status(400).json({ success: false, message: err.message || "Failed to fetch threads" });
    }
  };
}

module.exports = {
  ChatController,
  uploadAudio,
  uploadFile,
  flexibleUpload
};
