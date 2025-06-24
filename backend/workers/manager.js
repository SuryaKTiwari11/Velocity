import emailWorker from "./email.js";
import cleanupWorker from "./clean.js";

export const workers = [emailWorker, cleanupWorker];

export const start = () => {
  console.log("Starting workers...");
  workers.forEach((worker, i) => {
    console.log(`Worker ${i + 1}: ${worker.name}`);
  });
  console.log(`Total: ${workers.length} workers`);
  return workers;
};

export const stop = async () => {
  console.log("Stopping workers...");

  const promises = workers.map(async (worker) => {
    try {
      await worker.close();
      console.log(`${worker.name} stopped`);
    } catch (error) {
      console.error(`${worker.name} stop failed:`, error);
    }
  });

  await Promise.all(promises);
  console.log("All workers stopped");
};

export const status = () => {
  return workers.map((worker) => ({
    name: worker.name,
    running: worker.isRunning(),
    concurrency: worker.opts.concurrency,
  }));
};

export default { start, stop, status, workers };
