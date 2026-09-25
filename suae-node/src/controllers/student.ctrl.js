const { Router } = require("express");
const router = Router({ mergeParams: true });
const ejs = require("ejs");
const StudentService = require("../services/student.service");
const StudentTicketService = require("../services/student_ticket.service");
const WhatsappService = require("../services/whatsapp.service");
const { trim, sendEmail, getYmd, getExt, currentDT } = require("../util/common.util");
const StudentLettersRouter = require("./student_letters.ctrl");
const db = require("../libraries/db");

const multer = require('multer');
const fs = require('fs');

const importStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { y, m, d } = getYmd();
        const upPath = process.env.UP_PATH;
        const dir = `${upPath}${y}/${y}-${m}/${y}-${m}-${d}`;
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        } catch (e) {
            return cb(e);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = getExt(file.originalname) || 'none';
        const name = Date.now() + '' + Math.round(Math.random() * 1E9) + '.' + ext;
        cb(null, name);
    },
});

const importUpload = multer({
    storage: importStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExt = ['csv', 'xls', 'xlsx'];
        const ext = getExt(file.originalname);
        if (allowedExt.includes(ext)) {
            return cb(null, true);
        }
        cb(null, false);
        return cb(new Error('File type not allowed!'));
    }
});

class StudentCtrl {
    // this function is used to import students from csv file
    // import students using uploaded CSV path
    static importCsv = async (req, res) => {
        try {
            const { csv_path, session_id } = trim(req.body || {}); // session_id optional now
            if (!csv_path) {
                throw new Error("csv_path required");
            }

            const summary = await StudentService.importStudentsFromCsv(req, csv_path, session_id);
            return res.status(200).json({ message: 'Import completed', result: summary });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static importCsvUpload = async (req, res) => {
        try {
            const { master_session_id } = trim(req.body || {});
            const sessionId = master_session_id ? Number(master_session_id) : null;
            if (!sessionId) {
                throw new Error('master_session_id required');
            }
            if (!req.file) {
                throw new Error('file required');
            }

            const summary = await StudentService.importStudentsFromUpload(req, {
                absolutePath: req.file.path,
                masterSessionId: sessionId,
            });

            const importedCount = Number(summary.created || 0) + Number(summary.updated || 0);
            return res.status(200).json({
                success: true,
                data: {
                    imported_count: importedCount,
                    created_count: Number(summary.created || 0),
                    updated_count: Number(summary.updated || 0),
                    skipped_count: Number(summary.skipped || 0),
                    error_count: Number(summary.errors || 0),
                    total: Number(summary.total || 0),
                    error_rows: summary.error_rows || [],
                    message: 'Import completed',
                }
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getStudentChoiceFillings = async (req, res) => {
        try {
            const result = await StudentService.getStudentChoiceFillings(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            const status = e.status || 400;
            return res.status(status).json({ message: e.message || 'Error' });
        }
    }

    static getStudentDocuments = async (req, res) => {
        try {
            const result = await StudentService.getStudentDocuments(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            const status = e.status || 400;
            return res.status(status).json({ message: e.message || 'Error' });
        }
    }

    static getStudentsList = async (req, res) => {
        try {
            const result = await StudentService.getStudentsList(req);
            return res.status(200).json({ code: 200, message: '', result });
        } catch (e) {
            const status = e.status || 400;
            return res.status(status).json({ message: e.message || 'Error' });
        }
    }

    static getStudentDetail = async (req, res) => {
        try {
            const { student_id } = req.params;
            if (!student_id) {
                return res.status(400).json({ message: 'Student ID is required' });
            }

            const result = await StudentService.getStudentDetail(student_id, req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            const status = e.status || 400;
            return res.status(status).json({ message: e.message || 'Error' });
        }
    }

    static getCommunications = async (req, res) => {
        try {
            const { student_id } = req.params || {};
            const result = await StudentService.getStudentCommunications(student_id, req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            const status = e.status || 400;
            return res.status(status).json({ message: e.message || 'Error' });
        }
    }

    static listCommunications = async (req, res) => {
        try {
            const result = await StudentService.listStudentCommunications(req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            const status = e.status || 400;
            return res.status(status).json({ message: e.message || 'Error' });
        }
    }
    static setSCFAdmStatus = async (req, res) => {
        try {
            const { scf_id, status } = trim(req.body || {});
            if (!scf_id) {
                throw new Error("ID required!");
            }
            if (!status) {
                throw new Error("Status required!");
            }

            await StudentService.setSCFAdmStatus({ scf_id, status }, req);
            return res.status(200).json({ message: 'Status changed successfully' });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static setSCFInstituteStatus = async (req, res) => {
        try {
            const { scf_id, status } = trim(req.body || {});
            if (!scf_id) {
                throw new Error("ID required!");
            }
            if (!status) {
                throw new Error("Status required!");
            }

            await StudentService.setSCFInstituteStatus({ scf_id, status }, req);

            if (status === 'Accepted') {
                const dtl = await StudentService.getChoiceFillingdetail(scf_id);
                if (dtl) {
                    const html = await ejs.renderFile("src/views/email_institute_accepted.html", dtl);
                    sendEmail(dtl.stu.email, `Congratulations! You application accepted by your choice of Institutions`, html);
                    const phonecode = (dtl.stu.isd_code || '91').replace('+', '');
                    const msg=`Dear ${dtl.stu.name}, 
                        You have been selected by ${dtl.course.institute_name}. for admission to Study In India via Study India Scholarship programme. 
                        You will receive an Offer Letter Shortly from the Institute. We will notify you once your offer letter will be uploaded.
                        You can login here ${dtl.stu.login_url} to check the application progress.`;
                    WhatsappService.sendMessage({ to: `${phonecode}${dtl.stu.mobile}`, msg }, req);
                }
            }

            return res.status(200).json({ message: 'Status changed successfully' });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static setSCFUploadOfferLetter = async (req, res) => {
        try {
            const { scf_id, offer_letter_file_id } = trim(req.body || {});
            if (!scf_id) {
                throw new Error("ID required!");
            }
            if (!offer_letter_file_id) {
                throw new Error("Offer letter required!");
            }

            await StudentService.setSCFUploadOfferLetter({ scf_id, offer_letter_file_id }, req);

            const dtl = await StudentService.getChoiceFillingdetail(scf_id);
            if (dtl) {
                const html = await ejs.renderFile("src/views/email_institute_offer_uploaded.html", dtl);
                sendEmail(dtl.stu.email, `Congratulations! Partial Scholarships approved`, html);
                const phonecode = (dtl.stu.isd_code || '91').replace('+', '');
                //const msg = html.replace(/<\/?[^>]+(>|$)/g, "");
                const msg=`Dear ${dtl.stu.name}, 
                        Congratulations! Your Offer letter has been generated for ${dtl.course.specialization} from <%= course.institute_name%>. 
                        To Accept and download the Offer, please login to your application panel here ${dtl.stu.login_url}
                        Also, complete the required payment asked by the ${dtl.course.institute_name} to finalized the admission process.`;
                WhatsappService.sendMessage({ to: `${phonecode}${dtl.stu.mobile}`, msg }, req);
            }

            return res.status(200).json({ message: 'Offer letter uploaded successfully' });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static setSCFUploadAdmissionLetter = async (req, res) => {
        try {
            const { scf_id, admission_letter_file_id } = trim(req.body || {});
            if (!scf_id) {
                throw new Error("ID required!");
            }
            if (!admission_letter_file_id) {
                throw new Error("Admission letter required!");
            }

            await StudentService.setSCFUploadAdmissionLetter({ scf_id, admission_letter_file_id }, req);

            const dtl = await StudentService.getChoiceFillingdetail(scf_id);
            if (dtl) {
                const html = await ejs.renderFile("src/views/email_institute_accepted.html", dtl);
                sendEmail(dtl.stu.email, `Admission Letter Generated`, html);
                const phonecode = (dtl.stu.isd_code || '91').replace('+', '');
                const msg=`Dear ${dtl.stu.name}, 
                        Congratulations! Your Admission letter has been generated for ${dtl.course.specialization} from ${dtl.course.institute_name}. 
                        To download the Admission letter, please login to your application panel here ${dtl.stu.login_url}`;
                WhatsappService.sendMessage({ to: `${phonecode}${dtl.stu.mobile}`, msg }, req);
            }

            return res.status(200).json({ message: 'Admission letter uploaded successfully' });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static setSCFStudentStatus = async (req, res) => {
        try {
            const { scf_id, status } = trim(req.body || {});
            if (!scf_id) {
                throw new Error("ID required!");
            }
            if (!status) {
                throw new Error("Status required!");
            }

            await StudentService.setSCFStudentStatus({ scf_id, status }, req);
            return res.status(200).json({ message: 'Status changed successfully' });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static setSCFUploadPaymentSlip = async (req, res) => {
        try {
            const { scf_id, payment_slip_file_id } = trim(req.body || {});
            if (!scf_id) {
                throw new Error("ID required!");
            }
            if (!payment_slip_file_id) {
                throw new Error("Payment slip required!");
            }

            await StudentService.setSCFUploadPaymentSlip({ scf_id, payment_slip_file_id }, req);

            const dtl = await StudentService.getChoiceFillingdetail(scf_id);
            if (dtl) {
                /*const html = await ejs.renderFile("src/views/email_institute_offer_uploaded.html", dtl);
                sendEmail(dtl.stu.email, `Congratulations! Partial Scholarships approved`, html);
                const phonecode = (dtl.stu.isd_code || '91').replace('+', '');
                const msg = html.replace(/<\/?[^>]+(>|$)/g, "");
                WhatsappService.sendMessage({ to: `${phonecode}${dtl.stu.mobile}`, msg }, req);*/
            }

            return res.status(200).json({ message: 'Payment slip uploaded successfully' });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static saveStudentChoiceFillings = async (req, res) => {
        try {
            const { student_id, institute_course_id } = trim(req.body || {});
            
            const result = await StudentService.saveStudentChoiceFillings({ 
                student_id, 
                institute_course_id 
            }, req);
            
            return res.status(200).json({ 
                code: 200,
                message: result.message,
                id: result.id,
                course_choice_date: result.course_choice_date
            });
        } catch (e) {
            return res.status(400).json({ 
                code: 400,
                message: e.message || 'Error saving choice filling'
            });
        }
    }

    static assignByCountry = async (req, res) => {
        try {
            const { student_id } = trim(req.body || {});
            if (!student_id) {
                throw new Error('student_id required');
            }

            const result = await StudentService.assignLeadByCountry({ studentId: Number(student_id) }, req);
            return res.status(200).json({ message: 'Assigned', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static assignByDiscipline = async (req, res) => {
        try {
            const { student_id } = trim(req.body || {});
            if (!student_id) {
                throw new Error('student_id required');
            }

            const result = await StudentService.assignLeadByDiscipline({ studentId: Number(student_id) }, req);
            return res.status(200).json({ message: 'Assigned', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static assignByAutomation = async (req, res) => {
        try {
            const { student_id } = trim(req.body || {});
            if (!student_id) {
                throw new Error('student_id required');
            }

            const result = await StudentService.autoAssignLeadByAutomation({ studentId: Number(student_id) }, req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static applyDatasetVisibility = async (req, res) => {
        try {
            const { student_id } = trim(req.body || {});
            if (!student_id) {
                throw new Error('student_id required');
            }

            const result = await StudentService.applyDatasetVisibilityByAutomation({ studentId: Number(student_id) }, req);
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static autoAssign = async (req, res) => {
        try {
            const { student_ids, strategy, automation_id, agent_ids, filters_json, discipline_id, course_id, registered_via } = trim(req.body || {});
            const ids = Array.isArray(student_ids) ? student_ids : [];
            if (!ids.length) {
                throw new Error('student_ids array required');
            }

            const result = await StudentService.autoAssignLeads({
                studentIds: ids,
                strategy,
                automationId: automation_id ? Number(automation_id) : undefined,
                agentIds: Array.isArray(agent_ids) ? agent_ids : [],
                criteria: {
                    filters_json,
                    discipline_id,
                    course_id,
                    registered_via,
                },
            }, req);
            return res.status(200).json({ message: 'Auto assignment completed', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static previewAssign = async (req, res) => {
        try {
            const { student_ids, strategy, agent_ids, automation_id, filters_json, discipline_id, course_id, registered_via } = trim(req.body || {});
            const ids = Array.isArray(student_ids) ? student_ids : [];
            if (!ids.length) {
                throw new Error('student_ids array required');
            }

            const result = await StudentService.previewAssignLeads({
                studentIds: ids,
                strategy,
                agentIds: Array.isArray(agent_ids) ? agent_ids : [],
                automationId: automation_id ? Number(automation_id) : undefined,
                criteria: {
                    filters_json,
                    discipline_id,
                    course_id,
                    registered_via,
                },
            }, req);

            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getAssignedLeads = async (req, res) => {
        try {
            const {
                student_id,
                assigned_to,
                country_id,
                discipline_id,
                strategy,
                page,
                page_size,
                automation_id,
            } = trim(req.query || {});

            const result = await StudentService.getAssignedLeads({
                studentId: student_id ? Number(student_id) : undefined,
                assignedTo: assigned_to ? Number(assigned_to) : undefined,
                countryId: country_id ? Number(country_id) : undefined,
                disciplineId: discipline_id ? Number(discipline_id) : undefined,
                strategy: strategy || undefined,
                page: page ? Number(page) : undefined,
                pageSize: page_size ? Number(page_size) : undefined,
                automationId: automation_id ? Number(automation_id) : undefined,
            });

            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getAssignedLeadsForLoggedInUser = async (req, res) => {
        try {
            const { page, page_size, search } = trim(req.query || {});
            
            // Counselors/agents can only query their own assigned leads.
            // Admins can query anyone or pass assigned_to query parameter.
            let targetAgentId = req.currentUser.id;
            if (req.currentUser.isAdmin && req.query.assigned_to) {
                targetAgentId = Number(req.query.assigned_to);
            }

            const query = db.knex('student_extra_info as sei')
                .select(
                    's.id as student_id',
                    's.resident_country_id',
                    's.country_id',
                    's.discipline_id',
                    'su.name as student_name',
                    'su.email as student_email',
                    'su.mobile as student_mobile',
                    'sei.assigned_to',
                    'sei.assigned_on',
                    'sei.assigned_by',
                    'sei.remark',
                    'au.name as assignee_name',
                    'mc.name as resident_country_name',
                    'md.name as discipline_name'
                )
                .innerJoin('students as s', 's.id', 'sei.student_id')
                .innerJoin('users as su', 'su.id', 's.user_id')
                .leftJoin('users as au', 'au.id', 'sei.assigned_to')
                .leftJoin('master_countries as mc', 'mc.id', 's.resident_country_id')
                .leftJoin('master_disciplines as md', 'md.id', 's.discipline_id')
                .where('sei.assigned_to', targetAgentId);

            if (search) {
                query.where(builder => {
                    builder.where('su.name', 'like', `%${search}%`)
                           .orWhere('su.email', 'like', `%${search}%`)
                           .orWhere('su.mobile', 'like', `%${search}%`);
                });
            }

            query.orderBy('sei.assigned_on', 'desc').orderBy('sei.id', 'desc');

            const result = await db.pagedRows(query, page, page_size);
            return res.status(200).json({ success: true, result });
        } catch (e) {
            return res.status(400).json({ success: false, message: e.message || 'Error' });
        }
    }

    static assignStudentManual = async (req, res) => {
        try {
            const { student_id, assigned_to, remark } = trim(req.body || {});
            
            if (!student_id || !assigned_to) {
                return res.status(400).json({ success: false, message: "student_id and assigned_to are required" });
            }

            let extra = await db.knex('student_extra_info').where({ student_id: Number(student_id) }).first();
            
            const assignmentData = {
                id: extra?.id || undefined,
                student_id: Number(student_id),
                assigned_to: Number(assigned_to),
                assigned_on: currentDT(),
                assigned_by: req.currentUser?.id || null,
                remark: remark || null
            };

            const successId = await db.save('student_extra_info', assignmentData, 1, req);
            if (!successId) {
                throw new Error("Failed to save assignment to database");
            }

            return res.status(200).json({ success: true, message: "Student successfully assigned", result: { id: successId } });
        } catch (e) {
            return res.status(400).json({ success: false, message: e.message || 'Error' });
        }
    }

    static getStudentCount = async (req, res) => {
        try {
            const {
                country_id,
                discipline_id,
                course_id,
                registered_via
            } = trim(req.query || {});

            const filters = {};
            if (country_id) {
                filters.country_id = Array.isArray(country_id) ? country_id : [country_id];
            }
            if (discipline_id) {
                filters.discipline_id = Array.isArray(discipline_id) ? discipline_id : [discipline_id];
            }
            if (course_id) {
                filters.course_id = Array.isArray(course_id) ? course_id : [course_id];
            }
            if (registered_via) {
                filters.registered_via = registered_via;
            }

            const count = await StudentService.getStudentCountByFilters(filters);
            return res.status(200).json({ message: '', result: { count } });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    /**
     * Apply dataset visibility for a specific user
     * This fixes the issue where new users can't see past students
     */
    static applyVisibilityForUser = async (req, res) => {
        try {
            const { user_id } = trim(req.body || {});
            
            if (!user_id) {
                throw new Error('user_id required');
            }

            const result = await StudentService.applyVisibilityForUser(Number(user_id), req);
            return res.status(200).json({ 
                message: result.message,
                result 
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    /**
     * Apply dataset visibility for all users
     * One-time fix or periodic sync
     */
    static applyVisibilityForAllUsers = async (req, res) => {
        try {
            const { isClient } = req.currentUser || {};
            
            if (!isClient) {
                throw new Error('Only admin can run this operation');
            }

            const result = await StudentService.applyVisibilityForAllUsers(req);
            return res.status(200).json({ 
                message: result.message,
                result 
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    /**
     * Get visibility statistics for a user
     */
    static getVisibilityStats = async (req, res) => {
        try {
            const { user_id } = trim(req.query || {});
            
            if (!user_id) {
                throw new Error('user_id required');
            }

            const result = await StudentService.getVisibilityStats(Number(user_id));
            return res.status(200).json({ 
                message: '',
                result 
            });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    /**
     * Get ticket details for logged-in student
     */
    static getTicketDetails = async (req, res) => {
        try {
            const userId = req.currentUser?.id;
            
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Get student_id from students table using user_id
            const student = await db.knex("students")
                .select("id")
                .where({ user_id: userId })
                .first();

            if (!student) {
                throw new Error("Student record not found");
            }

            const result = await StudentTicketService.getTicketDetails(student.id, req);
            
            return res.status(200).json({ 
                message: '', 
                result,
                success: true 
            });
        } catch (e) {
            return res.status(400).json({ 
                message: e.message || 'Error fetching ticket details',
                success: false 
            });
        }
    }

    /**
     * Save/update ticket details for logged-in student
     */
    static saveTicketDetails = async (req, res) => {
        try {
            const userId = req.currentUser?.id;
            
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Get student_id from students table using user_id
            const student = await db.knex("students")
                .select("id")
                .where({ user_id: userId })
                .first();

            if (!student) {
                throw new Error("Student record not found");
            }

            const { 
                file_id
            } = trim(req.body || {});
            
            if (!file_id) {
                throw new Error("file_id is required");
            }

            const result = await StudentTicketService.saveTicketDetails(student.id, {
                file_id
            }, req);

            return res.status(200).json({ 
                message: result.message,
                result,
                success: true 
            });
        } catch (e) {
            return res.status(400).json({ 
                message: e.message || 'Error saving ticket details',
                success: false 
            });
        }
    }

    /**
     * Delete ticket details for logged-in student
     */
    static deleteTicketDetails = async (req, res) => {
        try {
            const userId = req.currentUser?.id;
            
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Get student_id from students table using user_id
            const student = await db.knex("students")
                .select("id")
                .where({ user_id: userId })
                .first();

            if (!student) {
                throw new Error("Student record not found");
            }

            await StudentTicketService.deleteTicketDetails(student.id, req);

            return res.status(200).json({ 
                message: 'Ticket deleted successfully',
                success: true 
            });
        } catch (e) {
            return res.status(400).json({ 
                message: e.message || 'Error deleting ticket',
                success: false 
            });
        }
    }

    /**
     * Get all tickets (admin/institute view)
     */
    static getAllTickets = async (req, res) => {
        try {
            const tickets = await db.knex("student_letters")
                .select("student_letters.id", "student_letters.student_id", "student_letters.ticket_file", "student_letters.created", "users.name as student_name")
                .join("users", "users.id", "student_letters.user_id")
                .whereNotNull("student_letters.ticket_file");

            return res.status(200).json({ 
                message: '',
                tickets,
                success: true 
            });
        } catch (e) {
            return res.status(400).json({ 
                message: e.message || 'Error fetching tickets',
                success: false 
            });
        }
    }


    /**
     * Get ticket statistics
     */
    static getTicketStats = async (req, res) => {
        try {
            const { from_date, to_date } = trim(req.query || {});
            
            const filters = {
                from_date,
                to_date,
            };

            const result = await StudentTicketService.getTicketStats(filters);

            return res.status(200).json({ 
                message: '',
                result,
                success: true 
            });
        } catch (e) {
            return res.status(400).json({ 
                message: e.message || 'Error fetching ticket statistics',
                success: false 
            });
        }
    }
}



router.get('/ticket-details', StudentCtrl.getTicketDetails);
router.post('/ticket-details', StudentCtrl.saveTicketDetails);
router.delete('/ticket-details', StudentCtrl.deleteTicketDetails);
router.get('/tickets/all',StudentCtrl.getAllTickets);
router.get('/tickets/stats', StudentCtrl.getTicketStats);








router.post('/setSCFAdmStatus', StudentCtrl.setSCFAdmStatus);
router.post('/setSCFInstituteStatus', StudentCtrl.setSCFInstituteStatus);
router.post('/setSCFUploadOfferLetter', StudentCtrl.setSCFUploadOfferLetter);
router.post('/setSCFUploadAdmissionLetter', StudentCtrl.setSCFUploadAdmissionLetter);
router.post('/setSCFStudentStatus', StudentCtrl.setSCFStudentStatus);
router.post('/setSCFUploadPaymentSlip', StudentCtrl.setSCFUploadPaymentSlip);
router.post('/saveStudentChoiceFillings', StudentCtrl.saveStudentChoiceFillings);
router.post('/import_csv', importUpload.single('file'), StudentCtrl.importCsvUpload);
router.post('/importCsv', StudentCtrl.importCsv);
router.post('/assign/by-country', StudentCtrl.assignByCountry);
router.post('/assign/by-discipline', StudentCtrl.assignByDiscipline);
router.post('/assign/by-automation', StudentCtrl.assignByAutomation);
router.post('/dataset/apply', StudentCtrl.applyDatasetVisibility);
router.post('/assign/auto', StudentCtrl.autoAssign);
router.post('/assign/preview', StudentCtrl.previewAssign);

// New visibility endpoints
router.post('/visibility/apply-for-user', StudentCtrl.applyVisibilityForUser);
router.post('/visibility/apply-for-all-users', StudentCtrl.applyVisibilityForAllUsers);
router.get('/visibility/stats', StudentCtrl.getVisibilityStats);

router.get('/assign', StudentCtrl.getAssignedLeads);
router.get('/assigned-leads', StudentCtrl.getAssignedLeadsForLoggedInUser);
router.post('/assign', StudentCtrl.assignStudentManual);
router.get('/count', StudentCtrl.getStudentCount);
router.get('/communications', StudentCtrl.listCommunications);
router.get('/:student_id/communications', StudentCtrl.getCommunications);
router.get('/list', StudentCtrl.getStudentsList); // Add this route for listing students
router.post('/', StudentCtrl.getStudentsList);
router.post('/ALL', StudentCtrl.getStudentsList);
router.use('/letters', StudentLettersRouter); 

// Ticket details routes

module.exports = router;
