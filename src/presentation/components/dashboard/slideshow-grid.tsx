"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Film, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideshowCard } from "./slideshow-card";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";

export function SlideshowGrid() {
  const router = useRouter();
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSlideshows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/slideshows");
      if (!res.ok) throw new Error("Failed to load slideshows");
      const data = await res.json();
      setSlideshows(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlideshows();
  }, [fetchSlideshows]);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/slideshows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Slideshow" }),
      });
      if (!res.ok) throw new Error("Failed to create slideshow");
      const data = await res.json();
      router.push(`/editor/${data.id}`);
    } catch {
      setError("Failed to create slideshow");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/slideshows/${id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to duplicate slideshow");
      await fetchSlideshows();
    } catch {
      setError("Failed to duplicate slideshow");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slideshow?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/slideshows/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete slideshow");
      setSlideshows((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Failed to delete slideshow");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-16">
        <AlertCircle className="h-6 w-6 text-red-400" />
        <p className="mt-2 text-sm text-red-400">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
          onClick={fetchSlideshows}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
          My Slideshows
        </h1>
        <Button
          className="cursor-pointer bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all duration-200 hover:bg-rose-700 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]"
          onClick={handleCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Slideshow
        </Button>
      </div>

      {slideshows.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <div className="text-center">
            <Film className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">
              No slideshows yet. Create your first one!
            </p>
            <Button
              variant="outline"
              className="mt-4 cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04] hover:text-white"
              onClick={handleCreate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Slideshow
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {slideshows.map((slideshow) => (
            <div
              key={slideshow.id}
              className={deletingId === slideshow.id ? "opacity-50 pointer-events-none" : ""}
            >
              <SlideshowCard
                slideshow={slideshow}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
