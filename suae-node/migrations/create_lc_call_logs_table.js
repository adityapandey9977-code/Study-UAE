const dotenv = require('dotenv');
dotenv.config();
const db = require('../src/libraries/db');

async function migrate() {
  try {
    db.connect();
    const query = `
      CREATE TABLE IF NOT EXISTS lc_call_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        call_id VARCHAR(64) NOT NULL,
        caller_id INT UNSIGNED NOT NULL,
        receiver_id INT UNSIGNED NOT NULL,
        call_type ENUM('audio','video') NOT NULL DEFAULT 'audio',
        status ENUM('initiated','ringing','answered','rejected','missed','busy','ended','failed') NOT NULL DEFAULT 'initiated',
        start_time DATETIME NULL,
        answered_at DATETIME NULL,
        end_time DATETIME NULL,
        duration INT UNSIGNED NOT NULL DEFAULT 0,
        metadata JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_call_id (call_id),
        KEY idx_caller (caller_id),
        KEY idx_receiver (receiver_id),
        KEY idx_status (status),
        KEY idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.knex.raw(query);
    console.log('lc_call_logs table verified successfully.');
    const [cols] = await db.knex.raw('DESCRIBE lc_call_logs');
    console.table(cols.map(c => ({ Field: c.Field, Type: c.Type })));
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    if (db.knex) {
      await db.knex.destroy();
    }
    process.exit(0);
  }
}

migrate();
