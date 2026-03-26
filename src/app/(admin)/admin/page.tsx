import { Users, Film, Activity, ToggleLeft, HardDrive } from "lucide-react";
import Link from "next/link";

const adminCards = [
  { href: "/admin/users", label: "Users", desc: "Manage users and roles", icon: Users },
  { href: "/admin/templates", label: "Templates", desc: "Manage slideshow templates", icon: Film },
  { href: "/admin/analytics", label: "Analytics", desc: "Platform usage stats", icon: Activity },
  { href: "/admin/feature-flags", label: "Feature Flags", desc: "Toggle features", icon: ToggleLeft },
  { href: "/admin/system", label: "System Health", desc: "Monitor status", icon: HardDrive },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="cursor-pointer rounded-xl border border-white/[0.08] bg-[#16163a] p-5 transition-all duration-200 hover:border-white/[0.15] hover:bg-[#1a1a45]">
              <div className="flex items-center justify-between">
                <p className="font-[family-name:var(--font-syne)] font-semibold">{card.label}</p>
                <card.icon className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-1 text-xs text-slate-500">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
