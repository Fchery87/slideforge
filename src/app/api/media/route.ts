import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { GetMediaLibraryQuery } from "@/application/media/queries/get-media-library";
import { UploadMediaCommand } from "@/application/media/commands/upload-media";
import { DrizzleMediaRepository } from "@/infrastructure/repositories/drizzle-media-repository";

const mediaRepo = new DrizzleMediaRepository();

export async function GET(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "image" | "audio" | undefined;
  const folderId = searchParams.get("folderId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const query = new GetMediaLibraryQuery(mediaRepo);
  const result = await query.execute(session!.user.id, { type, folderId, page, limit });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const command = new UploadMediaCommand(mediaRepo);
  const asset = await command.execute({
    userId: session!.user.id,
    fileName: body.fileName,
    mimeType: body.mimeType,
    sizeBytes: body.sizeBytes,
    type: body.type,
    width: body.width,
    height: body.height,
    durationMs: body.durationMs,
    folderId: body.folderId,
  });

  return NextResponse.json(asset, { status: 201 });
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const asset = await mediaRepo.findById(id);
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (asset.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await mediaRepo.delete(id);
  return NextResponse.json({ success: true });
}
