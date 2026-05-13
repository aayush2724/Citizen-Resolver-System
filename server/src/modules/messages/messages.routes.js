import { Router } from "express";
import * as messageController from "./messages.controller.js";
import { authenticateToken } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.get("/:issueId", authenticateToken, messageController.getIssueMessages);
router.post("/:issueId", authenticateToken, messageController.sendMessage);

export default router;
