import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PENDING_DIR = path.join(process.env.TEMP || "/tmp", "pending_scans");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get("scanId");

    if (!scanId) {
      return NextResponse.json({ ok: false, error: "Missing scanId parameter" }, { status: 400, headers: corsHeaders });
    }

    const safeId = scanId.replace(/[^a-zA-Z0-9_\-]/g, "_");
    const scanDir = path.join(PENDING_DIR, safeId);

    if (!fs.existsSync(scanDir)) {
      return NextResponse.json({ ok: false, error: "Scan directory not found" }, { status: 404, headers: corsHeaders });
    }

    const files = fs.readdirSync(scanDir);
    const frames: Array<{ filename: string; data: string }> = [];
    let meta: any = null;

    for (const f of files) {
      if (f === "meta.json") {
        try {
          meta = JSON.parse(fs.readFileSync(path.join(scanDir, f), "utf8"));
        } catch (_) {}
      } else if (/\.(jpg|jpeg|png|json)$/i.test(f)) {
        const fileBuf = fs.readFileSync(path.join(scanDir, f));
        frames.push({
          filename: f,
          data: fileBuf.toString("base64"),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      scanId: safeId,
      meta,
      frames,
    }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
