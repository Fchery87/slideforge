"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { MediaBrowser } from "@/presentation/components/editor/media-sidebar/enhanced-media-browser";
import { MediaUploadZone } from "@/presentation/components/editor/media-sidebar/media-upload-zone";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Image, LayoutGrid, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeftTab } from "@/presentation/stores/editor-store";
import type { Template } from "@/domain/admin/entities/template";
import { createSlideLayoutObjects, type SlideLayoutId } from "./slide-layouts";

const tabs: { id: LeftTab; icon: typeof Image; label: string }[] = [
  { id: "media", icon: Image, label: "Media" },
  { id: "layouts", icon: LayoutGrid, label: "Layouts" },
  { id: "templates", icon: FileText, label: "Templates" },
];

const SLIDE_LAYOUTS = [
  { id: "title", name: "Title", description: "Centered title slide" },
  { id: "title-content", name: "Title + Content", description: "Title with body text" },
  { id: "two-column", name: "Two Column", description: "Side by side content" },
  { id: "full-image", name: "Full Image", description: "Full bleed image" },
  { id: "blank", name: "Blank", description: "Empty canvas" },
];

export function LeftRail() {
  const router = useRouter();
  const {
    slideshow,
    currentSlideIndex,
    updateSlide,
    activeLeftTab,
    setActiveLeftTab,
  } = useEditorStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null);

  const currentSlide = slideshow?.slides[currentSlideIndex];

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) {
        throw new Error("Failed to load templates");
      }
      const data = await response.json();
      setTemplates(data.items ?? []);
    } catch {
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    if (activeLeftTab === "templates" && templates.length === 0 && !loadingTemplates) {
      fetchTemplates();
    }
  }, [activeLeftTab, templates.length, loadingTemplates, fetchTemplates]);

  const handleApplyLayout = (layoutId: SlideLayoutId) => {
    if (!currentSlide) return;

    updateSlide(currentSlideIndex, {
      layoutId,
      canvasObjects: createSlideLayoutObjects(layoutId, currentSlide.id),
    });
  };

  const handleUseTemplate = useCallback(
    async (templateId: string) => {
      setUsingTemplateId(templateId);
      try {
        const response = await fetch(`/api/templates/${templateId}/use`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error("Failed to use template");
        }
        const slideshow = await response.json();
        router.push(`/editor/${slideshow.id}`);
      } finally {
        setUsingTemplateId(null);
      }
    },
    [router]
  );

  return (
    <aside className="flex w-[272px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a1a]">
      {/* Tab Bar */}
      <div className="flex shrink-0 border-b border-white/[0.06]">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveLeftTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-medium transition-colors",
              activeLeftTab === id
                ? "border-rose-500 text-slate-100"
                : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeLeftTab === "media" && (
          <div className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-3">
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Images
                </h3>
                <MediaBrowser type="image" />
              </div>
              <Separator className="my-3 bg-white/[0.06]" />
              <div>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Audio
                </h3>
                <MediaBrowser type="audio" />
              </div>
            </div>
            <div className="shrink-0 border-t border-white/[0.06] p-3">
              <MediaUploadZone />
            </div>
          </div>
        )}

        {activeLeftTab === "layouts" && (
          <div className="flex flex-col gap-1 p-3">
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Slide Layouts
            </h3>
            {SLIDE_LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleApplyLayout(layout.id as SlideLayoutId)}
                className="flex items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded border border-white/[0.1] bg-white/[0.02]">
                  <LayoutGrid className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{layout.name}</p>
                  <p className="text-[11px] text-slate-500">{layout.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeLeftTab === "templates" && (
          <div className="flex flex-col gap-2 p-3">
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Deck Templates
            </h3>
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              </div>
            ) : templates.length > 0 ? (
              templates.slice(0, 8).map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={usingTemplateId === template.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded border border-white/[0.1] bg-white/[0.02]">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{template.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {usingTemplateId === template.id
                        ? "Creating slideshow..."
                        : template.description || "Create a new slideshow from this template"}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/[0.08] p-4 text-xs text-slate-500">
                No templates available yet.
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTemplates}
              className="border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
            >
              Refresh Templates
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
