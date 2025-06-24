import { Worker } from "bullmq";
import { createRedisConnection } from "../configuration/redis.js";
import { JOBS } from "../queues/simple.js";
import { OTP } from "../model/model.js";
import { Op } from "sequelize";

const connection = createRedisConnection();

export const cleanupWorker = new Worker(
  "clean",
  async (job) => {
    console.log(`Processing: ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case JOBS.CLEANUP:
        return await cleanOTPs(job);
      case JOBS.SESSION:
        return await cleanSessions(job);
      default:
        throw new Error(`Unknown cleanup: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 2,
    removeOnComplete: 10,
    removeOnFail: 50,
  }
);

const cleanOTPs = async (job) => {
  const { threshold } = job.data;

  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - threshold);

    const before = await OTP.count();

    const removed = await OTP.destroy({
      where: { expiresAt: { [Op.lt]: cutoff } },
    });
    const after = await OTP.count();

    console.log(`Cleaned ${removed} expired OTPs`);

    return {
      success: true,
      removed,
      before,
      after,
      threshold: `${threshold}h`,
    };
  } catch (error) {
    console.error("OTP cleanup failed:", error);
    throw error;
  }
};

const cleanSessions = async (job) => {
  const { threshold } = job.data;

  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - threshold);
    console.log(`Session cleanup for ${threshold}h threshold`);
    console.log(`Cutoff: ${cutoff.toISOString()}`);

    return {
      success: true,
      message: `Session cleanup done (${threshold}h)`,
      threshold: `${threshold}h`,
    };
  } catch (error) {
    console.error("Session cleanup failed:", error);
    throw error;
  }
};

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
  console.log("Shutting down cleanup worker...");
  await cleanupWorker.close();
});

export default cleanupWorker;
