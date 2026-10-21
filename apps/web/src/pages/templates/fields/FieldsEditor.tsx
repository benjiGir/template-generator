import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS as DndCSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, FolderPlus, GripVertical, Plus, X } from "lucide-react";
import { fieldKey } from "@template-generator/shared/utils/fields";
import {
  groupOrder,
  normalizeFieldOrder,
  toEditable,
  type DetectedField,
} from "@template-generator/shared/utils/field-detection";
import type { EditableField } from "@template-generator/shared/types/template";

export type RetainedField = EditableField & { location: string };

type Item = { id: string; kind: "group"; name: string | null } | { id: string; kind: "field"; field: RetainedField };

const NO_GROUP = "__sans-groupe__";
const groupId = (name: string | null) => `g:${name ?? NO_GROUP}`;

interface Props {
  retained: RetainedField[];
  excluded: DetectedField[];
  onChange: (fields: EditableField[]) => void;
  /** Composant désigné (survol d'une ligne ou clic dans le document) */
  focusedNodeId: string | null;
  onHoverNode: (nodeId: string | null) => void;
  onSelectNode: (nodeId: string) => void;
}

/** Retire l'emplacement (affichage seulement) avant d'enregistrer */
function strip(fields: RetainedField[]): EditableField[] {
  return fields.map(({ location: _location, ...f }) => f);
}

