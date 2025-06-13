import { sendOTP, verifyOTP, hasVerifiedOTP } from "../helper/otpService.js";
import { User } from "../model/index.js";

export const sendVerificationOTP = async (req, res) => {
  const { email, name = "User" } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const result = await sendOTP(email, name);

  if (result.success) {
    return res.status(200).json({
      success: true,
      message: result.message,
      previewUrl: result.previewUrl, // In production, you'd remove this
    });
  } else {
    return res.status(500).json({ success: false, message: result.message });
  }
};

export const verifyUserOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  // Verify OTP
  const result = await verifyOTP(email, otp);

  if (result.success) {
    try {
      // Update user's isVerified status to true
      const user = await User.findOne({ where: { email } });

      if (user) {
        await user.update({ isVerified: true });
        console.log(`User ${email} marked as verified after OTP verification`);
      } else {
        console.log(
          `Warning: Verified OTP for email ${email}, but user not found`
        );
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        verified: true,
      });
    } catch (error) {
      console.error("Error updating user verification status:", error);
      return res.status(500).json({
        success: false,
        message: "OTP verified but failed to update user status",
        error: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: result.message,
      verified: false,
    });
  }
};

export const checkOtpStatus = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email parameter is required" });
  }

  try {
    const verified = await hasVerifiedOTP(email);

    return res.status(200).json({
      success: true,
      verified,
      message: verified
        ? "Email has been verified"
        : "Email has not been verified",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking verification status",
      error: error.message,
    });
  }
};
