import { Worker } from "bullmq";
import { createRedisConnection } from "../configuration/redis.js";
import { JOBS } from "../queues/simple.js";
import { OTP } from "../model/model.js";
import { Op } from "sequelize";

const connection = createRedisConnection();

const cleanOTPs = async (job) => {
  const { threshold } = job.data;
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - threshold);

  const before = await OTP.count();
  const removed = await OTP.destroy({
    where: { expiresAt: { [Op.lt]: cutoff } },
  });
  const after = await OTP.count();

  return {
    success: true,
    removed,
    before,
    after,
    threshold: `${threshold}h`,
  };
};

export const cleanupWorker = new Worker(
  "clean",
  async (job) => {
    if (job.name === JOBS.CLEANUP) {
      return await cleanOTPs(job);
    }
    throw new Error(`Unknown cleanup: ${job.name}`);
  },
  {
    connection,
    concurrency: 2,
    removeOnComplete: 10,
    removeOnFail: 50,
  }
);

cleanupWorker.on("completed", (job, result) => {
  console.log(`Clean job ${job.id} completed:`, result);
});

cleanupWorker.on("failed", (job, err) => {
  console.error(`Clean job ${job.id} failed:`, err.message);
});

cleanupWorker.on("error", (err) => {
  console.error("Cleanup worker error:", err);
});

process.on("SIGTERM", async () => {
  await cleanupWorker.close();
});

export default cleanupWorker;
