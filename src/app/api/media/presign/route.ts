import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getPresignedUploadUrl } from "@/infrastructure/storage/r2-storage-service";

export async function GET(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("fileName");
  const contentType = searchParams.get("contentType");

  if (!fileName || !contentType) {
    return NextResponse.json({ error: "fileName and contentType are required" }, { status: 400 });
  }

  const { createStorageKey } = await import("@/domain/media/value-objects/storage-key");
  const storageKey = createStorageKey(session!.user.id, fileName);
  const presignedUrl = await getPresignedUploadUrl(storageKey, contentType);

  return NextResponse.json({ presignedUrl, storageKey });
}
