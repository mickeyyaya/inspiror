import type { BlockParam } from "../../types/block";

interface ParamEditorProps {
  param: BlockParam;
  onChange: (key: string, value: string | number | boolean) => void;
}

export function ParamEditor({ param, onChange }: ParamEditorProps) {
  const handleChange = (value: string | number | boolean) => {
    onChange(param.key, value);
  };

  switch (param.type) {
    case "number":
      return (
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#222] min-w-[80px]">
            {param.label}
          </label>
          <input
            type="range"
            min={param.min ?? 0}
            max={param.max ?? 100}
            step={param.step ?? 1}
            value={Number(param.value)}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="flex-1 accent-[var(--color-candy-purple)]"
            aria-label={param.label}
          />
          <span className="text-xs font-mono font-bold text-[#555] min-w-[36px] text-right">
            {param.value}
          </span>
        </div>
      );

    case "color":
      return (
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#222] min-w-[80px]">
            {param.label}
          </label>
          <input
            type="color"
            value={String(param.value)}
            onChange={(e) => handleChange(e.target.value)}
            className="w-8 h-8 rounded-lg border-2 border-[#222] cursor-pointer"
            aria-label={param.label}
          />
          <span className="text-xs font-mono text-[#555]">{param.value}</span>
        </div>
      );

    case "string":
      return (
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#222] min-w-[80px]">
            {param.label}
          </label>
          <input
            type="text"
            value={String(param.value)}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 px-2 py-1 rounded-lg border-2 border-[#222] text-xs font-mono bg-white shadow-[2px_2px_0_#222]"
            aria-label={param.label}
          />
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#222] min-w-[80px]">
            {param.label}
          </label>
          <button
            onClick={() => handleChange(!param.value)}
            className={`w-10 h-6 rounded-full border-2 border-[#222] transition-colors relative ${
              param.value ? "bg-[#39ff14]" : "bg-gray-300"
            }`}
            aria-label={`${param.label}: ${param.value ? "on" : "off"}`}
            role="switch"
            aria-checked={Boolean(param.value)}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-[#222] transition-transform ${
                param.value ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      );

    case "enum":
      return (
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#222] min-w-[80px]">
            {param.label}
          </label>
          <select
            value={String(param.value)}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 px-2 py-1 rounded-lg border-2 border-[#222] text-xs font-bold bg-white shadow-[2px_2px_0_#222]"
            aria-label={param.label}
          >
            {(param.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return null;
  }
}
