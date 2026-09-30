"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace("/scanner.html");
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#f0f6ff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#0f172a",
      textAlign: "center",
      padding: "20px"
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "3px solid #0284c7",
        borderTopColor: "transparent",
        animation: "spin 1s linear infinite"
      }} />
      <style dangerouslySetInnerHTML={{
        __html: `@keyframes spin { to { transform: rotate(360deg); } }`
      }} />
      <h2 style={{ marginTop: 24, fontSize: 20, fontWeight: 700 }}>Opening Smart AR/VR Scanner…</h2>
      <p style={{ marginTop: 8, color: "#475569", fontSize: 14 }}>
        If not redirected automatically, <a href="/scanner.html" style={{ color: "#0284c7", fontWeight: 600 }}>tap here to start scanning</a>.
      </p>
    </div>
  );
}

