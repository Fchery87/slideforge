# SlideForge Editor Modernization Remediation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn `/editor` from a low-level canvas sandbox into a modern slideshow maker with a coherent authoring flow, reliable preview/export behavior, and presentation-focused controls.

**Architecture:** Ship this in two passes. First, stabilize the existing editor so every mounted control works correctly and preview/export reflect real slideshow state. Second, restructure the editor around modern slideshow workflows: start from templates or layouts, edit slide content quickly, control timing in a real timeline, and deliver through presenter/export/share surfaces.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Zustand, Fabric.js, Remotion, Tailwind CSS, shadcn/ui

---

## Product Direction

Use the following product assumptions while implementing:

- The editor should optimize for making presentations, not raw canvas editing.
- The primary user journey is: create deck -> choose template/layout -> add content quickly -> adjust timing/visual polish -> rehearse/present -> export/share.
- “Preview” means a real playback surface that respects durations, transitions, object animations, slide effects, and audio.
- The left rail should help users create slides faster; it should not act only as a file browser.
- The bottom rail should become a timing surface, not just a thumbnail strip.

---

### Task 1: Stabilize Broken Editor Wiring

Fix dead UI paths and mount all already-built surfaces that are currently disconnected.

**Files:**
- Modify: `src/app/(editor)/editor/[id]/page.tsx`
- Modify: `src/presentation/components/editor/top-bar/editor-top-bar.tsx`
- Modify: `src/presentation/components/export/export-dialog.tsx`
- Modify: `src/presentation/hooks/use-keyboard-shortcuts.ts`
- Test: manual verification in `/editor/[id]`

**Step 1: Mount missing editor surfaces**

In `src/app/(editor)/editor/[id]/page.tsx`, mount:

- `<ExportDialog />`
- `useKeyboardShortcuts()`
- a bottom area that can switch between `SlideStrip` and `TimelineContainer`

Do not leave `TimelineContainer` as dead code.

**Step 2: Make top-bar mode controls reflect real UI state**

Update `src/presentation/components/editor/top-bar/editor-top-bar.tsx` so:

- the current mode label matches the active surface
- “Preview” opens or switches to a real preview state
- the save path uses the latest title state, not stale `slideshow.title`

**Step 3: Add unsaved-change protection**

Use `beforeunload` in the editor page while `isDirty === true`.

Expected behavior:

- browser warns before tab close/reload
- no warning when editor is clean

**Step 4: Verify mounted actions**

Run:

```bash
npm run typecheck
```

Expected:

- no new TypeScript errors

**Step 5: Manual regression pass**

Verify:

- Export opens a sheet
- keyboard shortcuts are active
- timeline can be shown
- unsaved changes warn on refresh

**Step 6: Commit**

```bash
git add src/app/(editor)/editor/[id]/page.tsx src/presentation/components/editor/top-bar/editor-top-bar.tsx src/presentation/components/export/export-dialog.tsx src/presentation/hooks/use-keyboard-shortcuts.ts
git commit -m "fix: wire editor controls and mounted surfaces"
```

---

### Task 2: Repair Render/Data Parity

Bring the edit surface, preview surface, and stored slideshow data back into agreement.

**Files:**
- Modify: `src/presentation/components/editor/background/background-panel.tsx`
- Modify: `src/presentation/components/editor/canvas/fabric-canvas.tsx`
- Modify: `src/presentation/components/editor/preview/preview-modal.tsx`
- Modify: `src/presentation/stores/editor-store.ts`
- Modify: `src/domain/slideshow/entities/slide.ts`
- Create: `src/domain/slideshow/value-objects/slide-background.ts`

**Step 1: Normalize background data**

Replace the overloaded `backgroundColor` behavior with a proper background model:

- solid color
- gradient
- future image background

Do not store CSS gradients in a field that renderers treat as a flat color.

**Step 2: Make canvas and preview consume the same background contract**

Update both renderers so:

- solid backgrounds render correctly
- gradients render correctly
- future image background support has a clear slot in the contract

**Step 3: Fix editor-state undo coverage**

In `src/presentation/stores/editor-store.ts`, make object updates and slide-effect updates undoable.

Minimum requirement:

- direct property edits
- drag/resize/rotate operations
- background changes
- timing changes

**Step 4: Keep object ordering deterministic**

When syncing to Fabric and preview:

- sort by `zIndex`
- keep `zIndex` mutations predictable after duplicate/reorder actions

**Step 5: Verify**

Run:

```bash
npm run typecheck
```

Manual verification:

- solid and gradient backgrounds match between canvas and preview
- undo/redo works for drag, resize, and panel edits

**Step 6: Commit**

```bash
git add src/presentation/components/editor/background/background-panel.tsx src/presentation/components/editor/canvas/fabric-canvas.tsx src/presentation/components/editor/preview/preview-modal.tsx src/presentation/stores/editor-store.ts src/domain/slideshow/entities/slide.ts src/domain/slideshow/value-objects/slide-background.ts
git commit -m "fix: align slideshow rendering with stored editor state"
```

