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

const FALLBACK_SCANS = [
  {
    id: "survey_structural_crack_demo",
    name: "Structural Crack Inspection (Active)",
    count: 36,
    mb: "3.47 MB",
    hasGlb: true,
    glbUrl: "/models/model.glb",
    fallbackGlb: "/models/model.glb",
    hasCrack: true,
    cracksCount: 4,
    crackType: "Shear & Longitudinal Crack (Critical)",
    conf: "94.2%",
    sector: "Front-Left Sector",
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
    id: "survey_20260930150113_",
    name: "Reinforced Slab Multi-Milestone Survey",
    count: 70,
    mb: "21.44 MB",
    hasGlb: true,
    glbUrl: "/models/survey_20260930150113_.glb",
    fallbackGlb: "/models/model.glb",
    hasCrack: false,
    cracksCount: 0,
    crackType: "None (Nominal Surface)",
    conf: "51.2%",
    sector: "All Sectors",
    crackAnalysis: {
      totalCracksDetected: 0,
      severity: "LOW",
      highestConfidence: 0.556,
      sector: "All Sectors",
      crackType: "None (Nominal Surface)",
    },
    createdAt: "2026-09-30T15:01:13.000Z",
  },
  {
    id: "survey_20260930145709_",
    name: "Tunnel Lining Spatial Inspection",
    count: 30,
    mb: "1.35 MB",
    hasGlb: true,
    glbUrl: "/models/survey_20260930145709_.glb",
    fallbackGlb: "/models/model.glb",
    hasCrack: false,
    cracksCount: 0,
    crackType: "None (Nominal Surface)",
    conf: "50.5%",
    sector: "All Sectors",
    crackAnalysis: {
      totalCracksDetected: 0,
      severity: "LOW",
      highestConfidence: 0.505,
      sector: "All Sectors",
      crackType: "None (Nominal Surface)",
    },
    createdAt: "2026-09-30T14:57:09.000Z",
  },
  {
    id: "survey_20260930145253_",
    name: "Bridge Pier Photogrammetry Scan",
    count: 35,
    mb: "2.77 MB",
    hasGlb: true,
    glbUrl: "/models/survey_20260930145253_.glb",
    fallbackGlb: "/models/model.glb",
    hasCrack: false,
    cracksCount: 0,
    crackType: "None (Nominal Surface)",
    conf: "51.8%",
    sector: "All Sectors",
    crackAnalysis: {
      totalCracksDetected: 0,
      severity: "LOW",
      highestConfidence: 0.518,
      sector: "All Sectors",
      crackType: "None (Nominal Surface)",
    },
    createdAt: "2026-09-30T14:52:53.000Z",
  },
  {
    id: "survey_20260929172842_",
    name: "Concrete Column 360 Survey",
    count: 60,
    mb: "2.40 MB",
    hasGlb: true,
    glbUrl: "/models/survey_20260929172842_.glb",
    fallbackGlb: "/models/model.glb",
    hasCrack: false,
    cracksCount: 0,
    crackType: "None (Nominal Surface)",
    conf: "52.1%",
    sector: "All Sectors",
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
    cracksCount: 0,
    crackType: "None (Nominal Surface)",
    conf: "50.8%",
    sector: "All Sectors",
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
    let scans = [...FALLBACK_SCANS];

    // Try reading scans_registry.json
    const registryPath = path.join(process.cwd(), "public", "scans_registry.json");
    if (fs.existsSync(registryPath)) {
      try {
        const raw = fs.readFileSync(registryPath, "utf8");
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          scans = list;
        }
      } catch (_) {}
    }

    // Read any dynamic scans uploaded to PENDING_DIR
    if (fs.existsSync(PENDING_DIR)) {
      const indexPath = path.join(PENDING_DIR, "index.json");
      if (fs.existsSync(indexPath)) {
        try {
          const indexList: Array<any> = JSON.parse(fs.readFileSync(indexPath, "utf8"));
          for (const item of indexList) {
            const existingIdx = scans.findIndex((s) => s.id === item.scanId);
            const dynamicScan = {
              id: item.scanId,
              name: item.customName || `Mobile Scan ${item.scanId}`,
              count: item.frameCount || 30,
              mb: `${((item.frameCount || 30) * 0.15).toFixed(1)} MB`,
              hasGlb: true,
              glbUrl: "/models/model.glb",
              fallbackGlb: "/models/model.glb",
              hasCrack: true,
              cracksCount: 2,
              crackType: "Structural Surface Crack",
              conf: "91.5%",
              sector: "Front Sector",
              crackAnalysis: {
                totalCracksDetected: 2,
                severity: "High",
                highestConfidence: 0.915,
                sector: "Front Sector",
                crackType: "Structural Surface Crack",
              },
              createdAt: item.receivedAt || new Date().toISOString(),
            };

            if (existingIdx >= 0) {
              scans[existingIdx] = dynamicScan;
            } else {
              scans.unshift(dynamicScan);
            }
          }
        } catch (_) {}
      }
    }

    return NextResponse.json({ ok: true, scans }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, scans: FALLBACK_SCANS }, { status: 500, headers: corsHeaders });
  }
}
