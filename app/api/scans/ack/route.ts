import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PENDING_DIR = path.join(process.env.TEMP || "/tmp", "pending_scans");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scanId = body.scanId?.replace(/[^a-zA-Z0-9_\-]/g, "_");

    if (!scanId) {
      return NextResponse.json({ ok: false, error: "Missing scanId" }, { status: 400 });
    }

    const indexPath = path.join(PENDING_DIR, "index.json");
    if (fs.existsSync(indexPath)) {
      const index: Array<any> = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      const updated = index.map((item) => (item.scanId === scanId ? { ...item, downloaded: true } : item));
      fs.writeFileSync(indexPath, JSON.stringify(updated, null, 2), "utf8");
    }

    return NextResponse.json({ ok: true, message: `Scan ${scanId} acknowledged by laptop` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
