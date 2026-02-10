"use client";

import { Monitor, Smartphone } from "lucide-react";

export default function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] p-6 text-center md:hidden">
      {/* Icon Animation */}
      <div className="relative mb-8 flex items-center justify-center">
        <Smartphone className="absolute h-12 w-12 text-white/20" />
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent shadow-[0_0_30px_rgba(249,115,22,0.2)] backdrop-blur-xl">
          <Monitor className="h-10 w-10 text-orange-500" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white">
        Desktop Experience Only
      </h2>

      <p className="mt-4 max-w-xs text-sm text-white/40">
        Prism handles complex schema visualizations that require a mouse and a
        large screen.
      </p>

      <div className="mt-8 rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-xs text-white/50">
        Please open
        <span className="mx-1 font-mono text-orange-400">
          prism.smaksh.space
        </span>
        on your computer.
      </div>
    </div>
  );
}
