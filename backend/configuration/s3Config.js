import multer from "multer";
import path from "path";
export const S3_CONFIG = {
  endpoint: "http://localhost:4566",
  region: "us-east-1", //!fixed for local stack
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
  forcePathStyle: true,
  bucket: "documents",
};

export const CORS_CONFIG = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "PUT", "POST", "DELETE"],
      AllowedOrigins: ["*"],
      ExposeHeaders: [""],
    },
  ],
};


 const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);
    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(
        new Error("Only .pdf, .doc, .docx, .jpg, .jpeg, .png files are allowed")
      );
    }
  },
});
