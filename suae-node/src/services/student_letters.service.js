const db = require("../libraries/db");
const { currentDT, trim } = require("../util/common.util");

class StudentLettersService {
    static tableName = "student_letters";

    static ensureSuperAdminOrInstitute(req) {
        const { isClient, isAdmin, isInstitute, role_id } = req.currentUser || {};
        // Allow Super Admin, Admin, Client Admin, or Institute
        if (isClient || isAdmin || isInstitute) {
            return;
        }
        // Allow Client Admin (CLIENT type users with a role)
        if (req.currentUser?.type === 'CLIENT' && role_id) {
            return;
        }
        const err = new Error("Only super admin, admin, or institute can access this endpoint");
        err.status = 403;
        throw err;
    }

    static async fetchChoice(scfId) {
        if (!scfId) {
            const err = new Error("Student choice filling ID is required");
            err.status = 400;
            throw err;
        }

        const choice = await db.knex("student_choice_fillings as scf")
            .select([
                "scf.id as scf_id",
                "scf.student_id",
                "scf.institute_course_id",
                "scf.payment_status",
                "scf.ins_status",
                "scf.stu_status",
                "scf.payment_slip_file_id",
                "scf.payment_slip_dt",
                "scf.offer_letter_file_id",
                "scf.offer_letter_dt",
                "ic.institute_id",
                "i.name as institute_name",
                "s.user_id as student_user_id",
                "u.name as student_name",
                "u.email as student_email",
                "u.mobile as student_mobile",
                "s.regno as student_regno",
                "ms.name as specialization_name"
            ])
            .join("students as s", "s.id", "scf.student_id")
            .join("users as u", "u.id", "s.user_id")
            .join("institute_courses as ic", "ic.id", "scf.institute_course_id")
            .join("institutes as i", "i.id", "ic.institute_id")
            .leftJoin("master_specializations as ms", "ms.id", "ic.specialization_id")
            .where("scf.id", scfId)
            .first();

        if (!choice) {
            const err = new Error("Student choice filling record not found");
            err.status = 404;
            throw err;
        }

        return choice;
    }

    static assertPaymentAcknowledged(choice) {
        const status = (choice.payment_status || "").toUpperCase();
        if (status !== "ACKNOWLEDGED") {
            const err = new Error("Payment not acknowledged for this student");
            err.status = 400;
            throw err;
        }
    }

    static async ensureInstituteAccess(choice, req) {
        const { isClient, isAdmin, isInstitute, institute_id, role_id } = req.currentUser || {};
        
        console.log('DEBUG ensureInstituteAccess:', {
            isClient,
            isAdmin,
            isInstitute,
            institute_id,
            choice_institute_id: choice.institute_id,
            role_id,
            user_type: req.currentUser?.type
        });
        
        // Allow Super Admin, Admin, or Client Admin (CLIENT type with role_id)
        if (isClient || isAdmin) {
            console.log('Access granted: Super admin or client');
            return; // Super admin can access all
        }
        // Allow Client Admin (CLIENT type users with a role)
        if (req.currentUser?.type === 'CLIENT' && role_id) {
            console.log('Access granted: Client admin with role');
            return; // Client admin can access all
        }
        if (!isInstitute) {
            console.error('Access denied: Not an institute user');
            const err = new Error("Only institutes, admins, or super admin can access this resource");
            err.status = 403;
            throw err;
        }
        
        if (!institute_id) {
            console.error('Access denied: No institute_id in session');
            const err = new Error("Institute ID not found in user context");
            err.status = 403;
            throw err;
        }
        
        const instituteId = Number(institute_id);
        const choiceInstituteId = Number(choice.institute_id);
        
        if (instituteId !== choiceInstituteId) {
            console.error('Institute access denied:', {
                user_institute_id: instituteId,
                choice_institute_id: choiceInstituteId,
                match: false
            });
            const err = new Error("You are not authorized for this institute");
            err.status = 403;
            throw err;
        }
        
        console.log('Access granted: Institute IDs match');
    }

    static async ensureStudentAccess(choice, req) {
        const { isStudent, id: userId } = req.currentUser || {};
        if (!isStudent) {
            const err = new Error("Only students can access this resource");
            err.status = 403;
            throw err;
        }
        if (userId !== Number(choice.student_user_id)) {
            const err = new Error("You are not authorized for this student");
            err.status = 403;
            throw err;
        }
    }

