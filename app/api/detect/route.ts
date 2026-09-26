/**
 * Next.js App Router API route: POST /api/detect
 *
 * Acts as a server-side proxy to the Python FastAPI backend.
 * The browser sends images here (same origin, no CORS),
 * and this handler forwards them to localhost:8000/detect.
 */

import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = () => {
  const envUrl = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return "http://localhost:8000/detect";
  if (envUrl.endsWith("/detect")) return envUrl;
  return `${envUrl.replace(/\/$/, "")}/detect`;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const backendUrl = getBackendUrl();

    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "(no body)");
      return NextResponse.json(
        { error: `Python API error ${response.status}: ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/detect] Failed to reach Python backend:", msg);
    return NextResponse.json(
      { error: `Could not reach inference backend: ${msg}` },
      { status: 502 }
    );
  }
}
