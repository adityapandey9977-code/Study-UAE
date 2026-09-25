const db = require("../libraries/db");

class LeadAutomationService {

    static normalizeStrategyValue(strategy, registeredVia) {
        const s = (strategy === null || typeof strategy === 'undefined') ? '' : String(strategy).trim().toLowerCase();
        
        // Convert DB values to UI values
        // country -> dataset, discipline -> round_robin
        if (s === 'country') return 'dataset';
        if (s === 'discipline') return 'round_robin';
        if (s) return s;

        // Backfill for legacy rows where DB rejected strategy and stored empty.
        // Heuristic: dataset automations were allowed to omit registered_via.
        const rv = (registeredVia === null || typeof registeredVia === 'undefined') ? '' : String(registeredVia).trim();
        if (!rv) return 'dataset'; // treat as Dataset (legacy stored as country)

        return 'round_robin';
    }

    static normalizeStrategyClass(strategy, registeredVia) {
        const normalized = this.normalizeStrategyValue(strategy, registeredVia);
        if (normalized === 'dataset' || normalized === 'country') return 'dataset';
        if (normalized === 'round_robin' || normalized === 'discipline') return 'round_robin';
        return normalized;
    }
    static normalizeIdList(value) {
        if (!value) return [];
        if (Array.isArray(value)) {
            return value.map((v) => Number(v)).filter(Boolean);
        }
        if (typeof value === 'string') {
            const s = String(value).trim();

            // Handle JSON array strings like "[1,2,3]" or "[\"1\",\"2\"]"
            if (s.startsWith('[') && s.endsWith(']')) {
                try {
                    const parsed = JSON.parse(s);
                    if (Array.isArray(parsed)) {
                        return parsed.map((v) => Number(v)).filter(Boolean);
                    }
                } catch (e) {
                    // fall through
                }
            }

            if (value.includes(',')) {
                return value
                    .split(',')
                    .map((v) => Number(String(v).trim()))
                    .filter(Boolean);
            }
            return [Number(value)].filter(Boolean);
        }
        if (typeof value === 'object') {
            // Some drivers can return JSON columns as objects
            if (Array.isArray(value)) {
                return value.map((v) => Number(v)).filter(Boolean);
            }
        }
        return [Number(value)].filter(Boolean);
    }

    static normalizeStringList(value) {
        if (!value) return [];
        if (Array.isArray(value)) {
            return value.map((v) => String(v).trim()).filter(Boolean);
        }
        if (typeof value === 'string') {
            if (value.includes(',')) {
                return value
                    .split(',')
                    .map((v) => String(v).trim())
                    .filter(Boolean);
            }
            return [String(value).trim()].filter(Boolean);
        }
        return [String(value).trim()].filter(Boolean);
    }

    static parseFiltersJson(filtersJson) {
        if (!filtersJson) return null;
        if (typeof filtersJson === 'string') {
            try {
                const once = JSON.parse(filtersJson);

                // Handle legacy/double-encoded JSON ("{...}")
                if (typeof once === 'string') {
                    try {
                        return JSON.parse(once);
                    } catch (e2) {
                        return null;
                    }
                }

                return once;
            } catch (e) {
                return null;
            }
        }
        return filtersJson;
    }

    static normalizeAutomationCriteria(automationRow) {
        const filters = this.parseFiltersJson(automationRow?.filters_json);
        const countryIds = this.normalizeIdList(
            filters?.country_ids || filters?.countryIds || filters?.country_id
        );

        const registeredViaRaw = (filters && (filters.registered_via || filters.registered_via_list))
            ? (filters.registered_via || filters.registered_via_list)
            : automationRow?.registered_via;

        return {
            country_ids: countryIds,
            discipline_ids: this.normalizeIdList(filters?.discipline_ids || automationRow?.discipline_id),
            course_ids: this.normalizeIdList(filters?.course_ids || automationRow?.course_id),
            registered_via: this.normalizeStringList(registeredViaRaw).map((v) => v.toLowerCase()),
        };
    }

    static hydrateAutomationDisplayFields(row) {
        if (!row) return row;
        const filters = this.parseFiltersJson(row.filters_json);
        if (filters && Array.isArray(filters.registered_via) && filters.registered_via.length) {
            row.registered_via = filters.registered_via.join(',');
        }
        return row;
    }

