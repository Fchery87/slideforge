# SlideForge Editor Modernization Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Define the target architecture for evolving `/editor` into a modern slideshow maker with reliable authoring, playback, presenter delivery, and export behavior.

**Architecture:** Rebuild the editor around a single slideshow state model and three coordinated runtimes: authoring, playback, and export. The authoring runtime owns fast local interactions, the playback runtime owns truthy timeline behavior, and the export runtime renders from the same composition contract so users are never editing one thing and exporting another.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Zustand, Fabric.js, Remotion, Tailwind CSS, shadcn/ui

---

## 1. Architectural Intent

The current editor is organized around object manipulation. The target editor should instead be organized around presentation creation and delivery.

The desired user flow is:

1. Start from a template, theme, or layout.
2. Add slide content quickly with presentation-aware defaults.
3. Refine timing, transitions, and motion from a real timeline.
4. Rehearse with presenter and preview surfaces that match export behavior.
5. Export or share without feature drift between edit mode and render mode.

This architecture should optimize for:

- one shared slideshow model across editor, preview, and export
- low-latency editing without sacrificing deterministic playback
- feature delivery in slices without rewriting the editor again
- removal of misleading UI states and dead interaction paths

---

## 2. Recommended Architectural Approach

Three approaches exist:

### Option A: Keep Fabric as the only source of truth

Pros:

- fast to keep iterating on direct manipulation
- fewer model translation layers

Cons:

- preview/export stay second-class
- timing and presenter workflows remain bolted on
- hard to guarantee deterministic playback

### Option B: Fully migrate to a timeline/composition-first runtime

Pros:

- cleanest long-term playback model
- great parity between preview and export

Cons:

- high migration cost
- large disruption to current canvas/editor code

### Option C: Hybrid slideshow model with runtime-specific adapters

Pros:

- preserves Fabric for authoring
- enables truthful preview/export through Remotion/composition adapters
- incremental rollout with lower regression risk

Cons:

- requires careful data contracts
- two render surfaces must stay aligned

**Recommendation:** Option C. Keep Fabric as the authoring adapter, but move product truth into a normalized slideshow model consumed equally by preview and export.

---

## 3. Target System Boundaries

The editor should be split into five bounded layers.

### A. Slideshow Domain Model

Owns:

- slideshow metadata
- slide order and duration
- slide background model
- object model
- transitions
- audio tracks
- presenter notes
- theme/layout metadata

Must not own:

- Fabric-specific object instances
- transient DOM/UI state
- player-specific implementation details

### B. Authoring Runtime

Owns:

- selection
- drag/resize/rotate interactions
- local editing responsiveness
- panel visibility
- insertion defaults

Implementation:

- Fabric.js adapter over the domain model

### C. Playback Runtime

Owns:

- current frame
- slide/frame mapping
- transitions
- object animation playback
- audio sync
- presenter surfaces

Implementation:

- Remotion-backed composition contract or equivalent playback adapter

### D. Delivery Runtime

Owns:

- export queue contract
- render options
- output formats
- share/record surfaces

Implementation:

- `/api/exports`
- render worker
- composition builder

### E. Workspace UI Runtime

Owns:

- left rail
- top bar
- right inspector
- bottom rail
- modals/sheets
- URL-synced panel state

Implementation:

- React component composition over editor store selectors

---

## 4. Canonical Data Model

The architecture should standardize on one canonical slideshow document.

### Slideshow

Required fields:

- `id`
- `title`
- `description`
- `resolution`
- `fps`
- `theme`
- `slides[]`
- `transitions[]`
- `audioTracks[]`
- `updatedAt`

### Slide

Required fields:

- `id`
- `order`
- `durationFrames`
- `background`
- `layoutId?`
- `notes?`
- `canvasObjects[]`
- `effects`

### Slide Background

Replace raw `backgroundColor` with:

```ts
type SlideBackground =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; value: string }
  | { kind: "image"; mediaAssetId: string; objectFit: "cover" | "contain" }
  | { kind: "theme-default" };
```

### Canvas Object

Keep object variants, but ensure every variant is renderable by both Fabric and playback:

- `text`
- `image`
- `shape`
- `group` only if fully supported end-to-end

If group objects cannot be rendered by preview/export, remove them from the public feature set until supported.

### Animation Contract

Object animations and slide effects should be normalized into serializable contracts, not event-driven preview behavior.

### Theme Contract

Theme should become a first-class deck-level object:

- typography tokens
- palette tokens
- default background tokens
- default shape/text presets

---

## 5. State Architecture

The current store mixes domain state, UI state, transient playback state, and incomplete history. The target should separate them.

### Editor Store Slices

Use one Zustand store with explicit slices or separate stores with clear contracts:

#### `documentSlice`

Owns:

- slideshow document
- dirty state
- revision markers
- autosave queue metadata

#### `selectionSlice`

Owns:

- selected slide
- selected objects
- active insertion target

#### `workspaceSlice`

Owns:

- active left tab
- active right panel
- active bottom surface
- modal/sheet visibility

#### `playbackSlice`

Owns:

- current frame
- is playing
- preview mode
- presenter mode

#### `historySlice`

Owns:

- undo stack
- redo stack
- patch-based or snapshot-based history

### Rules

- Domain mutations always go through actions.
- UI state never mutates document state directly.
- Preview state never invents data not present in the slideshow document.
- Export reads only the canonical slideshow contract, not live Fabric state.

---

## 6. Rendering Architecture

The system needs explicit render adapters.

