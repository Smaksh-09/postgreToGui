"use client";

import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Hero() {
    const router = useRouter();
    
  // Animation variants for the stagger effect
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  return (
    <section className="relative z-10 flex w-full justify-center pt-20 md:pt-32">
      <motion.div 
        className="w-full max-w-4xl px-6 text-center text-white"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Animated Headline */}
        
        <motion.h1 
        
          className="text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] md:text-7xl leading-tight"
          variants={item}
        >
          Your Database. <br className="hidden md:block" />
          <span className="relative inline-block mt-2 md:mt-0">
            {/* The Magma Gradient Text */}
            <span className="
              text-transparent bg-clip-text 
              bg-gradient-to-r from-orange-400 via-red-500 to-orange-400
              animate-gradient-x 
            ">
              Visualized. Instantly.
            </span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="mt-6 text-lg text-white/70 md:text-xl max-w-2xl mx-auto leading-relaxed"
          variants={item}
        >
          Stop writing <code className="bg-white/10 px-1.5 py-0.5 rounded text-orange-200 font-mono text-base border border-white/10">SELECT *</code>. 
          Paste your connection string and get a full-featured admin GUI in milliseconds.
        </motion.p>

        {/* Glowing Button */}
        <motion.div 
          className="mt-10 flex justify-center"
          variants={item}
        >
          <button className="
            group relative inline-flex items-center gap-2 
            rounded-full bg-white/5 border border-white/10 px-8 py-3.5 
            text-base font-medium text-white transition-all duration-300
            hover:bg-white/10 hover:scale-105 hover:border-orange-500/50 
            hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]
          " onClick={() => router.push('/dashboard')}>
            Connect Database
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              -&gt;
            </span>
            
            {/* Optional Inner Ring for extra polish */}
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 group-hover:ring-transparent" />
          </button>
        </motion.div>
      </motion.div>
      
    </section>
  );
}