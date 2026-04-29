import express from "express";
import { createEntity } from "../controllers/entity.controller.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:type", authenticateToken, requireAdmin, createEntity);

export default router;
