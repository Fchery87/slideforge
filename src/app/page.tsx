import { redirect } from "next/navigation";
import { DEV_MODE } from "@/lib/dev-auth";
import Link from "next/link";
import { Film, Sparkles, Music, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  if (DEV_MODE) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/[0.07] blur-[120px]" />
        <div className="absolute right-1/4 top-2/3 h-[300px] w-[300px] rounded-full bg-indigo-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        <div className="flex items-center gap-3">
          <Film className="h-10 w-10 text-rose-500" />
          <h1 className="font-[family-name:var(--font-syne)] text-5xl font-extrabold tracking-tight">
            SlideForge
          </h1>
        </div>

        <p className="max-w-lg text-lg leading-relaxed text-slate-400">
          Create stunning slideshows for every occasion. Upload images, add
          music, apply cinematic effects, and export in any format.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="cursor-pointer bg-rose-600 px-8 text-white shadow-[0_0_30px_rgba(225,29,72,0.35)] transition-all duration-200 hover:bg-rose-700 hover:shadow-[0_0_40px_rgba(225,29,72,0.5)]"
            >
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer border-white/[0.1] text-slate-300 transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Cinematic Effects",
              desc: "Fade, zoom, dissolve — transitions that wow",
            },
            {
              icon: Music,
              title: "Audio Timeline",
              desc: "Add music and sync it to your slides",
            },
            {
              icon: Download,
              title: "Export Anywhere",
              desc: "MP4, WebM, GIF, ProRes — your choice",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm"
            >
              <feature.icon className="mb-3 h-6 w-6 text-rose-400" />
              <h3 className="font-[family-name:var(--font-syne)] font-semibold">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
