// Imports
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Course data
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
 * Declare Important Variables
 */
const PORT = process.env.PORT || 3000;

 // Corret for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup Express Server
 */
const app = express();

/**
 * Configure Express middleware
 */

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as view engine
app.set("view engine", "ejs");

// Set views directory
app.set("views", path.join(__dirname, "src/views"));

/**
 * Declare Routes
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
    const studentId = {
        name: "Student Name",
        id: studentId,
        email: "name@example.com",
        address: "123 University Way"
    };

    res.render("student", {
        title: "Student Profile",
        student
    });
});

/**
 * Search Route Example
 * Route Param + Query Param demo
 * Example:
 * /search/laptop
 * /search/phones?brand=apple
 * /search/headphones?minPrice=50&sort=rating
 */
app.get("/search/:category", (req, res) => {
    // Route param
    const category = req.params.category;

    // Query param w/defaults
    const brand = req.query.brand || "any brand";
    const minPrice = req.query.minPrice || "0";
    const sort = req.query.sort || "price";

    // Send response
    res.send(`
        <h1>Search Results</h1>
        <p><strong>Category:<strong> ${category}<p>
        <p><strong>Brand:</strong> ${brand}</p>
        <p><strong>Minimum Price:</strong> ${minPrice}</p>
        <p><strong>Sory By:</stron> ${sort}</p>
        `);
});

// Course catalog page
app.get("/catalong", (req, res) => {
    res.render("catalog", {
        title: "Course Catalog",
        courses: courses
    });
});

// Course detail page 
app.get('/catalog/:courseId', (req, res) => {
    // Route param
    const courseId = req.params.courseId;
    // Find course
    const course = courses[courseId];
    // Handle invalid course ID
    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    // Query param
    const sortBy = req.query.sort || "time";

    // Copy sections
    let sortedSections = [...course.sections];

    // Sort sections
    switch (sortBy) {
        case "professor":
            sortedSections.sort((a, b) =>
                a.professor.localCompare(b.professor)
            );
            break;

        case "room":
            sortedSections.sort((a, b) =>
                a.room.localCompare(b.room)
            );
            break;

        case "time":
            default:
                break;
    }

    // Log the parameter for debugging
    console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);
    // Render the course detail template
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
 * Test Route for 500 Errors
 */
app.get("/test-error", (req, res, next) => {
    const err = new Error("This is a test error");

    err.status = 500;

    next(err);
});

/**
 * Catch-All Route 404 Errors
 * Comes AFTER all valid routes
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

    // Determine status code
    const status = err.status || 500;

    // Choose correct template
    const template = status === 404 ? "404" : "500";

    // Create context object for EJS templates
    const context = {
        title: status === 400
            ? "Page Not Found"
            : "Server Error",
        
        error: process.env.NODE_ENV === "production"
            ? "An error occured"
            : err.message,

        stack: process.env.NODE_ENV === "production"
            ? null
            : err.stack,

        NODE_ENV: process.env.NODE_ENV
    };

    try {

        // Render apporpriate error page
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {

        // fallback if rendering fails
        if (!res.headersSent) {
            res.status(status).send(`
                <h1>Error ${status}</h1>
                <p>An error occured</p>
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