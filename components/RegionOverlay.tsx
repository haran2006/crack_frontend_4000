import { CrackRegion } from "@/types/detection";

// Colour palette per class — mirrors YOLO's default colour scheme.
// Indexed by a simple hash of the class name so each class always gets
// the same colour regardless of detection order.
function classColor(className?: string): { border: string; fill: string; label: string } {
  const name = className ?? "";
  if (name.includes("damaged")) {
    return { border: "#a855f7", fill: "rgba(168,85,247,0.18)", label: "#a855f7" }; // Purple
  }
  if (name === "n") {
    return { border: "#3b82f6", fill: "rgba(59,130,246,0.18)", label: "#3b82f6" }; // Blue
  }
  // default (crack-dedection-2) → red
  return { border: "#ef4444", fill: "rgba(239,68,68,0.18)", label: "#ef4444" }; // Red
}

function friendlyLabel(className?: string): string {
  if (!className) return "Crack";
  if (className === "crack-dedection-2") return "Crack";
  if (className === "damaged") return "Damaged";
  if (className === "n") return "NIL";
  return className;
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
            {/* Label chip — same style as YOLO result.plot() */}
            <span
              className="absolute -top-[18px] left-0 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-t whitespace-nowrap"
              style={{
                backgroundColor: color.border,
                color: "#000",
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