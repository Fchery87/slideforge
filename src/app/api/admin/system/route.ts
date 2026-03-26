import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? "configured" : "missing",
    r2: process.env.CLOUDFLARE_R2_ACCOUNT_ID ? "configured" : "missing",
  });
}
