import express from "express";
import { submitBugReport, getBugReports } from "./bug-reports.controller.js";
import { authenticateToken, requireAdmin, optionalAuth } from "../../shared/middlewares/auth.middleware.js";

const router = express.Router();

// Any user (including guests) can submit a bug report
router.post("/", optionalAuth, submitBugReport);

// Only admins can view all submitted reports
router.get("/", authenticateToken, requireAdmin, getBugReports);

export default router;
