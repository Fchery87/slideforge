# PRD Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the Slideforge codebase with the PRD by adding missing metadata, use cases, validation, domain logic, bulk editing, and UI features — while preserving all existing features (admin panel, media folders, canvas grouping, grid snapping, presenter mode, slide notes, slide layouts).

**Architecture:** We keep "Slideshow" as the ubiquitous language (not "Project") but add all PRD project metadata (occasion_type, status, aspect_ratio, cover_asset_id). Changes flow top-down: schema migration → domain entities → application use cases → API routes → editor store → UI components. Each phase is independently shippable.

**Tech Stack:** Next.js, Drizzle ORM, Neon Postgres, Zustand, Fabric.js, Remotion, Bun

**Existing features to preserve:** Admin panel, media folders, canvas object grouping (groupId), grid snapping, presenter mode with timer, slide notes, slide layouts system.

---

## Phase 1: Schema & Domain Foundation

### Task 1.1: Add PRD Metadata Columns to Slideshows Table

**Why:** The slideshows table is missing `occasion_type`, `status`, `aspect_ratio`, and `cover_asset_id` — all required by PRD sections 10.2 and 14.1.

**Files:**
- Modify: `src/infrastructure/database/schema/slideshows.ts`
- Modify: `src/domain/slideshow/entities/slideshow.ts`

**Step 1: Add occasion type enum and new columns to schema**

In `src/infrastructure/database/schema/slideshows.ts`, add:

```typescript
import { integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { SlideshowTheme } from "@/domain/slideshow/entities/slideshow";

export const resolutionEnum = pgEnum("resolution", ["720p", "1080p"]);

export const occasionTypeEnum = pgEnum("occasion_type", [
  "birthday", "wedding", "anniversary", "memorial", "graduation",
  "baby_shower", "family_recap", "holiday", "presentation", "custom"
]);

export const slideshowStatusEnum = pgEnum("slideshow_status", [
  "draft", "exporting", "completed", "failed"
]);

export const aspectRatioEnum = pgEnum("aspect_ratio", [
  "16:9", "9:16", "4:3", "1:1"
]);

export const slideshows = pgTable("slideshows", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled Slideshow"),
  description: text("description"),
  occasionType: occasionTypeEnum("occasion_type").notNull().default("custom"),
  status: slideshowStatusEnum("status").notNull().default("draft"),
  aspectRatio: aspectRatioEnum("aspect_ratio").notNull().default("16:9"),
  coverAssetId: text("cover_asset_id"),
  resolution: resolutionEnum("resolution").notNull().default("1080p"),
  fps: integer("fps").notNull().default(30),
  backgroundColor: text("background_color").notNull().default("#000000"),
  theme: jsonb("theme").$type<SlideshowTheme>(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

**Step 2: Update the Slideshow domain entity**

In `src/domain/slideshow/entities/slideshow.ts`, add the new fields:

```typescript
import type { ResolutionKey } from "../value-objects/resolution";
import type { Slide } from "./slide";
import type { Transition } from "./transition";
import type { AudioTrack } from "./audio-track";

export type OccasionType =
  | "birthday" | "wedding" | "anniversary" | "memorial" | "graduation"
  | "baby_shower" | "family_recap" | "holiday" | "presentation" | "custom";

export type SlideshowStatus = "draft" | "exporting" | "completed" | "failed";

export type AspectRatio = "16:9" | "9:16" | "4:3" | "1:1";

export interface SlideshowTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headlineFont: string;
  bodyFont: string;
  textColor: string;
}

export interface Slideshow {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  occasionType: OccasionType;
  status: SlideshowStatus;
  aspectRatio: AspectRatio;
  coverAssetId: string | null;
  resolution: ResolutionKey;
  fps: number;
  backgroundColor: string;
  theme?: SlideshowTheme;
  thumbnailUrl: string | null;
  slides: Slide[];
  transitions: Transition[];
  audioTracks: AudioTrack[];
  createdAt: Date;
  updatedAt: Date;
}

export function getTotalDurationFrames(slideshow: Slideshow): number {
  const slideDuration = slideshow.slides.reduce((sum, s) => sum + s.durationFrames, 0);
  const transitionOverlap = slideshow.transitions.reduce((sum, t) => sum + t.durationFrames, 0);
  return slideDuration - transitionOverlap;
}

export function getTotalDurationSeconds(slideshow: Slideshow): number {
  return getTotalDurationFrames(slideshow) / slideshow.fps;
}
```

**Step 3: Generate and apply migration**

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

**Step 4: Commit**

```bash
git add src/infrastructure/database/schema/slideshows.ts src/domain/slideshow/entities/slideshow.ts drizzle/
git commit -m "feat: add occasion_type, status, aspect_ratio, cover_asset_id to slideshows schema and domain"
```

---

### Task 1.2: Add Missing Columns to Media Assets

**Why:** PRD section 10.4 requires `processing_status` for upload state tracking. Assets also need a `slideshowId` association.

**Files:**
- Modify: `src/infrastructure/database/schema/media-assets.ts`
- Modify: `src/domain/media/entities/media-asset.ts`

**Step 1: Update schema**

In `src/infrastructure/database/schema/media-assets.ts`:

```typescript
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const mediaTypeEnum = pgEnum("media_type", ["image", "audio"]);

export const processingStatusEnum = pgEnum("processing_status", [
  "pending", "processing", "ready", "failed"
]);

