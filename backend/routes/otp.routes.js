import express from "express";
import {
  sendVerificationOTP,
  verifyUserOTP,
} from "../controller/otp.controller.js";
import { otpLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();
router.post("/send", otpLimiter, sendVerificationOTP);
router.post("/verify", otpLimiter, verifyUserOTP);

export default router;
