import express from "express";
import { markNotificationRead } from "./notifications.controller.js";
import { authenticateToken } from "../../shared/middlewares/auth.middleware.js";

const router = express.Router();

router.patch("/:id/read", authenticateToken, markNotificationRead);

export default router;