    static async ensureLetterRecord(choice) {
        let record = await db.knex(this.tableName)
            .where({ student_id: choice.student_id, ins_id: choice.institute_id })
            .first();

        if (!record) {
            const now = currentDT();
            const payload = {
                user_id: choice.student_user_id,
                ins_id: choice.institute_id,
                student_id: choice.student_id,
                created: now,
                updated: now
            };
            const id = await db.save(this.tableName, payload);
            record = await db.knex(this.tableName).where({ id }).first();
        }

        return record;
    }

    static buildDetail(choice, record) {
        return {
            scf_id: choice.scf_id,
            student_id: choice.student_id,
            student_regno: choice.student_regno,
            student_name: choice.student_name,
            student_email: choice.student_email,
            student_mobile: choice.student_mobile,
            institute_id: choice.institute_id,
            institute_name: choice.institute_name,
            institute_course_id: choice.institute_course_id,
            specialization_name: choice.specialization_name || null,
            payment_status: choice.payment_status,
            ins_status: choice.ins_status,
            stu_status: choice.stu_status,
            letters: record ? {
                id: record.id,
                admission_letter: !!record.admission_letter,
                admission_letter_fileid: record.admission_letter_fileid || null,
                visa_letter: !!record.visa_letter,
                visa_letter_fileid: record.visa_letter_fileid || null,
                payment_slip: !!record.payment_slip,
                payment_slip_fileid: record.payment_slip_fileid || null,
                student_visa_status: record.student_visa,
                student_visa_fileid: record.student_visa_fileid || null,
                pickup: record.pickup || null,
                pickup_fileid: record.pickup_fileid || null,
                ticket_file: record.ticket_file || null,
                created: record.created,
                updated: record.updated
            } : null
        };
    }

    static async listEligible(req) {
        this.ensureSuperAdminOrInstitute(req);
        const { isClient, isAdmin, isInstitute, institute_id } = req.currentUser || {};
        const { institute_id: queryInstituteId, search } = trim(req.query || {});

        const qb = db.knex("student_choice_fillings as scf")
            .select([
                "scf.id as scf_id",
                "scf.student_id",
                "scf.payment_status",
                "scf.ins_status",
                "scf.stu_status",
                "scf.payment_slip_file_id",
                "scf.payment_slip_dt",
                "s.regno as student_regno",
                "u.name as student_name",
                "u.email as student_email",
                "u.mobile as student_mobile",
                "ic.institute_id",
                "i.name as institute_name",
                "ic.id as institute_course_id",
                "ms.name as specialization_name",
                "sl.id as letter_id",
                "sl.admission_letter",
                "sl.admission_letter_fileid",
                "sl.visa_letter",
                "sl.visa_letter_fileid",
                "sl.payment_slip",
                "sl.payment_slip_fileid",
                "sl.student_visa",
                "sl.student_visa_fileid",
                "sl.pickup",
                "sl.pickup_fileid",
                "sl.ticket_file",
                "sl.updated as letters_updated"
            ])
            .join("students as s", "s.id", "scf.student_id")
            .join("users as u", "u.id", "s.user_id")
            .join("institute_courses as ic", "ic.id", "scf.institute_course_id")
            .join("institutes as i", "i.id", "ic.institute_id")
            .leftJoin("master_specializations as ms", "ms.id", "ic.specialization_id")
            .leftJoin(this.tableName + " as sl", function () {
                this.on("sl.student_id", "=", "scf.student_id")
                    .andOn("sl.ins_id", "=", "ic.institute_id");
            })
            .whereRaw('COALESCE(UPPER(scf.payment_status), "") = ?', ["ACKNOWLEDGED"]);

        if (isInstitute) {
            qb.where("ic.institute_id", Number(institute_id) || 0);
        } else if (queryInstituteId) {
            qb.where("ic.institute_id", Number(queryInstituteId));
        }

        if (search) {
            qb.where((builder) => {
                builder.where("s.regno", "like", `%${search}%`)
                    .orWhere("u.name", "like", `%${search}%`)
                    .orWhere("u.email", "like", `%${search}%`)
                    .orWhere("u.mobile", "like", `%${search}%`);
            });
        }

        qb.orderBy("sl.updated", "desc").orderBy("scf.id", "desc");

        const rows = await qb;
        return rows.map((row) => ({
            scf_id: row.scf_id,
            student_id: row.student_id,
            student_regno: row.student_regno,
            student_name: row.student_name,
            student_email: row.student_email,
            student_mobile: row.student_mobile,
            institute_id: row.institute_id,
            institute_name: row.institute_name,
            institute_course_id: row.institute_course_id,
            specialization_name: row.specialization_name || null,
            payment_status: row.payment_status,
            ins_status: row.ins_status,
            stu_status: row.stu_status,
            letters: {
                id: row.letter_id || null,
                admission_letter: !!row.admission_letter,
                admission_letter_fileid: row.admission_letter_fileid || null,
                visa_letter: !!row.visa_letter,
                visa_letter_fileid: row.visa_letter_fileid || null,
                payment_slip: !!row.payment_slip,
                payment_slip_fileid: row.payment_slip_fileid || null,
                student_visa_status: row.student_visa,
                student_visa_fileid: row.student_visa_fileid || null,
                pickup: row.pickup || null,
                pickup_fileid: row.pickup_fileid || null,
                ticket_file: row.ticket_file || null,
                updated: row.letters_updated
            }
        }));
    }

