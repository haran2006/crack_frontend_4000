import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const indexPath = path.join(PENDING_DIR, "index.json");
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json({ ok: true, pending: [] }, { headers: corsHeaders });
    }
    const index: Array<any> = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    const pending = index.filter((item) => !item.downloaded);
    return NextResponse.json({ ok: true, pending }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
