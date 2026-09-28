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
      className="fixed inset-0 z-[70] bg-black/90 flex flex-col animate-in fade-in zoom-in-95 duration-200 ease-out"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-ink">
        <span className="text-sm text-ink-muted truncate">{current.fileName}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            aria-label="Zoom out"
            className="p-2 rounded-lg hover:bg-white/10 focus-ring"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            aria-label="Zoom in"
            className="p-2 rounded-lg hover:bg-white/10 focus-ring"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden grid place-items-center px-4 pb-6">
        {index > 0 && (
          <button
            onClick={() => onNavigate(index - 1)}
            aria-label="Previous image"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 focus-ring"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative max-w-full max-h-full overflow-auto">
          <div
            className="relative inline-block transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt={current.fileName}
              className="max-w-[85vw] max-h-[70vh] object-contain rounded-lg"
            />
            {/* RegionOverlay reacts to threshold — works in fullscreen too */}
            <RegionOverlay regions={current.regions} threshold={threshold} />

            <button 
              onClick={onClose} 
              aria-label="Close viewer" 
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 focus-ring backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {index < results.length - 1 && (
          <button
            onClick={() => onNavigate(index + 1)}
            aria-label="Next image"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 focus-ring"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}