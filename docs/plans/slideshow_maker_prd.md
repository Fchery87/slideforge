# Product Requirements Document (PRD)

## Product Name
**Working Name:** ScanForge Slides *(placeholder)*  
**Product Type:** Modern web-based slideshow maker / memory video creator

---

## 1. Executive Summary

ScanForge Slides is a modern slideshow creation web application that enables users to turn collections of photos, music, and text into polished slideshow videos for personal events, memorials, celebrations, family recaps, and presentations. The platform is designed to be approachable for non-technical users while still offering a timeline-based editing experience powerful enough for more advanced creators.

The application will be built with **Next.js**, **Bun**, **Neon Database**, **Neon Auth**, and **Cloudflare R2**. The system will follow **Domain-Driven Design (DDD)** and **Clean Architecture** principles to ensure long-term maintainability, extensibility, and a clear separation between business logic, application workflows, and infrastructure concerns.

The editor will support bulk uploads, drag-and-drop timeline editing, text overlays, transitions, visual effects, audio synchronization, template-based creation, and export into commonly used slideshow/video formats. The first release will focus on delivering a reliable, elegant, and emotionally resonant slideshow creation workflow with a strong MVP feature set.

---

## 2. Product Vision

Create the easiest and most modern way for people to transform memories, moments, and event media into beautiful slideshow videos directly from the web.

---

## 3. Product Mission

Help everyday users create polished slideshow presentations and memory videos without needing professional editing software.

---

## 4. Problem Statement

Many users want to create slideshows for important life moments such as birthdays, weddings, funerals, anniversaries, graduations, and family recaps, but existing tools are often either:

- too simplistic and visually outdated,
- too technical and overwhelming,
- too presentation-focused rather than memory/story-focused,
- too fragmented across mobile apps and desktop software,
- or missing key features like bulk editing, audio syncing, and modern exports.

Users need a web-based tool that feels modern, intuitive, emotionally relevant, and powerful enough to create polished results with minimal friction.

---

## 5. Goals

### Business Goals
- Build a marketable slideshow-making platform for personal and event-based use cases.
- Launch a strong MVP that can later evolve into a subscription product.
- Differentiate through ease of use, emotional storytelling workflows, and modern editing UX.
- Create a scalable architecture for templates, exports, collaboration, and AI-assisted features in later phases.

### Product Goals
- Enable users to create polished slideshow videos from uploaded images and audio.
- Offer timeline and filmstrip editing that is beginner-friendly but flexible.
- Support bulk operations for faster editing.
- Provide occasion-based templates and guided creation flows.
- Deliver reliable exports and project autosave.

### User Goals
- Upload photos and music easily.
- Build a slideshow quickly.
- Add text, transitions, and effects without complexity.
- Preview the result before export.
- Export a slideshow that looks polished and shareable.

---

## 6. Non-Goals for MVP

The following are intentionally excluded from MVP unless implementation proves lightweight:

- real-time multi-user collaboration,
- full video editing suite features,
- advanced masking/compositing,
- stock media marketplace,
- AI voiceover generation,
- deep social sharing/in-app publishing,
- full mobile editing parity,
- advanced layer compositing beyond core text and slide effects,
- professional broadcast-grade editing workflows.

---

## 7. Primary Users

### 7.1 Everyday Personal Users
Users creating slideshows for birthdays, weddings, funerals, memorials, graduations, anniversaries, baby showers, and family events.

### 7.2 Family Organizers / Event Coordinators
Users gathering many photos from multiple sources to create an event slideshow quickly.

### 7.3 Small Business / Presentation Users
Users creating lightweight branded slideshows or simple visual presentations.

### 7.4 Memory Keepers / Tribute Creators
Users creating emotionally meaningful memorial or tribute videos requiring elegant text, music, and pacing.

---

## 8. Core Use Cases

