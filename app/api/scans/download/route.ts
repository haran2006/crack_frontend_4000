import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PENDING_DIR = path.join(process.env.TEMP || "/tmp", "pending_scans");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get("scanId");

    if (!scanId) {
      return NextResponse.json({ ok: false, error: "Missing scanId parameter" }, { status: 400 });
    }

    const safeId = scanId.replace(/[^a-zA-Z0-9_\-]/g, "_");
    const scanDir = path.join(PENDING_DIR, safeId);

    if (!fs.existsSync(scanDir)) {
      return NextResponse.json({ ok: false, error: "Scan directory not found" }, { status: 404 });
    }

    const files = fs.readdirSync(scanDir);
    const frames: Array<{ filename: string; data: string }> = [];
    let meta: any = null;

    for (const f of files) {
      if (f === "meta.json") {
        try {
          meta = JSON.parse(fs.readFileSync(path.join(scanDir, f), "utf8"));
        } catch (_) {}
      } else if (/\.(jpg|jpeg|png)$/i.test(f)) {
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
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
