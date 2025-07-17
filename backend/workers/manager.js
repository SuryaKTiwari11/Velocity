import emailWorker from "./email.js";
import cleanupWorker from "./clean.js";
import documentWorker from "./document.worker.js";

export const workers = [emailWorker, cleanupWorker, documentWorker];

export const start = () => {
  workers.forEach((worker, i) => {
    // Worker started
  });
  // Total workers
  return workers;
};

export const stop = async () => {
  const promises = workers.map(async (worker) => {
    try {
      await worker.close();
      // Worker stopped
    } catch (error) {
      console.error(`${worker.name} stop failed:`, error);
    }
  });

  await Promise.all(promises);
};

export const status = () => {
  return workers.map((worker) => ({
    name: worker.name,
    running: worker.isRunning(),
    concurrency: worker.opts.concurrency,
  }));
};

export default { start, stop, status, workers };
