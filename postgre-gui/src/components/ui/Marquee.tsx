"use client";

import { motion } from "framer-motion";

const items = [
  "VISUALIZE RELATIONSHIPS",
  "\u2022",
  "DEBUG FASTER",
  "\u2022",
  "NO MORE CLI",
  "\u2022",
  "PRODUCTION SAFE",
  "\u2022",
  "GEMINI POWERED",
  "\u2022",
  "INSTANT INSIGHTS",
  "\u2022",
];

export default function Marquee() {
  return (
    <div className="relative flex w-full overflow-hidden border-y border-white/5 bg-white/[0.02] py-6">
      <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#050505] to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#050505] to-transparent" />

      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 20,
        }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-sm font-bold tracking-[0.2em] text-white/20 transition-colors hover:text-orange-500/50 cursor-default"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
