import { sql } from "drizzle-orm";
import { pgTable, uuid, text, jsonb, timestamp, boolean, integer, check } from "drizzle-orm/pg-core";
import type {
  Theme,
  PageFormat,
  TemplatePage,
  EditableField,
  PublishedVersion,
} from "@template-generator/shared/types/template";
import type { ComponentCategory, PropValues } from "@template-generator/shared/types/component";
import type { DocumentSnapshot } from "@template-generator/shared/types/document";

/** Statuts d'un document ; une contrainte en base refuse toute autre valeur */
export const DOCUMENT_STATUSES = ["draft", "finalized"] as const;

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  theme: jsonb("theme").notNull().$type<Theme>(),
  pageFormat: jsonb("page_format").notNull().$type<PageFormat>(),
  pages: jsonb("pages").notNull().$type<TemplatePage[]>(),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  publishedVersion: jsonb("published_version").$type<PublishedVersion>(),
  editableFields: jsonb("editable_fields").default([]).notNull().$type<EditableField[]>(),
  tags: jsonb("tags").default([]).notNull().$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const componentPresets = pgTable("component_presets", {
  id: uuid("id").primaryKey().defaultRandom(),
  baseType: text("base_type").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  defaultProps: jsonb("default_props").notNull().$type<PropValues>(),
  category: text("category").$type<ComponentCategory>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  theme: jsonb("theme").notNull().$type<Theme>(),
  isBuiltin: boolean("is_builtin").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Le document embarque son snapshot : supprimer le template ne le casse pas
    templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    data: jsonb("data").notNull().$type<PropValues>(),
    templateSnapshot: jsonb("template_snapshot").notNull().$type<DocumentSnapshot>(),
    status: text("status", { enum: DOCUMENT_STATUSES }).default("draft").notNull(),
    completionPercent: integer("completion_percent").default(0).notNull(),
    exportedAt: timestamp("exported_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [check("documents_status_check", sql`${t.status} in ('draft', 'finalized')`)],
);
