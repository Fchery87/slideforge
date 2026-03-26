"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Template } from "@/domain/admin/entities/template";

interface TemplateCardProps {
  template: Template;
  onUse: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  party: "bg-purple-500/20 text-purple-300",
  wedding: "bg-pink-500/20 text-pink-300",
  birthday: "bg-amber-500/20 text-amber-300",
  funeral: "bg-slate-500/20 text-slate-300",
  corporate: "bg-blue-500/20 text-blue-300",
  other: "bg-slate-500/20 text-slate-300",
};

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  return (
    <Card className="group relative overflow-hidden border-white/[0.08] bg-[#16163a] transition-all duration-200 hover:border-white/[0.15] hover:bg-[#1a1a45]">
      <div className="relative aspect-video w-full overflow-hidden bg-[#0F0F23]">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Palette className="h-10 w-10 text-slate-600" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => onUse(template.id)}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Use Template
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-[family-name:var(--font-syne)] text-sm font-semibold">
              {template.name}
            </h3>
            {template.description && (
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                {template.description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`inline-flex h-5 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              categoryColors[template.category] ?? categoryColors.other
            }`}
          >
            {template.category}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
