const fs = require('fs');
const path = require('path');

/**
 * Ensures the target upload folder for a given date exists with full 0777 permissions.
 * If UP_PATH is inaccessible (e.g. permission issues on /var/www/html/uploads),
 * gracefully falls back to local uploads directory.
 */
function ensureUploadDirectory(targetDate) {
    const d = targetDate instanceof Date ? targetDate : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    const primaryUpPath = path.resolve(process.env.UP_PATH || 'uploads');
    const fallbackUpPath = path.resolve(process.cwd(), 'uploads');

    const candidates = [primaryUpPath, fallbackUpPath];

    for (const basePath of candidates) {
        try {
            const yearDir = path.join(basePath, String(y));
            const monthDir = path.join(yearDir, `${y}-${m}`);
            const dayDir = path.join(monthDir, `${y}-${m}-${day}`);

            if (!fs.existsSync(dayDir)) {
                fs.mkdirSync(dayDir, { recursive: true, mode: 0o777 });
            }
            try { fs.chmodSync(dayDir, 0o777); } catch (ignore) {}

            return {
                basePath,
                yearDir,
                monthDir,
                dayDir,
                relativeDir: `${y}/${y}-${m}/${y}-${m}-${day}`
            };
        } catch (err) {
            console.warn(`[UploadDirs] Warning: Failed to create dir in ${basePath}: ${err.message}. Trying fallback...`);
        }
    }

    throw new Error(`Failed to ensure upload directory for date ${y}-${m}-${day}`);
}

/**
 * Pre-creates directories for current and upcoming years (e.g. +5 years) on startup.
 */
function initUploadDirectories(yearsAhead = 5) {
    const currentYear = new Date().getFullYear();
    const basePaths = [
        path.resolve(process.env.UP_PATH || 'uploads'),
        path.resolve(process.cwd(), 'uploads'),
        '/var/www/html/uploads'
    ];

    const uniqueBases = Array.from(new Set(basePaths));

    for (const basePath of uniqueBases) {
        try {
            if (!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath, { recursive: true, mode: 0o777 });
            }
            try { fs.chmodSync(basePath, 0o777); } catch (ignore) {}

            for (let y = currentYear; y <= currentYear + yearsAhead; y++) {
                const yearDir = path.join(basePath, String(y));
                if (!fs.existsSync(yearDir)) {
                    fs.mkdirSync(yearDir, { recursive: true, mode: 0o777 });
                }
                try { fs.chmodSync(yearDir, 0o777); } catch (ignore) {}

                for (let m = 1; m <= 12; m++) {
                    const monthStr = String(m).padStart(2, '0');
                    const monthDir = path.join(yearDir, `${y}-${monthStr}`);
                    if (!fs.existsSync(monthDir)) {
                        fs.mkdirSync(monthDir, { recursive: true, mode: 0o777 });
                    }
                    try { fs.chmodSync(monthDir, 0o777); } catch (ignore) {}
                }
            }
            console.log(`[UploadDirs] Initialized upload directories for years ${currentYear}-${currentYear + yearsAhead} in: ${basePath}`);
        } catch (err) {
            console.warn(`[UploadDirs] Note on ${basePath}: ${err.message}`);
        }
    }
}

module.exports = {
    ensureUploadDirectory,
    initUploadDirectories
};
