"use client";

import { useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

const DEFAULT_THRESHOLD = 5;

export default function ConfidenceThreshold({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  function clamp(n: number) {
    return Math.min(100, Math.max(0, Math.round(n)));
  }

  function commitDraft() {
    const parsed = parseInt(draft, 10);
    onChange(Number.isNaN(parsed) ? value : clamp(parsed));
    setEditing(false);
  }

  return (
    <div className="glass rounded-2xl px-5 py-4 mb-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div>
          <p className="text-sm font-medium">Confidence threshold</p>
          <p className="text-[11px] text-ink-muted mt-0.5">Filter detections below this confidence</p>
        </div>
        {value !== DEFAULT_THRESHOLD && (
          <button
            onClick={() => onChange(DEFAULT_THRESHOLD)}
            className="inline-flex items-center gap-1 text-[11px] text-ink-faint hover:text-ink-muted transition-colors focus-ring rounded px-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <button
          onClick={() => onChange(clamp(value - 1))}
          aria-label="Decrease threshold by 1 percent"
          className="p-1.5 rounded-lg border border-border-strong text-ink-muted hover:text-ink hover:bg-white/5 transition-colors focus-ring shrink-0"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          aria-label="Detection confidence threshold"
          aria-valuetext={`${value}%`}
          className="flex-1 accent-slider"
        />

        <button
          onClick={() => onChange(clamp(value + 1))}
          aria-label="Increase threshold by 1 percent"
          className="p-1.5 rounded-lg border border-border-strong text-ink-muted hover:text-ink hover:bg-white/5 transition-colors focus-ring shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {editing ? (
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commitDraft}
            onKeyDown={(e) => e.key === "Enter" && commitDraft()}
            className="w-14 text-center text-sm font-mono bg-white/5 border border-border-strong rounded-lg py-1 focus-ring"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
            className="w-14 text-center text-sm font-mono text-ink shrink-0 focus-ring rounded-lg py-1 hover:bg-white/5"
          >
            {value}%
          </button>
        )}
      </div>
    </div>
  );
}