const axios = require("axios");
const db = require("../libraries/db");
const { currentDT } = require("../util/common.util");
const WhatsappService = require("../services/whatsapp.service");
//const LeadsService = require("../services/leads.service");

class CommunicationService {
    static sendWhatsappToLead = async ({ msg, lead_id, auto_login_url }, req) => {
        const { id: user_id, name, email, mobile, isInstitute, institute_id } = req.currentUser;
        const ldtl = await db.knex("students").select("user_id", "regno").where({ id: lead_id }).first();
        const udtl = await db.knex("users").select("isd_code_country_id", "mobile", "email", "name").where({ id: ldtl?.user_id }).first();
        if (!udtl?.mobile) {
            throw new Error("Mobile number not found.");
        }
        const cdtl = await db.knex("master_countries").select("isd_code").where({ id: udtl.isd_code_country_id }).first();
        const phonecode = (cdtl?.isd_code || '91').replace('+', '');

        msg = msg.replace(/%REGNO%/g, ldtl.regno);
        msg = msg.replace(/%NAME%/g, udtl.name);
        msg = msg.replace(/%MOBILE%/g, udtl.mobile);
        msg = msg.replace(/%EMAIL%/g, udtl.email);
        msg = msg.replace(/%AUTO_LOGIN_URL%/g, auto_login_url);
        msg = msg.replace(/%SENDER_NAME%/g, name);
        msg = msg.replace(/%SENDER_EMAIL%/g, email);
        msg = msg.replace(/%SENDER_MOB%/g, mobile);

        const response = await WhatsappService.sendMessage({ to: `${phonecode}${udtl.mobile}`, msg }, req);
        if (response?.status == "error") {
            throw new Error(response.message + ". Please scan QR code again!");
        }
        const dt = currentDT();
        const cData = {
            lead_id,
            msg,
            created: dt,
            created_by: user_id,
            institute_id: isInstitute ? institute_id : null
        };
        await db.save("leads_sent_whatsapp", cData);
    }

    static getSentWhatsappToLead = async (req) => {
        const { lead_id } = req.query;
        const { isInstitute, institute_id } = req.currentUser;

        const result = await db.knex.select('lsw.*', 'u.name as created_by')
            .from('leads_sent_whatsapp as lsw')
            .join('users as u', 'u.id', 'lsw.created_by')
            .where((qb) => {
                qb.where({ 'lsw.lead_id': lead_id });
                if (isInstitute) {
                    qb.where('lsw.institute_id', institute_id);
                }
            })
            .orderBy('lsw.id', 'desc');

        return result;
    }
}

module.exports = CommunicationService;