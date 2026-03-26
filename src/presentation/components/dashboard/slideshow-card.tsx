"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Film, Pencil, Copy, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";

interface SlideshowCardProps {
  slideshow: Slideshow;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SlideshowCard({
  slideshow,
  onDuplicate,
  onDelete,
}: SlideshowCardProps) {
  const updatedAt = new Date(slideshow.updatedAt);

  return (
    <Card className="group relative overflow-hidden border-white/[0.08] bg-[#16163a] transition-all duration-200 hover:border-white/[0.15] hover:bg-[#1a1a45]">
      <Link href={`/editor/${slideshow.id}`} className="block cursor-pointer">
        <div className="relative aspect-video w-full overflow-hidden bg-[#0F0F23]">
          {slideshow.thumbnailUrl ? (
            <img
              src={slideshow.thumbnailUrl}
              alt={slideshow.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Film className="h-10 w-10 text-slate-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/editor/${slideshow.id}`} className="cursor-pointer">
              <h3 className="truncate font-[family-name:var(--font-syne)] text-sm font-semibold leading-snug">
                {slideshow.title}
              </h3>
            </Link>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {slideshow.slides.length} slide{slideshow.slides.length !== 1 ? "s" : ""}
              </Badge>
              <span className="text-[11px] text-slate-500">
                {formatDistanceToNow(updatedAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer shrink-0 text-slate-400 hover:text-slate-200"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {}}
              >
                <Link
                  href={`/editor/${slideshow.id}`}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onDuplicate(slideshow.id)}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => onDelete(slideshow.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
