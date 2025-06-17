import { OTP, User } from "../model/model.js";
import { emailService } from "./email.js";
import crypto from "crypto";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";

const generateOTP = () => {
  const otp = crypto.randomInt(100000, 999999).toString().padStart(6, "0");
  return otp;
};

const sendOTP = async (email, purpose = "verification") => {
  try {
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 8);
    await OTP.create({
      email,
      otp: hashedOtp,
      verified: false,
      attempts: 0,
      purpose,
    });

    const emailResult = await emailService(email, otp, "User", purpose);

    if (emailResult.success) {
      console.log(
        "OTP email sent successfully with preview URL:",
        emailResult.url
      );
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

const verifyOTP = async (email, otp, purpose = "verification") => {
  try {
    const otpRecord = await OTP.findOne({
      where: {
        email,
        verified: false,
        purpose,
      },
      order: [["createdAt", "DESC"]], //!SABSE LATEST OTP
    });

    if (!otpRecord)
      return {
        success: false,
        message: "No OTP found.",
      };

    if (otpRecord.verified) {
      return {
        success: false,
        message: "OTP has already been used",
      };
    }

    if (otpRecord.attempts >= 5) {
      return {
        success: false,
        message: "max attempts reached",
      };
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await otpRecord.update({ attempts: otpRecord.attempts + 1 });
      return {
        success: false,
        message: "OTP has expired",
      };
    }

    const isValidOtp = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValidOtp) {
      await otpRecord.update({ attempts: otpRecord.attempts + 1 });

      return {
        success: false,
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
      };
    }

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

const hasVerifiedOTP = async (email, purpose = "verification") => {
  try {
    const verifiedOtp = await OTP.findOne({
      where: {
        email,
        verified: true,
        purpose,
        expiresAt: {
          [Op.gt]: new Date(),
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

//!RECENTLY MEI KOI VERIFIED OTP HO TOH HI AGYE BADHNA HAI , TIME CONSTRAINT WALA FACTOR IS THERE
//! this is used in verified OTP
