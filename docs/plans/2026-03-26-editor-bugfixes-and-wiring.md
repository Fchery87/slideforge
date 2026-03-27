# Editor Bugfixes & Wiring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all broken wiring, dead UI, missing API endpoints, and incorrect logic in the Slideforge editor so every existing feature actually works end-to-end.

**Architecture:** Fix-forward approach — create missing API routes, wire dead buttons, fix hardcoded values, add missing repository methods, and ensure the audio panel's update flow persists to DB. No new features; only make existing code work.

**Tech Stack:** Next.js (App Router), Zustand, Fabric.js, Drizzle ORM, Cloudflare R2, TypeScript

---

### Task 1: Add `updateAudioTrack` to repository interface

The `EnhancedAudioPanel` calls `PUT /api/slideshows/{id}/audio/{trackId}` to update volume, trim, and fade — but neither the repository interface nor the Drizzle implementation has an `updateAudioTrack` method.

**Files:**
- Modify: `src/domain/slideshow/repositories/slideshow-repository.interface.ts:24-25`
- Modify: `src/infrastructure/repositories/drizzle-slideshow-repository.ts:294-296`

**Step 1: Add method to interface**

In `src/domain/slideshow/repositories/slideshow-repository.interface.ts`, after line 24 (`addAudioTrack`), add:

```typescript
  updateAudioTrack(trackId: string, data: Partial<Pick<AudioTrack, "startFrame" | "endFrame" | "volume" | "fadeInFrames" | "fadeOutFrames">>): Promise<AudioTrack>;
```

**Step 2: Implement in Drizzle repository**

In `src/infrastructure/repositories/drizzle-slideshow-repository.ts`, after the `removeAudioTrack` method (line 296), add:

```typescript
  async updateAudioTrack(
    trackId: string,
    data: Partial<Pick<AudioTrack, "startFrame" | "endFrame" | "volume" | "fadeInFrames" | "fadeOutFrames">>
  ): Promise<AudioTrack> {
    await db
      .update(audioTracks)
      .set(data)
      .where(eq(audioTracks.id, trackId));

    const [row] = await db
      .select()
      .from(audioTracks)
      .where(eq(audioTracks.id, trackId));

    return {
      id: row.id,
      slideshowId: row.slideshowId,
      mediaAssetId: row.mediaAssetId,
      trackIndex: row.trackIndex,
      startFrame: row.startFrame,
      endFrame: row.endFrame,
      volume: row.volume,
      fadeInFrames: row.fadeInFrames,
      fadeOutFrames: row.fadeOutFrames,
      createdAt: row.createdAt,
    };
  }
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -i "audioTrack\|slideshow-repo" | head -5`
Expected: No new errors related to these files.

**Step 4: Commit**

```bash
git add src/domain/slideshow/repositories/slideshow-repository.interface.ts src/infrastructure/repositories/drizzle-slideshow-repository.ts
git commit -m "feat: add updateAudioTrack to repository interface and Drizzle implementation"
```

---

### Task 2: Create `PUT /api/slideshows/[id]/audio/[trackId]` API route

The `EnhancedAudioPanel` component calls `PUT /api/slideshows/{id}/audio/{trackId}` to update audio track properties (volume, trim, fade). This endpoint does not exist — only POST and DELETE are handled in the audio route.

**Files:**
- Create: `src/app/api/slideshows/[id]/audio/[trackId]/route.ts`

**Step 1: Create the route file**

```typescript
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id, trackId } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const track = existing.audioTracks.find((t) => t.id === trackId);
  if (!track) return NextResponse.json({ error: "Track not found" }, { status: 404 });

  const body = await request.json();
  const updated = await slideshowRepo.updateAudioTrack(trackId, {
    startFrame: body.startFrame,
    endFrame: body.endFrame,
    volume: body.volume,
    fadeInFrames: body.fadeInFrames,
    fadeOutFrames: body.fadeOutFrames,
  });

  return NextResponse.json(updated);
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep "audio" | head -5`
Expected: No new errors.

**Step 3: Commit**

```bash
git add src/app/api/slideshows/\[id\]/audio/\[trackId\]/route.ts
git commit -m "feat: add PUT endpoint for audio track updates"
```

---

### Task 3: Wire audio panel to update store alongside API calls

The `EnhancedAudioPanel` component calls the API to update audio tracks but **never updates the Zustand store**, so changes don't reflect in the UI until page reload.

**Files:**
- Modify: `src/presentation/components/editor/audio/enhanced-audio-panel.tsx:157-186`

**Step 1: Fix `updateTrackTrim` to also update the store**