1. A user uploads 100+ family photos and one music track, applies a theme, and exports a memorial slideshow.
2. A user creates a birthday slideshow with text captions and upbeat transitions.
3. A user bulk uploads graduation photos, chooses one slide per image, sets the same transition on all slides, and exports an MP4.
4. A user drags 20 images into the timeline, chooses collage grouping, adds intro/outro text, and exports for display on a TV.
5. A user creates a presentation-style slideshow with simple transitions and branded text screens.

---

## 9. User Experience Principles

- **Fast start:** Users should be able to begin creating within minutes.
- **Emotion-first:** The product should support sentimental and event-based storytelling.
- **Visual clarity:** Editing layout should feel modern, clean, and predictable.
- **Bulk efficiency:** Repetitive editing tasks should be minimized.
- **Safe by default:** Autosave, draft recovery, and confirmation patterns should prevent project loss.
- **Progressive complexity:** Simple workflows first, advanced controls available when needed.

---

## 10. Functional Requirements

## 10.1 Authentication & Accounts

Users must be able to:
- sign up,
- log in,
- log out,
- manage account profile,
- access saved projects,
- recover sessions.

### Requirements
- Use Neon Auth for authentication.
- Support email/password and any Neon-supported provider chosen for implementation.
- Protect authenticated routes.
- Associate projects, assets, and exports with user accounts.

### Acceptance Criteria
- Authenticated users can create and manage projects.
- Unauthenticated users are prompted to sign in before saving/exporting if guest mode is not supported.

---

## 10.2 Project Management

Users must be able to:
- create a new slideshow project,
- choose project title,
- choose occasion type,
- choose aspect ratio,
- save draft state,
- reopen existing projects,
- duplicate projects,
- rename projects,
- archive/delete projects.

### Project Metadata
- title
- description (optional)
- occasion type
- aspect ratio
- thumbnail / cover image
- status (draft, exporting, completed, failed)
- created at / updated at

### Acceptance Criteria
- Users can create multiple projects and resume editing later.
- Project state persists reliably.

---

## 10.3 Occasion Types & Templates

The system should support occasion-driven project setup.

### Initial Occasion Types
- Birthday
- Wedding
- Anniversary
- Memorial / Funeral
- Graduation
- Baby Shower
- Family Recap
- Holiday
- Presentation / Business
- Custom

### Template Capabilities
- blank project
- occasion-based templates
- preset transition packs
- preset text styles
- preset intro/outro screens
- preset timing defaults

### Acceptance Criteria
- Users can choose blank or template-based starting flows.
- Template selection meaningfully changes the initial project setup.

---

## 10.4 Media Upload & Asset Library

Users must be able to upload:
- images,
- audio files.

### Upload Requirements
- drag-and-drop upload,
- file picker upload,
- bulk upload,
- upload progress indicators,
- file validation,
- retry failed uploads,
- duplicate handling policy,
- media processing state.

### Asset Library Requirements
- view uploaded assets,
- multi-select assets,
- search/filter assets,
- sort assets,
- delete assets,
- replace an asset in later phase,
- show thumbnails and metadata.

### Storage Requirements
- Store original assets in Cloudflare R2.
- Store metadata and ownership in Neon Database.
- Generate thumbnails/previews for images where needed.

### Acceptance Criteria
- Users can upload large batches of images.
- Uploaded assets appear in the library and can be dragged into the editor.

---

## 10.5 Slide Creation & Management

Users must be able to:
- add slides,
- duplicate slides,
- delete slides,
- reorder slides,
- set slide duration,
- create one slide per image,
- create grouped/collage slides,
- split grouped slides into separate slides,
- merge/simplify slide compositions later.

### Bulk Insert Behavior
When multiple images are dragged into the editor or timeline, the system should ask:
- add each image as a separate slide,
- add all selected images to one slide,
- add as grouped collage slides (future/optional in MVP if lightweight).

### Acceptance Criteria
- Users can efficiently transform uploaded image sets into slides.
- Slide reordering works by drag-and-drop.

