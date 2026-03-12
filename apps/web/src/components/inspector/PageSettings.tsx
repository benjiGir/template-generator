import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";

export function PageSettings() {
  const template = useEditorStore((s) => s.template);
  const selectedPageIndex = useEditorStore((s) => s.selectedPageIndex);
  const addPage = useEditorStore((s) => s.addPage);
  const removePage = useEditorStore((s) => s.removePage);
  const updateTemplateMeta = useEditorStore((s) => s.updateTemplateMeta);

  const page = template?.pages[selectedPageIndex];

  const [label, setLabel] = useState(page?.label ?? "");
  useEffect(() => { setLabel(page?.label ?? ""); }, [page?.label]);

  if (!template || !page) return null;

  const handleLabelBlur = () => {
    if (!template) return;
    // Mettre à jour le label de la page via une mutation du template
    const updatedPages = template.pages.map((p, i) =>
      i === selectedPageIndex ? { ...p, label } : p
    );
    // On passe par updateTemplateMeta pour déclencher un snapshot d'historique
    // mais on a besoin d'un accès direct. On utilise le store directement.
    useEditorStore.setState((s) => {
      if (!s.template) return s;
      const pages = s.template.pages.map((p, i) =>
        i === selectedPageIndex ? { ...p, label } : p
      );
      return { template: { ...s.template, pages }, isDirty: true };
    });
  };

  const canDelete = template.pages.length > 1;

  return (
    <div className="space-y-5 p-4">
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Page {selectedPageIndex + 1}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleLabelBlur}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <button
          onClick={addPage}
          className="w-full py-1.5 text-xs text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition-colors"
        >
          + Ajouter une page
        </button>
        {canDelete && (
          <button
            onClick={() => removePage(selectedPageIndex)}
            className="w-full py-1.5 text-xs text-red-500 border border-dashed border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            Supprimer cette page
          </button>
        )}
      </section>
    </div>
  );
}
