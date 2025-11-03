import { S3Document, User } from "../model/model.js";
import { logAction } from "../services/auditServices.js";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "../configuration/s3Setup.js";

// Traditional multipart upload to S3 (for compatibility with existing frontend)
export const uploadDocument = async (req, res) => {
  try {
    const { title, type, employeeId } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const uniqueFileName = `${Date.now()}_${file.originalname}`;
    const key = `documents/${employeeId || userId}/${uniqueFileName}`;

    // Upload directly to S3
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(putObjectCommand);

    // Create document record
    const document = await S3Document.create({
      title: title || file.originalname,
      filename: uniqueFileName,
      originalName: file.originalname,
      s3Key: key,
      s3Bucket: BUCKET_NAME,
      s3Url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      type: type || "other",
      userId: employeeId || userId,
      companyId: req.user.companyId,
      status: "uploaded",
    });

    await logAction(
      req.user.id,
      "UPLOAD_DOCUMENT",
      "S3Document",
      document.id,
      null,
      document,
      req
    );

    res.status(200).json({
      success: true,
      ok: true, // For frontend compatibility
      message: "Document uploaded successfully to S3!",
      doc: document,
      data: document
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

// Health check endpoint
export const healthCheck = async (req, res) => {
  try {
    const headBucketCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
    await s3Client.send(headBucketCommand);
    res.json({
      success: true,
      message: "S3 connection healthy",
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "S3 connection failed",
      error: error.message,
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

    res.json({ success: true, data: documents, count: documents.length });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get documents",
      error: error.message,
    });
  }
};

// Download file (generates signed URL for download)
export const downloadFile = async (req, res) => {
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
        expiresIn: 3600, // 1 hour
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate download URL",
        error: err.message,
      });
    }

    res.status(200).json({
      success: true,
      downloadUrl,
      filename: document.originalName || document.filename,
    });
  } catch (error) {
    console.error("[downloadFile] Error:", error);
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