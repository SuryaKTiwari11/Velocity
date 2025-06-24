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


export const emailEvents = new QueueEvents("email", { connection });
export const cleanEvents = new QueueEvents("clean", { connection });


emailEvents.on("completed", (job) =>
  console.log(`Email job ${job.id} completed`)
);
emailEvents.on("failed", (job, err) =>
  console.error(`Email job ${job.id} failed:`, err)
);
cleanEvents.on("completed", (job) =>
  console.log(`Clean job ${job.id} completed`)
);
cleanEvents.on("failed", (job, err) =>
  console.error(`Clean job ${job.id} failed:`, err)
);

emailQ.on("error", (err) => console.error("Email queue error:", err));
cleanQ.on("error", (err) => console.error("Clean queue error:", err));


process.on("SIGTERM", async () => {
  console.log("Shutting down queues...");
  await emailQ.close();
  await cleanQ.close();
  await connection.quit();
});

export { connection };
