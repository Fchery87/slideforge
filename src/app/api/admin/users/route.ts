import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/drizzle-user-repository";

const userRepo = new DrizzleUserRepository();

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? undefined;

  const result = await userRepo.findAll({ page, limit, search });
  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  if (body.action === "updateRole") {
    await userRepo.updateRole(body.userId, body.role);
  } else if (body.action === "updateQuota") {
    await userRepo.update(body.userId, { storageQuotaBytes: body.storageQuotaBytes });
  }
  return NextResponse.json({ success: true });
}
