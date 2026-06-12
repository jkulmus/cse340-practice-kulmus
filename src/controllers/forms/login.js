import { validationResult } from "express-validator";
import { loginValidation } from "../../middleware/validation/forms.js";
import { findUserByEmail, verifyPassword } from "../../models/forms/login.js";
import { Router } from "express";

const router = Router();

const showLoginForm = (req, res) => {
  res.render("forms/login/form", {
    title: "User Login",
  });
};

const processLogin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
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

    const validPassword = await verifyPassword(password, user.password);

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

const showDashboard = (req, res) => {
  const user = req.session.user;

  res.render("dashboard", {
    title: "Dashboard",
    user,
  });
};

router.get("/", showLoginForm);
router.post("/", loginValidation, processLogin);

export default router;
export { processLogout, showDashboard };