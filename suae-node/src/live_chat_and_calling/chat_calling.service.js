const db = require("../libraries/db");
const { currentDT } = require("../util/common.util");

class ChatCallingService {
  // ==========================================
  // CHAT MESSAGES MANAGEMENT
  // ==========================================

  /**
   * Save a chat message to database
   */
  static async saveMessage({ sender_id, receiver_id, message_type = "text", content = null, file_path = null }) {
    const validTypes = ["text", "audio", "image", "file"];
    const type = validTypes.includes(message_type) ? message_type : "text";

    const messageData = {
      sender_id: Number(sender_id),
      receiver_id: Number(receiver_id),
      message_type: type,
      content: content || null,
      file_path: file_path || null,
      is_read: 0,
      created_at: currentDT()
    };

    const messageId = await db.save("lc_messages", messageData);
    if (!messageId) {
      throw new Error("Failed to save message in database");
    }

    return {
      id: messageId,
      ...messageData
    };
  }

  /**
   * Mark messages as read between two users
   */
  static async markMessagesRead(sender_id, receiver_id) {
    return await db.knex("lc_messages")
      .where({
        sender_id: Number(sender_id),
        receiver_id: Number(receiver_id),
        is_read: 0
      })
      .update({ is_read: 1 });
  }

  /**
   * Retrieve chat history between two users (cursor paginated)
   */
  static async getChatHistory(userId, partnerId, { limit = 50, before_id = null } = {}) {
    const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const uId = Number(userId);
    const pId = Number(partnerId);

    let query = db.knex("lc_messages")
      .where((builder) => {
        builder.where({ sender_id: uId, receiver_id: pId })
          .orWhere({ sender_id: pId, receiver_id: uId });
      });

    if (before_id && !isNaN(Number(before_id))) {
      query = query.where("id", "<", Number(before_id));
    }

    const messages = await query
      .orderBy("id", "desc")
      .limit(parsedLimit);

    return messages.reverse();
  }

  /**
   * Sync offline / new messages received after last_message_id
   */
  static async getSyncMessages(userId, lastMessageId) {
    const uId = Number(userId);
    const lastId = Number(lastMessageId) || 0;

    return await db.knex("lc_messages")
      .where({ receiver_id: uId })
      .where("id", ">", lastId)
      .orderBy("id", "asc");
  }

  /**
   * Get unread message counts grouped by sender
   */
  static async getUnreadCounts(userId) {
    const uId = Number(userId);
    const counts = await db.knex("lc_messages")
      .select("sender_id")
      .count("* as count")
      .where({ receiver_id: uId, is_read: 0 })
      .groupBy("sender_id");

    return counts.map(c => ({
      sender_id: Number(c.sender_id),
      unread_count: Number(c.count || 0)
    }));
  }

  /**
   * Get recent conversations threads for a user
   */
  static async getRecentThreads(userId) {
    const uId = Number(userId);

    // Find all distinct partner IDs
    const partners = await db.knex("lc_messages")
      .select(db.knex.raw(`
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END as partner_id
      `, [uId]))
      .where({ sender_id: uId })
      .orWhere({ receiver_id: uId })
      .groupBy("partner_id");

    const threads = [];
    for (const p of partners) {
      const partnerId = Number(p.partner_id);
      if (!partnerId) continue;

      const partnerDetails = await db.knex("users as u")
        .leftJoin("roles as r", "r.id", "u.role_id")
        .select([
          "u.id",
          "u.name",
          "u.fname",
          "u.lname",
          "u.email",
          "u.mobile",
          "u.type",
          "r.title as role"
        ])
        .where({ "u.id": partnerId })
        .first();

      if (!partnerDetails) continue;

      const lastMsg = await db.knex("lc_messages")
        .where(builder => {
          builder.where({ sender_id: uId, receiver_id: partnerId })
            .orWhere({ sender_id: partnerId, receiver_id: uId });
        })
        .orderBy("id", "desc")
        .first();

      const unreadCount = await db.knex("lc_messages")
        .where({ sender_id: partnerId, receiver_id: uId, is_read: 0 })
        .count("* as count")
        .first();

      threads.push({
        partner: partnerDetails,
        last_message: lastMsg || null,
        unread_count: Number(unreadCount?.count || 0)
      });
    }

    threads.sort((a, b) => {
      const aTime = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
      const bTime = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
      return bTime - aTime;
    });

    return threads;
  }

