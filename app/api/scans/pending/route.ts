import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PENDING_DIR = path.join(process.env.TEMP || "/tmp", "pending_scans");

export async function GET() {
  try {
    const indexPath = path.join(PENDING_DIR, "index.json");
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json({ ok: true, pending: [] });
    }
    const index: Array<any> = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    const pending = index.filter((item) => !item.downloaded);
    return NextResponse.json({ ok: true, pending });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
