import { useState, type ElementType } from "react";
import * as LucideIcons from "lucide-react";

// Curated list of common icons
const ICON_NAMES = [
  "AlertCircle", "AlertTriangle", "Archive", "ArrowDown", "ArrowLeft", "ArrowRight",
  "ArrowUp", "Award", "BarChart", "BarChart2", "BarChart3", "Bell", "BookOpen",
  "Bookmark", "Briefcase", "Building", "Calendar", "CheckCircle", "CheckSquare",
  "ChevronDown", "ChevronRight", "Circle", "Clipboard", "Clock", "Cloud",
  "Code", "Cog", "Download", "Edit", "Eye", "File", "FileText", "Flag",
  "Folder", "Globe", "Hash", "Heart", "Home", "Image", "Info",
  "Layers", "Layout", "Link", "List", "Lock", "Mail",
  "MapPin", "Menu", "MessageCircle", "Minus", "Monitor",
  "Moon", "MoreHorizontal", "Package", "Pencil", "Phone", "Plus",
  "Power", "Printer", "RefreshCw", "Search", "Send", "Settings",
  "Share", "Shield", "ShoppingCart", "Star", "Sun", "Tag",
  "Target", "Trash", "TrendingUp", "TrendingDown", "Upload", "User",
  "Users", "Wifi", "X", "XCircle", "Zap",
];

interface Props {
  label: string;
  value: string;
  onChange: (v: unknown) => void;
}

export function IconPropField({ label, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const current = (value as string | undefined) ?? "";

  const filtered = query
    ? ICON_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase()))
    : ICON_NAMES;

  const CurrentIcon = current ? (LucideIcons as Record<string, ElementType>)[current] : null;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs border border-gray-200 rounded hover:border-gray-300 bg-white"
      >
        {CurrentIcon ? (
          <>
            <CurrentIcon size={14} className="text-gray-600 shrink-0" />
            <span className="text-gray-900">{current}</span>
          </>
        ) : (
          <span className="text-gray-400">Sélectionner une icône…</span>
        )}
        <span className="ml-auto text-gray-400">▾</span>
      </button>

      {open && (
        <div className="mt-1 border border-gray-200 rounded shadow-lg bg-white z-50 relative">
          <div className="p-1.5 border-b border-gray-100">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-52 p-1.5">
            <div className="grid grid-cols-6 gap-1">
              {filtered.map((name) => {
                const Icon = (LucideIcons as Record<string, ElementType>)[name];
                if (!Icon) return null;
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
                      name === current
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate w-full text-center leading-none">{name}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="col-span-6 text-xs text-gray-400 text-center py-3">Aucun résultat</p>
              )}
            </div>
          </div>
          {current && (
            <div className="border-t border-gray-100 p-1.5">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="w-full py-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
