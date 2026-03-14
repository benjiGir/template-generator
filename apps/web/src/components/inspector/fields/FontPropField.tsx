import { useState, useEffect, useRef } from "react";

const SYSTEM_FONTS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
];

const GOOGLE_FONTS = [
  "DM Sans",
  "Fira Code",
  "Inter",
  "Lato",
  "Merriweather",
  "Montserrat",
  "Open Sans",
  "Playfair Display",
  "Plus Jakarta Sans",
  "Raleway",
  "Roboto",
  "Source Code Pro",
];

const ALL_FONTS = [...SYSTEM_FONTS, ...GOOGLE_FONTS].sort((a, b) => a.localeCompare(b));
const GOOGLE_FONT_SET = new Set(GOOGLE_FONTS);
const injected = new Set<string>();

function injectGoogleFont(font: string) {
  if (!GOOGLE_FONT_SET.has(font) || injected.has(font)) return;
  injected.add(font);
  const link = document.createElement("style");
  link.textContent = `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;600;700&display=swap');`;
  document.head.appendChild(link);
}

interface Props {
  label: string;
  value: string;
  onChange: (v: unknown) => void;
}

export function FontPropField({ label, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = (value as string | undefined) ?? "";

  useEffect(() => {
    if (current) injectGoogleFont(current);
  }, [current]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? ALL_FONTS.filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    : ALL_FONTS;

  const select = (font: string) => {
    injectGoogleFont(font);
    onChange(font);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs border border-gray-200 rounded hover:border-gray-300 bg-white"
        style={{ fontFamily: current || undefined }}
      >
        <span className={current ? "text-gray-900" : "text-gray-400"}>
          {current || "Sélectionner une police…"}
        </span>
        <span className="text-gray-400 ml-1">▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg"
          style={{ top: "100%" }}
        >
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
          <ul className="overflow-y-auto max-h-48">
            {filtered.map((font) => (
              <li key={font}>
                <button
                  type="button"
                  onClick={() => select(font)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                    font === current ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                  {GOOGLE_FONT_SET.has(font) && (
                    <span className="ml-1 text-[10px] text-gray-400">G</span>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2.5 py-2 text-xs text-gray-400 text-center">Aucun résultat</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
