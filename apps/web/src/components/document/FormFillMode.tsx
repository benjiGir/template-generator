import { useDocumentStore } from "@/store/document-store";
import { ComponentRenderer } from "@template-generator/component-registry/renderer";
import { FormField } from "./FormField";
import { FormFieldGroup } from "./FormFieldGroup";
import type { EditableField } from "@template-generator/shared/types/template";

export function FormFillMode() {
  const editableFields = useDocumentStore((s) => s.editableFields);
  const data = useDocumentStore((s) => s.data);
  const updateField = useDocumentStore((s) => s.updateField);
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);

  const mergedTemplate = getMergedTemplate();

  // Group fields
  const grouped = new Map<string, EditableField[]>();
  for (const field of editableFields) {
    const g = field.group ?? "Général";
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(field);
  }

  const isGrouped = grouped.size > 1 || !grouped.has("Général");

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: form */}
      <div className="w-[420px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-5">
        {editableFields.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Ce template n'a aucun champ éditable configuré.
          </p>
        ) : isGrouped ? (
          <div className="space-y-3">
            {Array.from(grouped.entries()).map(([group, fields]) => (
              <FormFieldGroup
                key={group}
                group={group}
                fields={fields}
                data={data}
                onUpdate={updateField}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(grouped.get("Général") ?? []).map((field) => (
              <FormField
                key={`${field.nodeId}.${field.propKey}`}
                field={field}
                value={data[`${field.nodeId}.${field.propKey}`]}
                onChange={(v) => updateField(`${field.nodeId}.${field.propKey}`, v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: live preview */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <p className="text-xs text-gray-400 text-center mb-4">Aperçu en temps réel</p>
        {mergedTemplate?.pages.map((page) => (
          <div
            key={page.id}
            data-doc-page
            className="mx-auto bg-white shadow-md mb-6 overflow-hidden"
            style={{
              width:           mergedTemplate.pageFormat.width,
              minHeight:       mergedTemplate.pageFormat.height,
              padding:         mergedTemplate.pageFormat.padding,
              fontFamily:      mergedTemplate.theme.typography.fontFamily,
              fontSize:        mergedTemplate.theme.typography.baseFontSize,
              color:           mergedTemplate.theme.colors.text,
              backgroundColor: mergedTemplate.theme.colors.background,
            }}
          >
            {page.children.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
                Page vide
              </div>
            ) : (
              page.children.map((node) => (
                <ComponentRenderer key={node.id} node={node} theme={mergedTemplate.theme} />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
