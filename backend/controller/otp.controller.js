import { sendOTP, verifyOTP } from "../helper/otpService.js";
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
