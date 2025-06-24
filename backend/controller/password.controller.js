import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model/model.js";
import { sendOTP, verifyOTP, cleanupOldOTPs } from "../helper/otpService.js";
import { addOTP, addReset } from "../queues/email.js";

export const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, msg: "Need email" });

    const r = await sendOTP(email);
    if (r.success) {
      // Get user name for email personalization
      const user = await User.findOne({ where: { email } });
      const userName = user ? user.name : "User"; // Add OTP email job to queue
      const emailJobResult = await addOTP(email, r.otp, userName);

      if (emailJobResult.success) {
        return res.status(200).json({
          success: true,
          msg: "OTP queued for sending",
          jobId: emailJobResult.jobId,
        });
      } else {
        return res.status(500).json({
          success: false,
          msg: "Failed to queue OTP email",
          error: emailJobResult.error,
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        msg: "cant send OTP",
        err: r.message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "OTP error",
      err: err.message,
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
        msg: "If email exists, u will get reset code",
      });
    }

    const res1 = await sendOTP(email, "passReset");
    if (res1.success) {
      // Add password reset email job to queue
      const emailJobResult = await addReset(email, res1.otp, user.name);

      if (emailJobResult.success) {
        return res.status(200).json({
          success: true,
          msg: "Password reset code queued for sending",
          jobId: emailJobResult.jobId,
        });
      } else {
        return res.status(500).json({
          success: false,
          msg: "Failed to queue password reset email",
          error: emailJobResult.error,
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        msg: res1.message,
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
    await cleanupOldOTPs(usr.email);

    return res.status(200).json({ success: true, msg: "Password reset done" });
  } catch (err) {
    return res.status(500).json({ success: false, err: err.message });
  }
};
