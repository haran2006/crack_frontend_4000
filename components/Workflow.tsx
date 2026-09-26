import { ScanLine, ScanEye, LineChart, Box, Wrench } from "lucide-react";

const STEPS = [
  { label: "Inspect", icon: ScanLine, text: "Capture images of the structure" },
  { label: "Detect", icon: ScanEye, text: "AI identifies visible cracks" },
  { label: "Analyze", icon: LineChart, text: "Review severity and confidence" },
  { label: "Digitize", icon: Box, text: "Map findings to a digital twin" },
  { label: "Maintain", icon: Wrench, text: "Plan maintenance ahead of failure" },
];

export default function Workflow() {
  return (
    <section className="px-4 py-20 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center">
          Inspect → Detect → Analyze → Digitize → Maintain
        </h2>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-6 relative">
          <div
            className="hidden sm:block absolute top-5 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
            aria-hidden="true"
          />
          {STEPS.map((step) => (
            <div key={step.label} className="relative flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl glass grid place-items-center relative z-10">
                <step.icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-sm font-medium">{step.label}</p>
              <p className="mt-1 text-xs text-ink-muted max-w-[9rem]">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
