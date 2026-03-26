import { auth } from "@/infrastructure/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/presentation/components/layout/app-shell";
import { DEV_MODE, DEV_SESSION } from "@/lib/dev-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (DEV_MODE) return <AppShell>{children}</AppShell>;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/dashboard");

  return <AppShell>{children}</AppShell>;
}
