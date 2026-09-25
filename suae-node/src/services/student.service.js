const db = require("../libraries/db");
const { currentDT } = require("../util/common.util");
const { autoLoginUrl } = require("../util/leads.util");
const LeadAutomationService = require("./lead_automation.service");

// import csv for student registration
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

class StudentService {

    static normalizeImportKey(key) {
        if (!key && key !== 0) return '';
        return String(key)
            .replace(/^\uFEFF/, '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '');
    }

    static normalizeImportRow(row) {
        const out = {};
        if (!row || typeof row !== 'object') return out;
        for (const [k, v] of Object.entries(row)) {
            const nk = this.normalizeImportKey(k);
            if (!nk) continue;
            out[nk] = v;
        }
        return out;
    }

    static pickImportValue(row, keys) {
        for (const k of keys) {
            const nk = this.normalizeImportKey(k);
            const v = row?.[nk];
            if (v === undefined || v === null) continue;
            const s = String(v).trim();
            if (s) return s;
        }
        return '';
    }

    static _masterNameToIdCache = new Map();

    static normalizeLookupValue(v) {
        if (!v && v !== 0) return '';
        return String(v)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');
    }

    static async getMasterNameToIdMap(tableName) {
        const t = String(tableName || '').trim();
        if (!t) return new Map();
        if (this._masterNameToIdCache.has(t)) return this._masterNameToIdCache.get(t);
        const rows = await db.knex(t).select(['id', 'name']);
        const m = new Map();
        for (const r of rows || []) {
            const key = this.normalizeLookupValue(r?.name);
            const id = Number(r?.id || 0) || null;
            if (key && id) m.set(key, id);
        }
        this._masterNameToIdCache.set(t, m);
        return m;
    }

    static async resolveMasterId(tableName, rawValue) {
        const s = String(rawValue || '').trim();
        if (!s) return null;
        if (/^\d+$/.test(s)) return Number(s);
        const m = await this.getMasterNameToIdMap(tableName);
        const normalized = this.normalizeLookupValue(s);
        let id = m.get(normalized) || null;

        // Fallback: If no exact match is found, do a word-boundary match first to prevent partial word matches (e.g. "India" matching "Indian")
        if (!id) {
            const escaped = normalized.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const boundaryRegex = new RegExp('\\b' + escaped + '\\b');
            for (const [name, targetId] of m.entries()) {
                if (boundaryRegex.test(name)) {
                    id = targetId;
                    break;
                }
            }
            // Fallback to simple inclusion if no boundary match is found
            if (!id) {
                for (const [name, targetId] of m.entries()) {
                    if (name.includes(normalized) || normalized.includes(name)) {
                        id = targetId;
                        break;
                    }
                }
            }
        }
        return id;
    }

    static _defaultImportCountryId = null;

    static async getDefaultImportCountryId() {
        if (this._defaultImportCountryId) return this._defaultImportCountryId;
        const first = await db.knex('master_countries').select(['id']).orderBy('id', 'asc').first();
        this._defaultImportCountryId = first?.id ? Number(first.id) : null;
        return this._defaultImportCountryId;
    }

    static _defaultImportAcId = null;

    static async getDefaultImportAcId() {
        if (this._defaultImportAcId) return this._defaultImportAcId;
        const first = await db.knex('master_acad_careers').select(['id']).orderBy('id', 'asc').first();
        this._defaultImportAcId = first?.id ? Number(first.id) : null;
        return this._defaultImportAcId;
    }

    static _defaultImportDisciplineId = null;

    static async getDefaultImportDisciplineId() {
        if (this._defaultImportDisciplineId) return this._defaultImportDisciplineId;
        const first = await db.knex('master_disciplines').select(['id']).orderBy('id', 'asc').first();
        this._defaultImportDisciplineId = first?.id ? Number(first.id) : null;
        return this._defaultImportDisciplineId;
    }

    static _studentVisibilityEnsured = null;

    static async ensureStudentVisibilityTable() {
        if (this._studentVisibilityEnsured !== null) {
            return this._studentVisibilityEnsured;
        }

        this._studentVisibilityEnsured = (async () => {
            const exists = await db.knex.schema.hasTable('student_visibility');
            if (exists) return true;

            await db.knex.schema.createTable('student_visibility', (t) => {
                t.increments('id').primary();
                t.integer('student_id').notNullable().index();
                t.integer('user_id').notNullable().index();
                t.integer('automation_id').nullable().index();
                t.timestamp('created').defaultTo(db.knex.fn.now());
                t.timestamp('updated').defaultTo(db.knex.fn.now());
                t.integer('created_by').nullable();
                t.integer('updated_by').nullable();
                t.unique(['student_id', 'user_id']);
            });

            return true;
        })();

        return this._studentVisibilityEnsured;
    }

    // this function is used to import students from csv file
    static importStudentsFromCsv = async (req, csvPath, sessionId = null) => {
        const { isClient, isAgent } = req.currentUser || {};
        if (!isClient && !isAgent) { // only super admin and agent can import students
            throw new Error("Only super admin or agent can import students");
        }

        // get the absolute path of the csv file
        const cleanedCsvPath = (csvPath || '').replace(/^[\/\\]+/, '');
        const absolutePath = path.join(process.env.UP_PATH, cleanedCsvPath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error("CSV file not found");
        }

        return this.importStudentsFromUpload(req, {
            absolutePath,
            masterSessionId: sessionId ? Number(sessionId) : null,
        });
    }

    static importStudentsFromUpload = async (req, { absolutePath, masterSessionId } = {}) => {
        const { isClient, isAgent, id: currentUserId } = req.currentUser || {};
        if (!isClient && !isAgent) {
            throw new Error("Only super admin or agent can import students");
        }
        if (!absolutePath) {
            throw new Error('File path required');
        }
        if (!masterSessionId) {
            throw new Error('master_session_id required');
        }
        if (!fs.existsSync(absolutePath)) {
            throw new Error('CSV file not found');
        }

        const ext = String(path.extname(absolutePath) || '').replace('.', '').toLowerCase();

        const rows = await (async () => {
            if (ext === 'csv') {
                // Auto-detect separator (comma or semicolon) from the first line
                let separator = ',';
                try {
                    const firstLine = await new Promise((resolve, reject) => {
                        const stream = fs.createReadStream(absolutePath, { encoding: 'utf8' });
                        let data = '';
                        stream.on('data', chunk => {
                            data += chunk;
                            const lineEnd = data.indexOf('\n');
                            if (lineEnd !== -1) {
                                stream.destroy();
                                resolve(data.substring(0, lineEnd));
                            }
                        });
                        stream.on('end', () => resolve(data));
                        stream.on('error', reject);
                    });
                    if (firstLine.includes('\t')) {
                        separator = '\t';
                    } else if (firstLine.includes(';') && !firstLine.includes(',')) {
                        separator = ';';
                    } else if (firstLine.includes(';') && firstLine.includes(',')) {
                        const commas = (firstLine.match(/,/g) || []).length;
                        const semicolons = (firstLine.match(/;/g) || []).length;
                        if (semicolons > commas) {
                            separator = ';';
                        }
                    }
                    console.log('=== CSV AUTO-DETECT ===');
                    console.log('First line:', JSON.stringify(firstLine));
                    console.log('Detected separator:', separator);
                } catch (e) {
                    console.error('Failed to auto-detect CSV separator:', e);
                }

                return new Promise((resolve, reject) => {
                    const results = [];
                    fs.createReadStream(absolutePath)
                        .pipe(csv({ 
                            separator,
                            mapHeaders: ({ header }) => StudentService.normalizeImportKey(header) 
                        }))
                        .on('data', (data) => results.push(data))
                        .on('end', () => resolve(results))
                        .on('error', reject);
                });
            }

            if (ext === 'xlsx' || ext === 'xls') {
                const wb = xlsx.readFile(absolutePath);
                const sheetName = wb.SheetNames && wb.SheetNames.length ? wb.SheetNames[0] : null;
                if (!sheetName) return [];
                const sheet = wb.Sheets[sheetName];
                return xlsx.utils.sheet_to_json(sheet, { defval: '' });
            }

            throw new Error('Unsupported file type');
        })();

        const countriesList = await db.knex('master_countries').select(['id', 'isd_code']);
        const summary = { total: 0, created: 0, updated: 0, skipped: 0, errors: 0, error_rows: [] };

        for (const [index, row] of (rows || []).entries()) {
            summary.total++;
            try {
                if (index === 0) {
                    console.log('=== FIRST ROW PARSED ===');
                    console.log('Original Row keys:', Object.keys(row || {}));
                    console.log('Original Row values:', Object.values(row || {}));
                }
                const normalizedRow = this.normalizeImportRow(row);

                const name = this.pickImportValue(normalizedRow, [
                    'name',
                    'studentname',
                    'fullname',
                    'full_name',
                    'candidate',
                    'candidatename',
                    'applicantname',
                ]);
                const email = this.pickImportValue(normalizedRow, [
                    'email',
                    'emailid',
                    'email_id',
                    'mail',
                    'emailaddress',
                ]).toLowerCase();
                const mobile = this.pickImportValue(normalizedRow, [
                    'mobile',
                    'mobileno',
                    'mobile_no',
                    'phone',
                    'phoneno',
                    'contact',
                    'contactno',
                    'contactnumber',
                    'whatsapp',
                    'whatsappno',
                ]);

                const missing = [];
                if (!name) missing.push('name');
                if (!email) missing.push('email');
                if (!mobile) missing.push('mobile');
                if (missing.length) {
                    summary.skipped++;
                    const keys = Object.keys(row || {}).slice(0, 40);
                    summary.error_rows.push({
                        row: index + 1,
                        message: `Missing required field(s): ${missing.join(', ')}. Detected headers: ${keys.join(', ')}`,
                    });
                    continue;
                }

                // Resolve country ID for isd_code_country_id and country_id
                const countryRaw = this.pickImportValue(normalizedRow, ['country_id', 'countryid', 'country']);
                let resolvedCountryId = null;
                if (countryRaw) {
                    resolvedCountryId = await this.resolveMasterId('master_countries', countryRaw);
                }

                if (!resolvedCountryId && mobile) {
                    const cleanMob = String(mobile).trim();
                    if (cleanMob.startsWith('+')) {
                        let bestMatch = null;
                        let bestLength = 0;
                        for (const c of countriesList) {
                            if (c.isd_code && cleanMob.startsWith(c.isd_code)) {
                                if (c.isd_code.length > bestLength) {
                                    bestMatch = c;
                                    bestLength = c.isd_code.length;
                                }
                            }
                        }
                        if (bestMatch) {
                            resolvedCountryId = bestMatch.id;
                        }
                    }
                }

                if (!resolvedCountryId) {
                    resolvedCountryId = await this.getDefaultImportCountryId();
                }

                let user = await db.knex('users').select(['id']).where((qb) => {
                    if (email) qb.orWhere({ email });
                    if (mobile) qb.orWhere({ mobile });
                    qb.where({ type: 'STUDENT' });
                }).first();

                const userData = {
                    type: 'STUDENT',
                    name,
                    email: email || null,
                    mobile: mobile || null,
                    isd_code_country_id: resolvedCountryId || null,
                    client_id: req.currentUser?.client_id || 1,
                    status: 1,
                };

                let user_id;
                let userCreated = false;
                if (!user) {
                    user_id = await db.save('users', userData, 1, req);
                    userCreated = true;
                } else {
                    user_id = user.id;
                    await db.save('users', { id: user_id, ...userData }, 1, req);
                }

                const hasRegisteredVia = await db.knex.schema.hasColumn('students', 'registered_via');
                const hasCountryId = await db.knex.schema.hasColumn('students', 'country_id');
                const hasResidentCountryId = await db.knex.schema.hasColumn('students', 'resident_country_id');
                const hasDisciplineId = await db.knex.schema.hasColumn('students', 'discipline_id');
                const hasCourseId = await db.knex.schema.hasColumn('students', 'course_id');
                const hasAcId = await db.knex.schema.hasColumn('students', 'ac_id');
                const hasRegno = await db.knex.schema.hasColumn('students', 'regno');

                const studentData = {
                    user_id: user_id,
                    master_session_id: Number(masterSessionId),
                    ...(hasRegisteredVia ? { registered_via: 'Excel' } : {}),
                    ...(isAgent && currentUserId && !isClient ? { agent_id: currentUserId } : {}),
                };

                const regno = this.pickImportValue(normalizedRow, [
                    'regno',
                    'registration',
                    'registrationno',
                    'registrationnumber',
                    'reg_no',
                ]);
                if (hasRegno && regno) {
                    studentData.regno = regno;
                }

                const residentCountryRaw = this.pickImportValue(normalizedRow, ['resident_country_id', 'residentcountryid', 'residentcountry', 'residentcountryname']);
                const disciplineRaw = this.pickImportValue(normalizedRow, ['discipline_id', 'disciplineid', 'discipline', 'disciplinename']);
                const courseId = Number(this.pickImportValue(normalizedRow, ['course', 'courseid', 'course_id'])) || null;
                const acRaw = this.pickImportValue(normalizedRow, ['ac_id', 'acid', 'ac', 'academiccarrer', 'academiccareer', 'acadcareer', 'career']);

                const countryId = hasCountryId ? resolvedCountryId : null;
                const residentCountryId = hasResidentCountryId ? (await this.resolveMasterId('master_countries', residentCountryRaw)) : null;
                const disciplineId = hasDisciplineId ? (await this.resolveMasterId('master_disciplines', disciplineRaw)) : null;
                const acId = hasAcId ? (await this.resolveMasterId('master_acad_careers', acRaw)) : null;

                const stuSelect = ['id'];
                if (hasRegno) stuSelect.push('regno');
                const stu = await db.knex('students').select(stuSelect).where({ user_id: user_id }).first();
                let studentId;
                if (!stu) {
                    if (hasCountryId) {
                        const resolvedCountryId = countryId || (await this.getDefaultImportCountryId());
                        if (!resolvedCountryId) {
                            throw new Error('No valid country_id available for student import');
                        }
                        studentData.country_id = resolvedCountryId;
                    }

                    if (hasAcId) {
                        const resolvedAcId = acId || (await this.getDefaultImportAcId());
                        if (!resolvedAcId) {
                            throw new Error('No valid ac_id available for student import');
                        }
                        studentData.ac_id = resolvedAcId;
                    }

                    if (hasDisciplineId) {
                        const resolvedDisciplineId = disciplineId || (await this.getDefaultImportDisciplineId());
                        if (!resolvedDisciplineId) {
                            throw new Error('No valid discipline_id available for student import');
                        }
                        studentData.discipline_id = resolvedDisciplineId;
                    }

                    if (hasResidentCountryId && residentCountryId) studentData.resident_country_id = residentCountryId;
                    if (hasCourseId && courseId) studentData.course_id = courseId;
                    studentId = await db.save('students', studentData, 1, req);

                    if (hasRegno && !studentData.regno) {
                        const generatedRegno = `SIS-${String(studentId).padStart(6, '0')}`;
                        await db.knex('students')
                            .where({ id: studentId })
                            .update({ regno: generatedRegno });
                    }
                } else {
                    studentId = stu.id;

                    if (hasCountryId && countryId) studentData.country_id = countryId;
                    if (hasAcId && acId) studentData.ac_id = acId;
                    if (hasResidentCountryId && residentCountryId) studentData.resident_country_id = residentCountryId;
                    if (hasDisciplineId && disciplineId) studentData.discipline_id = disciplineId;
                    if (hasCourseId && courseId) studentData.course_id = courseId;

                    const existingRegno = stu.regno || '';
                    if (hasRegno && !existingRegno && !studentData.regno) {
                        studentData.regno = `SIS-${String(studentId).padStart(6, '0')}`;
                    }

                    await db.save('students', { id: studentId, ...studentData }, 1, req);
                }

                if (userCreated || !stu) {
                    summary.created++;
                } else {
                    summary.updated++;
                }

                if (isAgent && currentUserId && !isClient) {
                    // Assign to the importing agent directly
                    const extra = await this.ensureStudentExtraInfo(studentId, req);
                    await db.save('student_extra_info', {
                        id: extra.id,
                        student_id: studentId,
                        assigned_to: currentUserId,
                        assigned_on: currentDT(),
                        assigned_by: currentUserId
                    }, 1, req);
                } else {
                    try {
                        await this.autoAssignLeadByAutomation({ studentId }, req);
                    } catch (e) {
                        // ignore automation errors for import
                    }
                }
            } catch (e) {
                summary.errors++;
                summary.error_rows.push({ row: index + 1, message: e.message });
            }
        }

        return summary;
    }

    static getChoiceFillingdetail = async (id) => {
        const choice = await db.knex("student_choice_fillings").where({ id }).first();
        if (!choice) {
            return null;
        }
        let f = ['u.fname', 'u.lname', 'u.name', 'u.email', 'u.mobile', 'c.isd_code'];
        const stu = await db.knex("students as s").select(f).join("users as u", "u.id", "s.user_id").join("master_countries as c", "c.id", "u.isd_code_country_id").where('s.id', choice.student_id).first();
        if (!stu) {
            return null;
        }

        stu.login_url = autoLoginUrl(stu.email);

        f = ['sp.name as specialization', 'i.name as institute_name'];
        const course = await db.knex("institute_courses as ic").select(f).join("master_specializations as sp", "sp.id", "ic.specialization_id").join("institutes as i", "i.id", "ic.institute_id").where('ic.id', choice.institute_course_id).first();
        if (!course) {
            return null;
        }

        return {
            choice,
            stu,
            course
        };
    }

    static setSCFAdmStatus = async ({ scf_id, status }, req) => {
        const { id: user_id, isClient } = req.currentUser;
        if (!isClient) {
            throw new Error("You are not authorized to use this module!");
        }
        const dtl = await db.knex("student_choice_fillings").where({ id: scf_id }).first();
        if (!dtl) {
            throw new Error("Invalid Request!");
        }
        if (dtl.adm_status === status) {
            throw new Error(`Already ${status}!`);
        }

        const data = {
            id: scf_id,
            adm_status: status,
            adm_status_dt: currentDT(),
            adm_status_by: user_id
        };
        await db.save("student_choice_fillings", data);
    }

    static setSCFInstituteStatus = async ({ scf_id, status }, req) => {
        const { id: user_id, isInstitute } = req.currentUser;
        if (!isInstitute) {
            throw new Error("You are not authorized to use this module!");
        }
        const dtl = await db.knex("student_choice_fillings").where({ id: scf_id }).first();
        if (!dtl) {
            throw new Error("Invalid Request!");
        }
        if (dtl.adm_status !== 'Approved') {
            throw new Error(`Not approved by admin yet!`);
        }
        if (dtl.ins_status === status) {
            throw new Error(`Already ${status}!`);
        }

        const data = {
            id: scf_id,
            ins_status: status,
            ins_status_dt: currentDT(),
        };
        await db.save("student_choice_fillings", data);
    }

    static setSCFUploadOfferLetter = async ({ scf_id, offer_letter_file_id }, req) => {
        // const { id: user_id, isInstitute } = req.currentUser;
        // if (!isInstitute) {
        //     throw new Error("You are not authorized to use this module!");
        // }
        const { id: user_id, isInstitute, type } = req.currentUser;

        if (!isInstitute && req.currentUser.type !== 'CLIENT') {
            throw new Error("You are not authorized to use this module!");
        }

        const dtl = await db.knex("student_choice_fillings").where({ id: scf_id }).first();
        if (!dtl) {
            throw new Error("Invalid Request!");
        }
        if (dtl.ins_status !== 'Accepted') {
            throw new Error(`Not accepted by you yet!`);
        }

        const data = {
            id: scf_id,
            offer_letter_file_id,
            offer_letter_dt: currentDT(),
        };
        await db.save("student_choice_fillings", data);
    }

    static setSCFUploadAdmissionLetter = async ({ scf_id, admission_letter_file_id }, req) => {
        const { id: user_id, isInstitute, type } = req.currentUser;

        if (!isInstitute && req.currentUser.type !== 'CLIENT') {
            throw new Error("You are not authorized to use this module!");
        }

        const dtl = await db.knex("student_choice_fillings").where({ id: scf_id }).first();
        if (!dtl) {
            throw new Error("Invalid Request!");
        }
        if (dtl.ins_status !== 'Accepted') {
            throw new Error(`Not accepted by you yet!`);
        }

        const data = {
            id: scf_id,
            admission_letter_file_id,
            admission_letter_dt: currentDT(),
        };
        await db.save("student_choice_fillings", data);
    }

    static setSCFStudentStatus = async ({ scf_id, status }, req) => {
        const { id: user_id, isStudent } = req.currentUser;
        if (!isStudent) {
            throw new Error("You are not authorized to use this module!");
        }
        const dtl = await db.knex("student_choice_fillings").where({ id: scf_id }).first();
        if (!dtl) {
            throw new Error("Invalid Request!");
        }
        if (dtl.ins_status !== 'Accepted') {
            throw new Error(`Not accepted by institute yet!`);
        }
        if (dtl.stu_status === status) {
            throw new Error(`Already ${status}!`);
        }

        if (status === 'Accepted') {
            const acceptedDtl = await db.knex("student_choice_fillings").where({ student_id: dtl.student_id, stu_status: 'Accepted' }).first();
            if (acceptedDtl) {
                throw new Error(`You have already accepted an offer. You can not accept more!`);
            }
        }

        const data = {
            id: scf_id,
            stu_status: status,
            stu_status_dt: currentDT(),
        };
        await db.save("student_choice_fillings", data);
    }

    static setSCFUploadPaymentSlip = async ({ scf_id, payment_slip_file_id }, req) => {
        const { id: user_id, isStudent, isInstitute } = req.currentUser;

        // Allow both students (for their own applications) and institutes to upload payment slips
        const dtl = await db.knex("student_choice_fillings").where({ id: scf_id }).first();
        if (!dtl) {
            throw new Error("Invalid Request!");
        }

        // If student is uploading, verify it's their own application
        if (isStudent) {
            const studentRecord = await db.knex("students").where({ id: dtl.student_id, user_id }).first();
            if (!studentRecord) {
                throw new Error("You can only upload payment slips for your own applications!");
            }
        }

        if (dtl.stu_status !== 'Accepted') {
            throw new Error(`Not accepted by student yet!`);
        }

        const data = {
            id: scf_id,
            payment_slip_file_id,
            payment_slip_dt: currentDT(),
            payment_slip_by: user_id,
            payment_status: 'Uploaded'
        };
        await db.save("student_choice_fillings", data);
    }

    static saveStudentChoiceFillings = async ({ student_id, institute_course_id }, req) => {
        const { id: user_id, isStudent } = req.currentUser;

        // Validate required fields
        if (!student_id) {
            throw new Error("Student ID is required");
        }
        if (!institute_course_id) {
            throw new Error("Institute course ID is required");
        }

        // Check if student exists
        const student = await db.knex("students").where({ id: student_id }).first();
        if (!student) {
            throw new Error("Student not found");
        }

        // Check if institute course exists
        const instituteCourse = await db.knex("institute_courses").where({ id: institute_course_id }).first();
        if (!instituteCourse) {
            throw new Error("Institute course not found");
        }

        // Check if student has already applied to this course
        const existingApplication = await db.knex("student_choice_fillings")
            .where({
                student_id: student_id,
                institute_course_id: institute_course_id
            })
            .first();

        if (existingApplication) {
            throw new Error("You have already applied to this course");
        }

        // Check if student has reached the maximum limit of 3 applications
        const applicationCount = await db.knex("student_choice_fillings")
            .where({ student_id: student_id })
            .count('id as count')
            .first();

        if (applicationCount && applicationCount.count >= 3) {
            throw new Error("You have reached the maximum limit of 3 course applications");
        }

        // Create new choice filling record
        const choiceFillingData = {
            student_id: student_id,
            institute_course_id: institute_course_id,
            adm_status: 'Pending',
            ins_status: 'Pending',
            stu_status: 'Pending'
        };

        const choiceFillingId = await db.save("student_choice_fillings", choiceFillingData, 0, req);

        // Update student's course_choice_date
        await db.save("students", {
            id: student_id,
            course_choice_date: currentDT()
        }, 1, req);

        return {
            id: choiceFillingId,
            message: "Course application submitted successfully",
            course_choice_date: currentDT()
        };
    }

    static _clientCountriesTableExists = null;
    static _followupAggConfig = null;

    static async getFollowupAggConfig() {
        if (this._followupAggConfig !== null) {
            return this._followupAggConfig;
        }

        const candidates = [
            'followups',
            'student_followups',
            'student_followup',
            'lead_followups',
            'lead_followup',
        ];

        for (const table of candidates) {
            try {
                const exists = await db.knex.schema.hasTable(table);
                if (!exists) continue;

                const hasStudentId = await db.knex.schema.hasColumn(table, 'student_id');
                if (hasStudentId) {
                    this._followupAggConfig = { table, idColumn: 'student_id' };
                    return this._followupAggConfig;
                }

                const hasLeadId = await db.knex.schema.hasColumn(table, 'lead_id');
                if (hasLeadId) {
                    this._followupAggConfig = { table, idColumn: 'lead_id' };
                    return this._followupAggConfig;
                }
            } catch (e) {
                // ignore and continue
            }
        }

        this._followupAggConfig = undefined;
        return this._followupAggConfig;
    }

    static async getAssignableUsers({ userIds, countryId } = {}) {
        let query = db.knex('users as u')
            .select('u.id', 'u.name', 'u.email', 'u.mobile', 'u.role_id')
            .leftJoin('roles as r', 'r.id', 'u.role_id')
            .where('u.type', 'CLIENT')
            .where('u.status', 1)
            .whereNotNull('u.role_id')
            .where('r.status', 1);

        if (Array.isArray(userIds) && userIds.length > 0) {
            query.whereIn('u.id', userIds.map((v) => Number(v)).filter(Boolean));
        }

        if (countryId) {
            if (this._clientCountriesTableExists === null) {
                this._clientCountriesTableExists = db.knex.schema.hasTable('client_countries');
            }
            const exists = await this._clientCountriesTableExists;
            if (exists) {
                query = query
                    .innerJoin('client_countries as cc', 'cc.client_user_id', 'u.id')
                    .where('cc.country_id', Number(countryId))
                    .where('cc.status', 1);
            }
        }

        return query.orderBy('u.id', 'asc');
    }

    static pickNextAssignee = (users, lastUserId) => {
        if (!users || !users.length) {
            throw new Error('No eligible users found for lead assignment');
        }

        if (!lastUserId) {
            return users[0];
        }

        const lastIndex = users.findIndex((u) => u.id === lastUserId);
        if (lastIndex === -1) {
            return users[0];
        }

        const nextIndex = (lastIndex + 1) % users.length;
        return users[nextIndex];
    }

    static async ensureStudentExtraInfo(student_id, req) {
        let extra = await db.knex('student_extra_info').where({ student_id }).first();
        if (!extra) {
            const id = await db.save('student_extra_info', { student_id }, 1, req);
            extra = await db.knex('student_extra_info').where({ id }).first();
        }
        return extra;
    }

    static async applyDatasetVisibilityByAutomation({ studentId }, req) {
        const id = Number(studentId);
        if (!id) {
            throw new Error('Student ID required');
        }

        await this.ensureStudentVisibilityTable();

        if (this._studentsHasRegisteredVia === null) {
            this._studentsHasRegisteredVia = db.knex.schema.hasColumn('students', 'registered_via');
        }
        if (this._studentsHasCourseId === null) {
            this._studentsHasCourseId = db.knex.schema.hasColumn('students', 'course_id');
        }

        const [hasRegisteredVia, hasCourseId] = await Promise.all([
            this._studentsHasRegisteredVia,
            this._studentsHasCourseId,
        ]);

        const student = await db.knex('students as s')
            .select([
                's.id',
                's.country_id',
                's.resident_country_id',
                's.discipline_id',
                ...(hasCourseId ? ['s.course_id'] : []),
                ...(hasRegisteredVia ? ['s.registered_via'] : []),
            ])
            .where('s.id', id)
            .first();

        if (!student) {
            throw new Error('Student not found');
        }

        const countryId = Number(student.resident_country_id || student.country_id || 0) || null;
        const disciplineId = Number(student.discipline_id || 0) || null;
        const courseId = hasCourseId ? (Number(student.course_id || 0) || null) : null;
        const registeredVia = hasRegisteredVia
            ? (student.registered_via ? String(student.registered_via) : 'Online')
            : 'Online';

        const datasetAutomation = await LeadAutomationService.findBestDatasetAutomationForStudent({
            countryId,
            disciplineId,
            courseId,
            registeredVia,
        });

        if (!datasetAutomation?.id) {
            return { applied: false, reason: 'No matching dataset automation found' };
        }

        const agentIds = await LeadAutomationService.getAutomationAgentIds(datasetAutomation.id);
        if (!agentIds.length) {
            return { applied: false, reason: 'No users configured for matched dataset automation', automation_id: datasetAutomation.id };
        }

        const now = db.knex.fn.now();
        const createdBy = req.currentUser?.id || null;
        const updatedBy = req.currentUser?.id || null;

        // Insert visibility rows (ignore duplicates)
        for (const uid of agentIds) {
            const userId = Number(uid);
            if (!userId) continue;
            try {
                await db.knex('student_visibility').insert({
                    student_id: id,
                    user_id: userId,
                    automation_id: Number(datasetAutomation.id) || null,
                    created: now,
                    updated: now,
                    created_by: createdBy,
                    updated_by: updatedBy,
                });
            } catch (e) {
                // Ignore duplicate entry errors
                const code = e && (e.code || e.errno);
                if (code === 'ER_DUP_ENTRY' || code === 1062) {
                    continue;
                }
                throw e;
            }
        }

        return {
            applied: true,
            automation_id: datasetAutomation.id,
            user_ids: agentIds,
        };
    }

    static async fetchLastAssignedUser(strategy, keyValue, userIds, automationId) {
        if (!keyValue && strategy !== 'round_robin') {
            return null;
        }

        const query = db.knex('student_extra_info as sei')
            .join('students as s', 's.id', 'sei.student_id')
            .whereNotNull('sei.assigned_to')
            .where('sei.assigned_to', '>', 0)
            .orderBy('sei.assigned_on', 'desc')
            .orderBy('sei.id', 'desc')
            .select('sei.assigned_to');

        if (automationId) {
            query.where('sei.automation_id', Number(automationId));
        }

        if (Array.isArray(userIds) && userIds.length > 0) {
            query.whereIn('sei.assigned_to', userIds.map((v) => Number(v)).filter(Boolean));
        }

        if (strategy === 'country') {
            query.where('s.resident_country_id', keyValue);
        } else if (strategy === 'discipline') {
            query.where('s.discipline_id', keyValue);
        }

        const result = await query.first();
        return result?.assigned_to || null;
    }

    static async assignLead({ studentId, strategy, automationId, agentIds }, req) {
        if (!studentId) {
            throw new Error('Student ID required');
        }

        if (!['country', 'discipline', 'round_robin'].includes(strategy)) {
            throw new Error('Invalid assignment strategy');
        }

        const student = await db.knex('students')
            .select('id', 'resident_country_id', 'country_id', 'discipline_id')
            .where({ id: studentId })
            .first();

        if (!student) {
            throw new Error('Student not found');
        }

        const extra = await this.ensureStudentExtraInfo(studentId, req);
        if (extra?.assigned_to) {
            throw new Error('Lead already assigned');
        }

        let keyValue;
        let assignableUsers;
        if (strategy === 'country') {
            keyValue = student.resident_country_id || student.country_id;
            if (!keyValue) {
                throw new Error('Student does not have a country associated for assignment');
            }
            assignableUsers = await this.getAssignableUsers({ userIds: agentIds, countryId: keyValue });
        } else if (strategy === 'discipline') {
            keyValue = student.discipline_id;
            if (!keyValue) {
                throw new Error('Student does not have a discipline associated for assignment');
            }
            assignableUsers = await this.getAssignableUsers({ userIds: agentIds });
        } else {
            assignableUsers = await this.getAssignableUsers({ userIds: agentIds });
        }

        const lastUserId = await this.fetchLastAssignedUser(strategy, keyValue, agentIds, automationId);
        const nextUser = this.pickNextAssignee(assignableUsers, lastUserId);

        const assignmentData = {
            id: extra.id,
            student_id: studentId,
            assigned_to: nextUser.id,
            assigned_on: currentDT(),
            assigned_by: req.currentUser?.id || null,
            automation_id: automationId || null,
        };

        await db.save('student_extra_info', assignmentData, 1, req);

        return {
            student_id: studentId,
            assigned_to: {
                id: nextUser.id,
                name: nextUser.name,
                email: nextUser.email,
                mobile: nextUser.mobile,
                role_id: nextUser.role_id,
            },
            strategy,
        };
    }

    static assignLeadByCountry = async ({ studentId }, req) => {
        return this.assignLead({ studentId, strategy: 'country' }, req);
    }

    static assignLeadByDiscipline = async ({ studentId }, req) => {
        return this.assignLead({ studentId, strategy: 'discipline' }, req);
    }

    static async autoAssignLeadByAutomation({ studentId }, req) {
        const id = Number(studentId);
        if (!id) {
            throw new Error('Student ID required');
        }

        if (this._studentsHasRegisteredVia === null) {
            this._studentsHasRegisteredVia = db.knex.schema.hasColumn('students', 'registered_via');
        }
        if (this._studentsHasCourseId === null) {
            this._studentsHasCourseId = db.knex.schema.hasColumn('students', 'course_id');
        }

        const [hasRegisteredVia, hasCourseId] = await Promise.all([
            this._studentsHasRegisteredVia,
            this._studentsHasCourseId,
        ]);

        const student = await db.knex('students as s')
            .select([
                's.id',
                's.country_id',
                's.resident_country_id',
                's.discipline_id',
                ...(hasCourseId ? ['s.course_id'] : []),
                ...(hasRegisteredVia ? ['s.registered_via'] : []),
            ])
            .where('s.id', id)
            .first();

        if (!student) {
            throw new Error('Student not found');
        }

        const countryId = Number(student.resident_country_id || student.country_id || 0) || null;
        const disciplineId = Number(student.discipline_id || 0) || null;
        const courseId = hasCourseId ? (Number(student.course_id || 0) || null) : null;
        const registeredVia = hasRegisteredVia
            ? (student.registered_via ? String(student.registered_via) : 'Online')
            : 'Online';

        // Dataset visibility (does NOT assign)
        let datasetVisibility = null;
        try {
            datasetVisibility = await this.applyDatasetVisibilityByAutomation({ studentId: id }, req);
        } catch (e) {
            datasetVisibility = { applied: false, reason: e.message };
        }

        // IMPORTANT: If a Dataset automation matched, do not assign this lead.
        if (datasetVisibility && datasetVisibility.applied) {
            return {
                assigned: false,
                reason: 'Dataset visibility applied',
                dataset: datasetVisibility,
            };
        }

        const automation = await LeadAutomationService.findBestRoundRobinAutomationForStudent({
            countryId,
            disciplineId,
            courseId,
            registeredVia,
        });

        if (!automation?.id) {
            return { assigned: false, reason: 'No matching automation found', dataset: datasetVisibility };
        }

        const agentIds = await LeadAutomationService.getAutomationAgentIds(automation.id);
        if (!agentIds.length) {
            return { assigned: false, reason: 'No agents configured for matched automation', automation_id: automation.id, dataset: datasetVisibility };
        }

        try {
            const result = await this.assignLead(
                {
                    studentId: id,
                    strategy: 'round_robin',
                    automationId: automation.id,
                    agentIds,
                },
                req
            );

            return {
                assigned: true,
                automation_id: automation.id,
                dataset: datasetVisibility,
                ...result,
            };
        } catch (e) {
            return { assigned: false, reason: e.message, automation_id: automation.id, dataset: datasetVisibility };
        }
    }

    static _studentsHasRegisteredVia = null;
    static _studentsHasCourseId = null;

    static async normalizeAutoAssignCriteria({ criteria, automationId } = {}) {
        let merged = criteria || {};

        if (automationId) {
            const automation = await LeadAutomationService.getAutomationById(automationId);
            if (automation) {
                merged = {
                    ...merged,
                    registered_via: automation.registered_via || merged.registered_via,
                    discipline_id: automation.discipline_id || merged.discipline_id,
                    course_id: automation.course_id || merged.course_id,
                    filters_json: automation.filters_json || merged.filters_json,
                };
            }
        }

        const out = {
            country_ids: [],
            discipline_ids: [],
            course_ids: [],
            registered_via: [],
        };

        const filtersJson = (() => {
            const v = merged?.filters_json;
            if (!v) return null;
            if (typeof v === 'string') {
                try {
                    return JSON.parse(v);
                } catch (e) {
                    return null;
                }
            }
            return v;
        })();

        const countryIds = filtersJson?.country_ids || filtersJson?.countryIds || filtersJson?.country_id || [];
        if (Array.isArray(countryIds)) {
            out.country_ids = countryIds.map((v) => Number(v)).filter(Boolean);
        }

        const disciplineRaw = merged?.discipline_id;
        if (Array.isArray(disciplineRaw)) {
            out.discipline_ids = disciplineRaw.map((v) => Number(v)).filter(Boolean);
        } else if (typeof disciplineRaw === 'string' && disciplineRaw.includes(',')) {
            out.discipline_ids = disciplineRaw.split(',').map((v) => Number(String(v).trim())).filter(Boolean);
        } else if (disciplineRaw) {
            out.discipline_ids = [Number(disciplineRaw)].filter(Boolean);
        }

        const courseRaw = merged?.course_id;
        if (Array.isArray(courseRaw)) {
            out.course_ids = courseRaw.map((v) => Number(v)).filter(Boolean);
        } else if (typeof courseRaw === 'string' && courseRaw.includes(',')) {
            out.course_ids = courseRaw.split(',').map((v) => Number(String(v).trim())).filter(Boolean);
        } else if (courseRaw) {
            out.course_ids = [Number(courseRaw)].filter(Boolean);
        }

        const regViaRaw = merged?.registered_via;
        if (Array.isArray(regViaRaw)) {
            out.registered_via = regViaRaw.map((v) => String(v)).filter(Boolean);
        } else if (typeof regViaRaw === 'string') {
            out.registered_via = [regViaRaw].filter(Boolean);
        }

        return out;
    }

    static async filterStudentIdsByCriteria(studentIds, criteria) {
        const ids = Array.isArray(studentIds) ? studentIds.map((v) => Number(v)).filter(Boolean) : [];
        const countryIds = Array.isArray(criteria?.country_ids) ? criteria.country_ids.map((v) => Number(v)).filter(Boolean) : [];
        const disciplineIds = Array.isArray(criteria?.discipline_ids) ? criteria.discipline_ids.map((v) => Number(v)).filter(Boolean) : [];
        const courseIds = Array.isArray(criteria?.course_ids) ? criteria.course_ids.map((v) => Number(v)).filter(Boolean) : [];
        const registeredVia = Array.isArray(criteria?.registered_via) ? criteria.registered_via.map((v) => String(v)).filter(Boolean) : [];

        if (!ids.length) {
            return { allowedIds: [], rejected: new Map() };
        }

        if (this._studentsHasRegisteredVia === null) {
            this._studentsHasRegisteredVia = db.knex.schema.hasColumn('students', 'registered_via');
        }
        if (this._studentsHasCourseId === null) {
            this._studentsHasCourseId = db.knex.schema.hasColumn('students', 'course_id');
        }

        const [hasRegisteredVia, hasCourseId] = await Promise.all([
            this._studentsHasRegisteredVia,
            this._studentsHasCourseId,
        ]);

        const rows = await db.knex('students as s')
            .select([
                's.id',
                's.country_id',
                's.resident_country_id',
                's.discipline_id',
                ...(hasCourseId ? ['s.course_id'] : []),
                ...(hasRegisteredVia ? ['s.registered_via'] : []),
            ])
            .whereIn('s.id', ids);

        const rejected = new Map();
        const allowed = [];

        for (const sid of ids) {
            const r = rows.find((x) => Number(x.id) === Number(sid));
            if (!r) {
                rejected.set(sid, 'Student not found');
                continue;
            }

            const studentCountry = Number(r.resident_country_id || r.country_id || 0) || null;
            if (countryIds.length && (!studentCountry || !countryIds.includes(studentCountry))) {
                rejected.set(sid, 'Does not match country filter');
                continue;
            }

            const studentDiscipline = Number(r.discipline_id || 0) || null;
            if (disciplineIds.length && (!studentDiscipline || !disciplineIds.includes(studentDiscipline))) {
                rejected.set(sid, 'Does not match discipline filter');
                continue;
            }

            if (hasCourseId && courseIds.length) {
                const studentCourse = Number(r.course_id || 0) || null;
                if (!studentCourse || !courseIds.includes(studentCourse)) {
                    rejected.set(sid, 'Does not match course filter');
                    continue;
                }
            }

            if (hasRegisteredVia && registeredVia.length) {
                const rv = r.registered_via ? String(r.registered_via) : '';
                if (!rv || !registeredVia.includes(rv)) {
                    rejected.set(sid, 'Does not match registered_via filter');
                    continue;
                }
            }

            allowed.push(sid);
        }

        return { allowedIds: allowed, rejected };
    }

    static autoAssignLeads = async ({ studentIds, strategy, automationId, agentIds, criteria }, req) => {
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            throw new Error('student_ids array required');
        }

        const normalizedStrategy = strategy || 'country';
        if (!['country', 'discipline', 'round_robin'].includes(normalizedStrategy)) {
            throw new Error('Invalid assignment strategy');
        }

        const normalizedCriteria = await this.normalizeAutoAssignCriteria({ criteria, automationId });
        const { allowedIds, rejected } = await this.filterStudentIdsByCriteria(studentIds, normalizedCriteria);

        const results = [];

        for (const id of studentIds) {
            const parsedId = Number(id);
            if (rejected.has(parsedId)) {
                results.push({ success: false, student_id: parsedId || id, error: rejected.get(parsedId) });
                continue;
            }
        }

        for (const id of allowedIds) {
            try {
                const parsedId = Number(id);
                if (!parsedId) {
                    throw new Error('Invalid student ID');
                }
                const assignment = await this.assignLead({ studentId: parsedId, strategy: normalizedStrategy, automationId, agentIds }, req);
                results.push({ success: true, ...assignment });
            } catch (err) {
                results.push({ success: false, student_id: Number(id) || id, error: err.message });
            }
        }

        return {
            strategy: normalizedStrategy,
            total: studentIds.length,
            matched: allowedIds.length,
            filtered_out: rejected.size,
            assigned: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
            results,
        };
    }

