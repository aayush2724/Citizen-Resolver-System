import express from "express";
import { markNotificationRead } from "../controllers/notification.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.patch("/:id/read", authenticateToken, markNotificationRead);

export default router;
