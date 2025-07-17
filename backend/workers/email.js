import { Worker } from "bullmq";
import { createRedisConnection } from "../configuration/redis.js";
import { JOBS } from "../queues/simple.js";
import { emailService } from "../helper/email.js";

const connection = createRedisConnection();
const sendInvite = async (job) => {
  const { email, inviteToken, companyId } = job.data;
  try {
    const result = await emailService(email, inviteToken, companyId, "invite");
    if (result.success) {
      // Invite sent
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error || "Invite send failed");
    }
  } catch (error) {
    console.error(`Invite failed for ${email}:`, error);
    throw error;
  }
};

const sendOTP = async (job) => {
  const { email, otp, name } = job.data;
  try {
    const result = await emailService(email, otp, name, "verification");
    if (result.success) {
      // OTP sent
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error || "OTP send failed");
    }
  } catch (error) {
    console.error(`OTP failed for ${email}:`, error);
    throw error;
  }
};

const sendReset = async (job) => {
  const { email, otp, name } = job.data;
  try {
    const result = await emailService(email, otp, name, "passReset");
    if (result.success) {
      // Reset sent
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error || "Reset send failed");
    }
  } catch (error) {
    console.error(`Reset failed for ${email}:`, error);
    throw error;
  }
};

export const emailWorker = new Worker(
  "email",
  async (job) => {
    // Processing job
    switch (job.name) {
      case JOBS.OTP:
        return await sendOTP(job);
      case JOBS.RESET:
        return await sendReset(job);
      case JOBS.INVITE:
        return await sendInvite(job);
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: 50,
    removeOnFail: 100,
  }
);

process.on("SIGTERM", async () => {
  // Shutting down email worker
  await emailWorker.close();
});

export default emailWorker;
