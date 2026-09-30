import { NextResponse } from "next/server";
import { checkAllKiriBalances } from "@/lib/kiri";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const balanceData = await checkAllKiriBalances();
    return NextResponse.json(balanceData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to check KIRI balance" },
      { status: 500 }
    );
  }
}
