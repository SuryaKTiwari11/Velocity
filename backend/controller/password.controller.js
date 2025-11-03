import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model/model.js";
import { sendOTP, verifyOTP } from "../helper/otpService.js";

export const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, msg: "Need email" });

    // Send OTP using the updated OTP service (already uses BullMQ)
    const result = await sendOTP(email, "verification");

    if (result.success) {
      return res.status(200).json({
        success: true,
        msg: "OTP generated and queued for sending",
        jobId: result.jobId,
        // Only show OTP in development
        otp: result.otp,
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: "Failed to send OTP",
        error: result.message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "OTP error",
      error: err.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, err: "Need email" });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        success: true,
        msg: "If email exists, you will get reset code",
      });
    }

    // Send password reset OTP (already uses BullMQ queue)
    const result = await sendOTP(email, "passReset");

    if (result.success) {
      return res.status(200).json({
        success: true,
        msg: "Password reset code generated and queued for sending",
        jobId: result.jobId,
        // Only show OTP in development
        otp: result.otp,
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: "Failed to send password reset code",
        error: result.message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Forgot password error",
      err: err.message,
    });
  }
};

export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, err: "need email and OTP" });

    const res1 = await verifyOTP(email, otp, "passReset");
    if (!res1.success)
      return res.status(400).json({ success: false, err: res1.message });

    const resetToken = jwt.sign(
      { email, purpose: "passReset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      msg: "OTP verified",
      resetToken: resetToken,
    });
  } catch (err) {
    return res.status(500).json({ success: false, err: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, email } = req.body;
    if (!resetToken || !newPassword)
      return res.status(400).json({
        success: false,
        err: "Need token and password",
      });

    let decodedData;
    try {
      decodedData = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        err:
          err.name === "TokenExpiredError"
            ? "Token expired. Plz try again."
            : "Bad token",
      });
    }

    if (!decodedData || decodedData.purpose !== "passReset")
      return res.status(400).json({ success: false, err: "Bad token" });

    const usr = await User.findOne({ where: { email: decodedData.email } });
    if (!usr)
      return res.status(404).json({ success: false, err: "User not found" });

    const isSame = await bcrypt.compare(newPassword, usr.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        err: "Cant use same password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(newPassword, salt);
    await usr.update({ password: hashedPass });
    // Clean up any password reset OTPs for this user
    await redisClient.del(`otp:${usr.email}:passReset`);
    return res.status(200).json({ success: true, msg: "Password reset done" });
  } catch (err) {
    return res.status(500).json({ success: false, err: err.message });
  }
};
