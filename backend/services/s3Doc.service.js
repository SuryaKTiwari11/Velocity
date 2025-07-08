import { v4 as uuidv4 } from "uuid";
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

const s3Client = new S3Client(S3_CONFIG);
const BUCKET_NAME = S3_CONFIG.bucket;

async function uploadAndSave({ file, title, type = "other", employeeId }) {
  try {
    const fileExt = file.originalname.split(".").pop();
    const s3Key = `docs/${employeeId}/${uuidv4()}.${fileExt}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

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
    throw error;
  }
}

async function getByEmployee(employeeId) {
  try {
    const docs = await S3Document.findAll({
      where: { employeeId: parseInt(employeeId) },
      order: [["createdAt", "DESC"]],
    });
    return docs;
  } catch (error) {
    throw error;
  }
}

async function getDownloadUrl(docId) {
  try {
    const doc = await S3Document.findByPk(docId);
    if (!doc) return null;

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
    throw error;
  }
}

async function deleteById(docId) {
  try {
    const doc = await S3Document.findByPk(docId);
    if (!doc) return null;

    const command = new DeleteObjectCommand({
      Bucket: doc.s3Bucket,
      Key: doc.s3Key,
    });
    await s3Client.send(command);

    await doc.destroy();

    return true;
  } catch (error) {
    throw error;
  }
}

async function getAll({ page = 1, limit = 10, type, status }) {
  try {
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
    throw error;
  }
}

async function updateStatus(docId, status) {
  try {
    const doc = await S3Document.findByPk(docId);
    if (!doc) return null;

    await doc.update({
      status,
      reviewedAt: new Date(),
    });

    return doc;
  } catch (error) {
    throw error;
  }
}

async function testConnection() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

async function getUploadURl({ fileName, fileType, employeeId }) {
  try {
    const fileExt = fileName.split(".").pop();
    const s3Key = `uploads/${employeeId}/${uuidv4()}.${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      uploadUrl,
      s3Key,
      bucket: BUCKET_NAME,
    };
  } catch (error) {
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
    throw error;
  }
}

async function checkHealth() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    });

    await s3Client.send(command);

    return {
      connected: true,
      bucket: BUCKET_NAME,
      region: S3_CONFIG.region,
      timestamp: new Date().toISOString(),
      message: "S3 connection successful",
    };
  } catch (error) {
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
