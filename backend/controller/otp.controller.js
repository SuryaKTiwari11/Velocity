import { sendOTP, verifyOTP, cleanupOldOTPs } from "../helper/otpService.js";
import { User } from "../model/model.js";
import { addOTP } from "../queues/email.js";
import { addCleanup } from "../queues/clean.js";

export const sendVerificationOTP = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, msg: "Need email" });
  try {
    const otpRes = await sendOTP(email);
    if (!otpRes.success)
      return res.status(500).json({ success: false, msg: otpRes.message });
    const user = await User.findOne({ where: { email } });
    const name = user?.name || "User";
    const jobRes = await addOTP(email, otpRes.otp, name);
    if (jobRes.success) {
      return res
        .status(200)
        .json({
          success: true,
          msg: "OTP queued for sending",
          jobId: jobRes.jobId,
        });
    }
    return res
      .status(500)
      .json({
        success: false,
        msg: "Failed to queue OTP email",
        error: jobRes.error,
      });
  } catch (err) {
    console.error("Error in sendVerificationOTP:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

export const verifyUserOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ success: false, msg: "Need email and OTP" });
  const otpRes = await verifyOTP(email, otp);
  if (!otpRes.success)
    return res
      .status(400)
      .json({ success: false, msg: otpRes.message, verified: false });
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      await user.update({ isVerified: true });
      console.log(`User ${email} verified`);
      await cleanupOldOTPs(email);
    } else {
      console.log(`Verified OTP but user not found`);
    }
    return res
      .status(200)
      .json({ success: true, msg: otpRes.message, verified: true });
  } catch (err) {
    console.error("Error updating user:", err);
    return res
      .status(500)
      .json({
        success: false,
        msg: "OTP verified but can't update user",
        err: err.message,
      });
  }
};


export const setupOTPCleanup = () => {
  cleanupOldOTPs();
  setInterval(cleanupOldOTPs, 60 * 60 * 1000);
};


export const adminCleanupOTPs = async (req, res) => {
  try {
    if (!req.user?.isAdmin)
      return res
        .status(403)
        .json({ success: false, msg: "Admin access required" });
    const jobRes = await addCleanup(24);
    if (jobRes.success) {
      return res
        .status(200)
        .json({
          success: true,
          msg: "OTP cleanup job queued successfully",
          jobId: jobRes.jobId,
        });
    }
    return res
      .status(500)
      .json({
        success: false,
        msg: "Failed to queue OTP cleanup job",
        error: jobRes.error,
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        msg: "Error during OTP cleanup",
        err: err.message,
      });
  }
};
