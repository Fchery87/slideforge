import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { DrizzleExportRepository } from "@/infrastructure/repositories/drizzle-export-repository";
import { getPresignedDownloadUrl } from "@/infrastructure/storage/r2-storage-service";

const exportRepo = new DrizzleExportRepository();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const job = await exportRepo.findById(id);

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.status !== "completed" || !job.outputStorageKey) {
    return NextResponse.json({ error: "Export not ready" }, { status: 400 });
  }

  const downloadUrl = await getPresignedDownloadUrl(job.outputStorageKey);
  return NextResponse.json({ downloadUrl });
}
