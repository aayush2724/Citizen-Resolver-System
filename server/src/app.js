import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { apiErrorHandler } from "./shared/middlewares/error.middleware.js";
import { generalLimiter } from "./shared/middlewares/rate-limit.middleware.js";
import healthRoutes from "./modules/health/health.routes.js";
import { classifyIssue } from "./shared/utils/aiClassifier.js";

// Module imports
import authRoutes from "./modules/auth/auth.routes.js";
import issueRoutes from "./modules/issues/issues.routes.js";
import entityRoutes from "./modules/entities/entities.routes.js";
import stateRoutes from "./modules/state/state.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";
import bugReportRoutes from "./modules/bug-reports/bug-reports.routes.js";
import messageRoutes from "./modules/messages/messages.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import tenantServiceRoutes from "../services/tenant/index.js";
import billingServiceRoutes from "../services/billing/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  next();
});

// General rate limiting
app.use(generalLimiter);

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: corsOrigin === "*" ? true : corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));

// Serve uploaded images statically
const uploadsDir = path.join(__dirname, "../../../uploads");
app.use("/uploads", express.static(uploadsDir));

// Register module routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/entities", entityRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bug-reports", bugReportRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);

// AI classification endpoint (no auth required — used in real-time by report form)
app.post("/api/classify", (req, res) => {
  const { title = "", description = "" } = req.body;
  res.json(classifyIssue(title, description));
});

// Platform services (tenant, billing)
app.use("/api/tenants", tenantServiceRoutes);
app.use("/api/billing", billingServiceRoutes);

// Global error handler
app.use(apiErrorHandler);

export default app;
