import { emailQ, JOBS } from "../queues/simple.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import redisClient from "../configuration/redis.js";
const generateOTP = () => {
  const otp = crypto.randomInt(100000, 999999).toString().padStart(6, "0");
  return otp;
};

const sendOTP = async (email, purpose = "verification") => {
  try {
    const rateLimitCheck = await checkRateLimit(email, purpose);
    if (!rateLimitCheck.success) {
      return rateLimitCheck;
    }

    const otp = generateOTP();
    // Hashing adds an extra layer of security
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Store in Redis with 5-minute expiry
    await redisClient.set(`otp:${email}:${purpose}`, hashedOtp, {
      EX: 300, // expires in 5 minutes
    });

    // Add email job to queue for background processing
    const jobType = purpose === "passReset" ? JOBS.RESET : JOBS.OTP;
    const emailJob = await emailQ.add(jobType, {
      email: email,
      otp: otp,
      name: "User",
      purpose: purpose,
    });

    return {
      success: true,
      message: "OTP generated and email queued for sending",
      jobId: emailJob.id,
      // Only return OTP in development - remove in production
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    };
  } catch (err) {
    console.error("Error sending OTP:", err);
    return {
      success: false,
      message: err.message,
    };
  }
};

//todo Improve the verifyUserOTP function in otp.controller.js
//todo Make it more robust with proper error handling
//todo Ensure user isVerified gets updated consistently
const verifyOTP = async (
  email,
  otp,
  purpose = "verification",
  deleteOnSuccess = true
) => {
  try {
    const otpHash = await redisClient.get(`otp:${email}:${purpose}`);
    if (!otpHash) {
      return {
        success: false,
        message: "OTP not found or expired",
        code: "OTP_NOT_FOUND",
      };
    }

    const validOtp = await bcrypt.compare(otp, otpHash);
    if (!validOtp) {
      return {
        success: false,
        message: "Invalid OTP",
        code: "INVALID_OTP",
      };
    }

    // Only delete if explicitly requested (for transaction safety)
    if (deleteOnSuccess) {
      await redisClient.del(`otp:${email}:${purpose}`);
    }

    return {
      success: true,
      message: "OTP verified successfully",
      code: "OTP_VERIFIED",
    };
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return {
      success: false,
      message: "Internal error during OTP verification",
      code: "INTERNAL_ERROR",
      error: err.message,
    };
  }
};

const checkRateLimit = async (email, purpose = "verification") => {
  try {
    const key = `rate_limit:otp:${email}:${purpose}`;
    const current = await redisClient.get(key);
    const limit = 5;

    if (current && parseInt(current) >= limit) {
      const ttl = await redisClient.ttl(key);
      return {
        success: false,
        message: `Too many OTP requests. Try again in ${Math.ceil(
          ttl / 60
        )} minutes.`,
        retryAfter: ttl,
      };
    }

    await redisClient.incr(key);
    await redisClient.expire(key, 3600); // 1 hour expiry

    return { success: true };
  } catch (err) {
    console.error("Rate limit check error:", err);
    // If Redis fails, allow the request (fail open)
    return { success: true };
  }
};

export { generateOTP, sendOTP, verifyOTP, checkRateLimit };
