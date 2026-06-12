import { Router } from "express";
import { validationResult } from "express-validator";
import { editValidation, registrationValidation } from "../../middleware/validation/forms.js";
import { requireLogin } from "../../middleware/auth.js";
import bcrypt from "bcrypt";
import {
  emailExists,
  saveUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../models/forms/registration.js";

const router = Router();

const showRegistrationForm = (req, res) => {
  res.render("forms/registration/form", {
    title: "User Registration",
  });
};

const processRegistration = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
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
    currentUser: req.session && req.session.user ? req.session.user : null,
  });
};

const showEditAccountForm = async (req, res) => {
  const targetUserId = Number.parseInt(req.params.id, 10);
  const currentUser = req.session.user;
  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    req.flash("error", "User not found.");
    return res.redirect("/register/list");
  }

  const canEdit = currentUser.id === targetUserId || currentUser.role_name === "admin";

  if (!canEdit) {
    req.flash("error", "You do not have permission to edit this account.");
    return res.redirect("/register/list");
  }

  res.render("forms/registration/edit", {
    title: "Edit Account",
    user: targetUser,
  });
};

const processEditAccount = async (req, res) => {
  const errors = validationResult(req);
  const targetUserId = Number.parseInt(req.params.id, 10);

  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });

    return res.redirect(`/register/${targetUserId}/edit`);
  }

  const currentUser = req.session.user;
  const { name, email } = req.body;

  try {
    const targetUser = await getUserById(targetUserId);

    if (!targetUser) {
      req.flash("error", "User not found.");
      return res.redirect("/register/list");
    }

    const canEdit = currentUser.id === targetUserId || currentUser.role_name === "admin";

    if (!canEdit) {
      req.flash("error", "You do not have permission to edit this account.");
      return res.redirect("/register/list");
    }

    const emailTaken = await emailExists(email);

    if (emailTaken && targetUser.email !== email) {
      req.flash("error", "An account with that email already exists.");
      return res.redirect(`/register/${targetUserId}/edit`);
    }

    await updateUser(targetUserId, name, email);

    if (currentUser.id === targetUserId) {
      req.session.user.name = name;
      req.session.user.email = email;
    }

    req.flash("success", "Account updated successfully.");
    res.redirect("/register/list");
  } catch (error) {
    console.error("Error updating user:", error);

    req.flash("error", "Unable to update account. Please try again later.");
    res.redirect(`/register/${targetUserId}/edit`);
  }
};

const processDeleteAccount = async (req, res) => {
  const targetUserId = Number.parseInt(req.params.id, 10);
  const currentUser = req.session.user;

  if (currentUser.role_name !== "admin") {
    req.flash("error", "You do not have permission to delete accounts.");
    return res.redirect("/register/list");
  }

  if (currentUser.id === targetUserId) {
    req.flash("error", "You cannot delete your own account.");
    return res.redirect("/register/list");
  }

  try {
    const deleted = await deleteUser(targetUserId);

    if (deleted) {
      req.flash("success", "User account deleted successfully.");
    } else {
      req.flash("error", "User not found or already deleted.");
    }
  } catch (error) {
    console.error("Error deleting user:", error);

    req.flash("error", "Unable to delete account. Please try again later.");
  }

  res.redirect("/register/list");
};

router.get("/", showRegistrationForm);
router.post("/", registrationValidation, processRegistration);
router.get("/list", showAllUsers);
router.get("/:id/edit", requireLogin, showEditAccountForm);
router.post("/:id/edit", requireLogin, editValidation, processEditAccount);
router.post("/:id/delete", requireLogin, processDeleteAccount);

export default router;
