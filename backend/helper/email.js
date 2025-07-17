import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10,
});

const otpFormat = (otp, name, purpose = "verification") => {
  const subj = purpose === "passReset" ? "Password Reset" : "OTP Verification";

  const msg =
    purpose === "passReset"
      ? " your password reset code. will expire in 10 minutes."
      : " your verification code. will expire in 10 minutes.";

  return `
    <h1>${subj}</h1>
    <p>Dear ${name},</p>
    <p>${msg}</p>
    <h2><strong>${otp}</strong></h2>
   
  `;
};

const otpMail = async (email, otp, name, purpose = "verification") => {
  try {
    const subj =
      purpose === "passReset" ? "Password Reset Code" : "OTP Verification";
    const mailOpts = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subj,
      html: otpFormat(otp, name, purpose),
    };

    const info = await transporter.sendMail(mailOpts);

    return {
      success: true,
      messageId: info.messageId,
      url: nodemailer.getTestMessageUrl(info),
    };
  } catch (err) {
    console.error("OTP email err:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};
const emailService = async (
  email,
  otp,
  name = "User",
  purpose = "verification"
) => {
  try {
    return await otpMail(email, otp, name, purpose);
  } catch (err) {
    // email error
    return {
      success: false,
      error: err.message,
    };
  }
};

export { emailService };
