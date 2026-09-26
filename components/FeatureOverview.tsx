import { ScanEye, Layers, TrendingUp } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Detect",
    icon: ScanEye,
    text: "Upload infrastructure images. The AI analyzes each one and identifies visible cracks and damaged regions.",
  },
  {
    number: "02",
    title: "Visualize",
    icon: Layers,
    text: "Detected cracks are highlighted directly on the inspection image, so engineers can quickly understand the affected area.",
  },
  {
    number: "03",
    title: "Predict",
    icon: TrendingUp,
    text: "The platform can use inspection history and structural information to support predictive maintenance decisions.",
  },
];

export default function FeatureOverview() {
  return (
    <section className="px-4 py-20 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold max-w-lg text-balance">
          From images to infrastructure intelligence
        </h2>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {STEPS.map((step) => (
            <div key={step.number} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-faint">{step.number}</span>
                <step.icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
