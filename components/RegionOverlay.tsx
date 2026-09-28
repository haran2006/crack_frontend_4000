import { CrackRegion } from "@/types/detection";

// Normalise any className the backend might send → one of: "crack" | "damaged" | "nocrack"
function normalise(raw?: string): "crack" | "damaged" | "nocrack" {
  const s = (raw ?? "").trim().toLowerCase();
  // No-crack variants:  "n", "nil", "no crack", "no_crack", "nocrack"
  if (s === "n" || s === "nil" || s === "no crack" || s === "no_crack" || s === "nocrack") {
    return "nocrack";
  }
  // Damaged variants
  if (s === "damaged") {
    return "damaged";
  }
  // Crack variants: "crack", "crack-dedection-2", "crack-detection-2", or anything with "crack"
  if (s.includes("crack")) {
    return "crack";
  }
  // Fallback — treat unknown as no-crack so we never falsely alarm
  return "nocrack";
}

function classColor(className?: string): { border: string; fill: string } {
  const type = normalise(className);
  if (type === "damaged") {
    return { border: "#a855f7", fill: "rgba(168,85,247,0.18)" }; // Purple
  }
  if (type === "nocrack") {
    return { border: "#3b82f6", fill: "rgba(59,130,246,0.18)" }; // Blue
  }
  // crack → Red
  return { border: "#ef4444", fill: "rgba(239,68,68,0.18)" };
}

function friendlyLabel(className?: string): string {
  const type = normalise(className);
  if (type === "nocrack") return "No Crack";
  if (type === "damaged") return "Damaged";
  return "Crack";
}

export default function RegionOverlay({
  regions,
  threshold = 0,
}: {
  regions: CrackRegion[];
  threshold?: number;
}) {
  const visibleRegions = regions.filter(
    (region) => region.confidence * 100 >= threshold
  );

  if (visibleRegions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {visibleRegions.map((region) => {
        const color = classColor(region.className);
        const label = friendlyLabel(region.className);
        const pct = Math.round(region.confidence * 100);

        return (
          <div
            key={region.id}
            className="absolute transition-all duration-150"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
              border: `2px solid ${color.border}`,
              backgroundColor: color.fill,
              boxShadow: `0 0 8px ${color.border}88`,
              borderRadius: "3px",
            }}
          >
            <span
              className="absolute -top-[18px] left-0 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-t whitespace-nowrap"
              style={{
                backgroundColor: color.border,
                color: "#fff",
                lineHeight: "1.2",
              }}
            >
              {label} {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}