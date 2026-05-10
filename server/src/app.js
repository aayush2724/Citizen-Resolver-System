import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import entityRoutes from "./routes/entity.routes.js";
import stateRoutes from "./routes/state.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import bugReportRoutes from "./routes/bugreport.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { apiErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/entities", entityRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bug-reports", bugReportRoutes);
app.use("/api/messages", messageRoutes);

app.use(apiErrorHandler);

export default app;