Replace the `updateTrackTrim` function (lines 157-168) with:

```typescript
  const updateTrackTrim = async (trackId: string, field: 'startFrame' | 'endFrame', value: number) => {
    const track = slideshow.audioTracks.find((t) => t.id === trackId);
    if (!track) return;

    updateAudioTrack(trackId, { [field]: value });

    await fetch(`/api/slideshows/${slideshowId}/audio/${trackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...track, [field]: value }),
    });
  };
```

**Step 2: Fix `updateTrackVolume` to also update the store**

Replace the `updateTrackVolume` function (lines 170-186) with:

```typescript
  const updateTrackVolume = async (trackId: string, volume: number) => {
    const track = slideshow.audioTracks.find((t) => t.id === trackId);
    if (!track) return;

    updateAudioTrack(trackId, { volume });

    if (audioRefs.current[trackId]) {
      audioRefs.current[trackId].volume = volume / 100;
    }

    await fetch(`/api/slideshows/${slideshowId}/audio/${trackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...track, volume }),
    });
  };
```

**Step 3: Fix fade controls to also update the store**

In the fade controls section (lines 338-373), the inline `fetch` calls also need to call `updateAudioTrack`. Replace the fade-in onChange handler (lines 345-351):

```typescript
                          onChange={(e) => {
                            const frames = Number(e.target.value);
                            updateAudioTrack(track.id, { fadeInFrames: frames });
                            fetch(`/api/slideshows/${slideshowId}/audio/${track.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...track, fadeInFrames: frames }),
                            });
                          }}
```

And replace the fade-out onChange handler (lines 361-367):

```typescript
                          onChange={(e) => {
                            const frames = Number(e.target.value);
                            updateAudioTrack(track.id, { fadeOutFrames: frames });
                            fetch(`/api/slideshows/${slideshowId}/audio/${track.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...track, fadeOutFrames: frames }),
                            });
                          }}
```

**Step 4: Commit**

```bash
git add src/presentation/components/editor/audio/enhanced-audio-panel.tsx
git commit -m "fix: wire audio panel updates to both store and API"
```

---

### Task 4: Wire the "Add Image" toolbar button

The "Add Image" button in `CanvasToolbar` has no `onClick` handler — it's a dead button. It should open a file picker or trigger image addition from the media library.

**Files:**
- Modify: `src/presentation/components/editor/canvas/canvas-toolbar.tsx:30-31,92-156`

**Step 1: Add a file input ref and image upload handler**

Add imports and a handler to the toolbar. After the `addShape` callback (line 90), add:

```typescript
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addImageFromFile = useCallback(async (file: File) => {
    if (!currentSlide) return;

    try {
      // Get presigned URL
      const presignRes = await fetch(
        `/api/media/presign?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
        { credentials: "include" }
      );
      if (!presignRes.ok) throw new Error("Failed to get presigned URL");
      const { presignedUrl, storageKey } = await presignRes.json();

      // Upload to R2
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storageKey", storageKey);
      const uploadRes = await fetch("/api/media/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // Get image dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 400, height: 300 });
        img.src = URL.createObjectURL(file);
      });

      // Register in media library
      const confirmRes = await fetch("/api/media", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          type: "image",
          storageKey,
          width: dimensions.width,
          height: dimensions.height,
        }),
      });
      if (!confirmRes.ok) throw new Error("Failed to register media");
      const asset = await confirmRes.json();

      // Add to canvas
      const id = nanoid();
      const scale = Math.min(400 / dimensions.width, 300 / dimensions.height, 1);
      addObject(currentSlide.id, {
        id,
        slideId: currentSlide.id,
        type: "image",
        x: 100,
        y: 100,
        width: Math.round(dimensions.width * scale),
        height: Math.round(dimensions.height * scale),
        rotation: 0,
        opacity: 1,
        zIndex: (currentSlide.canvasObjects.length ?? 0) + 1,
        properties: {
          mediaAssetId: asset.id,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to add image:", err);
    }
  }, [currentSlide, addObject]);
```

Also add `useRef` to the import from "react" on line 3:

```typescript
import { useCallback, useRef } from "react";
```

**Step 2: Wire the button and add hidden file input**

Replace the "Add Image" button block (lines 143-156) with:

```tsx
        {/* Add Image */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-slate-400 hover:text-slate-200"
              onClick={() => imageInputRef.current?.click()}
              disabled={!currentSlide}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Image from Library</TooltipContent>
        </Tooltip>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addImageFromFile(file);
            e.target.value = "";
          }}
        />
