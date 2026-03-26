"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Shield, Bug } from "lucide-react";
import { signOut, useSession } from "@/infrastructure/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DEV = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export function TopBar() {
  const router = useRouter();
  const { data: liveSession } = useSession();

  const session = DEV
    ? {
        user: {
          name: "Dev User",
          email: "dev@slideforge.local",
          role: "admin",
        },
      }
    : liveSession;

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  async function handleSignOut() {
    if (DEV) return; // No-op in dev mode
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#0a0a1a]/80 px-6 backdrop-blur-sm">
      <div />
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full cursor-pointer hover:bg-white/[0.06]"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-rose-500/20 text-xs text-rose-400">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-white/[0.08] bg-[#16163a] text-slate-200"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
              <p className="text-xs text-slate-500">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="cursor-pointer text-slate-300 focus:bg-white/[0.06] focus:text-slate-100"
            >
              <User className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin")}
              className="cursor-pointer text-slate-300 focus:bg-white/[0.06] focus:text-slate-100"
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-slate-300 focus:bg-white/[0.06] focus:text-slate-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
