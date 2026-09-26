import { DetectionResult, DetectionRun, DetectionSummary, Severity } from "@/types/detection";
import { formatFileSize } from "@/lib/utils";

const DEMO_MODEL_NAME = "YOLO Crack Segmentation (Demo Mode)";

export async function detectCracks(files: File[]): Promise<DetectionRun> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const endpoint = baseUrl
    ? (baseUrl.endsWith("/detect") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/detect`)
    : "/api/detect";

  try {
    return await detectCracksRemote(files, endpoint);
  } catch (err) {
    console.error("Remote detection failed:", err);
  }

  return detectCracksMock(files);
}

async function detectCracksRemote(files: File[], endpoint: string): Promise<DetectionRun> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const res = await fetch(endpoint, { method: "POST", body: formData });
  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`Detection API responded with ${res.status}: ${text}`);
  }
  return (await res.json()) as DetectionRun;
}

async function detectCracksMock(files: File[]): Promise<DetectionRun> {
  const start = performance.now();

  const results: DetectionResult[] = files.map((file, index) => buildMockResult(file, index));

  const withCracks = results.filter((r) => r.hasCrack);
  const totalRegions = results.reduce((sum, r) => sum + r.regions.length, 0);
  const avgConfidence =
    results.length > 0 ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length : 0;

  const summary: DetectionSummary = {
    imagesAnalyzed: results.length,
    imagesWithCracks: withCracks.length,
    totalRegions,
    averageConfidence: Math.round(avgConfidence * 1000) / 10,
    highestSeverity: highestSeverityOf(results),
    processingTimeSeconds: Math.round(((performance.now() - start) / 1000 + files.length * 0.6) * 10) / 10,
    model: DEMO_MODEL_NAME,
  };

  return { results, summary };
}

function buildMockResult(file: File, index: number): DetectionResult {
  const rand = seededRandom(`${file.name}-${file.size}-${index}`);

  const hasCrack = rand() < 0.82;
  const regionCount = hasCrack ? 1 + Math.floor(rand() * 4) : 0;
  const confidence = hasCrack ? 0.72 + rand() * 0.26 : 0.4 + rand() * 0.2;

  // "Real" detections — the ones that make up the reported crack count.
  const realRegions = Array.from({ length: regionCount }, (_, i) => ({
    id: `${file.name}-region-${i}`,
    x: 10 + rand() * 65,
    y: 12 + rand() * 60,
    width: 8 + rand() * 18,
    height: 4 + rand() * 10,
    confidence: 0.55 + rand() * 0.43, // ~55%–98%
  }));

  // Low-confidence "noise" candidates — every real model returns some weak,
  // spurious boxes too. These exist on every image so the slider has a
  // visible effect across its full 0–100% range, not just above ~65%.
  const noiseCount = Math.floor(rand() * 3);
  const noiseRegions = Array.from({ length: noiseCount }, (_, i) => ({
    id: `${file.name}-noise-${i}`,
    x: 5 + rand() * 80,
    y: 8 + rand() * 75,
    width: 5 + rand() * 12,
    height: 3 + rand() * 7,
    confidence: 0.03 + rand() * 0.35, // ~3%–38%
  }));

  const regions = [...realRegions, ...noiseRegions];

  const severity = severityFor(regionCount, confidence);
  const crackLengthMeters = hasCrack ? Math.round((0.3 + rand() * 2.1) * 100) / 100 : 0;

  return {
    id: `${file.name}-${index}-${file.lastModified}`,
    fileName: file.name,
    fileSizeLabel: formatFileSize(file.size),
    imageUrl: URL.createObjectURL(file),
    hasCrack,
    regions,
    confidence: Math.round(confidence * 1000) / 10,
    severity,
    crackLengthMeters,
  };
}

function severityFor(regionCount: number, confidence: number): Severity {
  if (regionCount === 0) return "Low";
  if (regionCount >= 3 || confidence > 0.92) return "High";
  if (regionCount === 2 || confidence > 0.8) return "Moderate";
  return "Low";
}

function highestSeverityOf(results: DetectionResult[]): Severity {
  const order: Severity[] = ["Low", "Moderate", "High"];
  return results.reduce<Severity>((highest, r) => {
    return order.indexOf(r.severity) > order.indexOf(highest) ? r.severity : highest;
  }, "Low");
}

function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}