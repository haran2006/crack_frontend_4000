const LINKS = ["Crack Detection", "Digital Twin", "Predictive Maintenance", "Documentation"];

export default function Footer() {
  return (
    <footer className="px-4 py-12 border-t border-border">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="font-display font-semibold text-sm">Smart Crack Detection</p>
          <p className="mt-1 text-sm text-ink-muted max-w-xs">
            AI-powered infrastructure inspection and digital twin technology.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <a key={link} href="#" className="text-sm text-ink-muted hover:text-ink transition-colors focus-ring">
              {link}
            </a>
          ))}
        </nav>
      </div>

      <p className="mx-auto max-w-6xl mt-8 text-xs text-ink-faint">© 2026 Smart Crack Detection</p>
    </footer>
  );
}
