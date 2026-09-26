"use client";

import { useState } from "react";
import { Menu, X, ScanLine } from "lucide-react";

const NAV_LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Crack Detection", href: "#crack-detection" },
  { label: "Digital Twin", href: "#digital-twin" },
  { label: "Predictive Maintenance", href: "#predictive-maintenance" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-6xl glass rounded-2xl shadow-glass">
        <div className="flex items-center justify-between px-4 sm:px-5 h-14">
          <a href="#overview" className="flex items-center gap-2.5 focus-ring">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-accent/10 border border-accent/30">
              <ScanLine className="w-4 h-4 text-accent" strokeWidth={1.75} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display font-semibold text-[13px] tracking-wide text-ink">
                SMART CRACK
              </span>
              <span className="text-[10px] tracking-[0.14em] text-ink-muted">DIGITAL TWIN</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-white/5 transition-colors focus-ring"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-success animate-pulse-dot" />
              AI System Online
            </span>
            <a
              href="#crack-detection"
              className="text-sm font-medium px-3.5 py-2 rounded-lg bg-accent text-bg hover:bg-accent/90 transition-colors focus-ring"
            >
              Launch Scanner
            </a>
          </div>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 text-ink-muted hover:text-ink focus-ring rounded-lg"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-white/5 focus-ring"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#crack-detection"
              onClick={() => setOpen(false)}
              className="mt-1 text-sm font-medium text-center px-3.5 py-2.5 rounded-lg bg-accent text-bg focus-ring"
            >
              Launch Scanner
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
