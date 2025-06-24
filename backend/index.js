import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import { testConn, initDB } from "./configuration/db.js";
import employeeRoutes from "./routes/employee.routes.js";
import userRoutes from "./routes/user.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import queueRoutes from "./routes/queues.js";
import cookieParser from "cookie-parser";
import { User, Employee, OTP } from "./model/model.js";
import passport from "./configuration/passport.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { setupOTPCleanup } from "./controller/otp.controller.js";
import { setupCleanupScheduler } from "./scheduler/cleanup.js";
import { start, stop } from "./workers/manager.js";
import { scheduleDaily } from "./queues/clean.js";
import { serverAdapter, adminAuth } from "./queues/board.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(rateLimiter);
const models = { User, Employee, OTP };
app.use((req, res, next) => {
  req.models = models;
  next();
});
app.use("/api/employees", employeeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/queues", queueRoutes);
app.use("/admin/queues", adminAuth, serverAdapter.getRouter());
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  const dbConnected = await testConn();
  if (dbConnected) {
    await initDB(models, false);

    //! Starting up the BullMQ workers
    start();

    //! Schedule recurring cleanup jobs
    await scheduleDaily();

    //! Setup cleanup processes
    setupCleanupScheduler();

    console.log("BullMQ system initialized successfully");
    console.log("Queue dashboard available at: /admin/queues");
  } else {
    console.error("connection Failed!");
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await stop();
  process.exit(0);
});
