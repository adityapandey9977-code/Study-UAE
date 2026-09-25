/* eslint-disable global-require */
const dotenv = require('dotenv');

dotenv.config({
    path:
        process.env.NODE_ENV === 'production'
            ? '.env.production'
            : '.env'
});
process.env.TZ = "Asia/Kolkata"; //Set node server timezone
process.on('uncaughtException', err => { console.log(err) });

const express = require("express");
const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require('body-parser');
const compression = require('compression');
const db = require("./libraries/db");
db.connect();

const { initUploadDirectories } = require("./util/upload_dirs.util");
initUploadDirectories(5);

const app = express();
app.use(cors());
app.use(compression({ level: 1 }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb', type: 'application/json' }));

app.use("/static", express.static("static"));
const localUploadsDir = path.resolve(__dirname, "../uploads");
const cwdUploadsDir = path.resolve(process.cwd(), "uploads");
const envUploadsDir = path.resolve(process.env.UP_PATH || "uploads");

app.use("/uploads", express.static(localUploadsDir));
app.use("/uploads", express.static(cwdUploadsDir));
if (envUploadsDir !== localUploadsDir && envUploadsDir !== cwdUploadsDir) {
    app.use("/uploads", express.static(envUploadsDir));
}

app.use('*', (req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Sessionid, Utcoffset, institute_id',
    });
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ status: 'Okay' });
    } else {
        next();
    }
});

// Health check endpoints for Render, uptime monitors, and local testing
app.get(['/', '/health', '/api/health'], (req, res) => {
    res.status(200).json({
        status: true,
        message: "Study UAE Backend API is running successfully",
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

const uploadsBaseDir = localUploadsDir;

const findUploadByFilename = (baseDir, filename) => {
    try {
        const entries = fs.readdirSync(baseDir, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(baseDir, entry.name);
            if (entry.isDirectory()) {
                const hit = findUploadByFilename(full, filename);
                if (hit) return hit;
            } else if (entry.isFile() && entry.name === filename) {
                return full;
            }
        }
        return null;
    } catch (e) {
        return null;
    }
};

app.get('/uploads/files/:filename', (req, res) => {
    const filename = req.params.filename;
    if (!filename || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename' });
    }

    const fullPath = findUploadByFilename(uploadsBaseDir, filename);
    if (!fullPath) {
        return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(fullPath);
});

// Form OTP routes
try {
    const formOtpRoutes = require("./routes/form_otp.routes");
    app.use("/api/form", formOtpRoutes);
} catch (e) {
    console.warn("Notice: form_otp.routes could not be loaded", e.message);
}

// Main application routes
app.use(require('./routes/routes'));

// Global 404 handler for API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return res.status(404).json({ status: false, message: 'Endpoint not found' });
    }
    next();
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({
        status: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

const PORT = parseInt(process.env.PORT || process.env.APP_PORT || 5000, 10);
let server;

// HTTPS is used only if explicitly requested and valid certificates are provided
const sslKeyPath = process.env.SSL_KEY_PATH || 'ssl/key.key';
const sslCertPath = process.env.SSL_CERT_PATH || 'ssl/crt.crt';
const sslBundlePath = process.env.SSL_BUNDLE_PATH || 'ssl/bundle.crt';

if (process.env.USE_HTTPS === 'true' && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    try {
        const sslOption = {
            key: fs.readFileSync(sslKeyPath),
            cert: fs.readFileSync(sslCertPath),
            ...(fs.existsSync(sslBundlePath) ? { ca: fs.readFileSync(sslBundlePath) } : {})
        };
        server = https.createServer(sslOption, app);
        console.log("Starting server with HTTPS configuration");
    } catch (sslErr) {
        console.warn("Failed to load SSL certificates, falling back to HTTP:", sslErr.message);
        server = http.createServer(app);
    }
} else {
    // Cloud platforms like Render terminate SSL at their proxy and forward standard HTTP
    server = http.createServer(app);
}

server.listen(PORT, () => {
    console.log(`Study UAE API server listening on port ${PORT}`);
});

// Initialize Socket.io service for Live Chat & Audio Calling
try {
    const socketService = require("./live_chat_and_calling/socket.service");
    socketService.init(server);
    console.log("Socket.io Live Chat & Audio Calling service initialized");
} catch (sockErr) {
    console.warn("Socket.io init notice:", sockErr.message);
}

module.exports = app;