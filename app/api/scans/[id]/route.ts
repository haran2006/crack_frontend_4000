import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PENDING_DIR = path.join(process.env.TEMP || "/tmp", "pending_scans");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scanId = params.id;
    if (fs.existsSync(PENDING_DIR)) {
      const scanDir = path.join(PENDING_DIR, scanId);
      if (fs.existsSync(scanDir)) {
        fs.rmSync(scanDir, { recursive: true, force: true });
      }
      const indexPath = path.join(PENDING_DIR, "index.json");
      if (fs.existsSync(indexPath)) {
        try {
          const list: Array<any> = JSON.parse(fs.readFileSync(indexPath, "utf8"));
          const updated = list.filter((item) => item.scanId !== scanId);
          fs.writeFileSync(indexPath, JSON.stringify(updated, null, 2), "utf8");
        } catch (_) {}
      }
    }
    return NextResponse.json({ ok: true, message: `Scan ${scanId} deleted.` }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
