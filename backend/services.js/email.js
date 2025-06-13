import nodemailer from "nodemailer";

// Use environment variables for email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// This configuration allows using environment variables
// while maintaining a fallback for development

const otpFormat = (otp, name, purpose = "email_verification") => {
  const subject =
    purpose === "password_reset" ? "Password Reset Code" : "OTP Verification";

  const message =
    purpose === "password_reset"
      ? "Here is your password reset code. It will expire in 10 minutes."
      : "Here is your verification code. It will expire in 10 minutes.";

  return `
    <h1>${subject}</h1>
    <p>Dear ${name},</p>
    <p>${message}</p>
    <h2 style="font-size: 24px; letter-spacing: 2px; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 5px;"><strong>${otp}</strong></h2>
    <p>If you didn't request this code, you can safely ignore this email.</p>
    <p>Thank you,<br>EMS Team</p>
  `;
};

const otpMail = async (email, otp, name, purpose = "email_verification") => {
  try {
    const subject =
      purpose === "password_reset" ? "Password Reset Code" : "OTP Verification";
    const mailOptions = {
      from: process.env.EMAIL_USER ,
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
  purpose = "email_verification"
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
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    return await otpMail(testEmail, testOtp, "Test User");
  } catch (error) {
    console.error("Test email failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Export all functions
export { emailService, testEmailService, otpMail, otpFormat };
export default emailService;
