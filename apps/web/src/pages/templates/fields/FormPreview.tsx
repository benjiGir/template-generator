import { useState } from "react";
import { FormFieldGroup } from "@/components/document/FormFieldGroup";
import { groupOrder } from "@template-generator/shared/utils/field-detection";
import type { EditableField } from "@template-generator/shared/types/template";

/** Le formulaire que verra le contributeur dans le Studio ; les saisies d'essai ne sont pas enregistrées */
export function FormPreview({ fields }: { fields: EditableField[] }) {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [active, setActive] = useState<string | null>(null);

  const groups = groupOrder(fields);
  const ungroupedOnly = groups.length === 1 && groups[0] === null;

  if (fields.length === 0) {
    return <p className="py-8 text-center text-xs text-gray-500">Aucun champ retenu : le formulaire du Studio serait vide.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="rounded-md bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
        Voici le formulaire du Studio. Vous pouvez l'essayer : rien n'est enregistré.
      </p>
      {groups.map((g) => (
        <FormFieldGroup
          key={g ?? "__"}
          group={ungroupedOnly ? null : g ?? "Autres champs"}
          fields={fields.filter((f) => (f.group ?? null) === g)}
          data={data}
          onUpdate={(key, value) => setData((d) => ({ ...d, [key]: value }))}
          activeKey={active}
          onFocusField={(f) => setActive(`${f.nodeId}.${f.propKey}`)}
        />
      ))}
    </div>
  );
}
