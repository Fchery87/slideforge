# Editor Comprehensive Bugfix Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all broken wiring, bugs, and inconsistencies in the Slideforge editor so every existing feature works correctly end-to-end.

**Architecture:** Fix-forward approach — fix existing code rather than rewriting. Standardize opacity on 0-1 scale (matching Fabric.js and the properties panel), add missing `pushToHistory()` calls, fix the audio panel ESLint error, fix event listener leaks, and normalize opacity values at creation sites.

**Tech Stack:** Next.js (App Router), Zustand, Fabric.js, Drizzle ORM, Cloudflare R2, TypeScript

---

### Task 1: Fix `updateObject` missing `pushToHistory()` call

The `updateObject` store method mutates state but never calls `pushToHistory()`, so users cannot undo any object property or position change. Every other mutation method (`addObject`, `removeObject`, `updateSlide`, etc.) calls `pushToHistory()` — this one was missed.

**Files:**
- Modify: `src/presentation/stores/editor/document-slice.ts:134`

**Step 1: Add pushToHistory before the set call**

At line 134, the `updateObject` method starts with just `set(...)`. Add `get().pushToHistory();` before it:

```typescript
  updateObject: (slideId, objId, data) => {
    get().pushToHistory();
    set((state) => {
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep "document-slice" | head -5`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/presentation/stores/editor/document-slice.ts
git commit -m "fix: add pushToHistory to updateObject for undo support"
```

---

### Task 2: Fix `updateAudioTrack` missing `pushToHistory()` call

Same issue as Task 1 but for audio track updates at line 399.

**Files:**
- Modify: `src/presentation/stores/editor/document-slice.ts:399`

**Step 1: Add pushToHistory before the set call**

```typescript
  updateAudioTrack: (trackId, data) => {
    get().pushToHistory();
    set((state) => {
```

**Step 2: Commit**

```bash
git add src/presentation/stores/editor/document-slice.ts
git commit -m "fix: add pushToHistory to updateAudioTrack for undo support"
```

---

### Task 3: Fix opacity scale inconsistency

There is a fundamental opacity mismatch:
- DB schema stores opacity as `integer` with `default(100)` (0-100 scale)
- Properties panel UI uses 0-1 (max=1, step=0.05)
- Fabric.js expects 0-1
- `text-tool-panel.tsx` creates objects with `opacity: 100`
- `canvas-toolbar.tsx` creates text/shapes with `opacity: 1`
- `enhanced-media-browser.tsx` creates images with `opacity: 1`
- `object:modified` handler writes back Fabric's 0-1 value directly

Decision: Standardize on **0-1** in the domain layer (matching Fabric.js and the properties panel). Fix creation sites and the DB default.

**Files:**
- Modify: `src/presentation/components/editor/text/text-tool-panel.tsx:41`
- Modify: `src/infrastructure/database/schema/canvas-objects.ts:15`
- Modify: `src/presentation/components/shared/slide-renderer.tsx:32`

**Step 1: Fix text-tool-panel to use 0-1 opacity**

In `src/presentation/components/editor/text/text-tool-panel.tsx`, change line 41 from:
```typescript
      opacity: 100,
```
To:
```typescript
      opacity: 1,
```

**Step 2: Fix DB schema default**

In `src/infrastructure/database/schema/canvas-objects.ts`, line 15, change:
```typescript
  opacity: integer("opacity").notNull().default(100),
```
To:
```typescript
  opacity: integer("opacity").notNull().default(1),
```

Note: This only affects new rows. Existing rows with opacity=100 will appear invisible since Fabric will treat 100 as >1 (which Fabric clamps to 1, so actually existing data still renders fine). The real risk is the integer type truncating 0.5 to 0. Since opacity is stored as `integer`, we should consider changing it — but that's a DB migration. For now, the domain layer uses 0-1 and the DB integer will store 0 or 1. This is acceptable since most objects are fully opaque (1).

**Actually — better approach:** Keep the DB storing 0-100 integers, and convert at the repository boundary. This preserves precision for semi-transparent objects.

**Step 2 (revised): Add conversion in the repository**

In `src/infrastructure/repositories/drizzle-slideshow-repository.ts`, when reading canvas objects (lines ~41 and ~208), convert `o.opacity` from DB int to domain float:

At the mapping where `opacity: o.opacity` appears, change to:
```typescript
        opacity: o.opacity / 100,
```

And when writing (lines ~242, ~254), convert back:
```typescript
          opacity: Math.round(obj.opacity * 100),
```

**Step 3: Revert DB schema default change — keep default(100)**

Keep `default(100)` in the DB schema since we're converting at the repo boundary.

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -10`

**Step 5: Commit**

```bash
git add src/presentation/components/editor/text/text-tool-panel.tsx src/infrastructure/repositories/drizzle-slideshow-repository.ts
git commit -m "fix: standardize opacity on 0-1 scale with DB conversion at repository boundary"
```

---

### Task 4: Fix audio panel ESLint error — variable used before declaration

The `useEffect` at line 39-47 calls `generateWaveform` which is declared _after_ the effect (line 49). React's hooks linter flags this as "Cannot access variable before it is declared."

**Files:**
- Modify: `src/presentation/components/editor/audio/enhanced-audio-panel.tsx:38-80`

**Step 1: Move generateWaveform and generateSimpleWaveform ABOVE the useEffect**

Move lines 49-80 (both functions) to above line 38 (the useEffect). Then wrap both in `useCallback`:

```typescript
  const generateSimpleWaveform = useCallback(async (mediaAssetId: string, trackId: string) => {
    try {
      const audio = new Audio(`/api/media/${mediaAssetId}/file`);
      audio.crossOrigin = "anonymous";

      const handleLoaded = () => {
        const peaks = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2);
        setWaveforms((prev) => ({
          ...prev,
          [trackId]: { peaks, duration: audio.duration },
        }));
        audio.removeEventListener("loadedmetadata", handleLoaded);
      };
      audio.addEventListener("loadedmetadata", handleLoaded);
      audio.load();
    } catch {
      // Silent fail
    }
  }, []);

  const generateWaveform = useCallback(async (mediaAssetId: string, trackId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaAssetId}/waveform`);
      if (response.ok) {
        const data = await response.json();
        setWaveforms((prev) => ({ ...prev, [trackId]: data }));
      } else {
        generateSimpleWaveform(mediaAssetId, trackId);
      }
    } catch {
      generateSimpleWaveform(mediaAssetId, trackId);
    }
  }, [generateSimpleWaveform]);
