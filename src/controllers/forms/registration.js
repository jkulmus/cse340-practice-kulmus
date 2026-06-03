import { Router } from "express";
import { validationResult } from "express-validator";
import { registrationValidation } from "../../middleware/validation/forms.js";
import bcrypt from "bcrypt";
import { emailExists, saveUser, getAllUsers } from "../../models/forms/registration.js";

const router = Router();

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
        users,
        currentUser: req.session && req.session.user ? req.session.user : null
    });
};

router.get("/", showRegistrationForm);
router.post("/", registrationValidation, processRegistration);
router.get("/list", showAllUsers);

export default router;