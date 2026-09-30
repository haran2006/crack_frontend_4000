import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const scanId = params.id;
  const isCrackScan = scanId.includes("crack") || scanId.includes("demo");
  const count = isCrackScan ? 36 : 45;
  const sectors = ["Front", "Right", "Back-Right", "Back", "Left", "Front-Left"];

  const detections = [];
  for (let i = 1; i <= count; i++) {
    const pad = String(i).padStart(3, "0");
    const filename = `frame_${pad}.jpg`;
    const sec = sectors[Math.floor(((i - 1) / count) * sectors.length)] || "Front";
    const hasCrack = isCrackScan && (i % 7 === 0 || i === 4 || i === 12 || i === 22);

    detections.push({
      filename,
      hasCrack,
      hasNoCrackN: !hasCrack,
      sector: sec,
      annotatedUrl: `/scans-files/${scanId}/detections/${filename}`,
      boxes: hasCrack
        ? [
            {
              label: "Crack",
              conf: 0.942,
              color: "#ef4444",
              rect: [180, 140, 260, 280],
            },
          ]
        : [
            {
              label: "NIL",
              conf: 0.985,
              color: "#0284c7",
              rect: [80, 80, 520, 520],
            },
          ],
    });
  }

  return NextResponse.json(
    {
      ok: true,
      scanId,
      crackAnalysis: {
        totalCracksDetected: isCrackScan ? 4 : 0,
        severity: isCrackScan ? "Critical" : "Nominal",
        detections,
      },
    },
    { headers: corsHeaders }
  );
}
