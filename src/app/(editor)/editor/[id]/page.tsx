"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { useAutosave } from "@/presentation/hooks/use-autosave";
import { useUnsavedChanges } from "@/presentation/hooks/use-unsaved-changes";
import { useKeyboardShortcuts } from "@/presentation/hooks/use-keyboard-shortcuts";
import { EditorTopBar } from "@/presentation/components/editor/top-bar/editor-top-bar";
import { FabricCanvas } from "@/presentation/components/editor/canvas/fabric-canvas";
import { CanvasToolbar } from "@/presentation/components/editor/canvas/canvas-toolbar";
import { ObjectPropertiesPanel } from "@/presentation/components/editor/canvas/object-properties-panel";
import { SlideStrip } from "@/presentation/components/editor/slides/slide-strip";
import { EnhancedAudioPanel } from "@/presentation/components/editor/audio/enhanced-audio-panel";
import { AnimationPanel } from "@/presentation/components/editor/animation/animation-panel";
import { BackgroundPanel } from "@/presentation/components/editor/background/background-panel";
import { EffectsPanel } from "@/presentation/components/editor/effects/enhanced-effects-panel";
import { PreviewModal } from "@/presentation/components/editor/preview/preview-modal";
import { ContextMenu, useContextMenu } from "@/presentation/components/editor/context-menu/context-menu";
import { LeftRail } from "@/presentation/components/editor/workspace/left-rail";
import { NotesPanel } from "@/presentation/components/editor/workspace/notes-panel";
import { PresenterView } from "@/presentation/components/editor/workspace/presenter-view";
import { TimelineContainer } from "@/presentation/components/editor/timeline/timeline-container";
import { ExportDialog } from "@/presentation/components/export/export-dialog";
import { Resolutions } from "@/domain/slideshow/value-objects/resolution";
import { EditorFontLoader } from "@/presentation/components/editor/fonts/font-loader";
import { Loader2, Settings, Sparkles, Palette, Headphones, Wand2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BottomSurface, RightPanel } from "@/presentation/stores/editor-store";

const rightPanelItems: { id: RightPanel; icon: typeof Settings; label: string }[] = [
  { id: "properties", icon: Settings, label: "Properties" },
  { id: "animation", icon: Sparkles, label: "Animation" },
  { id: "effects", icon: Wand2, label: "Effects" },
  { id: "background", icon: Palette, label: "Background" },
  { id: "audio", icon: Headphones, label: "Audio" },
  { id: "notes", icon: StickyNote, label: "Notes" },
];

const bottomSurfaceItems: { id: BottomSurface; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "filmstrip", label: "Filmstrip" },
];

export default function EditorPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    slideshow,
    setSlideshow,
    activeRightPanel,
    toggleRightPanel,
    activeBottomSurface,
    setActiveBottomSurface,
  } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

  // Autosave and unsaved changes protection
  useAutosave();
  useUnsavedChanges();
  useKeyboardShortcuts();

  useEffect(() => {
    async function loadSlideshow() {
      try {
        const res = await fetch(`/api/slideshows/${id}`);
        if (!res.ok) throw new Error("Failed to load slideshow");
        const data = await res.json();
        setSlideshow(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadSlideshow();
  }, [id, setSlideshow]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F0F23]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !slideshow) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F0F23]">
        <p className="text-sm text-red-400">{error || "Slideshow not found"}</p>
      </div>
    );
  }

  const resolution = Resolutions[slideshow.resolution];
  const aspectRatio = resolution.width / resolution.height;

  return (
    <TooltipProvider delayDuration={200}>
      <EditorFontLoader />
      <div className="flex h-screen flex-col bg-[#0F0F23]">
        <EditorTopBar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Rail - Authoring tabs */}
          <LeftRail />

          {/* Center - Canvas */}
          <main
            className="flex flex-1 flex-col overflow-hidden"
            onContextMenu={handleContextMenu}
          >
            <CanvasToolbar />
            <div className="flex flex-1 items-center justify-center overflow-hidden bg-[#0d0d1f] p-4">
              <FabricCanvas aspectRatio={aspectRatio} />
            </div>
          </main>

          {/* Right Side - Flyout Panel + Icon Rail */}
          <div className="flex shrink-0">
            {/* Flyout Panel */}
            <div
              className={cn(
                "flex flex-col overflow-hidden border-l border-white/[0.06] bg-[#0a0a1a] transition-[width] duration-200 ease-in-out",
                activeRightPanel ? "w-[300px]" : "w-0"
              )}
            >
              <div className="flex min-h-0 w-[300px] flex-1 flex-col">
                {activeRightPanel === "properties" && (
                  <>
                    <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Properties</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <ObjectPropertiesPanel />
                    </div>
                  </>
                )}
                {activeRightPanel === "animation" && (
                  <>
                    <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Animation</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <AnimationPanel />
                    </div>
                  </>
                )}
                {activeRightPanel === "effects" && (
                  <>
                    <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Effects</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <EffectsPanel />
                    </div>
                  </>
                )}
                {activeRightPanel === "background" && (
                  <>
                    <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Background</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <BackgroundPanel />
                    </div>
                  </>
                )}
                {activeRightPanel === "audio" && (
                  <>
                    <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Audio</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <EnhancedAudioPanel />
                    </div>
                  </>
                )}
                {activeRightPanel === "notes" && (
                  <div className="flex-1 overflow-y-auto">
                    <NotesPanel />
                  </div>
                )}
              </div>
            </div>

            {/* Icon Rail */}
            <nav className="flex w-12 shrink-0 flex-col items-center gap-1 border-l border-white/[0.06] bg-[#08081a] py-3">
              {rightPanelItems.map(({ id: panelId, icon: Icon, label }) => (
                <Tooltip key={panelId} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleRightPanel(panelId)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                        activeRightPanel === panelId
                          ? "bg-white/[0.1] text-slate-100"
                          : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={8}>
                    {label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom - Slide Strip / Timeline */}
        <div className="flex h-32 shrink-0 flex-col border-t border-white/[0.06] bg-[#0a0a1a]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Sequence
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-white/[0.03] p-1">
              {bottomSurfaceItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveBottomSurface(item.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] transition-colors",
                    activeBottomSurface === item.id
                      ? "bg-white/[0.1] text-slate-100"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1">
            {activeBottomSurface === "timeline" ? <TimelineContainer /> : <SlideStrip />}
          </div>
        </div>

        {/* Preview Modal */}
        <PreviewModal />

        {/* Presenter View */}
        <PresenterView />

        {/* Export Dialog */}
        <ExportDialog />

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
