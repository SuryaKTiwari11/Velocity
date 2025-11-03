import express from "express";
import {
  uploadDocument,
  getFiles,
  downloadFile,
  deleteFile,
  healthCheck,
} from "../controller/s3Document.controller.js";
import {
  protect,
  requireOnboardingComplete,
} from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Health check
router.get("/health", healthCheck);

// Traditional multipart upload route (for frontend compatibility)
router.post("/upload", protect, upload.single("document"), uploadDocument);

// File management routes
router.get("/", protect, getFiles);
router.get("/:id/download", protect, downloadFile);
router.delete("/:id", protect, deleteFile);

export default router;
