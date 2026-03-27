CREATE TYPE "public"."processing_status" AS ENUM('pending', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."aspect_ratio" AS ENUM('16:9', '9:16', '4:3', '1:1');--> statement-breakpoint
CREATE TYPE "public"."occasion_type" AS ENUM('birthday', 'wedding', 'anniversary', 'memorial', 'graduation', 'baby_shower', 'family_recap', 'holiday', 'presentation', 'custom');--> statement-breakpoint
CREATE TYPE "public"."slideshow_status" AS ENUM('draft', 'exporting', 'completed', 'failed');--> statement-breakpoint
ALTER TYPE "public"."canvas_object_type" ADD VALUE 'group';--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "slideshow_id" text;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "processing_status" "processing_status" DEFAULT 'ready' NOT NULL;--> statement-breakpoint
ALTER TABLE "slideshows" ADD COLUMN "occasion_type" "occasion_type" DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE "slideshows" ADD COLUMN "status" "slideshow_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "slideshows" ADD COLUMN "aspect_ratio" "aspect_ratio" DEFAULT '16:9' NOT NULL;--> statement-breakpoint
ALTER TABLE "slideshows" ADD COLUMN "cover_asset_id" text;--> statement-breakpoint
ALTER TABLE "slideshows" ADD COLUMN "theme" jsonb;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "background" jsonb;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "layout_id" text;--> statement-breakpoint
ALTER TABLE "canvas_objects" ADD COLUMN "group_id" text;--> statement-breakpoint
ALTER TABLE "canvas_objects" ADD COLUMN "source_asset_id" text;--> statement-breakpoint
ALTER TABLE "canvas_objects" ADD COLUMN "animation" jsonb;--> statement-breakpoint
ALTER TABLE "audio_tracks" ADD COLUMN "trim_start_frame" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "audio_tracks" ADD COLUMN "trim_end_frame" integer;