```

**Step 3: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep "canvas-toolbar" | head -5`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/presentation/components/editor/canvas/canvas-toolbar.tsx
git commit -m "feat: wire Add Image toolbar button with file picker and upload flow"
```

---

### Task 5: Fix alignment calculations to use actual resolution

The `ObjectPropertiesPanel` alignment functions use hardcoded values (`slideshow.slides[0]?.canvasObjects[0]?.width` for center, `540` for middle) instead of the slideshow's resolution.

**Files:**
- Modify: `src/presentation/components/editor/canvas/object-properties-panel.tsx:188-221`

**Step 1: Add Resolutions import**

At the top of the file, add:

```typescript
import { Resolutions } from "@/domain/slideshow/value-objects/resolution";
```

**Step 2: Fix `alignCenter` (line 194-198)**

Replace:
```typescript
  const alignCenter = () => {
    if (!currentSlide || !slideshow) return;
    const slideWidth = slideshow.slides[0]?.canvasObjects[0]?.width || 960;
    update({ x: (slideWidth - selectedObject.width) / 2 });
  };
```

With:
```typescript
  const alignCenter = () => {
    if (!currentSlide || !slideshow) return;
    const { width: slideWidth } = Resolutions[slideshow.resolution];
    update({ x: (slideWidth - selectedObject.width) / 2 });
  };
```

**Step 3: Fix `alignMiddle` (line 213-216)**

Replace:
```typescript
  const alignMiddle = () => {
    if (!currentSlide || !slideshow) return;
    const slideHeight = 540;
    update({ y: (slideHeight - selectedObject.height) / 2 });
  };
```

With:
```typescript
  const alignMiddle = () => {
    if (!currentSlide || !slideshow) return;
    const { height: slideHeight } = Resolutions[slideshow.resolution];
    update({ y: (slideHeight - selectedObject.height) / 2 });
  };
```

**Step 4: Fix `alignLeft` to align to slide edge (x=0), not to other objects**

Replace:
```typescript
  const alignLeft = () => {
    if (!currentSlide) return;
    const minX = Math.min(...currentSlide.canvasObjects.map((o) => o.x));
    update({ x: minX });
  };
```

With:
```typescript
  const alignLeft = () => {
    update({ x: 0 });
  };
```

**Step 5: Fix `alignTop` to align to slide edge (y=0)**

Replace:
```typescript
  const alignTop = () => {
    if (!currentSlide) return;
    const minY = Math.min(...currentSlide.canvasObjects.map((o) => o.y));
    update({ y: minY });
  };
```

With:
```typescript
  const alignTop = () => {
    update({ y: 0 });
  };
```

**Step 6: Fix `alignRight` to align to slide right edge**

Replace:
```typescript
  const alignRight = () => {
    if (!currentSlide) return;
    const maxX = Math.max(...currentSlide.canvasObjects.map((o) => o.x + o.width));
    update({ x: maxX - selectedObject.width });
  };
```

With:
```typescript
  const alignRight = () => {
    if (!slideshow) return;
    const { width: slideWidth } = Resolutions[slideshow.resolution];
    update({ x: slideWidth - selectedObject.width });
  };
```

**Step 7: Fix `alignBottom` to align to slide bottom edge**

Replace:
```typescript
  const alignBottom = () => {
    if (!currentSlide) return;
    const maxY = Math.max(...currentSlide.canvasObjects.map((o) => o.y + o.height));
    update({ y: maxY - selectedObject.height });
  };
```

With:
```typescript
  const alignBottom = () => {
    if (!slideshow) return;
    const { height: slideHeight } = Resolutions[slideshow.resolution];
    update({ y: slideHeight - selectedObject.height });
  };
```

**Step 8: Commit**

```bash
git add src/presentation/components/editor/canvas/object-properties-panel.tsx
git commit -m "fix: use actual slideshow resolution for alignment calculations"
```

---

### Task 6: Fix preview modal to use Resolution value object

The `PreviewModal` hardcodes resolution to "1080p" or default instead of reading from the `Resolutions` map.

**Files:**
- Modify: `src/presentation/components/editor/preview/preview-modal.tsx:71`

**Step 1: Add import**

At the top of the file, add:

```typescript
import { Resolutions } from "@/domain/slideshow/value-objects/resolution";
```

**Step 2: Fix resolution lookup**

Replace line 71:
```typescript
  const resolution = slideshow.resolution === "1080p" ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
```

With:
```typescript
  const resolution = Resolutions[slideshow.resolution] ?? Resolutions["1080p"];
