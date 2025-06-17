import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model/model.js";
import { sendOTP, verifyOTP } from "../helper/otpService.js";

export const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const result = await sendOTP(email);
    if (result.success)
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        previewUrl: result.previewUrl,
      });
    else
      return res.status(500).json({
        success: false,
        message: "failed to send OTP",
        error: result.message,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in OTP processing",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you'll receive a reset code",
      });
    }

    const result = await sendOTP(email, "passReset");
    return res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.success
        ? "Reset code sent successfully"
        : "Failed to send reset code",
      ...(result.success && { previewUrl: result.previewUrl }),
      ...(!result.success && { error: result.message }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in sending reset code",
      error: error.message,
    });
  }
};

export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, error: "email and OTP are required" });

    const result = await verifyOTP(email, otp, "passReset");
    if (!result.success)
      return res.status(400).json({ success: false, error: result.message });

    const resetToken = jwt.sign(
      { email, purpose: "passReset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword)
      return res.status(400).json({
        success: false,
        error: "Reset token and new password are required",
      });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error:
          error.name === "TokenExpiredError"
            ? "Reset token has expired. Please request a new one."
            : "Invalid reset token",
      });
    }

    if (!decoded || decoded.purpose !== "passReset")
      return res
        .status(400)
        .json({ success: false, error: "Invalid reset token" });
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
