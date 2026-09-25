const db = require("../libraries/db");

class PaymentService {
    /**
     * Get list of students who have uploaded payment slips for a specific institute
     * @param {Object} req - Request object containing currentUser with institute_id
     * @returns {Array} Array of students with payment slip information
     */
    static getPaymentSlipsForInstitute = async (req) => {
        const { institute_id } = req.currentUser;
        
        if (!institute_id) {
            throw new Error("Institute ID not found in user context");
        }

        // Query to get students with payment slips for this institute
        const paymentSlips = await db.knex("student_choice_fillings as scf")
            .select([
                'scf.id as scf_id',
                'scf.student_id',
                'scf.payment_slip_file_id',
                'scf.payment_slip_dt',
                'scf.payment_status',
                'scf.payment_comment',
                'u.id as user_id',
                'u.name as student_name',
                'u.email as student_email',
                'u.mobile as student_mobile',
                's.regno as student_regno',
                'ic.institute_id as institute_id',
                'f.file_name',
                'f.file_ext',
                'f.file_size',
                'f.created as file_created',
                'sp.name as specialization'
            ])
            .join("students as s", "s.id", "scf.student_id")
            .join("users as u", "u.id", "s.user_id")
            .join("institute_courses as ic", "ic.id", "scf.institute_course_id")
            .join("master_specializations as sp", "sp.id", "ic.specialization_id")
            .leftJoin("files as f", "f.id", "scf.payment_slip_file_id")
            .where("ic.institute_id", institute_id)
            .whereNotNull("scf.payment_slip_file_id")
            .where("scf.payment_slip_file_id", ">", 0)
            .orderBy("scf.payment_slip_dt", "desc");

        return paymentSlips;
    }

    /**
     * Get list of payment slips uploaded by the logged-in student (self only)
     * @param {Object} req - Request object containing currentUser.id
     * @returns {Array} Array of the student's payment slip information
     */
    static getPaymentSlipsForStudent = async (req) => {
        const { id: user_id } = req.currentUser;

        // Query to get current student's payment slips
        const paymentSlips = await db.knex("student_choice_fillings as scf")
            .select([
                'scf.id as scf_id',
                'scf.student_id',
                'scf.payment_slip_file_id',
                'scf.payment_slip_dt',
                'scf.payment_status',
                'scf.payment_comment',
                'u.id as user_id',
                'u.name as student_name',
                'u.email as student_email',
                'u.mobile as student_mobile',
                's.regno as student_regno',
                'ic.institute_id as institute_id',
                'f.file_name',
                'f.file_ext',
                'f.file_size',
                'f.created as file_created',
                'sp.name as specialization'
            ])
            .join("students as s", "s.id", "scf.student_id")
            .join("users as u", "u.id", "s.user_id")
            .join("institute_courses as ic", "ic.id", "scf.institute_course_id")
            .join("master_specializations as sp", "sp.id", "ic.specialization_id")
            .leftJoin("files as f", "f.id", "scf.payment_slip_file_id")
            .where("u.id", user_id)
            .whereNotNull("scf.payment_slip_file_id")
            .where("scf.payment_slip_file_id", ">", 0)
            .orderBy("scf.payment_slip_dt", "desc");

        return paymentSlips;
    }

