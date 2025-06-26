import express from "express";
import {
  sendVerificationOTP,
  verifyUserOTP,
  adminCleanupOTPs,
} from "../controller/otp.controller.js";
import { otpLimiter } from "../middleware/rateLimiter.middleware.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/send", otpLimiter, sendVerificationOTP);
router.post("/verify", otpLimiter, verifyUserOTP);
router.post("/admin/cleanup", protect, adminOnly, adminCleanupOTPs);

export default router;
