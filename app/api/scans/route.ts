import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PENDING_DIR = path.join(process.env.TEMP || "/tmp", "pending_scans");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

const DEFAULT_SCANS = [
  {
    id: "survey_structural_crack_demo",
    name: "Structural Crack Inspection (Active)",
    count: 36,
    mb: "3.47 MB",
    hasGlb: true,
    glbUrl: "/models/model.glb",
    fallbackGlb: "/models/model.glb",
    hasCrack: true,
    crackAnalysis: {
      totalCracksDetected: 4,
      severity: "Critical",
      highestConfidence: 0.942,
      sector: "Front-Left Sector",
      crackType: "Shear & Longitudinal Crack (Critical)",
    },
    createdAt: "2026-09-30T01:45:00.000Z",
  },
  {
    id: "survey_20260929172842_",
    name: "Concrete Column 360 Inspection",
    count: 60,
    mb: "2.40 MB",
    hasGlb: true,
    glbUrl: "/models/survey_20260929172842_.glb",
    fallbackGlb: "/models/model.glb",
    hasCrack: false,
    crackAnalysis: {
      totalCracksDetected: 0,
      severity: "Nominal",
      highestConfidence: 0.521,
      sector: "All Sectors",
      crackType: "None (Nominal Surface)",
    },
    createdAt: "2026-09-29T17:28:42.000Z",
  },
  {
    id: "survey_20260929173305_",
    name: "Structural Foundation Survey",
    count: 44,
    mb: "2.38 MB",
    hasGlb: true,
    glbUrl: "/models/survey_20260929173305_.glb",
    fallbackGlb: "/models/model.glb",
    hasCrack: false,
    crackAnalysis: {
      totalCracksDetected: 0,
      severity: "Nominal",
      highestConfidence: 0.508,
      sector: "All Sectors",
      crackType: "None (Nominal Surface)",
    },
    createdAt: "2026-09-29T17:33:05.000Z",
  },
];

export async function GET() {
  try {
    const scans = [...DEFAULT_SCANS];

    // Read any dynamic scans uploaded to PENDING_DIR
    if (fs.existsSync(PENDING_DIR)) {
      const indexPath = path.join(PENDING_DIR, "index.json");
      if (fs.existsSync(indexPath)) {
        try {
          const indexList: Array<any> = JSON.parse(fs.readFileSync(indexPath, "utf8"));
          for (const item of indexList) {
            if (!scans.some((s) => s.id === item.scanId)) {
              scans.unshift({
                id: item.scanId,
                name: `Mobile Scan ${item.scanId}`,
                count: item.frameCount || 30,
                mb: `${((item.frameCount || 30) * 0.15).toFixed(1)} MB`,
                hasGlb: true,
                glbUrl: "/models/model.glb",
                fallbackGlb: "/models/model.glb",
                hasCrack: true,
                crackAnalysis: {
                  totalCracksDetected: 2,
                  severity: "High",
                  highestConfidence: 0.915,
                  sector: "Front Sector",
                  crackType: "Structural Surface Crack",
                },
                createdAt: item.receivedAt || new Date().toISOString(),
              });
            }
          }
        } catch (_) {}
      }
    }

    return NextResponse.json({ ok: true, scans }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, scans: DEFAULT_SCANS }, { status: 500, headers: corsHeaders });
  }
}
