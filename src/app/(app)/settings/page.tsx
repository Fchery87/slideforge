import { auth } from "@/infrastructure/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { User, Mail, Lock, HardDrive } from "lucide-react";
import { DEV_MODE, DEV_SESSION } from "@/lib/dev-auth";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SettingsForm } from "./settings-form";
import { StorageBar } from "./storage-bar";

export default async function SettingsPage() {
  const session = DEV_MODE
    ? DEV_SESSION
    : await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const user = session.user as {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
        Settings
      </h1>

      <div className="rounded-xl border border-white/[0.08] bg-[#16163a] p-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
          Profile
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Update your personal information
        </p>
        <Separator className="my-4 bg-white/[0.08]" />
        <SettingsForm user={user} />
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#16163a] p-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
          Storage
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Your storage usage
        </p>
        <Separator className="my-4 bg-white/[0.08]" />
        <StorageBar userId={user.id} />
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#16163a] p-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
          Security
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Manage your account security
        </p>
        <Separator className="my-4 bg-white/[0.08]" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-slate-500">
                Change your account password
              </p>
            </div>
          </div>
          <a href="/change-password">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04] hover:text-white"
            >
              Change
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
