const { Router } = require("express");
const ReviewService = require("../services/review.service");
const db = require("../libraries/db");

// Public routes router
const publicRouter = Router({ mergeParams: true });

// Master admin routes router
const masterRouter = Router({ mergeParams: true });

class ReviewCtrl {
    static handleError(res, error) {
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || "Error" });
    }

    // Public: Submit a review
    static async submitReview(req, res) {
        try {
            const { name, email, university_id, course_name, rating, title, review_text } = req.body;
            if (!name || !email || !rating || !title || !review_text) {
                return res.status(400).json({ message: "Name, email, rating, title, and review comments are required." });
            }

            const id = await ReviewService.submitReview({
                name,
                email,
                university_id,
                course_name,
                rating: parseInt(rating, 10),
                title,
                review_text
            });

            return res.status(201).json({ message: "Review submitted successfully! It will be reviewed by administrators.", id });
        } catch (error) {
            return ReviewCtrl.handleError(res, error);
        }
    }

    // Public: Get universities dropdown
    static async getUniversities(req, res) {
        try {
            const list = await db.knex("institutes")
                .select("id", "name", "city")
                .whereIn("status", ["Approved", "1", 1])
                .orderBy("name", "asc");
            return res.status(200).json({ data: list });
        } catch (error) {
            return ReviewCtrl.handleError(res, error);
        }
    }

    // Master: List reviews
    static async listReviews(req, res) {
        try {
            // Ensure is admin/super admin
            const { isClient, isAdmin, type, role_id } = req.currentUser || {};
            const isClientAdmin = type === "CLIENT" && Boolean(role_id);
            if (!isClient && !isAdmin && !isClientAdmin) {
                return res.status(403).json({ message: "Only admin users can list reviews." });
            }

            const { status } = req.query;
            const data = await ReviewService.listReviews({ status });
            return res.status(200).json({ data });
        } catch (error) {
            return ReviewCtrl.handleError(res, error);
        }
    }

    // Master: Update status (Approve/Reject)
    static async updateReviewStatus(req, res) {
        try {
            // Ensure is admin/super admin
            const { isClient, isAdmin, type, role_id } = req.currentUser || {};
            const isClientAdmin = type === "CLIENT" && Boolean(role_id);
            if (!isClient && !isAdmin && !isClientAdmin) {
                return res.status(403).json({ message: "Only admin users can moderate reviews." });
            }

            const { id } = req.params;
            const { status } = req.body;
            if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
                return res.status(400).json({ message: "Invalid status value." });
            }

            await ReviewService.updateReviewStatus(id, status);
            return res.status(200).json({ message: `Review status updated to ${status} successfully.` });
        } catch (error) {
            return ReviewCtrl.handleError(res, error);
        }
    }

    // Master: Delete review
    static async deleteReview(req, res) {
        try {
            // Ensure is admin/super admin
            const { isClient, isAdmin, type, role_id } = req.currentUser || {};
            const isClientAdmin = type === "CLIENT" && Boolean(role_id);
            if (!isClient && !isAdmin && !isClientAdmin) {
                return res.status(403).json({ message: "Only admin users can delete reviews." });
            }

            const { id } = req.params;
            await ReviewService.deleteReview(id);
            return res.status(200).json({ message: "Review deleted successfully." });
        } catch (error) {
            return ReviewCtrl.handleError(res, error);
        }
    }
}

// Public router routing
publicRouter.post("/", ReviewCtrl.submitReview);
publicRouter.get("/universities", ReviewCtrl.getUniversities);

// Master router routing
masterRouter.get("/", ReviewCtrl.listReviews);
masterRouter.put("/:id/status", ReviewCtrl.updateReviewStatus);
masterRouter.delete("/:id", ReviewCtrl.deleteReview);

module.exports = {
    publicRouter,
    masterRouter
};
