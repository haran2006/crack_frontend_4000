import { NextResponse } from "next/server";
import os from "os";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const nets = os.networkInterfaces();
    const ips: Array<{ type: string; address: string; iface: string }> = [];

    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          let type = "Ethernet";
          if (/wi-fi|wlan|wireless/i.test(name)) {
            type = "Wi-Fi";
          }
          ips.push({ type, address: net.address, iface: name });
        }
      }
    }

    // Prefer active Wi-Fi IPv4 address
    const primary = ips.find((i) => i.type === "Wi-Fi") || ips[0];
    const ipAddress = primary ? primary.address : "192.168.0.92";
    const port = 3000;

    return NextResponse.json(
      {
        ok: true,
        ip: ipAddress,
        port,
        protocol: "http",
        url: `http://${ipAddress}:${port}`,
        scannerUrl: `http://${ipAddress}:${port}/scanner.html`,
        dashboardUrl: `http://${ipAddress}:${port}/dashboard.html`,
        evaluationsUrl: `http://${ipAddress}:${port}/evaluations.html`,
        ips,
        backendPort: 8000,
        backendUrl: `http://${ipAddress}:8000`,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
