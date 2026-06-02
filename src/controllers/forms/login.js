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
        errors.array().forEach(error => {
            req.flash("error", error.msg);
        });

        return res.redirect("/login");
    }

    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            req.flash("error", "Invalid email or password");
            return res.redirect("/login");
        }

        const validPassword = await verifyPassword(
            password,
            user.password
        );

        if (!validPassword) {
            req.flash("error", "Invalid email or password");
            return res.redirect("/login");
        }

        delete user.password;

        req.session.user = user;

        req.flash("success", `Welcome back, ${user.name}!`);
        res.redirect("/dashboard");

    } catch (error) {
        console.error("Login error:", error);

        req.flash("error", "Unable to log in. Please try again later.");
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