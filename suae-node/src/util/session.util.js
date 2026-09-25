const db = require("../libraries/db");
const { currentDT } = require("../util/common.util");

exports.setSession = async ({ sessionid }, key, value) => {
    const dtl = await db.knex("sessions").where({ sessionid, key }).first();
    const dt = currentDT();
    if (dtl) {
        await db.knex("sessions").where({ sessionid, key }).update({ value, created: dt });
    } else {
        await db.knex("sessions").insert({ sessionid, key, value, created: dt });
    }
}

exports.getSession = async ({ sessionid }, key = null) => {
    if (key) {
        const dtl = await db.knex("sessions").select("value").where({ sessionid, key }).first();
        return dtl?.value || null;
    } else {
        const rs = await db.knex("sessions").select("key", "value").where({ sessionid });
        if (rs && rs?.length > 0) {
            const res = {};
            for (const r of rs) {
                res[r.key] = r.value;
            }
            return res;
        }
        return null;
    }
}

exports.deleteSession = async ({ sessionid }, key = null) => {
    if (key) {
        await db.knex("sessions").where({ sessionid, key }).del();
    } else {
        await db.knex("sessions").where({ sessionid }).del();
    }
}