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

import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import { documentQueue } from "../queues/simple.js";

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

const BUCKET_NAME = "employee-documents";

// Upload file
export const uploadFile = async (req, res) => {
  try {
    const { title, type } = req.body;
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided" });
    }
    if (!fs.existsSync(file.path)) {
      return res
        .status(500)
        .json({ success: false, message: "Temp file missing after upload" });
    }
    const filename = `${Date.now()}_${file.originalname}`;
    const key = `documents/${req.user.id}/${filename}`;

    const fileStream = fs.createReadStream(file.path);
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: file.mimetype,
      },
    });
    await upload.done();

    const document = await S3Document.create({
      title: title || file.originalname,
      filename,
      originalName: file.originalname,
      s3Key: key,
      s3Bucket: BUCKET_NAME,
      s3Url: `https://${BUCKET_NAME}.s3.${
        process.env.AWS_REGION || "us-east-1"
      }.amazonaws.com/${key}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      type: type || "other",
      userId: req.user.id,
      companyId: req.user.companyId,
      status: "uploaded",
    });
    if (!document.id) {
      console.error("Document ID is undefined after creation!", document);
    }
    await documentQueue.add("process-document", { documentId: document.id });
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
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
      stack: error.stack,
    });
  }
};

// Get user's documents
export const getFiles = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!req.user || !req.user.id || !req.user.companyId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated or missing companyId",
      });
    }
    let whereCondition = { companyId: req.user.companyId };
    if (employeeId) {
      whereCondition.userId = employeeId;
    } else {
      whereCondition.userId = req.user.id;
    }
    const documents = await S3Document.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });
    // ...existing code...
    res.json({ success: true, data: documents, count: documents.length });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get documents",
      error: error.message,
    });
  }
};

// Download file
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    // ...existing code...
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }
    const document = await S3Document.findByPk(id);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    // Allow owner or admin to download
    if (document.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to download this document",
      });
    }
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: document.s3Key,
    });
    let downloadUrl;
    try {
      downloadUrl = await getSignedUrl(s3Client, getObjectCommand, {
        expiresIn: 3600,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate download URL",
        error: err.message,
      });
    }
    const origin = req.headers.origin || "http://localhost:5173";
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.status(200).json({
      success: true,
      downloadUrl,
      filename: document.originalName || document.filename,
    });
  } catch (error) {
    console.error("[downloadFile] Outer error:", error);
    res.status(500).json({
      success: false,
      message: "Download failed",
      error: error.message,
    });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }
    const document = await S3Document.findByPk(id);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    if (document.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this document",
      });
    }
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: document.s3Key })
    );
    await logAction(
      req.user.id,
      "DELETE_DOCUMENT",
      "S3Document",
      id,
      document.dataValues,
      null,
      req
    );
    await document.destroy();
    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Delete failed", error: error.message });
  }
};

// Get all files (admin)
export const getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const offset = (page - 1) * limit;
    if (!req.user || !req.user.companyId || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view all documents",
      });
    }
    const whereCondition = { companyId: req.user.companyId };
    if (type) whereCondition.type = type;
    if (status) whereCondition.status = status;
    const { count, rows: documents } = await S3Document.findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
      include: [{ model: User, attributes: ["id", "name", "email"] }],
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
    res.status(500).json({
      success: false,
      message: "Failed to get all documents",
      error: error.message,
    });
  }
};

// Update file status
export const updateFileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const document = await S3Document.findByPk(id);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    const oldData = { ...document.dataValues };
    await document.update({ status, notes });
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
    res.status(500).json({
      success: false,
      message: "Failed to update document status",
      error: error.message,
    });
  }
};

export const healthCheck = async (req, res) => {
  try {
    const headBucketCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
    await s3Client.send(headBucketCommand);
    res.json({
      success: true,
      message: "S3 connection healthy",
      bucket: BUCKET_NAME,
      endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost:4566",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "S3 connection failed",
      error: error.message,
    });
  }
};

// Re-export the upload middleware for convenience
export { upload };
