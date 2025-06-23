import { sendOTP, verifyOTP, cleanupOldOTPs } from "../helper/otpService.js";
import { User } from "../model/model.js";

export const sendVerificationOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, msg: "Need email" });
  }

  const r = await sendOTP(email);

  if (r.success) {
    return res.status(200).json({
      success: true,
      msg: r.message,
      previewUrl: r.previewUrl,
    });
  } else {
    return res.status(500).json({ success: false, msg: r.message });
  }
};

export const verifyUserOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, msg: "Need email and OTP" });
  }

  const rslt = await verifyOTP(email, otp);

  if (rslt.success) {
    try {
      const usr = await User.findOne({ where: { email } });

      if (usr) {
        await usr.update({ isVerified: true });
        console.log(`User ${email} verifyed`);

        // Clean up old OTPs for this user after successful verification
        // We'll keep the current OTP but remove any other older ones
        await cleanupOldOTPs(email);
      } else {
        console.log(`Verifyed OTP but user not found`);
      }

      return res.status(200).json({
        success: true,
        msg: rslt.message,
        verified: true,
      });
    } catch (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({
        success: false,
        msg: "OTP verifyed but cant update user",
        err: err.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      msg: rslt.message,
      verified: false,
    });
  }
};

// Periodically clean up old OTPs - run every hour
export const setupOTPCleanup = () => {
  // Initial cleanup when server starts
  cleanupOldOTPs();

  // Schedule cleanup every hour
  setInterval(() => {
    cleanupOldOTPs();
  }, 60 * 60 * 1000); // 1 hour in milliseconds
};

// Admin endpoint to manually trigger OTP cleanup
export const adminCleanupOTPs = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        msg: "Admin access required",
      });
    }

    // Count before cleanup
    const beforeCount = await OTP.count();

    // Perform cleanup
    await cleanupOldOTPs();

    // Count after cleanup
    const afterCount = await OTP.count();
    const removedCount = beforeCount - afterCount;

    return res.status(200).json({
      success: true,
      msg: "OTP database cleanup completed",
      stats: {
        before: beforeCount,
        after: afterCount,
        removed: removedCount,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error during OTP cleanup",
      err: err.message,
    });
  }
};
