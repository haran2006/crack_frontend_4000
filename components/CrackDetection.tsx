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

    const [detectionRun] = await Promise.all([
      detectCracks(files),
      new Promise((resolve) => setTimeout(resolve, MIN_PROCESSING_MS)),
    ]);

    setRun(detectionRun);
    setStage("results");
  }

  function reset() {
    setFiles([]);
    setRun(null);
    setStage("idle");
  }

  return (
    <section id="crack-detection" className="px-4 py-20 border-t border-border">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold">Smart crack detection</h2>
        <p className="mt-2 text-ink-muted max-w-lg">
          Upload inspection images and let the vision model identify structural cracks.
        </p>

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
