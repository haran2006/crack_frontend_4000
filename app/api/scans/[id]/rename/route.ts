import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PENDING_DIR = path.join(process.env.TEMP || "/tmp", "pending_scans");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const oldId = params.id;
    const body = await req.json();
    const newName = (body?.newName || body?.newScanId || "").trim();

    if (!newName) {
      return NextResponse.json({ ok: false, success: false, error: "newName is required" }, { status: 400, headers: corsHeaders });
    }

    const newId = newName.replace(/[^a-zA-Z0-9_\-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 80);

    // 1. Update pending scans directory if present (Vercel serverless /tmp)
    if (fs.existsSync(PENDING_DIR)) {
      const oldDir = path.join(PENDING_DIR, oldId);
      const newDir = path.join(PENDING_DIR, newId);
      if (fs.existsSync(oldDir) && oldId !== newId) {
        fs.renameSync(oldDir, newDir);
      }
      const indexPath = path.join(PENDING_DIR, "index.json");
      if (fs.existsSync(indexPath)) {
        try {
          const list: Array<any> = JSON.parse(fs.readFileSync(indexPath, "utf8"));
          const item = list.find((s) => s.scanId === oldId);
          if (item) {
            item.scanId = newId;
            item.customName = newName;
            fs.writeFileSync(indexPath, JSON.stringify(list, null, 2), "utf8");
          }
        } catch (_) {}
      }
    }

    // 2. Update public/scans_registry.json if present
    const registryPath = path.join(process.cwd(), "public", "scans_registry.json");
    if (fs.existsSync(registryPath)) {
      try {
        const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));
        if (Array.isArray(reg)) {
          const item = reg.find((s: any) => s.id === oldId);
          if (item) {
            item.id = newId;
            item.name = newName;
            // Also rename GLB reference if needed
            const oldGlbPath = path.join(process.cwd(), "public", "models", `${oldId}.glb`);
            const newGlbPath = path.join(process.cwd(), "public", "models", `${newId}.glb`);
            if (fs.existsSync(oldGlbPath) && oldId !== newId) {
              try { fs.renameSync(oldGlbPath, newGlbPath); } catch (_) {}
              item.glbUrl = `/models/${newId}.glb`;
            }
            fs.writeFileSync(registryPath, JSON.stringify(reg, null, 2), "utf8");
          }
        }
      } catch (_) {}
    }

    return NextResponse.json(
      { ok: true, success: true, oldId, newId, name: newName },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
