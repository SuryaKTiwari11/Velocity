import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "vermaco123";

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export { s3Client, BUCKET_NAME };
