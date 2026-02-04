"use client";

import Sidebar from "../../../components/Dashboard/Sidebar";
import { Sparkles, Play, Share2, MoreHorizontal, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function VisualizerPage() {
  return (
    <div className="flex h-screen w-full bg-midnight-950">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#050505]/50 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-white/50">
              Project <span className="mx-2 text-white/20">/</span> 
              <span className="text-white">Postgres Production</span>
            </h1>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              READ ONLY
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors border border-white/5">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 transition-colors shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              <Play className="h-3.5 w-3.5 fill-current" />
              Run Query
            </button>
          </div>
        </header>

        {/* WORKSPACE CANVAS */}
        <div className="relative flex-1 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
          
          {/* Mock Visualizer Empty State (Or Graph Placeholder) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="relative mx-auto h-24 w-24">
                <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl animate-pulse" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
                   <Sparkles className="h-10 w-10 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">AI Schema Engine Ready</h3>
                <p className="text-sm text-white/40 max-w-xs mx-auto mt-1">
                  Ask a question below to generate a query, or drag tables to visualize relationships.
                </p>
              </div>
            </div>
          </div>

          {/* Floating AI Command Bar */}
          <div className="absolute bottom-8 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="group relative flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c0c0c]/90 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 focus-within:ring-orange-500/50 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <input 
                type="text"
                placeholder="Ask your database... (e.g. 'Show me active users who signed up last week')"
                className="flex-1 bg-transparent px-2 text-sm text-white placeholder-white/30 focus:outline-none"
              />
              <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                 <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50 sm:inline-block">⌘ K</kbd>
                 <button className="rounded-lg p-1.5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Maximize2 className="h-4 w-4" />
                 </button>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}