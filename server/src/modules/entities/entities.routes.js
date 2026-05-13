import express from "express";
import { createEntity } from "./entities.controller.js";
import { authenticateToken, requireAdmin } from "../../shared/middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:type", authenticateToken, requireAdmin, createEntity);

export default router;