    static async previewAssignLeads({ studentIds, strategy, agentIds, automationId, criteria }, req) {
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            throw new Error('student_ids array required');
        }

        const normalizedStrategy = strategy || 'country';
        if (!['country', 'round_robin'].includes(normalizedStrategy)) {
            throw new Error('Invalid preview strategy');
        }

        const userIds = Array.isArray(agentIds) ? agentIds.map((v) => Number(v)).filter(Boolean) : [];
        if (!userIds.length) {
            throw new Error('agent_ids required');
        }

        const normalizedCriteria = await this.normalizeAutoAssignCriteria({ criteria, automationId });
        const { allowedIds } = await this.filterStudentIdsByCriteria(studentIds, normalizedCriteria);
        const ids = allowedIds.map((v) => Number(v)).filter(Boolean);
        const rows = await db.knex('students as s')
            .select(
                's.id',
                's.resident_country_id',
                's.country_id',
                'sei.assigned_to'
            )
            .leftJoin('student_extra_info as sei', 'sei.student_id', 's.id')
            .whereIn('s.id', ids);

        const idToRow = new Map(rows.map((r) => [Number(r.id), r]));

        const unassigned = [];
        const alreadyAssigned = [];
        for (const sid of ids) {
            const r = idToRow.get(sid);
            if (!r) {
                continue;
            }
            if (r.assigned_to && Number(r.assigned_to) > 0) {
                alreadyAssigned.push(sid);
            } else {
                unassigned.push({
                    id: sid,
                    countryId: Number(r.resident_country_id || r.country_id || 0) || null,
                });
            }
        }