    /**
     * Get payment slip file details for download
     * @param {number} scfId - Student choice filling ID
     * @param {Object} req - Request object containing currentUser with institute_id
     * @returns {Object} File details for download
     */
    static getPaymentSlipFile = async (scfId, req) => {
        const { institute_id } = req.currentUser;
        
        if (!institute_id) {
            throw new Error("Institute ID not found in user context");
        }

        // Verify that the payment slip belongs to this institute
        const paymentSlip = await db.knex("student_choice_fillings as scf")
            .select([
                'scf.id as scf_id',
                'scf.payment_slip_file_id',
                'u.id as user_id',
                'u.name as student_name',
                'ic.institute_id as institute_id',
                'f.file_name',
                'f.file_ext',
                'f.file_size',
                'f.created as file_created',
                'sp.name as specialization'
            ])
            .join("students as s", "s.id", "scf.student_id")
            .join("users as u", "u.id", "s.user_id")
            .join("institute_courses as ic", "ic.id", "scf.institute_course_id")
            .join("master_specializations as sp", "sp.id", "ic.specialization_id")
            .leftJoin("files as f", "f.id", "scf.payment_slip_file_id")
            .where("scf.id", scfId)
            .where("ic.institute_id", institute_id)
            .whereNotNull("scf.payment_slip_file_id")
            .first();

        if (!paymentSlip) {
            throw new Error("Payment slip not found or you don't have access to it");
        }

        if (!paymentSlip.payment_slip_file_id) {
            throw new Error("Payment slip file not found");
        }

        return paymentSlip;
    }

    /**
     * Get payment slip file details for download for the logged-in student (self only)
     * @param {number} scfId - Student choice filling ID
     * @param {Object} req - Request object containing currentUser.id
     * @returns {Object} File details for download
     */
    static getPaymentSlipFileForStudent = async (scfId, req) => {
        const { id: user_id } = req.currentUser;

        const paymentSlip = await db.knex("student_choice_fillings as scf")
            .select([
                'scf.id as scf_id',
                'scf.payment_slip_file_id',
                'u.id as user_id',
                'u.name as student_name',
                'ic.institute_id as institute_id',
                'f.file_name',
                'f.file_ext',
                'f.file_size',
                'f.created as file_created',
                'sp.name as specialization'
            ])
            .join("students as s", "s.id", "scf.student_id")
            .join("users as u", "u.id", "s.user_id")
            .join("institute_courses as ic", "ic.id", "scf.institute_course_id")
            .join("master_specializations as sp", "sp.id", "ic.specialization_id")
            .leftJoin("files as f", "f.id", "scf.payment_slip_file_id")
            .where("scf.id", scfId)
            .where("u.id", user_id)
            .whereNotNull("scf.payment_slip_file_id")
            .first();

        if (!paymentSlip) {
            throw new Error("Payment slip not found or you don't have access to it");
        }

        if (!paymentSlip.payment_slip_file_id) {
            throw new Error("Payment slip file not found");
        }

        return paymentSlip;
    }

    /**
     * Get file information by file_id
     * @param {number} fileId - File ID
     * @returns {Object} File information
     */
    static getFileById = async (fileId) => {
        if (!fileId) {
            throw new Error("File ID is required");
        }

        const file = await db.knex("files")
            .select([
                'id',
                'file_name',
                'file_ext',
                'file_size',
                'created'
            ])
            .where("id", fileId)
            .first();

        if (!file) {
            throw new Error("File not found");
        }

        return file;
    }

    /**
     * Get payment slip statistics for an institute
     * @param {Object} req - Request object containing currentUser with institute_id
     * @returns {Object} Statistics about payment slips
     */
    static getPaymentSlipStats = async (req) => {
        const { institute_id } = req.currentUser;
        
        if (!institute_id) {
            throw new Error("Institute ID not found in user context");
        }

        const stats = await db.knex("student_choice_fillings as scf")
            .join("institute_courses as ic", "ic.id", "scf.institute_course_id")
            .where("ic.institute_id", institute_id)
            .select([
                db.knex.raw('COUNT(*) as total_applications'),
                db.knex.raw('COUNT(scf.payment_slip_file_id) as payment_slips_uploaded'),
                db.knex.raw('COUNT(CASE WHEN scf.payment_status = "Uploaded" THEN 1 END) as payment_verified'),
                db.knex.raw('COUNT(CASE WHEN scf.payment_status = "Pending" THEN 1 END) as payment_pending')
            ])
            .first();

        return stats;
    }
}

module.exports = PaymentService;
