"use client";

import { motion } from "framer-motion";

export default function ThirdSection() {
  return (
    <section className="relative w-full overflow-hidden bg-midnight-950">
      
      {/* --- THE FIX: The "Upper Black Shadow" --- */}
      {/* 1. We remove the orange gradient.
          2. We add a dark shadow at the top (h-32) that goes:
             Solid Dark -> Transparent.
          This hides the transition line completely. 
      */}
      <div className="absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-[#010a08] via-[#010a08]/60 to-transparent pointer-events-none" />


      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-24 pt-24 relative z-10">
        <motion.div
          className="relative w-full max-w-5xl"
          style={{ perspective: "1200px" }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.4 }}
        >
          {/* Your Card Component (Unchanged) */}
          <motion.div
            className="relative h-[360px] w-full rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
            style={{
              transformStyle: "preserve-3d",
              boxShadow:
                "0 40px 120px rgba(0,0,0,0.7), inset 0 0 60px rgba(255,120,54,0.12)",
            }}
            initial={{ rotateX: 18, scale: 0.98 }}
            whileInView={{ rotateX: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-orange-500/10" />
            <div className="absolute -bottom-12 left-1/2 h-24 w-2/3 -translate-x-1/2 rounded-full bg-orange-500/25 blur-[80px]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}