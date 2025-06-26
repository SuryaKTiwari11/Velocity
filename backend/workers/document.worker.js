import { Worker } from "bullmq";
import fs from "fs-extra";
import path from "path";
import { Document } from "../model/model.js";
import { createRedisConnection } from "../configuration/redis.js";
import { getSocket } from "../configuration/socket.js";

const redis = createRedisConnection();

const setProgress = async (key, io, user, doc, status) => {
  await redis.set(key, status);
  io?.to(user).emit("doc-progress", { documentId: doc, status });
};
const sleep = (ms) => new Promise((res) => setTimeout(res, ms)); 
//!since we are doing it on local host , and thing happen very fast 
//! i have choosen to use sleep to simulate the time taken for each step

const handleDoc = async (job) => {
  const {
    documentId: docId,
    filePath: tempPath,
    fileName,
    userId: user,
  } = job.data;
  const key = `doc:progress:${docId}`;
  const io = getSocket();
  const destPath = path.join("uploads/documents/", fileName);

  try {
    //!1 and //2
    await setProgress(key, io, user, docId, "starting");
    await sleep(1200);
    await setProgress(key, io, user, docId, "movingFile");
    await sleep(1500);

    await fs.ensureDir("uploads/documents/");
    await fs.move(tempPath, destPath);

    //!3
    await setProgress(key, io, user, docId, "updatingDb");
    await sleep(1200);
    await Document.update(
      { filePath: destPath, status: "processed" },
      { where: { id: docId } }
    );
    //!4
    await setProgress(key, io, user, docId, "done");

    return { success: true, message: `Document ${fileName} processed` };
  } catch (err) {
    await setProgress(key, io, user, docId, "error");
    await Document.update({ status: "error" }, { where: { id: docId } });
    throw err;
  }
};

const worker = new Worker("document", handleDoc, {
  connection: redis,
  concurrency: 2,
  removeOnComplete: 20,
  removeOnFail: 50,
});

export default worker;
