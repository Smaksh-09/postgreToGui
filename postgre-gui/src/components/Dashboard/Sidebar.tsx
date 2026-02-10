"use client";

import { Table2, Database, History } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "../ui/LoadingSpinner";
import Link from "next/link";

interface SidebarProps {
  tables: string[];
  activeTable: string;
  onSelectTable: (table: string) => void;
  isLoading?: boolean;
  onOpenHistory?: () => void;
}

export default function Sidebar({
  tables,
  activeTable,
  onSelectTable,
  isLoading = false,
  onOpenHistory,
}: SidebarProps) {
  return (
    <aside className="relative flex h-full w-64 flex-col border-r border-white/10 bg-[#050505]/80 backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/" className="flex items-center gap-2 text-orange-500">
          <Database className="h-5 w-5" />
          <span className="font-bold tracking-tight text-white">PRISM</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        <div className="mb-2 px-3 text-xs font-medium uppercase text-white/40">
          Public Schema
        </div>
        
        <div className="space-y-0.5">
          {isLoading && (
            <div className="px-3 py-2 text-xs text-white/30 flex items-center gap-2">
              <LoadingSpinner size={12} />
              Loading tables...
            </div>
          )}
          {!isLoading && tables.length === 0 && (
            <div className="px-3 py-2 text-xs text-white/30">No tables found</div>
          )}
          {!isLoading &&
            tables.map((table) => (
              <button
                key={table}
                onClick={() => onSelectTable(table)}
                className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-all ${
                  activeTable === table
                    ? "bg-orange-500/10 text-orange-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Table2
                    className={`h-4 w-4 ${
                      activeTable === table ? "text-orange-500" : "text-white/40"
                    }`}
                  />
                  <span>{table}</span>
                </div>
                {activeTable === table && (
                  <motion.div
                    layoutId="active-indicator"
                    className="h-1.5 w-1.5 rounded-full bg-orange-500"
                  />
                )}
              </button>
            ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={onOpenHistory}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <History className="h-4 w-4" />
          <span>Query History</span>
        </button>
      </div>
    </aside>
  );
}