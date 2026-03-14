import { useCallback, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { api } from "@/api/client";

export function useTemplateSave() {
  const template = useEditorStore((s) => s.template);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const isDirty = useEditorStore((s) => s.isDirty);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    if (!template || saving) return;
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
      console.error("Erreur sauvegarde:", e);
    } finally {
      setSaving(false);
    }
  }, [template, loadTemplate, saving]);

  return { save, saving, isDirty };
}
