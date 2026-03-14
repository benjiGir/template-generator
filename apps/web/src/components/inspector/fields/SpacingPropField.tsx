import { useState } from "react";
import type { SpacingValue } from "@template-generator/shared/types/component";

interface Props {
  label: string;
  value: SpacingValue;
  onChange: (v: unknown) => void;
}

const EMPTY: SpacingValue = { top: 0, right: 0, bottom: 0, left: 0 };

export function SpacingPropField({ label, value, onChange }: Props) {
  const val: SpacingValue = { ...EMPTY, ...((value as SpacingValue | undefined) ?? {}) };
  const [linked, setLinked] = useState(false);

  const update = (side: keyof SpacingValue, n: number) => {
    if (linked) {
      onChange({ top: n, right: n, bottom: n, left: n });
    } else {
      onChange({ ...val, [side]: n });
    }
  };

  const inputCls =
    "w-full px-1.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-white text-center";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <button
          type="button"
          title={linked ? "Délier les côtés" : "Lier les côtés"}
          onClick={() => setLinked((l) => !l)}
          className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
            linked
              ? "bg-blue-50 border-blue-300 text-blue-600"
              : "border-gray-200 text-gray-400 hover:border-gray-300"
          }`}
        >
          {linked ? "⛓" : "⛓‍💥"}
        </button>
      </div>

      {/* Box model layout */}
      <div className="grid grid-rows-3 gap-1">
        {/* Top */}
        <div className="flex justify-center">
          <div className="w-14">
            <input
              type="number"
              value={val.top}
              onChange={(e) => update("top", Number(e.target.value))}
              className={inputCls}
              title="Top"
            />
            <p className="text-center text-[10px] text-gray-400 mt-0.5">top</p>
          </div>
        </div>

        {/* Left / visual box / Right */}
        <div className="flex items-center gap-1">
          <div className="w-14">
            <input
              type="number"
              value={val.left}
              onChange={(e) => update("left", Number(e.target.value))}
              className={inputCls}
              title="Left"
            />
            <p className="text-center text-[10px] text-gray-400 mt-0.5">left</p>
          </div>
          <div
            className="flex-1 h-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
            style={{ minWidth: 0 }}
          >
            <span className="text-[10px] text-gray-300">px</span>
          </div>
          <div className="w-14">
            <input
              type="number"
              value={val.right}
              onChange={(e) => update("right", Number(e.target.value))}
              className={inputCls}
              title="Right"
            />
            <p className="text-center text-[10px] text-gray-400 mt-0.5">right</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex justify-center">
          <div className="w-14">
            <input
              type="number"
              value={val.bottom}
              onChange={(e) => update("bottom", Number(e.target.value))}
              className={inputCls}
              title="Bottom"
            />
            <p className="text-center text-[10px] text-gray-400 mt-0.5">bottom</p>
          </div>
        </div>
      </div>
    </div>
  );
}