        const perUser = {};
        const perCountry = {};

        const userCache = new Map();
        const lastCache = new Map();

        const getUsersFor = async (countryId) => {
            const key = countryId ? `c:${countryId}` : 'all';
            if (userCache.has(key)) {
                return userCache.get(key);
            }
            const users = await this.getAssignableUsers({ userIds, countryId });
            userCache.set(key, users);
            return users;
        };

        const getLastFor = async (countryId) => {
            const key = countryId ? `c:${countryId}` : 'all';
            if (lastCache.has(key)) {
                return lastCache.get(key);
            }
            const last = await this.fetchLastAssignedUser(
                normalizedStrategy === 'country' ? 'country' : 'round_robin',
                normalizedStrategy === 'country' ? countryId : undefined,
                userIds,
                automationId
            );
            lastCache.set(key, last);
            return last;
        };

        for (const s of unassigned) {
            const countryId = normalizedStrategy === 'country' ? s.countryId : null;
            if (normalizedStrategy === 'country' && !countryId) {
                continue;
            }

            const users = await getUsersFor(countryId);
            let lastUserId = await getLastFor(countryId);
            const nextUser = this.pickNextAssignee(users, lastUserId);

            if (normalizedStrategy === 'country') {
                if (!perCountry[countryId]) {
                    perCountry[countryId] = {};
                }
                perCountry[countryId][nextUser.id] = (perCountry[countryId][nextUser.id] || 0) + 1;
            } else {
                perUser[nextUser.id] = (perUser[nextUser.id] || 0) + 1;
            }

            lastCache.set(countryId ? `c:${countryId}` : 'all', nextUser.id);
        }

