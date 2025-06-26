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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, JPG, PNG files are allowed"));
    }
  },
});


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
