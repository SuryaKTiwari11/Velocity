import express from "express";
import {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
  getAllFiles,
  updateFileStatus,
  healthCheck,
} from "../controller/s3Document.controller.js";
import {
  protect,
  requireOnboardingComplete,
} from "../middleware/auth.middleware.js";
import { upload } from "../configuration/s3Config.js";

const router = express.Router();

router.get("/health", healthCheck);
router.post("/upload", protect, upload.single("document"), uploadFile);
router.get("/", protect, getFiles);
router.get("/:id/download", protect, downloadFile);
router.get("/employee/:employeeId", requireOnboardingComplete, getFiles);
router.delete("/:id", protect, deleteFile);
router.get("/all", requireOnboardingComplete, getAllFiles);
router.put("/:id/status", requireOnboardingComplete, updateFileStatus);

export default router;
