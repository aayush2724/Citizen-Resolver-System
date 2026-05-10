import { Router } from "express";
import * as messageController from "../controllers/message.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:issueId", authenticateToken, messageController.getIssueMessages);
router.post("/:issueId", authenticateToken, messageController.sendMessage);

export default router;