  // ==========================================
  // CALL LOGGING & CALL HISTORY
  // ==========================================

  /**
   * Create an initial call log entry
   */
  static async createCallLog({ call_id, caller_id, receiver_id, call_type = "audio", metadata = null }) {
    const logData = {
      call_id: String(call_id),
      caller_id: Number(caller_id),
      receiver_id: Number(receiver_id),
      call_type: call_type === "video" ? "video" : "audio",
      status: "initiated",
      start_time: currentDT(),
      answered_at: null,
      end_time: null,
      duration: 0,
      metadata: metadata ? JSON.stringify(metadata) : null,
      created_at: currentDT()
    };

    const inserted = await db.knex("lc_call_logs").insert(logData);
    return {
      id: inserted[0],
      ...logData
    };
  }

  /**
   * Update a call log by unique call_id
   */
  static async updateCallLog(call_id, updates) {
    if (!call_id) return null;

    const data = { ...updates };
    if (data.metadata && typeof data.metadata === "object") {
      data.metadata = JSON.stringify(data.metadata);
    }

    // Auto-calculate duration if answered_at and end_time exist
    if (data.end_time) {
      const existing = await db.knex("lc_call_logs").where({ call_id }).first();
      const answeredTime = data.answered_at ? new Date(data.answered_at) : (existing?.answered_at ? new Date(existing.answered_at) : null);
      if (answeredTime && !isNaN(answeredTime.getTime())) {
        const endTime = new Date(data.end_time);
        const durationSec = Math.max(0, Math.round((endTime.getTime() - answeredTime.getTime()) / 1000));
        data.duration = durationSec;
      }
    }

    await db.knex("lc_call_logs")
      .where({ call_id })
      .update(data);

    return await db.knex("lc_call_logs").where({ call_id }).first();
  }

  /**
   * Get call history for a logged in user
   */
  static async getUserCallHistory(userId, { page = 1, limit = 20, status = null, call_type = null } = {}) {
    const uId = Number(userId);
    const p = Math.max(Number(page) || 1, 1);
    const ps = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offset = (p - 1) * ps;

    let query = db.knex("lc_call_logs as c")
      .leftJoin("users as u_caller", "u_caller.id", "c.caller_id")
      .leftJoin("users as u_receiver", "u_receiver.id", "c.receiver_id")
      .select([
        "c.id",
        "c.call_id",
        "c.caller_id",
        "c.receiver_id",
        "c.call_type",
        "c.status",
        "c.start_time",
        "c.answered_at",
        "c.end_time",
        "c.duration",
        "c.created_at",
        "u_caller.name as caller_name",
        "u_caller.type as caller_type",
        "u_receiver.name as receiver_name",
        "u_receiver.type as receiver_type",
        db.knex.raw("CASE WHEN c.caller_id = ? THEN 'outgoing' ELSE 'incoming' END as direction", [uId])
      ])
      .where(builder => {
        builder.where("c.caller_id", uId).orWhere("c.receiver_id", uId);
      });

    if (status) {
      query = query.where("c.status", status);
    }
    if (call_type) {
      query = query.where("c.call_type", call_type);
    }

    const totalCount = await query.clone().clearSelect().clearOrder().count("* as total").first();
    const total = Number(totalCount?.total || 0);

    const logs = await query.orderBy("c.id", "desc").limit(ps).offset(offset);

    // Format logs with partner object
    const data = logs.map(log => {
      const isCaller = log.caller_id === uId;
      return {
        ...log,
        partner: {
          id: isCaller ? log.receiver_id : log.caller_id,
          name: isCaller ? log.receiver_name : log.caller_name,
          type: isCaller ? log.receiver_type : log.caller_type
        }
      };
    });

    return {
      data,
      page: {
        cur_page: p,
        page_size: ps,
        total_records: total,
        total_pages: Math.ceil(total / ps)
      }
    };
  }

  // ==========================================
  // SUPER ADMIN MONITORING & AUDIT
  // ==========================================