```

Note: This also fixes the event listener leak from `generateSimpleWaveform` — the named handler is now removed after firing.

**Step 2: Update the useEffect deps**

```typescript
  useEffect(() => {
    if (!slideshow) return;

    slideshow.audioTracks.forEach((track) => {
      if (!waveforms[track.id]) {
        generateWaveform(track.mediaAssetId, track.id);
      }
    });
  }, [slideshow, waveforms, generateWaveform]);
```

**Step 3: Remove unused `useCallback` import warning**

The import at line 3 already includes `useCallback`, so this should resolve the "unused" warning too since we're now using it.

**Step 4: Verify ESLint passes**

Run: `npx eslint src/presentation/components/editor/audio/enhanced-audio-panel.tsx 2>&1`
Expected: No errors (warnings about unused vars are OK).

**Step 5: Commit**

```bash
git add src/presentation/components/editor/audio/enhanced-audio-panel.tsx
git commit -m "fix: resolve ESLint error and event listener leak in audio panel"
```

---

### Task 5: Fix Fabric canvas opacity conversion

The `canvasObjectToFabric` function passes `obj.opacity` directly to Fabric. After Task 3, the domain value is 0-1 so this is correct. But the `object:modified` handler at line 246 writes back `target.opacity ?? 1` which is already 0-1 — this is now consistent.

However, the `SlideRenderer` at line 32 also uses `opacity: obj.opacity` directly in CSS. CSS opacity also uses 0-1, so this is correct after Task 3.

**No code changes needed** — Task 3's normalization makes everything consistent. This task is just verification.

**Step 1: Verify the chain**

- DB stores 0-100 integers
- Repository converts to 0-1 on read, back to 0-100 on write (Task 3)
- Domain uses 0-1
- Fabric canvas uses 0-1 ✓
- Properties panel uses 0-1 (max=1, step=0.05) ✓
- SlideRenderer CSS opacity uses 0-1 ✓
- `text-tool-panel` creates with `opacity: 1` (after Task 3 fix) ✓
- `canvas-toolbar` creates text/shapes with `opacity: 1` ✓
- `enhanced-media-browser` creates images with `opacity: 1` ✓

**Step 2: Commit** — nothing to commit, verification only.

---

### Task 6: Add `updateAudioTrack` to repository interface and implementation

The audio panel calls `PUT /api/slideshows/{id}/audio/{trackId}` but the repository has no `updateAudioTrack` method — only `addAudioTrack` and `removeAudioTrack`.

**Files:**
- Modify: `src/domain/slideshow/repositories/slideshow-repository.interface.ts`
- Modify: `src/infrastructure/repositories/drizzle-slideshow-repository.ts`

**Step 1: Add method signature to interface**

After the `removeAudioTrack` method in the interface, add:

```typescript
  updateAudioTrack(trackId: string, data: Partial<Pick<AudioTrack, "startFrame" | "endFrame" | "volume" | "fadeInFrames" | "fadeOutFrames">>): Promise<AudioTrack>;