        return {
            strategy: normalizedStrategy,
            total: ids.length,
            unassigned: unassigned.length,
            already_assigned: alreadyAssigned.length,
            per_user: perUser,
            per_country: perCountry,
        };
    }

    static async listStudentCommunications(req) {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            const err = new Error('Only super admin can access student communications list');
            err.status = 403;
            throw err;
        }

        const { p, ps, k, sender, master_session_id } = req.query || {};
        const keyword = typeof k === 'string' ? k.trim() : '';
        const senderFilter = typeof sender === 'string' ? sender.trim() : '';
        const sessionId = master_session_id ? Number(master_session_id) : 0;

        // Check if campaign_message_logs has created_at column, otherwise use sent_at
        let campaignCreatedColumn = 'sent_at'; // Default to sent_at since that's the actual column
        try {
            const hasCreatedAt = await db.knex.schema.hasColumn("campaign_message_logs", "created_at");
            if (hasCreatedAt) {
                campaignCreatedColumn = 'created_at';
            } else {
                const hasCreated = await db.knex.schema.hasColumn("campaign_message_logs", "created");
                if (hasCreated) {
                    campaignCreatedColumn = 'created';
                }
            }
        } catch (e) {
            // Default to 'sent_at' if check fails
        }

        const emailAgg = db.knex('student_sent_emails')
            .select('student_id')
            .count('* as email_count')
            .max('created as last_email_at')
            .groupBy('student_id')
            .as('ec');

        const whatsappAgg = db.knex('leads_sent_whatsapp')
            .select(db.knex.raw('lead_id as student_id'))
            .count('* as whatsapp_count')
            .max('created as last_whatsapp_at')
            .groupBy('lead_id')
            .as('wc');

        // Add campaign communications aggregation
        const campaignEmailAgg = db.knex('campaign_message_logs as cml')
            .select([
                'cr.student_id',
                db.knex.raw('count(*) as campaign_email_count'),
                db.knex.raw(`max(cml.${campaignCreatedColumn}) as last_campaign_email_at`)
            ])
            .leftJoin('campaign_recipients as cr', 'cr.id', 'cml.campaign_recipient_id')
            .leftJoin('campaigns as c', 'c.id', 'cml.campaign_id')
            .where('c.type', 'email')
            .groupBy('cr.student_id')
            .as('cec');

        const campaignWhatsappAgg = db.knex('campaign_message_logs as cml')
            .select([
                'cr.student_id',
                db.knex.raw('count(*) as campaign_whatsapp_count'),
                db.knex.raw(`max(cml.${campaignCreatedColumn}) as last_campaign_whatsapp_at`)
            ])
            .leftJoin('campaign_recipients as cr', 'cr.id', 'cml.campaign_recipient_id')
            .leftJoin('campaigns as c', 'c.id', 'cml.campaign_id')
            .where('c.type', 'whatsapp')
            .groupBy('cr.student_id')
            .as('cwc');
        // Get last sender information (including campaign senders)
        const lastEmailSender = db.knex.raw(`
            (SELECT 
                student_id,
                sender_name as last_email_sender_name,
                sender_email as last_email_sender_email,
                created_at as last_email_at
            FROM (
                SELECT 
                    student_id,
                    sender_name,
                    sender_email,
                    created_at,
                    ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
                FROM (
                    SELECT 
                        sse.student_id as student_id,
                        u.name COLLATE utf8mb4_unicode_ci as sender_name,
                        u.email COLLATE utf8mb4_unicode_ci as sender_email,
                        sse.created as created_at
                    FROM student_sent_emails sse
                    LEFT JOIN users u ON u.id = sse.created_by
                    
                    UNION ALL
                    
                    SELECT 
                        cr.student_id as student_id,
                        c.sender_name COLLATE utf8mb4_unicode_ci as sender_name,
                        c.sender_email COLLATE utf8mb4_unicode_ci as sender_email,
                        cml.` + campaignCreatedColumn + ` as created_at
                    FROM campaign_message_logs cml
                    LEFT JOIN campaign_recipients cr ON cr.id = cml.campaign_recipient_id
                    LEFT JOIN campaigns c ON c.id = cml.campaign_id
                    WHERE c.type = 'email'
                ) combined
            ) ranked
            WHERE rn = 1) as les
        `);

        const lastWhatsappSender = db.knex.raw(`
            (SELECT 
                student_id,
                sender_name as last_whatsapp_sender_name,
                sender_email as last_whatsapp_sender_email,
                created_at as last_whatsapp_at
            FROM (
                SELECT 
                    student_id,
                    sender_name,
                    sender_email,
                    created_at,
                    ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
                FROM (
                    SELECT 
                        lsw.lead_id as student_id,
                        u.name COLLATE utf8mb4_unicode_ci as sender_name,
                        u.email COLLATE utf8mb4_unicode_ci as sender_email,
                        lsw.created as created_at
                    FROM leads_sent_whatsapp lsw
                    LEFT JOIN users u ON u.id = lsw.created_by
                    
                    UNION ALL
                    
                    SELECT 
                        cr.student_id as student_id,
                        COALESCE(c.sender_name, 'Campaign') COLLATE utf8mb4_unicode_ci as sender_name,
                        c.sender_email COLLATE utf8mb4_unicode_ci as sender_email,
                        cml.` + campaignCreatedColumn + ` as created_at
                    FROM campaign_message_logs cml
                    LEFT JOIN campaign_recipients cr ON cr.id = cml.campaign_recipient_id
                    LEFT JOIN campaigns c ON c.id = cml.campaign_id
                    WHERE c.type = 'whatsapp'
                ) combined
            ) ranked
            WHERE rn = 1) as lws
        `);

        const query = db.knex('students as s')
            .select([
                's.id',
                's.regno',
                's.user_id',
                's.agent_id',
                's.created',
                's.updated',
                'u.name as student_name',
                'u.email as student_email',
                'u.mobile as student_mobile',
                db.knex.raw('COALESCE(ec.email_count, 0) + COALESCE(cec.campaign_email_count, 0) as email_count'),
                db.knex.raw('COALESCE(wc.whatsapp_count, 0) + COALESCE(cwc.campaign_whatsapp_count, 0) as whatsapp_count'),
                db.knex.raw(`
                    GREATEST(
                        COALESCE(ec.last_email_at, '1970-01-01'),
                        COALESCE(wc.last_whatsapp_at, '1970-01-01'),
                        COALESCE(cec.last_campaign_email_at, '1970-01-01'),
                        COALESCE(cwc.last_campaign_whatsapp_at, '1970-01-01')
                    ) as last_communication_at
                `),
                db.knex.raw(`
                    CASE 
                        WHEN GREATEST(
                            COALESCE(ec.last_email_at, '1970-01-01'),
                            COALESCE(cec.last_campaign_email_at, '1970-01-01')
                        ) > GREATEST(
                            COALESCE(wc.last_whatsapp_at, '1970-01-01'),
                            COALESCE(cwc.last_campaign_whatsapp_at, '1970-01-01')
                        )
                        THEN les.last_email_sender_name
                        ELSE lws.last_whatsapp_sender_name
                    END as last_sender_name
                `),
                db.knex.raw(`
                    CASE 
                        WHEN GREATEST(
                            COALESCE(ec.last_email_at, '1970-01-01'),
                            COALESCE(cec.last_campaign_email_at, '1970-01-01')
                        ) > GREATEST(
                            COALESCE(wc.last_whatsapp_at, '1970-01-01'),
                            COALESCE(cwc.last_campaign_whatsapp_at, '1970-01-01')
                        )
                        THEN les.last_email_sender_email
                        ELSE lws.last_whatsapp_sender_email
                    END as last_sender_email
                `)
            ])
            .leftJoin('users as u', 'u.id', 's.user_id')
            .leftJoin(emailAgg, 'ec.student_id', 's.id')
            .leftJoin(whatsappAgg, 'wc.student_id', 's.id')
            .leftJoin(campaignEmailAgg, 'cec.student_id', 's.id')
            .leftJoin(campaignWhatsappAgg, 'cwc.student_id', 's.id')
            .leftJoin(lastEmailSender, 'les.student_id', 's.id')
            .leftJoin(lastWhatsappSender, 'lws.student_id', 's.id')
            .where((qb) => {
                qb.whereNotNull('ec.email_count')
                    .orWhereNotNull('wc.whatsapp_count')
                    .orWhereNotNull('cec.campaign_email_count')
                    .orWhereNotNull('cwc.campaign_whatsapp_count');
            });

        if (sessionId) {
            query.andWhere('s.master_session_id', sessionId);
        }

        if (keyword) {
            query.andWhere((qb) => {
                qb.where('s.regno', 'like', `%${keyword}%`)
                    .orWhere('u.name', 'like', `%${keyword}%`)
                    .orWhere('u.email', 'like', `%${keyword}%`)
                    .orWhere('u.mobile', 'like', `%${keyword}%`);
            });
        }

        if (senderFilter) {
            query.andWhere((qb) => {
                qb.whereRaw(`
                    EXISTS (
                        SELECT 1 FROM student_sent_emails sse2 
                        LEFT JOIN users u2 ON u2.id = sse2.created_by 
                        WHERE sse2.student_id = s.id AND u2.name LIKE ?
                    ) OR EXISTS (
                        SELECT 1 FROM leads_sent_whatsapp lsw2 
                        LEFT JOIN users u3 ON u3.id = lsw2.created_by 
                        WHERE lsw2.lead_id = s.id AND u3.name LIKE ?
                    ) OR EXISTS (
                        SELECT 1 FROM campaign_message_logs cml2
                        LEFT JOIN campaign_recipients cr2 ON cr2.id = cml2.campaign_recipient_id
                        LEFT JOIN campaigns c2 ON c2.id = cml2.campaign_id
                        WHERE cr2.student_id = s.id AND (c2.sender_name LIKE ? OR c2.sender_email LIKE ?)
                    )
                `, [`%${senderFilter}%`, `%${senderFilter}%`, `%${senderFilter}%`, `%${senderFilter}%`]);
            });
        }

        query.orderBy('last_communication_at', 'desc').orderBy('s.id', 'desc');

        const result = await db.pagedRows(query, p, ps || 20);
        result.data = (result.data || []).map((row) => ({
            ...row,
            email_count: Number(row.email_count || 0),
            whatsapp_count: Number(row.whatsapp_count || 0),
        }));

        // Get list of senders for filter dropdown (including campaign senders)
        const senders = await db.knex.raw(`
            SELECT DISTINCT sender_name as name, sender_email as email 
            FROM (
                SELECT DISTINCT u.name COLLATE utf8mb4_unicode_ci as sender_name, u.email COLLATE utf8mb4_unicode_ci as sender_email
                FROM student_sent_emails sse
                LEFT JOIN users u ON u.id = sse.created_by
                WHERE u.name IS NOT NULL
                
                UNION
                
                SELECT DISTINCT u.name COLLATE utf8mb4_unicode_ci as sender_name, u.email COLLATE utf8mb4_unicode_ci as sender_email
                FROM leads_sent_whatsapp lsw
                LEFT JOIN users u ON u.id = lsw.created_by
                WHERE u.name IS NOT NULL
                
                UNION
                
                SELECT DISTINCT c.sender_name COLLATE utf8mb4_unicode_ci as sender_name, c.sender_email COLLATE utf8mb4_unicode_ci as sender_email
                FROM campaigns c
                WHERE c.sender_name IS NOT NULL
            ) as all_senders
            WHERE sender_name IS NOT NULL
            ORDER BY sender_name
        `);

        result.senders = (senders[0] || []).map(s => ({ name: s.name, email: s.email }));

        return result;
    }

    static async getStudentCommunications(studentId, req) {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            const err = new Error('Only super admin can view student communications');
            err.status = 403;
            throw err;
        }

        const id = Number(studentId);
        if (!id) {
            throw new Error('Valid student_id required');
        }

        // Check if campaign_message_logs has created_at column, otherwise use sent_at
        let campaignCreatedColumn = 'sent_at'; // Default to sent_at since that's the actual column
        try {
            const hasCreatedAt = await db.knex.schema.hasColumn("campaign_message_logs", "created_at");
            if (hasCreatedAt) {
                campaignCreatedColumn = 'created_at';
            } else {
                const hasCreated = await db.knex.schema.hasColumn("campaign_message_logs", "created");
                if (hasCreated) {
                    campaignCreatedColumn = 'created';
                }
            }
        } catch (e) {
            // Default to 'sent_at' if check fails
        }

        const student = await db.knex('students as s')
            .select([
                's.id',
                's.regno',
                's.agent_id',
                's.user_id',
                's.country_id',
                's.gender_id',
                's.ac_id',
                's.discipline_id',
                's.dob',
                's.father_name',
                's.mother_name',
                's.resident_address',
                's.resident_country_id',
                's.resident_state',
                's.resident_city',
                's.mobile_verified',
                's.email_verified',
                's.mobile_verified_on',
                's.email_verified_on',
                's.next_followup_date',
                's.next_followup_date_inst',
                's.last_followup_id',
                's.basic_info_date',
                's.background_info_date',
                's.course_choice_date',
                's.edu_info_date',
                's.doc_uploaded_on',
                's.doc_uploaded_by',
                's.doc_verified_on',
                's.doc_verified_by',
                's.master_session_id',
                's.created',
                's.updated',
                's.created_by',
                's.updated_by',
                'u.name as student_name',
                'u.email as student_email',
                'u.mobile as student_mobile',
                'u.status as user_status',
                'mc.name as country_name',
                'mrc.name as resident_country_name',
                'md.name as discipline_name'
            ])
            .leftJoin('users as u', 'u.id', 's.user_id')
            .leftJoin('master_countries as mc', 'mc.id', 's.country_id')
            .leftJoin('master_countries as mrc', 'mrc.id', 's.resident_country_id')
            .leftJoin('master_disciplines as md', 'md.id', 's.discipline_id')
            .where('s.id', id)
            .first();

        if (!student) {
            const err = new Error('Student not found');
            err.status = 404;
            throw err;
        }

        const emails = await db.knex.raw(`
            SELECT * FROM (
                SELECT 
                    sse.id,
                    sse.institute_id,
                    sse.email_to,
                    sse.cc,
                    sse.subject,
                    sse.body,
                    sse.created,
                    sse.created_by,
                    creator.name COLLATE utf8mb4_unicode_ci as created_by_name,
                    creator.email COLLATE utf8mb4_unicode_ci as sent_by_email,
                    inst.name COLLATE utf8mb4_unicode_ci as institute_name,
                    'individual' as source_type,
                    NULL as campaign_name
                FROM student_sent_emails sse
                LEFT JOIN users creator ON creator.id = sse.created_by
                LEFT JOIN institutes inst ON inst.id = sse.institute_id
                WHERE sse.student_id = ?
                
                UNION ALL
                
                SELECT 
                    cml.id,
                    NULL as institute_id,
                    u.email COLLATE utf8mb4_unicode_ci as email_to,
                    NULL as cc,
                    COALESCE(et.subject, c.name) COLLATE utf8mb4_unicode_ci as subject,
                    cml.message_body COLLATE utf8mb4_unicode_ci as body,
                    cml.` + campaignCreatedColumn + ` as created,
                    NULL as created_by,
                    COALESCE(c.sender_name, 'Campaign') COLLATE utf8mb4_unicode_ci as created_by_name,
                    c.sender_email COLLATE utf8mb4_unicode_ci as sent_by_email,
                    NULL as institute_name,
                    'campaign' as source_type,
                    c.name COLLATE utf8mb4_unicode_ci as campaign_name
                FROM campaign_message_logs cml
                LEFT JOIN campaign_recipients cr ON cr.id = cml.campaign_recipient_id
                LEFT JOIN campaigns c ON c.id = cml.campaign_id
                LEFT JOIN email_templates et ON et.id = c.template_id
                LEFT JOIN students s ON s.id = cr.student_id
                LEFT JOIN users u ON u.id = s.user_id
                WHERE cr.student_id = ? AND c.type = 'email'
            ) combined_emails
            ORDER BY created DESC
        `, [id, id]);

        const whatsapps = await db.knex.raw(`
            SELECT * FROM (
                SELECT 
                    lsw.id,
                    lsw.institute_id,
                    lsw.msg COLLATE utf8mb4_unicode_ci as msg,
                    lsw.created,
                    lsw.created_by,
                    creator.name COLLATE utf8mb4_unicode_ci as created_by_name,
                    creator.email COLLATE utf8mb4_unicode_ci as sent_by_email,
                    creator.mobile COLLATE utf8mb4_unicode_ci as sent_by_mobile,
                    inst.name COLLATE utf8mb4_unicode_ci as institute_name,
                    'individual' as source_type,
                    NULL as campaign_name
                FROM leads_sent_whatsapp lsw
                LEFT JOIN users creator ON creator.id = lsw.created_by
                LEFT JOIN institutes inst ON inst.id = lsw.institute_id
                WHERE lsw.lead_id = ?
                
                UNION ALL
                
                SELECT 
                    cml.id,
                    NULL as institute_id,
                    cml.message_body COLLATE utf8mb4_unicode_ci as msg,
                    cml.` + campaignCreatedColumn + ` as created,
                    NULL as created_by,
                    COALESCE(c.sender_name, 'Campaign') COLLATE utf8mb4_unicode_ci as created_by_name,
                    c.sender_email COLLATE utf8mb4_unicode_ci as sent_by_email,
                    NULL as sent_by_mobile,
                    NULL as institute_name,
                    'campaign' as source_type,
                    c.name COLLATE utf8mb4_unicode_ci as campaign_name
                FROM campaign_message_logs cml
                LEFT JOIN campaign_recipients cr ON cr.id = cml.campaign_recipient_id
                LEFT JOIN campaigns c ON c.id = cml.campaign_id
                WHERE cr.student_id = ? AND c.type = 'whatsapp'
            ) combined_whatsapps
            ORDER BY created DESC
        `, [id, id]);

        return {
            student,
            emails: emails[0] || [],
            whatsapps: whatsapps[0] || []
        };
    }

    static async getAssignedLeads({
        studentId,
        assignedTo,
        countryId,
        disciplineId,
        strategy,
        automationId,
        page,
        pageSize,
    }) {
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
                'sei.automation_id',
                'au.name as assignee_name',
                'au.email as assignee_email',
                'au.mobile as assignee_mobile',
                'au.role_id as assignee_role_id',
                'mc.name as resident_country_name',
                'md.name as discipline_name'
            )
            .innerJoin('students as s', 's.id', 'sei.student_id')
            .innerJoin('users as su', 'su.id', 's.user_id')
            .leftJoin('users as au', 'au.id', 'sei.assigned_to')
            .leftJoin('master_countries as mc', 'mc.id', 's.resident_country_id')
            .leftJoin('master_disciplines as md', 'md.id', 's.discipline_id')
            .whereNotNull('sei.assigned_to');

        if (studentId) {
            query.where('s.id', studentId);
        }

        if (assignedTo) {
            query.where('sei.assigned_to', assignedTo);
        }

        if (automationId) {
            query.where('sei.automation_id', automationId);
        }

        if (countryId) {
            query.whereRaw('COALESCE(s.resident_country_id, s.country_id) = ?', [countryId]);
        }

        if (disciplineId) {
            query.where('s.discipline_id', disciplineId);
        }

        if (strategy === 'country') {
            query.whereNotNull('s.resident_country_id');
        } else if (strategy === 'discipline') {
            query.whereNotNull('s.discipline_id');
        }

        query.where('sei.assigned_to', '>', 0);
        query.orderBy('sei.assigned_on', 'desc').orderBy('sei.id', 'desc');

        return db.pagedRows(query, page, pageSize);
    }

    static async getStudentsList(req) {
        const { isClient, isInstitute, institute_id, id: currentUserId, leads_show_type, isAgent } = req.currentUser || {};

        let visibilityEnabled = false;
        if (currentUserId) {
            try {
                await this.ensureStudentVisibilityTable();
                visibilityEnabled = true;
            } catch (e) {
                visibilityEnabled = false;
            }
        }

        // Extract parameters (merging query and body)
        const {
            p = 1,
            ps = 100,
            from,
            to,
            k = '',
            gender_id,
            country_id,
            ac_id,
            discipline_id,
            student_status,
            email_verify,
            mob_verify,
            basic_info,
            edu_info,
            doc_uploaded,
            doc_verified,
            background_info,
            assigned_to,
            choice_filling,
            payment_proof,
            session,
            agent_user_id,
            master_session_id
        } = { ...(req.query || {}), ...(req.body || {}) };

        const emailAgg = db.knex('student_sent_emails')
            .select('student_id')
            .count('* as sent_email_count')
            .groupBy('student_id')
            .as('ec');

        const whatsappAgg = db.knex('leads_sent_whatsapp')
            .select(db.knex.raw('lead_id as student_id'))
            .count('* as sent_whatsapp_count')
            .groupBy('lead_id')
            .as('wc');

        const followupCfg = await this.getFollowupAggConfig();
        const followupAgg = followupCfg
            ? db.knex(followupCfg.table)
                .select(db.knex.raw(`${followupCfg.idColumn} as student_id`))
                .count('* as followup_count')
                .groupBy(followupCfg.idColumn)
                .as('fc')
            : null;

        // Issues count aggregation
        const issuesAgg = db.knex('student_issues')
            .select('student_id')
            .count('* as issues_count')
            .groupBy('student_id')
            .as('ic');

        // Base query
        let query = db.knex('students as s')
            .select([
                's.id',
                's.regno',
                's.user_id',
                's.dob',
                's.mobile_verified',
                's.email_verified',
                's.mobile_verified_on',
                's.email_verified_on',
                's.created',
                's.next_followup_date',
                's.next_followup_date_inst',
                's.basic_info_date',
                's.background_info_date',
                's.course_choice_date',
                's.edu_info_date',
                's.doc_uploaded_on',
                's.doc_verified_on',
                's.country_id',
                's.gender_id',
                's.father_name',
                's.mother_name',
                's.resident_address',
                's.resident_country_id',
                's.resident_state',
                's.resident_city',
                's.ac_id',
                's.discipline_id',
                'sei.assigned_to',
                'sei.assigned_on',
                'sei.assigned_by',
                'sei.automation_id',
                'u.fname',
                'u.lname',
                'u.name',
                'u.email',
                'u.mobile',
                'u.status',
                'u.isd_code_country_id',
                'mg.name as gender',
                'mc.name as country',
                'mc.isd_code',
                'mrc.name as resident_country',
                'mac.name as acad_career',
                'md.name as discipline',
                'au.name as assigned_to_name',
                db.knex.raw('COALESCE(ec.sent_email_count, 0) as sent_email_count'),
                db.knex.raw('COALESCE(wc.sent_whatsapp_count, 0) as sent_whatsapp_count'),
                db.knex.raw('COALESCE(ic.issues_count, 0) as issues_count'),
                // Add student_letters fields for letter status
                db.knex.raw('MAX(sl.admission_letter) as admission_letter'),
                db.knex.raw('MAX(sl.admission_letter_fileid) as admission_letter_fileid'),
                db.knex.raw('MAX(sl.visa_letter) as visa_letter'),
                db.knex.raw('MAX(sl.visa_letter_fileid) as visa_letter_fileid'),
                // Get offer_letter_file_id from student_choice_fillings
                db.knex.raw('MAX(scf_agg.offer_letter_file_id) as offer_letter_file_id'),
                ...(followupAgg ? [db.knex.raw('COALESCE(fc.followup_count, 0) as followup_count')] : [])
            ])
            .leftJoin('users as u', 'u.id', 's.user_id')
            .leftJoin('student_extra_info as sei', 'sei.student_id', 's.id')
            .modify((qb) => {
                // Join visibility only for the current user (so it doesn't multiply rows)
                if (visibilityEnabled && currentUserId) {
                    qb.leftJoin('student_visibility as sv', function () {
                        this.on('sv.student_id', '=', 's.id').andOn('sv.user_id', '=', db.knex.raw('?', [Number(currentUserId)]));
                    });
                }
            })
            .leftJoin('master_genders as mg', 'mg.id', 's.gender_id')
            .leftJoin('master_countries as mc', 'mc.id', 's.country_id')
            .leftJoin('master_countries as mrc', 'mrc.id', 's.resident_country_id')
            .leftJoin('master_acad_careers as mac', 'mac.id', 's.ac_id')
            .leftJoin('master_disciplines as md', 'md.id', 's.discipline_id')
            .leftJoin('users as au', 'au.id', 'sei.assigned_to')
            .leftJoin(emailAgg, 'ec.student_id', 's.id')
            .leftJoin(whatsappAgg, 'wc.student_id', 's.id')
            .leftJoin(issuesAgg, 'ic.student_id', 's.id')
            .modify((qb) => {
                if (followupAgg) qb.leftJoin(followupAgg, 'fc.student_id', 's.id');
            })
            // Join student_letters to get admission and visa letter info
            .leftJoin('student_letters as sl', 'sl.student_id', 's.id')
            // Join student_choice_fillings to get offer_letter_file_id (using subquery to avoid row multiplication)
            .leftJoin(
                db.knex('student_choice_fillings')
                    .select('student_id')
                    .max('offer_letter_file_id as offer_letter_file_id')
                    .groupBy('student_id')
                    .as('scf_agg'),
                'scf_agg.student_id',
                's.id'
            )
            .where('u.status', 1)
            .groupBy('s.id'); // Group by student ID to handle multiple letter records

        // Institute filter for institute users
        if (isInstitute && institute_id) {
            query = query.whereExists(function () {
                this.select('*')
                    .from('student_choice_fillings as scf')
                    .join('institute_courses as ic', 'ic.id', 'scf.institute_course_id')
                    .whereRaw('scf.student_id = s.id')
                    .where('ic.institute_id', institute_id);
            });
        }

        // Agent filter - ALWAYS show only students registered by this agent
        // Agents should only see their own students regardless of session or other filters
        // Only super admins (isClient) can see all students
        if (agent_user_id) {
            // When agent_user_id is explicitly provided in query params, use it
            query = query.where((qb) => {
                qb.where('s.agent_id', agent_user_id)
                  .orWhere('sei.assigned_to', agent_user_id);
            });
        } else if (isAgent && currentUserId && !isClient) {
            // If user is an agent, always filter by their agent_id or assignment
            query = query.where((qb) => {
                qb.where('s.agent_id', currentUserId)
                  .orWhere('sei.assigned_to', currentUserId);
            });
        }

        // Session filter - prioritize master_session_id over session parameter
        if (master_session_id) {
            // Direct session ID provided (highest priority)
            const sessionId = parseInt(master_session_id);
            if (sessionId) {
                query = query.where('s.master_session_id', sessionId);
            }
        } else if (session) {
            // Legacy session parameter (session name or ID)
            let sessionId = null;
            if (/^\d+$/.test(session)) {
                sessionId = parseInt(session);
            } else {
                const yearMatch = session.match(/(\d{4})-(\d{4})/);
                if (yearMatch) {
                    const [, startYear, endYear] = yearMatch;
                    const sessionInfo = await db.knex("master_session")
                        .select(['id'])
                        .whereRaw('YEAR(session_startdt) = ?', [startYear])
                        .whereRaw('YEAR(session_enddt) = ?', [endYear])
                        .first();
                    sessionId = sessionInfo?.id;
                }
            }
            if (sessionId) {
                query = query.where('s.master_session_id', sessionId);
            }
        }

        // Date range filter
        if (from || to) {
            if (from) {
                query = query.where('s.created', '>=', from);
            }
            if (to) {
                query = query.where('s.created', '<=', to + ' 23:59:59');
            }
        }

        // Keyword search
        if (k && k.trim()) {
            const keyword = k.trim();
            query = query.where((qb) => {
                qb.where('s.regno', 'like', `%${keyword}%`)
                    .orWhere('u.name', 'like', `%${keyword}%`)
                    .orWhere('u.email', 'like', `%${keyword}%`)
                    .orWhere('u.mobile', 'like', `%${keyword}%`);
            });
        }

        // Other filters
        if (gender_id) {
            query = query.where('s.gender_id', gender_id);
        }

        if (country_id && Array.isArray(country_id) && country_id.length > 0) {
            query = query.whereIn('s.country_id', country_id);
        }

        if (ac_id && Array.isArray(ac_id) && ac_id.length > 0) {
            query = query.whereIn('s.ac_id', ac_id);
        }

        if (discipline_id && Array.isArray(discipline_id) && discipline_id.length > 0) {
            query = query.whereIn('s.discipline_id', discipline_id);
        }

        // Student status filter (ONLINE/OFFLINE via registered_via column)
        if (student_status && Array.isArray(student_status) && student_status.length > 0) {
            const normalizedStatuses = student_status.map(s => String(s).toUpperCase());
            query = query.whereIn(db.knex.raw('UPPER(s.registered_via)'), normalizedStatuses);
        }

        if (email_verify === 'Verified') {
            query = query.where('s.email_verified', 1);
        } else if (email_verify === 'Not Verified') {
            query = query.where('s.email_verified', 0);
        }

        if (mob_verify === 'Verified') {
            query = query.where('s.mobile_verified', 1);
        } else if (mob_verify === 'Not Verified') {
            query = query.where('s.mobile_verified', 0);
        }

        if (basic_info === 'Yes') {
            query = query.whereNotNull('s.basic_info_date');
        } else if (basic_info === 'No') {
            query = query.whereNull('s.basic_info_date');
        }

        if (edu_info === 'Yes') {
            query = query.whereNotNull('s.edu_info_date');
        } else if (edu_info === 'No') {
            query = query.whereNull('s.edu_info_date');
        }

        if (doc_uploaded === 'Yes') {
            query = query.whereNotNull('s.doc_uploaded_on');
        } else if (doc_uploaded === 'No') {
            query = query.whereNull('s.doc_uploaded_on');
        }

        if (doc_verified === 'Yes') {
            query = query.whereNotNull('s.doc_verified_on');
        } else if (doc_verified === 'No') {
            query = query.whereNull('s.doc_verified_on');
        }

        if (background_info === 'Yes') {
            query = query.whereNotNull('s.background_info_date');
        } else if (background_info === 'No') {
            query = query.whereNull('s.background_info_date');
        }

        // Determine effective assigned_to based on role
        let effectiveAssignedTo = assigned_to;

        // Apply automation-based filters for users with lead allocations
        // This ensures counsellors only see students matching their automation criteria
        if (currentUserId && !isClient && !isInstitute) {

            // Get user's automation filters
            const userAutomations = await db.knex('lead_assign_automations as la')
                .join('lead_assign_automation_agents as laa', 'laa.automation_id', 'la.id')
                .select(['la.id', 'la.name', 'la.filters_json', 'la.strategy', 'la.registered_via', 'la.discipline_id', 'la.course_id'])
                .where('laa.agent_id', currentUserId)
                .where('la.status', 1);

            if (userAutomations && userAutomations.length > 0) {
                // Collect all filter criteria from user's automations
                const userCountries = new Set();
                const userDisciplines = new Set();
                const userStatuses = new Set();
                const userCourses = new Set();

                for (const auto of userAutomations) {

                    try {
                        // Parse filters_json
                        const filters = auto.filters_json
                            ? (typeof auto.filters_json === 'string' ? JSON.parse(auto.filters_json) : auto.filters_json)
                            : {};

                        // Extract country filters from filters_json
                        const countryIds = filters.country_ids || filters.country_id || filters.countryIds;
                        if (Array.isArray(countryIds)) {
                            countryIds.forEach(id => userCountries.add(Number(id)));
                        } else if (countryIds) {
                            userCountries.add(Number(countryIds));
                        }

                        // Extract discipline filters from BOTH filters_json AND discipline_id column
                        const disciplineIdsFromJson = filters.discipline_ids || filters.discipline_id || filters.disciplineIds;
                        if (Array.isArray(disciplineIdsFromJson)) {
                            disciplineIdsFromJson.forEach(id => userDisciplines.add(Number(id)));
                        } else if (disciplineIdsFromJson) {
                            userDisciplines.add(Number(disciplineIdsFromJson));
                        }

                        // Also check discipline_id column (may be comma-separated or array)
                        if (auto.discipline_id) {
                            const disciplineIdsFromColumn = Array.isArray(auto.discipline_id)
                                ? auto.discipline_id
                                : String(auto.discipline_id).split(',').map(s => s.trim()).filter(Boolean);
                            disciplineIdsFromColumn.forEach(id => userDisciplines.add(Number(id)));
                        }

                        // Extract course filters from BOTH filters_json AND course_id column
                        const courseIdsFromJson = filters.course_ids || filters.course_id || filters.courseIds;
                        if (Array.isArray(courseIdsFromJson)) {
                            courseIdsFromJson.forEach(id => userCourses.add(Number(id)));
                        } else if (courseIdsFromJson) {
                            userCourses.add(Number(courseIdsFromJson));
                        }

                        // Also check course_id column
                        if (auto.course_id) {
                            const courseIdsFromColumn = Array.isArray(auto.course_id)
                                ? auto.course_id
                                : String(auto.course_id).split(',').map(s => s.trim()).filter(Boolean);
                            courseIdsFromColumn.forEach(id => userCourses.add(Number(id)));
                        }

                        // Extract registered_via (student_status) from BOTH filters_json AND registered_via column
                        const registeredViaFromJson = filters.registered_via || filters.student_status;
                        if (Array.isArray(registeredViaFromJson)) {
                            registeredViaFromJson.forEach(s => userStatuses.add(String(s).toUpperCase()));
                        } else if (registeredViaFromJson) {
                            userStatuses.add(String(registeredViaFromJson).toUpperCase());
                        }

                        // Also check registered_via column (may be comma-separated)
                        if (auto.registered_via) {
                            const rv = String(auto.registered_via).split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                            rv.forEach(s => userStatuses.add(s));
                        }
                    } catch (e) {
                        // Error parsing automation filters
                    }
                }

                // Apply filters if any were found
                // Only apply if NOT explicitly overridden by request parameters
                if (userCountries.size > 0 && !country_id) {
                    const countryArray = Array.from(userCountries);
                    query = query.whereIn('s.country_id', countryArray);
                }

                if (userDisciplines.size > 0 && !discipline_id) {
                    const disciplineArray = Array.from(userDisciplines);
                    query = query.whereIn('s.discipline_id', disciplineArray);
                }

                if (userStatuses.size > 0 && !student_status) {
                    const statusArray = Array.from(userStatuses);
                    query = query.whereIn(db.knex.raw('UPPER(s.registered_via)'), statusArray);
                }

                // Note: Course filter is optional and may not be used in all cases
                // Uncomment if you want to apply course filter
                // if (userCourses.size > 0) {
                //     const courseArray = Array.from(userCourses);
                //     query = query.whereIn('s.course_id', courseArray);
                // }
            }
        }

        // If role is ASSIGNED, force only their own leads but also allow dataset-visible leads.
        // IMPORTANT: Skip this restriction only for CLIENT type users WITHOUT a role_id (super admins)
        // Users with role_id (counsellors, normal admins) should follow their role's leads_show_type
        const isSuperAdmin = isClient && !req.currentUser?.role_id;

        if (leads_show_type === 'ASSIGNED' && currentUserId && !isSuperAdmin) {
            effectiveAssignedTo = currentUserId;
            if (visibilityEnabled) {
                query = query.where((qb) => {
                    qb.where('sei.assigned_to', Number(effectiveAssignedTo))
                        .orWhereNotNull('sv.user_id');
                });
            } else {
                query = query.where('sei.assigned_to', Number(effectiveAssignedTo));
            }
        } else if (effectiveAssignedTo) {
            if (visibilityEnabled && currentUserId && Number(effectiveAssignedTo) === Number(currentUserId)) {
                query = query.where((qb) => {
                    qb.where('sei.assigned_to', Number(effectiveAssignedTo))
                        .orWhereNotNull('sv.user_id');
                });
            } else {
                query = query.where('sei.assigned_to', effectiveAssignedTo);
            }
        }

        // Enhanced choice_filling filter with new status options
        if (choice_filling) {
            if (['Ins_Accepted', 'Ins_Rejected', 'offer_Pending', 'offer_Uploaded', 'Stu_Accepted', 'Stu_Rejected', 'Choice_Filled', 'Choice_Not_Filled'].includes(choice_filling)) {
                if (choice_filling === 'Ins_Accepted') {
                    query = query.whereExists(function () {
                        this.select('*')
                            .from('student_choice_fillings as scf')
                            .whereRaw('scf.student_id = s.id')
                            .where('scf.ins_status', 'Accepted');
                    });
                } else if (choice_filling === 'Ins_Rejected') {
                    query = query.whereExists(function () {
                        this.select('*')
                            .from('student_choice_fillings as scf')
                            .whereRaw('scf.student_id = s.id')
                            .where('scf.ins_status', 'Rejected');
                    });
                } else if (choice_filling === 'offer_Pending') {
                    query = query.whereExists(function () {
                        this.select('*')
                            .from('student_choice_fillings as scf')
                            .whereRaw('scf.student_id = s.id')
                            .where('scf.ins_status', 'Accepted')
                            .whereNull('scf.offer_letter_file_id');
                    });
                } else if (choice_filling === 'offer_Uploaded') {
                    query = query.whereExists(function () {
                        this.select('*')
                            .from('student_choice_fillings as scf')
                            .whereRaw('scf.student_id = s.id')
                            .whereNotNull('scf.offer_letter_file_id');
                    });
                } else if (choice_filling === 'Stu_Accepted') {
                    query = query.whereExists(function () {
                        this.select('*')
                            .from('student_choice_fillings as scf')
                            .whereRaw('scf.student_id = s.id')
                            .where('scf.stu_status', 'Accepted');
                    });
                } else if (choice_filling === 'Stu_Rejected') {
                    query = query.whereExists(function () {
                        this.select('*')
                            .from('student_choice_fillings as scf')
                            .whereRaw('scf.student_id = s.id')
                            .where('scf.stu_status', 'Rejected');
                    });
                }
            } else if (choice_filling === 'Yes') {
                query = query.whereNotNull('s.course_choice_date');
            } else if (choice_filling === 'No') {
                query = query.whereNull('s.course_choice_date');
            }
        }

        if (payment_proof) {
            if (['Pending', 'Uploaded', 'Acknowledged', 'Rejected'].includes(payment_proof)) {
                query = query.whereExists(function () {
                    this.select('*')
                        .from('student_choice_fillings as scf')
                        .whereRaw('scf.student_id = s.id')
                        .where('scf.payment_status', payment_proof);
                });
            }
        }

        // Order by creation date (newest first)
        query = query.orderBy('s.created', 'desc');

        // Execute paginated query
        const result = await db.pagedRows(query, p, ps);

        // Process the results to add additional computed fields
        if (result.data && Array.isArray(result.data)) {
            result.data = result.data.map(row => ({
                ...row,
                dead_on: null, // Add dead_on field as null since it's expected by frontend but doesn't exist in DB
                utm: null, // Add utm field as null since it's expected by frontend but doesn't exist in students table
                agent: null, // Add agent field as null since it's expected by frontend
                ipdata: null, // Add ipdata field as null since it's expected by frontend
                image: null, // Add image field as null since it doesn't exist in users table
                client_id: 1, // Add default client_id since it's expected by frontend
                sent_email_count: Number(row.sent_email_count || 0), // Preserve computed sent_email_count
                sent_whatsapp_count: Number(row.sent_whatsapp_count || 0), // Preserve computed sent_whatsapp_count
                followup_count: Number(row.followup_count || 0),
                issues_count: Number(row.issues_count || 0), // Preserve computed issues_count
                payment_status: 'Pending', // Add default payment_status
                completion_per: this.calculateCompletionPercentage(row),
                auto_login_url: `${process.env.FRONTEND_URL}/login?key=${Buffer.from(JSON.stringify({ id: row.id, type: 'student' })).toString('base64')}`,
                image_url: '' // Set empty since image doesn't exist
            }));
        }

        return result;
    }

    static calculateCompletionPercentage(student) {
        let completed = 0;
        const total = 5; // Total steps: basic_info, edu_info, doc_uploaded, doc_verified, background_info

        if (student.basic_info_date) completed++;
        if (student.edu_info_date) completed++;
        if (student.doc_uploaded_on) completed++;
        if (student.doc_verified_on) completed++;
        if (student.background_info_date) completed++;

        return Math.round((completed / total) * 100);
    }

    static async getStudentCountByFilters(filters = {}) {
        const {
            country_id,
            discipline_id,
            course_id,
            registered_via
        } = filters;

        let query = db.knex('students as s')
            .select([
                db.knex.raw('COUNT(s.id) as total_count')
            ])
            .leftJoin('users as u', 'u.id', 's.user_id')
            .where('u.status', 1);

        // Apply filters based on actual table columns
        if (country_id && Array.isArray(country_id) && country_id.length > 0) {
            query = query.whereIn('s.country_id', country_id);
        }

        if (discipline_id && Array.isArray(discipline_id) && discipline_id.length > 0) {
            query = query.whereIn('s.discipline_id', discipline_id);
        }

        // Skip course_id and registered_via filters for now since these columns don't exist
        // These can be added later when the database structure is updated

        const result = await query.first();
        return Number(result?.total_count || 0);
    }

    /**
     * Apply dataset visibility for a specific user retroactively
     * This ensures new users can see past students that match their automation criteria
     */
    static async applyVisibilityForUser(userId, req) {
        const uid = Number(userId);
        if (!uid) {
            throw new Error('Valid user_id required');
        }

        await this.ensureStudentVisibilityTable();

        // Get all Dataset automations for this user
        const automations = await LeadAutomationService.listDatasetAutomationsForUser(uid);

        if (!automations || automations.length === 0) {
            return {
                success: true,
                user_id: uid,
                automations_found: 0,
                students_processed: 0,
                visibility_created: 0,
                message: 'No dataset automations found for this user'
            };
        }

        let totalStudentsProcessed = 0;
        let totalVisibilityCreated = 0;
        const automationResults = [];

        // Check if columns exist
        if (this._studentsHasRegisteredVia === null) {
            this._studentsHasRegisteredVia = db.knex.schema.hasColumn('students', 'registered_via');
        }
        if (this._studentsHasCourseId === null) {
            this._studentsHasCourseId = db.knex.schema.hasColumn('students', 'course_id');
        }

        const [hasRegisteredVia, hasCourseId] = await Promise.all([
            this._studentsHasRegisteredVia,
            this._studentsHasCourseId,
        ]);

        const createdBy = req?.currentUser?.id || null;
        const updatedBy = req?.currentUser?.id || null;

        // Process each automation
        for (const automation of automations) {
            const crit = LeadAutomationService.normalizeAutomationCriteria(automation);

            const countryIds = Array.from(new Set(crit.country_ids || [])).filter(Boolean);
            const disciplineIds = Array.from(new Set(crit.discipline_ids || [])).filter(Boolean);
            const courseIds = Array.from(new Set(crit.course_ids || [])).filter(Boolean);

            // Dataset automations should have at least country or discipline
            if (!countryIds.length && !disciplineIds.length) {
                continue;
            }

            // Build query to find matching students
            let studentQuery = db.knex('students as s')
                .select(['s.id'])
                .leftJoin('users as u', 'u.id', 's.user_id')
                .where('u.status', 1);

            // Apply country filter
            if (countryIds.length) {
                studentQuery = studentQuery.where((qb) => {
                    qb.whereIn('s.country_id', countryIds)
                        .orWhereIn('s.resident_country_id', countryIds);
                });
            }

            // Apply discipline filter
            if (disciplineIds.length) {
                studentQuery = studentQuery.whereIn('s.discipline_id', disciplineIds);
            }

            // Apply course filter if column exists
            if (hasCourseId && courseIds.length) {
                studentQuery = studentQuery.where((qb) => {
                    qb.whereIn('s.course_id', courseIds)
                        .orWhereNull('s.course_id')
                        .orWhere('s.course_id', 0);
                });
            }

            // Exclude students that already have visibility for this user
            studentQuery = studentQuery.whereNotExists(function () {
                this.select('*')
                    .from('student_visibility as sv')
                    .whereRaw('sv.student_id = s.id')
                    .where('sv.user_id', uid);
            });

            const matchingStudents = await studentQuery;
            const studentCount = matchingStudents.length;
            totalStudentsProcessed += studentCount;

            if (studentCount === 0) {
                automationResults.push({
                    automation_id: automation.id,
                    automation_name: automation.name || `Automation ${automation.id}`,
                    students_matched: 0,
                    visibility_created: 0
                });
                continue;
            }

            // Create visibility entries in batches
            let visibilityCreated = 0;
            const batchSize = 1000;

            for (let i = 0; i < matchingStudents.length; i += batchSize) {
                const batch = matchingStudents.slice(i, i + batchSize);
                const insertData = batch.map(s => ({
                    student_id: s.id,
                    user_id: uid,
                    automation_id: automation.id,
                    created: db.knex.fn.now(),
                    updated: db.knex.fn.now(),
                    created_by: createdBy,
                    updated_by: updatedBy
                }));

                try {
                    await db.knex('student_visibility').insert(insertData);
                    visibilityCreated += insertData.length;
                } catch (e) {
                    // Handle duplicate entries gracefully
                    const code = e && (e.code || e.errno);
                    if (code === 'ER_DUP_ENTRY' || code === 1062) {
                        // Try inserting one by one to skip duplicates
                        for (const data of insertData) {
                            try {
                                await db.knex('student_visibility').insert(data);
                                visibilityCreated++;
                            } catch (dupError) {
                                // Skip duplicate
                            }
                        }
                    } else {
                        throw e;
                    }
                }
            }

            totalVisibilityCreated += visibilityCreated;
            automationResults.push({
                automation_id: automation.id,
                automation_name: automation.name || `Automation ${automation.id}`,
                students_matched: studentCount,
                visibility_created: visibilityCreated
            });
        }

        return {
            success: true,
            user_id: uid,
            automations_found: automations.length,
            students_processed: totalStudentsProcessed,
            visibility_created: totalVisibilityCreated,
            automation_details: automationResults,
            message: `Successfully applied visibility for ${totalVisibilityCreated} students across ${automations.length} automations`
        };
    }

    /**
     * Apply dataset visibility for all users with Dataset automations
     * Useful for one-time fix or periodic sync
     */
    static async applyVisibilityForAllUsers(req) {
        await this.ensureStudentVisibilityTable();

        // Get all active users with CLIENT type
        const users = await db.knex('users')
            .select(['id', 'name', 'email'])
            .where('type', 'CLIENT')
            .where('status', 1);

        if (!users || users.length === 0) {
            return {
                success: true,
                users_processed: 0,
                total_visibility_created: 0,
                message: 'No active CLIENT users found'
            };
        }

        const results = [];
        let totalVisibilityCreated = 0;
        let usersWithAutomations = 0;

        for (const user of users) {
            try {
                const result = await this.applyVisibilityForUser(user.id, req);

                if (result.automations_found > 0) {
                    usersWithAutomations++;
                }

                totalVisibilityCreated += result.visibility_created;

                results.push({
                    user_id: user.id,
                    user_name: user.name,
                    user_email: user.email,
                    success: true,
                    automations_found: result.automations_found,
                    visibility_created: result.visibility_created
                });
            } catch (e) {
                results.push({
                    user_id: user.id,
                    user_name: user.name,
                    user_email: user.email,
                    success: false,
                    error: e.message
                });
            }
        }

        return {
            success: true,
            users_processed: users.length,
            users_with_automations: usersWithAutomations,
            total_visibility_created: totalVisibilityCreated,
            user_details: results,
            message: `Processed ${users.length} users, created ${totalVisibilityCreated} visibility entries`
        };
    }

    /**
     * Get visibility statistics for a user
     */
    static async getVisibilityStats(userId) {
        const uid = Number(userId);
        if (!uid) {
            throw new Error('Valid user_id required');
        }

        await this.ensureStudentVisibilityTable();

        // Get count of visible students via dataset
        const visibilityCount = await db.knex('student_visibility')
            .where('user_id', uid)
            .count('* as count')
            .first();

        // Get count of assigned students
        const assignedCount = await db.knex('student_extra_info')
            .where('assigned_to', uid)
            .count('* as count')
            .first();

        // Get automations for this user
        const automations = await LeadAutomationService.listDatasetAutomationsForUser(uid);

        // Get breakdown by automation
        const breakdownByAutomation = await db.knex('student_visibility as sv')
            .select([
                'sv.automation_id',
                'la.name as automation_name',
                db.knex.raw('COUNT(*) as student_count')
            ])
            .leftJoin('lead_assign_automations as la', 'la.id', 'sv.automation_id')
            .where('sv.user_id', uid)
            .groupBy('sv.automation_id', 'la.name');

        return {
            user_id: uid,
            dataset_visible_students: Number(visibilityCount?.count || 0),
            assigned_students: Number(assignedCount?.count || 0),
            total_visible_students: Number(visibilityCount?.count || 0) + Number(assignedCount?.count || 0),
            active_automations: automations.length,
            breakdown_by_automation: breakdownByAutomation
        };
    }


}

module.exports = StudentService;