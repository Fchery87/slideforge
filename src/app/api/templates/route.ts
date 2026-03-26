import { NextResponse } from "next/server";
import { GetTemplatesQuery } from "@/application/admin/queries/get-templates";
import { DrizzleTemplateRepository } from "@/infrastructure/repositories/drizzle-template-repository";
import type { TemplateCategory } from "@/domain/admin/value-objects/template-category";

const templateRepo = new DrizzleTemplateRepository();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as TemplateCategory | undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const query = new GetTemplatesQuery(templateRepo);
  const result = await query.execute({ category, publishedOnly: true, page, limit });
  return NextResponse.json(result);
}
