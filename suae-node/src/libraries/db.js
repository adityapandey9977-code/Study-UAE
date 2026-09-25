const knex = require('knex');
const { currentDT, copyObj } = require("../util/common.util");

class db {
    static knex;

    static connect = () => {
        let connectionConfig;

        if (process.env.DATABASE_URL) {
            connectionConfig = {
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
            };
        } else {
            connectionConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306', 10),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'sis',
                ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
            };
        }

        this.knex = knex({
            client: 'mysql2',
            connection: connectionConfig,
            pool: {
                min: 0,
                max: 20,
                afterCreate: function (conn, cb) {
                    conn.query('SET sql_mode="";', function (err) {
                        cb(err, conn);
                    });
                }
            },
            acquireConnectionTimeout: 60 * 1000
        });
    }

    static save = async (tbl, data, usrIdNdDT = 0, req = null, trx = null, primaryKey = 'id') => {
        data = copyObj(data);
        const knexOb = trx || this.knex;
        if (!primaryKey) {
            primaryKey = 'id';
        }
        if (!data[primaryKey]) {
            if (usrIdNdDT > 0) {
                const dt = currentDT();
                data.created = dt;
                data.updated = dt;
                if (usrIdNdDT > 1) {
                    const userId = req.currentUser?.id || 0;
                    data.created_by = userId;
                    data.updated_by = userId;
                }
            }
            const ids = await knexOb(tbl).insert(data);
            return ids[0] || false;
        } else {
            if (usrIdNdDT > 0) {
                const dt = currentDT();
                data.updated = dt;
                if (usrIdNdDT > 1) {
                    const userId = req.currentUser?.id || 0;
                    data.updated_by = userId;
                }
            }
            const id = data[primaryKey];
            delete data[primaryKey];
            const success = await knexOb(tbl).where({ [primaryKey]: id }).update(data);
            return success ? id : false;
        }
    }

    static delete = async (tbl, cond, trx = null) => {
        const knexOb = trx || this.knex;
        return await knexOb(tbl).where(cond).del();
    }

    static updateBatch = async (tableName, data, identifier = 'id', trx = null) => {
        const knexOb = trx || this.knex;
        const keys = Object.keys(data[0]).filter((key) => key !== identifier);
        const updates = keys.map((key) =>
            //`${key} = CASE ${data.map((row) => `WHEN ${identifier} = ${row[identifier]} THEN '${row[key]}'`).join(' ')} END`
            `${key} = CASE ${data.map((row) => `WHEN ${identifier} = ${row[identifier]} THEN ${knex.raw('?', [row[key]])}`).join(' ')} END`
        ).join(', ');

        const condition = `${identifier} IN (${data.map((row) => row[identifier]).join(', ')})`;
        const sql = `UPDATE ${tableName} SET ${updates} WHERE ${condition}`;
        await knexOb.raw(sql);
    }

    static pagedRows = async (queryObj, p, ps) => {
        p = p ? p * 1 : 1;
        ps = ps ? ps * 1 : 10;
        const limit = ps;
        const offset = limit * (p - 1);

        let totalCount;
        const hasGroupBy = queryObj._statements && queryObj._statements.some(s => s.grouping === 'group');
        if (hasGroupBy) {
            const subQuery = queryObj.clone().clear('order').clear('limit').clear('offset');
            totalCount = await this.knex.count('* as total').from(subQuery.as('sub_count')).first();
        } else {
            totalCount = await queryObj.clone().clear('select').clear('order').count('* as total').first();
        }

        const result = await queryObj.limit(limit).offset(offset);
        //const countResult = await this.knex.raw('SELECT FOUND_ROWS() AS n'); //select SQL_CALC_FOUND_ROWS must be in query
        //const totalCount = countResult[0][0].n;

        const page = { cur_page: p, page_size: ps, total_records: totalCount?.total || 0, total: result.length, start: offset };
        return { data: result || [], page };
    }
}

module.exports = db;