import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./configuration/socket.js";
import { testConn, initDB } from "./configuration/db.js";
import employeeRoutes from "./routes/employee.routes.js";
import userRoutes from "./routes/user.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import queueRoutes from "./routes/queues.js";
import documentRoutes from "./routes/document.routes.js";
import cookieParser from "cookie-parser";
import { User, Employee, OTP, Document } from "./model/model.js";
import passport from "./configuration/passport.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { setupCleanupScheduler } from "./scheduler/cleanup.js";
import { start, stop } from "./workers/manager.js";
import { scheduleDaily } from "./queues/clean.js";
import { serverAdapter, adminAuth } from "./queues/board.js";
import paymentRoutes from "./routes/payment.routes.js";

configDotenv();
const app = express(),
  server = createServer(app),
  PORT = process.env.PORT || 3000;
initSocket(server); 
console.log("Socket.io ready");

app.use(
  express.json(),
  cookieParser(),
  cors({ origin: "http://localhost:5173", credentials: true }),
  passport.initialize(),
  rateLimiter
);
const models = { User, Employee, OTP, Document };
app.use((req, res, next) => {
  req.models = models;
  next();
});
app.use("/api/employees", employeeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/admin/queues", adminAuth, serverAdapter.getRouter());

server.listen(PORT, async () => {
  console.log(`Server @${PORT}`);
  if (await testConn()) {
    await initDB(models, false);
    start();
    await scheduleDaily();
    setupCleanupScheduler();
    console.log("BullMQ ready @/admin/queues");
  } else {
    console.error("DB connect fail");
  }
});

["SIGTERM", "SIGINT"].forEach((sig) =>
  process.on(sig, async () => {
    console.log(`Shutting down (${sig})`);
    await stop();
    process.exit(0);
  })
);
