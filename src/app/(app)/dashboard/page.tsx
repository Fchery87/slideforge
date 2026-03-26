import { auth } from "@/infrastructure/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Film, ImageIcon, FileDown, Plus } from "lucide-react";
import Link from "next/link";
import { DEV_MODE, DEV_SESSION } from "@/lib/dev-auth";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";

async function fetchCount(path: string): Promise<number> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${path}`,
      { cache: "no-store" }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const session = DEV_MODE
    ? DEV_SESSION
    : await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const [slideshowsCount, mediaCount, exportsCount] = await Promise.all([
    fetchCount("/api/slideshows"),
    fetchCount("/api/media"),
    fetchCount("/api/exports"),
  ]);

  const stats = [
    { label: "Slideshows", value: slideshowsCount, icon: Film },
    { label: "Media Files", value: mediaCount, icon: ImageIcon },
    { label: "Exports", value: exportsCount, icon: FileDown },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name || "there"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create and manage your slideshows
          </p>
        </div>
        <Link href="/slideshows">
          <Button className="cursor-pointer bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all duration-200 hover:bg-rose-700 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]">
            <Plus className="mr-2 h-4 w-4" />
            New Slideshow
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.08] bg-[#16163a] p-5 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/slideshows">
            <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16163a] p-4 transition-all duration-200 hover:border-white/[0.15]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                <Film className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <p className="font-medium">New Slideshow</p>
                <p className="text-xs text-slate-500">Start from scratch</p>
              </div>
            </div>
          </Link>
          <Link href="/media">
            <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16163a] p-4 transition-all duration-200 hover:border-white/[0.15]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <ImageIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Upload Media</p>
                <p className="text-xs text-slate-500">Add images or audio</p>
              </div>
            </div>
          </Link>
          <Link href="/templates">
            <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16163a] p-4 transition-all duration-200 hover:border-white/[0.15]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Film className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Browse Templates</p>
                <p className="text-xs text-slate-500">Pre-made designs</p>
              </div>
            </div>
          </Link>
          <Link href="/exports">
            <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16163a] p-4 transition-all duration-200 hover:border-white/[0.15]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <FileDown className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium">View Exports</p>
                <p className="text-xs text-slate-500">Download your videos</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
