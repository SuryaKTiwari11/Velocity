import nodemailer from "nodemailer";

// Hardcoded Gmail SMTP configuration for testing
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "mailtoeasyply@gmail.com",
    pass: "yqbzkwdxpcbehwgk",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Email templates for different purposes
const getEmailTemplate = (data, purpose) => {
  const { name, otp, inviteToken, companyId } = data;

  switch (purpose) {
    case "verification":
      return {
        subject: "Email Verification - OTP Code",
        html: `
          <h2>🔐 Email Verification</h2>
          <p>Hi ${name},</p>
          <p>Please verify your email address with this OTP code:</p>
          <h1 style="color: #007bff; background: #f8f9fa; padding: 20px; text-align: center;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>Thanks!<br>EMS Team</p>
        `,
      };

    case "passReset":
      return {
        subject: "Password Reset - OTP Code",
        html: `
          <h2>🔑 Password Reset</h2>
          <p>Hi ${name},</p>
          <p>Use this code to reset your password:</p>
          <h1 style="color: #dc3545; background: #f8f9fa; padding: 20px; text-align: center;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Thanks!<br>EMS Team</p>
        `,
      };

    case "invite":
      return {
        subject: "Company Invitation - Join Our Team",
        html: `
          <h2>📨 You're Invited!</h2>
          <p>Hi ${name},</p>
          <p>You've been invited to join our company in the Employee Management System.</p>
          <p>Click the link below to accept the invitation:</p>
          <div style="text-align: center; margin: 20px;">
            <a href="http://localhost:5173/invite/${inviteToken}?company=${companyId}" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
               Accept Invitation
            </a>
          </div>
          <p>Or copy this link: http://localhost:5173/invite/${inviteToken}?company=${companyId}</p>
          <p>Welcome aboard!<br>EMS Team</p>
        `,
      };

    default:
      throw new Error(`Unknown email purpose: ${purpose}`);
  }
};

// Main email service function
const emailService = async (
  email,
  data,
  name = "User",
  purpose = "verification"
) => {
  try {
    const template = getEmailTemplate({ ...data, name }, purpose);

    const mailOptions = {
      from: "mailtoeasyply@gmail.com",
      to: email,
      subject: template.subject,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    // Log success for development
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Email sent: ${purpose} to ${email}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      purpose: purpose,
    };
  } catch (err) {
    // Log errors for debugging
    console.error(`❌ Email failed (${purpose}):`, err.message);
    return {
      success: false,
      error: err.message,
      purpose: purpose,
    };
  }
};

export { emailService };
