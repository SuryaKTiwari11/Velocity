import { cleanQ, JOBS } from "./simple.js";

// Add cleanup jobs - shorter names
export const addCleanup = async (hours = 24) => {
  try {
    const job = await cleanQ.add(JOBS.CLEANUP, { threshold: hours });
    console.log(`Cleanup queued (${hours}h) (ID: ${job.id})`);
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue cleanup:", error);
    return { success: false, error: error.message };
  }
};

export const addSessionClean = async (hours = 168) => {
  try {
    const job = await cleanQ.add(JOBS.SESSION, { threshold: hours });
    console.log(`Session cleanup queued (${hours}h) (ID: ${job.id})`);
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue session cleanup:", error);
    return { success: false, error: error.message };
  }
};


export const scheduleDaily = async () => {
  try {
    //! Daily OTP cleanup at 3 AM
    await cleanQ.add(
      JOBS.CLEANUP,
      { threshold: 24 },
      {
        repeat: { pattern: "0 3 * * *" },
        removeOnComplete: 5,
        removeOnFail: 10,
      }
    );

    //! Weekly session cleanup on Sundays at 2 AM
    await cleanQ.add(
      JOBS.SESSION,
      { threshold: 168 },
      {
        repeat: { pattern: "0 2 * * 0" },
        removeOnComplete: 5,
        removeOnFail: 10,
      }
    );
    console.log("Recurring cleanup scheduled");
    return { success: true };
  } catch (error) {
    console.error("Failed to schedule cleanup:", error);
    return { success: false, error: error.message };
  }
};

export const getCleanStats = async () => {
  try {
    const waiting = await cleanQ.getWaiting();
    const active = await cleanQ.getActive();
    const completed = await cleanQ.getCompleted();
    const failed = await cleanQ.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  } catch (error) {
    console.error("Failed to get clean stats:", error);
    return null;
  }
};
