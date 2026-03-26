"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ImageIcon,
  Film,
  FileDown,
  Settings,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/slideshows", label: "Slideshows", icon: Film },
  { href: "/media", label: "Media Library", icon: ImageIcon },
  { href: "/templates", label: "Templates", icon: Palette },
  { href: "/exports", label: "Exports", icon: FileDown },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-white/[0.08] bg-[#0a0a1a]">
      <div className="flex h-14 items-center gap-2 border-b border-white/[0.08] px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer">
          <Film className="h-5 w-5 text-rose-500" />
          <span className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-slate-50">
            SlideForge
          </span>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer",
                isActive
                  ? "bg-rose-500/10 text-rose-400"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.08] p-3">
        <div className="rounded-lg bg-[#16163a] p-3">
          <p className="text-xs font-medium text-slate-400">Storage</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[5%] rounded-full bg-rose-500" />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">0 MB / 5 GB</p>
        </div>
      </div>
    </aside>
  );
}
