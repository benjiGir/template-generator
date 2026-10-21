ALTER TABLE "documents" DROP CONSTRAINT "documents_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "completion_percent" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "completion_percent" SET DATA TYPE integer USING round((completion_percent #>> '{}')::numeric)::integer;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "completion_percent" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "exported_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "published_version" jsonb;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "templates" SET
  "published_at" = "updated_at",
  "published_version" = jsonb_build_object(
    'name', "name",
    'description', "description",
    'theme', "theme",
    'pageFormat', "page_format",
    'pages', "pages",
    'editableFields', "editable_fields"
  )
WHERE "published" = true;--> statement-breakpoint
UPDATE "documents" SET "exported_at" = "updated_at" WHERE "status" = 'finalized';
