const { Router } = require("express");
const router = Router({ mergeParams: true });
const { body, param, query } = require("express-validator");
const { validationResponse } = require("../middleware/validation.mw");
const { trim } = require("../util/common.util");
const db = require("../libraries/db");

class NotificationCtrl {
    // GET /notifications (institute notifications)
    static getInstituteNotifications = async (req, res) => {
        try {
            console.log('Current user:', req.currentUser); // Debug log
            const { isInstitute, isClient, isAdmin } = req.currentUser || {};
            // Allow institutes, clients (super admin), and admins to view notifications
            if (!isInstitute && !isClient && !isAdmin) {
                return res.status(403).json({ message: "Access denied" });
            }

            const { k: keyword, p = 1, ps = 10 } = req.query;
            const { institute_id } = req.currentUser || {};
            let query;
            
            if (institute_id) {
                // User has a specific institute_id
                query = db.knex("institute_notifications as n")
                    .leftJoin("institute_noti_read as nr", function () {
                        this.on("nr.notification_id", "=", "n.id")
                            .andOn("nr.institute_id", "=", institute_id);
                    })
                    .select([
                        "n.id",
                        "n.title",
                        "n.description",
                        "n.status",
                        "n.updated as created",
                        db.knex.raw("CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as isread")
                    ])
                    .whereIn("n.client_id", [1, institute_id]);
            } else {
                // Default case - show notifications for client_id = 1 (system notifications)
                query = db.knex("institute_notifications as n")
                    .leftJoin("institute_noti_read as nr", function () {
                        this.on("nr.notification_id", "=", "n.id")
                            .andOn("nr.institute_id", "=", 1);
                    })
                    .select([
                        "n.id",
                        "n.title",
                        "n.description",
                        "n.status",
                        "n.updated as created",
                        db.knex.raw("CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as isread")
                    ])
                    .where("n.client_id", 1);
            }
            
            query = query.orderBy("n.updated", "desc");

            // Hide inactive notifications from actual institutes
            if (isInstitute) {
                query = query.where("n.status", 1);
            }

            if (keyword) {
                query = query.where(function () {
                    this.where("n.title", "like", `%${keyword}%`)
                        .orWhere("n.description", "like", `%${keyword}%`);
                });
            }

            const totalResult = await query
                .clone()
                .clearSelect()
                .clearOrder()
                .count({ total: "*" })
                .first();
            const total = totalResult.total;
            const offset = (p - 1) * ps;
            const data = await query.limit(ps).offset(offset);

            // Generate a result key for caching
            const result_key = `inst_notif_${Date.now()}`;

            return res.status(200).json({
                message: "",
                result_key,
                result: {
                    data,
                    page: {
                        start: offset,
                        total: data.length,
                        total_records: total,
                        cur_page: parseInt(p)
                    }
                },
            });
        } catch (e) {
            console.error('Institute notifications error:', e); // Debug log
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    // GET /notifications/unread-count (institute unread notifications count)
    static getInstituteUnreadCount = async (req, res) => {
        try {
            const { isInstitute, isClient, isAdmin } = req.currentUser || {};
            if (!isInstitute && !isClient && !isAdmin) {
                return res.status(403).json({ message: "Access denied" });
            }

            const { institute_id } = req.currentUser || {};
            const scopeClientIds = institute_id ? [1, institute_id] : [1];
            const joinInstituteId = institute_id || 1;

            const row = await db.knex("institute_notifications as n")
                .leftJoin("institute_noti_read as nr", function () {
                    this.on("nr.notification_id", "=", "n.id")
                        .andOn("nr.institute_id", "=", joinInstituteId);
                })
                .whereIn("n.client_id", scopeClientIds)
                .where("n.status", 1)
                .whereNull("nr.id")
                .count({ total: "*" })
                .first();

            const total = Number(row?.total || 0);
            return res.status(200).json({ result: Number.isFinite(total) ? total : 0 });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    // POST /notifications (save institute notification)
    static saveInstituteNotification = async (req, res) => {
        try {
            const { isInstitute, isClient, isAdmin } = req.currentUser || {};
            if (!isInstitute && !isClient && !isAdmin) {
                return res.status(403).json({ message: "Access denied" });
            }

            const { id, title, description, status } = trim(req.body || {});
            const { institute_id } = req.currentUser || {};

            if (!title || !description) {
                return res.status(400).json({ message: "title and description are required" });
            }

            const payload = {
                title,
                description,
                status: status === 0 || status === '0' ? 0 : 1,
                client_id: institute_id || 1, // Default to 1 if institute_id is null
                updated: new Date(),
            };

            let result;
            if (id) {
                result = await db.knex("institute_notifications").where("id", id).update(payload);
            } else {
                result = await db.knex("institute_notifications").insert(payload);
            }

            return res.status(200).json({ message: "Notification saved successfully", result: { id: id || result[0] } });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    // GET /student-notifications (student notifications)
    static getStudentNotifications = async (req, res) => {
        try {
            console.log('Current user for student notifications:', req.currentUser); // Debug log
            const { isStudent, isClient, isAdmin, student_id, institute_id } = req.currentUser || {};
            // Allow students, clients (super admin), and admins to view notifications
            if (!isStudent && !isClient && !isAdmin && !student_id) {
                return res.status(403).json({ message: "Access denied" });
            }

            const { k: keyword, p = 1, ps = 10 } = req.query;

            let query = db.knex("student_notifications as n")
                .leftJoin("student_noti_read as nr", function () {
                    this.on("nr.notification_id", "=", "n.id")
                        .andOn("nr.student_id", "=", student_id || 0);
                })
                .select([
                    "n.id",
                    "n.title",
                    "n.description",
                    "n.status",
                    "n.updated as created",
                    db.knex.raw("CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as isread")
                ])
                .where("n.client_id", institute_id || 1)
                .orderBy("n.updated", "desc");

            // Hide inactive notifications from actual students
            if (isStudent) {
                query = query.where("n.status", 1);
            }

            if (keyword) {
                query = query.where(function () {
                    this.where("n.title", "like", `%${keyword}%`)
                        .orWhere("n.description", "like", `%${keyword}%`);
                });
            }

            const totalResult = await query
                .clone()
                .clearSelect()
                .clearOrder()
                .count({ total: "*" })
                .first();
            const total = totalResult.total;
            const offset = (p - 1) * ps;
            const data = await query.limit(ps).offset(offset);

            // Generate a result key for caching
            const result_key = `stu_notif_${Date.now()}`;

            return res.status(200).json({
                message: "",
                result_key,
                result: {
                    data,
                    page: {
                        start: offset,
                        total: data.length,
                        total_records: total,
                        cur_page: parseInt(p)
                    }
                },
            });
        } catch (e) {
            console.error('Student notifications error:', e); // Debug log
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    // POST /student-notifications (save student notification)
    static saveStudentNotification = async (req, res) => {
        try {
            const { isClient, isAdmin } = req.currentUser || {};
            if (!isClient && !isAdmin) {
                return res.status(403).json({ message: "Only admin can save student notifications" });
            }

            const { id, title, description, status } = trim(req.body || {});
            const { institute_id } = req.currentUser;

            if (!title || !description) {
                return res.status(400).json({ message: "title and description are required" });
            }

            const payload = {
                title,
                description,
                status: status === 0 || status === '0' ? 0 : 1,
                client_id: institute_id || 1,
                updated: new Date(),
            };

            let result;
            if (id) {
                result = await db.knex("student_notifications").where("id", id).update(payload);
            } else {
                result = await db.knex("student_notifications").insert(payload);
            }

            return res.status(200).json({ message: "Notification saved successfully", result: { id: id || result[0] } });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    // DELETE institute notification
    static deleteInstituteNotification = async (req, res) => {
        try {
            const { isInstitute, isClient, isAdmin } = req.currentUser || {};
            if (!isInstitute && !isClient && !isAdmin) {
                return res.status(403).json({ message: "Access denied" });
            }

            const { id } = req.params;
            const { institute_id } = req.currentUser || {};

            let deleteQuery = db.knex("institute_notifications").where("id", id);
            
            if (institute_id) {
                deleteQuery = deleteQuery.where("client_id", institute_id);
            } else {
                deleteQuery = deleteQuery.where("client_id", 1); // Default to 1
            }
            
            await deleteQuery.del();

            return res.status(200).json({ message: "Notification deleted successfully" });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    // DELETE student notification
    static deleteStudentNotification = async (req, res) => {
        try {
            const { isClient, isAdmin } = req.currentUser || {};
            if (!isClient && !isAdmin) {
                return res.status(403).json({ message: "Only admin can delete student notifications" });
            }

            const { id } = req.params;
            const { institute_id } = req.currentUser;

            await db.knex("student_notifications")
                .where("id", id)
                .where("client_id", institute_id || 1)
                .del();

            return res.status(200).json({ message: "Notification deleted successfully" });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    // Mark institute notification as read
    static markInstituteNotificationRead = async (req, res) => {
        try {
            const { isInstitute, isClient, isAdmin } = req.currentUser || {};
            if (!isInstitute && !isClient && !isAdmin) {
                return res.status(403).json({ message: "Access denied" });
            }

            const { id } = req.params;
            const { institute_id } = req.currentUser || {};
            
            const validInstituteId = institute_id || 1; // Default to 1 if null

            // Check if already marked as read
            const existing = await db.knex("institute_noti_read")
                .where("notification_id", id)
                .where("institute_id", validInstituteId)
                .first();

            if (!existing) {
                await db.knex("institute_noti_read").insert({
                    notification_id: id,
                    institute_id: validInstituteId,
                });
            }

            return res.status(200).json({ message: "Notification marked as read" });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };

    // Mark student notification as read
    static markStudentNotificationRead = async (req, res) => {
        try {
            const { isStudent, isClient, isAdmin, student_id } = req.currentUser || {};
            if (!isStudent && !isClient && !isAdmin && !student_id) {
                return res.status(403).json({ message: "Access denied" });
            }

            const { id } = req.params;

            // Check if already marked as read
            const existing = await db.knex("student_noti_read")
                .where("notification_id", id)
                .where("student_id", student_id || 0)
                .first();

            if (!existing) {
                await db.knex("student_noti_read").insert({
                    notification_id: id,
                    student_id: student_id || 0,
                });
            }

            return res.status(200).json({ message: "Notification marked as read" });
        } catch (e) {
            return res.status(400).json({ message: e.message || "Error" });
        }
    };
}

// Institute notification routes
router.get(
    "/notifications/unread-count",
    [validationResponse],
    NotificationCtrl.getInstituteUnreadCount
);

router.get(
    "/notifications",
    [
        query("k").optional().isString().withMessage("keyword must be string"),
        query("p").optional().isInt({ gt: 0 }).withMessage("page must be positive integer"),
        query("ps").optional().isInt({ gt: 0 }).withMessage("page size must be positive integer"),
        validationResponse,
    ],
    NotificationCtrl.getInstituteNotifications
);

router.post(
    "/notifications",
    [
        body("title").notEmpty().withMessage("title is required"),
        body("description").notEmpty().withMessage("description is required"),
        body("status").optional().isIn([0, 1, '0', '1']).withMessage("status must be 0 or 1"),
        validationResponse,
    ],
    NotificationCtrl.saveInstituteNotification
);

// Student notification routes
router.get(
    "/student-notifications",
    [
        query("k").optional().isString().withMessage("keyword must be string"),
        query("p").optional().isInt({ gt: 0 }).withMessage("page must be positive integer"),
        query("ps").optional().isInt({ gt: 0 }).withMessage("page size must be positive integer"),
        validationResponse,
    ],
    NotificationCtrl.getStudentNotifications
);

router.post(
    "/student-notifications",
    [
        body("title").notEmpty().withMessage("title is required"),
        body("description").notEmpty().withMessage("description is required"),
        body("status").optional().isIn([0, 1, '0', '1']).withMessage("status must be 0 or 1"),
        validationResponse,
    ],
    NotificationCtrl.saveStudentNotification
);

// Delete routes
router.delete(
    "/notifications/:id",
    [
        param("id").isInt({ gt: 0 }).withMessage("id must be positive integer"),
        validationResponse,
    ],
    NotificationCtrl.deleteInstituteNotification
);

router.delete(
    "/student-notifications/:id",
    [
        param("id").isInt({ gt: 0 }).withMessage("id must be positive integer"),
        validationResponse,
    ],
    NotificationCtrl.deleteStudentNotification
);

// Mark as read routes
router.post(
    "/notifications/:id/read",
    [
        param("id").isInt({ gt: 0 }).withMessage("id must be positive integer"),
        validationResponse,
    ],
    NotificationCtrl.markInstituteNotificationRead
);

router.post(
    "/student-notifications/:id/read",
    [
        param("id").isInt({ gt: 0 }).withMessage("id must be positive integer"),
        validationResponse,
    ],
    NotificationCtrl.markStudentNotificationRead
);

module.exports = router;
