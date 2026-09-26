"use client";

import { motion } from "framer-motion";
import { ArrowRight, Radar } from "lucide-react";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  return (
    <section id="overview" className="relative pt-40 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 blueprint-bg pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-2 gap-14 items-center">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] tracking-[0.1em] text-accent mb-6"
          >
            <Radar className="w-3.5 h-3.5" />
            AI-POWERED INFRASTRUCTURE INSPECTION
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-[2.5rem] leading-[1.08] sm:text-5xl sm:leading-[1.08] font-semibold text-balance"
          >
            See structural damage before it becomes a problem.
          </motion.h1>

          <motion.p variants={item} className="mt-5 text-ink-muted text-base sm:text-lg max-w-md">
            AI-powered crack detection and digital infrastructure monitoring for
            faster, smarter structural inspections.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#crack-detection"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg font-medium text-sm hover:bg-accent/90 transition-colors focus-ring"
            >
              Start Crack Detection
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#digital-twin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass text-ink font-medium text-sm hover:border-border-strong transition-colors focus-ring"
            >
              Explore Digital Twin
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative aspect-square max-w-md mx-auto w-full"
        >
          <StructuralMesh />
        </motion.div>
      </div>
    </section>
  );
}

function StructuralMesh() {
  return (
    <div className="relative w-full h-full glass rounded-2xl p-6 shadow-glass">
      <svg viewBox="0 0 320 320" className="w-full h-full" role="img" aria-label="Structural scan visualization">
        <defs>
          <linearGradient id="meshLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2FD3E8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#2FD3E8" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* isometric frame */}
        <motion.g
          stroke="url(#meshLine)"
          strokeWidth="1.2"
          fill="none"
          initial="hidden"
          animate="visible"
        >
          {[
            "M60,240 L60,120 L160,70 L260,120 L260,240 L160,290 Z",
            "M60,120 L160,170 L260,120",
            "M160,170 L160,290",
            "M60,180 L160,230 L260,180",
            "M110,145 L110,265",
            "M210,145 L210,265",
          ].map((d, i) => (
            <motion.path
              key={d}
              d={d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: "easeInOut" }}
            />
          ))}
        </motion.g>

        {/* glowing detection points */}
        {[
          [110, 180],
          [190, 205],
          [150, 245],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={4}
            fill="#F5504A"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            transition={{ duration: 1.6, delay: 1.2 + i * 0.3, repeat: Infinity, repeatDelay: 2.4 }}
          />
        ))}
      </svg>

      <div className="absolute top-4 left-4 text-[10px] tracking-[0.12em] text-ink-faint font-mono">
        SCAN.001 / STRUCTURAL MESH
      </div>
    </div>
  );
}
