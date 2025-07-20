import { Queue, QueueEvents } from "bullmq";
import { createRedisConnection } from "../configuration/redis.js";

const connection = createRedisConnection();

export const JOBS = {
  OTP: "otp",
  RESET: "reset",
  WELCOME: "welcome",
  NOTIFY: "notify",
  CLEANUP: "cleanup",
  SESSION: "session",
  DOCUMENT: "process-document",
  INVITE: "invite",
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

export const cleanQ = new Queue("clean", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 50,
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
  },
});

export const documentQueue = new Queue("document", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 20,
    removeOnFail: 50,
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
  },
});

export const emailEvents = new QueueEvents("email", { connection });
export const cleanEvents = new QueueEvents("clean", { connection });
export const documentEvents = new QueueEvents("document", { connection });

emailEvents.on("completed", (job) => {
  // Email job completed
});
emailEvents.on("failed", (job, err) =>
  console.error(`Email job ${job.id} failed:`, err)
);
cleanEvents.on("completed", (job) => {
  // Clean job completed
});
cleanEvents.on("failed", (job, err) =>
  console.error(`Clean job ${job.id} failed:`, err)
);
documentEvents.on("completed", (job) => {
  // Document job completed
});
documentEvents.on("failed", (job, err) =>
  console.error(`Document job ${job.id} failed:`, err)
);

emailQ.on("error", (err) => console.error("Email queue error:", err));
cleanQ.on("error", (err) => console.error("Clean queue error:", err));
documentQueue.on("error", (err) => console.error("Document queue error:", err));

process.on("SIGTERM", async () => {
  // Shutting down queues
  await emailQ.close();
  await cleanQ.close();
  await documentQueue.close();
  await connection.quit();
});

export { connection };
