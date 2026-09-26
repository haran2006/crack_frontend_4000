"use client";

import { useMemo, useState } from "react";
import { DetectionRun } from "@/types/detection";
import ResultCard from "@/components/ResultCard";
import InspectionSummary from "@/components/InspectionSummary";
import ImageViewer from "@/components/ImageViewer";
import ConfidenceThreshold from "@/components/ConfidenceThreshold";

const DEFAULT_THRESHOLD = 5;

export default function DetectionResults({ run, onReset }: { run: DetectionRun; onReset: () => void }) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const { results, summary } = run;

  const { visibleCount, filteredCount } = useMemo(() => {
    let visible = 0;
    let total = 0;
    for (const result of results) {
      for (const region of result.regions) {
        total += 1;
        if (region.confidence * 100 >= threshold) visible += 1;
      }
    }
    return { visibleCount: visible, filteredCount: total - visible };
  }, [results, threshold]);

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="font-display text-xl font-semibold">Detection results</h3>
        <button
          onClick={onReset}
          className="text-sm text-ink-muted hover:text-ink transition-colors focus-ring rounded px-1"
        >
          Run a new scan
        </button>
      </div>

      <div className="glass rounded-2xl px-5 py-4 mb-6 flex flex-wrap gap-x-8 gap-y-3">
        <BarStat label="Images analyzed" value={String(summary.imagesAnalyzed)} />
        <BarStat label="Cracks detected" value={String(summary.totalRegions)} />
        <BarStat label="Visible detections" value={String(visibleCount)} />
        <BarStat label="Filtered detections" value={String(filteredCount)} />
        <BarStat label="Processing time" value={`${summary.processingTimeSeconds}s`} />
        <BarStat label="Model" value={summary.model} />
      </div>

      <ConfidenceThreshold value={threshold} onChange={setThreshold} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {results.map((result, index) => (
          <ResultCard
            key={result.id}
            result={result}
            index={index}
            onOpenViewer={() => setViewerIndex(index)}
            threshold={threshold}
          />
        ))}
      </div>

      <InspectionSummary summary={summary} />

      {viewerIndex !== null && (
        <ImageViewer
          results={results}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          threshold={threshold}
        />
      )}
    </div>
  );
}

function BarStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium truncate max-w-[180px]">{value}</p>
      <p className="text-[11px] text-ink-muted mt-0.5">{label}</p>
    </div>
  );
}