import { sendOTP, verifyOTP, cleanupOldOTPs } from "../helper/otpService.js";
import { User } from "../model/model.js";
import { addOTP } from "../queues/email.js";
import { addCleanup } from "../queues/clean.js";

export const sendVerificationOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, msg: "Need email" });
  }

  try {
    // Generate OTP using existing service
    const r = await sendOTP(email);

    if (r.success) {
      // Instead of sending email directly, add it to queue
      const user = await User.findOne({ where: { email } });
      const userName = user ? user.name : "User";

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
      return res.status(500).json({ success: false, msg: r.message });
    }
  } catch (error) {
    console.error("Error in sendVerificationOTP:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
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
    } // Add cleanup job to queue instead of running directly
    const cleanupJobResult = await addCleanup(24);

    if (cleanupJobResult.success) {
      return res.status(200).json({
        success: true,
        msg: "OTP cleanup job queued successfully",
        jobId: cleanupJobResult.jobId,
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: "Failed to queue OTP cleanup job",
        error: cleanupJobResult.error,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error during OTP cleanup",
      err: err.message,
    });
  }
};
