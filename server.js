// Imports
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import session from "express-session";
import connectPgSimple from "connect-pg-simple";

import { setupDatabase, testConnection } from "./src/models/setup.js";
import { caCert } from "./src/models/db.js";

import routes from "./src/controllers/routes.js";

import { addLocalVariables } from "./src/middleware/global.js";
import { startSessionCleanup } from "./src/utils/session-cleanup.js";

/**
 * Declare Important Variables
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Correct for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup Express Server
 */
const app = express();

/**
 * Initialize PostgreSQL session store
 */
const pgSession = connectPgSimple(session);

/**
 * Configure session middleware
 */
app.use(
    session({
        store: new pgSession({
            conObject: {
                connectionString: process.env.DB_URL,
                ssl: {
                    ca: caCert,
                    rejectUnauthorized: true,
                    checkServerIdentity: () => {
                        return undefined;
                    }
                }
            },
            tableName: "session",
            createTableIfMissing: true
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: NODE_ENV.includes("dev") !== true,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

/**
 * Start automatic session cleanup
 */
startSessionCleanup();

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Allow Express to receive and process POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Global Middleware
app.use(addLocalVariables);

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res, next) => {
    const err = new Error("Page Not Found");
    err.status = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const template = status === 404 ? "404" : "500";

    res.status(status).render(`errors/${template}`,{ 
        title: status===404 ? "Not Found" : "Server Error",
        error: err.message,
        stack: err.stack,
        NODE_ENV
    });
});

// Start server
app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    
    console.log(`Server:http://localhost:${PORT}`);
});