---

### Task 3: Make Preview Real

Replace the current slide-flip modal with playback that respects slideshow timing and polish controls.

**Files:**
- Modify: `src/presentation/components/editor/preview/preview-modal.tsx`
- Modify: `src/presentation/components/editor/animation/animation-panel.tsx`
- Modify: `src/presentation/components/editor/effects/enhanced-effects-panel.tsx`
- Modify: `src/presentation/components/editor/timeline/timeline-container.tsx`
- Modify: `src/remotion/compositions/slideshow-composition.tsx`
- Modify: `src/remotion/sequences/slide-sequence.tsx`
- Modify: `src/remotion/audio/audio-layer.tsx`

**Step 1: Remove no-op preview events**

Delete or replace event-only hooks like:

- `preview-animation`
- `preview-ken-burns`

Every preview action should drive a mounted playback surface.

**Step 2: Fix transition editing**

In `src/presentation/components/editor/effects/enhanced-effects-panel.tsx`:

- duration slider must persist the chosen value
- transition config must affect playback timing
- transition preview must render the selected type

**Step 3: Render object animations and slide effects in preview**

At minimum support:

- fade / slide / scale text or object animations
- Ken Burns
- slide transition timing
- audio playback alignment

**Step 4: Sync timeline and preview frame state**

The bottom timeline should become the source of truth for:

- current frame
- slide selection from frame position
- preview scrub state

**Step 5: Verify**

Run:

```bash
npm run typecheck
```

Manual verification:

- transition duration changes playback
- animation preview is visible
- playhead, slide selection, and preview stay in sync
- audio starts and stops at the right frames

**Step 6: Commit**

```bash
git add src/presentation/components/editor/preview/preview-modal.tsx src/presentation/components/editor/animation/animation-panel.tsx src/presentation/components/editor/effects/enhanced-effects-panel.tsx src/presentation/components/editor/timeline/timeline-container.tsx src/remotion/compositions/slideshow-composition.tsx src/remotion/sequences/slide-sequence.tsx src/remotion/audio/audio-layer.tsx
git commit -m "feat: make editor preview honor timing, transitions, and animations"
```

---

### Task 4: Reframe the Editor Around Slideshow Creation

Shift `/editor` from “asset library + canvas + properties” to “slides + layouts + content + timing”.

**Files:**
- Modify: `src/app/(editor)/editor/[id]/page.tsx`
- Modify: `src/presentation/components/editor/slides/slide-strip.tsx`
- Modify: `src/presentation/components/editor/slides/slide-thumbnail.tsx`
- Modify: `src/presentation/components/editor/canvas/canvas-toolbar.tsx`
- Modify: `src/presentation/components/editor/media-sidebar/enhanced-media-browser.tsx`
- Create: `src/presentation/components/editor/layouts/layout-browser.tsx`
- Create: `src/presentation/components/editor/slides/slide-actions-menu.tsx`

**Step 1: Expand the left rail into authoring tabs**

Replace the current “Images / Audio” only rail with tabs such as:

- `Slides`
- `Layouts`
- `Media`
- `Text`
- `Audio`

Recommendation:

- keep existing media browser
- add a layout browser for quick slide starts
- expose text presets instead of requiring canvas-first placement every time

**Step 2: Make slide operations obvious**

Add per-slide actions for:

- duplicate
- delete
- move left/right
- apply layout
- set transition

These actions should be available from the slide strip, not hidden in unrelated panels.

**Step 3: Improve default insertion behavior**

When adding images/text/layouts:

- center intelligently
- fit content to canvas bounds
- use consistent spacing
- avoid dumping raw assets at arbitrary coordinates

**Step 4: Verify**

Manual verification:

- a new user can create a usable slide without opening five side panels
- slide actions are discoverable from the bottom rail
- adding content feels presentation-first, not canvas-first

**Step 5: Commit**

```bash
git add src/app/(editor)/editor/[id]/page.tsx src/presentation/components/editor/slides/slide-strip.tsx src/presentation/components/editor/slides/slide-thumbnail.tsx src/presentation/components/editor/canvas/canvas-toolbar.tsx src/presentation/components/editor/media-sidebar/enhanced-media-browser.tsx src/presentation/components/editor/layouts/layout-browser.tsx src/presentation/components/editor/slides/slide-actions-menu.tsx
git commit -m "feat: reorganize editor around slideshow authoring workflows"
```

---

### Task 5: Add a Real Presenter / Delivery Surface

Modern slideshow tools are judged by how they present, not just how they edit.

**Files:**
- Modify: `src/presentation/components/editor/preview/preview-modal.tsx`
- Create: `src/presentation/components/editor/presenter/presenter-view.tsx`
- Create: `src/presentation/components/editor/presenter/presenter-notes-panel.tsx`
- Modify: `src/presentation/components/export/export-dialog.tsx`
- Modify: `src/domain/slideshow/entities/slide.ts`