  /**
   * Super Admin: Overview of all conversations with filters
   */
  static async getAdminConversations({ student_id = null, counsellor_id = null, search = "", from_date = null, to_date = null, page = 1, limit = 20 } = {}) {
    const p = Math.max(Number(page) || 1, 1);
    const ps = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offset = (p - 1) * ps;

    // Build unique pairs
    let pairQuery = db.knex("lc_messages")
      .select(db.knex.raw(`
        LEAST(sender_id, receiver_id) as user1_id,
        GREATEST(sender_id, receiver_id) as user2_id,
        COUNT(*) as total_messages,
        MAX(id) as last_message_id,
        MAX(created_at) as last_active
      `))
      .groupByRaw("LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)");

    if (from_date) {
      pairQuery = pairQuery.whereRaw("DATE(created_at) >= ?", [from_date]);
    }
    if (to_date) {
      pairQuery = pairQuery.whereRaw("DATE(created_at) <= ?", [to_date]);
    }

    const pairs = await pairQuery;

    // Enrich pairs with user details and filter by role / student / counsellor / search
    let enriched = [];
    for (const pair of pairs) {
      const u1 = await db.knex("users as u")
        .leftJoin("roles as r", "r.id", "u.role_id")
        .select("u.id", "u.name", "u.email", "u.mobile", "u.type", "r.title as role")
        .where({ "u.id": pair.user1_id })
        .first();

      const u2 = await db.knex("users as u")
        .leftJoin("roles as r", "r.id", "u.role_id")
        .select("u.id", "u.name", "u.email", "u.mobile", "u.type", "r.title as role")
        .where({ "u.id": pair.user2_id })
        .first();

      if (!u1 || !u2) continue;

      let student = null;
      let counsellor = null;

      if (u1.type === "STUDENT") student = u1;
      else counsellor = u1;

      if (u2.type === "STUDENT") student = u2;
      else counsellor = u2;

      // Filter by student_id
      if (student_id && (!student || student.id !== Number(student_id))) {
        continue;
      }
      // Filter by counsellor_id
      if (counsellor_id && (!counsellor || counsellor.id !== Number(counsellor_id))) {
        continue;
      }

      // Filter by search keyword
      if (search) {
        const s = search.toLowerCase();
        const matchU1 = u1.name?.toLowerCase().includes(s) || u1.email?.toLowerCase().includes(s) || u1.mobile?.includes(s);
        const matchU2 = u2.name?.toLowerCase().includes(s) || u2.email?.toLowerCase().includes(s) || u2.mobile?.includes(s);
        if (!matchU1 && !matchU2) continue;
      }

      // Get last message details
      const lastMsg = await db.knex("lc_messages").where({ id: pair.last_message_id }).first();

      enriched.push({
        user1: u1,
        user2: u2,
        student,
        counsellor,
        total_messages: Number(pair.total_messages),
        last_message: lastMsg || null,
        last_active: pair.last_active
      });
    }

    // Sort by last active descending
    enriched.sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());

    const totalRecords = enriched.length;
    const paginated = enriched.slice(offset, offset + ps);

