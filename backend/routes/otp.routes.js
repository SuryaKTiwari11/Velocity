import express from "express";
import {
  sendVerificationOTP,
  verifyUserOTP,
  checkOtpStatus,
} from "../controller/otp.controller.js";
import { otpLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();
router.post("/send", otpLimiter, sendVerificationOTP);
router.post("/verify", otpLimiter, verifyUserOTP);
router.get("/status", checkOtpStatus);

export default router;
  