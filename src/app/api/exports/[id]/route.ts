import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { GetExportStatusQuery } from "@/application/export/queries/get-export-status";
import { CancelExportCommand } from "@/application/export/commands/cancel-export";
import { DrizzleExportRepository } from "@/infrastructure/repositories/drizzle-export-repository";
import { getPresignedDownloadUrl } from "@/infrastructure/storage/r2-storage-service";

const exportRepo = new DrizzleExportRepository();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const query = new GetExportStatusQuery(exportRepo);
  const job = await query.execute(id);

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(job);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const job = await exportRepo.findById(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const command = new CancelExportCommand(exportRepo);
  await command.execute(id);
  return NextResponse.json({ success: true });
}
