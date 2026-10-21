import type { Theme } from "@template-generator/shared/types/template";
import { type ThemeRecord } from "@/api/client";
import { useEditorStore } from "@/store/editor-store";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useDeleteTheme, useThemes } from "@/api/hooks/themes";

export function ThemePresetPicker() {
  const confirm = useConfirm();
  const currentThemeName = useEditorStore((s) => s.template?.theme.name);
  const updateTheme = useEditorStore((s) => s.updateTheme);

  const { data: records = [] } = useThemes();
  const deleteMutation = useDeleteTheme();

  const applyTheme = (theme: Theme) => updateTheme(theme);

  const handleDelete = async (record: ThemeRecord) => {
    if (record.isBuiltin) return;
    const ok = await confirm({
      title: `Supprimer le thème « ${record.name} » ?`,
      consequences: [
        "Il ne sera plus proposé dans la liste des thèmes.",
        "Les templates qui l'utilisent gardent leurs couleurs.",
      ],
      confirmLabel: "Supprimer le thème",
      tone: "danger",
    });
    if (ok) deleteMutation.mutate(record.id);
  };

  return (
    <div className="px-4 pb-2">
      <p className="text-xs text-gray-500 mb-2">Un clic applique le thème ; vous pouvez ensuite l'ajuster.</p>
      <div className="grid grid-cols-2 gap-2">
        {records.map((record) => {
          const isActive = currentThemeName === record.theme.name;
          return (
            <div key={record.id} className="relative group">
              <button
                onClick={() => applyTheme(record.theme)}
                className={`w-full text-left p-2 rounded border transition-colors ${
                  isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-1 mb-1.5">
                  {[
                    record.theme.colors.primary,
                    record.theme.colors.accent,
                    record.theme.colors.success,
                    record.theme.colors.warning,
                    record.theme.colors.background,
                  ].map((color, i) => (
                    <div
                      key={i}
                      style={{ backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)" }}
                      className="w-4 h-4 rounded-sm"
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">{record.theme.name}</p>
              </button>

              {!record.isBuiltin && (
                <button
                  onClick={() => void handleDelete(record)}
                  className="absolute top-1 right-1 hidden group-hover:flex w-4 h-4 items-center justify-center text-gray-400 hover:text-red-500 text-xs"
                  title="Supprimer ce thème"
                  aria-label={`Supprimer le thème ${record.name}`}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
