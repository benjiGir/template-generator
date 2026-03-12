import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import type { Theme, PageFormat, TemplatePage } from "@template-generator/shared/types/template";

export const templates = pgTable("templates", {
  id:          uuid("id").primaryKey().defaultRandom(),
  name:        text("name").notNull(),
  description: text("description"),
  theme:       jsonb("theme").notNull().$type<Theme>(),
  pageFormat:  jsonb("page_format").notNull().$type<PageFormat>(),
  pages:       jsonb("pages").notNull().$type<TemplatePage[]>(),
  createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const componentPresets = pgTable("component_presets", {
  id:           uuid("id").primaryKey().defaultRandom(),
  baseType:     text("base_type").notNull(),
  label:        text("label").notNull(),
  description:  text("description"),
  defaultProps: jsonb("default_props").notNull(),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id:               uuid("id").primaryKey().defaultRandom(),
  templateId:       uuid("template_id").references(() => templates.id),
  name:             text("name").notNull(),
  data:             jsonb("data").notNull(),
  templateSnapshot: jsonb("template_snapshot").notNull(),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});