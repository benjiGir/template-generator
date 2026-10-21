import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function PageSettings() {
  const template = useEditorStore((s) => s.template);
  const selectedPageIndex = useEditorStore((s) => s.selectedPageIndex);
  const addPage = useEditorStore((s) => s.addPage);
  const removePage = useEditorStore((s) => s.removePage);
  const renamePage = useEditorStore((s) => s.renamePage);

  const page = template?.pages[selectedPageIndex];

  const [label, setLabel] = useState(page?.label ?? "");
  useEffect(() => {
    setLabel(page?.label ?? "");
  }, [page?.label]);

  if (!template || !page) return null;

  const handleLabelBlur = () => renamePage(selectedPageIndex, label);

  const canDelete = template.pages.length > 1;

  return (
    <div className="space-y-5 p-4">
      <section>
        <h3 className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-3">
          Page {selectedPageIndex + 1}
        </h3>
        <div className="space-y-3">
          <Field label="Nom">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={handleLabelBlur} />
          </Field>
        </div>
      </section>

      <section className="space-y-2">
        <Button variant="dashed" tone="tpl" size="sm" block onClick={addPage}>
          + Ajouter une page
        </Button>
        {canDelete && (
          <Button variant="dashed" tone="danger" size="sm" block onClick={() => removePage(selectedPageIndex)}>
            Supprimer cette page
          </Button>
        )}
      </section>
    </div>
  );
}
