const { Server } = require("socket.io");
const { decodeJwtToken, currentDT } = require("../util/common.util");
const UserService = require("./user.service");
const db = require("../libraries/db");

/**
 * Socket.io Real-Time Communication Service
 * Handles real-time messaging, WebRTC calling signaling, and user active status mapping.
 */
class SocketService {
  constructor() {
    this.io = null;
    // Map of userId -> Set of socketIds (to support multiple tabs/connections per user)
    this.userSockets = new Map();
  }

  /**
   * Initialize Socket.io server
   * @param {Object} server - HTTP or HTTPS Server instance
   */
  init(server) {
    console.log("Initializing Socket.io server...");
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Authentication Middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
          return next(new Error("Authentication token is required"));
        }

        const decoded = decodeJwtToken(token);
        if (!decoded || !decoded.id) {
          return next(new Error("Invalid authorization token"));
        }

        const user = await UserService.detail(decoded.id);
        if (!user) {
          return next(new Error("User account not found"));
        }

        if (user.status !== 1) {
          return next(new Error("User account is inactive"));
        }

        // Attach user profile to the socket instance
        socket.currentUser = user;
        next();
      } catch (err) {
        console.error("Socket authentication error:", err.message);
        next(new Error("Authentication failed"));
      }
    });

    // Connection Handler
    this.io.on("connection", (socket) => {
      const userId = socket.currentUser.id;
      console.log(`User connected: ${socket.currentUser.name} (ID: ${userId}), Socket: ${socket.id}`);

      // Add connection to tracking map
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(socket.id);

      // Join individual user room for targeting broadcasts
      socket.join(`user_${userId}`);

      // 1. EVENT: send-message (Client sending a chat message)
      socket.on("send-message", async (payload, callback) => {
        try {
          const { receiver_id, message_type, content, file_path } = payload || {};
          if (!receiver_id) {
            if (callback) callback({ success: false, error: "receiver_id is required" });
            return;
          }

          // Validate message types
          const validTypes = ["text", "audio", "image", "file"];
          const type = validTypes.includes(message_type) ? message_type : "text";

          const messageData = {
            sender_id: userId,
            receiver_id: Number(receiver_id),
            message_type: type,
            content: content || null,
            file_path: file_path || null,
            is_read: 0,
            created_at: currentDT()
          };

          // Save message to MySQL database
          const messageId = await db.save("lc_messages", messageData);
          if (!messageId) {
            throw new Error("Failed to save message to database");
          }

          const savedMessage = {
            id: messageId,
            ...messageData
          };

          // Broadcast to receiver's socket rooms
          this.io.to(`user_${receiver_id}`).emit("new-message", savedMessage);
          
          // Send active notification alert
          this.io.to(`user_${receiver_id}`).emit("new-notification", {
            type: "chat_message",
            title: `New message from ${socket.currentUser.name}`,
            body: type === "text" ? content : `Sent a ${type} attachment`,
            message: savedMessage
          });

          // Acknowledge back to sender
          if (callback) {
            callback({
              success: true,
              message: savedMessage
            });
          }
        } catch (err) {
          console.error("Error handling send-message:", err);
          if (callback) callback({ success: false, error: err.message });
        }
      });

      // 2. EVENT: message-read (Client marking chat messages read)
      socket.on("message-read", async (payload) => {
        try {
          const { partner_id } = payload || {};
          if (!partner_id) return;

          // Update message read status in DB
          await db.knex("lc_messages")
            .where({
              sender_id: Number(partner_id),
              receiver_id: userId,
              is_read: 0
            })
            .update({ is_read: 1 });

          // Notify sender that their messages are read
          this.io.to(`user_${partner_id}`).emit("messages-marked-read", {
            reader_id: userId
          });
        } catch (err) {
          console.error("Error handling message-read:", err);
        }
      });

      // 3. WebRTC Calling Signaling Events
      // Initiate a call
      socket.on("call-initiate", (payload) => {
        const { receiver_id, media_type } = payload || {};
        if (!receiver_id) return;

        this.io.to(`user_${receiver_id}`).emit("call-incoming", {
          caller_id: userId,
          caller_name: socket.currentUser.name,
          media_type: media_type || "audio"
        });
      });

      // Respond to incoming call (accept or reject)
      socket.on("call-response", (payload) => {
        const { caller_id, action } = payload || {};
        if (!caller_id) return;

        this.io.to(`user_${caller_id}`).emit("call-answered", {
          target_id: userId,
          action: action // 'accept' or 'reject'
        });
      });

      // Relay WebRTC SDP descriptions / ICE candidates
      socket.on("webrtc-signal", (payload) => {
        const { target_id, signal } = payload || {};
        if (!target_id) return;

        this.io.to(`user_${target_id}`).emit("webrtc-signal-relay", {
          sender_id: userId,
          signal
        });
      });

      // End/Hang up call
      socket.on("call-hangup", (payload) => {
        const { partner_id } = payload || {};
        if (!partner_id) return;

        this.io.to(`user_${partner_id}`).emit("call-terminated", {
          partner_id: userId
        });
      });

      // 4. EVENT: disconnect
      socket.on("disconnect", () => {
        console.log(`User disconnected: Socket ${socket.id} for user ${userId}`);
        
        const socketSet = this.userSockets.get(userId);
        if (socketSet) {
          socketSet.delete(socket.id);
          if (socketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });
    });
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
