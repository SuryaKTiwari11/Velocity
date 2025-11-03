import companyAdminRoutes from "./routes/company.admin.routes.js";
import models from "./model/model.js";
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
import cookieParser from "cookie-parser";
import passport from "./configuration/passport.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { emailWorker } from "./workers/email.js"; // Simple email worker
import paymentRoutes from "./routes/payment.routes.js";
import mapRoutes from "./routes/map.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js"; // New onboarding routes
import s3DocumentRoutes from "./routes/s3Document.routes.js";
import inviteRoutes from "./routes/invite.routes.js";
import { cleanupRedisOnStartup } from "./services/attendanceService.js";

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
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/audit", auditRoutes);
app.use("/admin", queueRoutes);
app.use("/api/s3-documents", s3DocumentRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/onboarding", onboardingRoutes);

server.listen(PORT, async () => {
  // Server started
  if (await testConn()) {
    //!DONT DO TRUE, WILL REMOVE ALL DATA
    await sequelize.sync({ force: false });

    // Start email worker only
    console.log("📧 Starting email worker...");

    // 🚀 Initialize Redis session management
    console.log("🚀 Initializing Redis session management...");
    try {
      // Simple Redis cleanup on startup
      await cleanupRedisOnStartup();
      console.log("✅ Redis session cleanup completed");
    } catch (error) {
      console.error("❌ Redis initialization failed:", error.message);
    }

    console.log("🎉 Server working with Redis session management!");
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
