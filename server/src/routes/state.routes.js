import express from "express";
import { getEntireState } from "../controllers/state.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateToken, getEntireState);

export default router;
