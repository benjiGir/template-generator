CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"theme" jsonb NOT NULL,
	"is_builtin" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