**Step 1: Add speaker notes to the slide model**

Add optional presenter notes per slide.

**Step 2: Build presenter view**

Presenter view should include:

- current slide
- next slide
- notes
- elapsed / remaining time
- slide index

**Step 3: Expand export/share choices**

Keep current media exports, but add explicit delivery paths for:

- export PDF/PPT-friendly artifacts if supported
- shareable presentation link if already available in platform architecture
- recorded playback path as a future extension slot

Do not promise unsupported output; expose only what the backend can really queue.

**Step 4: Verify**

Manual verification:

- presenter view opens from the editor
- notes are editable and visible in presenter mode
- delivery controls map to actual supported outputs

**Step 5: Commit**

```bash
git add src/presentation/components/editor/preview/preview-modal.tsx src/presentation/components/editor/presenter/presenter-view.tsx src/presentation/components/editor/presenter/presenter-notes-panel.tsx src/presentation/components/export/export-dialog.tsx src/domain/slideshow/entities/slide.ts
git commit -m "feat: add presenter workflow and delivery surfaces"
```

---

### Task 6: Add Template / Theme Entry Points

Close the biggest modern-product gap: users should not have to start every deck from a blank canvas.

**Files:**
- Modify: `src/app/(editor)/editor/[id]/page.tsx`
- Modify: `src/presentation/components/templates/template-gallery.tsx`
- Create: `src/presentation/components/editor/themes/theme-picker.tsx`
- Create: `src/presentation/components/editor/layouts/default-slide-layouts.ts`
- Modify: `src/application/admin/commands/create-slideshow-from-template.ts`

**Step 1: Let users start or restyle from templates inside the editor**

Expose:

- apply template to slideshow
- apply layout to current slide
- apply theme tokens across the deck

**Step 2: Introduce lightweight deck themes**

Theme tokens should drive:

- typography
- palette
- default text styles
- background defaults
- shape defaults

**Step 3: Preserve user edits**

Applying a layout or theme must be scoped and reversible.

Use undo history so theme/layout application is not destructive.

**Step 4: Verify**

Manual verification:

- blank slideshow can become a polished deck in a few clicks
- theme application changes defaults consistently
- undo restores prior deck appearance

**Step 5: Commit**

```bash
git add src/app/(editor)/editor/[id]/page.tsx src/presentation/components/templates/template-gallery.tsx src/presentation/components/editor/themes/theme-picker.tsx src/presentation/components/editor/layouts/default-slide-layouts.ts src/application/admin/commands/create-slideshow-from-template.ts
git commit -m "feat: add template and theme entry points to editor"
```

---

### Task 7: Final Integration Pass

Do a focused cleanup pass so the editor no longer contains dead states, dead events, or duplicate interaction models.

**Files:**
- Modify: `src/presentation/stores/editor-store.ts`
- Modify: `src/presentation/components/editor/context-menu/context-menu.tsx`
- Modify: `src/presentation/components/editor/canvas/fabric-canvas.tsx`
- Modify: `src/presentation/components/editor/top-bar/editor-top-bar.tsx`
- Modify: `src/presentation/components/editor/media-sidebar/enhanced-media-browser.tsx`

**Step 1: Remove or complete half-implemented state**

Resolve these paths one by one:

- `isEditMode`
- `selectedObjectIds`
- grouping support
- dead custom preview events
- duplicated keyboard handling

If a feature is not ready, remove the user-facing affordance instead of leaving a partial implementation.

**Step 2: Deep-link stable editor state where useful**

Recommended URL-synced state:

- active right panel
- active left-rail tab
- selected bottom surface (`slides` vs `timeline`)

**Step 3: Final verification**

Run:

```bash
npm run typecheck
npm run lint
```

Expected:

- no new lint or type errors

Manual verification:

- create slide
- add image
- add text
- set transition
- preview playback
- open presenter view
- export

**Step 4: Commit**

```bash
git add src/presentation/stores/editor-store.ts src/presentation/components/editor/context-menu/context-menu.tsx src/presentation/components/editor/canvas/fabric-canvas.tsx src/presentation/components/editor/top-bar/editor-top-bar.tsx src/presentation/components/editor/media-sidebar/enhanced-media-browser.tsx
git commit -m "refactor: remove dead editor paths and finalize modernized workflow"
```

---

## Recommended Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 7
5. Task 4
6. Task 5
7. Task 6

Rationale:

- Tasks 1-3 fix trust-breaking bugs in the current product.
- Task 7 removes dead state before new workflow layers pile on top.
- Tasks 4-6 are the actual modernization pass.

## Success Criteria

The remediation is complete when all of the following are true:

- Export, preview, and timing controls are real and mounted.
- Canvas state, preview state, and persisted state match.
- A user can build a decent first slide from layouts/templates without manual object wrangling.
- The bottom rail supports timing work, not just slide browsing.
- Presenter/delivery surfaces exist and are credible.
- No obviously dead or misleading controls remain in `/editor`.
