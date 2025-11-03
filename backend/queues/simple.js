import { Queue, QueueEvents as BullQueueEvents } from "bullmq";
import { createRedisConnection } from "../configuration/redis.js";

const connection = createRedisConnection();

export const JOBS = {
  OTP: "otp", // For email verification
  RESET: "reset", // For password reset
  INVITE: "invite", // For company invitations
};

export const emailQ = new Queue("email", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  },
});

export const emailEvents = new BullQueueEvents("email", { connection });

emailEvents.on("completed", (job) => {
  // Email job completed
});
emailEvents.on("failed", (job, err) =>
  console.error(`Email job ${job.id} failed:`, err)
);

emailQ.on("error", (err) => console.error("Email queue error:", err));

process.on("SIGTERM", async () => {
  // Shutting down queues
  await emailQ.close();
  await connection.quit();
});

export { connection };
