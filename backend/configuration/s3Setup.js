import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
  region: process.env.AWS_REGION || "us-east-1",
  forcePathStyle: true, //!needed for localstack
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "employee-documents";

async function setupS3() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`Bucket ${BUCKET_NAME} already exists.`);
    // Bucket exists
    //!this means that the bucket already exists
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`Bucket ${BUCKET_NAME} created successfully.`);
      // Bucket created
      //!this means the bucket does not exist, so we create it
    } else {
      console.error("S3 setup failed:", error.message);
      // Make sure LocalStack is running
    }
  }
}

setupS3();
