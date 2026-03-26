import { NextRequest, NextResponse } from "next/server";
import { DEV_MODE } from "@/lib/dev-auth";

export function proxy(request: NextRequest) {
  // Dev bypass — no auth checks
  if (DEV_MODE) return NextResponse.next();

  // In production, let Better Auth handle session checks via API routes.
  // Client-side pages that need auth should check session in their server components.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
