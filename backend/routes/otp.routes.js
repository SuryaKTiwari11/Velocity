import express from "express";
import {
  sendVerificationOTP,
  verifyUserOTP,
  adminCleanupOTPs,
  testRedisConnection,
  testRateLimit,
  testEmailQueue,
} from "../controller/otp.controller.js";
import { otpLimiter } from "../middleware/rateLimiter.middleware.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Main OTP routes
router.post("/send", otpLimiter, sendVerificationOTP);
router.post("/verify", otpLimiter, verifyUserOTP);

// Admin routes
router.post("/admin/cleanup", protect, adminOnly, adminCleanupOTPs);

// Test routes (development only)
if (process.env.NODE_ENV === "development") {
  router.get("/test/redis", testRedisConnection);
  router.post("/test/rate-limit", testRateLimit);
  router.post("/test/email-queue", testEmailQueue);
}

export default router;
