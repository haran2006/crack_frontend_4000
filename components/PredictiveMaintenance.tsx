const TIMELINE = [
  "Inspection",
  "Crack detected",
  "Severity analysis",
  "Historical comparison",
  "Maintenance recommendation",
];

const INPUTS = [
  "Crack history",
  "Crack severity",
  "Crack growth",
  "Inspection frequency",
  "Environmental conditions",
  "Structural information",
  "Sensor data",
];

export default function PredictiveMaintenance() {
  return (
    <section id="predictive-maintenance" className="px-4 py-20 border-t border-border">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] tracking-wide px-2.5 py-1 rounded-full glass text-ink-muted">
            Next generation module
          </span>
          <span className="text-[11px] tracking-wide px-2.5 py-1 rounded-full glass text-ink-muted">
            Coming soon
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-semibold">Predictive maintenance</h2>
        <p className="mt-2 text-ink-muted max-w-lg">
          Move from detecting damage to understanding what should happen next.
        </p>

        <p className="mt-6 text-sm text-ink-muted max-w-xl">
          The future system can combine {INPUTS.join(", ").toLowerCase()} to help identify maintenance
          priorities. Today, the platform focuses on crack detection — the interface below shows what the
          predictive workflow will look like once historical and sensor data are connected.
        </p>

        <div className="mt-10 glass rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-0">
            {TIMELINE.map((stage, i) => (
              <div key={stage} className="flex sm:flex-1 items-center gap-3">
                <div className="flex flex-col items-center sm:flex-1">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-accent/50 bg-bg" />
                  <span className="mt-2 text-xs text-ink-muted text-center max-w-[7rem]">{stage}</span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <span className="hidden sm:block flex-1 h-px bg-gradient-to-r from-accent/40 to-border mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
