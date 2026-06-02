import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { emailExists, saveUser, getAllUsers } from "../../models/forms/registration.js";

const router = Router();

const registrationValidation = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage("Email address is too long"),

    body("emailConfirm")
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage("Email addresses must match"),

    body("password")
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be between 8 and 128 characters")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage("Password must contain at least one special character"),

    body("passwordConfirm")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords must match")
];

const showRegistrationForm = (req, res) => {
    res.render("forms/registration/form", {
        title: "User Registration"
    });
};

const processRegistration = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash("error", error.msg);
        });

        return res.redirect("/register");
    }

    const { name, email, password } = req.body;

    try {
        const exists = await emailExists(email);

        if (exists) {
            req.flash("warning", "An account with that email already exists. Please log in instead.");
            return res.redirect("/register");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await saveUser(name, email, hashedPassword);

        req.flash("success", "Registration successful! You can now log in.");
        res.redirect("/login");

    } catch (error) {
        console.error("Error registering user:", error);

        req.flash("error", "Unable to create your account. Please try again later.");
        res.redirect("/register");
    }
};

const showAllUsers = async (req, res) => {
    let users = [];

    try {
        users = await getAllUsers();
    } catch (error) {
        console.error("Error retrieving users:", error);
    }

    res.render("forms/registration/list", {
        title: "Registered Users",
        users
    });
};

router.get("/", showRegistrationForm);
router.post("/", registrationValidation, processRegistration);
router.get("/list", showAllUsers);

export default router;