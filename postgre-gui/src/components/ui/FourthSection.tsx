"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const cardBase =
  "bento-glow relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_30px_90px_rgba(0,0,0,0.7)]";

const suggestedPrompts = [
  "Show top 5 users by revenue",
  "Find orders from last week",
  "Count active subscriptions",
  "List users with no orders",
];

export default function FourthSection() {
  return (
    <section className="relative -mt-20 w-full bg-midnight-950 py-24">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-orange-900/5 to-transparent blur-[60px] z-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-orange-500/5 to-transparent z-0" />

      <div className="mx-auto w-full max-w-6xl px-6 relative z-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Large Card - AI Query Engine */}
          <motion.div
            className={`${cardBase} flex flex-col lg:col-span-2 lg:row-span-2`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white">
                AI Query Engine
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Type natural language, get SQL instantly.
              </p>
            </div>
            <div className="relative mx-6 overflow-hidden rounded-xl border border-white/10 md:mx-8">
              <Image
                src="/image2.png"
                alt="AI Query Engine"
                width={900}
                height={450}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Suggested Prompts */}
            <div className="mt-auto px-6 pb-6 pt-8 md:px-8 md:pb-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/20">
                Suggested Queries
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    className="rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-white/40 transition-all hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Small Card 1 - Schema Visualizer */}
          <motion.div
            className={cardBase}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">
                Schema Visualizer
              </h3>
              <p className="mt-2 text-sm text-white/70">
                See relationships in a glance.
              </p>
            </div>
            <div className="relative mx-6 mb-6 overflow-hidden rounded-xl border border-white/10">
              <Image
                src="/image.png"
                alt="Schema Visualizer"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* Small Card 2 - Query History */}
          <motion.div
            className={cardBase}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">
                Query History
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Your SQL-Query history is saved.
              </p>
            </div>
            <div className="relative mx-6 mb-6 overflow-hidden rounded-xl border border-white/10">
              <Image
                src="/image3.png"
                alt="Query History"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
