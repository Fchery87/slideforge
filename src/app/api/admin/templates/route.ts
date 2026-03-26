import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { GetTemplatesQuery } from "@/application/admin/queries/get-templates";
import { CreateTemplateCommand } from "@/application/admin/commands/create-template";
import { DrizzleTemplateRepository } from "@/infrastructure/repositories/drizzle-template-repository";
import type { TemplateCategory } from "@/domain/admin/value-objects/template-category";

const templateRepo = new DrizzleTemplateRepository();

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const category = searchParams.get("category") as TemplateCategory | null;

  const query = new GetTemplatesQuery(templateRepo);
  const result = await query.execute({ category, publishedOnly: false, page, limit });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const command = new CreateTemplateCommand(templateRepo);
  const template = await command.execute({
    ...body,
    createdBy: session!.user.id,
  });
  return NextResponse.json(template, { status: 201 });
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, ...data } = body;
  const updated = await templateRepo.update(id, data);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await templateRepo.delete(id);
  return NextResponse.json({ success: true });
}