    static async getDetail(scfId, req) {
        const choice = await this.fetchChoice(scfId);
        const { isClient, isAdmin, isInstitute, isStudent } = req.currentUser || {};
        if (isStudent) {
            await this.ensureStudentAccess(choice, req);
        } else {
            this.ensureSuperAdminOrInstitute(req);
            await this.ensureInstituteAccess(choice, req);
        }
        // Allow viewing letters even without payment acknowledgement
        // Payment check is still enforced for upload actions
        // this.assertPaymentAcknowledged(choice);
        const record = await this.ensureLetterRecord(choice);
        return this.buildDetail(choice, record);
    }

    static async uploadAdmissionLetter({ scfId, fileId }, req) {
        this.ensureSuperAdminOrInstitute(req);
        const choice = await this.fetchChoice(scfId);
        await this.ensureInstituteAccess(choice, req);
        this.assertPaymentAcknowledged(choice);

        const record = await this.ensureLetterRecord(choice);
        const now = currentDT();
        await db.save(this.tableName, {
            id: record.id,
            admission_letter: 1,
            admission_letter_fileid: fileId,
            updated: now
        });

        const updated = await db.knex(this.tableName).where({ id: record.id }).first();
        return this.buildDetail(choice, updated);
    }

    static async uploadVisaLetter({ scfId, fileId }, req) {
        this.ensureSuperAdminOrInstitute(req);
        const choice = await this.fetchChoice(scfId);
        await this.ensureInstituteAccess(choice, req);
        this.assertPaymentAcknowledged(choice);

        const record = await this.ensureLetterRecord(choice);
        const now = currentDT();
        await db.save(this.tableName, {
            id: record.id,
            visa_letter: 1,
            visa_letter_fileid: fileId,
            updated: now
        });

        const updated = await db.knex(this.tableName).where({ id: record.id }).first();
        return this.buildDetail(choice, updated);
    }



    static async uploadStudentPaymentProof({ scfId, fileId, student_id, user_id }, req) {

        // this.ensureSuperAdminOrInstitute(req);   
          
        console.log("scfId nnn:", scfId);
        const choice = await this.fetchChoice(scfId);
        this.ensureStudentAccess(choice, req);
        // await this.ensureInstituteAccess(choice, req);
        // this.assertPaymentAcknowledged(choice);
        const now = currentDT();
        await db.save("student_choice_fillings", {
            id: scfId,
            student_id:student_id,
            payment_slip_file_id: fileId,
            payment_slip_by:user_id,
            payment_slip_dt: now,
            // institute_course_id: choice.institute_course_id
        });

        const updated = await db.knex("student_choice_fillings").where({ id: scfId }).first();
        return this.buildDetail(choice, updated);
    }



// institute upload payment slip
    static async uploadPaymentSlip({ scfId, fileId }, req) {
        this.ensureSuperAdminOrInstitute(req);
        const choice = await this.fetchChoice(scfId);
        await this.ensureInstituteAccess(choice, req);
        this.assertPaymentAcknowledged(choice);
        const record = await this.ensureLetterRecord(choice);
        const now = currentDT();
        await db.save(this.tableName, {
            id: record.id,
            payment_slip: 1,
            payment_slip_fileid: fileId,
            updated: now
        });

        const updated = await db.knex(this.tableName).where({ id: record.id }).first();
        return this.buildDetail(choice, updated);
    }




