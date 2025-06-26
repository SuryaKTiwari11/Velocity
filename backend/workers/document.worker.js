import { Worker } from "bullmq";
import fs from "fs-extra";
import path from "path";
import { Document } from "../model/model.js";
import { createRedisConnection } from "../configuration/redis.js";
import { getSocket } from "../configuration/socket.js";

const connection = createRedisConnection();
const updateProgress = async (redisKey, io, userId, documentId, status) => {
  await connection.set(redisKey, status);
  io?.to(userId).emit("doc-progress", { documentId, status });
};

const processDocument = async (job) => {
  const { documentId, filePath, fileName, userId } = job.data;
  const redisKey = `doc:progress:${documentId}`;
  const io = getSocket();
  const permanentPath = path.join("uploads/documents/", fileName);

  try {
    await updateProgress(redisKey, io, userId, documentId, "starting");
    console.log(`Start: ${documentId}`);

    await updateProgress(redisKey, io, userId, documentId, "movingFile");
    await fs.ensureDir("uploads/documents/");
    await fs.move(filePath, permanentPath);
    console.log(`Moved: ${documentId}`);

    await updateProgress(redisKey, io, userId, documentId, "updatingDb");
    await Document.update(
      { filePath: permanentPath, status: "processed" },
      { where: { id: documentId } }
    );
    console.log(`DB updated: ${documentId}`);

    await updateProgress(redisKey, io, userId, documentId, "done");
    console.log(`Done: ${documentId}`);

    return { success: true, message: `Document ${fileName} processed` };
  } catch (error) {
    await updateProgress(redisKey, io, userId, documentId, "error");
    await Document.update({ status: "error" }, { where: { id: documentId } });
    console.error(`Error: ${documentId}`, error);
    throw error;
  }
};

const documentWorker = new Worker("document", processDocument, {
  connection,
  concurrency: 2, 
  removeOnComplete: 20,
  removeOnFail: 50,
});

documentWorker.on("completed", (job, result) => {
  console.log(`Job ${job.id} done:`, result.message);
});

documentWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

export default documentWorker;