```

**Step 3: Commit**

```bash
git add src/presentation/components/editor/preview/preview-modal.tsx
git commit -m "fix: use Resolutions value object in preview modal"
```

---

### Task 7: Add drag-and-drop from media sidebar to canvas

The `EnhancedMediaBrowser` sets drag data with `application/slideforge-media`, but `FabricCanvas` has no drop handler. Images can only be added by clicking in the sidebar — dragging to the canvas does nothing.

**Files:**
- Modify: `src/presentation/components/editor/canvas/fabric-canvas.tsx:386-396`

**Step 1: Add drop handlers to the canvas container**

Replace the return JSX (lines 386-396):

```tsx
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/slideforge-media");
      if (!raw) return;

      try {
        const asset = JSON.parse(raw);
        const store = storeRef.current;
        const currentSlide = store.slideshow?.slides[store.currentSlideIndex];
        if (!currentSlide || asset.type !== "image") return;

        const id = crypto.randomUUID();
        store.addObject(currentSlide.id, {
          id,
          slideId: currentSlide.id,
          type: "image",
          x: 100,
          y: 100,
          width: asset.width ?? 400,
          height: asset.height ?? 300,
          rotation: 0,
          opacity: 1,
          zIndex: currentSlide.canvasObjects.length + 1,
          properties: {
            mediaAssetId: asset.id,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch {
        // Invalid drag data
      }
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div data-canvas-sizer className="relative rounded-lg shadow-2xl ring-1 ring-white/[0.06]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
```

**Step 2: Commit**

```bash
git add src/presentation/components/editor/canvas/fabric-canvas.tsx
git commit -m "feat: add drag-and-drop from media sidebar to canvas"
```

---

### Task 8: Add image properties to ImagePropertiesEditor

The `ImagePropertiesEditor` only shows the asset ID. It should allow basic controls: opacity is handled by the parent panel, but the image-specific section should at least show fit mode and allow replacing the image.

**Files:**
- Modify: `src/presentation/components/editor/canvas/object-properties-panel.tsx:478-482,849-861`

**Step 1: Update the ImagePropertiesEditor to accept onUpdate**

Replace the `ImagePropertiesEditor` component (lines 849-861):

```tsx
function ImagePropertiesEditor({
  properties,
  onUpdate,
}: {
  properties: ImageProperties;
  onUpdate: (props: Partial<ImageProperties>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-slate-500">Asset ID</Label>
        <p className="mt-1 text-xs text-slate-300 font-mono">
          {properties.mediaAssetId.slice(0, 12)}...
        </p>
      </div>

      {properties.objectFit && (
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Fit Mode</Label>
          <select
            value={properties.objectFit || "cover"}
            onChange={(e) => onUpdate({ objectFit: e.target.value as "cover" | "contain" | "fill" })}
            className="mt-1 h-7 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-slate-200 outline-none"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
          </select>
        </div>
      )}

      <p className="text-[10px] text-slate-500">
        Use the position and size controls above to transform this image.
        Drag a new image from the sidebar to replace.
      </p>
    </div>
  );
}
```

**Step 2: Pass `onUpdate` to ImagePropertiesEditor**

Replace line 478-482:
```tsx
      {selectedObject.type === "image" && (
        <ImagePropertiesEditor
          properties={selectedObject.properties as ImageProperties}
        />
      )}
```

With:
```tsx
      {selectedObject.type === "image" && (
        <ImagePropertiesEditor
          properties={selectedObject.properties as ImageProperties}
          onUpdate={updateProperties}
        />
      )}
```

**Step 3: Commit**

```bash
git add src/presentation/components/editor/canvas/object-properties-panel.tsx
git commit -m "feat: add image properties editor with fit mode and guidance"
```

---

### Task 9: Fix preview modal to render actual slide content

The `PreviewModal` shows only a "Preview placeholder" text instead of rendering actual slide objects (text, shapes, images).

**Files:**
- Modify: `src/presentation/components/editor/preview/preview-modal.tsx:107-117`

**Step 1: Add a slide content renderer**

Replace the placeholder content (lines 107-117):

```tsx
          {/* Slide Content */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: currentSlide?.backgroundColor || slideshow.backgroundColor || "#1a1a2e",
            }}
          >
            {currentSlide?.canvasObjects
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((obj) => (
                <PreviewObject key={obj.id} obj={obj} resolution={resolution} />
              ))}
          </div>
```

**Step 2: Add the PreviewObject component at the bottom of the file (before the `PreviewButton` export)**

```tsx
function PreviewObject({ obj, resolution }: { obj: import("@/domain/slideshow/entities/canvas-object").CanvasObject; resolution: { width: number; height: number } }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${(obj.x / resolution.width) * 100}%`,
    top: `${(obj.y / resolution.height) * 100}%`,
    width: `${(obj.width / resolution.width) * 100}%`,
    height: `${(obj.height / resolution.height) * 100}%`,
    transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
    opacity: obj.opacity,
  };

  if (obj.type === "text") {
    const props = obj.properties as Record<string, unknown>;
    return (
      <div
        style={{
          ...style,
          fontFamily: (props.fontFamily as string) || "sans-serif",
          fontSize: `${((props.fontSize as number) || 32) / resolution.width * 100}vw`,
          color: (props.fontColor as string) || "#ffffff",
          fontWeight: (props.fontWeight as string) || "normal",
          textAlign: (props.textAlign as React.CSSProperties["textAlign"]) || "left",
          lineHeight: (props.lineHeight as number) || 1.2,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {(props.content as string) || ""}
      </div>
    );
  }

  if (obj.type === "shape") {
    const props = obj.properties as Record<string, unknown>;
    const shapeType = (props.shapeType as string) || "rectangle";
    const fill = (props.fill as string) || "#6366F1";
    const stroke = (props.stroke as string) || "transparent";
    const strokeWidth = (props.strokeWidth as number) || 0;

    if (shapeType === "circle") {
      return (
        <div style={style}>
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <ellipse cx="50" cy="50" rx="48" ry="48" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </svg>
        </div>
      );
    }
    if (shapeType === "triangle") {
      return (
        <div style={style}>
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <polygon points="50,2 98,98 2,98" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </svg>
        </div>
      );
    }
    return (
      <div
        style={{
          ...style,
          backgroundColor: fill,
          border: strokeWidth ? `${strokeWidth}px solid ${stroke}` : undefined,
        }}
      />
    );
  }

  if (obj.type === "image") {
    const props = obj.properties as Record<string, unknown>;
    return (
      <img
        src={`/api/media/${props.mediaAssetId}/file`}
        alt=""
        style={{ ...style, objectFit: "cover" }}
      />
    );
  }

  return null;
}
```

**Step 3: Add auto-advance when playing**

After the existing `useEffect` for keyboard controls (line 66), add:

```typescript
  // Auto-advance slides when playing
  useEffect(() => {
    if (!isPlaying || !slideshow) return;

    const currentSlide = slideshow.slides[currentSlideIndex];
    if (!currentSlide) return;

    const durationMs = (currentSlide.durationFrames / slideshow.fps) * 1000;
    const timer = setTimeout(() => {
      if (currentSlideIndex < slideshow.slides.length - 1) {
        setCurrentSlideIndex(currentSlideIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentSlideIndex, slideshow, setCurrentSlideIndex]);
```

**Step 4: Commit**

```bash
git add src/presentation/components/editor/preview/preview-modal.tsx
git commit -m "feat: render actual slide content in preview modal with auto-advance"
```

---

### Task 10: Fix `sendToBack` z-index logic

The `sendToBack` function uses `Math.max(1, minZIndex - 1)` which doesn't properly send objects to z-index 0 when all objects have high z-indices.

**Files:**
- Modify: `src/presentation/components/editor/canvas/object-properties-panel.tsx:172-176`

**Step 1: Fix the logic**

Replace:
```typescript
  const sendToBack = () => {
    if (!currentSlide) return;
    const minZIndex = Math.min(...currentSlide.canvasObjects.map((o) => o.zIndex), 1);
    update({ zIndex: Math.max(1, minZIndex - 1) });
  };
```

With:
```typescript
  const sendToBack = () => {
    if (!currentSlide) return;
    const minZIndex = Math.min(...currentSlide.canvasObjects.map((o) => o.zIndex));
    update({ zIndex: minZIndex > 0 ? minZIndex - 1 : 0 });
  };
```

**Step 2: Commit**

```bash
git add src/presentation/components/editor/canvas/object-properties-panel.tsx
git commit -m "fix: sendToBack z-index calculation"
```

---

### Task 11: Verify all fixes end-to-end

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Only pre-existing errors, no new ones from our changes.

**Step 2: Run dev server**

Run: `npm run dev`
Expected: Compiles without errors.

**Step 3: Manual verification checklist**

1. Open an existing slideshow in the editor
2. Click "Add Image" in toolbar → file picker opens → upload an image → appears on canvas
3. Drag an image from the media sidebar onto the canvas → image appears
4. Select an object → use alignment buttons → objects align to slide edges/center
5. Open Audio panel → add a track → adjust volume slider → value persists on reload
6. Click Preview → see actual slide content (text, shapes, images) → auto-advance works
7. Check server logs for 404s → no more `/api/media/*/file` 404s for uploaded media
