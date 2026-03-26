import { S3Client } from "@aws-sdk/client-s3";

export function createR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });
}

let r2ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!r2ClientInstance) {
    r2ClientInstance = createR2Client();
  }
  return r2ClientInstance;
}
