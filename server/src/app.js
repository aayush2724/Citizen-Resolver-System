import express from "express";
import cors from "cors";
import "dotenv/config";
import { apiErrorHandler } from "./shared/middlewares/error.middleware.js";

// Module imports
import authRoutes from "./modules/auth/auth.routes.js";
import issueRoutes from "./modules/issues/issues.routes.js";
import entityRoutes from "./modules/entities/entities.routes.js";
import stateRoutes from "./modules/state/state.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";
import bugReportRoutes from "./modules/bug-reports/bug-reports.routes.js";
import messageRoutes from "./modules/messages/messages.routes.js";
import tenantServiceRoutes from "../services/tenant/index.js";
import billingServiceRoutes from "../services/billing/index.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Register module routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/entities", entityRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bug-reports", bugReportRoutes);
app.use("/api/messages", messageRoutes);
// Platform services (tenant, billing)
app.use("/api/tenants", tenantServiceRoutes);
app.use("/api/billing", billingServiceRoutes);

// Global error handler
app.use(apiErrorHandler);

export default app;