---

## 10.6 Timeline & Filmstrip Editor

The editor must include a bottom editing area containing both:
- a **filmstrip** for visual slide ordering,
- a **timeline** for sequencing and duration control.

### Timeline Requirements
- slide track,
- audio track,
- draggable slide blocks,
- draggable duration handles,
- playhead,
- scrubber,
- current-time marker,
- zoom in/out,
- selection states,
- snapping behavior,
- scrolling support for longer projects.

### Filmstrip Requirements
- slide thumbnails,
- reorder support,
- selection highlight,
- quick navigation.

### Multi-Select Requirements
Users must be able to:
- select one slide,
- select multiple slides,
- select all slides,
- bulk apply transitions/effects/durations,
- bulk delete or duplicate where appropriate.

### Acceptance Criteria
- Timeline changes update preview behavior.
- Users can select and edit multiple slides at once.

---

## 10.7 Text Overlay System

Users must be able to add text to slides.

### Text Types
- title text,
- subtitle text,
- caption text,
- date/location text,
- closing message.

### Text Controls
- font family,
- size,
- color,
- weight,
- alignment,
- opacity,
- stroke/outline,
- shadow,
- position,
- animation preset,
- entry/exit fade.

### Requirements
- Add text to one or more slides.
- Edit text in canvas or inspector.
- Preserve text position per slide.
- Support text preset styles.

### Acceptance Criteria
- Text appears in preview and in export.
- Users can edit text without breaking slide layout.

---

## 10.8 Effects & Transitions

Users must be able to add transitions and visual effects.

### Transition Examples
- fade
- dissolve
- slide
- wipe
- zoom
- blur
- dip to black
- dip to white

### Slide Effect Examples
- Ken Burns pan/zoom
- slow zoom in/out
- black and white
- sepia
- soft glow
- brightness/contrast adjustments (future if needed)

### Requirements
- Add effect to a single slide.
- Add transition between slides.
- Apply transitions/effects in bulk.
- Remove transitions/effects.
- Preview transitions in editor.

### Acceptance Criteria
- Visual transitions are reflected in playback and export.
- Bulk effect application works across selected slides.

---

## 10.9 Audio System

Users must be able to:
- upload audio,
- place an audio track on the timeline,
- trim audio,
- move audio placement,
- adjust volume,
- fade in/out,
- replace audio,
- remove audio.

### MVP Audio Scope
- one main background music track per project,
- optional support for multiple audio tracks in later phase.

### Smart Helpers
- fit slideshow duration to audio,
- fit audio to slideshow duration,
- auto distribute slide timing across track length.

### Acceptance Criteria
- Audio syncs with slideshow preview.
- Audio is included in export.

---

## 10.10 Preview Experience

Users must be able to:
- preview current slide,
- preview full slideshow,
- play/pause,
- seek,
- jump between slides,
- preview with audio,
- preview in selected aspect ratio.

### Requirements
- Near real-time editor preview.
- Accurate enough to build confidence before export.
- Handle moderate-size projects without severe lag.

### Acceptance Criteria
- Preview reflects slide order, timing, text, effects, and audio.

---

## 10.11 Export & Render System

Users must be able to export finished slideshows.

### MVP Export Formats
- MP4
- WebM (optional MVP stretch goal)
- GIF (optional post-MVP)

### Secondary Exports (later phases)
- PDF deck
- image sequence
- project JSON backup
- shareable playback link

### Export Options
- resolution (720p, 1080p)
- aspect ratio
- quality/compression profile
- include/exclude audio if needed later

### Export Requirements
- export job queue,
- processing status,
- completion notification in UI,
- downloadable result,
- retry failed render.

### Acceptance Criteria
- Exported slideshow visually matches project intent.
- Users can download rendered output after processing.

---

## 10.12 Autosave & Recovery

