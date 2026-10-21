import { useState } from "react";

const COMMON_EMOJIS = [
  "✅",
  "⚡",
  "🚀",
  "🐛",
  "📊",
  "📈",
  "📉",
  "🎯",
  "💡",
  "🔧",
  "⚠️",
  "❌",
  "🟢",
  "🟡",
  "🔴",
  "🔵",
  "⭐",
  "🏆",
  "💪",
  "🔥",
  "📋",
  "🗓️",
  "👥",
  "💬",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function EmojiPropField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-xl w-9 h-9 flex items-center justify-center border border-rule rounded hover:border-tpl transition-colors"
        >
          {value || "—"}
        </button>
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ou saisissez un emoji"
          className="flex-1 px-2.5 py-1.5 text-xs border border-rule rounded focus:outline-none focus:border-focus"
        />
      </div>
      {open && (
        <div className="flex flex-wrap gap-1 p-2 border border-rule rounded bg-paper">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              className="text-base w-7 h-7 flex items-center justify-center rounded hover:bg-tpl-tint transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
