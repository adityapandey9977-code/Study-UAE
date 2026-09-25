const { Server } = require("socket.io");
const { decodeJwtToken, currentDT } = require("../util/common.util");
const UserService = require("../services/user.service");
const ChatCallingService = require("./chat_calling.service");

/**
 * Socket.io Real-Time Communication Service for Live Chat & Audio Calling
 */
class SocketService {
  constructor() {
    this.io = null;
    // Map of userId (number) -> Set of socketIds
    this.userSockets = new Map();
  }

  /**
   * Initialize Socket.io server
   * @param {Object} server - HTTP or HTTPS Server instance
   */
  init(server) {
    console.log("[SocketService] Initializing Real-Time Socket.io server...");

    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Authentication Middleware (Supports JWT tokens, Student colon tokens e.g. 6119:md5(6119), and direct mobile auth)
    this.io.use(async (socket, next) => {
      try {
        const authData = socket.handshake.auth || {};
        const queryData = socket.handshake.query || {};
        const headersData = socket.handshake.headers || {};

        let token =
          authData.token ||
          queryData.token ||
          headersData.authorization ||
          headersData.Authorization ||
          authData.Authorization;

        if (token && typeof token === "string" && token.startsWith("Bearer ")) {
          token = token.slice(7).trim();
        }

        let targetUserId = null;

        // 1. Try JWT Decoding
        if (token && typeof token === "string") {
          try {
            const decoded = decodeJwtToken(token);
            if (decoded && decoded.id) {
              targetUserId = decoded.id;
            }
          } catch (e) {
            // Not a JWT, try other formats
          }

          // 2. Try Colon Token (e.g. "6119:7bb7a62681a8a0f94ab424b06d172ca3")
          if (!targetUserId && token.includes(":")) {
            const md5 = require("md5");
            const tokenArr = token.split(":");
            const rawId = tokenArr[0];
            const idMd5 = tokenArr[1] || "";
            if (tokenArr.length >= 2 && md5(rawId) === idMd5) {
              targetUserId = Number(rawId);
            }
          }
        }

        // 3. Fallback to direct userId / user_id in auth payload
        if (!targetUserId) {
          const directId = authData.userId || authData.user_id || queryData.userId || queryData.user_id;
          if (directId && !isNaN(Number(directId))) {
            targetUserId = Number(directId);
          }
        }

        if (!targetUserId) {
          return next(new Error("Authentication token is required"));
        }

        const db = require("../libraries/db");
        let user = await UserService.detail(targetUserId);

        // If not found in users table directly, check if targetUserId is a student table ID
        if (!user) {
          const studentRec = await db.knex("students").select("user_id").where({ id: targetUserId }).first();
          if (studentRec && studentRec.user_id) {
            user = await UserService.detail(studentRec.user_id);
          }
        }

        if (!user) {
          return next(new Error("User account not found"));
        }

        if (user.status !== 1) {
          return next(new Error("User account is inactive"));
        }

        // Attach authenticated user profile to the socket instance
        socket.currentUser = user;
        next();
      } catch (err) {
        console.error("[SocketService] Authentication error:", err.message);
        next(new Error("Authentication failed"));
      }
    });

    // Connection Handler
    this.io.on("connection", (socket) => {
      const userId = Number(socket.currentUser.id);
      const userName = socket.currentUser.name || socket.currentUser.fname || "User";
      console.log(`[SocketService] Connected: ${userName} (ID: ${userId}), Socket: ${socket.id}`);

      // Register socket in active tracking map
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(socket.id);

      // Join individual user room for targeting broadcasts
      socket.join(`user_${userId}`);

      // Broadcast user online status
      socket.broadcast.emit("user-status-changed", {
        user_id: userId,
        status: "online"
      });

      // ========================================================
      // 1. LIVE CHAT EVENTS
      // ========================================================

      /**
       * Send a chat message
       */
      socket.on("send-message", async (payload, callback) => {
        try {
          const { receiver_id, message_type, content, file_path } = payload || {};
          if (!receiver_id) {
            if (callback) callback({ success: false, error: "receiver_id is required" });
            return;
          }

          const savedMessage = await ChatCallingService.saveMessage({
            sender_id: userId,
            receiver_id: Number(receiver_id),
            message_type: message_type || "text",
            content: content || null,
            file_path: file_path || null
          });

          // Enrich message with sender details
          const enrichedMessage = {
            ...savedMessage,
            sender_name: userName,
            sender_type: socket.currentUser.type
          };

          // Broadcast to recipient room
          this.io.to(`user_${receiver_id}`).emit("new-message", enrichedMessage);

          // Dispatch in-app / push notification event
          this.io.to(`user_${receiver_id}`).emit("new-notification", {
            type: "chat_message",
            title: `New message from ${userName}`,
            body: savedMessage.message_type === "text"
              ? (content || "New message")
              : `Sent a ${savedMessage.message_type} attachment`,
            message: enrichedMessage
          });

          if (callback) {
            callback({
              success: true,
              message: enrichedMessage
            });
          }
        } catch (err) {
          console.error("[SocketService] Error in send-message:", err);
          if (callback) callback({ success: false, error: err.message });
        }
      });

      /**
       * Mark messages read
       */
      socket.on("message-read", async (payload) => {
        try {
          const { partner_id } = payload || {};
          if (!partner_id) return;

          await ChatCallingService.markMessagesRead(Number(partner_id), userId);

          // Notify sender that their messages were read
          this.io.to(`user_${partner_id}`).emit("messages-marked-read", {
            reader_id: userId
          });
        } catch (err) {
          console.error("[SocketService] Error in message-read:", err);
        }
      });

      /**
       * Typing indicators
       */
      socket.on("typing-start", (payload) => {
        const { receiver_id } = payload || {};
        if (!receiver_id) return;

        this.io.to(`user_${receiver_id}`).emit("partner-typing", {
          sender_id: userId,
          is_typing: true
        });
      });

      socket.on("typing-stop", (payload) => {
        const { receiver_id } = payload || {};
        if (!receiver_id) return;

        this.io.to(`user_${receiver_id}`).emit("partner-typing", {
          sender_id: userId,
          is_typing: false
        });
      });

      // ========================================================
      // 2. AUDIO CALLING & WebRTC SIGNALING EVENTS
      // ========================================================

      /**
       * Initiate an audio call
       */
      socket.on("call-initiate", async (payload, callback) => {
        try {
          const { receiver_id, media_type = "audio", call_id, metadata } = payload || {};
          if (!receiver_id) {
            if (callback) callback({ success: false, error: "receiver_id is required" });
            return;
          }

          const callId = call_id || `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

          // Create Call Log in Database
          await ChatCallingService.createCallLog({
            call_id: callId,
            caller_id: userId,
            receiver_id: Number(receiver_id),
            call_type: media_type || "audio",
            metadata: metadata || null
          });

          // Ring recipient
          this.io.to(`user_${receiver_id}`).emit("call-incoming", {
            call_id: callId,
            caller_id: userId,
            caller_name: userName,
            caller_type: socket.currentUser.type,
            media_type: media_type || "audio",
            metadata
          });

          if (callback) {
            callback({
              success: true,
              call_id: callId
            });
          }
        } catch (err) {
          console.error("[SocketService] Error in call-initiate:", err);
          if (callback) callback({ success: false, error: err.message });
        }
      });

      /**
       * Respond to incoming call (accept / reject / busy)
       */
      socket.on("call-response", async (payload) => {
        try {
          const { call_id, caller_id, action } = payload || {};
          if (!caller_id) return;

          const act = action === "accept" ? "accept" : (action === "busy" ? "busy" : "reject");

          if (call_id) {
            if (act === "accept") {
              await ChatCallingService.updateCallLog(call_id, {
                status: "answered",
                answered_at: currentDT()
              });
            } else {
              await ChatCallingService.updateCallLog(call_id, {
                status: act === "busy" ? "busy" : "rejected",
                end_time: currentDT(),
                duration: 0
              });
            }
          }

          if (act === "accept") {
            this.io.to(`user_${caller_id}`).emit("call-answered", {
              call_id,
              target_id: userId,
              action: "accept"
            });
          } else {
            this.io.to(`user_${caller_id}`).emit("call-rejected", {
              call_id,
              target_id: userId,
              action: act
            });
          }
        } catch (err) {
          console.error("[SocketService] Error in call-response:", err);
        }
      });

      /**
       * WebRTC Signaling Relay (SDP offer/answer, ICE candidates)
       */
      socket.on("webrtc-signal", (payload) => {
        const { call_id, target_id, signal } = payload || {};
        if (!target_id || !signal) return;

        this.io.to(`user_${target_id}`).emit("webrtc-signal-relay", {
          call_id,
          sender_id: userId,
          signal
        });
      });

      /**
       * Hangup / Terminate an active call
       */
      socket.on("call-hangup", async (payload) => {
        try {
          const { call_id, partner_id } = payload || {};

          if (call_id) {
            await ChatCallingService.updateCallLog(call_id, {
              status: "ended",
              end_time: currentDT()
            });
          }

          if (partner_id) {
            this.io.to(`user_${partner_id}`).emit("call-terminated", {
              call_id,
              partner_id: userId
            });
          }

          // Acknowledge self
          socket.emit("call-terminated", {
            call_id,
            partner_id: userId
          });
        } catch (err) {
          console.error("[SocketService] Error in call-hangup:", err);
        }
      });

      /**
       * Cancel call before answered (Caller gave up or disconnected)
       */
      socket.on("call-cancel", async (payload) => {
        try {
          const { call_id, receiver_id } = payload || {};

          if (call_id) {
            await ChatCallingService.updateCallLog(call_id, {
              status: "missed",
              end_time: currentDT(),
              duration: 0
            });
          }

          if (receiver_id) {
            this.io.to(`user_${receiver_id}`).emit("call-missed", {
              call_id,
              caller_id: userId,
              reason: "cancelled"
            });
          }
        } catch (err) {
          console.error("[SocketService] Error in call-cancel:", err);
        }
      });

      /**
       * Call ringing timeout (Receiver didn't pick up)
       */
      socket.on("call-timeout", async (payload) => {
        try {
          const { call_id, caller_id, receiver_id } = payload || {};

          if (call_id) {
            await ChatCallingService.updateCallLog(call_id, {
              status: "missed",
              end_time: currentDT(),
              duration: 0
            });
          }

          const targetId = caller_id === userId ? receiver_id : caller_id;
          if (targetId) {
            this.io.to(`user_${targetId}`).emit("call-missed", {
              call_id,
              reason: "timeout"
            });
          }
        } catch (err) {
          console.error("[SocketService] Error in call-timeout:", err);
        }
      });

      /**
       * Check online status of users
       */
      socket.on("check-online-status", (payload, callback) => {
        const { user_ids = [] } = payload || {};
        const statusMap = {};

        for (const uId of user_ids) {
          statusMap[uId] = this.isUserOnline(Number(uId));
        }

        if (callback) {
          callback({ success: true, statuses: statusMap });
        }
      });

      // ========================================================
      // 3. DISCONNECT HANDLER
      // ========================================================
      socket.on("disconnect", () => {
        console.log(`[SocketService] Disconnected: Socket ${socket.id} for user ${userId}`);

        const socketSet = this.userSockets.get(userId);
        if (socketSet) {
          socketSet.delete(socket.id);
          if (socketSet.size === 0) {
            this.userSockets.delete(userId);
            // Broadcast user offline
            socket.broadcast.emit("user-status-changed", {
              user_id: userId,
              status: "offline"
            });
          }
        }
      });
    });
  }

  /**
   * Check if a user is currently online
   * @param {number} userId
   * @returns {boolean}
   */
  isUserOnline(userId) {
    const socketSet = this.userSockets.get(Number(userId));
    return Boolean(socketSet && socketSet.size > 0);
  }

  /**
   * Send a system notification alert to a specific user
   * @param {number} userId
   * @param {Object} notificationData
   */
  sendNotification(userId, notificationData) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit("new-notification", notificationData);
    }
  }
}

module.exports = new SocketService();