### Requirements
- Autosave project state regularly.
- Preserve editor changes without manual save friction.
- Recover draft state after interruption or crash.
- Display save status.

### Acceptance Criteria
- Users do not lose meaningful work after refresh or temporary disconnect.

---

## 10.13 Bulk Editing

This is a key product differentiator.

Users must be able to:
- select all slides,
- bulk set slide duration,
- bulk apply one transition to all selected slides,
- bulk apply/remove an effect,
- bulk apply text style where relevant later,
- bulk delete or duplicate selected slides where appropriate.

### Acceptance Criteria
- Users can make mass edits quickly without repeating the same action per slide.

---

## 10.14 Intro / Outro Slide Support

Users should be able to easily create:
- title slide,
- event/date slide,
- message slide,
- thank-you / dedication / tribute closing slide.

### Acceptance Criteria
- Intro and outro slides are easy to add and customize.

---

## 10.15 Empty States & Onboarding

### Requirements
- guided first-use hints,
- empty editor messaging,
- upload guidance,
- timeline usage tips,
- export guidance.

### Acceptance Criteria
- First-time users understand the core workflow without documentation.

---

## 11. Non-Functional Requirements

### Performance
- Editor should remain usable with medium-large image sets.
- Upload and preview systems should avoid UI freezes where possible.
- Large projects should degrade gracefully.

### Scalability
- Architecture must support future template expansion, export queue scaling, and collaboration features.

### Reliability
- Autosave and export state must be resilient.
- File upload retries and validation should minimize user frustration.

### Security
- All user media access must be authorization-protected.
- Signed access patterns should be used where needed for Cloudflare R2.
- Authenticated resource access must be enforced.

### Accessibility
- Keyboard navigation for primary flows where feasible.
- Sufficient contrast and visible focus states.
- Semantic UI for forms and buttons.

### Maintainability
- Domain-driven module boundaries.
- Clear interfaces between application and infrastructure layers.
- Testable business logic.

### Observability
- Error logging,
- export failure diagnostics,
- upload failure logs,
- application event tracking later.

---

## 12. Information Architecture

### Main App Areas
1. Marketing / Landing pages
2. Authentication pages
3. Dashboard / Projects list
4. Project setup wizard
5. Slideshow editor
6. Export/download area
7. Account/settings

### Editor Layout
- Left sidebar: media, templates, text, effects
- Center: canvas / live preview
- Right sidebar: properties inspector
- Bottom: filmstrip + timeline + audio track

---

## 13. User Flows

## 13.1 New Project Flow
1. User logs in.
2. User clicks “Create Project.”
3. User chooses occasion type.
4. User chooses blank or template.
5. User chooses aspect ratio.
6. User enters title.
7. User enters editor.

## 13.2 Media Ingestion Flow
1. User uploads images and audio.
2. Assets process and appear in library.
3. User drags media into timeline.
4. System prompts grouping behavior for multiple images.
5. Slides are created.

## 13.3 Editing Flow
1. User arranges slides in filmstrip/timeline.
2. User adjusts slide durations.
3. User adds music to audio track.
4. User adds text overlays.
5. User applies transitions/effects.
6. User previews slideshow.
7. Autosave persists progress.

## 13.4 Bulk Editing Flow
1. User selects multiple slides.
2. User opens transition/effect controls.
3. User applies settings to all selected slides.
4. Preview updates accordingly.

## 13.5 Export Flow
1. User clicks export.
2. User selects format and quality.
3. Export job is queued.
4. UI shows status.
5. User downloads finished render.

---

## 14. Domain-Driven Design (DDD) Structure

## 14.1 Bounded Contexts

### Identity Context
**Responsibilities:**
- users
- authentication
- sessions
- account ownership

### Project Context
**Responsibilities:**
- project metadata
- occasion type
- aspect ratio
- project lifecycle status

### Media Asset Context
**Responsibilities:**
- image assets
- audio assets
- upload metadata
- storage references
- thumbnails/previews