    static async uploadStudentVisa({ scfId, fileId }, req) {
        const choice = await this.fetchChoice(scfId);
        await this.ensureStudentAccess(choice, req);
        this.assertPaymentAcknowledged(choice);

        const record = await this.ensureLetterRecord(choice);
        if (!record.admission_letter || !record.visa_letter) {
            const err = new Error("Institute must upload admission and visa letters first");
            err.status = 400;
            throw err;
        }

        // Allow re-upload if visa is not approved (status 0 = pending, 2 = rejected)
        // Block re-upload if visa is approved (status 1)
        if (Number(record.student_visa) === 1) {
            const err = new Error("Visa has already been approved. No further uploads allowed.");
            err.status = 400;
            throw err;
        }

        const now = currentDT();
        await db.save(this.tableName, {
            id: record.id,
            student_visa: 0, // Reset to pending when re-uploading
            student_visa_fileid: fileId,
            updated: now
        });

        const updated = await db.knex(this.tableName).where({ id: record.id }).first();
        return this.buildDetail(choice, updated);
    }

    static async reviewStudentVisa({ scfId, decision }, req) {
        this.ensureSuperAdminOrInstitute(req);
        const choice = await this.fetchChoice(scfId);
        await this.ensureInstituteAccess(choice, req);
        this.assertPaymentAcknowledged(choice);

        const record = await this.ensureLetterRecord(choice);
        if (!record.student_visa_fileid) {
            const err = new Error("Student has not uploaded visa yet");
            err.status = 400;
            throw err;
        }

        const normalizedDecision = decision === "APPROVED" ? 1 : decision === "REJECTED" ? 2 : null;
        if (normalizedDecision === null) {
            const err = new Error("Invalid decision value");
            err.status = 400;
            throw err;
        }

        const now = currentDT();
        await db.save(this.tableName, {
            id: record.id,
            student_visa: normalizedDecision,
            updated: now
        });

        const updated = await db.knex(this.tableName).where({ id: record.id }).first();
        return this.buildDetail(choice, updated);
    }

    static async uploadPickupSchedule({ scfId, pickup, fileId }, req) {
        this.ensureSuperAdminOrInstitute(req);
        const choice = await this.fetchChoice(scfId);
        await this.ensureInstituteAccess(choice, req);
        this.assertPaymentAcknowledged(choice);

        const record = await this.ensureLetterRecord(choice);
        if (Number(record.student_visa) !== 1) {
            const err = new Error("Pickup schedule can be uploaded only after visa approval");
            err.status = 400;
            throw err;
        }

        const now = currentDT();
        await db.save(this.tableName, {
            id: record.id,
            pickup: pickup || null,
            pickup_fileid: fileId || null,
            updated: now
        });

        const updated = await db.knex(this.tableName).where({ id: record.id }).first();
        return this.buildDetail(choice, updated);
    }

    static async uploadTicket({ scfId, fileId }, req) {
        this.ensureSuperAdminOrInstitute(req);
        const choice = await this.fetchChoice(scfId);
        await this.ensureInstituteAccess(choice, req);
        this.assertPaymentAcknowledged(choice);

        const record = await this.ensureLetterRecord(choice);
        const now = currentDT();
        await db.save(this.tableName, {
            id: record.id,
            ticket_file: fileId,
            updated: now
        });

        const updated = await db.knex(this.tableName).where({ id: record.id }).first();
        return this.buildDetail(choice, updated);
    }

