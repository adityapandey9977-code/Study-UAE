const db = require("../libraries/db");

/**
 * Service for managing student ticket details
 * Uses student_letters table with ticket_file field (stores only file ID, like admission_letter_fileid)
 */
class StudentTicketService {
  /**
   * Get ticket details for a specific student
   * @param {number} studentId - Student ID
   * @param {object} req - Express request object
   * @returns {Promise<object|null>} Ticket details or null if not found
   */
  static async getTicketDetails(studentId, req) {
    const ticket = await db.knex("student_letters")
      .where({ student_id: studentId })
      .first();

    if (!ticket || !ticket.ticket_file) {
      return null;
    }

    return {
      id: ticket.id,
      student_id: ticket.student_id,
      user_id: ticket.user_id,
      ins_id: ticket.ins_id,
      ticket_file: ticket.ticket_file,
      created: ticket.created,
      updated: ticket.updated,
    };
  }

  /**
   * Save or update ticket details for a student
   * @param {number} studentId - Student ID
   * @param {object} data - Ticket data
   * @param {object} req - Express request object
   * @returns {Promise<object>} Result with id and message
   */
  static async saveTicketDetails(studentId, data, req) {
    const userId = req.currentUser?.id;
    
    // Check if record already exists for this student
    const existing = await db.knex("student_letters")
      .where({ student_id: studentId })
      .first();

    // Store only file_id (like other fields: admission_letter_fileid, visa_letter_fileid, etc.)
    const ticketFileId = data.file_id || null;

    if (!ticketFileId) {
      throw new Error("file_id is required");
    }

    if (existing) {
      // Update existing record
      await db.knex("student_letters")
        .where({ id: existing.id })
        .update({
          ticket_file: ticketFileId,
          updated: db.knex.fn.now(),
        });

      return { 
        id: existing.id, 
        message: "Ticket file updated successfully",
        action: "updated"
      };
    } else {
      // Insert new record
      const [id] = await db.knex("student_letters").insert({
        student_id: studentId,
        user_id: userId,
        ticket_file: ticketFileId,
        created: db.knex.fn.now(),
        updated: db.knex.fn.now(),
      });

      return { 
        id, 
        message: "Ticket file saved successfully",
        action: "created"
      };
    }
  }

  /**
   * Delete ticket details
   * @param {number} studentId - Student ID (for security check)
   * @param {object} req - Express request object
   * @returns {Promise<void>}
   */
  static async deleteTicketDetails(studentId, req) {
    const ticket = await db.knex("student_letters")
      .where({ student_id: studentId })
      .first();

    if (!ticket) {
      throw new Error("Ticket record not found");
    }

    // Clear the ticket_file field
    await db.knex("student_letters")
      .where({ student_id: studentId })
      .update({
        ticket_file: null,
        updated: db.knex.fn.now(),
      });
  }

  /**
   * Get all tickets (for admin/institute view)
   * @param {object} filters - Filter criteria
   * @param {object} req - Express request object
   * @returns {Promise<Array>} List of tickets with student details
   */
  static async getAllTickets(filters, req) {
    const query = db.knex("student_letters as sl")
      .select(
        "sl.id",
        "sl.student_id",
        "sl.user_id",
        "sl.ins_id",
        "sl.ticket_file",
        "sl.created",
        "sl.updated",
        "s.name as student_name",
        "s.regno as student_regno",
        "s.email as student_email",
        "s.mobile as student_mobile"
      )
      .leftJoin("students as s", "sl.student_id", "s.id")
      .whereNotNull("sl.ticket_file");

    // Apply filters
    if (filters.student_id) {
      query.where("sl.student_id", filters.student_id);
    }

    if (filters.from_date) {
      query.where("sl.created", ">=", filters.from_date);
    }

    if (filters.to_date) {
      query.where("sl.created", "<=", filters.to_date);
    }

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.page_size || 50;
    const offset = (page - 1) * pageSize;

    const tickets = await query
      .orderBy("sl.created", "desc")
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const countQuery = db.knex("student_letters as sl")
      .whereNotNull("sl.ticket_file");

    if (filters.student_id) {
      countQuery.where("sl.student_id", filters.student_id);
    }
    if (filters.from_date) {
      countQuery.where("sl.created", ">=", filters.from_date);
    }
    if (filters.to_date) {
      countQuery.where("sl.created", "<=", filters.to_date);
    }

    const [{ count }] = await countQuery.count("* as count");

    return {
      data: tickets,
      pagination: {
        page,
        page_size: pageSize,
        total: count,
        total_pages: Math.ceil(count / pageSize),
      },
    };
  }

  /**
   * Get ticket statistics
   * @param {object} filters - Filter criteria
   * @returns {Promise<object>} Statistics object
   */
  static async getTicketStats(filters = {}) {
    const query = db.knex("student_letters")
      .whereNotNull("ticket_file");

    if (filters.from_date) {
      query.where("created", ">=", filters.from_date);
    }

    if (filters.to_date) {
      query.where("created", "<=", filters.to_date);
    }

    const [stats] = await query
      .count("* as total");

    return {
      total: parseInt(stats.total) || 0,
    };
  }
}

module.exports = StudentTicketService;