### Composition Context
**Responsibilities:**
- slides
- slide sequencing
- durations
- grouped image logic
- timeline item structure
- filmstrip ordering

### Text Overlay Context
**Responsibilities:**
- text blocks
- style presets
- placement
- animation metadata

### Effects Context
**Responsibilities:**
- transitions
- visual effects
- bulk application rules
- effect presets

### Audio Context
**Responsibilities:**
- audio tracks
- trims
- volume/fades
- timeline placement
- sync helper rules

### Export Context
**Responsibilities:**
- render jobs
- export settings
- output artifacts
- job status
- retry/failure state

### Template Context
**Responsibilities:**
- template definitions
- occasion presets
- default transitions/text styles
- starter slide sets

---

## 14.2 Aggregate Suggestions

### Project Aggregate
- Project
- AspectRatio
- OccasionType
- ProjectStatus

### Slide Composition Aggregate
- Slide
- SlideItem
- Duration
- TransitionConfig
- EffectConfig

### Audio Aggregate
- AudioTrack
- TrimRange
- VolumeSetting

### Text Aggregate
- TextBlock
- TextStyle
- AnimationPreset

### Export Aggregate
- ExportJob
- RenderProfile
- OutputArtifact

---

## 15. Clean Architecture Direction

### Presentation Layer
- Next.js routes/pages
- React editor UI
- API handlers / server actions as appropriate
- form/input components

### Application Layer
- use cases
- commands/queries
- validation and orchestration
- service interfaces

### Domain Layer
- entities
- value objects
- aggregates
- domain rules
- domain services

### Infrastructure Layer
- Neon database adapters
- Neon Auth integration
- Cloudflare R2 storage adapter
- rendering/FFmpeg worker pipeline
- background job system
- logging and monitoring

---

## 16. Suggested Data Model (High Level)

### users
- id
- email
- display_name
- created_at
- updated_at

### projects
- id
- user_id
- title
- description
- occasion_type
- aspect_ratio
- cover_asset_id (optional)
- status
- created_at
- updated_at

### assets
- id
- user_id
- project_id (nullable for reusable library)
- asset_type (image, audio)
- filename
- mime_type
- storage_key
- file_size
- duration_ms (audio)
- width / height (image)
- processing_status
- created_at

### slides
- id
- project_id
- sequence_index
- duration_ms
- background_asset_id (nullable)
- transition_type
- transition_config_json
- effect_config_json
- created_at
- updated_at

### slide_items
- id
- slide_id
- item_type (image, text)
- source_asset_id (nullable)
- layer_index
- position_json
- style_json
- animation_json
- created_at
- updated_at

### audio_tracks
- id
- project_id
- asset_id
- start_ms
- trim_start_ms
- trim_end_ms
- volume
- fade_in_ms
- fade_out_ms
- created_at
- updated_at

### export_jobs
- id
- project_id
- format
- resolution
- status
- output_storage_key
- error_message
- created_at
- updated_at

### templates
- id
- name
- occasion_type
- config_json
- created_at
- updated_at

---

## 17. API / Application Use Cases

### Project Use Cases
- CreateProject
- RenameProject
- DuplicateProject
- ArchiveProject
- LoadProjectEditorState

### Asset Use Cases
- UploadAsset
- ValidateAsset
- ListProjectAssets
- DeleteAsset

### Composition Use Cases
- AddSlidesFromAssets
- ReorderSlides
- UpdateSlideDuration
- BulkApplyTransition
- BulkApplyEffect
- SplitGroupedSlide

### Text Use Cases
- AddTextBlock
- UpdateTextBlock
- RemoveTextBlock

### Audio Use Cases
- AddAudioTrack
- TrimAudioTrack
- UpdateAudioVolume
- FitSlidesToAudio

### Export Use Cases
- CreateExportJob
- TrackExportStatus
- DownloadExport
- RetryFailedExport

---

