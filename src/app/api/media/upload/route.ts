import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getR2Client } from "@/infrastructure/storage/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "slideforge";

export async function POST(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const storageKey = formData.get("storageKey") as string;

    if (!file || !storageKey) {
      return NextResponse.json(
        { error: "file and storageKey are required" },
        { status: 400 }
      );
    }

    const client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    });

    await client.send(command);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Upload proxy error:", err);
    return NextResponse.json(
      { error: "Upload failed", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
