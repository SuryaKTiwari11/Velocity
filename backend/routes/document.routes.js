import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/auth.middleware.js";
import { checkPremium } from "../middleware/premium.middleware.js";
import {
  uploadDocument,
  listDocuments,
  downloadDocument,
  searchDocuments,
  deleteDocument,
} from "../controller/document.controller.js";
const router = express.Router();
router.post(
  "/upload",
  protect,
  checkPremium,
  upload.single("document"),
  uploadDocument
);

router.get("/user/:userId", protect, checkPremium, listDocuments);
router.get("/download/:docId", protect, checkPremium, downloadDocument);
router.get("/search/:userId", protect, checkPremium, searchDocuments);
router.delete("/:docId", protect, checkPremium, deleteDocument);

export default router;