    static async deleteAllDocuments({ scfId }, req) {
        this.ensureSuperAdminOrInstitute(req);
        const choice = await this.fetchChoice(scfId);
        await this.ensureInstituteAccess(choice, req);

        const record = await db.knex(this.tableName)
            .where({ student_id: choice.student_id, ins_id: choice.institute_id })
            .first();

        if (!record) {
            const err = new Error("No documents found for this student");
            err.status = 404;
            throw err;
        }

        const now = currentDT();
        // Reset all document fields to null
        await db.save(this.tableName, {
            id: record.id,
            admission_letter: null,
            admission_letter_fileid: null,
            visa_letter: null,
            visa_letter_fileid: null,
            payment_slip: null,
            payment_slip_fileid: null,
            student_visa: null,
            student_visa_fileid: null,
            pickup: null,
            pickup_fileid: null,
            ticket_file: null,
            updated: now
        });

        return { message: "All documents deleted successfully" };
    }

    static normalizeRelativePath(value) {
        return (value || '')
            .toString()
            .trim()
            .replace(/\\/g, '/')
            .replace(/^\/+/, '');
    }

    static resolveFilePath(fileId) {
        const id = (fileId || '').toString().trim();
        if (!id) return null;
        // If it already looks like a dated path (contains '/') treat as relative path under UP_PATH
        if (id.includes('/')) {
            return this.normalizeRelativePath(id);
        }
        // If it's a numeric ID, we'll need to look it up in the files table
        // This is handled by the caller
        return null;
    }

    static resolveFilePathFromMeta(fileRecord) {
        if (!fileRecord) return null;

        const fileName = this.normalizeRelativePath(fileRecord.file_name || '');
        
        // First try: use stored path
        const storedPath = this.normalizeRelativePath(fileRecord.path || '');
        if (storedPath) {
            // If path already includes the filename, use it as-is
            if (storedPath.includes(fileName)) {
                return storedPath;
            }
            // Otherwise append filename
            return this.normalizeRelativePath(`${storedPath}/${fileName}`);
        }

        // Second try: construct from created date
        const created = fileRecord.created ? new Date(fileRecord.created) : null;
        if (created && !Number.isNaN(created.getTime())) {
            const year = created.getFullYear();
            const month = String(created.getMonth() + 1).padStart(2, '0');
            const day = String(created.getDate()).padStart(2, '0');
            if (fileName) {
                return this.normalizeRelativePath(
                    `${year}/${year}-${month}/${year}-${month}-${day}/${fileName}`
                );
            }
        }

        // Third try: construct from updated date
        const updated = fileRecord.updated ? new Date(fileRecord.updated) : null;
        if (updated && !Number.isNaN(updated.getTime())) {
            const year = updated.getFullYear();
            const month = String(updated.getMonth() + 1).padStart(2, '0');
            const day = String(updated.getDate()).padStart(2, '0');
            if (fileName) {
                return this.normalizeRelativePath(
                    `${year}/${year}-${month}/${year}-${month}-${day}/${fileName}`
                );
            }
        }

        // Fourth try: fallback to files directory (PHP uploads)
        if (fileName) {
            return this.normalizeRelativePath(`files/${fileName}`);
        }

        return null;
    }

