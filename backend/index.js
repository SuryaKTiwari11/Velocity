import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import { testConnection, initializeDatabase } from "./configuration/db.js";
import employeeRoutes from "./routes/employee.routes.js";
import userRoutes from "./routes/user.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import cookieParser from "cookie-parser";
import { initializeModels } from "./model/index.js";
import passport from "./configuration/passport.js";
import { rateLimiterMiddleware } from "./middleware/rateLimiter.middleware.js";

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
app.use(rateLimiterMiddleware);

// Initialize models and attach to request object
const models = initializeModels();
app.use((req, res, next) => {
  req.models = models;
  next();
});

// Set up API routes
app.use("/api/employees", employeeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Test database connection
  const dbConnected = await testConnection();

  if (dbConnected) {
    // Sync models with database (non-destructive)
    await initializeDatabase(models, false);
  } else {
    console.error(
      "❌ Warning: Database connection failed. API may not work properly."
    );
  }
});
