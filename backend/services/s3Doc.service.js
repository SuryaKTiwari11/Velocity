import { v4 as uuidv4 } from "uuid";
// AWS SDK v3 - Modern, faster, and actively maintained
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Document } from "../model/model.js";
import { S3_CONFIG } from "../configuration/s3Config.js";

// Initialize S3 client with v3 syntax
const s3Client = new S3Client(S3_CONFIG);
const BUCKET_NAME = S3_CONFIG.bucket;

async function uploadAndSave({ file, title, type = "other", employeeId }) {
  try {
    console.log("🚀 Uploading file:", file.originalname);

    const fileExt = file.originalname.split(".").pop();
    const s3Key = `docs/${employeeId}/${uuidv4()}.${fileExt}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // AWS SDK v3 syntax
    const command = new PutObjectCommand(uploadParams);
    const s3Result = await s3Client.send(command);
    console.log("✅ S3 upload done:", s3Key);

    const doc = await S3Document.create({
      title,
      type,
      employeeId: parseInt(employeeId),
      s3Key,
      s3Bucket: BUCKET_NAME,
      fileSize: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
      status: "pending",
    });

    return doc;
  } catch (error) {
    console.error("❌ Error in uploadAndSave:", error);
    throw error;
  }
}

async function getByEmployee(employeeId) {
  try {
    console.log("📋 Getting docs for employee:", employeeId);

    const docs = await S3Document.findAll({
      where: { employeeId: parseInt(employeeId) },
      order: [["createdAt", "DESC"]],
    });

    return docs;
  } catch (error) {
    console.error("❌ Error in getByEmployee:", error);
    throw error;
  }
}

async function getDownloadUrl(docId) {
  try {
    console.log("⬇️ Getting download URL for:", docId);

    const doc = await S3Document.findByPk(docId);
    if (!doc) return null;

    // AWS SDK v3 syntax for presigned URLs
    const command = new GetObjectCommand({
      Bucket: doc.s3Bucket,
      Key: doc.s3Key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      downloadUrl,
      doc: {
        id: doc.id,
        title: doc.title,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
      },
    };
  } catch (error) {
    console.error("❌ Error in getDownloadUrl:", error);
    throw error;
  }
}

async function deleteById(docId) {
  try {
    console.log("🗑️ Deleting doc:", docId);

    const doc = await S3Document.findByPk(docId);
    if (!doc) return null;

    await s3
      .deleteObject({
        Bucket: doc.s3Bucket,
        Key: doc.s3Key,
      })
      .promise();

    await doc.destroy();

    return true;
  } catch (error) {
    console.error("❌ Error in deleteById:", error);
    throw error;
  }
}

async function getAll({ page = 1, limit = 10, type, status }) {
  try {
    console.log("📄 Getting all docs with filters");

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: docs } = await S3Document.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return {
      docs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error in getAll:", error);
    throw error;
  }
}

async function updateStatus(docId, status) {
  try {
    console.log("📝 Updating status:", docId, status);

    const doc = await S3Document.findByPk(docId);
    if (!doc) return null;

    await doc.update({
      status,
      reviewedAt: new Date(),
    });

    return doc;
  } catch (error) {
    console.error("❌ Error in updateStatus:", error);
    throw error;
  }
}

async function testConnection() {
  try {
    await s3.listBuckets().promise();
    return true;
  } catch (error) {
    console.error("❌ S3 connection failed:", error.message);
    return false;
  }
}

async function getUploadURl({ fileName, fileType, employeeId }) {
  try {
    console.log("🚀 Getting upload URL for:", fileName);

    const fileExt = fileName.split(".").pop();
    const s3Key = `uploads/${employeeId}/${uuidv4()}.${fileExt}`;

    const uploadUrl = s3.getSignedUrl("putObject", {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Expires: 3600,
      ContentType: fileType,
    });

    return {
      uploadUrl,
      s3Key,
      bucket: BUCKET_NAME,
    };
  } catch (error) {
    console.error("❌ Error in getUploadURl:", error);
    throw error;
  }
}

async function saveMetaData({
  s3Key,
  title,
  type,
  employeeId,
  fileSize,
  mimeType,
  originalName,
}) {
  try {
    console.log("💾 Saving metadata for:", originalName);

    const doc = await S3Document.create({
      s3Key,
      title,
      type,
      employeeId: parseInt(employeeId),
      fileSize,
      mimeType,
      originalName,
      status: "pending",
    });

    return doc;
  } catch (error) {
    console.error("❌ Error in saveMetaData:", error);
    throw error;
  }
}

async function checkHealth() {
  try {
    console.log("🔍 Checking S3 connection health...");

    // Test S3 connection by listing objects in bucket
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1, // Only need to check if we can access the bucket
    });

    const result = await s3Client.send(command);

    console.log("✅ S3 health check successful");
    return {
      connected: true,
      bucket: BUCKET_NAME,
      region: S3_CONFIG.region,
      timestamp: new Date().toISOString(),
      message: "S3 connection successful",
    };
  } catch (error) {
    console.error("❌ S3 health check failed:", error.message);
    return {
      connected: false,
      bucket: BUCKET_NAME,
      region: S3_CONFIG.region,
      timestamp: new Date().toISOString(),
      error: error.message,
      message: "S3 connection failed",
    };
  }
}

export const S3DocService = {
  uploadAndSave,
  getUploadURl,
  saveMetaData,
  getByEmployee,
  getDownloadUrl,
  deleteById,
  getAll,
  updateStatus,
  testConnection,
  checkHealth,
};