export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  slideshowId: text("slideshow_id"),  // nullable — assets can be reusable
  type: mediaTypeEnum("type").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  storageKey: text("storage_key").notNull(),
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  durationMs: integer("duration_ms"),
  processingStatus: processingStatusEnum("processing_status").notNull().default("ready"),
  folderId: text("folder_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaFolders = pgTable("media_folders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

**Step 2: Update domain entity**

In `src/domain/media/entities/media-asset.ts`, add:
- `slideshowId: string | null`
- `processingStatus: "pending" | "processing" | "ready" | "failed"`

**Step 3: Generate migration, commit**

```bash
bunx drizzle-kit generate && bunx drizzle-kit migrate
git add src/infrastructure/database/schema/media-assets.ts src/domain/media/entities/media-asset.ts drizzle/
git commit -m "feat: add processing_status and slideshow_id to media_assets"
```

---

### Task 1.3: Add Missing Columns to Canvas Objects and Audio Tracks

**Why:** PRD section 16 specifies `source_asset_id` and `animation_json` on slide_items, and `trim_start_ms` on audio_tracks.

**Files:**
- Modify: `src/infrastructure/database/schema/canvas-objects.ts`
- Modify: `src/infrastructure/database/schema/audio-tracks.ts`
- Modify: `src/domain/slideshow/entities/canvas-object.ts`
- Modify: `src/domain/slideshow/entities/audio-track.ts`

**Step 1: Add `sourceAssetId` and `animation` to canvas_objects schema**

```typescript
// In canvas-objects.ts, add these columns to the pgTable definition:
sourceAssetId: text("source_asset_id"),  // references media asset used
animation: jsonb("animation"),            // animation config JSON
```

**Step 2: Add `trimStartFrame` and `trimEndFrame` to audio_tracks schema**

The existing `startFrame`/`endFrame` represent timeline position. We need separate trim fields for the audio clip itself:

```typescript
// In audio-tracks.ts, add:
trimStartFrame: integer("trim_start_frame").notNull().default(0),
trimEndFrame: integer("trim_end_frame"),  // nullable — defaults to full duration
```

**Step 3: Update corresponding domain entities**

Add `sourceAssetId: string | null` and `animation: AnimationConfig | null` to `CanvasObject`.
Add `trimStartFrame: number` and `trimEndFrame: number | null` to `AudioTrack`.

**Step 4: Generate migration, commit**

```bash
bunx drizzle-kit generate && bunx drizzle-kit migrate
git add src/infrastructure/database/schema/canvas-objects.ts src/infrastructure/database/schema/audio-tracks.ts \
  src/domain/slideshow/entities/canvas-object.ts src/domain/slideshow/entities/audio-track.ts drizzle/
git commit -m "feat: add source_asset_id, animation to canvas_objects; trim fields to audio_tracks"
```

---

### Task 1.4: Update Relations for New Columns

**Why:** New FK columns need relation definitions for Drizzle queries to work.

**Files:**
- Modify: `src/infrastructure/database/schema/relations.ts`

**Step 1: Add new relations**

Add to `mediaAssetsRelations`:
```typescript
slideshow: one(slideshows, {
  fields: [mediaAssets.slideshowId],
  references: [slideshows.id],
}),
```

Add to `slideshowsRelations`:
```typescript
coverAsset: one(mediaAssets, {
  fields: [slideshows.coverAssetId],
  references: [mediaAssets.id],
}),
mediaAssets: many(mediaAssets),
```

**Step 2: Commit**

```bash
git add src/infrastructure/database/schema/relations.ts
git commit -m "feat: add relations for new slideshow/media FK columns"
```

---

### Task 1.5: Update Repository Implementation

**Why:** The Drizzle repository must map the new columns.

**Files:**
- Modify: `src/infrastructure/repositories/drizzle-slideshow-repository.ts`
- Modify: `src/infrastructure/repositories/drizzle-media-repository.ts`
- Modify: `src/domain/slideshow/repositories/slideshow-repository.interface.ts`

**Step 1: Update repository interface**

Add to `ISlideshowRepository`:
```typescript
updateStatus(id: string, status: SlideshowStatus): Promise<void>;
```

**Step 2: Update Drizzle slideshow repository**

All `create`, `findById`, `update` methods must include the new columns: `occasionType`, `status`, `aspectRatio`, `coverAssetId`. Map them in the entity-to-row and row-to-entity transformations.

**Step 3: Update Drizzle media repository**

Map `slideshowId` and `processingStatus` in create/find methods.

**Step 4: Commit**

```bash
git add src/infrastructure/repositories/ src/domain/slideshow/repositories/
git commit -m "feat: update repositories to handle new schema columns"
```

---

### Task 1.6: Update CreateSlideshow Command and API Route

**Why:** Creating a slideshow must now accept occasion_type, aspect_ratio from the project setup flow (PRD section 13.1).

**Files:**
- Modify: `src/application/slideshow/commands/create-slideshow.ts`
- Modify: `src/app/api/slideshows/route.ts`

**Step 1: Extend CreateSlideshowInput**

```typescript
export interface CreateSlideshowInput {
  userId: string;
  title?: string;
  description?: string;
  occasionType?: OccasionType;
  aspectRatio?: AspectRatio;
  resolution?: ResolutionKey;
  fps?: number;
  backgroundColor?: string;
}
```

Set defaults: `occasionType: "custom"`, `aspectRatio: "16:9"`, `status: "draft"`.

**Step 2: Update POST handler in `src/app/api/slideshows/route.ts`**

Pass `body.occasionType` and `body.aspectRatio` through to the command.

**Step 3: Commit**

```bash
git add src/application/slideshow/commands/create-slideshow.ts src/app/api/slideshows/route.ts
git commit -m "feat: accept occasion_type and aspect_ratio when creating slideshows"
```

---

## Phase 2: Missing Application Use Cases

### Task 2.1: Add Rename and Archive Slideshow Commands

**Why:** PRD section 17 requires RenameProject and ArchiveProject.

**Files:**
- Create: `src/application/slideshow/commands/rename-slideshow.ts`
- Create: `src/application/slideshow/commands/archive-slideshow.ts`
- Modify: `src/app/api/slideshows/[id]/route.ts`

**Step 1: Create rename command**

```typescript
// src/application/slideshow/commands/rename-slideshow.ts
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export class RenameSlideshowCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideshowId: string, title: string): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");
    if (!title.trim()) throw new Error("Title cannot be empty");
    await this.slideshowRepo.update(slideshowId, { title: title.trim(), updatedAt: new Date() });
  }
}
```

**Step 2: Create archive command**

```typescript
// src/application/slideshow/commands/archive-slideshow.ts
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export class ArchiveSlideshowCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideshowId: string): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");
    await this.slideshowRepo.delete(slideshowId);
  }
}
```

**Step 3: Wire into the existing PATCH/DELETE handler in `src/app/api/slideshows/[id]/route.ts`**

**Step 4: Commit**

```bash
git add src/application/slideshow/commands/rename-slideshow.ts \
  src/application/slideshow/commands/archive-slideshow.ts \
  src/app/api/slideshows/\[id\]/route.ts
git commit -m "feat: add rename and archive slideshow commands"
```

---

### Task 2.2: Add Text Block Use Cases

**Why:** PRD section 17 requires AddTextBlock, UpdateTextBlock, RemoveTextBlock. Currently text is managed only client-side via canvas objects — no dedicated application-layer orchestration.

**Files:**
- Create: `src/application/slideshow/commands/add-text-block.ts`
- Create: `src/application/slideshow/commands/update-text-block.ts`
- Create: `src/application/slideshow/commands/remove-text-block.ts`
- Modify: `src/app/api/slideshows/[id]/slides/[slideId]/objects/route.ts`

**Step 1: Create AddTextBlockCommand**

```typescript
// src/application/slideshow/commands/add-text-block.ts
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { CanvasObject, TextProperties } from "@/domain/slideshow/entities/canvas-object";
import { nanoid } from "nanoid";

export interface AddTextBlockInput {
  slideId: string;
  text: string;
  preset?: "heading" | "subheading" | "body" | "caption" | "date" | "closing";
  x?: number;
  y?: number;
}

const PRESET_STYLES: Record<string, Partial<TextProperties>> = {
  heading: { fontSize: 64, fontWeight: "bold", textAlign: "center" },
  subheading: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
  body: { fontSize: 24, fontWeight: "normal", textAlign: "left" },
  caption: { fontSize: 18, fontWeight: "normal", textAlign: "center" },
  date: { fontSize: 20, fontWeight: "normal", textAlign: "center" },
  closing: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
};

export class AddTextBlockCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: AddTextBlockInput): Promise<CanvasObject> {
    const style = PRESET_STYLES[input.preset ?? "body"] ?? PRESET_STYLES.body;
    const now = new Date();
    const obj: CanvasObject = {
      id: nanoid(),
      slideId: input.slideId,
      type: "text",
      x: input.x ?? 100,
      y: input.y ?? 100,
      width: 400,
      height: 60,
      rotation: 0,
      opacity: 100,
      zIndex: 10,
      groupId: null,
      sourceAssetId: null,
      animation: null,
      properties: {
        type: "text",
        text: input.text,
        fontFamily: "Plus Jakarta Sans",
        fontSize: style.fontSize ?? 24,
        fontWeight: style.fontWeight ?? "normal",
        fontColor: "#ffffff",
        textAlign: style.textAlign ?? "left",
        backgroundColor: "transparent",
      },
      createdAt: now,
      updatedAt: now,
    };

    await this.slideshowRepo.upsertCanvasObjects(input.slideId, [obj]);
    return obj;
  }
}
```

**Step 2: Create UpdateTextBlockCommand and RemoveTextBlockCommand similarly**

UpdateTextBlock takes `objectId`, `slideId`, and partial text properties, then calls `upsertCanvasObjects`.
RemoveTextBlock takes `objectId`, `slideId`, filters out the object, and calls `upsertCanvasObjects`.

**Step 3: Commit**

```bash
git add src/application/slideshow/commands/add-text-block.ts \
  src/application/slideshow/commands/update-text-block.ts \
  src/application/slideshow/commands/remove-text-block.ts
git commit -m "feat: add text block CRUD use cases (PRD 10.7)"
```

---

### Task 2.3: Add Audio Use Cases

**Why:** PRD section 17 requires AddAudioTrack, TrimAudioTrack, UpdateAudioVolume, FitSlidesToAudio. All 4 are missing from the application layer.

**Files:**
- Create: `src/application/slideshow/commands/add-audio-track.ts`
- Create: `src/application/slideshow/commands/trim-audio-track.ts`
- Create: `src/application/slideshow/commands/update-audio-volume.ts`
- Create: `src/application/slideshow/commands/fit-slides-to-audio.ts`
- Create: `src/app/api/slideshows/[id]/audio/route.ts` (if not already handling POST)

**Step 1: Create AddAudioTrackCommand**

```typescript
// src/application/slideshow/commands/add-audio-track.ts
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { AudioTrack } from "@/domain/slideshow/entities/audio-track";
import { nanoid } from "nanoid";

export interface AddAudioTrackInput {
  slideshowId: string;
  mediaAssetId: string;
  endFrame: number;
  volume?: number;
}

export class AddAudioTrackCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: AddAudioTrackInput): Promise<AudioTrack> {
    const slideshow = await this.slideshowRepo.findById(input.slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");

    const trackIndex = slideshow.audioTracks.length;

    const track: AudioTrack = {
      id: nanoid(),
      slideshowId: input.slideshowId,
      mediaAssetId: input.mediaAssetId,
      trackIndex,
      startFrame: 0,
      endFrame: input.endFrame,
      trimStartFrame: 0,
      trimEndFrame: null,
      volume: input.volume ?? 100,
      fadeInFrames: 0,
      fadeOutFrames: 0,
      createdAt: new Date(),
    };

    return this.slideshowRepo.addAudioTrack(track);
  }
}
```

**Step 2: Create TrimAudioTrackCommand**

Takes `trackId`, `trimStartFrame`, `trimEndFrame`. Validates `trimStartFrame < trimEndFrame`. Calls `updateAudioTrack`.

**Step 3: Create UpdateAudioVolumeCommand**

Takes `trackId`, `volume` (0-100). Validates range. Calls `updateAudioTrack`.

**Step 4: Create FitSlidesToAudioCommand**

This is the PRD "smart helper" (section 10.9). Logic:
1. Get total audio duration in frames
2. Get slide count
3. Distribute equal duration across all slides: `Math.floor(totalAudioFrames / slideCount)`
4. Assign remainder frames to last slide
5. Update all slides

**Step 5: Commit**

```bash
git add src/application/slideshow/commands/add-audio-track.ts \
  src/application/slideshow/commands/trim-audio-track.ts \
  src/application/slideshow/commands/update-audio-volume.ts \
  src/application/slideshow/commands/fit-slides-to-audio.ts
git commit -m "feat: add audio track use cases (PRD 10.9)"
```

---

### Task 2.4: Add Bulk Editing Use Cases

**Why:** PRD section 10.13 calls bulk editing "a key product differentiator." BulkApplyTransition and BulkApplyEffect are completely absent.

**Files:**
- Create: `src/application/slideshow/commands/bulk-apply-transition.ts`
- Create: `src/application/slideshow/commands/bulk-apply-effect.ts`
- Create: `src/application/slideshow/commands/bulk-set-duration.ts`
- Create: `src/app/api/slideshows/[id]/bulk/route.ts`

**Step 1: Create BulkApplyTransitionCommand**

```typescript
// src/application/slideshow/commands/bulk-apply-transition.ts
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { TransitionType } from "@/domain/slideshow/value-objects/transition-type";
import { nanoid } from "nanoid";

export interface BulkApplyTransitionInput {
  slideshowId: string;
  slideIds: string[];  // Slides to apply transitions BETWEEN
  transitionType: TransitionType;
  durationFrames?: number;
  easing?: string;
}

export class BulkApplyTransitionCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: BulkApplyTransitionInput): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(input.slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");

    const sortedSlides = slideshow.slides
      .filter(s => input.slideIds.includes(s.id))
      .sort((a, b) => a.order - b.order);

    // Create transitions between consecutive selected slides
    for (let i = 0; i < sortedSlides.length - 1; i++) {
      await this.slideshowRepo.setTransition({
        id: nanoid(),
        slideshowId: input.slideshowId,
        fromSlideId: sortedSlides[i].id,
        toSlideId: sortedSlides[i + 1].id,
        type: input.transitionType,
        durationFrames: input.durationFrames ?? 30,
        easing: input.easing ?? "ease-in-out",
        createdAt: new Date(),
      });
    }
  }
}
```

**Step 2: Create BulkApplyEffectCommand**

Takes `slideshowId`, `slideIds`, and `SlideEffects` partial. Iterates and calls `updateSlide` for each with merged effects.

**Step 3: Create BulkSetDurationCommand**

Takes `slideshowId`, `slideIds`, `durationFrames`. Updates each slide's duration.

**Step 4: Create bulk API route**

```typescript
// src/app/api/slideshows/[id]/bulk/route.ts
// POST with body: { action: "transition" | "effect" | "duration", ... }
```

**Step 5: Commit**

```bash
git add src/application/slideshow/commands/bulk-apply-transition.ts \
  src/application/slideshow/commands/bulk-apply-effect.ts \
  src/application/slideshow/commands/bulk-set-duration.ts \
  src/app/api/slideshows/\[id\]/bulk/route.ts
git commit -m "feat: add bulk editing use cases — transitions, effects, duration (PRD 10.13)"
```

---

### Task 2.5: Add UpdateSlideDuration and RetryExport Commands

**Why:** Two more missing PRD use cases.

**Files:**
- Create: `src/application/slideshow/commands/update-slide-duration.ts`
- Create: `src/application/export/commands/retry-export.ts`

**Step 1: Create UpdateSlideDurationCommand**

```typescript
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export class UpdateSlideDurationCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideId: string, durationFrames: number): Promise<void> {
    if (durationFrames < 1) throw new Error("Duration must be at least 1 frame");
    await this.slideshowRepo.updateSlide(slideId, { durationFrames });
  }
}
```

**Step 2: Create RetryExportCommand**

Creates a new export job from a failed one, copying format/resolution but resetting status to "queued".

**Step 3: Commit**

```bash
git add src/application/slideshow/commands/update-slide-duration.ts \
  src/application/export/commands/retry-export.ts
git commit -m "feat: add update-slide-duration and retry-export commands"
```

---

## Phase 3: Input Validation

### Task 3.1: Add Zod Validation Schemas

**Why:** Currently zero input validation exists at the application boundary. Any garbage data passes through to the database.

**Files:**
- Create: `src/application/shared/validation.ts`
- Modify: `src/app/api/slideshows/route.ts`
- Modify: `src/app/api/slideshows/[id]/route.ts`
- Modify: `src/app/api/media/upload/route.ts`

**Step 1: Install zod (if not already present)**

```bash
bun add zod
```

**Step 2: Create shared validation schemas**

```typescript
// src/application/shared/validation.ts
import { z } from "zod";

export const createSlideshowSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  occasionType: z.enum([
    "birthday", "wedding", "anniversary", "memorial", "graduation",
    "baby_shower", "family_recap", "holiday", "presentation", "custom"
  ]).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "4:3", "1:1"]).optional(),
  resolution: z.enum(["720p", "1080p"]).optional(),
  fps: z.number().int().min(1).max(60).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const updateSlideshowSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  occasionType: z.enum([
    "birthday", "wedding", "anniversary", "memorial", "graduation",
    "baby_shower", "family_recap", "holiday", "presentation", "custom"
  ]).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "4:3", "1:1"]).optional(),
  resolution: z.enum(["720p", "1080p"]).optional(),
  fps: z.number().int().min(1).max(60).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const bulkOperationSchema = z.object({
  action: z.enum(["transition", "effect", "duration"]),
  slideIds: z.array(z.string()).min(1),
  transitionType: z.enum(["none", "fade", "slide", "zoom", "dissolve", "wipe"]).optional(),
  durationFrames: z.number().int().min(1).max(9000).optional(),
  easing: z.string().optional(),
  effects: z.record(z.unknown()).optional(),
});

export const uploadMediaSchema = z.object({
  fileName: z.string().min(1).max(500),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  type: z.enum(["image", "audio"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationMs: z.number().int().positive().optional(),
  folderId: z.string().nullable().optional(),
});

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(", ")}`);
  }
  return result.data;
}
```

**Step 3: Apply validation in API routes**

In `src/app/api/slideshows/route.ts` POST handler:
```typescript
const body = createSlideshowSchema.parse(await request.json());
```

In `src/app/api/slideshows/[id]/route.ts` PATCH handler:
```typescript
const body = updateSlideshowSchema.parse(await request.json());
```

**Step 4: Commit**

```bash
git add src/application/shared/validation.ts src/app/api/
git commit -m "feat: add zod input validation at API boundary"
```

---

## Phase 4: Domain Strengthening

### Task 4.1: Add ExportJob State Machine

**Why:** Currently export status can transition to any state. PRD section 10.11 implies a strict lifecycle: queued → processing → completed/failed.

**Files:**
- Modify: `src/domain/export/entities/export-job.ts`

**Step 1: Add state transition validation**

```typescript
// Add to export-job.ts
const VALID_TRANSITIONS: Record<ExportStatus, ExportStatus[]> = {
  queued: ["processing", "failed"],    // failed = cancelled
  processing: ["completed", "failed"],
  completed: [],                        // terminal
  failed: ["queued"],                   // retry creates new job in queued state
};

