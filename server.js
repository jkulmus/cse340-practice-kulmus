// Imports
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Declare Important Variables
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Correct for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Course data
 */
const courses = {
    'CS121': {
        id: 'CS121',
        title: 'Introduction to Programming',
        description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
        credits: 3,
        sections: [
            { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
            { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
            { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
        ]
    },
    'MATH110': {
        id: 'MATH110',
        title: 'College Algebra',
        description: 'Fundamental algebraic concepts including functions, graphing, and problem solving.',
        credits: 4,
        sections: [
            { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
            { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
            { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
        ]
    },
    'ENG101': {
        id: 'ENG101',
        title: 'Academic Writing',
        description: 'Develop writing skills for academic and professional communication.',
        credits: 3,
        sections: [
            { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
            { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
            { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
        ]
    }
};

/**
 * Setup Express Server
 */
const app = express();

/**
 * Configure Express Middleware
 */

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

/**
 * Global Middleware
 */

// Middleware to make NODE_ENV available to templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV.toLowerCase() || "production";
    next();
});

// Request logger middleware
app.use((req, res, next) => {
    // skip hidden /. routes
    if (!req.path.startsWith("/.")) {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

// Middleware for current year
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
});

// Middleware for timestamp
app.use((req, res, next) => {
    res.locals.timestamp = new Date().toDateString();
    next();
});

// Time-based greeting middleware
app.use((req, res, next) => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        res.locals.greeting = "<p>Good Morning!</p>";
    } else if (currentHour < 18) {
        res.locals.greeting = "<p>Good Afternoon!</p>";
    } else {
        res.locals.greeting = "<p>Good Evening!</p>";
    }
    next();
});

// Random theme middleware
app.use((req, res, next) => {
    const themes = ["blue-theme", "green-theme", "red-theme"];

    const randomTheme =
        themes[Math.floor(Math.random() * themes.length)];
    res.locals.bodyClass = randomTheme;
    next();
});

// Query parameter middleware
app.use((req, res, next) => {
    res.locals.queryParams = req.query || {};
    next();
});

/**
 * Route-Specific Middleware
 */

// Visit Count middleware
const addVisitCount = (req, res, next) => {
    res.locals.visitCount = 41;
    next();
};

// Demo header middleware
const addDemoHeaders = (req, res, next) => {
    res.setHeader("X-Demo-Page", "true");

    res.setHeader(
        "X-Middleware-Demo",
        "Middleware is working successfully!"
    );
    next();
};

/**
 * Routes
 */

// Home
app.get("/", (req, res) => {
    res.render("home", { title: "Welcome Home" });
});

// About
app.get("/about", (req, res) => {
    res.render("about", { title: "About Me" });
});

// Products
app.get("/products", (req, res) => {
    res.render("products", { title: "Our Products" });
});

// Student
app.get("/student", (req, res) => {
    const student = {
        name: "Jacquelyn Kulmus",
        id: "123456",
        email: "name@example.com",
        address: "123 University Way"
    };

    res.render("student", {
        title: "Student Profile",
        student
    });
});

// Welcome route using route-specific middleware
app.get("/welcome", addVisitCount, (req, res) => {
    res.send(`
        <h1>Welcome!</h1>
        <p>Timestamp: ${res.locals.timestamp}</p>
        <p>Visit Count: ${res.locals.visitCount}</p>
    `);
});

// Search route w/route + query params
app.get("/search/:category", (req, res) => {
    const category = req.params.category;

    const brand = req.query.brand || "Any Brand";
    const minPrice = req.query.minPrice || "0";
    const sort = req.query.sort || "price";

    // Send response
    res.send(`
        <h1>Product Search</h1>
        <p>Category: ${category}<p>
        <p>Brand: ${brand}</p>
        <p>Minimum Price: ${minPrice}</p>
        <p>Sort By: ${sort}</p>
    `);
});

/**
 * Course Catalog Routes
 */

// Catalog page
app.get("/catalog", (req, res) => {
    res.render("catalog", {
        title: "Course Catalog",
        courses: courses
    });
});

// Course detail page
app.get('/catalog/:courseId', (req, res, next) => {
    const courseId = req.params.courseId;

    const course = courses[courseId];

    // Handle invalid course
    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    // Query param
    const sortBy = req.query.sort || "time";

    let sortedSections = [...course.sections];

    switch (sortBy) {
        case "professor":
            sortedSections.sort((a, b) =>
                a.professor.localeCompare(b.professor)
            );
            break;

        case "room":
            sortedSections.sort((a, b) =>
                a.room.localeCompare(b.room)
            );
            break;

        case "time":
            default:
                break;
    }

    console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);

    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: {
            ...course,
            sections: sortedSections
        },
        currentSort: sortBy
    });
});

/**
 * Demo Page
 */

app.get("/demo", addDemoHeaders, (req, res) => {
    res.render("demo", {
        title: "Middleware Demo Page"
    });
});

/**
 * Test Error Route
 */

app.get("/test-error", (req, res, next) => {
    const err = new Error("This is a test error");

    err.status = 500;

    next(err);
});

/**
 * 404 Catch-All
 */

app.use((req, res, next) => {
    const err = new Error("Page Not Found");

    err.status = 404;

    next(err);
});

/**
 * Global Error Handler
 * MUST come LAST
 */

app.use((err, req, res, next) => {
    // Prevent duplicate responses
    if (res.headersSent || res.finished) {
        return next(err);
    }

    // Log error
    console.error("Error occurred:", err.message);
    console.error(err.stack);

    const status = err.status || 500;

    const template = status === 404 ? "404" : "500";

    const context = {
        title: status === 404 ? "Page Not Found" : "Server Error",
        error: 
            NODE_ENV === "production"
                ? "An error occured"
                : err.message,
        stack:
            NODE_ENV === "production"
                ? null
                : err.stack,
        NODE_ENV
    };

    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        console.error("Error rendering template:", renderErr.message);

        if (!res.headersSent) {
            res.status(status).send(`
                <h1>Error ${status}</h1>
                <p>An error occurred</p>
            `);
        }
    }
});

/**
 * Start server
 */
app.listen(PORT, () => {
     console.log(`Server running at http://localhost:${PORT}`);
});
