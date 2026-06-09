import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const requiredR2Env = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
];

export const isR2Configured = () => requiredR2Env.every((key) => Boolean(process.env[key]));

const getR2Client = () =>
  new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

export const uploadFileToR2 = async (file) => {
  if (!isR2Configured()) {
    throw new Error("R2 storage is not configured");
  }

  const extension = path.extname(file.originalname || "");
  const key = `chat/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${extension}`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return {
    key,
    url: `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`,
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
    storage: "r2",
  };
};
