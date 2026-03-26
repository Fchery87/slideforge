# SlideForge

A modern web application for creating, editing, and exporting video slideshows. Build stunning presentations with a canvas-based editor, add transitions and audio, then export to video in multiple formats.

## Features

- **Visual Editor** — Fabric.js-powered canvas editor with drag-and-drop objects, multi-select, grouping, undo/redo, and copy/paste
- **Slide Management** — Add, remove, reorder, and duplicate slides with per-slide duration controls
- **Transitions & Animations** — Configurable transition effects between slides with frame-level timing
- **Audio Tracks** — Add background music or narration with per-track volume and time-range controls
- **Media Library** — Upload and manage images and audio files via Cloudflare R2 storage
- **Live Preview** — Real-time Remotion-based video preview directly in the browser
- **Multi-Format Export** — Export to MP4 (H.264), WebM (VP9), GIF, or ProRes with 720p/1080p resolution options
- **Background Render Worker** — Asynchronous export job queue with progress tracking and cancellation
- **Templates** — Pre-built slideshow templates to jumpstart creation
- **User Accounts** — Email/password authentication with Better Auth, profile management, and storage quotas
- **Admin Panel** — Analytics, feature flags, user management, and system monitoring

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui, Zustand |
| **Canvas** | Fabric.js |
| **Video Rendering** | Remotion |
| **Authentication** | Better Auth |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Drizzle ORM |
| **Object Storage** | Cloudflare R2 (S3-compatible) |
| **Runtime** | Bun (render worker), Node.js (Next.js) |

## Architecture

SlideForge follows Clean Architecture with Domain-Driven Design principles:

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── (auth)/           # Login & registration pages
│   ├── (app)/            # Authenticated app shell (dashboard, editor, settings)
│   └── api/              # REST API endpoints
├── application/          # Use cases (commands & queries per CQRS)
│   ├── admin/            # Admin operations
│   ├── export/           # Export job management
│   ├── identity/         # User profile operations
│   ├── media/            # Media asset operations
│   └── slideshow/        # Slideshow CRUD operations
├── domain/               # Core business logic
│   ├── admin/            # Admin entities & value objects
│   ├── export/           # Export job entities & value objects
│   ├── identity/         # User profile entities
│   ├── media/            # Media asset entities & value objects
│   └── slideshow/        # Slideshow, slide, canvas object entities
├── infrastructure/       # External service adapters
│   ├── auth/             # Better Auth configuration
│   ├── database/         # Drizzle schema & client
│   ├── di/               # Dependency injection container
│   ├── rendering/        # Remotion render service
│   ├── repositories/     # Drizzle repository implementations
│   └── storage/          # Cloudflare R2 client & service
├── presentation/         # UI components & state
│   ├── components/       # React components (editor, dashboard, layout)
│   ├── hooks/            # Custom React hooks
│   └── stores/           # Zustand state stores
└── remotion/             # Remotion compositions for video rendering
    ├── compositions/     # Slideshow composition components
    ├── sequences/        # Slide sequence renderers
    ├── transitions/      # Transition effect components
    └── audio/            # Audio track components
```

## Database Schema

The PostgreSQL schema (managed via Drizzle ORM) includes:

| Table | Purpose |
|-------|---------|
| `users` | User accounts and profiles |
| `slideshows` | Slideshow metadata (title, resolution, FPS, background) |
| `slides` | Individual slides with order and duration |
| `canvas_objects` | Objects on slides (images, text, shapes, groups) |
| `transitions` | Transition effects between slides |
| `audio_tracks` | Audio files attached to slideshows |
| `media_assets` | Uploaded media files (images, audio) |
| `export_jobs` | Video export job queue with status tracking |
| `templates` | Pre-built slideshow templates |
| `feature_flags` | Feature toggle configuration |

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database (Neon recommended)
- Cloudflare R2 bucket for object storage

### Installation

1. **Clone the repository**

```bash
git clone <repo-url>
cd slideforge
```

2. **Install dependencies**

```bash
bun install
```

3. **Configure environment variables**

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `BETTER_AUTH_SECRET` | Secret key for auth (min 32 chars) |
| `BETTER_AUTH_URL` | App URL for auth callbacks |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public auth URL (same as above) |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key |
| `CLOUDFLARE_R2_BUCKET_NAME` | R2 bucket name |
| `CLOUDFLARE_R2_PUBLIC_URL` | Public URL for R2 bucket |

4. **Run database migrations**

```bash
bun run db:push
```

5. **Start the development server**

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to access SlideForge.

### Render Worker

The background render worker processes export jobs from the queue. Start it separately:

```bash
cd render-worker
bun install
bun run start
```

The worker polls for queued export jobs every 5 seconds, renders video via Remotion, and uploads the result to R2.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Next.js development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:push` | Push schema changes to database |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:studio` | Open Drizzle Studio (database GUI) |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...all]` | * | Better Auth endpoints |
| `/api/slideshows` | GET/POST | List/create slideshows |
| `/api/slideshows/[id]` | GET/PATCH/DELETE | Slideshow CRUD |
| `/api/slideshows/[id]/slides` | GET/POST | List/add slides |
| `/api/slideshows/[id]/slides/[slideId]` | GET/PATCH/DELETE | Slide CRUD |
| `/api/slideshows/[id]/slides/[slideId]/objects` | GET/POST | Canvas objects |
| `/api/slideshows/[id]/composition` | GET | Get render composition data |
| `/api/slideshows/[id]/audio` | GET/POST | Audio tracks |
| `/api/slideshows/[id]/transitions` | GET/POST | Transitions |
| `/api/media` | GET/POST | Media library |
| `/api/media/presign` | POST | Get presigned upload URL |
| `/api/exports` | GET/POST | List/queue exports |
| `/api/exports/[id]` | GET | Export job status |
| `/api/exports/[id]/download` | GET | Download completed export |
| `/api/templates` | GET | List templates |
| `/api/templates/[id]/use` | POST | Create slideshow from template |
| `/api/admin/*` | * | Admin endpoints (analytics, users, feature flags) |

## License

Private
