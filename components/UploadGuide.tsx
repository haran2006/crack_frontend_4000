"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STEPS = [
  { number: "01", text: "Upload one or more infrastructure images." },
  { number: "02", text: "The AI model analyzes each image." },
  { number: "03", text: "Detected cracks are highlighted in the prediction output." },
  { number: "04", text: "Review the original and predicted images side-by-side." },
];

export default function UploadGuide({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-guide-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md glass-strong rounded-2xl p-6 shadow-glass"
          >
            <div className="flex items-start justify-between">
              <h2 id="upload-guide-title" className="font-display text-xl font-semibold">
                How crack detection works
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close guide"
                className="p-1.5 -mt-1 -mr-1.5 text-ink-muted hover:text-ink rounded-lg focus-ring"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="mt-5 space-y-4">
              {STEPS.map((step) => (
                <li key={step.number} className="flex gap-3">
                  <span className="font-mono text-xs text-accent pt-0.5">{step.number}</span>
                  <span className="text-sm text-ink-muted">{step.text}</span>
                </li>
              ))}
            </ol>

            <button
              onClick={onClose}
              className="mt-6 w-full text-center px-4 py-3 rounded-xl bg-accent text-bg font-medium text-sm hover:bg-accent/90 transition-colors focus-ring"
            >
              Got it — upload images
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
