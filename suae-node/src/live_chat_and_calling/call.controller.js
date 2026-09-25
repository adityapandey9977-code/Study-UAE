const ChatCallingService = require("./chat_calling.service");

class CallController {
  /**
   * Get Call History for the logged-in user (Student or Counsellor)
   * GET /chat/call-history?page=1&limit=20&status=ended&call_type=audio
   */
  static history = async (req, res) => {
    try {
      const currentUserId = req.currentUser.id;
      const { page = 1, limit = 20, status, call_type } = req.query;

      const result = await ChatCallingService.getUserCallHistory(currentUserId, {
        page,
        limit,
        status: status || null,
        call_type: call_type || null
      });

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error("[call-history] Error fetching user call history:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to fetch call history"
      });
    }
  };
}

module.exports = CallController;
