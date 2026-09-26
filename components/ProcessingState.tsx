"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Image uploaded",
  "Image preprocessing",
  "Detecting structural cracks",
  "Generating prediction",
  "Preparing results",
];

const STEP_INTERVAL_MS = 500;

export default function ProcessingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass rounded-2xl p-8 sm:p-10 max-w-lg mx-auto">
      <div className="relative w-full h-36 rounded-xl bg-white/[0.03] border border-border overflow-hidden mb-7">
        <div className="absolute inset-0 blueprint-bg opacity-60" aria-hidden="true" />
        <div
          className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-accent/25 to-transparent animate-scan"
          aria-hidden="true"
        />
      </div>

      <h3 className="font-display text-lg font-semibold">Analyzing infrastructure…</h3>

      <ul className="mt-5 space-y-2.5">
        {STEPS.map((label, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "w-4 h-4 rounded-full grid place-items-center shrink-0 border",
                  done && "bg-signal-success/20 border-signal-success text-signal-success",
                  current && !done && "border-accent text-accent",
                  !done && !current && "border-border text-transparent"
                )}
              >
                {done ? <Check className="w-2.5 h-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <span className={done || current ? "text-ink" : "text-ink-faint"}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