export function FieldsEditor({ retained, excluded, onChange, focusedNodeId, onHoverNode, onSelectNode }: Props) {
  const [extraGroups, setExtraGroups] = useState<string[]>([]);
  const [excludedOpen, setExcludedOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Liste à plat : en-têtes de groupe puis leurs champs, dans l'ordre du formulaire
  const groups = groupOrder(retained);
  const hasNamedGroups = groups.some((g) => g !== null) || extraGroups.length > 0;
  const items: Item[] = [];
  for (const g of groups) {
    if (hasNamedGroups) items.push({ id: groupId(g), kind: "group", name: g });
    for (const f of retained.filter((x) => (x.group ?? null) === g))
      items.push({ id: fieldKey(f), kind: "field", field: f });
  }
  for (const g of extraGroups) if (!groups.includes(g)) items.push({ id: groupId(g), kind: "group", name: g });

  const commit = (fields: RetainedField[]) => onChange(normalizeFieldOrder(strip(fields)));
  const update = (key: string, patch: Partial<EditableField>) =>
    commit(retained.map((f) => (fieldKey(f) === key ? { ...f, ...patch } : f)));

  // Un champ déposé prend le groupe de l'en-tête qui le précède
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    const moved = arrayMove(items, from, to);
    let current: string | null = null;
    const next: RetainedField[] = [];
    for (const item of moved) {
      if (item.kind === "group") current = item.name;
      else next.push({ ...item.field, group: current ?? undefined, order: next.length });
    }
    commit(next);
  };

  const renameGroup = (from: string | null, to: string) => {
    const name = to.trim();
    if (!name || name === from) return;
    setExtraGroups((gs) => gs.map((g) => (g === from ? name : g)));
    commit(retained.map((f) => ((f.group ?? null) === from ? { ...f, group: name } : f)));
  };

  /** Action « dissoudre » d'un groupe nommé ; aucune pour les champs sans groupe */
  const dissolveFor = (name: string | null) => (name ? () => dissolveGroup(name) : undefined);

  const dissolveGroup = (name: string) => {
    setExtraGroups((gs) => gs.filter((g) => g !== name));
    commit(retained.map((f) => (f.group === name ? { ...f, group: undefined } : f)));
  };

  const addGroup = () => {
    let name = "Nouveau groupe";
    for (let i = 2; groups.includes(name) || extraGroups.includes(name); i++) name = `Nouveau groupe ${i}`;
    setExtraGroups((gs) => [...gs, name]);
  };

  // Un contenu ajouté rejoint son groupe d'origine s'il existe, sinon la fin du formulaire
  const include = (d: DetectedField) => {
    const field = { ...toEditable(d, 0), location: d.location };
    const target = d.group && groups.includes(d.group) ? d.group : null;
    const lastIndex = target ? retained.map((f) => f.group).lastIndexOf(target) : -1;
    const next = [...retained];
    if (lastIndex >= 0) next.splice(lastIndex + 1, 0, { ...field, group: target ?? undefined });
    else next.push(field);
    commit(next.map((f, i) => ({ ...f, order: i })));
  };

  const remove = (key: string) => commit(retained.filter((f) => fieldKey(f) !== key));

  // Composant désigné dans le document : on amène ses champs à l'écran
  useEffect(() => {
    if (!focusedNodeId) return;
    if (!retained.some((f) => f.nodeId === focusedNodeId) && excluded.some((f) => f.nodeId === focusedNodeId))
      setExcludedOpen(true);
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector(`[data-row-node="${CSS.escape(focusedNodeId)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedNodeId]);

  const requiredCount = retained.filter((f) => f.required).length;

  return (
    <div ref={listRef} className="space-y-4" onMouseLeave={() => onHoverNode(null)}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-800">{retained.length}</span> champ{retained.length > 1 ? "s" : ""}{" "}
          retenu{retained.length > 1 ? "s" : ""}
          {requiredCount > 0 && (
            <>
              {" "}
              · {requiredCount} obligatoire{requiredCount > 1 ? "s" : ""}
            </>
          )}
        </p>
        <button
          onClick={addGroup}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
        >
          <FolderPlus size={13} />
          Ajouter un groupe
        </button>
      </div>

      {retained.length === 0 && extraGroups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500">
          Aucun champ retenu : le Studio n'aura rien à remplir. Cochez des contenus ci-dessous ou cliquez sur une zone
          du document.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {items.map((item) =>
                item.kind === "group" ? (
                  <GroupHeader
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    count={retained.filter((f) => (f.group ?? null) === item.name).length}
                    onRename={(to) => renameGroup(item.name, to)}
                    onDissolve={dissolveFor(item.name)}
                  />
                ) : (
                  <FieldRow
                    key={item.id}
                    field={item.field}
                    focused={item.field.nodeId === focusedNodeId}
                    onHover={() => onHoverNode(item.field.nodeId)}
                    onSelect={() => onSelectNode(item.field.nodeId)}
                    onRename={(label) => update(item.id, { label })}
                    onToggleRequired={() => update(item.id, { required: !item.field.required })}
                    onRemove={() => remove(item.id)}
                  />
                ),
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <section className="rounded-lg border border-gray-200">
        <button
          onClick={() => setExcludedOpen((o) => !o)}
          aria-expanded={excludedOpen}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <span className="flex items-center gap-1.5">
            {excludedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Contenus non retenus
          </span>
          <span className="font-normal text-gray-400">{excluded.length}</span>
        </button>
        {excludedOpen && (
          <div className="border-t border-gray-100 px-2 pb-2 pt-1">
            <p className="px-1 pb-2 text-[11px] text-gray-500">
              Ces textes resteront fixes dans tous les documents. Ajoutez ceux qui doivent changer à chaque édition.
            </p>
            {excluded.length === 0 && <p className="px-1 text-[11px] text-gray-400">Tous les contenus sont retenus.</p>}
            {excluded.map((d) => (
              <div
                key={fieldKey(d)}
                data-row-node={d.nodeId}
                onMouseEnter={() => onHoverNode(d.nodeId)}
                onClick={() => onSelectNode(d.nodeId)}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${d.nodeId === focusedNodeId ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"}`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    include(d);
                  }}
                  title="Ajouter au formulaire"
                  aria-label={`Ajouter ${d.label} au formulaire`}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-gray-400 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Plus size={12} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-gray-700">{d.label}</p>
                  <p className="truncate text-[10px] text-gray-400">{d.location}</p>
                </div>
                {!d.suggested && (
                  <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                    structure
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GroupHeader({
  id,
  name,
  count,
  onRename,
  onDissolve,
}: {
  id: string;
  name: string | null;
  count: number;
  onRename: (to: string) => void;
  onDissolve?: () => void;
}) {
  const { setNodeRef, transform, transition } = useSortable({ id, disabled: true });
  const [draft, setDraft] = useState(name ?? "");
  useEffect(() => setDraft(name ?? ""), [name]);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: DndCSS.Transform.toString(transform), transition }}
      className="group/header flex items-center gap-2 border-b border-gray-200 pb-1 pt-3 first:pt-0"
    >
      {name === null ? (
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Sans groupe</span>
      ) : (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => (draft.trim() ? onRename(draft) : setDraft(name))}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          aria-label="Nom du groupe"
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-700 hover:border-gray-200 focus:border-blue-400 focus:bg-white focus:outline-none"
        />
      )}
      <span className="text-[10px] text-gray-400">{count === 0 ? "vide — glissez des champs ici" : count}</span>
      {onDissolve && (
        <button
          onClick={onDissolve}
          title="Supprimer le groupe (ses champs sont conservés)"
          aria-label={`Supprimer le groupe ${name}`}
          className="rounded p-0.5 text-gray-300 opacity-0 hover:text-gray-600 group-hover/header:opacity-100"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function FieldRow({
  field,
  focused,
  onHover,
  onSelect,
  onRename,
  onToggleRequired,
  onRemove,
}: {
  field: RetainedField;
  focused: boolean;
  onHover: () => void;
  onSelect: () => void;
  onRename: (label: string) => void;
  onToggleRequired: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fieldKey(field) });
  const style: CSSProperties = {
    transform: DndCSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-row-node={field.nodeId}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={`flex items-start gap-1.5 rounded-md border px-1.5 py-1.5 ${
        focused ? "border-blue-300 bg-blue-50" : "border-transparent hover:border-gray-200 hover:bg-gray-50"
      } ${isDragging ? "relative z-10 shadow-md" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        title="Déplacer"
        aria-label={`Déplacer ${field.label}`}
        className="mt-1 cursor-grab touch-none rounded p-0.5 text-gray-300 hover:text-gray-600 active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <input
          value={field.label}
          onChange={(e) => onRename(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Libellé du champ"
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-medium text-gray-900 hover:border-gray-200 focus:border-blue-400 focus:bg-white focus:outline-none"
        />
        <p className="truncate px-1 text-[10px] text-gray-400">{field.location}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleRequired();
        }}
        aria-pressed={field.required}
        title={field.required ? "Obligatoire : la relecture signalera ce champ s'il est vide" : "Rendre obligatoire"}
        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
          field.required
            ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
            : "text-gray-400 ring-1 ring-gray-200 hover:text-gray-700"
        }`}
      >
        Obligatoire
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Retirer du formulaire (le texte restera fixe)"
        aria-label={`Retirer ${field.label}`}
        className="mt-0.5 shrink-0 rounded p-0.5 text-gray-300 hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}
