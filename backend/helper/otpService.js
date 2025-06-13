import { OTP } from "../model/index.js";
import emailService from "../services.js/email.js";
import crypto from "crypto";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";

const generateOTP = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};

const sendOTP = async (
  email,
  name = "User",
  purpose = "email_verification"
) => {
  try {
    // Generate a new OTP
    const otp = generateOTP();

    // Hash the OTP before storing it
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store hashed OTP in database (with automatic expiry time from model default)
    await OTP.create({
      email,
      otp: hashedOtp,
      verified: false,
      attempts: 0,
      purpose,
    });

    // Send the plain text OTP via email (not the hashed version)
    const emailResult = await emailService(email, otp, name);

    if (emailResult.success) {
      return {
        success: true,
        previewUrl: emailResult.url,
        message: "OTP sent successfully",
      };
    } else {
      throw new Error("Failed to send OTP email");
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

const verifyOTP = async (email, otp, purpose = "email_verification") => {
  try {
    // Find the most recent OTP for this email and purpose (we'll check verification status later)
    const otpRecord = await OTP.findOne({
      where: {
        email,
        verified: false,
        purpose,
      },
      order: [["createdAt", "DESC"]],
    });

    // If no record found
    if (!otpRecord) {
      return {
        success: false,
        message: "No OTP found for this email. Please request a new one.",
      };
    }

    // 1. Check if OTP has already been used
    if (otpRecord.verified) {
      return {
        success: false,
        message: "OTP has already been used",
      };
    }

    // 2. Check if max attempts reached
    if (otpRecord.attempts >= 5) {
      return {
        success: false,
        message: "Max attempts reached. Please request a new OTP.",
      };
    }

    // 3. Check if OTP has expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await otpRecord.update({ attempts: otpRecord.attempts + 1 });
      return {
        success: false,
        message: "OTP has expired",
      };
    }

    // 4. Verify the OTP (compare hash)
    const isValidOtp = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValidOtp) {
      // Increment attempts counter for failed verification
      await otpRecord.update({ attempts: otpRecord.attempts + 1 });

      return {
        success: false,
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
      };
    }

    // 5. Mark OTP as verified on success
    await otpRecord.update({ verified: true });

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

const hasVerifiedOTP = async (email, purpose = "email_verification") => {
  try {
    const verifiedOtp = await OTP.findOne({
      where: {
        email,
        verified: true,
        purpose,
        expiresAt: {
          [Op.gt]: new Date(), // Not expired
        },
      },
      order: [["createdAt", "DESC"]],
    });

    return !!verifiedOtp;
  } catch (error) {
    console.error("Error checking OTP verification status:", error);
    return false;
  }
};

export { generateOTP, sendOTP, verifyOTP, hasVerifiedOTP };
