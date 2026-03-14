ALTER TABLE "documents" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "completion_percent" jsonb DEFAULT '0'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;