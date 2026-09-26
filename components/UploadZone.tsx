"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, ImageIcon, HelpCircle } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export default function UploadZone({
  files,
  onFilesChange,
  onDetect,
  onOpenGuide,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onDetect: () => void;
  onOpenGuide: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const valid = Array.from(incoming).filter((f) => ACCEPTED_TYPES.includes(f.type));
      if (valid.length) onFilesChange([...files, ...valid]);
    },
    [files, onFilesChange]
  );

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-ink-muted">
          {files.length > 0 ? `${files.length} image${files.length > 1 ? "s" : ""} selected` : "No images selected yet"}
        </span>
        <button
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink focus-ring rounded px-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          How it works
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative rounded-2xl border border-dashed p-10 text-center transition-colors",
          isDragging ? "border-accent bg-accent/5" : "border-border-strong glass"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
          aria-label="Upload inspection images"
        />
        <div className="mx-auto w-11 h-11 rounded-xl bg-accent/10 border border-accent/25 grid place-items-center mb-4">
          <UploadCloud className="w-5 h-5 text-accent" />
        </div>
        <p className="font-display font-medium">Drop inspection images here</p>
        <p className="mt-1 text-sm text-ink-muted">Upload JPG, JPEG or PNG images</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-5 inline-flex px-4 py-2.5 rounded-xl bg-white/[0.06] border border-border-strong text-sm font-medium hover:bg-white/[0.09] transition-colors focus-ring"
        >
          Browse files
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <FilePreview key={`${file.name}-${index}`} file={file} onRemove={() => removeFile(index)} />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onDetect}
              className="px-5 py-3 rounded-xl bg-accent text-bg font-medium text-sm hover:bg-accent/90 transition-colors focus-ring"
            >
              Detect cracks
            </button>
            <button
              onClick={() => onFilesChange([])}
              className="px-4 py-3 rounded-xl text-sm text-ink-muted hover:text-ink transition-colors focus-ring"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = URL.createObjectURL(file);
  return (
    <div className="glass rounded-xl p-2.5 flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0 grid place-items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate">{file.name}</p>
        <p className="text-xs text-ink-muted">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="p-1.5 text-ink-muted hover:text-signal-danger rounded-lg focus-ring shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function EmptyStateIcon() {
  return <ImageIcon className="w-4 h-4" />;
}
