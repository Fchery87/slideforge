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
import { PreviewModal } from "@/presentation/components/editor/preview/preview-modal";
import { ContextMenu, useContextMenu } from "@/presentation/components/editor/context-menu/context-menu";
import { Resolutions } from "@/domain/slideshow/value-objects/resolution";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Image, Music, Settings, Sparkles, Palette, Headphones } from "lucide-react";

export default function EditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { slideshow, setSlideshow } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

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
    <div className="flex h-screen flex-col bg-[#0F0F23]">
      <EditorTopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Media */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#0a0a1a]">
          <Tabs defaultValue="images" className="flex flex-1 flex-col">
            <TabsList className="mx-2 mt-2">
              <TabsTrigger value="images" className="flex items-center gap-1.5 text-xs">
                <Image className="h-3.5 w-3.5" />
                Images
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-1.5 text-xs">
                <Music className="h-3.5 w-3.5" />
                Audio
              </TabsTrigger>
            </TabsList>
            <TabsContent value="images" className="flex-1 overflow-y-auto p-2">
              <MediaBrowser type="image" />
            </TabsContent>
            <TabsContent value="audio" className="flex-1 overflow-y-auto p-2">
              <MediaBrowser type="audio" />
            </TabsContent>
          </Tabs>
          <div className="border-t border-white/[0.08] p-2">
            <MediaUploadZone />
          </div>
        </aside>

        {/* Center - Canvas */}
        <main 
          className="flex flex-1 flex-col overflow-hidden"
          onContextMenu={handleContextMenu}
        >
          <CanvasToolbar />
          <div className="flex flex-1 items-center justify-center overflow-hidden bg-[#0d0d1f] p-6">
            <FabricCanvas aspectRatio={aspectRatio} />
          </div>
        </main>

        {/* Right Sidebar - Properties, Animation, Background & Audio */}
        <aside className="w-72 shrink-0 overflow-y-auto border-l border-white/[0.08] bg-[#0a0a1a]">
          <Tabs defaultValue="properties" className="flex flex-col h-full">
            <TabsList className="mx-2 mt-2 grid w-auto grid-cols-4">
              <TabsTrigger value="properties" className="flex items-center gap-1.5 text-xs">
                <Settings className="h-3.5 w-3.5" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="animation" className="flex items-center gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Animation
              </TabsTrigger>
              <TabsTrigger value="background" className="flex items-center gap-1.5 text-xs">
                <Palette className="h-3.5 w-3.5" />
                Background
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-1.5 text-xs">
                <Headphones className="h-3.5 w-3.5" />
                Audio
              </TabsTrigger>
            </TabsList>
            <TabsContent value="properties" className="flex-1 overflow-y-auto">
              <ObjectPropertiesPanel />
            </TabsContent>
            <TabsContent value="animation" className="flex-1 overflow-y-auto">
              <AnimationPanel />
            </TabsContent>
            <TabsContent value="background" className="flex-1 overflow-y-auto">
              <BackgroundPanel />
            </TabsContent>
            <TabsContent value="audio" className="flex-1 overflow-y-auto">
              <EnhancedAudioPanel />
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      {/* Bottom - Slide Strip / Timeline */}
      <div className="h-28 shrink-0 border-t border-white/[0.08] bg-[#0a0a1a]">
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
  );
}
