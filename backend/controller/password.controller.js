import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model/index.js";
import { sendOTP, verifyOTP } from "../helper/otpService.js";

/**
 * Send OTP for email verification or other purposes
 */
export const sendEmailOTP = async (req, res) => {
  try {
    const { email, name = "User" } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const result = await sendOTP(email, name);
    if (result.success)
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        previewUrl: result.previewUrl,
      });
    else
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: result.message,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in OTP processing",
      error: error.message,
    });
  }
};

/**
 * Forgot password - sends reset code to user's email
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });

    // For security reasons, don't reveal if the email exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you'll receive a reset code",
      });
    }

    // Send OTP with purpose "password_reset"
    const result = await sendOTP(email, user.name, "password_reset");

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Reset code sent successfully",
        previewUrl: result.previewUrl,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send reset code",
        error: result.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in sending reset code",
      error: error.message,
    });
  }
};

/**
 * Verify the OTP sent for password reset
 */
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, error: "Email and OTP are required" });
    }

    // Verify the OTP using your OTP service with purpose "password_reset"
    const result = await verifyOTP(email, otp, "password_reset");
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.message });
    }

    // Generate a time-limited token for password reset
    const resetToken = jwt.sign(
      { email, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Short expiry for security
    );

    // Return the token for the next step
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Reset password using verified token
 */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Reset token and new password are required",
      });
    }

    // Password complexity validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          error: "Reset token has expired. Please request a new one.",
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid reset token",
        });
      }
    }

    // Check if token is for password reset
    if (!decoded || decoded.purpose !== "password_reset") {
      return res.status(400).json({
        success: false,
        error: "Invalid reset token",
      });
    }

    // Find the user
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    await user.update({ password: hashedPassword });

    // Return success
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
