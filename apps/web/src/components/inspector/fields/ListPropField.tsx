interface Props {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}

export function ListPropField({ label, value, onChange }: Props) {
  const items = value ?? [];

  const update = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...items, ""]);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-white"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-gray-400 hover:text-red-500 text-sm leading-none px-1"
              title="Supprimer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 w-full py-1 text-xs text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition-colors"
      >
        + Ajouter
      </button>
    </div>
  );
}
