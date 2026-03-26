"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Palette, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "./template-card";
import type { Template } from "@/domain/admin/entities/template";
import type { TemplateCategory } from "@/domain/admin/value-objects/template-category";

const categories: (TemplateCategory | "all")[] = [
  "all",
  "party",
  "wedding",
  "birthday",
  "funeral",
  "corporate",
  "other",
];

export function TemplateGallery() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TemplateCategory | "all">("all");
  const [usingId, setUsingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filter !== "all" ? `?category=${filter}` : "";
      const res = await fetch(`/api/templates${params}`);
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      setTemplates(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleUseTemplate = async (id: string) => {
    try {
      setUsingId(id);
      const res = await fetch(`/api/templates/${id}/use`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to use template");
      const data = await res.json();
      router.push(`/editor/${data.id}`);
    } catch {
      setError("Failed to create slideshow from template");
      setUsingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
          Templates
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Browse templates for every occasion
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            className={`cursor-pointer capitalize ${
              filter === cat
                ? ""
                : "border-white/[0.1] text-slate-300 hover:bg-white/[0.04] hover:text-white"
            }`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-16">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <p className="mt-2 text-sm text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
            onClick={fetchTemplates}
          >
            Retry
          </Button>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <div className="text-center">
            <Palette className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">
              {filter === "all"
                ? "No templates available yet"
                : `No ${filter} templates available`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={usingId === template.id ? "opacity-50 pointer-events-none" : ""}
            >
              <TemplateCard template={template} onUse={handleUseTemplate} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
