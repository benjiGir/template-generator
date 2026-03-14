import { useEditorStore } from "@/store/editor-store";

const COLOR_KEYS = [
  { key: "primary",       label: "Primaire" },
  { key: "primaryLight",  label: "Primaire clair" },
  { key: "accent",        label: "Accent" },
  { key: "accentLight",   label: "Accent clair" },
  { key: "success",       label: "Succès" },
  { key: "successLight",  label: "Succès clair" },
  { key: "warning",       label: "Avertissement" },
  { key: "warningLight",  label: "Avertissement clair" },
  { key: "danger",        label: "Danger" },
  { key: "dangerLight",   label: "Danger clair" },
  { key: "text",          label: "Texte" },
  { key: "textLight",     label: "Texte clair" },
  { key: "textMuted",     label: "Texte atténué" },
  { key: "background",    label: "Fond" },
  { key: "backgroundAlt", label: "Fond alternatif" },
  { key: "border",        label: "Bordure" },
  { key: "borderLight",   label: "Bordure claire" },
] as const;

export function TemplateSettings() {
  const template = useEditorStore((s) => s.template);
  const updateTemplateMeta = useEditorStore((s) => s.updateTemplateMeta);
  const updateTheme = useEditorStore((s) => s.updateTheme);
  const updatePageFormat = useEditorStore((s) => s.updatePageFormat);

  if (!template) return null;

  return (
    <div className="p-4 space-y-5">
      {/* Méta */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Template</p>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500">Nom</label>
          <input
            type="text"
            defaultValue={template.name}
            onBlur={(e) => updateTemplateMeta(e.target.value, template.description)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            defaultValue={template.description ?? ""}
            onBlur={(e) => updateTemplateMeta(template.name, e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>
      </div>

      {/* Couleurs */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Couleurs</p>
        {COLOR_KEYS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <input
              type="color"
              value={template.theme.colors[key]}
              onChange={(e) => updateTheme({ colors: { ...template.theme.colors, [key]: e.target.value } })}
              className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5"
            />
            <span className="text-xs text-gray-600">{label}</span>
            <span className="text-xs text-gray-400 ml-auto font-mono">{template.theme.colors[key]}</span>
          </div>
        ))}
      </div>

      {/* Format de page */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Format de page</p>
        {(["width", "height", "padding"] as const).map((field) => (
          <div key={field} className="space-y-1">
            <label className="text-xs text-gray-500 capitalize">{field}</label>
            <input
              type="text"
              defaultValue={template.pageFormat[field]}
              onBlur={(e) => updatePageFormat({ [field]: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
