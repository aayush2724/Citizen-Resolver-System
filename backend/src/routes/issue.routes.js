import express from "express";
import { createIssue, updateIssue } from "../controllers/issue.controller.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, createIssue);
router.patch("/:id", authenticateToken, requireAdmin, updateIssue);

export default router;
