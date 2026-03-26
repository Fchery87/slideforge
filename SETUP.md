# SlideForge — Setup & Run Guide

Everything you need to get SlideForge running locally.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Bun** | >= 1.1 | `curl -fsSL https://bun.sh/install \| bash` |
| **Node.js** | >= 20.9 | Comes with Next.js requirement |
| **Git** | any | — |
| **FFmpeg** | 6.x | Required by Remotion for rendering — [download](https://ffmpeg.org/download.html) |

---

## 1. Clone & Install

```bash
git clone <your-repo-url> slideforge
cd slideforge
bun install
```

All dependencies are in `package.json` — no extra installs needed.

---

## 2. Neon (Serverless Postgres)

Neon provides the database. Everything runs on their free tier.

### 2a. Create a Neon Project

1. Go to [neon.com](https://neon.com) → Sign up / Log in
2. Click **Create Project**
3. Give it a name (e.g. `slideforge`)
4. Select a region close to you
5. Click **Create**

### 2b. Copy the Connection String

1. In your Neon project dashboard, click **Connect** (top-right)
2. Select your branch, database (`neondb` is the default), and role
3. Copy the connection string — it looks like:

```
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/slideforge?sslmode=require
```

> **Tip**: Use the pooled connection string (port 5432 with `channel_binding=require`) for Next.js.

---

## 3. Cloudflare R2 (Object Storage)

R2 stores uploaded images, audio, and rendered video exports. Zero egress fees.

### 3a. Create an R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**
2. Click **Create bucket**
3. Name: `slideforge` (or any name you prefer)
4. Location: Choose closest region
5. Click **Create bucket**

### 3b. Create R2 API Token

1. In R2 overview, click **Manage R2 API Tokens** → **Create API Token**
2. Name: `slideforge-dev`
3. Permissions: **Object Read & Write** (for your bucket)
4. Click **Create** → Copy both **Access Key ID** and **Secret Access Key**

### 3c. Get Your Account ID

1. In Cloudflare dashboard, look at the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/r2`
2. Or find it on the right sidebar of any domain overview page

### 3d. Public URL (Optional — for direct file access)

1. In your R2 bucket settings, go to **Settings**
2. Under **Public access**, enable **Allow Access**
3. Copy the public URL (e.g. `https://pub-abc123.r2.dev`)

### 3e. Configure CORS (Required for presigned uploads)

Run this via AWS CLI or Cloudflare API:

```bash
aws s3api put-bucket-cors \
  --bucket slideforge \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }]
  }' \
  --endpoint-url "https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
```

Replace `<ACCOUNT_ID>` with your Cloudflare account ID.

---

## 4. Better Auth (Authentication)

Better Auth is already configured in the codebase (`src/infrastructure/auth/auth.ts`). You just need to provide the secret and URL.

Generate a secret:

```bash
openssl rand -base64 32
```

---

## 5. Environment Variables

Create a `.env.local` file in the project root:

```env
# ── Database (Neon) ──────────────────────────────────────
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ── Auth (Better Auth) ───────────────────────────────────
BETTER_AUTH_SECRET="<paste-generated-secret-here>"
BETTER_AUTH_URL="http://localhost:3000"

# ── Storage (Cloudflare R2) ──────────────────────────────
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_BUCKET_NAME="slideforge"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-xxx.r2.dev"

# ── Dev Bypass (skip auth during development) ────────────
DEV_BYPASS_AUTH=true
NEXT_PUBLIC_DEV_BYPASS_AUTH=true
```

> **Note**: Never commit `.env.local` to git. Remove the `DEV_BYPASS_AUTH` lines before production.

### Quick Start (Minimal .env.local)

If you just want to get running without setting up R2, use this:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="anything-at-least-32-chars-long-for-dev"
BETTER_AUTH_URL="http://localhost:3000"
DEV_BYPASS_AUTH=true
NEXT_PUBLIC_DEV_BYPASS_AUTH=true
```

R2 and auth are bypassed. You can explore the UI immediately. Media uploads will fail until R2 is configured.

---

## 6. Push Database Schema

Run once to create all tables in Neon:

```bash
bun run db:push
```

This uses Drizzle Kit to push the schema from `src/infrastructure/database/schema/*.ts` directly to your Neon database. No migration files needed for development.

You should see output like:

```
[✓] Your SQL migration file ➜ drizzle/migrations/0000_tranquil_madame_masque.sql
```

**Alternative — Generate migrations then migrate:**

```bash
bun run db:generate   # Creates migration files in drizzle/migrations/
bun run db:migrate    # Applies migrations
```

---

## 7. Run the Dev Server

```bash
bun run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

### With Dev Bypass Enabled

When `DEV_BYPASS_AUTH=true` is set:

- No login/register required — all routes are accessible immediately
- You're logged in as "Dev User" with admin role
- All API routes accept the dev session automatically
- The top-right avatar shows "DU" for Dev User

### What to do first

1. Go to `http://localhost:3000/dashboard` directly (no login needed)
2. Go to `/slideshows` → create your first slideshow
3. Click into the editor → start adding text, images, shapes
4. Browse `/templates`, `/media`, `/exports`, `/admin`

> When ready to test real auth, set `DEV_BYPASS_AUTH=false` and register normally at `/register`.

---

## 8. Run the Render Worker (Optional)

The render worker is a separate process that picks up export jobs and renders them with Remotion. Needed for video exports (MP4, WebM, GIF, ProRes).

```bash
cd render-worker
bun install
bun start
```

The worker polls the database every 5 seconds for queued export jobs.

---

## 9. Useful Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate migration files |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:studio` | Open Drizzle Studio (browser-based DB viewer) |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run lint` | Run ESLint |

---

## 10. Creating an Admin User

After registering, promote your user to admin directly in the database:

```bash
bun run db:studio
```

Or via Neon SQL Editor:

```sql
UPDATE user_profiles SET role = 'admin' WHERE id = '<your-user-id>';
```

Then visit `/admin` to access the admin dashboard.

---

## 11. Troubleshooting

### `DATABASE_URL` not set
Make sure `.env.local` exists in the project root (not a subdirectory).

### `bun run db:push` times out
Make sure your connection string uses the **pooled** connection. In Neon dashboard → Connect → pick "Pooled connection".

### R2 upload fails
- Verify CORS is configured on the bucket
- Check your API token has **Object Read & Write** permissions
- Confirm `CLOUDFLARE_R2_ACCOUNT_ID` matches your actual account ID

### Remotion render fails
- Make sure FFmpeg is installed: `ffmpeg -version`
- The render worker must be running: `cd render-worker && bun start`
- Check `CLOUDFLARE_R2_*` env vars are set correctly (the worker uploads to R2)

### Port 3000 already in use
```bash
bun run dev -- -p 3001
```

---

## Project Structure (Quick Reference)

```
slideforge/
├── src/
│   ├── domain/              # Pure domain logic (entities, VOs, repo interfaces)
│   ├── application/         # Use cases (commands & queries)
│   ├── infrastructure/      # DB, auth, storage, rendering implementations
│   ├── presentation/        # React components, hooks, Zustand stores
│   ├── remotion/            # Remotion compositions (video rendering)
│   ├── app/                 # Next.js App Router pages & API routes
│   ├── components/ui/       # shadcn/ui components
│   └── lib/                 # Utilities (api-auth, utils)
├── render-worker/           # Separate process for video rendering
├── drizzle/                 # Generated migrations
├── drizzle.config.ts        # Drizzle Kit config
├── package.json             # Dependencies & scripts
└── .env.local               # Environment variables (you create this)
```

---

## Next Steps

- [Neon Docs](https://neon.com/docs) — database management
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/) — storage configuration
- [Better Auth Docs](https://www.better-auth.com/) — authentication features
- [Remotion Docs](https://www.remotion.dev/docs) — video rendering
- [Drizzle ORM Docs](https://orm.drizzle.team/) — database queries
