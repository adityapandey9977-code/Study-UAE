const { Router } = require("express");
const router = Router({ mergeParams: true });
const FeaturedListingService = require("../services/featured_listing.service");
const StudentFeaturedListingService = require("../services/student_featured_listing.service");
const {
    validateListAvailableCoursesQuery,
    validateAdminGetQuery,
    validateAdminSetBody,
    validateAdminDeleteQuery,
    validateAdminUpdateParams,
    validateAdminUpdateBody,
    validateAdminDeleteParams
} = require("../middleware/featured_listing.mw");

class FeaturedListingCtrl {
    static handleError(res, error) {
        const status = error.status || 500;
        const payload = { message: error.message || "Error" };
        if (error.details) {
            payload.details = error.details;
        }
        return res.status(status).json(payload);
    }

    static async listAvailableCourses(req, res) {
        try {
            const data = await FeaturedListingService.listAvailableCourses(req);
            return res.status(200).json({ message: "", data });
        } catch (error) {
            return FeaturedListingCtrl.handleError(res, error);
        }
    }

    static async getFeaturedForAdmin(req, res) {
        try {
            const data = await FeaturedListingService.getFeaturedForAdmin(req);
            return res.status(200).json({ message: "", data });
        } catch (error) {
            return FeaturedListingCtrl.handleError(res, error);
        }
    }

    static async setFeaturedCourse(req, res) {
        try {
            const data = await FeaturedListingService.setFeaturedCourse(req);
            return res.status(200).json({ message: "Saved", data });
        } catch (error) {
            return FeaturedListingCtrl.handleError(res, error);
        }
    }

    static async deleteFeaturedCourse(req, res) {
        try {
            const result = await FeaturedListingService.deleteFeaturedCourse(req);
            return res.status(200).json({ message: "Deleted", ...result });
        } catch (error) {
            return FeaturedListingCtrl.handleError(res, error);
        }
    }

    static async updateFeaturedCourseById(req, res) {
        try {
            const data = await FeaturedListingService.updateFeaturedCourseById(req);
            return res.status(200).json({ message: "Updated", data });
        } catch (error) {
            return FeaturedListingCtrl.handleError(res, error);
        }
    }

    static async deleteFeaturedCourseById(req, res) {
        try {
            const result = await FeaturedListingService.deleteFeaturedCourseById(req);
            return res.status(200).json({ message: "Deleted", ...result });
        } catch (error) {
            return FeaturedListingCtrl.handleError(res, error);
        }
    }

    static async getFeaturedForStudent(req, res) {
        try {
            const result = await FeaturedListingService.getFeaturedForStudent(req);
            return res.status(200).json(result);
        } catch (error) {
            return FeaturedListingCtrl.handleError(res, error);
        }
    }

    static async getTopInstitutesForStudent(req, res) {
        try {
            const result = await StudentFeaturedListingService.getTopInstitutes(req);
            return res.status(200).json(result);
        } catch (error) {
            return FeaturedListingCtrl.handleError(res, error);
        }
    }
}

router.get("/admin/available-courses", validateListAvailableCoursesQuery, FeaturedListingCtrl.listAvailableCourses);
router.get("/admin", validateAdminGetQuery, FeaturedListingCtrl.getFeaturedForAdmin);
router.post("/admin", validateAdminSetBody, FeaturedListingCtrl.setFeaturedCourse);
router.delete("/admin", validateAdminDeleteQuery, FeaturedListingCtrl.deleteFeaturedCourse);
router.put("/admin/:id", validateAdminUpdateParams, validateAdminUpdateBody, FeaturedListingCtrl.updateFeaturedCourseById);
router.delete("/admin/:id", validateAdminDeleteParams, FeaturedListingCtrl.deleteFeaturedCourseById);
router.get("/student", FeaturedListingCtrl.getFeaturedForStudent);
router.get("/student/top-institutes", FeaturedListingCtrl.getTopInstitutesForStudent);

module.exports = router;
