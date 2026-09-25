// const db = require("../libraries/db");

// class UserService {
//     static detail = async (id = null) => {
//         const f = ['id', 'type', 'name', 'email', 'mobile', 'status'];
//         const dtl = await db.knex("users").select(f).where({ id }).first();
//         dtl.isClient = dtl.type === 'CLIENT';
//         dtl.isStudent = dtl.type === 'STUDENT';
//         dtl.isInstitute = dtl.type === 'INSTITUTE';
//         dtl.isAgent = dtl.type === 'AGENT';
//         //->join("institutes i", "i.user_id=u.id", "left")
//         dtl.institute_id = null;
//         if (dtl.isInstitute) {
//             const idtl = await db.knex("institutes").select('id').where('user_id', dtl.id).first();
//             dtl.institute_id = idtl?.id || null;
//         }
//         return dtl;
//     }

//     static saveAgentUrlLink = async (data) => {
//         await db.save("agent_url_links", data, 1);
//     }

//     static getAgentUrlLinks = async (req) => {
//         const { id: agent_id } = req.currentUser;
//         const rs = await db.knex("agent_url_links").where({ agent_id });
//         for (const r of rs) {
//             r.link = `${process.env.APP_URL_STU}applynow/${r.uid}`;
//             if (r.utm_source) {
//                 r.link = `${r.link}?utm_source=${r.utm_source}`;
//             }
//         }
//         return rs;
//     }
// }

// module.exports = UserService;

const db = require("../libraries/db");

class UserService {
    static detail = async (id = null) => {
        if (!id) return null;
        const dtl = await db.knex("users as u")
            .leftJoin('roles as r', 'r.id', 'u.role_id')
            .select([
                'u.id',
                'u.type',
                'u.name',
                'u.email',
                'u.mobile',
                'u.status',
                'u.role_id',
                'r.leads_show_type',
            ])
            .where('u.id', id)
            .first();

        if (!dtl) {
            return null;
        }

        dtl.isClient = dtl.type === 'CLIENT';
        dtl.isStudent = dtl.type === 'STUDENT';
        dtl.isInstitute = dtl.type === 'INSTITUTE';
        dtl.isAgent = dtl.type === 'AGENT';
        dtl.isAdmin = dtl.type === 'CLIENT'; // Super admin check

        dtl.is_client = dtl.isClient;
        dtl.is_student = dtl.isStudent;
        dtl.is_institute = dtl.isInstitute;
        dtl.is_agent = dtl.isAgent;
        dtl.is_admin = dtl.isAdmin;

        dtl.institute_id = null;
        if (dtl.isInstitute) {
            const idtl = await db.knex("institutes").select('id').where('user_id', dtl.id).first();
            dtl.institute_id = idtl?.id || null;
        }
        return dtl;
    }

    static saveAgentUrlLink = async (data) => {
        await db.save("agent_url_links", data, 1);
    }

    static generateShortCode = () => {
        
        return Math.random().toString(36).substring(2, 8);
    }

    static generateUniqueShortCode = async () => {
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
            const code = this.generateShortCode();
            const exists = await db.knex("agent_url_links")
                .where({ short_code: code })
                .first();
                
            if (!exists) {
                return code;
            }
            attempts++;
        }
        
