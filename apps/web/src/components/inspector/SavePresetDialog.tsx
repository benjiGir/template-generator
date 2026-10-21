import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";

interface Props {
  onSave: (label: string) => void;
  onCancel: () => void;
}

export function SavePresetDialog({ onSave, onCancel }: Props) {
  const [label, setLabel] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave(label.trim());
  };

  return (
    <Dialog labelledBy="save-preset-title" onClose={onCancel} className="max-w-xs p-5">
      <h2 id="save-preset-title" className="mb-3 text-sm font-semibold text-ink">
        Sauvegarder comme preset
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Nom du preset">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. KPI Succès vert" />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" tone="preset" size="sm" disabled={!label.trim()}>
            Sauvegarder
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
