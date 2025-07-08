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
import { protect, requireOnboardingComplete } from "../middleware/auth.middleware.js";

import { upload } from "../configuration/s3Config.js"; // Import the multer upload middleware

const router = express.Router();

router.get("/health", healthCheck);

// Basic auth for document uploads (allow during onboarding)
router.post("/upload", protect, upload.single("document"), uploadFile);
router.get("/", protect, getFiles); // Allow users to see their own documents

// Download is allowed for reviewing during onboarding
router.get("/:id/download", protect, downloadFile);

// These require full onboarding completion
router.get("/employee/:employeeId", requireOnboardingComplete, getFiles);
router.delete("/:id", requireOnboardingComplete, deleteFile);
router.get("/all", requireOnboardingComplete, getAllFiles);
router.put("/:id/status", requireOnboardingComplete, updateFileStatus);

export default router;
