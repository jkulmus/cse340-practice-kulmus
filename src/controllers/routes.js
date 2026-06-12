import loginRoutes from "./forms/login.js";
import { processLogout, showDashboard } from "./forms/login.js";
import { requireLogin } from "../middleware/auth.js";

import { Router } from "express";
import { addDemoHeaders } from "../middleware/demo/headers.js";

import { catalogPage, courseDetailPage } from "./catalog/catalog.js";
import { facultyListPage, facultyDetailPage } from "./faculty/faculty.js";

import { homePage, aboutPage, demoPage, studentPage, testErrorPage } from "./index.js";

import contactRoutes from "./forms/contact.js";
import registrationRoutes from "./forms/registration.js";

const router = Router();

router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/student", studentPage);

router.get("/catalog", catalogPage);
router.get("/catalog/:courseId", courseDetailPage);

router.get("/faculty", facultyListPage);
router.get("/faculty/:slugId", facultyDetailPage);

router.get("/demo", addDemoHeaders, demoPage);

router.use("/register", registrationRoutes);

// test error route
router.get("/test-error", testErrorPage);

// contact form routes
router.use("/contact", contactRoutes);

// Login routes
router.use("/login", loginRoutes);

// Authentication routes
router.get("/logout", processLogout);
router.get("/dashboard", requireLogin, showDashboard);

export default router;
