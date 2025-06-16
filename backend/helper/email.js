import nodemailer from "nodemailer";

//! NODE MAILER DOCUMENTATION
//! https://nodemailer.com/about/
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpFormat = (otp, name, purpose = "verification") => {
  const subject =
    purpose === "passReset" ? "Password Reset" : "OTP Verification";

  const message =
    purpose === "passReset"
      ? " your password reset code. will expire in 10 minutes."
      : " your verification code. will expire in 10 minutes.";

  return `
    <h1>${subject}</h1>
    <p>Dear ${name},</p>
    <p>${message}</p>
    <h2><strong>${otp}</strong></h2>
   
  `;
};

const otpMail = async (email, otp, name, purpose = "verification") => {
  try {
    const subject =
      purpose === "passReset" ? "Password Reset Code" : "OTP Verification";
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: otpFormat(otp, name, purpose),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      url: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error("Error in OTP email:", error);
    return {
      success: false,
      error: error.message,
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
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const testEmailService = async (testEmail) => {
  try {
    const testOtp = crypto.randomInt(100000, 999999).toString().padStart(6, "0");
    return await otpMail(testEmail, testOtp, "Test User");
  } catch (error) {
    console.error("Test email failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export { emailService, testEmailService, otpMail, otpFormat };

