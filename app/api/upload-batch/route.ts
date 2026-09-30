import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PENDING_DIR = path.join(process.env.TEMP || "/tmp", "pending_scans");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getIndex(): Array<{ scanId: string; timestamp: number; frameCount: number; receivedAt: string; downloaded: boolean }> {
  try {
    ensureDir(PENDING_DIR);
    const indexPath = path.join(PENDING_DIR, "index.json");
    if (fs.existsSync(indexPath)) {
      return JSON.parse(fs.readFileSync(indexPath, "utf8"));
    }
  } catch (e) {
    console.error("Error reading scan index:", e);
  }
  return [];
}

function saveIndex(list: Array<{ scanId: string; timestamp: number; frameCount: number; receivedAt: string; downloaded: boolean }>) {
  try {
    ensureDir(PENDING_DIR);
    const indexPath = path.join(PENDING_DIR, "index.json");
    fs.writeFileSync(indexPath, JSON.stringify(list, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving scan index:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureDir(PENDING_DIR);

    const contentType = req.headers.get("content-type") || "";
    let scanId = `scan_${Date.now()}`;
    let savedCount = 0;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const customScanId = formData.get("scanId") as string | null;
      if (customScanId) scanId = customScanId.replace(/[^a-zA-Z0-9_\-]/g, "_");

      const scanDir = path.join(PENDING_DIR, scanId);
      ensureDir(scanDir);

      const files = formData.getAll("images") as File[];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = file.name || `frame_${String(i + 1).padStart(3, "0")}.jpg`;
        fs.writeFileSync(path.join(scanDir, filename), buffer);
        savedCount++;
      }

      // Also persist any accompanying metadata files (poses, intrinsics, spatialMap, etc.)
      for (const [key, val] of formData.entries()) {
        if (key === "scanId" || key === "images") continue;
        if (typeof val === "object" && val !== null && "arrayBuffer" in val) {
          try {
            const file = val as File;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = file.name || `${key}.json`;
            fs.writeFileSync(path.join(scanDir, filename), buffer);
          } catch (_) {}
        }
      }
    } else {
      // JSON payload support
      const body = await req.json();
      if (body.scanId) scanId = body.scanId.replace(/[^a-zA-Z0-9_\-]/g, "_");
      const scanDir = path.join(PENDING_DIR, scanId);
      ensureDir(scanDir);

      if (Array.isArray(body.images)) {
        for (let i = 0; i < body.images.length; i++) {
          const item = body.images[i];
          const filename = item.filename || `frame_${String(i + 1).padStart(3, "0")}.jpg`;
          const base64Data = (typeof item === "string" ? item : item.data || "").replace(/^data:image\/\w+;base64,/, "");
          if (base64Data) {
            fs.writeFileSync(path.join(scanDir, filename), Buffer.from(base64Data, "base64"));
            savedCount++;
          }
        }
      }
    }

    // Update scan metadata reflecting all cumulative frames in folder
    const scanDir = path.join(PENDING_DIR, scanId);
    const totalFrames = fs.readdirSync(scanDir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).length;
    const meta = {
      scanId,
      timestamp: Date.now(),
      frameCount: totalFrames,
      receivedAt: new Date().toISOString(),
      downloaded: false,
    };
    fs.writeFileSync(path.join(scanDir, "meta.json"), JSON.stringify(meta, null, 2), "utf8");

    // Update global index
    const index = getIndex().filter((s) => s.scanId !== scanId);
    index.push(meta);
    saveIndex(index);

    return NextResponse.json(
      {
        ok: true,
        scanId,
        frameCount: totalFrames,
        message: "Scan successfully queued in Cloud Relay for laptop synchronization",
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to upload scan" },
      { status: 500, headers: corsHeaders }
    );
  }
}
