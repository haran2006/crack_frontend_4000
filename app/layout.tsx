import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Crack Detection — AI Digital Twin & Predictive Maintenance",
  description:
    "AI-powered crack detection and digital infrastructure monitoring for faster, smarter structural inspections.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
