import { pgTable, uuid, text, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import type { Theme, PageFormat, TemplatePage, EditableField } from "@template-generator/shared/types/template";

export const templates = pgTable("templates", {
  id:             uuid("id").primaryKey().defaultRandom(),
  name:           text("name").notNull(),
  description:    text("description"),
  theme:          jsonb("theme").notNull().$type<Theme>(),
  pageFormat:     jsonb("page_format").notNull().$type<PageFormat>(),
  pages:          jsonb("pages").notNull().$type<TemplatePage[]>(),
  published:      boolean("published").default(false).notNull(),
  editableFields: jsonb("editable_fields").default([]).notNull().$type<EditableField[]>(),
  tags:           jsonb("tags").default([]).notNull().$type<string[]>(),
  createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const componentPresets = pgTable("component_presets", {
  id:           uuid("id").primaryKey().defaultRandom(),
  baseType:     text("base_type").notNull(),
  label:        text("label").notNull(),
  description:  text("description"),
  defaultProps: jsonb("default_props").notNull(),
  category:     text("category"),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const themes = pgTable("themes", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      text("name").notNull(),
  theme:     jsonb("theme").notNull().$type<Theme>(),
  isBuiltin: boolean("is_builtin").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id:                uuid("id").primaryKey().defaultRandom(),
  templateId:        uuid("template_id").references(() => templates.id),
  name:              text("name").notNull(),
  data:              jsonb("data").notNull(),
  templateSnapshot:  jsonb("template_snapshot").notNull(),
  status:            text("status").default("draft").notNull(),
  completionPercent: jsonb("completion_percent").default(0).notNull(),
  updatedAt:         timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt:         timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});