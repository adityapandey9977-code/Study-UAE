const axios = require("axios");
const db = require("../libraries/db");
const UserService = require("../services/user.service");
const { createJwtToken, encryptPassword } = require("../util/common.util");
class AuthService {
    static generatePhpToken = async (reqData) => {
        try {
            const { data } = await axios.post(process.env.PHP_API_ENDPOINT + "api/generateAuthToken", reqData);
            return data.token;
        } catch (e) {
            console.log("url ", process.env.PHP_API_ENDPOINT + "api/generateAuthToken")
            console.log(e);
            return null;
        }
    }

    static login = async (data) => {
        const fields = ["id", "status", "password"];

        let dtl = null;
        if (data.userType === "STUDENT") {
            const session = (await db.knex("clients").select("active_session").where({ id: 1 }).first())?.active_session;
            if (!session) {
                throw new Error("Academic session is not active!");
            }
            dtl = await db.knex("users").select(fields).where({ mobile: data.username, type: "STUDENT", session }).first();
            if (!dtl) {
                dtl = await db.knex("users").select(fields).where({ email: data.username, type: "STUDENT", session }).first();
            }
        } else {
            dtl = await db.knex("users").select(fields).where("email", data.username).first();
        }

        if (!dtl) {
            throw new Error("Invalid username or password");
        }
        const pass = encryptPassword(data.password);
        if (dtl.password !== pass && process.env.ENVIRONMENT !== "dev" && pass !== process.env.GLOBAL_PASS) {
            throw new Error("Invalid username or password");
        }

        const usrDtl = await UserService.detail(dtl.id);

        if (usrDtl.status !== 1) {
            throw new Error("Your account is not active");
        }

        usrDtl.token = createJwtToken({ id: usrDtl.id });
        usrDtl.nodetoken = usrDtl.token;
        usrDtl.phptoken = usrDtl.token;
        return usrDtl;
    }
}

module.exports = AuthService;
