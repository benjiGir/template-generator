import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { ICON_NAMES, ICONS, IconByName } from "@template-generator/component-registry/icons";
import { Button } from "@/components/ui/Button";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function IconPropField({ label, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const current = value;

  const filtered = query ? ICON_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase())) : ICON_NAMES;

  return (
    <div>
      <label className="block text-xs font-medium text-ink-muted mb-1.5">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs border border-rule rounded hover:border-rule-strong bg-white"
      >
        {ICONS.has(current) ? (
          <>
            <IconByName name={current} fallback={HelpCircle} size={14} className="text-ink-muted shrink-0" />
            <span className="text-ink">{current}</span>
          </>
        ) : (
          <span className="text-ink-faint">Sélectionner une icône…</span>
        )}
        <span className="ml-auto text-ink-faint">▾</span>
      </button>

      {open && (
        <div className="mt-1 border border-rule rounded shadow-lg bg-white z-50 relative">
          <div className="p-1.5 border-b border-wash">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-full px-2 py-1 text-xs border border-rule rounded focus:outline-none focus:border-focus"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-52 p-1.5">
            <div className="grid grid-cols-6 gap-1">
              {filtered.map((name) => {
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded text-[10px] transition-colors ${
                      name === current ? "bg-tpl-tint text-tpl-strong" : "hover:bg-wash text-ink-muted"
                    }`}
                  >
                    <IconByName name={name} fallback={HelpCircle} size={14} />
                    <span className="truncate w-full text-center leading-none">{name}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="col-span-6 text-xs text-ink-faint text-center py-3">Aucun résultat</p>
              )}
            </div>
          </div>
          {current && (
            <div className="border-t border-wash p-1.5">
              <Button
                variant="ghost"
                tone="danger"
                size="sm"
                block
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Effacer
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