## 18. Technical Constraints & Assumptions

- Frontend must be built in Next.js.
- Bun is the package manager/runtime.
- Database is Neon Postgres.
- Authentication is Neon Auth.
- Object storage is Cloudflare R2.
- Export rendering will likely require a server-side or worker-based pipeline, potentially powered by FFmpeg or a rendering service.
- The app is desktop-first for editing in MVP.
- Browser preview and final export may use different rendering strategies, but visual parity should be prioritized.

---

## 19. Risks & Challenges

### 19.1 Export Rendering Complexity
Rendering synchronized media, text, transitions, and effects into downloadable video is one of the most technically challenging parts of the system.

### 19.2 Performance With Large Media Sets
Large image libraries and long timelines may affect browser responsiveness.

### 19.3 Preview vs Export Parity
The browser preview may not perfectly match final render unless rendering rules are tightly standardized.

### 19.4 Asset Processing Overhead
Image thumbnail generation, metadata extraction, and upload processing need efficient orchestration.

### 19.5 Scope Creep
Slideshow tools can quickly become full video editors. MVP boundaries must be preserved.

---

## 20. Success Metrics

### Product Metrics
- project creation rate
- % of users who upload media after creating project
- % of users who reach first preview
- % of users who successfully export
- average time from project creation to export
- average slides per project
- use of bulk editing actions

### Reliability Metrics
- upload success rate
- export success rate
- autosave recovery success rate
- editor crash/error rate

### Business Metrics (later)
- free-to-paid conversion
- export volume per user
- retention by 7-day / 30-day windows

---

## 21. MVP Scope

### Included in MVP
- user authentication
- project creation and management
- occasion selection
- blank/template start
- bulk image upload
- bulk audio upload
- asset library
- slide generation from assets
- timeline + filmstrip editor
- drag-and-drop slide reorder
- slide duration controls
- text overlays
- core transitions
- core visual effects
- single background audio track
- preview player
- autosave
- MP4 export

### MVP Stretch Goals
- WebM export
- grouped collage slides
- intro/outro presets
- fit slideshow to audio helper

---

## 22. Post-MVP Roadmap

### Phase 2
- multiple audio tracks
- GIF export
- project duplication enhancements
- more templates
- animated text presets
- smarter bulk actions
- export presets by channel/device

### Phase 3
- AI-assisted slideshow generation
- AI title/caption suggestions
- shared editing / family collaboration
- voiceover recording
- template marketplace
- brand kits
- advanced transitions/effects

### Phase 4
- mobile-friendly editing support
- collaborative commenting/review
- hosted public slideshow playback pages

---

## 23. UX / UI Requirements Summary

The UI should feel:
- modern,
- calm,
- visually premium,
- emotionally appropriate for both celebration and memorial use cases,
- simple enough for non-designers,
- efficient enough for large photo sets.

The editor should prioritize:
- clear hierarchy,
- obvious drag-and-drop targets,
- visible selection state,
- low-friction bulk editing,
- reassuring save/export status.

---

## 24. Open Questions

1. What rendering pipeline will be used for export jobs?
2. Will template definitions be stored fully in the database, files, or hybrid config?
3. Will grouped/collage slide support be MVP or Phase 2?
4. Will guest editing mode exist before sign-in?
5. Should export jobs be processed synchronously for small projects or always queued?
6. What initial limits should exist for file count, storage, and project length?
7. Will we support user-uploaded custom fonts in a future phase?

---

## 25. Final Product Statement

ScanForge Slides is a modern web-based slideshow studio that enables users to upload photos and music, arrange media through an intuitive timeline editor, add text and visual transitions, and export polished slideshow videos for life events, tributes, celebrations, and presentations. Built with Next.js, Bun, Neon Database, Neon Auth, and Cloudflare R2, the system is designed with Domain-Driven Design and Clean Architecture principles to support a clean MVP today and a scalable product foundation for tomorrow.

