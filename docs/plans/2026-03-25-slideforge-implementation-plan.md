# SlideForge - Implementation Plan

## Context

Build a modern slideshow maker web app where users upload images, compose slideshows with a canvas editor, timeline, audio, transitions, and text — then export in multiple video formats. The system needs user and admin dashboards, pre-built templates for occasions (parties, funerals, weddings, etc.), and must follow Domain-Driven Design with Clean Architecture.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Package Manager | Bun |
| Database | Neon (Serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | Neon Auth (Better Auth under the hood) |
| Storage | Cloudflare R2 (S3-compatible) |
| Render Engine | Remotion (programmatic video, transitions, export) |
| Canvas Editor | Fabric.js (drag-and-drop object editing) |
| State Management | Zustand |
| Styling | Tailwind CSS + shadcn/ui |
| Export Formats | MP4 (H.264), WebM (VP9), GIF, ProRes |

---

## 1. DDD Domain Model

### Bounded Contexts

| Bounded Context | Responsibility |
|---|---|
| **Identity & Access** | Authentication, authorization, user profiles, roles |
| **Media Management** | Upload, storage (R2), retrieval, organization of images/audio |
| **Slideshow Authoring** | Core creative domain: slides, canvas objects, timeline, transitions, text, audio |
| **Export & Rendering** | Render queue, Remotion composition assembly, format conversion |
| **Platform Administration** | Templates, feature flags, quotas, analytics, system health |

### Key Aggregates

**Slideshow Authoring** (richest domain):
- **Aggregate Root: `Slideshow`** — contains `Slide[]`, `Transition[]`, `AudioTrack[]`
  - `Slide` contains `CanvasObject[]` (polymorphic: image, text, shape)
  - Value Objects: `Position`, `Resolution`, `SlideDuration`, `TransitionType`, `TextStyle`, `AudioTimeRange`

**Media Management**:
- **Aggregate Root: `MediaAsset`** — VOs: `StorageKey`, `MediaType`, `FileDimensions`, `MimeType`

**Export & Rendering**:
- **Aggregate Root: `ExportJob`** — VOs: `ExportFormat`, `ExportStatus`, `RenderProgress`

**Platform Administration**:
- **Aggregate Root: `Template`** — contains embedded slideshow snapshot as JSON, categorized by occasion

### Domain Events
`MediaAssetUploaded`, `SlideshowCreated`, `SlideshowUpdated`, `SlideAdded/Removed/Reordered`, `TransitionApplied`, `ExportJobQueued/Completed/Failed`, `TemplatePublished`

---

## 2. Project Structure (DDD + Clean Architecture)

```
slideforge/
├── src/
│   ├── domain/                          # Pure logic, zero external deps
│   │   ├── media/
│   │   │   ├── entities/media-asset.ts, media-folder.ts
│   │   │   ├── value-objects/storage-key.ts, media-type.ts, file-dimensions.ts
│   │   │   ├── repositories/media-asset-repository.interface.ts
│   │   │   └── events/media-events.ts
│   │   ├── slideshow/
│   │   │   ├── entities/slideshow.ts, slide.ts, canvas-object.ts, transition.ts, audio-track.ts
│   │   │   ├── value-objects/position.ts, resolution.ts, slide-duration.ts, transition-type.ts, text-style.ts, audio-time-range.ts
│   │   │   ├── repositories/slideshow-repository.interface.ts
│   │   │   ├── services/slideshow-domain-service.ts
│   │   │   └── events/slideshow-events.ts
│   │   ├── export/
│   │   │   ├── entities/export-job.ts
│   │   │   ├── value-objects/export-format.ts, export-status.ts
│   │   │   └── repositories/export-job-repository.interface.ts
│   │   ├── identity/
│   │   │   ├── entities/user-profile.ts
│   │   │   ├── value-objects/user-role.ts
│   │   │   └── repositories/user-repository.interface.ts
│   │   └── admin/
│   │       ├── entities/template.ts, feature-flag.ts, storage-quota.ts
│   │       ├── value-objects/template-category.ts
│   │       └── repositories/template-repository.interface.ts
│   │
│   ├── application/                     # Use cases / orchestration
│   │   ├── media/commands/ (upload-media, delete-media, create-folder)
│   │   ├── media/queries/ (get-media-library, get-presigned-upload-url)
│   │   ├── slideshow/commands/ (create-slideshow, add-slide, remove-slide, reorder-slides, update-canvas-objects, set-transition, add-audio-track, duplicate-slideshow)
│   │   ├── slideshow/queries/ (get-slideshow, list-user-slideshows, get-slideshow-composition)
│   │   ├── export/commands/ (queue-export, cancel-export)
│   │   ├── export/queries/ (get-export-status, list-user-exports)
│   │   ├── identity/commands/ (update-profile)
│   │   ├── identity/queries/ (get-user-profile)
│   │   └── admin/commands/ (create-template, manage-user, toggle-feature-flag, set-storage-quota)
│   │
│   ├── infrastructure/                  # Concrete implementations
│   │   ├── database/
│   │   │   ├── client.ts                (Drizzle + Neon connection)
│   │   │   ├── schema/                  (users, media-assets, slideshows, slides, canvas-objects, transitions, audio-tracks, export-jobs, templates, feature-flags, relations)
│   │   │   └── migrations/
│   │   ├── repositories/               (drizzle-*-repository.ts for each domain)
│   │   ├── storage/r2-client.ts, r2-storage-service.ts
│   │   ├── auth/auth.ts, auth-client.ts, middleware.ts
│   │   ├── rendering/remotion-render-service.ts, composition-builder.ts
│   │   └── di/container.ts
│   │
│   ├── presentation/                    # UI layer
│   │   ├── components/
│   │   │   ├── ui/                      (shadcn/ui)
│   │   │   ├── layout/                  (app-shell, sidebar, top-bar)
│   │   │   ├── editor/                  (THE CORE — see Editor Layout below)
│   │   │   │   ├── canvas/             (fabric-canvas, canvas-toolbar, object-properties-panel)
│   │   │   │   ├── timeline/           (timeline-container, timeline-track, playhead, controls)
│   │   │   │   ├── preview/            (remotion-preview, preview-controls)
│   │   │   │   ├── effects/            (effects-panel, transition-card, transition-preview)
│   │   │   │   ├── text/               (text-tool-panel, font-picker)
│   │   │   │   ├── audio/              (audio-panel, audio-waveform)
│   │   │   │   ├── media-sidebar/      (media-browser, media-upload-zone)
│   │   │   │   └── slides/             (slide-strip, slide-thumbnail)
│   │   │   ├── export/                 (export-dialog, export-progress)
│   │   │   ├── dashboard/              (slideshow-grid, slideshow-card, media-library)
│   │   │   ├── templates/              (template-gallery, template-card)
│   │   │   ├── admin/                  (user-management, template-management, analytics, feature-flags, system-health)
│   │   │   └── auth/                   (login-form, register-form)
│   │   ├── hooks/                      (use-fabric-canvas, use-slideshow, use-timeline-sync, use-media-upload, use-export, use-auth, use-autosave)
│   │   └── stores/                     (editor-store.ts, slideshow-store.ts — Zustand)
│   │
│   ├── remotion/                        # Remotion compositions
│   │   ├── Root.tsx
│   │   ├── compositions/slideshow-composition.tsx
│   │   ├── sequences/slide-sequence.tsx, text-sequence.tsx, image-sequence.tsx
│   │   ├── transitions/fade, slide, zoom, dissolve, wipe
│   │   └── audio/audio-layer.tsx
│   │
│   └── app/                             # Next.js App Router
│       ├── (auth)/login, register
│       ├── (app)/dashboard, media, templates, slideshows, editor/[id], exports, settings
│       ├── (admin)/admin/users, templates, analytics, feature-flags, system
│       └── api/auth, media, slideshows, exports, templates, admin
│
└── render-worker/                       # Separate process for Remotion rendering
    ├── index.ts
    └── package.json
```

---

## 3. Database Schema (Drizzle ORM)

Auth tables (`user`, `session`, `account`, `verification`) live in `neon_auth` schema managed by Better Auth — we reference user IDs from them.

**Core tables:**
- `user_profiles` — extends Better Auth user (displayName, avatarUrl, role, storageUsedBytes, storageQuotaBytes)
- `media_assets` — type (image|audio), fileName, mimeType, sizeBytes, storageKey, width/height, durationMs
- `media_folders` — organizational grouping
- `slideshows` — title, resolution (720p|1080p), fps, backgroundColor
- `slides` — slideshowId (FK cascade), order, durationFrames, backgroundColor
- `canvas_objects` — slideId (FK cascade), type (image|text|shape), x, y, width, height, rotation, opacity, zIndex, `properties` (JSONB for type-specific data)
- `transitions` — fromSlideId, toSlideId, type (none|fade|slide|zoom|dissolve|wipe), durationFrames, easing
- `audio_tracks` — slideshowId, mediaAssetId, trackIndex, startFrame, endFrame, volume, fadeIn/fadeOut
- `export_jobs` — slideshowId, format (mp4|webm|gif|prores), resolution, status (queued|processing|completed|failed), progress, outputStorageKey
- `templates` — name, category (party|funeral|wedding|birthday|corporate|other), slideshowData (JSONB), isPublished
- `feature_flags` — key, enabled, description

---

## 4. Editor Layout

```
+-------------------------------------------------------------------+
|  Top Bar: [Back] [Title] [Undo/Redo] [Settings] [Export]          |
+--------+------------------------------------------+--------------+
| Media  |         Remotion Player (Preview)        | Properties   |
| Side-  |         / Fabric.js Canvas (Edit)        | Panel        |
| bar    |                                          | (context-    |
| [Imgs] |         (toggle edit/preview mode)       |  sensitive)  |
| [Audio]|                                          |              |
| [Text] |                                          |              |
+--------+------------------------------------------+--------------+
|  Slide Filmstrip: [S1] [T] [S2] [T] [S3] ... [+ Add]            |
+-------------------------------------------------------------------+
|  Timeline: Track 1 (visuals)  |====|====|====|                    |
|            Track 2 (audio)    |============================|      |
|            [Play] [00:15/01:30] [Zoom +/-]                        |
+-------------------------------------------------------------------+
```

**Dual-mode**: Edit Mode (Fabric.js active) / Preview Mode (Remotion Player active)

**State flow**: Fabric.js events -> `use-fabric-canvas` -> `slideshow-store` (Zustand, source of truth) -> `use-autosave` -> API. In preview mode, Remotion reads from the store via inputProps.

---

## 5. Export Pipeline

1. User clicks Export -> `ExportDialog` (format + resolution)
2. `POST /api/exports` -> creates `ExportJob` (status: queued)
3. **Render Worker** (separate process) polls DB for queued jobs
4. Worker calls `GetSlideshowComposition` -> `CompositionBuilder` -> Remotion `renderMedia()`
5. Remotion renders via `TransitionSeries` + `<Audio>` components
6. Worker uploads result to R2, updates job to "completed"
7. Frontend polls `GET /api/exports/[id]` for progress -> shows download button on completion

**Formats**: MP4 (h264), WebM (vp9), GIF, ProRes | **Resolutions**: 720p (1280x720), 1080p (1920x1080)

---

## 6. API Routes

```
POST   /api/auth/[...all]                 Better Auth catch-all
GET    /api/media/presign                  Presigned upload URL
POST   /api/media                          Confirm upload
GET    /api/media                          List assets
DELETE /api/media                          Delete asset
POST   /api/slideshows                     Create slideshow
GET    /api/slideshows                     List user slideshows
GET/PUT/DELETE /api/slideshows/[id]        CRUD slideshow
POST/PUT /api/slideshows/[id]/slides       Add/reorder slides
PUT    /api/slideshows/[id]/slides/[slideId]/objects   Bulk upsert canvas objects
PUT    /api/slideshows/[id]/transitions    Set transition
POST/DELETE /api/slideshows/[id]/audio     Audio tracks
GET    /api/slideshows/[id]/composition    Remotion input props
POST   /api/exports                        Queue export
GET    /api/exports/[id]                   Status + progress
GET    /api/exports/[id]/download          Presigned download URL
GET    /api/templates                      Public templates
# Admin (role-guarded)
GET/PUT /api/admin/users                   User management
CRUD   /api/admin/templates                Template management
GET/PUT /api/admin/feature-flags           Feature flags
GET    /api/admin/analytics                Aggregate stats
GET    /api/admin/system                   Health checks
```

---

## 7. Implementation Phases

### Phase 1: Foundation (scaffold, auth, DB, navigation)
- Init Next.js + Bun + Tailwind + shadcn/ui
- Drizzle ORM + Neon connection + all schemas + initial migration
- Better Auth config (Neon Auth) + auth pages + middleware
- Cloudflare R2 client
- App shell layout (sidebar, topbar)
- DI container
- `UserProfile` entity + use cases

### Phase 2: Media Management
- R2 presigned URL upload pipeline
- `MediaAsset` domain + repository + use cases + API routes
- Media library page + drag-and-drop upload + media browser components

### Phase 3: Slideshow CRUD & Slides
- `Slideshow`, `Slide` domain + repository + use cases + API routes
- Dashboard page (slideshow grid)
- Slide filmstrip with drag-to-reorder
- Zustand stores (editor-store, slideshow-store)

### Phase 4: Fabric.js Canvas Editor
- Fabric.js integration (canvas component, context, hooks)
- Canvas toolbar (select, text, image, shape tools)
- Image, text, shape objects on canvas
- Object properties panel
- `CanvasObject` domain + use case
- Auto-save hook + undo/redo

### Phase 5: Remotion + Timeline
- Remotion setup (config, Root, compositions)
- `SlideshowComposition`, `SlideSequence`, `TextSequence`, `ImageSequence`
- Remotion `<Player>` preview + `<Timeline>` component
- Timeline sync hook (frame-to-slide mapping)
- Edit/preview mode toggle

### Phase 6: Transitions & Audio
- `@remotion/transitions`: fade, slide, zoom, dissolve, wipe
- Effects panel UI
- `Transition` domain + use case + API
- Audio panel + waveform visualization
- `AudioTrack` domain + use case + API
- Multi-track timeline

### Phase 7: Export Pipeline
- `ExportJob` domain + repository + use cases
- Render worker process (polls queue, calls renderMedia)
- Composition builder (domain data -> Remotion props)
- Export dialog + progress polling UI
- R2 upload of rendered output + download URL

### Phase 8: Templates
- `Template` domain + repository + use cases
- `CreateSlideshowFromTemplate` (deep clone from JSON)
- Template gallery UI (filtered by occasion category)
- Craft initial template set for each category

### Phase 9: Admin Dashboard
- Admin layout with role guard
- User management (search, ban, roles, quotas)
- Template management (CRUD, publish/unpublish)
- Feature flag toggles
- Analytics dashboard (aggregate stats)
- System health page

### Phase 10: Polish & Production
- Text animations in Remotion
- Keyboard shortcuts in editor
- Storage quota enforcement
- Error boundaries + loading states
- Thumbnail generation
- Performance optimization
- Landing page

---

## 8. Verification Plan

After each phase, verify:
1. **Phase 1**: Register, login, see dashboard, update profile
2. **Phase 2**: Upload image/audio, view in media library, delete
3. **Phase 3**: Create slideshow, add/remove/reorder slides, see on dashboard
4. **Phase 4**: Drag images onto canvas, add text, move/resize objects, auto-saves
5. **Phase 5**: Preview slideshow playback in Remotion Player, timeline scrubbing
6. **Phase 6**: Apply transitions between slides, add audio track, hear in preview
7. **Phase 7**: Export as MP4, see progress, download rendered video
8. **Phase 8**: Browse templates by category, create slideshow from template
9. **Phase 9**: Admin can manage users, templates, feature flags, view analytics
10. **Phase 10**: Full end-to-end: upload -> edit -> preview -> export -> download

**Key commands**:
- `bun run dev` — local development
- `bun run db:push` — push schema to Neon
- `bun run db:migrate` — run migrations
- `bun run build` — production build check
- `npx remotion render` — test Remotion rendering locally

---

## Critical Files to Modify/Create

- `src/infrastructure/database/schema/*.ts` — All Drizzle schemas (core data model)
- `src/remotion/compositions/slideshow-composition.tsx` — Bridge between domain and video output
- `src/presentation/components/editor/canvas/fabric-canvas.tsx` — Most complex UI component (bidirectional state sync)
- `src/presentation/stores/slideshow-store.ts` — Single source of truth for editor state
- `src/infrastructure/rendering/remotion-render-service.ts` — Critical export path
- `src/infrastructure/storage/r2-storage-service.ts` — All file upload/download operations
- `src/infrastructure/auth/auth.ts` — Better Auth server configuration
- `render-worker/index.ts` — Background rendering process
