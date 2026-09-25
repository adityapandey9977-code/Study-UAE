const db = require("../libraries/db");

class ReviewService {
    static tableName = "cms_reviews";
    static tableReady = false;

    static async ensureTable() {
        if (this.tableReady) return;

        const exists = await db.knex.schema.hasTable(this.tableName);
        if (!exists) {
            await db.knex.schema.createTable(this.tableName, (table) => {
                table.increments("id").primary();
                table.string("name", 100).notNullable();
                table.string("email", 100).notNullable();
                table.integer("university_id").unsigned().nullable();
                table.string("course_name", 150).nullable();
                table.integer("rating").unsigned().notNullable(); // 1-5
                table.string("title", 200).notNullable();
                table.text("review_text").notNullable();
                table.string("status", 20).notNullable().defaultTo("PENDING"); // PENDING, APPROVED, REJECTED
                table.timestamp("created_at").notNullable().defaultTo(db.knex.fn.now());
            });
        }
        this.tableReady = true;
    }

    static async submitReview(data) {
        await this.ensureTable();
        const [id] = await db.knex(this.tableName).insert({
            name: data.name,
            email: data.email,
            university_id: data.university_id || null,
            course_name: data.course_name || null,
            rating: data.rating,
            title: data.title,
            review_text: data.review_text,
            status: "PENDING",
            created_at: new Date()
        });
        return id;
    }

    static async listReviews(filters = {}) {
        await this.ensureTable();
        let query = db.knex(`${this.tableName} as r`)
            .leftJoin("institutes as i", "i.id", "r.university_id")
            .select("r.*", "i.name as university_name")
            .orderBy("r.created_at", "desc");

        if (filters.status) {
            query = query.where("r.status", filters.status);
        }

        return await query;
    }

    static async updateReviewStatus(id, status) {
        await this.ensureTable();
        return await db.knex(this.tableName)
            .where({ id })
            .update({ status });
    }

    static async deleteReview(id) {
        await this.ensureTable();
        return await db.knex(this.tableName)
            .where({ id })
            .del();
    }
}

module.exports = ReviewService;
