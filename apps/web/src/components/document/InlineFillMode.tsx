import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Lock, SkipForward, X } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { PreviewPane } from "@/components/document-view/PreviewPane";
import { SegmentedProgress } from "@/components/ui/SegmentedProgress";
import { computeCompletion, fieldKey, isFilled } from "@template-generator/shared/utils/fields";
import { FormField } from "./FormField";
import type { EditableField } from "@template-generator/shared/types/template";

/** Le composant le plus proche (vers le haut) sous l'élément cliqué ou survolé */
function nodeIdFrom(target: EventTarget | null): string | null {
  let el = target as HTMLElement | null;
  while (el) {
    const id = el.dataset?.["nodeId"];
    if (id) return id;
    el = el.parentElement;
  }
  return null;
}

/**
 * Remplir directement dans la page : le document occupe tout l'espace,
 * les zones remplissables s'ouvrent sur place, le reste est verrouillé.
 */
export function InlineFillMode() {
  const editableFields = useDocumentStore((s) => s.editableFields);
  const data = useDocumentStore((s) => s.data);
  const updateField = useDocumentStore((s) => s.updateField);
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [lockedNotice, setLockedNotice] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const mergedTemplate = getMergedTemplate();
  const completion = computeCompletion(editableFields, data);

  // Champs par composant ; un composant est remplissable s'il porte au moins un champ
  const fieldsByNode = useMemo(() => {
    const map = new Map<string, EditableField[]>();
    for (const f of editableFields) map.set(f.nodeId, [...(map.get(f.nodeId) ?? []), f]);
    return map;
  }, [editableFields]);
  const editableIds = useMemo(() => Array.from(fieldsByNode.keys()), [fieldsByNode]);

  /** Remonte jusqu'au composant remplissable qui contient la cible (une carte dans sa rangée…) */
  const editableAncestor = (target: EventTarget | null): string | null => {
    let el = target as HTMLElement | null;
    while (el) {
      const id = nodeIdFrom(el);
      if (!id) return null;
      if (fieldsByNode.has(id)) return id;
      el = (el.closest(`[data-node-id="${CSS.escape(id)}"]`)?.parentElement as HTMLElement | null) ?? null;
    }
    return null;
  };

  const handleClick = (e: React.MouseEvent) => {
    const id = editableAncestor(e.target);
    if (id) {
      setSelected(id);
      setLockedNotice(false);
      return;
    }
    setSelected(null);
    // Un clic sur une partie verrouillée reçoit une réponse, pas le silence
    if (nodeIdFrom(e.target)) {
      setLockedNotice(true);
      clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setLockedNotice(false), 2500);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  // Prochain champ vide, dans l'ordre du formulaire, après le composant ouvert
  const goToNextEmpty = () => {
    const empty = editableFields.filter((f) => !isFilled(data[fieldKey(f)]));
    if (empty.length === 0) return;
    const currentOrder = selected ? Math.max(...(fieldsByNode.get(selected) ?? []).map((f) => f.order)) : -1;
    const next = empty.find((f) => f.order > currentOrder) ?? empty[0]!;
    setSelected(next.nodeId);
  };

  if (!mergedTemplate) return null;

  const selectedFields = selected ? fieldsByNode.get(selected) ?? [] : [];
  const remaining = completion.total - completion.filled;

  const panel = selected && selectedFields.length > 0 && (
    <div className="rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <span className="text-xs font-semibold text-gray-700">
          {selectedFields.length > 1 ? `Modifier ces ${selectedFields.length} contenus` : "Modifier ce contenu"}
        </span>
        <button onClick={() => setSelected(null)} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Fermer (Échap)">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-[360px] space-y-2 overflow-y-auto px-3 py-2">
        {selectedFields.map((field) => (
          <FormField
            key={fieldKey(field)}
            field={field}
            value={data[fieldKey(field)]}
            onChange={(v) => updateField(fieldKey(field), v)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-5 py-2 text-xs">
        <div className="flex w-56 items-center gap-2">
          <div className="flex-1"><SegmentedProgress filled={completion.filled} total={completion.total} /></div>
          <span className="shrink-0 font-mono text-gray-700">{completion.filled} / {completion.total}</span>
        </div>
        <span className="text-gray-600">
          {remaining === 0 ? "Tout est rempli" : `Encore ${remaining} champ${remaining > 1 ? "s" : ""}`}
          {completion.missingRequired.length > 0 && (
            <span className="text-amber-700"> · {completion.missingRequired.length} obligatoire{completion.missingRequired.length > 1 ? "s" : ""} vide{completion.missingRequired.length > 1 ? "s" : ""}</span>
          )}
        </span>
        {remaining > 0 && (
          <button onClick={goToNextEmpty} className="flex items-center gap-1 rounded px-2 py-1 font-medium text-doc-strong hover:bg-doc-tint">
            <SkipForward size={13} />
            Champ vide suivant
          </button>
        )}
        <button
          onClick={() => setReveal((r) => !r)}
          aria-pressed={reveal}
          className={`ml-auto flex items-center gap-1.5 rounded px-2 py-1 ${reveal ? "bg-white text-ink" : "text-gray-600 hover:bg-gray-100"}`}
        >
          {reveal ? <EyeOff size={13} /> : <Eye size={13} />}
          {reveal ? "Masquer les zones modifiables" : "Révéler les zones modifiables"}
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1"
        onMouseOver={(e) => setHovered(editableAncestor(e.target))}
        onMouseLeave={() => setHovered(null)}
      >
        <PreviewPane
          template={mergedTemplate}
          highlightNodeId={selected ?? hovered}
          highlightTone="doc"
          outlineNodeIds={reveal ? editableIds : undefined}
          outlineTone="doc"
          framed
          onBackgroundClick={handleClick}
          anchoredPanel={panel || undefined}
        />
        {lockedNotice && (
          <div role="status" className="pointer-events-none absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg">
            <Lock size={12} />
            Cette partie fait partie du template : elle ne se modifie pas ici.
          </div>
        )}
        {!selected && !reveal && hovered === null && (
          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1 text-[11px] text-gray-500 shadow ring-1 ring-gray-200">
            Survolez le document : les zones modifiables s'encadrent. Cliquez pour les modifier.
          </p>
        )}
      </div>
    </div>
  );
}
