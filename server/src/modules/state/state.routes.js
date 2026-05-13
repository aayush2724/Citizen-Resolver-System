import express from "express";
import { getEntireState } from "./state.controller.js";
import { authenticateToken } from "../../shared/middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateToken, getEntireState);

export default router;
