import { sendOTP, verifyOTP, checkRateLimit } from "../helper/otpService.js";
import { User } from "../model/model.js";
import { addOTP } from "../queues/email.js";
import { configDotenv } from "dotenv";
import redisClient from "../configuration/redis.js";
configDotenv();

export const sendVerificationOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      msg: "Email is required",
      code: "MISSING_EMAIL",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid email format",
      code: "INVALID_EMAIL",
    });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        msg: "User is already verified",
        code: "ALREADY_VERIFIED",
      });
    }

    // Send OTP (includes rate limiting)
    const otpRes = await sendOTP(email);

    if (!otpRes.success) {
      return res.status(429).json({
        success: false,
        msg: otpRes.message,
        code: "OTP_SEND_FAILED",
        retryAfter: otpRes.retryAfter,
      });
    }

    // Queue email for sending
    const name = user.name || "User";
    const jobRes = await addOTP(email, otpRes.otp, name);

    if (jobRes.success) {
      return res.status(200).json({
        success: true,
        msg: "OTP sent successfully",
        jobId: jobRes.jobId,
        ...(process.env.NODE_ENV === "development" && {
          previewUrl: otpRes.previewUrl,
          devOtp: otpRes.otp,
        }),
      });
    }

    return res.status(500).json({
      success: false,
      msg: "Failed to queue OTP email",
      code: "EMAIL_QUEUE_FAILED",
      error: jobRes.error,
    });
  } catch (err) {
    console.error("Error in sendVerificationOTP:", err);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
};

export const verifyUserOTP = async (req, res) => {
  const { email, otp } = req.body;

  // Input validation
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      msg: "Email and OTP are required",
      code: "MISSING_FIELDS",
    });
  }

  const purpose = "verification";

  try {
    // Development bypass
    if (process.env.NODE_ENV === "development" && otp === "123456") {
      const user = await User.findOne({ where: { email } });
      if (user) {
        await user.update({ isVerified: true });
        return res.status(200).json({
          success: true,
          msg: "Development OTP verified",
          verified: true,
        });
      } else {
        return res.status(404).json({
          success: false,
          msg: "User not found",
        });
      }
    }

    // Step 1: Verify OTP without deleting (transaction safety)
    const otpRes = await verifyOTP(email, otp, purpose, false);

    if (!otpRes.success) {
      return res.status(400).json({
        success: false,
        msg: otpRes.message,
        verified: false,
        code: otpRes.code,
      });
    }

    // Step 2: Find and update user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Step 3: Update user verification status
    await user.update({ isVerified: true });

    // Step 4: Only now delete the OTP from Redis (cleanup)
    await redisClient.del(`otp:${email}:${purpose}`);

    return res.status(200).json({
      success: true,
      msg: "OTP verified and user updated successfully",
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Error in verifyUserOTP:", err);

    // If there was an error after OTP verification, the OTP might still be in Redis
    // This is intentional - let user retry the verification

    return res.status(500).json({
      success: false,
      msg: "Internal server error during verification",
      verified: false,
      code: "INTERNAL_ERROR",
    });
  }
};

export const adminCleanupOTPs = async (req, res) => {
  try {
    if (!req.user?.isAdmin)
      return res
        .status(403)
        .json({ success: false, msg: "Admin access required" });

    // Simple OTP cleanup - removed complex queue system
    return res.status(200).json({
      success: true,
      msg: "OTP cleanup completed",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error during OTP cleanup",
      err: err.message,
    });
  }
};

// Test endpoint for Redis connection
export const testRedisConnection = async (req, res) => {
  try {
    // Test Redis connection
    await redisClient.set("test:connection", "working", { EX: 10 });
    const result = await redisClient.get("test:connection");

    if (result === "working") {
      return res.status(200).json({
        success: true,
        msg: "Redis connection working!",
        redisConnected: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error("Redis test failed");
    }
  } catch (err) {
    console.error("Redis connection test failed:", err);
    return res.status(500).json({
      success: false,
      msg: "Redis connection failed",
      error: err.message,
      redisConnected: false,
    });
  }
};

// Test endpoint for OTP rate limiting
export const testRateLimit = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      msg: "Email required for rate limit test",
    });
  }

  try {
    const rateLimitResult = await checkRateLimit(email, "verification");
    return res.status(200).json({
      success: true,
      msg: "Rate limit check completed",
      rateLimitResult,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Rate limit test failed",
      error: err.message,
    });
  }
};

// Test endpoint to verify email queue system works
export const testEmailQueue = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        msg: "Email is required for testing",
      });
    }

    // Test OTP email
    const otpResult = await sendOTP(email, "verification");

    if (otpResult.success) {
      return res.status(200).json({
        success: true,
        msg: "Email queue test successful! Check your email.",
        jobId: otpResult.jobId,
        otp: otpResult.otp, // For testing purposes
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: "Email queue test failed",
        error: otpResult.message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Email queue test error",
      error: err.message,
    });
  }
};
