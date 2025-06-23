import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { configDotenv } from "dotenv";
configDotenv();

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "",
  maxRetriesPerRequest: null,
});
//! In order to start working with a Queue,
// !a connection to a Redis instance is necessary.
//! ~ documentation: https://docs.bullmq.io/guide/queues

export const createQueue = (name) => {
  return new Queue(name, {
    connection: connection(),
    defaultJobOptions: {
      attempts: 3, //! Retry failed jobs up to 3 times
      backoff: {
        // Exponential backoff for retries
        type: "exponential",
        delay: 1000, // Starting delay of 1 second
      },
      removeOnComplete: 100,
      removeOnFail: 100,
      //! https://docs.bullmq.io/guide/queues/auto-removal-of-jobs
    },
  });
};

export const createQueueEvents = (name) => {
  return new QueueEvents(name, {
    connection: connection(),
  });
};

const emailQueue = createQueue('emailQueue');
const reportQueue = createQueue('reportQueue');
const cleanupQueue = createQueue('cleanupQueue');

export { emailQueue, reportQueue, cleanupQueue };
