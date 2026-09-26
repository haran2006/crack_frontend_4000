export type Severity = "Low" | "Moderate" | "High";

export interface CrackRegion {
  id: string;
  /** All coordinates are percentages (0-100) relative to the image box. */
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  /** Class name from the YOLO model (e.g. "crack-dedection-2", "damaged"). */
  className?: string;
}

export interface DetectionResult {
  id: string;
  fileName: string;
  fileSizeLabel: string;
  /** URL of the original uploaded image (blob URL in demo, data URL from API). */
  imageUrl: string;
  /**
   * URL of the YOLO-annotated segmentation image returned by the real API.
   * Undefined when running in demo/mock mode — fall back to imageUrl + RegionOverlay.
   */
  annotatedUrl?: string;
  hasCrack: boolean;
  regions: CrackRegion[];
  confidence: number;
  severity: Severity;
  crackLengthMeters: number;
}

export interface DetectionSummary {
  imagesAnalyzed: number;
  imagesWithCracks: number;
  totalRegions: number;
  averageConfidence: number;
  highestSeverity: Severity;
  processingTimeSeconds: number;
  model: string;
}

export interface DetectionRun {
  results: DetectionResult[];
  summary: DetectionSummary;
}
