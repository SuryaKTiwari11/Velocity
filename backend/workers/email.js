import { Worker } from "bullmq";
import { createRedisConnection } from "../configuration/redis.js";
import { JOBS } from "../queues/simple.js";
import { emailService } from "../helper/email.js";

const connection = createRedisConnection();

export const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log(`Processing: ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case JOBS.OTP:
        return await sendOTP(job);
      case JOBS.RESET:
        return await sendReset(job);
      case JOBS.WELCOME:
        return await sendWelcome(job);
      case JOBS.NOTIFY:
        return await sendNotify(job);
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

const sendOTP = async (job) => {
  const { email, otp, name } = job.data;

  try {
    const result = await emailService(email, otp, name, "verification");
    if (result.success) {
      console.log(`OTP sent to ${email}`);
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
      console.log(`Reset sent to ${email}`);
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error || "Reset send failed");
    }
  } catch (error) {
    console.error(`Reset failed for ${email}:`, error);
    throw error;
  }
};

const sendWelcome = async (job) => {
  const { email, name } = job.data;

  try {
    console.log(`Welcome sent to ${email} for ${name}`);
    return { success: true, message: `Welcome processed for ${email}` };
  } catch (error) {
    console.error(`Welcome failed for ${email}:`, error);
    throw error;
  }
};
//TODO: -> COMBINE THESE INTO  FUNCTION IF POSSIBLE 
const sendNotify = async (job) => {
  const { email, subject, message, name } = job.data;

  try {
    console.log(`Notification sent to ${email}: ${subject}`);
    return { success: true, message: `Notification processed for ${email}` };
  } catch (error) {
    console.error(`Notification failed for ${email}:`, error);
    throw error;
  }
};

// Events
emailWorker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

emailWorker.on("error", (err) => {
  console.error("Email worker error:", err);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down email worker...");
  await emailWorker.close();
});

export default emailWorker;
