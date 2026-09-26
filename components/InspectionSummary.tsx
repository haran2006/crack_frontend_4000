import { DetectionSummary } from "@/types/detection";

export default function InspectionSummary({ summary }: { summary: DetectionSummary }) {
  const stats = [
    { label: "Total images", value: String(summary.imagesAnalyzed) },
    { label: "Images with cracks", value: String(summary.imagesWithCracks) },
    { label: "Total detected regions", value: String(summary.totalRegions) },
    { label: "Average confidence", value: `${summary.averageConfidence}%` },
    { label: "Highest severity", value: summary.highestSeverity },
  ];

  return (
    <div>
      <h4 className="font-display font-semibold mb-4">Inspection summary</h4>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <p className="font-display text-xl font-semibold">{stat.value}</p>
            <p className="text-[11px] text-ink-muted mt-1 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
