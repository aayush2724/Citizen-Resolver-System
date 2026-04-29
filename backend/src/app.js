import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import entityRoutes from "./routes/entity.routes.js";
import stateRoutes from "./routes/state.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { apiErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/entities", entityRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(apiErrorHandler);

export default app;
