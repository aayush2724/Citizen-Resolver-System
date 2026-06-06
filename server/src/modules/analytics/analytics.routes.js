import express from "express";
import { getAnalytics } from "./analytics.controller.js";
import { authenticateToken, requireAdmin } from "../../shared/middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateToken, requireAdmin, getAnalytics);

export default router;
