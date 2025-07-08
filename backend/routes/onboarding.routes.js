import express from "express";
import { adminOnly, protect } from "../middleware/auth.middleware.js";
import {
  getOnBoardingData,
  trainingStatus,
  trackVideoProgress,
  submitDocuments,
  getVerificationQueue,
  verifyUserDocuments,
} from "../controller/onboarding.controller.js";

const router = express.Router();
router.use(protect);

router.get("/data", getOnBoardingData);
router.get("/training-status", trainingStatus);
router.post("/video-progress", trackVideoProgress);
router.post("/submit-documents", submitDocuments);

// Admin routes - require admin auth
router.get("/admin/pending-verifications", adminOnly, getVerificationQueue);
router.patch("/admin/verify-user/:userId", adminOnly, verifyUserDocuments);

export default router;
