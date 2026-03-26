import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { QueueExportCommand } from "@/application/export/commands/queue-export";
import { ListUserExportsQuery } from "@/application/export/queries/list-user-exports";
import { DrizzleExportRepository } from "@/infrastructure/repositories/drizzle-export-repository";

const exportRepo = new DrizzleExportRepository();

export async function GET(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const query = new ListUserExportsQuery(exportRepo);
  const result = await query.execute(session!.user.id, page, limit);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const command = new QueueExportCommand(exportRepo);
  const job = await command.execute({
    userId: session!.user.id,
    slideshowId: body.slideshowId,
    format: body.format,
    resolution: body.resolution,
  });

  return NextResponse.json(job, { status: 201 });
}