    static async getFileFor(kind, scfId, req) {
        const choice = await this.fetchChoice(scfId);
        const { isStudent } = req.currentUser || {};
        
        // Enhanced logging for authentication and request details
        console.log('[getFileFor] Request details:', {
            kind,
            scfId,
            isStudent,
            userId: req.currentUser?.id,
            userType: req.currentUser?.type,
            choice_student_id: choice?.student_id,
            choice_user_id: choice?.user_id,
            choice_institute_id: choice?.institute_id
        });
        
        if (isStudent) {
            await this.ensureStudentAccess(choice, req);
        } else {
            this.ensureSuperAdminOrInstitute(req);
            await this.ensureInstituteAccess(choice, req);
        }
        if (kind === 'student-visa' || kind === 'pickup') {
            this.assertPaymentAcknowledged(choice);
        }

        console.log('DEBUG getFileFor:', {
            kind,
            scfId,
            choice_offer_letter_file_id: choice?.offer_letter_file_id,
            choice_payment_slip_file_id: choice?.payment_slip_file_id
        });

        let fileId = null;
        let fromChoiceTable = false;

        // Determine which file to retrieve and from which table
        switch (kind) {
            case 'offer-letter':
                // Offer letter is in student_choice_fillings table
                fileId = choice.offer_letter_file_id || null;
                fromChoiceTable = true;
                break;
            case 'payment-proof':
                // Payment proof uploaded by student is in student_choice_fillings table
                fileId = choice.payment_slip_file_id || null;
                fromChoiceTable = true;
                break;
            default:
                // All other files are in student_letters table
                const record = await this.ensureLetterRecord(choice);
                console.log('DEBUG getFileFor record:', {
                    record_id: record?.id,
                    scf_id: scfId,
                    admission_letter: record?.admission_letter,
                    admission_letter_fileid: record?.admission_letter_fileid,
                    visa_letter: record?.visa_letter,
                    visa_letter_fileid: record?.visa_letter_fileid,
                    payment_slip: record?.payment_slip,
                    payment_slip_fileid: record?.payment_slip_fileid,
                    student_visa: record?.student_visa,
                    student_visa_fileid: record?.student_visa_fileid,
                    student_visa_status: record?.student_visa_status,
                    pickup_fileid: record?.pickup_fileid,
                    ticket_file: record?.ticket_file,
                    created: record?.created,
                    updated: record?.updated
                });

                switch (kind) {
                    case 'admission-letter':
                        fileId = record.admission_letter_fileid || null;
                        break;
                    case 'visa-letter':
                        fileId = record.visa_letter_fileid || null;
                        break;
                    case 'payment-slip':
                        // Payment slip can be uploaded by institute (student_letters) or student (student_choice_fillings)
                        fileId = record.payment_slip_fileid || choice.payment_slip_file_id || null;
                        break;
                    case 'payment-proof':
                        fileId = choice.payment_slip_file_id || record.payment_slip_fileid || null;
                        break;
                    case 'student-visa':
                        fileId = record.student_visa_fileid || null;
                        console.log('[getFileFor] Student visa file ID retrieved:', {
                            fileId,
                            student_visa_status: record?.student_visa_status,
                            has_file: !!fileId
                        });
                        break;
                    case 'pickup':
                        fileId = record.pickup_fileid || null;
                        break;
                    case 'ticket':
                        fileId = record.ticket_file || null;
                        break;
                }
        }

        if (!fileId) {
            console.error('[getFileFor] File not found - Details:', {
                kind,
                scfId,
                fileId,
                isStudent,
                userId: req.currentUser?.id,
                student_id: choice?.student_id,
                institute_id: choice?.institute_id
            });
            const err = new Error(`File not found: ${kind} not uploaded for this student (scfId: ${scfId})`);
            err.status = 404;
            throw err;
        }

        const rawFileId = (fileId || '').toString().trim();
        let relPath = null;
        let fileMeta = null;

        console.log('DEBUG resolving file path:', {
            rawFileId,
            hasSlash: rawFileId.includes('/'),
            isNumeric: /^\d+$/.test(rawFileId),
            fromChoiceTable
        });

        if (rawFileId.includes('/')) {
            relPath = this.resolveFilePath(rawFileId);
            console.log('DEBUG path from slash:', relPath);
        } else {
            const isNumericId = /^\d+$/.test(rawFileId);
            if (isNumericId) {
                fileMeta = await db.knex('files').where({ id: Number(rawFileId) }).first();
                console.log('DEBUG file metadata:', {
                    found: !!fileMeta,
                    path: fileMeta?.path,
                    file_name: fileMeta?.file_name,
                    created: fileMeta?.created
                });
                if (fileMeta) {
                    relPath = this.resolveFilePathFromMeta(fileMeta);
                    console.log('DEBUG path from metadata:', relPath);
                }
            }

            if (!relPath) {
                // If we still don't have a path, it might be stored as a direct path
                relPath = this.normalizeRelativePath(rawFileId);
                console.log('DEBUG fallback path:', relPath);
            }
        }

        console.log('DEBUG final resolved path:', relPath);

        if (!relPath) {
            const err = new Error('Invalid file reference');
            err.status = 400;
            throw err;
        }

        // Suggest a download name
        const baseName = kind.replace(/-/g, '_');
        const suggested = `${choice.student_name}_${baseName}`;

        return {
            relative_path: relPath,
            suggested_name: suggested
        };
    }
}

module.exports = StudentLettersService;
