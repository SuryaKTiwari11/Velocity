import { OTP } from "../model/model.js";
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
    await OTP.update(
      { verified: true },
      {
        where: {
          email,
          purpose,
          verified: false,
        },
      }
    );

    const otp = generateOTP();
    const hashOtp = await bcrypt.hash(otp, 8);
    await OTP.create({
      email,
      otp: hashOtp,
      verified: false,
      attempts: 0,
      purpose,
    });

    const emailRes = await emailService(email, otp, "User", purpose);

    if (emailRes.success) {
      // OTP email sent
      return {
        success: true,
        previewUrl: emailRes.url,
        message: "OTP sent",
      };
    } else {
      throw new Error("Cant send OTP");
    }
  } catch (err) {
    console.error("Error sending OTP:", err);
    return {
      success: false,
      message: err.message,
    };
  }
};

const cleanupOldOTPs = async (email = null) => {
  try {
    const whereCondition = {
      [Op.or]: [
        { expiresAt: { [Op.lt]: new Date() } },
        {
          verified: true,
          createdAt: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      ],
    };

    await OTP.destroy({ where: whereCondition });
  } catch (err) {
    console.error("Error cleaning up old OTPs:", err);
  }
};

const verifyOTP = async (email, otp, purpose = "verification") => {
  try {
    await cleanupOldOTPs(email);

    const otpRec = await OTP.findOne({
      where: {
        email,
        verified: false,
        purpose,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRec)
      return {
        success: false,
        message: "No OTP found",
      };

    if (otpRec.verified) {
      return {
        success: false,
        message: "OTP already used",
      };
    }

    if (otpRec.attempts >= 5) {
      return {
        success: false,
        message: "max tries reached",
      };
    }

    if (new Date() > new Date(otpRec.expiresAt)) {
      await otpRec.update({ attempts: otpRec.attempts + 1 });
      return {
        success: false,
        message: "OTP expired",
      };
    }

    const validOtp = await bcrypt.compare(otp, otpRec.otp);

    if (!validOtp) {
      await otpRec.update({ attempts: otpRec.attempts + 1 });

      return {
        success: false,
        message: `Wrong OTP. ${5 - otpRec.attempts} tries left.`,
      };
    }
    await otpRec.update({ verified: true });

    return {
      success: true,
      message: "OTP verified",
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const hasVerifiedOTP = async (email, purpose = "verification") => {
  try {
    const vrfyOtp = await OTP.findOne({
      where: {
        email,
        verified: true,
        purpose,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      //!RECENTLY MEI KOI VERIFIED OTP HO TOH HI AGYE BADHNA HAI , TIME CONSTRAINT WALA FACTOR IS THERE
      //! this is used in verified OTP
      order: [["createdAt", "DESC"]],
    });

    return !!vrfyOtp;
  } catch (err) {
    console.error("OTP check err:", err);
    return false;
  }
};

export { generateOTP, sendOTP, verifyOTP, hasVerifiedOTP, cleanupOldOTPs };
