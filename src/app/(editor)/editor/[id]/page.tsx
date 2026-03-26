"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { EditorTopBar } from "@/presentation/components/editor/top-bar/editor-top-bar";
import { FabricCanvas } from "@/presentation/components/editor/canvas/fabric-canvas";
import { CanvasToolbar } from "@/presentation/components/editor/canvas/canvas-toolbar";
import { ObjectPropertiesPanel } from "@/presentation/components/editor/canvas/object-properties-panel";
import { SlideStrip } from "@/presentation/components/editor/slides/slide-strip";
import { MediaBrowser } from "@/presentation/components/editor/media-sidebar/enhanced-media-browser";
import { MediaUploadZone } from "@/presentation/components/editor/media-sidebar/media-upload-zone";
import { EnhancedAudioPanel } from "@/presentation/components/editor/audio/enhanced-audio-panel";
import { AnimationPanel } from "@/presentation/components/editor/animation/animation-panel";
import { BackgroundPanel } from "@/presentation/components/editor/background/background-panel";
import { EffectsPanel } from "@/presentation/components/editor/effects/enhanced-effects-panel";
import { PreviewModal } from "@/presentation/components/editor/preview/preview-modal";
import { ContextMenu, useContextMenu } from "@/presentation/components/editor/context-menu/context-menu";
import { Resolutions } from "@/domain/slideshow/value-objects/resolution";
import { Loader2, Image, Music, Settings, Sparkles, Palette, Headphones, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RightPanel = "properties" | "animation" | "effects" | "background" | "audio" | null;

const rightPanelItems: { id: RightPanel; icon: typeof Settings; label: string }[] = [
  { id: "properties", icon: Settings, label: "Properties" },
  { id: "animation", icon: Sparkles, label: "Animation" },
  { id: "effects", icon: Wand2, label: "Effects" },
  { id: "background", icon: Palette, label: "Background" },
  { id: "audio", icon: Headphones, label: "Audio" },
];

export default function EditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { slideshow, setSlideshow } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanel>("properties");
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

  const toggleRightPanel = (panel: RightPanel) => {
    setActiveRightPanel((prev) => (prev === panel ? null : panel));
  };

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
      <div className="flex h-screen flex-col bg-[#0F0F23]">
        <EditorTopBar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Media */}
          <aside className="flex w-[272px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a1a]">
            <Tabs defaultValue="images" className="flex flex-1 flex-col">
              <TabsList className="mx-3 mt-3 mb-1">
                <TabsTrigger value="images" className="flex items-center gap-1.5 text-xs">
                  <Image className="h-3.5 w-3.5" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-1.5 text-xs">
                  <Music className="h-3.5 w-3.5" />
                  Audio
                </TabsTrigger>
              </TabsList>
              <TabsContent value="images" className="flex-1 overflow-y-auto px-3 pb-3">
                <MediaBrowser type="image" />
              </TabsContent>
              <TabsContent value="audio" className="flex-1 overflow-y-auto px-3 pb-3">
                <MediaBrowser type="audio" />
              </TabsContent>
            </Tabs>
            <div className="border-t border-white/[0.06] p-3">
              <MediaUploadZone />
            </div>
          </aside>

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
        <div className="h-32 shrink-0 border-t border-white/[0.06] bg-[#0a0a1a]">
          <SlideStrip />
        </div>

        {/* Preview Modal */}
        <PreviewModal />

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
