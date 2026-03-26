import { auth } from "@/infrastructure/auth/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { DEV_MODE, DEV_SESSION } from "@/lib/dev-auth";

export async function getSession() {
  if (DEV_MODE) return DEV_SESSION;
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

export async function requireAuth() {
  if (DEV_MODE) return { error: null, session: DEV_SESSION };
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function requireAdmin() {
  if (DEV_MODE) return { error: null, session: DEV_SESSION };
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };
  if (session!.user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
