// Simple upload middleware - NO CLASSES!
// Just multer setup for S3 uploads

import multer from "multer";

// Use memory storage since we're uploading to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowed = [
      "application/pdf",
      "application/msword",
      "image/jpeg",
      "image/png",
      "text/plain", // Allow text files for testing
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

export { upload };
