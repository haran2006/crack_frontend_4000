import { Box } from "lucide-react";

const CAPABILITIES = [
  "Photogrammetry",
  "3D reconstruction",
  "Computer vision",
  "Crack mapping",
  "Structural inspection history",
  "Sensor data",
];

export default function DigitalTwin() {
  return (
    <section id="digital-twin" className="px-4 py-20 border-t border-border">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] tracking-wide glass text-ink-muted mb-4">
            Coming soon
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-balance">Digital twin</h2>
          <p className="mt-3 text-ink-muted max-w-md">
            Transform inspection data into a living digital representation of your infrastructure.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {CAPABILITIES.map((cap) => (
              <li key={cap} className="text-xs px-3 py-1.5 rounded-full border border-border text-ink-muted">
                {cap}
              </li>
            ))}
          </ul>

          <button
            disabled
            className="mt-8 px-5 py-3 rounded-xl glass text-ink-muted text-sm font-medium cursor-not-allowed"
          >
            Join digital twin preview — coming soon
          </button>
        </div>

        <div className="relative aspect-square glass-strong rounded-2xl p-6 overflow-hidden">
          <div className="absolute inset-0 blueprint-bg" aria-hidden="true" />
          <svg viewBox="0 0 320 320" className="relative w-full h-full" role="img" aria-label="Digital twin building model">
            <g stroke="#2FD3E8" strokeOpacity="0.55" strokeWidth="1" fill="none">
              <path d="M80,260 L80,120 L160,80 L240,120 L240,260 Z" />
              <path d="M80,120 L160,160 L240,120" />
              <path d="M160,160 L160,260" />
              <path d="M80,160 L160,200 L240,160" />
              <path d="M80,200 L160,240 L240,200" />
            </g>
            {[
              [80, 160],
              [160, 200],
              [240, 160],
              [160, 80],
              [160, 240],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={3.5} fill="#2FD3E8" />
            ))}
          </svg>

          <div className="absolute top-5 left-5 flex items-center gap-2 text-[10px] tracking-[0.12em] text-ink-faint">
            <Box className="w-3.5 h-3.5" />
            BUILDING MODEL
          </div>
          <div className="absolute bottom-5 left-5 text-[10px] tracking-[0.12em] text-ink-faint">
            INSPECTION DATA · CRACK MAP
          </div>
        </div>
      </div>
    </section>
  );
}
