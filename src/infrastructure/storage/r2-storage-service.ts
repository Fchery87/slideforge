import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "./r2-client";

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "slideforge";
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";

export async function getPresignedUploadUrl(
  storageKey: string,
  contentType: string,
  expiresIn = 3600,
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function getPresignedDownloadUrl(
  storageKey: string,
  expiresIn = 3600,
): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteObject(storageKey: string): Promise<void> {
  const client = getR2Client();
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
  });
  await client.send(command);
}

export function getPublicUrl(storageKey: string): string {
  return `${PUBLIC_URL}/${storageKey}`;
}
