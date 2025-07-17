// ...existing code...
import companyAdminRoutes from "./routes/company.admin.routes.js";
import models from "./model/model.js";
import nearbyRoutes from "./routes/nearby.routes.js";
import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./configuration/socket.js";
import sequelize, { testConn } from "./configuration/db.js";
import { adminOnly } from "./middleware/auth.middleware.js";
import superAdminRoutes from "./routes/superAdmin.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import userRoutes from "./routes/user.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import queueRoutes from "./routes/queue.routes.js";
import companyRouter from "./routes/company.routes.js"; // Import company routes
import analyticsRoutes from "./routes/analytics.routes.js";
import cookieParser from "cookie-parser";
import passport from "./configuration/passport.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { setupCleanupScheduler } from "./scheduler/cleanup.js";
import { setupAttendanceCleanup } from "./scheduler/attendanceCleanup.js";
import { start, stop } from "./workers/manager.js";
import { scheduleDaily } from "./queues/clean.js";
import { serverAdapter } from "./queues/board.js";
import paymentRoutes from "./routes/payment.routes.js";
import mapRoutes from "./routes/map.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js"; // New onboarding routes
import s3DocumentRoutes from "./routes/s3Document.routes.js";
import inviteRoutes from "./routes/invite.routes.js";
// import { blockUserCompanyIdInBody } from "./middleware/blockUserCompanyId.js";

import helmet from "helmet";
import morgan from "morgan";
configDotenv();
const app = express(),
  server = createServer(app),
  PORT = process.env.PORT || 3000;
export const io = initSocket(server);

app.use(helmet());
app.use(morgan("dev"));
app.use(
  express.json(),
  cookieParser(),
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
  passport.initialize(),
  rateLimiter
);


app.use((req, res, next) => {
  req.models = models;
  next();
});
app.use("/api/map", mapRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/company", companyAdminRoutes);
app.use("/api", companyRouter);
app.use("/api/nearby", nearbyRoutes);
app.use("/api/super-admin", superAdminRoutes);
//! Local document routes not NEEDED ->S3
//! app.use("/api/documents", documentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/audit", auditRoutes);
app.use("/admin", queueRoutes);
app.use("/api/chat", chatRoutes);
//! S3 document routes - main document system
app.use("/api/s3-documents", s3DocumentRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/admin/queues", adminOnly, serverAdapter.getRouter());
app.use("/api/onboarding", onboardingRoutes);

server.listen(PORT, async () => {
  // Server started
  if (await testConn()) {
    //!DONT DO TRUE, WILL REMOVE ALL DATA
    await sequelize.sync({ force: false });
    start();
    await scheduleDaily();
    setupCleanupScheduler();
    setupAttendanceCleanup();
    // BullMQ ready
  } else {
    console.error("DB connect fail");
  }
});

["SIGTERM", "SIGINT"].forEach((sig) =>
  process.on(sig, async () => {
    // Shutting down
    await stop();
    process.exit(0);
  })
);