    static async getAutomationAgentIds(automationId) {
        const id = Number(automationId);
        if (!id) return [];
        const rows = await db.knex('lead_assign_automation_agents')
            .select(['agent_id'])
            .where({ automation_id: id });
        return (rows || []).map((r) => Number(r.agent_id)).filter(Boolean);
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

    static async backfillDatasetVisibilityForAutomation(automationId, req) {
        const id = Number(automationId);
        if (!id) return { applied: false, reason: 'Invalid automation id' };

        const automation = await db.knex('lead_assign_automations')
            .select(['id', 'strategy', 'registered_via', 'discipline_id', 'course_id', 'filters_json', 'status'])
            .where('id', id)
            .first();

        if (!automation) return { applied: false, reason: 'Automation not found' };

        const strategyClass = this.normalizeStrategyClass(automation.strategy, automation.registered_via);
        if (strategyClass !== 'dataset') return { applied: false, reason: 'Not a dataset automation' };
        if (Number(automation.status) !== 1) return { applied: false, reason: 'Automation is not active' };

        const agentIds = await this.getAutomationAgentIds(id);
        if (!agentIds.length) return { applied: false, reason: 'No agents configured for dataset automation' };

        await this.ensureStudentVisibilityTable();

        const crit = this.normalizeAutomationCriteria(automation);
        const countryIds = Array.from(new Set(crit.country_ids || [])).map((v) => Number(v)).filter(Boolean);
        const disciplineIds = Array.from(new Set(crit.discipline_ids || [])).map((v) => Number(v)).filter(Boolean);
        const courseIds = Array.from(new Set(crit.course_ids || [])).map((v) => Number(v)).filter(Boolean);

        if (!countryIds.length || !disciplineIds.length) {
            return { applied: false, reason: 'Dataset automation requires country and discipline filters for backfill' };
        }

        const hasCourseId = await db.knex.schema.hasColumn('students', 'course_id');
        const createdBy = req?.currentUser?.id || null;
        const updatedBy = req?.currentUser?.id || null;

        let lastId = 0;
        const pageSize = 500;
        let insertedBatches = 0;

        while (true) {
            let q = db.knex('students as s')
                .select(['s.id'])
                .where('s.id', '>', lastId)
                .whereIn('s.discipline_id', disciplineIds)
                .whereIn(db.knex.raw('COALESCE(s.resident_country_id, s.country_id)'), countryIds)
                .orderBy('s.id', 'asc')
                .limit(pageSize);

            if (hasCourseId && courseIds.length) {
                q = q.andWhere((qb) => {
                    qb.whereIn('s.course_id', courseIds).orWhereNull('s.course_id').orWhere('s.course_id', 0);
                });
            }

            const students = await q;
            if (!students || !students.length) break;

            lastId = Number(students[students.length - 1]?.id || lastId);

            const pairs = [];
            for (const s of students) {
                const sid = Number(s?.id);
                if (!sid) continue;
                for (const uid of agentIds) {
                    const userId = Number(uid);
                    if (!userId) continue;
                    pairs.push([sid, userId]);
                }
            }

            if (!pairs.length) continue;

            const chunkSize = 1000;
            for (let i = 0; i < pairs.length; i += chunkSize) {
                const chunk = pairs.slice(i, i + chunkSize);
                const placeholders = chunk.map(() => '(?,?,?,NOW(),NOW(),?,?)').join(',');
                const bindings = [];
                for (const [sid, uid] of chunk) {
                    bindings.push(sid, uid, id, createdBy, updatedBy);
                }

                await db.knex.raw(
                    `INSERT IGNORE INTO student_visibility (student_id, user_id, automation_id, created, updated, created_by, updated_by) VALUES ${placeholders}`,
                    bindings
                );
                insertedBatches++;
            }
        }

        return { applied: true, automation_id: id, user_ids: agentIds, batches: insertedBatches };
    }

    static async listDatasetAutomationsForUser(userId) {
        const uid = Number(userId);
        if (!uid) return [];

        // Backward compatible: earlier versions stored Dataset as `country`.
        return db
            .knex('lead_assign_automations as la')
            .select([
                'la.id',
                'la.strategy',
                'la.registered_via',
                'la.discipline_id',
                'la.course_id',
                'la.filters_json',
                'la.status',
                'la.priority',
                'la.created',
            ])
            .join('lead_assign_automation_agents as laa', 'laa.automation_id', 'la.id')
            .where('la.status', 1)
            .where('laa.agent_id', uid)
            .where((qb) => {
                qb.where('la.strategy', 'dataset').orWhere('la.strategy', 'country');
            })
            .orderBy('la.priority', 'asc')
            .orderBy('la.id', 'desc');
    }

    static async findBestDatasetAutomationForStudent({
        countryId,
        disciplineId,
        courseId,
        registeredVia,
    } = {}) {
        const cId = countryId ? Number(countryId) : null;
        const dId = disciplineId ? Number(disciplineId) : null;
        const crsId = courseId ? Number(courseId) : null;
        const rv = registeredVia ? String(registeredVia).trim().toLowerCase() : null;

        const rows = await db
            .knex('lead_assign_automations as la')
            .select([
                'la.id',
                'la.strategy',
                'la.registered_via',
                'la.discipline_id',
                'la.course_id',
                'la.filters_json',
                'la.status',
                'la.priority',
                'la.created',
            ])
            .where('la.status', 1)
            .where((qb) => {
                qb.where('la.strategy', 'dataset').orWhere('la.strategy', 'country');
            })
            .orderBy('la.priority', 'asc')
            .orderBy('la.id', 'desc');

        for (const row of rows || []) {
            const crit = this.normalizeAutomationCriteria(row);

            if (crit.country_ids.length) {
                if (!cId || !crit.country_ids.includes(cId)) {
                    continue;
                }
            }

            if (crit.discipline_ids.length) {
                if (!dId || !crit.discipline_ids.includes(dId)) {
                    continue;
                }
            }

            if (crit.course_ids.length) {
                if (crsId && !crit.course_ids.includes(crsId)) {
                    continue;
                }
            }

            // Dataset visibility should not be channel-dependent. Ignore registered_via criteria here.

            return row;
        }

        return null;
    }

    static async findBestRoundRobinAutomationForStudent({
        countryId,
        disciplineId,
        courseId,
        registeredVia,
    } = {}) {
        const cId = countryId ? Number(countryId) : null;
        const dId = disciplineId ? Number(disciplineId) : null;
        const crsId = courseId ? Number(courseId) : null;
        const rv = registeredVia ? String(registeredVia).trim().toLowerCase() : null;

        const rows = await db
            .knex('lead_assign_automations as la')
            .select([
                'la.id',
                'la.strategy',
                'la.registered_via',
                'la.discipline_id',
                'la.course_id',
                'la.filters_json',
                'la.status',
                'la.priority',
            ])
            .where('la.status', 1)
            .where((qb) => {
                // Backward compatible:
                // - new UI stores Round Robin as `discipline`
                // - older builds stored Round Robin as `round_robin`
                // - some legacy rows had NULL/empty strategy
                qb.whereIn('la.strategy', ['round_robin', 'discipline'])
                    .orWhereNull('la.strategy')
                    .orWhere('la.strategy', '');
            })
            .orderBy('la.priority', 'asc')
            .orderBy('la.id', 'desc');

        for (const row of rows || []) {
            // Defensive: If strategy is NULL/empty, ensure we don't accidentally treat Dataset rows as RR.
            // This also ensures DB values like `discipline` are correctly recognized as round robin.
            const strategyClass = this.normalizeStrategyClass(row?.strategy, row?.registered_via);
            if (strategyClass !== 'round_robin') {
                continue;
            }

            const crit = this.normalizeAutomationCriteria(row);

            if (crit.country_ids.length) {
                if (!cId || !crit.country_ids.includes(cId)) {
                    continue;
                }
            }

            if (crit.discipline_ids.length) {
                if (!dId || !crit.discipline_ids.includes(dId)) {
                    continue;
                }
            }

            if (crit.course_ids.length) {
                // If student doesn't have a course yet (common in registration flow), don't block matching.
                // Only enforce course match when a student course is present.
                if (crsId && !crit.course_ids.includes(crsId)) {
                    continue;
                }
            }

            if (crit.registered_via.length) {
                if (!rv || !crit.registered_via.includes(rv)) {
                    continue;
                }
            }

            return row;
        }

        return null;
    }

    static async listAutomations({ page, pageSize, search, status }) {
        const q = db.knex('lead_assign_automations as la')
            .select([
                'la.id',
                'la.name',
                'la.strategy',
                'la.registered_via',
                'la.discipline_id',
                'md.name as discipline_name',
                'la.course_id',
                'la.filters_json',
                'la.status',
                'la.priority',
                'la.created',
                'la.updated',
            ])
            .leftJoin('master_disciplines as md', 'md.id', 'la.discipline_id');

        if (typeof status !== 'undefined' && status !== null && status !== '') {
            q.where('la.status', Number(status));
        }
        if (search && String(search).trim()) {
            const s = String(search).trim();
            q.andWhere((qb) => {
                qb.where('la.name', 'like', `%${s}%`);
            });
        }

        q.orderBy('la.priority', 'asc').orderBy('la.id', 'desc');

        const result = await db.pagedRows(q, page, pageSize);
        const rows = result?.data || [];
        if (!rows.length) return result;

        for (const row of rows) {
            row.strategy = this.normalizeStrategyValue(row.strategy, row.registered_via);
            this.hydrateAutomationDisplayFields(row);
        }

        const disciplineIdsByRow = new Map();
        const allDisciplineIds = new Set();
        for (const row of rows) {
            const crit = this.normalizeAutomationCriteria(row);
            const ids = Array.from(new Set(crit?.discipline_ids || [])).filter(Boolean);
            disciplineIdsByRow.set(row.id, ids);
            for (const id of ids) allDisciplineIds.add(Number(id));
        }

        if (allDisciplineIds.size) {
            const masterRows = await db.knex('master_disciplines')
                .select(['id', 'name'])
                .whereIn('id', Array.from(allDisciplineIds));

            const nameById = new Map((masterRows || []).map((r) => [Number(r.id), r.name]));

            for (const row of rows) {
                const ids = disciplineIdsByRow.get(row.id) || [];
                if (ids.length) {
                    row.discipline_name = ids
                        .map((id) => nameById.get(Number(id)) || String(id))
                        .filter(Boolean)
                        .join(', ');
                }
            }
        }

        return { ...result, data: rows };
    }

    static async getAutomationById(id) {
        const row = await db.knex('lead_assign_automations as la')
            .select([
                'la.id', 'la.name', 'la.strategy', 'la.registered_via',
                'la.discipline_id', 'md.name as discipline_name',
                'la.course_id', 'la.status', 'la.filters_json', 'la.priority',
                'la.description', 'la.created', 'la.created_by', 'la.updated', 'la.updated_by'
            ])
            .leftJoin('master_disciplines as md', 'md.id', 'la.discipline_id')
            .where('la.id', Number(id))
            .first();

        if (!row) return null;

        row.strategy = this.normalizeStrategyValue(row.strategy, row.registered_via);
        this.hydrateAutomationDisplayFields(row);

        const agents = await db.knex('lead_assign_automation_agents as laa')
            .select([
                'u.id', 'u.name', 'u.email', 'u.mobile', 'u.role_id'
            ])
            .leftJoin('users as u', 'u.id', 'laa.agent_id')
            .where('laa.automation_id', row.id)
            .orderBy('u.name', 'asc');

        return { ...row, agents };
    }

    static async createAutomation(data, req) {
        const { agents = [], ...automationData } = data;
        const agentIds = Array.isArray(agents)
            ? agents
                .map((a) => (a && typeof a === 'object' ? a.id : a))
                .map((v) => Number(v))
                .filter(Boolean)
            : [];

        const created = await db.knex.transaction(async (trx) => {
            try {
                const incomingFilters = this.parseFiltersJson(automationData.filters_json);
                const incomingCountries = Array.from(new Set(this.normalizeIdList(
                    incomingFilters?.country_ids || incomingFilters?.countryIds || incomingFilters?.country_id
                ))).sort((a, b) => a - b);
                const incomingDisciplines = Array.from(
                    new Set(this.normalizeIdList(incomingFilters?.discipline_ids || automationData.discipline_id))
                ).sort((a, b) => a - b);

                const incomingStrategyClass = this.normalizeStrategyClass(
                    automationData.strategy,
                    automationData.registered_via
                );

                if (incomingCountries.length && incomingDisciplines.length) {
                    const existing = await trx('lead_assign_automations')
                        .select(['id', 'strategy', 'registered_via', 'discipline_id', 'filters_json'])
                        .whereNotNull('filters_json');

                    const incomingKey = `${incomingStrategyClass}|${incomingCountries.join(',')}|${incomingDisciplines.join(',')}`;
                    for (const row of existing || []) {
                        const crit = this.normalizeAutomationCriteria(row);
                        if (!crit.country_ids.length || !crit.discipline_ids.length) continue;
                        const rowCountries = Array.from(new Set(crit.country_ids)).sort((a, b) => a - b);
                        const rowDisciplines = Array.from(new Set(crit.discipline_ids)).sort((a, b) => a - b);

                        const rowStrategyClass = this.normalizeStrategyClass(
                            row?.strategy,
                            row?.registered_via
                        );
                        const rowKey = `${rowStrategyClass}|${rowCountries.join(',')}|${rowDisciplines.join(',')}`;
                        if (rowKey === incomingKey) {
                            throw new Error('Automation with these details is already created');
                        }
                    }
                }

                // Prepare automation data for database
                const dbData = {
                    ...automationData,
                    // Ensure filters_json is properly stringified for database storage
                    filters_json: automationData.filters_json
                        ? (typeof automationData.filters_json === 'string'
                            ? automationData.filters_json
                            : JSON.stringify(automationData.filters_json))
                        : null,
                    created: db.knex.fn.now(),
                    updated: db.knex.fn.now(),
                    created_by: req.currentUser?.id || 0,
                    updated_by: req.currentUser?.id || 0
                };

                // Save the automation
                const [automationId] = await trx('lead_assign_automations').insert(dbData);

                // Save agents
                if (agentIds.length > 0) {
                    const agentInserts = agentIds.map((agentId) => ({
                        automation_id: automationId,
                        agent_id: agentId
                    }));
                    await trx('lead_assign_automation_agents').insert(agentInserts);
                }

                // Get the full automation with agents
                const automation = await trx('lead_assign_automations')
                    .where('id', automationId)
                    .first();

                const agentList = await trx('lead_assign_automation_agents')
                    .where('automation_id', automationId)
                    .select('agent_id');

                return {
                    ...automation,
                    agents: agentList.map(a => a.agent_id)
                };
            } catch (error) {
                console.error('Error in createAutomation transaction:', error);
                throw error;
            }
        });

        try {
            const strategyClass = this.normalizeStrategyClass(created?.strategy, created?.registered_via);
            if (strategyClass === 'dataset' && Number(created?.status) === 1) {
                await this.backfillDatasetVisibilityForAutomation(created.id, req);
            }
        } catch (e) {
            console.error('Error backfilling dataset visibility:', e);
        }

        return created;
    }

    static async updateAutomation(id, data, req) {
        const { agents = [], ...automationData } = data;
        const agentIds = Array.isArray(agents)
            ? agents
                .map((a) => (a && typeof a === 'object' ? a.id : a))
                .map((v) => Number(v))
                .filter(Boolean)
            : [];

        console.log('updateAutomation - Raw data received:', data); // Debug log

        // Start a transaction
        return await db.knex.transaction(async (trx) => {
            try {
                // Prepare automation data for database
                const dbData = {
                    ...automationData,
                    // Ensure filters_json is properly stringified for database storage
                    filters_json: automationData.filters_json
                        ? (typeof automationData.filters_json === 'string'
                            ? automationData.filters_json
                            : JSON.stringify(automationData.filters_json))
                        : null,
                    updated: db.knex.fn.now(),
                    updated_by: req.currentUser?.id || 0
                };

                console.log('updateAutomation - Prepared dbData:', dbData); // Debug log
                console.log('updateAutomation - filters_json type:', typeof dbData.filters_json); // Debug log

                // Update the automation
                await trx('lead_assign_automations')
                    .where('id', Number(id))
                    .update(dbData);

                // Delete existing agents
                await trx('lead_assign_automation_agents')
                    .where('automation_id', Number(id))
                    .del();

                // Save new agents
                if (agentIds.length > 0) {
                    const agentInserts = agentIds.map((agentId) => ({
                        automation_id: Number(id),
                        agent_id: agentId
                    }));
                    await trx('lead_assign_automation_agents').insert(agentInserts);
                }

                // Get the updated automation with agents
                const automation = await trx('lead_assign_automations')
                    .where('id', Number(id))
                    .first();

                const agentList = await trx('lead_assign_automation_agents')
                    .where('automation_id', Number(id))
                    .select('agent_id');

                return {
                    ...automation,
                    agents: agentList.map(a => a.agent_id)
                };
            } catch (error) {
                console.error('Error in updateAutomation transaction:', error);
                throw error;
            }
        });
    }

    static async deleteAutomation(id) {
        // Start a transaction
        return await db.knex.transaction(async (trx) => {
            try {
                // Delete agents first (foreign key constraint)
                await trx('lead_assign_automation_agents')
                    .where('automation_id', Number(id))
                    .del();

                // Delete the automation
                const deletedRows = await trx('lead_assign_automations')
                    .where('id', Number(id))
                    .del();

                if (deletedRows === 0) {
                    throw new Error('Automation not found');
                }

                return { deleted: true, id: Number(id) };
            } catch (error) {
                console.error('Error in deleteAutomation transaction:', error);
                throw error;
            }
        });
    }
}

module.exports = LeadAutomationService;
