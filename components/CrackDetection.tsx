"use client";

import { useEffect, useState } from "react";
import UploadZone from "@/components/UploadZone";
import UploadGuide from "@/components/UploadGuide";
import ProcessingState from "@/components/ProcessingState";
import DetectionResults from "@/components/DetectionResults";
import { detectCracks } from "@/lib/crackDetection";
import { DetectionRun } from "@/types/detection";

const GUIDE_SEEN_KEY = "scd_upload_guide_seen";
const MIN_PROCESSING_MS = 2400;

type Stage = "idle" | "processing" | "results";

export default function CrackDetection() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [run, setRun] = useState<DetectionRun | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const seen = typeof window !== "undefined" && localStorage.getItem(GUIDE_SEEN_KEY);
    if (!seen) setGuideOpen(true);
  }, []);

  function closeGuide() {
    setGuideOpen(false);
    localStorage.setItem(GUIDE_SEEN_KEY, "1");
  }

  async function handleDetect() {
    if (files.length === 0) return;
    setStage("processing");
    setErrorMessage(null);

    try {
      const [detectionRun] = await Promise.all([
        detectCracks(files),
        new Promise((resolve) => setTimeout(resolve, MIN_PROCESSING_MS)),
      ]);

      setRun(detectionRun);
      setStage("results");
    } catch (err: unknown) {
      console.error("Detection error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(
        msg.includes("Failed to fetch") || msg.includes("502")
          ? "Unable to connect to the backend server. Please verify that python api.py is running on port 8000."
          : msg
      );
      setStage("idle");
    }
  }

  function reset() {
    setFiles([]);
    setRun(null);
    setErrorMessage(null);
    setStage("idle");
  }

  return (
    <section id="crack-detection" className="px-4 py-20 border-t border-border">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold">Smart crack detection</h2>
        <p className="mt-2 text-ink-muted max-w-lg">
          Upload inspection images and let the vision model identify structural cracks.
        </p>

        {errorMessage && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-red-300">Detection Request Failed</p>
              <p className="mt-1 text-xs opacity-90">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mt-10">
          {stage === "idle" && (
            <UploadZone
              files={files}
              onFilesChange={setFiles}
              onDetect={handleDetect}
              onOpenGuide={() => setGuideOpen(true)}
            />
          )}

          {stage === "processing" && <ProcessingState />}

          {stage === "results" && run && <DetectionResults run={run} onReset={reset} />}
        </div>
      </div>

      <UploadGuide open={guideOpen} onClose={closeGuide} />
    </section>
  );
}
