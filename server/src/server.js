import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { setIo } from "./modules/issues/issues.controller.js";
import "dotenv/config";

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(`user:${userId}`);
  }
  socket.on("disconnect", () => {});
});

// Wire socket.io into the issues controller for real-time notifications
setIo(io);

httpServer.listen(PORT, () => {
  console.log(`CivicResolve backend running on http://localhost:${PORT}`);
});
