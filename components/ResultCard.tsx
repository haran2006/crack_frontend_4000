"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Maximize2, MoveHorizontal, Download } from "lucide-react";
import { DetectionResult } from "@/types/detection";
import { cn } from "@/lib/utils";
import RegionOverlay from "@/components/RegionOverlay";
import ComparisonSlider from "@/components/ComparisonSlider";

export default function ResultCard({
  result,
  index,
  onOpenViewer,
  threshold = 0,
}: {
  result: DetectionResult;
  index: number;
  onOpenViewer: () => void;
  threshold?: number;
}) {
  const [compareMode, setCompareMode] = useState(false);

  // Always count only the regions visible at the current threshold
  const visibleRegions = result.regions.filter((r) => r.confidence * 100 >= threshold);

  return (
    <div className="glass rounded-2xl p-5 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <p className="text-xs text-ink-faint font-mono">
            Image #{String(index + 1).padStart(2, "0")}
          </p>
          <p className="text-sm truncate max-w-[200px]">{result.fileName}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Download the raw YOLO annotated image if available */}
          {result.annotatedUrl && (
            <a
              href={result.annotatedUrl}
              download={`yolo_${result.fileName}`}
              title="Download YOLO annotated image"
              className="p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-white/5 transition-colors focus-ring"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border",
              result.hasCrack
                ? "bg-signal-danger/10 text-signal-danger border-signal-danger/30"
                : "bg-signal-success/10 text-signal-success border-signal-success/30"
            )}
          >
            {result.hasCrack ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            {result.hasCrack ? "Crack detected" : "No crack detected"}
          </span>
        </div>
      </div>

      {/* ── Image panes ── */}
      {compareMode ? (
        <ComparisonSlider
          imageUrl={result.imageUrl}
          regions={result.regions}
          altText={result.fileName}
          threshold={threshold}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Original image */}
          <ImagePane label="Original" onClick={onOpenViewer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.imageUrl}
              alt={`${result.fileName} original`}
              className="w-full h-full object-cover"
            />
          </ImagePane>

          {/* AI prediction — original image + live threshold-reactive overlay */}
          <ImagePane label="AI prediction" accent onClick={onOpenViewer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.imageUrl}
              alt={`${result.fileName} prediction`}
              className="w-full h-full object-cover"
            />
            {/* RegionOverlay reacts to threshold instantly */}
            <RegionOverlay regions={result.regions} threshold={threshold} />
          </ImagePane>
        </div>
      )}

      {/* ── Controls ── */}
      <button
        onClick={() => setCompareMode((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink focus-ring rounded px-1"
      >
        <MoveHorizontal className="w-3.5 h-3.5" />
        {compareMode ? "Show side by side" : "Compare"}
      </button>

      {/* ── Stats ── */}
      <dl className="mt-4 grid grid-cols-3 gap-3 text-center border-t border-border pt-4">
        <Stat label="Visible regions" value={String(visibleRegions.length)} />
        <Stat label="Confidence" value={`${result.confidence}%`} />
        <Stat label="Severity" value={result.severity} />
      </dl>
      {result.hasCrack && (
        <p className="mt-3 text-xs text-ink-muted">
          Estimated crack length: <span className="text-ink">{result.crackLengthMeters} m</span>
        </p>
      )}
    </div>
  );
}

function ImagePane({
  label,
  accent,
  children,
  onClick,
}: {
  label: string;
  accent?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div>
      <p className={cn("text-[11px] mb-1.5 tracking-wide", accent ? "text-accent" : "text-ink-muted")}>
        {label}
      </p>
      <button
        onClick={onClick}
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/5 group focus-ring"
      >
        {children}
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors grid place-items-center">
          <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium">{value}</p>
      <p className="text-[11px] text-ink-muted mt-0.5">{label}</p>
    </div>
  );
}