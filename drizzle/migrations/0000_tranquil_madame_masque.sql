CREATE TYPE "public"."media_type" AS ENUM('image', 'audio');--> statement-breakpoint
CREATE TYPE "public"."resolution" AS ENUM('720p', '1080p');--> statement-breakpoint
CREATE TYPE "public"."canvas_object_type" AS ENUM('image', 'text', 'shape');--> statement-breakpoint
CREATE TYPE "public"."transition_type" AS ENUM('none', 'fade', 'slide', 'zoom', 'dissolve', 'wipe');--> statement-breakpoint
CREATE TYPE "public"."export_format" AS ENUM('mp4', 'webm', 'gif', 'prores');--> statement-breakpoint
CREATE TYPE "public"."export_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."template_category" AS ENUM('party', 'funeral', 'wedding', 'birthday', 'corporate', 'other');--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"bio" text,
	"role" text DEFAULT 'user' NOT NULL,
	"storage_used_bytes" integer DEFAULT 0 NOT NULL,
	"storage_quota_bytes" integer DEFAULT 5368709120 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "media_type" NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"width" integer,
	"height" integer,
	"duration_ms" integer,
	"folder_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slideshows" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'Untitled Slideshow' NOT NULL,
	"description" text,
	"resolution" "resolution" DEFAULT '1080p' NOT NULL,
	"fps" integer DEFAULT 30 NOT NULL,
	"background_color" text DEFAULT '#000000' NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slides" (
	"id" text PRIMARY KEY NOT NULL,
	"slideshow_id" text NOT NULL,
	"order" integer NOT NULL,
	"duration_frames" integer DEFAULT 150 NOT NULL,
	"background_color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canvas_objects" (
	"id" text PRIMARY KEY NOT NULL,
	"slide_id" text NOT NULL,
	"type" "canvas_object_type" NOT NULL,
	"x" integer DEFAULT 0 NOT NULL,
	"y" integer DEFAULT 0 NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"rotation" integer DEFAULT 0 NOT NULL,
	"opacity" integer DEFAULT 100 NOT NULL,
	"z_index" integer DEFAULT 0 NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transitions" (
	"id" text PRIMARY KEY NOT NULL,
	"slideshow_id" text NOT NULL,
	"from_slide_id" text NOT NULL,
	"to_slide_id" text NOT NULL,
	"type" "transition_type" DEFAULT 'fade' NOT NULL,
	"duration_frames" integer DEFAULT 30 NOT NULL,
	"easing" text DEFAULT 'ease-in-out' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audio_tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"slideshow_id" text NOT NULL,
	"media_asset_id" text NOT NULL,
	"track_index" integer DEFAULT 0 NOT NULL,
	"start_frame" integer DEFAULT 0 NOT NULL,
	"end_frame" integer NOT NULL,
	"volume" integer DEFAULT 100 NOT NULL,
	"fade_in_frames" integer DEFAULT 0 NOT NULL,
	"fade_out_frames" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "export_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"slideshow_id" text NOT NULL,
	"format" "export_format" NOT NULL,
	"resolution" "resolution" NOT NULL,
	"status" "export_status" DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"output_storage_key" text,
	"output_url" text,
	"file_size_bytes" integer,
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "template_category" NOT NULL,
	"thumbnail_url" text,
	"slideshow_data" jsonb NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_slideshow_id_slideshows_id_fk" FOREIGN KEY ("slideshow_id") REFERENCES "public"."slideshows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canvas_objects" ADD CONSTRAINT "canvas_objects_slide_id_slides_id_fk" FOREIGN KEY ("slide_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transitions" ADD CONSTRAINT "transitions_slideshow_id_slideshows_id_fk" FOREIGN KEY ("slideshow_id") REFERENCES "public"."slideshows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transitions" ADD CONSTRAINT "transitions_from_slide_id_slides_id_fk" FOREIGN KEY ("from_slide_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transitions" ADD CONSTRAINT "transitions_to_slide_id_slides_id_fk" FOREIGN KEY ("to_slide_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_tracks" ADD CONSTRAINT "audio_tracks_slideshow_id_slideshows_id_fk" FOREIGN KEY ("slideshow_id") REFERENCES "public"."slideshows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_tracks" ADD CONSTRAINT "audio_tracks_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_slideshow_id_slideshows_id_fk" FOREIGN KEY ("slideshow_id") REFERENCES "public"."slideshows"("id") ON DELETE no action ON UPDATE no action;