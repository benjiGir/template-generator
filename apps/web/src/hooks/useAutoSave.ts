import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { api } from "@/api/client";

export function useAutoSave() {
  const template = useEditorStore((s) => s.template);
  const isDirty = useEditorStore((s) => s.isDirty);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || !template) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const saved = await api.templates.update(template.id, {
          name: template.name,
          description: template.description,
          theme: template.theme,
          pageFormat: template.pageFormat,
          pages: template.pages,
        });
        loadTemplate(saved);
      } catch (e) {
        console.error("Auto-save failed:", e);
      } finally {
        setSaving(false);
      }
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, template, loadTemplate]);

  return { saving };
}
