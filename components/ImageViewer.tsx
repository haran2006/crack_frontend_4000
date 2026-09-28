"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { DetectionResult } from "@/types/detection";
import RegionOverlay from "@/components/RegionOverlay";

export default function ImageViewer({
  results,
  index,
  onClose,
  onNavigate,
  threshold = 0,
}: {
  results: DetectionResult[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  threshold?: number;
}) {
  const [zoom, setZoom] = useState(1);
  const current = results[index];

  useEffect(() => {
    setZoom(1);
  }, [index]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index < results.length - 1) onNavigate(index + 1);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [index, results.length, onClose, onNavigate]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${current.fileName}`}
      className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
    >
      <div className="relative bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-4xl w-full max-h-[85vh] animate-in zoom-in-95 duration-200 ease-out border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white/5">
          <span className="text-sm font-medium truncate pr-4">{current.fileName}</span>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setZoom((z) => Math.max(1, z - 0.25))} className="p-1.5 rounded-lg hover:bg-white/10">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="p-1.5 rounded-lg hover:bg-white/10">
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-ink-muted hover:text-signal-danger">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-auto bg-black/20 p-4 grid place-items-center">
          <div
            className="relative inline-block transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt={current.fileName}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
            />
            <RegionOverlay regions={current.regions} threshold={threshold} />
          </div>

          {/* Navigation */}
          {index > 0 && (
            <button
              onClick={() => onNavigate(index - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/80 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {index < results.length - 1 && (
            <button
              onClick={() => onNavigate(index + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/80 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}