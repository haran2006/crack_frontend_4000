"use client";

import { useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { CrackRegion } from "@/types/detection";
import RegionOverlay from "@/components/RegionOverlay";

export default function ComparisonSlider({
  imageUrl,
  regions,
  altText,
  threshold = 0,
}: {
  imageUrl: string;
  regions: CrackRegion[];
  altText: string;
  threshold?: number;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden select-none cursor-ew-resize bg-white/5"
      onMouseDown={(e) => {
        dragging.current = true;
        updateFromClientX(e.clientX);
      }}
      onMouseMove={(e) => dragging.current && updateFromClientX(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchStart={(e) => updateFromClientX(e.touches[0].clientX)}
      onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
      role="slider"
      aria-label="Compare original and prediction"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
        if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 5));
      }}
    >
      {/* LEFT side — original image (no overlay) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={altText}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* RIGHT side — same image + RegionOverlay, clipped to right half */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* RegionOverlay on the prediction side — reacts to threshold instantly */}
        <RegionOverlay regions={regions} threshold={threshold} />
      </div>

      {/* Divider handle */}
      <div
        className="absolute inset-y-0 w-px bg-accent"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-accent text-bg grid place-items-center shadow-glow-accent">
          <MoveHorizontal className="w-4 h-4" />
        </div>
      </div>

      <span className="absolute bottom-2 left-2 text-[10px] px-2 py-1 rounded-md bg-black/50 text-ink tracking-wide">
        ORIGINAL
      </span>
      <span className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded-md bg-black/50 text-accent tracking-wide">
        PREDICTION
      </span>
    </div>
  );
}