        throw new Error('Could not generate a unique short code after several attempts');
    }

    static getAgentUrlLinks = async (req) => {
        const { id: agent_id } = req.currentUser;
        const rs = await db.knex("agent_url_links").where({ agent_id });

        for (const r of rs) {
            const shortCode = r.short_code;
            
            // Build short link, example → https://student.site/s/abc123
            let baseUrl = process.env.BASE_URL || process.env.BASE_URL_LOCAL || '';
            if (baseUrl && !baseUrl.endsWith('/')) {
                baseUrl += '/';
            }
            r.link = `${baseUrl}s/${shortCode}`;

            if (r.utm_source) {
                r.link = `${r.link}?utm_source=${encodeURIComponent(r.utm_source)}`;
            }
        }

        return rs;
    }

    static deleteAgentUrlLink = async ({ uid }, req) => {
        const { id: agent_id } = req.currentUser || {};
        if (!agent_id) {
            throw new Error('Unauthorized');
        }

        if (!uid) {
            throw new Error('UID is required');
        }

        const deleted = await db.knex("agent_url_links").where({ uid, agent_id }).del();
        if (!deleted) {
            throw new Error('Record not found');
        }

        return { message: 'Deleted successfully' };
    }

    static deleteUser = async ({ id, user_id, uid }, req) => {
        const { isClient } = req.currentUser || {};
        if (!isClient) {
            throw new Error('Only super admin can delete users');
        }

        const userId = id || user_id || uid;
        if (!userId) {
            throw new Error('User ID is required');
        }
        const trx = await db.knex.transaction();
        try {
        
            await trx('agent_url_links').where({ agent_id: userId }).del();
            
            await trx('lead_assign_automation_agents').where({ agent_id: userId }).del();
            
            await trx('student_visibility').where({ user_id: userId }).del();

            await trx('students').where({ agent_id: userId }).update({ agent_id: null });

            await trx('student_extra_info').where({ assigned_to: userId }).update({ assigned_to: null });
            
            await trx('student_extra_info').where({ assigned_by: userId }).update({ assigned_by: null });
            
            await trx('student_choice_fillings').where({ payment_slip_by: userId }).update({ payment_slip_by: null });
            
            await trx('institutes').where({ user_id: userId }).del();
            
            const studentRecords = await trx('students').where({ user_id: userId }).select('id');
            if (studentRecords.length > 0) {
                const studentIds = studentRecords.map(s => s.id);
                
                await trx('student_extra_info').whereIn('student_id', studentIds).del();
                await trx('student_choice_fillings').whereIn('student_id', studentIds).del();
                await trx('student_visibility').whereIn('student_id', studentIds).del();
                await trx('students').whereIn('id', studentIds).del();
            }
            
            const deleted = await trx('users').where({ id: userId }).del();
            if (!deleted) {
                throw new Error('User not found');
            }
            await trx.commit();
            return { message: 'User deleted successfully' };
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }

    static getUserFilters = async (userId) => {
        const uid = Number(userId);
        if (!uid) {
            throw new Error('Valid user ID required');
        }
        
        const user = await db.knex('users as u')
            .leftJoin('roles as r', 'r.id', 'u.role_id')
            .select([
                'u.id',
                'u.role_id',
                'r.leads_show_type',
            ])
            .where('u.id', uid)
            .first();
        
        if (!user) {
            throw new Error('User not found');
        }
        
        const automations = await db.knex('lead_assign_automations as la')
            .join('lead_assign_automation_agents as laa', 'laa.automation_id', 'la.id')
            .select(['la.filters_json', 'la.strategy', 'la.registered_via'])
            .where('laa.agent_id', uid)
            .where('la.status', 1);
        
        const mergedFilters = {
            country_id: [],
            discipline_id: [],
            student_status: []
        };
        
        for (const auto of automations) {
            if (auto.filters_json) {
                try {
                    const filters = typeof auto.filters_json === 'string' 
                        ? JSON.parse(auto.filters_json) 
                        : auto.filters_json;
                    
                    if (filters.country_ids || filters.country_id) {
                        const countryIds = filters.country_ids || filters.country_id;
                        if (Array.isArray(countryIds)) {
                            mergedFilters.country_id.push(...countryIds);
                        } else if (countryIds) {
                            mergedFilters.country_id.push(countryIds);
                        }
                    }
                    
                    if (filters.discipline_ids || filters.discipline_id) {
                        const disciplineIds = filters.discipline_ids || filters.discipline_id;
                        if (Array.isArray(disciplineIds)) {
                            mergedFilters.discipline_id.push(...disciplineIds);
                        } else if (disciplineIds) {
                            mergedFilters.discipline_id.push(disciplineIds);
                        }
                    }
                    
                    if (filters.registered_via || filters.student_status) {
                        const statuses = filters.registered_via || filters.student_status;
                        if (Array.isArray(statuses)) {
                            mergedFilters.student_status.push(...statuses);
                        } else if (statuses) {
                            mergedFilters.student_status.push(statuses);
                        }
                    }
                } catch (e) {
                    // Skip invalid JSON
                    console.error('Error parsing filters_json:', e);
                }
            }
            
            if (auto.registered_via) {
                const rv = String(auto.registered_via).split(',').map(s => s.trim()).filter(Boolean);
                mergedFilters.student_status.push(...rv);
            }
        }
        
        mergedFilters.country_id = [...new Set(mergedFilters.country_id.map(id => Number(id)).filter(Boolean))];
        mergedFilters.discipline_id = [...new Set(mergedFilters.discipline_id.map(id => Number(id)).filter(Boolean))];
        mergedFilters.student_status = [...new Set(mergedFilters.student_status.map(s => String(s).toUpperCase()).filter(Boolean))];
        
        return mergedFilters;
    }

    static getAllUsers = async (params) => {
        const { status } = params || {};
        
        let query = db.knex('users as u')
            .leftJoin('roles as r', 'r.id', 'u.role_id')
            .select([
                'u.id',
                'u.type',
                'u.client_id',
                'u.role_id',
                'u.agent_code',
                'u.fname',
                'u.lname',
                'u.name',
                'u.email',
                'u.mobile',
                'u.username',
                'u.status',
                'r.title as role'
            ])
            .whereIn('u.type', ['ADMIN', 'CLIENT', 'AGENT']);

        if (status !== undefined && status !== null && status !== '') {
            query.where('u.status', Number(status));
        }

        const data = await query;

        for (const user of data) {
            if (!user.role) {
                if (user.type === 'AGENT') {
                    user.role = 'Agent';
                } else if (user.type === 'CLIENT') {
                    user.role = 'Client';
                } else if (user.type === 'ADMIN') {
                    user.role = 'Admin';
                }
            }
        }

        return { data };
    }

}

module.exports = UserService;
