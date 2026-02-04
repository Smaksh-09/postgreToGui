"use client";

import { motion } from "framer-motion";

const cardBase =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_30px_90px_rgba(0,0,0,0.7)]";

export default function FourthSection() {
  return (
    // 1. CHANGED bg-black -> bg-midnight-950 to match the previous section perfectly.
    // 2. INCREASED overlap: -mt-10 -> -mt-20 to physically pull the gradients together.
    <section className="relative -mt-20 w-full bg-midnight-950 py-24">
      
      {/* --- THE FIX: TOP GLOW --- */}
      {/* A strong radial glow that sits BEHIND the cards but ON TOP of the section seam. */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-orange-900/5 to-transparent blur-[60px] z-0" />
      
      {/* A subtle linear gradient to wash the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-orange-500/5 to-transparent z-0" />

      <div className="mx-auto w-full max-w-6xl px-6 relative z-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Large Card (Unchanged) */}
          <motion.div
            className={`${cardBase} lg:col-span-2 lg:row-span-2`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
             <div className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white">AI Query Engine</h3>
              <p className="mt-2 text-sm text-white/70">Type natural language, get SQL instantly.</p>
            </div>
            {/* ... keeping your existing card animations ... */}
            <div className="relative mx-6 mb-6 h-[220px] rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-orange-500/10 md:mx-8">
              <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,120,54,0.12),transparent_60%)]" />
               {/* ... visual elements ... */}
            </div>
          </motion.div>

          {/* Small Card 1 (Unchanged) */}
          <motion.div
            className={cardBase}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            {/* ... content ... */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">Schema Visualizer</h3>
              <p className="mt-2 text-sm text-white/70">See relationships in a glance.</p>
            </div>
            <div className="relative mx-6 mb-6 h-[160px] rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-white/5">
                {/* ... visual elements ... */}
            </div>
          </motion.div>

          {/* Small Card 2 (Unchanged) */}
          <motion.div
            className={cardBase}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true, amount: 0.4 }}
          >
             <div className="p-6">
              <h3 className="text-lg font-semibold text-white">Instant CRUD</h3>
              <p className="mt-2 text-sm text-white/70">Edit records like a spreadsheet.</p>
            </div>
             <div className="relative mx-6 mb-6 h-[160px] rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-white/5">
                {/* ... visual elements ... */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}