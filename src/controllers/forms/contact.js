import { Router } from "express";
import { validationResult } from "express-validator";
import { contactValidation } from "../../middleware/validation/forms.js";
import { createContactForm, getAllContactForms } from "../../models/forms/contact.js";

const router = Router();

/**
 * Display the contact form page
 */
const showContactForm = (req, res) => {
  res.render("forms/contact/form", {
    title: "Contact Us",
  });
};

/**
 * Handle contact form submission with validation
 */
const handleContactSubmission = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });

    return res.redirect("/contact");
  }

  const { subject, email, message } = req.body;

  try {
    await createContactForm(subject, message, email || null);

    req.flash("success", "Thank you for contacting us! We will respond soon.");
    res.redirect("/contact/responses");
  } catch (error) {
    console.error("Error saving contact form:", error);

    req.flash("error", "Unable to submit your message. Please try again later.");
    res.redirect("/contact");
  }
};

/**
 * Display all contact form submissions
 */
const showContactResponses = async (req, res) => {
  let contactForms = [];

  try {
    contactForms = await getAllContactForms();
  } catch (error) {
    console.error("Error retrieving contect forms:", error);
  }

  res.render("forms/contact/responses", {
    title: "Contact Form Submissions",
    contactForms,
  });
};

/**
 * GET / contact
 */
router.get("/", showContactForm);

/**
 * POST / contact
 */
router.post("/", contactValidation, handleContactSubmission);

/**
 * GET / contact/responses
 */
router.get("/responses", showContactResponses);

export default router;
