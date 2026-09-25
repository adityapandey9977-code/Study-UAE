/* eslint-disable global-require */

require("dotenv").config();

process.env.TZ = "Asia/Kolkata";

process.on(
    "uncaughtException",
    (error) => {
        console.error(
            "Uncaught Exception:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    (reason) => {
        console.error(
            "Unhandled Rejection:",
            reason
        );
    }
);

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");

const db = require("./libraries/db");

const formOtpRoutes =
    require("./routes/form_otp.routes");

db.connect();

const { initUploadDirectories } = require("./util/upload_dirs.util");
initUploadDirectories(5);

const app = express();

app.use(cors());

app.use(
    compression({
        level: 1
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: "100mb"
    })
);

app.use(
    bodyParser.json({
        limit: "100mb",
        type: "application/json"
    })
);

app.use(
    "/static",
    express.static("static")
);

const localUploadsDir = path.resolve(__dirname, "../uploads");
const cwdUploadsDir = path.resolve(process.cwd(), "uploads");
const envUploadsDir = path.resolve(process.env.UP_PATH || "uploads");

app.use("/uploads", express.static(localUploadsDir));
app.use("/uploads", express.static(cwdUploadsDir));
if (envUploadsDir !== localUploadsDir && envUploadsDir !== cwdUploadsDir) {
    app.use("/uploads", express.static(envUploadsDir));
}

app.use("*", (req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
            "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
            "Content-Type, Authorization, Sessionid, Utcoffset, institute_id"
    });

    if (req.method === "OPTIONS") {
        return res.status(200).json({
            status: "Okay"
        });
    }

    return next();
});

const findUploadByFilename = (
    baseDir,
    filename
) => {
    try {
        const entries = fs.readdirSync(
            baseDir,
            {
                withFileTypes: true
            }
        );

        for (const entry of entries) {
            const fullPath = path.join(
                baseDir,
                entry.name
            );

            if (entry.isDirectory()) {
                const matchedPath =
                    findUploadByFilename(
                        fullPath,
                        filename
                    );

                if (matchedPath) {
                    return matchedPath;
                }
            } else if (
                entry.isFile() &&
                entry.name === filename
            ) {
                return fullPath;
            }
        }

        return null;
    } catch (error) {
        console.error(
            "Upload lookup error:",
            error.message
        );

        return null;
    }
};

app.get(
    "/uploads/files/:filename",
    (req, res) => {
        const { filename } = req.params;

        if (
            !filename ||
            filename.includes("/") ||
            filename.includes("\\")
        ) {
            return res.status(400).json({
                message: "Invalid filename"
            });
        }

        const fullPath =
            findUploadByFilename(
                uploadsBaseDir,
                filename
            );

        if (!fullPath) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        return res.sendFile(fullPath);
    }
);

app.use(
    "/api/form",
    formOtpRoutes
);

app.use(
    require("./routes/routes")
);

app.use((req, res) => {
    return res.status(404).json({
        status: false,
        message: "API endpoint not found"
    });
});

app.use(
    (error, req, res, next) => {
        console.error(
            "Unhandled API error:",
            error
        );

        if (res.headersSent) {
            return next(error);
        }

        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
);

const port = Number(
    process.env.APP_PORT ||
    process.env.PORT ||
    8000
);

console.log("APP_PORT =", process.env.APP_PORT);
console.log("PORT =", process.env.PORT);
console.log("Final port =", port);

const server = app.listen(
    port,
    () => {
        const address = server.address();

        console.log(
            "App listening at http://%s:%s",
            address.address,
            address.port
        );
    }
);

// Initialize Socket.io service for Live Chat & Audio Calling
const socketService = require("./live_chat_and_calling/socket.service");
socketService.init(server);

module.exports = app;
