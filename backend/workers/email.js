import { Worker } from "bullmq";
import { createRedisConnection } from "../configuration/redis.js";
import { JOBS } from "../queues/simple.js";
import { emailService } from "../helper/email.js";

const connection = createRedisConnection();

// Handle OTP verification emails
const sendOTP = async (job) => {
  const { email, otp, name } = job.data;
  try {
    const result = await emailService(email, { otp }, name, "verification");
    if (result.success) {
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error || "OTP send failed");
    }
  } catch (error) {
    console.error(`❌ OTP failed for ${email}:`, error.message);
    throw error;
  }
};

// Handle password reset emails
const sendReset = async (job) => {
  const { email, otp, name } = job.data;
  try {
    const result = await emailService(email, { otp }, name, "passReset");
    if (result.success) {
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error || "Reset send failed");
    }
  } catch (error) {
    console.error(`❌ Reset failed for ${email}:`, error.message);
    throw error;
  }
};

// Handle company invitation emails
const sendInvite = async (job) => {
  const { email, inviteToken, companyId, name } = job.data;
  try {
    const result = await emailService(
      email,
      { inviteToken, companyId },
      name,
      "invite"
    );
    if (result.success) {
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error || "Invite send failed");
    }
  } catch (error) {
    console.error(`❌ Invite failed for ${email}:`, error.message);
    throw error;
  }
};

// Simple email worker
export const emailWorker = new Worker(
  "email",
  async (job) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🔄 Processing ${job.name} job for: ${job.data.email}`);
    }

    switch (job.name) {
      case JOBS.OTP:
        return await sendOTP(job);
      case JOBS.RESET:
        return await sendReset(job);
      case JOBS.INVITE:
        return await sendInvite(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 3, // Simple concurrency for student project
    removeOnComplete: 50,
    removeOnFail: 100,
  }
);

// Worker event listeners (only in development)
if (process.env.NODE_ENV === "development") {
  emailWorker.on("ready", () => {
    console.log("📧 Email worker is ready!");
  });

  emailWorker.on("error", (error) => {
    console.error("❌ Email worker error:", error);
  });
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down email worker...");
  await emailWorker.close();
});

export default emailWorker;
