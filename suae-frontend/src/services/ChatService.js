import axiosnode from "../utils/axiosnode";

class ChatService {
  /**
   * Super Admin: Get all conversations overview across the platform
   */
  getAdminConversations(params = {}) {
    return axiosnode.get("chat/admin/conversations", { params });
  }

  /**
   * Super Admin: View full chat history between two users or for a student
   */
  getAdminChatHistory(params = {}) {
    return axiosnode.get("chat/admin/history", { params });
  }

  /**
   * Super Admin: View all platform call logs with duration statistics
   */
  getAdminCallLogs(params = {}) {
    return axiosnode.get("chat/admin/call-logs", { params });
  }

  /**
   * Get recent threads for the current logged-in user
   */
  getRecentThreads() {
    return axiosnode.get("chat/recent-threads");
  }

  /**
   * Get chat history between current user and partner
   */
  getChatHistory(params = {}) {
    return axiosnode.get("chat/history", { params });
  }

  /**
   * Get call history for the current logged-in user
   */
  getUserCallHistory(params = {}) {
    return axiosnode.get("chat/call-history", { params });
  }

  /**
   * Send a chat message via HTTP REST API
   */
  sendMessage(data) {
    return axiosnode.post("chat/send-message", data);
  }

  /**
   * Mark messages as read via HTTP REST API
   */
  markRead(data) {
    return axiosnode.post("chat/mark-read", data);
  }

  /**
   * Upload an audio voice note
   */
  uploadAudio(formData) {
    return axiosnode.post("chat/upload-audio", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }

  /**
   * Upload an image or file attachment
   */
  uploadFile(formData) {
    return axiosnode.post("chat/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
}

export default new ChatService();