    return {
      data: paginated,
      page: {
        cur_page: p,
        page_size: ps,
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / ps)
      }
    };
  }

  /**
   * Super Admin: View full chat history between any two users (or for a specific user)
   */
  static async getAdminChatHistory(user1Id, user2Id = null, { limit = 2000, before_id = null } = {}) {
    const parsedLimit = Math.min(Math.max(Number(limit) || 2000, 1), 10000);
    const u1 = Number(user1Id);
    const u2 = user2Id ? Number(user2Id) : null;

    let query = db.knex("lc_messages as m")
      .leftJoin("users as u_sender", "u_sender.id", "m.sender_id")
      .leftJoin("users as u_receiver", "u_receiver.id", "m.receiver_id")
      .select([
        "m.id",
        "m.sender_id",
        "m.receiver_id",
        "m.message_type",
        "m.content",
        "m.file_path",
        "m.is_read",
        "m.created_at",
        "u_sender.name as sender_name",
        "u_sender.type as sender_type",
        "u_receiver.name as receiver_name",
        "u_receiver.type as receiver_type"
      ]);

    if (u2 && !isNaN(u2) && u2 > 0) {
      query = query.where((builder) => {
        builder.where({ "m.sender_id": u1, "m.receiver_id": u2 })
          .orWhere({ "m.sender_id": u2, "m.receiver_id": u1 });
      });
    } else {
      query = query.where((builder) => {
        builder.where("m.sender_id", u1).orWhere("m.receiver_id", u1);
      });
    }

    if (before_id && !isNaN(Number(before_id))) {
      query = query.where("m.id", "<", Number(before_id));
    }

    const messages = await query
      .orderBy("m.id", "desc")
      .limit(parsedLimit);

    return messages.reverse();
  }

  /**
   * Super Admin: View all call logs across the system with filters & metrics
   */
  static async getAdminCallLogs({ student_id = null, counsellor_id = null, caller_id = null, receiver_id = null, status = null, from_date = null, to_date = null, page = 1, limit = 20 } = {}) {
    const p = Math.max(Number(page) || 1, 1);
    const ps = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offset = (p - 1) * ps;

    let query = db.knex("lc_call_logs as c")
      .leftJoin("users as u_caller", "u_caller.id", "c.caller_id")
      .leftJoin("roles as r_caller", "r_caller.id", "u_caller.role_id")
      .leftJoin("users as u_receiver", "u_receiver.id", "c.receiver_id")
      .leftJoin("roles as r_receiver", "r_receiver.id", "u_receiver.role_id")
      .select([
        "c.id",
        "c.call_id",
        "c.caller_id",
        "c.receiver_id",
        "c.call_type",
        "c.status",
        "c.start_time",
        "c.answered_at",
        "c.end_time",
        "c.duration",
        "c.metadata",
        "c.created_at",
        "u_caller.name as caller_name",
        "u_caller.email as caller_email",
        "u_caller.mobile as caller_mobile",
        "u_caller.type as caller_type",
        "r_caller.title as caller_role",
        "u_receiver.name as receiver_name",
        "u_receiver.email as receiver_email",
        "u_receiver.mobile as receiver_mobile",
        "u_receiver.type as receiver_type",
        "r_receiver.title as receiver_role"
      ]);

    if (caller_id) {
      query = query.where("c.caller_id", Number(caller_id));
    }
    if (receiver_id) {
      query = query.where("c.receiver_id", Number(receiver_id));
    }
    if (student_id) {
      const sId = Number(student_id);
      query = query.where(builder => {
        builder.where({ "c.caller_id": sId, "u_caller.type": "STUDENT" })
          .orWhere({ "c.receiver_id": sId, "u_receiver.type": "STUDENT" });
      });
    }
    if (counsellor_id) {
      const cId = Number(counsellor_id);
      query = query.where(builder => {
        builder.where("c.caller_id", cId).orWhere("c.receiver_id", cId);
      });
    }
    if (status) {
      query = query.where("c.status", status);
    }
    if (from_date) {
      query = query.where("c.created_at", ">=", `${from_date} 00:00:00`);
    }
    if (to_date) {
      query = query.where("c.created_at", "<=", `${to_date} 23:59:59`);
    }

    // Analytics Summary
    const statsQuery = query.clone().clearSelect().clearOrder().select([
      db.knex.raw("COUNT(*) as total_calls"),
      db.knex.raw("SUM(c.duration) as total_duration_seconds"),
      db.knex.raw("SUM(CASE WHEN c.status = 'ended' OR c.status = 'answered' THEN 1 ELSE 0 END) as completed_calls"),
      db.knex.raw("SUM(CASE WHEN c.status = 'missed' THEN 1 ELSE 0 END) as missed_calls"),
      db.knex.raw("SUM(CASE WHEN c.status = 'rejected' OR c.status = 'busy' THEN 1 ELSE 0 END) as rejected_calls")
    ]);
    const stats = await statsQuery.first();

    const total = Number(stats?.total_calls || 0);
    const data = await query.orderBy("c.id", "desc").limit(ps).offset(offset);

    return {
      data,
      stats: {
        total_calls: total,
        total_duration_seconds: Number(stats?.total_duration_seconds || 0),
        total_duration_minutes: Math.round(Number(stats?.total_duration_seconds || 0) / 60),
        completed_calls: Number(stats?.completed_calls || 0),
        missed_calls: Number(stats?.missed_calls || 0),
        rejected_calls: Number(stats?.rejected_calls || 0)
      },
      page: {
        cur_page: p,
        page_size: ps,
        total_records: total,
        total_pages: Math.ceil(total / ps)
      }
    };
  }
}

module.exports = ChatCallingService;