export function canTransition(from: ExportStatus, to: ExportStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateTransition(from: ExportStatus, to: ExportStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid export status transition: ${from} → ${to}`);
  }
}
```

**Step 2: Use in CancelExportCommand and QueueExportCommand**

Replace the manual `if` checks with `validateTransition()`.

**Step 3: Commit**

```bash
git add src/domain/export/entities/export-job.ts src/application/export/commands/
git commit -m "feat: add state machine validation to ExportJob"
```

---

### Task 4.2: Add Audio Overlap Validation in Domain Service

**Why:** Multiple audio tracks can currently overlap arbitrarily with no validation.

**Files:**
- Modify: `src/domain/slideshow/services/slideshow-domain-service.ts`

**Step 1: Add audio validation functions**

```typescript
import type { AudioTrack } from "../entities/audio-track";

export function validateAudioTimeRange(track: AudioTrack): boolean {
  return track.startFrame >= 0 && track.endFrame > track.startFrame;
}

export function findOverlappingAudioTracks(tracks: AudioTrack[]): [AudioTrack, AudioTrack][] {
  const overlaps: [AudioTrack, AudioTrack][] = [];
  for (let i = 0; i < tracks.length; i++) {
    for (let j = i + 1; j < tracks.length; j++) {
      if (tracks[i].startFrame < tracks[j].endFrame && tracks[j].startFrame < tracks[i].endFrame) {
        overlaps.push([tracks[i], tracks[j]]);
      }
    }
  }
  return overlaps;
}

export function calculateSlideDurationDistribution(
  totalAudioFrames: number,
  slideCount: number
): number[] {
  if (slideCount === 0) return [];
  const base = Math.floor(totalAudioFrames / slideCount);
  const remainder = totalAudioFrames % slideCount;
  return Array.from({ length: slideCount }, (_, i) => base + (i < remainder ? 1 : 0));
}
```

**Step 2: Commit**

```bash
git add src/domain/slideshow/services/slideshow-domain-service.ts
git commit -m "feat: add audio overlap detection and duration distribution to domain service"
```

---

### Task 4.3: Add Transition Types from PRD

**Why:** PRD section 10.8 lists transitions: fade, dissolve, slide, wipe, zoom, blur, dip to black, dip to white. Current schema only has: none, fade, slide, zoom, dissolve, wipe. Missing: blur, dip-to-black, dip-to-white.

**Files:**
- Modify: `src/infrastructure/database/schema/transitions.ts`
- Modify: `src/domain/slideshow/value-objects/transition-type.ts`

**Step 1: Update enum**

```typescript
export const transitionTypeEnum = pgEnum("transition_type", [
  "none", "fade", "slide", "zoom", "dissolve", "wipe", "blur", "dip-to-black", "dip-to-white"
]);
```

Update domain value object to match.

**Step 2: Generate migration, commit**

```bash
bunx drizzle-kit generate && bunx drizzle-kit migrate
git add src/infrastructure/database/schema/transitions.ts \
  src/domain/slideshow/value-objects/transition-type.ts drizzle/
git commit -m "feat: add blur, dip-to-black, dip-to-white transition types (PRD 10.8)"
```

---

## Phase 5: Editor Store & UI Alignment

### Task 5.1: Update Editor Store Types for New Metadata

**Why:** The store and editor UI must reflect the new slideshow metadata fields.

**Files:**
- Modify: `src/presentation/stores/editor/types.ts`
- Modify: `src/presentation/stores/editor/document-slice.ts`

**Step 1: Update `updateSlideshowMeta` to include new fields**

In `types.ts`, change:
```typescript
updateSlideshowMeta: (data: Partial<Pick<Slideshow,
  "title" | "description" | "resolution" | "fps" | "backgroundColor" |
  "occasionType" | "status" | "aspectRatio" | "coverAssetId"
>>) => void;
```

**Step 2: Update document-slice.ts implementation to handle these fields**

**Step 3: Commit**

```bash
git add src/presentation/stores/editor/types.ts src/presentation/stores/editor/document-slice.ts
git commit -m "feat: update editor store to support new slideshow metadata"
```

---

### Task 5.2: Add Bulk Selection Support to Selection Slice

**Why:** PRD section 10.6 requires multi-select slides for bulk operations. Current `SelectionSlice` only tracks selected *objects*, not selected *slides*.

**Files:**
- Modify: `src/presentation/stores/editor/types.ts`
- Modify: `src/presentation/stores/editor/selection-slice.ts`

**Step 1: Add slide selection to SelectionSlice**

```typescript
export interface SelectionSlice {
  // ... existing object selection ...

  // Slide multi-select
  selectedSlideIds: string[];
  selectSlide: (slideId: string) => void;
  selectSlides: (slideIds: string[]) => void;
  addSlideToSelection: (slideId: string) => void;
  removeSlideFromSelection: (slideId: string) => void;
  selectAllSlides: () => void;
  clearSlideSelection: () => void;
}
```

**Step 2: Implement in selection-slice.ts**

```typescript
selectedSlideIds: [],
selectSlide: (slideId) => set({ selectedSlideIds: [slideId] }),
selectSlides: (slideIds) => set({ selectedSlideIds: slideIds }),
addSlideToSelection: (slideId) => set((state) => ({
  selectedSlideIds: state.selectedSlideIds.includes(slideId)
    ? state.selectedSlideIds
    : [...state.selectedSlideIds, slideId],
})),
removeSlideFromSelection: (slideId) => set((state) => ({
  selectedSlideIds: state.selectedSlideIds.filter((id) => id !== slideId),
})),
selectAllSlides: () => set((state) => ({
  selectedSlideIds: state.slideshow?.slides.map((s) => s.id) ?? [],
})),
clearSlideSelection: () => set({ selectedSlideIds: [] }),
```

**Step 3: Commit**

```bash
git add src/presentation/stores/editor/types.ts src/presentation/stores/editor/selection-slice.ts
git commit -m "feat: add multi-slide selection to editor store (PRD 10.6/10.13)"
```

---

### Task 5.3: Add Bulk Operations to Document Slice

**Why:** The store needs actions for bulk transitions, effects, and duration changes.

**Files:**
- Modify: `src/presentation/stores/editor/types.ts`
- Modify: `src/presentation/stores/editor/document-slice.ts`

**Step 1: Add bulk operations to DocumentSlice**

```typescript
// In types.ts, add to DocumentSlice:
bulkSetDuration: (slideIds: string[], durationFrames: number) => void;
bulkApplyEffect: (slideIds: string[], effects: Partial<SlideEffects>) => void;
bulkDeleteSlides: (slideIds: string[]) => void;
bulkDuplicateSlides: (slideIds: string[]) => void;
```

**Step 2: Implement in document-slice.ts**

Each bulk action iterates the targeted slides and applies the change, then calls `markDirty()` and `pushToHistory()` once (not per-slide).

**Step 3: Commit**

```bash
git add src/presentation/stores/editor/types.ts src/presentation/stores/editor/document-slice.ts
git commit -m "feat: add bulk operations to document slice (PRD 10.13)"
```

---

### Task 5.4: Add Bulk Actions UI to Slide Strip

**Why:** Users need a way to multi-select slides and trigger bulk actions.

**Files:**
- Modify: `src/presentation/components/editor/slides/slide-strip.tsx`

**Step 1: Add Shift+Click and Ctrl+Click multi-select**

When clicking a slide thumbnail:
- Normal click: `selectSlide(slideId)` + `setCurrentSlideIndex`
- Ctrl/Cmd + Click: `addSlideToSelection(slideId)`
- Shift + Click: range-select from last selected to clicked

**Step 2: Add bulk action toolbar**

When `selectedSlideIds.length > 1`, show a toolbar above the filmstrip:
- "X slides selected"
- Bulk Duration button (opens popover with duration input)
- Bulk Transition button (opens dropdown with transition types)
- Bulk Effect button (opens dropdown with effect presets)
- Bulk Delete button
- "Select All" / "Clear Selection" links

**Step 3: Visual feedback**

Add a distinct highlight ring around multi-selected slide thumbnails.

**Step 4: Commit**

```bash
git add src/presentation/components/editor/slides/slide-strip.tsx
git commit -m "feat: add multi-select and bulk actions to slide strip (PRD 10.13)"
```

---

### Task 5.5: Update Editor Top Bar with Slideshow Status and Occasion

**Why:** The top bar should show the slideshow status (draft/exporting/completed) and allow editing the occasion type and aspect ratio.

**Files:**
- Modify: `src/presentation/components/editor/top-bar/editor-top-bar.tsx`

**Step 1: Add status badge next to title**

Show a pill/badge: "Draft", "Exporting", "Completed", "Failed" with appropriate colors.

**Step 2: Add occasion type display**

Show the occasion type next to the title as a subtle label (e.g., "Memorial", "Wedding").

**Step 3: Commit**

```bash
git add src/presentation/components/editor/top-bar/editor-top-bar.tsx
git commit -m "feat: show slideshow status and occasion type in editor top bar"
```

---

### Task 5.6: Update Autosave to Persist New Fields

**Why:** The autosave hook must now also persist `occasionType`, `status`, `aspectRatio`, `coverAssetId`.

**Files:**
- Modify: `src/presentation/hooks/use-autosave.ts`

**Step 1: Include new fields in the save payload**

Ensure `persistSlideshow()` sends `occasionType`, `aspectRatio`, `coverAssetId` to the API when saving metadata.

**Step 2: Commit**

```bash
git add src/presentation/hooks/use-autosave.ts
git commit -m "feat: persist new slideshow metadata fields in autosave"
```

---

## Phase 6: Project Setup Wizard

### Task 6.1: Create Slideshow Setup Flow

**Why:** PRD section 13.1 defines: log in → "Create Project" → choose occasion → choose blank/template → choose aspect ratio → enter title → enter editor. Currently the app just creates a blank slideshow.

**Files:**
- Create: `src/presentation/components/dashboard/create-slideshow-wizard.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

**Step 1: Create multi-step wizard component**

Steps:
1. **Occasion Type** — Grid of occasion cards (Birthday, Wedding, Memorial, etc.)
2. **Template or Blank** — Show templates filtered by selected occasion, plus a "Blank" option
3. **Aspect Ratio** — 16:9 (Landscape), 9:16 (Portrait), 4:3 (Standard), 1:1 (Square) with visual previews
4. **Title** — Text input with default based on occasion (e.g., "Untitled Birthday Slideshow")

Each step is a screen within a dialog/modal. Back/Next navigation. "Create" button on final step calls the API.

**Step 2: Wire wizard into dashboard**

Replace the current "Create Slideshow" button click handler with opening the wizard modal.

**Step 3: On wizard submit**

```typescript
const response = await fetch("/api/slideshows", {
  method: "POST",
  body: JSON.stringify({
    title,
    occasionType,
    aspectRatio,
    resolution: aspectRatio === "16:9" ? "1080p" : "1080p", // can be mapped
  }),
});
const slideshow = await response.json();
router.push(`/editor/${slideshow.id}`);
```

**Step 4: Commit**

```bash
git add src/presentation/components/dashboard/create-slideshow-wizard.tsx src/app/\(app\)/dashboard/page.tsx
git commit -m "feat: add project setup wizard — occasion, template, aspect ratio, title (PRD 13.1)"
```

---

## Phase 7: Remaining UI Features

### Task 7.1: Add Audio Track to Timeline View

**Why:** PRD section 10.6 explicitly requires the timeline to show both a slide track and an audio track. Currently the timeline only shows slides.

**Files:**
- Modify: `src/presentation/components/editor/timeline/timeline-container.tsx` (or wherever the timeline is)

**Step 1: Add audio track lane below the slide track**

Render a horizontal audio track visualization that shows:
- Audio waveform (reuse existing waveform-utils.ts)
- Track start/end positions aligned to the timeline ruler
- Volume indicator
- Track name

**Step 2: Allow drag to reposition audio start time**

**Step 3: Commit**

```bash
git add src/presentation/components/editor/timeline/
git commit -m "feat: add audio track visualization to timeline (PRD 10.6)"
```

---

### Task 7.2: Add Text Presets Panel

**Why:** PRD section 10.7 specifies text types: title, subtitle, caption, date/location, closing message. The current text tool panel only has Heading/Subheading/Body.

**Files:**
- Modify: `src/presentation/components/editor/text/text-tool-panel.tsx`

**Step 1: Add PRD text presets**

```typescript
const TEXT_PRESETS = [
  { label: "Title", preset: "heading", icon: Type, defaultText: "Title" },
  { label: "Subtitle", preset: "subheading", icon: Type, defaultText: "Subtitle" },
  { label: "Caption", preset: "caption", icon: MessageSquare, defaultText: "Caption text" },
  { label: "Date / Location", preset: "date", icon: Calendar, defaultText: "January 1, 2026" },
  { label: "Closing Message", preset: "closing", icon: Heart, defaultText: "Thank you" },
  { label: "Body Text", preset: "body", icon: AlignLeft, defaultText: "Body text" },
];
```

Each preset creates a canvas object with appropriate font size, weight, alignment, and position.

**Step 2: Commit**

```bash
git add src/presentation/components/editor/text/text-tool-panel.tsx
git commit -m "feat: add text presets — title, subtitle, caption, date, closing (PRD 10.7)"
```

---

### Task 7.3: Add Intro/Outro Slide Support

**Why:** PRD section 10.14 requires easy creation of title slides, event/date slides, message slides, and closing slides.

**Files:**
- Create: `src/presentation/components/editor/slides/intro-outro-templates.ts`
- Modify: `src/presentation/components/editor/slides/slide-strip.tsx`

**Step 1: Define intro/outro templates**

```typescript
export const INTRO_OUTRO_TEMPLATES = [
  {
    id: "title-slide",
    label: "Title Slide",
    category: "intro",
    objects: [
      { type: "text", preset: "heading", text: "Your Title Here", x: 640, y: 300 },
      { type: "text", preset: "subheading", text: "Subtitle", x: 640, y: 400 },
    ],
    background: { kind: "solid", color: "#1a1a2e" },
  },
  {
    id: "date-slide",
    label: "Event / Date",
    category: "intro",
    objects: [
      { type: "text", preset: "date", text: "March 27, 2026", x: 640, y: 360 },
    ],
    background: { kind: "solid", color: "#16213e" },
  },
  {
    id: "thank-you",
    label: "Thank You",
    category: "outro",
    objects: [
      { type: "text", preset: "closing", text: "Thank You", x: 640, y: 320 },
      { type: "text", preset: "caption", text: "With love and gratitude", x: 640, y: 400 },
    ],
    background: { kind: "solid", color: "#1a1a2e" },
  },
  {
    id: "dedication",
    label: "Dedication",
    category: "outro",
    objects: [
      { type: "text", preset: "closing", text: "In Loving Memory", x: 640, y: 320 },
      { type: "text", preset: "body", text: "1950 - 2026", x: 640, y: 400 },
    ],
    background: { kind: "solid", color: "#0f0f23" },
  },
];
```

**Step 2: Add "Add Intro" / "Add Outro" buttons to slide strip**

Place at the beginning and end of the filmstrip respectively. Clicking opens a small picker with the templates above.

**Step 3: Commit**

```bash
git add src/presentation/components/editor/slides/intro-outro-templates.ts \
  src/presentation/components/editor/slides/slide-strip.tsx
git commit -m "feat: add intro/outro slide templates (PRD 10.14)"
```

---

### Task 7.4: Add Empty States and Onboarding Hints

**Why:** PRD section 10.15 requires guided first-use hints, empty editor messaging, upload guidance, timeline tips.

**Files:**
- Create: `src/presentation/components/editor/onboarding/empty-state.tsx`
- Modify: `src/presentation/components/editor/canvas/fabric-canvas.tsx`
- Modify: `src/presentation/components/editor/slides/slide-strip.tsx`
- Modify: `src/presentation/components/editor/workspace/left-rail.tsx`

**Step 1: Create empty state component**

Show when slideshow has 0 media or only the initial blank slide:
- "Drag photos here or click Upload to get started"
- Arrow/icon pointing to the media panel
- Quick-start tips

**Step 2: Add empty canvas state**

When current slide has no objects, show a centered prompt:
- "Add text, images, or shapes from the panels"

**Step 3: Add filmstrip empty state**

When only 1 default slide exists:
- "Upload photos to create slides, or add slides manually"

**Step 4: Commit**

```bash
git add src/presentation/components/editor/onboarding/ \
  src/presentation/components/editor/canvas/fabric-canvas.tsx \
  src/presentation/components/editor/slides/slide-strip.tsx
git commit -m "feat: add empty states and onboarding hints (PRD 10.15)"
```

---

## Phase 8: Dashboard & Project Lifecycle

### Task 8.1: Update Dashboard to Show Slideshow Metadata

**Why:** Dashboard should display occasion type, status, and aspect ratio on slideshow cards.

**Files:**
- Modify: `src/presentation/components/dashboard/slideshow-card.tsx`
- Modify: `src/presentation/components/dashboard/slideshow-grid.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

**Step 1: Update slideshow card**

Show:
- Occasion type badge (e.g., "Memorial", "Birthday")
- Status indicator (Draft, Completed, etc.)
- Aspect ratio icon

**Step 2: Add filter/sort options to dashboard**

Filter by: occasion type, status. Sort by: updated_at, created_at, title.

**Step 3: Commit**

```bash
git add src/presentation/components/dashboard/ src/app/\(app\)/dashboard/page.tsx
git commit -m "feat: show occasion, status, aspect ratio on dashboard cards; add filters"
```

---

### Task 8.2: Add Delete Asset Safety Check

**Why:** `DeleteMediaCommand` doesn't check if the asset is referenced by slides before deleting. This can leave orphaned references.

**Files:**
- Modify: `src/application/media/commands/delete-media.ts`
- Modify: `src/domain/media/repositories/media-asset-repository.interface.ts`

**Step 1: Add `isAssetInUse` method to repository interface**

```typescript
isAssetInUse(assetId: string): Promise<boolean>;
```

**Step 2: Implement check in Drizzle repository**

Query `canvas_objects` WHERE `properties->>'src'` matches asset URL, or `audio_tracks` WHERE `media_asset_id = assetId`.

**Step 3: Use in DeleteMediaCommand**

```typescript
const inUse = await this.mediaRepo.isAssetInUse(assetId);
if (inUse) throw new Error("Cannot delete asset that is in use by a slideshow");
```

**Step 4: Commit**

```bash
git add src/application/media/commands/delete-media.ts \
  src/domain/media/repositories/media-asset-repository.interface.ts \
  src/infrastructure/repositories/drizzle-media-repository.ts
git commit -m "feat: prevent deletion of in-use media assets"
```

---

## Phase 9: Align Existing Features with PRD

These tasks ensure the features you want to keep (admin panel, media folders, etc.) are properly integrated with the new metadata.

### Task 9.1: Connect Admin Templates to Occasion Types

**Why:** Templates should be filterable by the new `occasionType` field, not just the generic `category`.

**Files:**
- Modify: `src/infrastructure/database/schema/templates.ts`
- Modify: `src/application/admin/commands/create-template.ts`
- Modify: `src/application/admin/queries/get-templates.ts`
- Modify: `src/presentation/components/templates/template-gallery.tsx`

**Step 1: Align template `category` enum with slideshow `occasion_type` enum**

Either:
- Add an `occasionType` column to templates that uses the same enum, OR
- Update the existing `category` enum values to match the occasion types

Recommended: Add `occasionType` column alongside `category` (category = template style, occasionType = what occasion it's designed for).

**Step 2: Filter templates by occasion type in the setup wizard**

When user selects "Memorial" occasion, only show memorial templates.

**Step 3: Commit**

```bash
git add src/infrastructure/database/schema/templates.ts \
  src/application/admin/ src/presentation/components/templates/ drizzle/
git commit -m "feat: connect templates to occasion types for filtered selection"
```

---

### Task 9.2: Connect Slide Layouts to Aspect Ratio

**Why:** The existing slide layouts system should respect the slideshow's aspect ratio.

**Files:**
- Modify: `src/presentation/components/editor/workspace/slide-layouts.ts`

**Step 1: Add aspect ratio awareness to layout definitions**

Each layout should specify which aspect ratios it supports, or auto-scale based on the current slideshow's aspect ratio.

**Step 2: Filter layouts panel to only show layouts compatible with current aspect ratio**

**Step 3: Commit**

```bash
git add src/presentation/components/editor/workspace/slide-layouts.ts
git commit -m "feat: filter slide layouts by slideshow aspect ratio"
```

---

### Task 9.3: Update Admin Analytics to Track Occasion Types

**Why:** PRD section 20 lists "project creation rate" as a success metric. With occasion types, analytics should show creation by occasion.

**Files:**
- Modify: `src/app/api/admin/analytics/route.ts`
- Modify: `src/app/(admin)/admin/analytics/page.tsx`

**Step 1: Add occasion type distribution query**

```sql
SELECT occasion_type, COUNT(*) as count
FROM slideshows
GROUP BY occasion_type
ORDER BY count DESC
```

**Step 2: Display in admin analytics dashboard as a bar chart or table**

**Step 3: Commit**

```bash
git add src/app/api/admin/analytics/ src/app/\(admin\)/admin/analytics/
git commit -m "feat: add occasion type distribution to admin analytics"
```

---

## Phase Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| **1. Schema & Domain Foundation** | 1.1–1.6 | Add missing PRD metadata columns, update entities, repos, API |
| **2. Missing Use Cases** | 2.1–2.5 | Text blocks, audio, bulk editing, rename/archive, duration, retry export |
| **3. Input Validation** | 3.1 | Zod schemas at API boundary |
| **4. Domain Strengthening** | 4.1–4.3 | ExportJob state machine, audio overlap validation, missing transition types |
| **5. Editor Store & UI** | 5.1–5.6 | Store types, multi-slide selection, bulk UI, top bar metadata, autosave |
| **6. Project Setup Wizard** | 6.1 | Multi-step creation flow (occasion → template → aspect ratio → title) |
| **7. Remaining UI Features** | 7.1–7.4 | Audio in timeline, text presets, intro/outro slides, empty states |
| **8. Dashboard & Lifecycle** | 8.1–8.2 | Dashboard metadata display, delete safety |
| **9. Align Existing Features** | 9.1–9.3 | Templates ↔ occasions, layouts ↔ aspect ratio, admin analytics |

**Total: 24 tasks across 9 phases**

---

## Dependency Graph

```
Phase 1 (Schema)
  └─→ Phase 2 (Use Cases) — depends on new columns
  └─→ Phase 3 (Validation) — can run parallel with Phase 2
  └─→ Phase 4 (Domain) — can run parallel with Phase 2

Phase 2 + Phase 5 (Store) — store needs use case alignment
  └─→ Phase 6 (Wizard) — needs store + API ready
  └─→ Phase 7 (UI) — needs store + use cases

Phase 1 → Phase 8 (Dashboard) — needs new metadata
Phase 1 → Phase 9 (Feature Alignment) — needs new enums
```

**Critical path:** Phase 1 → Phase 2 → Phase 5 → Phase 6/7 (in parallel)