```

**Step 2: Implement in Drizzle repository**

After `removeAudioTrack`, add:

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

Run: `npx tsc --noEmit 2>&1 | head -5`

**Step 4: Commit**

```bash
git add src/domain/slideshow/repositories/slideshow-repository.interface.ts src/infrastructure/repositories/drizzle-slideshow-repository.ts
git commit -m "feat: add updateAudioTrack to repository interface and Drizzle implementation"
```

---

### Task 7: Create `PUT /api/slideshows/[id]/audio/[trackId]` API route

The EnhancedAudioPanel calls this endpoint but it doesn't exist yet.

**Files:**
- Create or Modify: `src/app/api/slideshows/[id]/audio/[trackId]/route.ts`

**Step 1: Check if the file already exists**

Run: `ls src/app/api/slideshows/\[id\]/audio/\[trackId\]/`

If the file exists, check if it has a PUT handler. If not, add one.

**Step 2: Create/update the route file**

```typescript
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const repo = new DrizzleSlideshowRepository();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id, trackId } = await params;
  const slideshow = await repo.findById(id);
  if (!slideshow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (slideshow.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const track = slideshow.audioTracks.find((t) => t.id === trackId);
  if (!track) return NextResponse.json({ error: "Track not found" }, { status: 404 });

  const body = await request.json();
  const updated = await repo.updateAudioTrack(trackId, {
    startFrame: body.startFrame,
    endFrame: body.endFrame,
    volume: body.volume,
    fadeInFrames: body.fadeInFrames,
    fadeOutFrames: body.fadeOutFrames,
  });

  return NextResponse.json(updated);
}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -5`

**Step 4: Commit**

```bash
git add src/app/api/slideshows/\[id\]/audio/\[trackId\]/route.ts
git commit -m "feat: add PUT endpoint for audio track updates"
```

---

### Task 8: Fix drag-and-drop opacity in FabricCanvas

The `handleDrop` in `fabric-canvas.tsx` creates images with `opacity: 1` — verify this is correct after Task 3.

**Files:**
- Modify: `src/presentation/components/editor/canvas/fabric-canvas.tsx`

**Step 1: Check the handleDrop callback**

Ensure `opacity: 1` is used (not `opacity: 100`). If it's already `1`, no change needed.

**Step 2: Commit** — if changes were made.

---

### Task 9: Fix `sendToBack` z-index edge case

The `sendToBack` at line 175-178 in `object-properties-panel.tsx` uses:
```typescript
const minZIndex = Math.min(...currentSlide.canvasObjects.map((o) => o.zIndex));
update({ zIndex: minZIndex > 0 ? minZIndex - 1 : 0 });
```

This is actually fine — it handles the edge case. **No change needed** based on current code review.

---

### Task 10: Fix repository `groupId` not persisted in `upsertCanvasObjects`

When upserting canvas objects, the `groupId` field from the domain entity is not included in the insert/update operations, silently discarding group membership.

**Files:**
- Modify: `src/infrastructure/repositories/drizzle-slideshow-repository.ts` (upsertCanvasObjects method)

**Step 1: Check if groupId column exists in DB schema**

Run: `grep -n "groupId\|group_id" src/infrastructure/database/schema/canvas-objects.ts`

If the column doesn't exist, we need to add it. If it does, we just need to include it in the upsert.

**Step 2: Add groupId to the schema if missing**

In `canvas-objects.ts`, add after the `zIndex` line:
```typescript
  groupId: text("group_id"),
```

**Step 3: Include groupId in upsert operations**

In the repository's `upsertCanvasObjects` method, include `groupId: obj.groupId ?? null` in both insert and update value objects.

**Step 4: Verify and commit**

```bash
git add src/infrastructure/database/schema/canvas-objects.ts src/infrastructure/repositories/drizzle-slideshow-repository.ts
git commit -m "fix: persist groupId in canvas objects upsert"
```

---

### Task 11: Verify all fixes end-to-end

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Only pre-existing errors (admin templates route), no new ones.

**Step 2: Run ESLint**

Run: `npx eslint src/presentation/ 2>&1 | grep error`
Expected: No errors.

**Step 3: Run dev server**

Run: `npm run dev`
Expected: Compiles without errors.

**Step 4: Manual verification checklist**

1. Open an existing slideshow in the editor
2. Add text → verify opacity displays correctly (not invisible or hyper-opaque)
3. Add image via toolbar → file picker works → image appears on canvas at correct opacity
4. Drag image from media sidebar → drops onto canvas
5. Select object → use alignment buttons → aligns to slide edges/center
6. Modify an object → press Ctrl+Z → undo works
7. Open Audio panel → add track → adjust volume → value persists on reload
8. Click Preview → see actual slide content with correct opacity
9. Click Present → slides auto-advance, timer works
