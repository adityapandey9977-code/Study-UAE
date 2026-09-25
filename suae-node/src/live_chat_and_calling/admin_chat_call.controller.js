const ChatCallingService = require("./chat_calling.service");

class AdminChatCallController {
  /**
   * Super Admin: List all conversations across the entire platform
   * GET /chat/admin/conversations?student_id=&counsellor_id=&search=&from_date=&to_date=&page=1&limit=20
   */
  static conversations = async (req, res) => {
    try {
      const { isAdmin, isClient } = req.currentUser || {};
      if (!isAdmin && !isClient) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only administrators can access this resource."
        });
      }

      const {
        student_id,
        counsellor_id,
        search,
        from_date,
        to_date,
        page = 1,
        limit = 20
      } = req.query;

      const result = await ChatCallingService.getAdminConversations({
        student_id: student_id ? Number(student_id) : null,
        counsellor_id: counsellor_id ? Number(counsellor_id) : null,
        search: search || "",
        from_date: from_date || null,
        to_date: to_date || null,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error("[admin-conversations] Error fetching conversations:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to retrieve conversations"
      });
    }
  };

  /**
   * Super Admin: View full chat history between any two users
   * GET /chat/admin/history?user1_id=12&user2_id=34&limit=100&before_id=...
   */
  static chatHistory = async (req, res) => {
    try {
      const { isAdmin, isClient } = req.currentUser || {};
      if (!isAdmin && !isClient) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only administrators can access this resource."
        });
      }

      let user1Id = req.query.user1_id || req.query.student_user_id;
      let user2Id = req.query.user2_id || req.query.counsellor_id;
      const studentId = req.query.student_id;
      const limit = req.query.limit ? Number(req.query.limit) : 2000;
      const beforeId = req.query.before_id ? Number(req.query.before_id) : null;

      // Auto resolve student_id to user_id if needed
      if (!user1Id && studentId) {
        const db = require("../libraries/db");
        const student = await db.knex("students").select("user_id").where({ id: Number(studentId) }).first();
        if (student && student.user_id) {
          user1Id = student.user_id;
        } else {
          user1Id = studentId; // fallback
        }
      }

      if (!user1Id) {
        return res.status(400).json({
          success: false,
          message: "user1_id or student_id is required"
        });
      }

      const messages = await ChatCallingService.getAdminChatHistory(user1Id, user2Id, {
        limit,
        before_id: beforeId
      });

      return res.status(200).json({
        success: true,
        user1_id: Number(user1Id),
        user2_id: user2Id ? Number(user2Id) : null,
        messages
      });
    } catch (err) {
      console.error("[admin-chat-history] Error loading chat history:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to retrieve chat history"
      });
    }
  };

  /**
   * Super Admin: View all call logs with duration analytics & filtering
   * GET /chat/admin/call-logs?student_id=&counsellor_id=&status=&from_date=&to_date=&page=1&limit=20
   */
  static callLogs = async (req, res) => {
    try {
      const { isAdmin, isClient } = req.currentUser || {};
      if (!isAdmin && !isClient) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only administrators can access this resource."
        });
      }

      const {
        student_id,
        counsellor_id,
        caller_id,
        receiver_id,
        status,
        from_date,
        to_date,
        page = 1,
        limit = 20
      } = req.query;

      const result = await ChatCallingService.getAdminCallLogs({
        student_id: student_id ? Number(student_id) : null,
        counsellor_id: counsellor_id ? Number(counsellor_id) : null,
        caller_id: caller_id ? Number(caller_id) : null,
        receiver_id: receiver_id ? Number(receiver_id) : null,
        status: status || null,
        from_date: from_date || null,
        to_date: to_date || null,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error("[admin-call-logs] Error loading call logs:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to retrieve call logs"
      });
    }
  };
}

module.exports = AdminChatCallController;
