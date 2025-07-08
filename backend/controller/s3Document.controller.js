// s3Document.controller.js - Fixed to match frontend API exactly with AWS SDK v3

import { S3Document, User } from "../model/model.js";
import { logAction } from "../services/auditServices.js";
import { upload } from "../middleware/upload.js";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// Configure AWS S3 Client for LocalStack
const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
  region: process.env.AWS_REGION || "us-east-1",
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "employee-documents";

// Upload file - matches frontend: upload: (formData) => api.post("/s3-documents/upload", formData)
export const uploadFile = async (req, res) => {
  try {
    const { title, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // Generate unique filename
    const filename = `${Date.now()}_${file.originalname}`;
    const key = `documents/${req.user.id}/${filename}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    const uploadResult = await s3Client.send(uploadCommand);

    // Save to database
    const document = await S3Document.create({
      title: title || file.originalname,
      filename: filename, // Use the generated filename, not original
      originalName: file.originalname, // Add the required originalName field
      s3Key: key,
      s3Bucket: BUCKET_NAME, // Add the required s3Bucket field
      s3Url: `https://${BUCKET_NAME}.s3.${
        process.env.AWS_REGION || "us-east-1"
      }.amazonaws.com/${key}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      type: type || "other",
      userId: req.user.id,
      status: "pending",
    });

    // Log the action
    await logAction(
      req.user.id,
      "UPLOAD_DOCUMENT",
      "S3Document",
      document.id,
      null,
      document,
      req
    );

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

// Get user's documents - matches frontend: list: () => api.get("/s3-documents/")
export const getFiles = async (req, res) => {
  try {
    console.log("📂 Getting files for user:", req.user?.id);
    console.log("📂 User object:", req.user);
    const { employeeId } = req.params;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error("❌ User not authenticated");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let whereCondition = {};

    // If employeeId provided, get that employee's docs (admin route)
    if (employeeId) {
      whereCondition.userId = employeeId;
      console.log("📂 Getting files for employee:", employeeId);
    } else {
      // Otherwise get current user's docs
      whereCondition.userId = req.user.id;
      console.log("📂 Getting files for current user:", req.user.id);
    }

    const documents = await S3Document.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    console.log("📂 Found", documents.length, "documents");

    res.json({
      success: true,
      data: documents,
      count: documents.length,
    });
  } catch (error) {
    console.error("❌ Get files error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get documents",
      error: error.message,
    });
  }
};

// Download file - matches frontend: download: (docId) => api.get(`/s3-documents/${docId}/download`)
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error("❌ User not authenticated for download");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log(`📥 Downloading document ${id} for user ${req.user.id}`);

    const document = await S3Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user owns this document (security check)
    if (document.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to download this document",
      });
    }

    console.log(`📥 Generating download URL for: ${document.s3Key}`);

    // Generate signed URL for download
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: document.s3Key,
    });

    const downloadUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600, // 1 hour
    });

    console.log(`✅ Download URL generated successfully`);

    res.json({
      success: true,
      downloadUrl,
      filename: document.originalName || document.filename,
    });
  } catch (error) {
    console.error("❌ Download error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Download failed",
      error: error.message,
    });
  }
};

// Delete file - matches frontend: delete: (docId) => api.delete(`/s3-documents/${docId}`)
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error("❌ User not authenticated for delete");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log(`🗑️ Deleting document ${id} for user ${req.user.id}`);

    const document = await S3Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user owns this document (security check)
    if (document.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this document",
      });
    }

    // Delete from S3
    console.log(`🗑️ Deleting from S3: ${document.s3Key}`);
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: document.s3Key,
    });

    await s3Client.send(deleteCommand);
    console.log(`✅ Deleted from S3 successfully`);

    // Delete from database
    await document.destroy();
    console.log(`✅ Deleted from database successfully`);

    // Log the action (with error handling)
    try {
      await logAction(
        req.user.id,
        "DELETE_DOCUMENT",
        "S3Document",
        id,
        document.dataValues,
        null,
        req
      );
    } catch (logError) {
      console.error(
        "⚠️ Audit log failed, but document deleted:",
        logError.message
      );
    }

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

// Get all files (admin) - matches frontend route in s3Document.routes.js
export const getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (type) whereCondition.type = type;
    if (status) whereCondition.status = status;

    const { count, rows: documents } = await S3Document.findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json({
      success: true,
      data: documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
      },
    });
  } catch (error) {
    console.error("Get all files error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all documents",
      error: error.message,
    });
  }
};

// Update file status - matches frontend API
export const updateFileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const document = await S3Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const oldData = { ...document.dataValues };
    await document.update({ status, notes });

    // Log the action
    await logAction(
      req.user.id,
      "UPDATE_DOCUMENT_STATUS",
      "S3Document",
      id,
      oldData,
      document,
      req
    );

    res.json({
      success: true,
      message: "Document status updated",
      data: document,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update document status",
      error: error.message,
    });
  }
};

// Health check
export const healthCheck = async (req, res) => {
  try {
    console.log(`Health check initiated by user: ${req.user?.id || "unknown"}`); // Use req to avoid unused variable warning

    // Test S3 connection
    const headBucketCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
    await s3Client.send(headBucketCommand);

    res.json({
      success: true,
      message: "S3 connection healthy",
      bucket: BUCKET_NAME,
      endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost:4566",
    });
  } catch (error) {
    console.error("S3 health check failed:", error);
    res.status(500).json({
      success: false,
      message: "S3 connection failed",
      error: error.message,
    });
  }
};

// Re-export the upload middleware for convenience
export { upload };
