import express from "express";
import {
  sendVerificationOTP,
  verifyUserOTP,
  checkOtpStatus,
} from "../controller/otp.controller.js";
import {
  otpRequestLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Apply rate limiters to specific routes
router.post("/send", otpRequestLimiter, sendVerificationOTP);
router.post("/verify", otpVerifyLimiter, verifyUserOTP);
router.get("/status", checkOtpStatus);

export default router;
