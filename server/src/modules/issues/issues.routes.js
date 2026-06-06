import express from "express";
import { createIssue, updateIssue } from "./issues.controller.js";
import { authenticateToken, requireAdmin } from "../../shared/middlewares/auth.middleware.js";
import { issueLimiter } from "../../shared/middlewares/rate-limit.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, issueLimiter, createIssue);
router.patch("/:id", authenticateToken, requireAdmin, updateIssue);

export default router;
