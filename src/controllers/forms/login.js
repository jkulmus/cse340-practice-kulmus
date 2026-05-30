import { body, validationResult } from "express-validator";
import { findUserByEmail, verifyPassword } from "../../models/forms/login.js";
import { Router } from "express";

const router = Router();

/**
 * Validation rules for login form
 */
const loginValidation = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password is required")
];

/**
 * Display the login form
 */
const showLoginForm = (req, res) => {
    res.render("forms/login/form", {
        title: "User Login"
    });
};

/**
 * Process login form submission
 */
const processLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error("Validation errors:", errors.array());
        return res.redirect("/login");
    }

    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            console.log("User not found");
            return res.status(401).redirect("/login");
        }

        const validPassword = await verifyPassword(
            password,
            user.password
        );

        if (!validPassword) {
            console.log("Invalid password");
            return res.status(401).redirect("/login");
        }

        // Remove password before storing in session
        delete user.password;

        req.session.user = user;

        res.redirect("/dashboard");

    } catch (error) {
        console.error("Login error:", error);
        res.redirect("/login");
    }
};

/**
 * Logout
 */
const processLogout = (req, res) => {
    if (!req.session) {
        return res.redirect("/");
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            res.clearCookie("connect.sid");
            return res.redirect("/");
        }

        res.clearCookie("connect.sid");
        res.redirect("/");
    });
};

/**
 * Dashboard
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    if (user && user.password) {
        delete user.password;
    }

    if (
        sessionData.user &&
        sessionData.user.password
    ) {
        delete sessionData.user.password;
    }

    res.render("dashboard", {
        title: "Dashboard",
        user,
        sessionData
    });
};

router.get("/", showLoginForm);
router.post("/", loginValidation, processLogin);

export default router;
export { processLogout, showDashboard };