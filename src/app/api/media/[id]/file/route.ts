import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getPresignedDownloadUrl } from "@/infrastructure/storage/r2-storage-service";
import { DrizzleMediaRepository } from "@/infrastructure/repositories/drizzle-media-repository";

const mediaRepo = new DrizzleMediaRepository();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const asset = await mediaRepo.findById(id);
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (asset.userId !== session!.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const presignedUrl = await getPresignedDownloadUrl(asset.storageKey);

  return NextResponse.redirect(presignedUrl);
}