### Fabric Authoring Adapter

Responsibilities:

- map `CanvasObject` -> Fabric objects
- map Fabric mutations -> domain patches
- preserve deterministic ordering
- never become the persistence source of truth

Rules:

- every visible object must map back to a serializable object node
- no Fabric-only styling/features unless equivalent playback support exists

### Playback Adapter

Responsibilities:

- map slideshow document -> frame-based presentation
- compute slide durations, overlaps, and transition windows
- render object animations and slide effects
- synchronize audio by frame

Rules:

- preview and export use the same composition logic
- if preview cannot render a feature, the editor must not imply that it exists

### Background Renderer

Must be shared between authoring, preview, and export.

Do not keep three independent background implementations.

---

## 7. UI Surface Ownership

Each editor surface needs a clear responsibility.

### Top Bar

Owns:

- title
- save status
- undo/redo
- enter preview
- enter presenter view
- export/share

Does not own:

- fake edit/preview toggles with no layout change

### Left Rail

Owns rapid authoring inputs:

- templates
- layouts
- media
- text presets
- audio library

This is not just an asset browser.

### Center Stage

Owns:

- authoring canvas in edit mode
- preview stage in playback mode

The center stage should visibly change mode.

### Right Inspector

Owns:

- contextual properties
- animation
- transitions/effects
- background
- audio track properties when selected

### Bottom Rail

Owns:

- slide filmstrip
- timing timeline
- playhead
- slide transition anchors
- audio track lanes

The bottom rail is the control center for pacing, not a passive thumbnail bar.

---

## 8. Modern Slideshow Features to Support Natively

The architecture should explicitly support these as first-class capabilities:

- template-based deck creation
- per-slide layouts
- theme tokens
- presenter notes
- presenter view
- timeline-based timing
- truthful transitions
- audio tracks with trims and fades
- object animations
- slide-level effects
- export parity with preview

Deferred but architecturally reserved:

- real-time collaboration
- analytics
- shared links
- live audience interactions
- AI outline/deck generation

The plan should leave extension points for these without forcing them into phase one.

---

## 9. API and Persistence Changes

The architecture requires a few contract-level changes.

### Existing APIs to Refactor

- `GET /api/slideshows/[id]`
- `PUT /api/slideshows/[id]`
- slide-specific update endpoints
- transition endpoints
- audio track endpoints

### Required Persistence Changes

- replace raw slide background string with structured background JSON
- add slide notes
- add theme/layout metadata
- ensure transition and animation contracts are persistable as normalized JSON

### Save Strategy

Use optimistic local updates plus autosave batching.

Rules:

- local edits update the store immediately
- autosave batches patches or debounced document writes
- explicit save remains available
- dirty state must reflect successful persistence, not merely local mutation

---

## 10. Rollout Phases

### Phase 1: Trust Restoration

Deliver:

- working export surface
- real preview mode
- mounted timeline
- correct title saving
- unsaved-change protection
- undo coverage for key edits

Outcome:

- users can trust the editor

### Phase 2: Shared Render Contract

Deliver:

- normalized backgrounds
- playback parity
- transition and animation truthfulness
- audio sync parity

Outcome:

- preview equals export in behavior

### Phase 3: Workflow Modernization

Deliver:

- left-rail authoring tabs
- layouts
- theme application
- slide actions
- stronger insertion defaults

Outcome:

- faster deck creation

### Phase 4: Presentation Delivery

Deliver:

- presenter notes
- presenter view
- clearer export/share model

Outcome:

- editor becomes a slideshow maker, not just a design surface

---

## 11. Verification Architecture

Verification should mirror the system boundaries.

### Contract Verification

Add tests for:

- slideshow document shape
- background normalization
- slide/frame mapping
- transition timing math
- audio range math

### Adapter Verification

Add focused checks for:

- Fabric adapter round-tripping object edits
- playback adapter consuming the same slideshow document

### End-to-End Verification

Manual or automated flows should cover:

1. create slide
2. apply layout
3. add text/image
4. set transition
5. scrub timeline
6. open preview
7. open presenter view
8. export

### Release Rule

No editor feature should be marked complete unless:

- it appears in authoring
- it appears in preview
- it survives persistence
- it renders in export or is explicitly labeled preview-only

---

## 12. Risks and Guardrails

### Risk: Feature Drift Between Fabric and Playback

Guardrail:

- no new visual feature without a playback adapter decision

### Risk: Store Bloat and Inconsistent Mutations

Guardrail:

- slice the store and route all domain changes through named actions

### Risk: Half-Implemented UI Surfaces

Guardrail:

- remove dormant controls instead of leaving “coming soon” behavior in primary flows

### Risk: Rebuilding Too Much at Once

Guardrail:

- use the rollout phases above and do not start Phase 3 before Phase 1 and 2 are stable

---

## 13. Recommended Implementation Tasks

Translate this architecture into the next execution plan in this order:

1. stabilize mounted editor surfaces
2. normalize slideshow contracts
3. unify preview/export composition behavior
4. restructure workspace UI around slideshow authoring
5. add presenter/delivery surfaces
6. add layouts/themes/template application

---

## 14. Success Criteria

This architecture is successfully implemented when:

- `/editor` has one canonical slideshow model
- Fabric is only an authoring adapter, not product truth
- preview and export consume the same render contract
- the bottom rail controls timing as a first-class workflow
- templates/layouts/themes accelerate slide creation
- presenter notes and presenter view are part of the delivery workflow
- no primary UI affordance is fake, dead, or misleading
