"use client";

import { motion } from "framer-motion";
import { Copy, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

// Mock Data (We will replace this with real props later)
const MOCK_COLUMNS = ["id", "status", "email", "last_login", "metadata", "is_admin", "revenue"];
const MOCK_DATA = Array.from({ length: 20 }).map((_, i) => ({
  id: `usr_${Math.random().toString(36).substr(2, 9)}`,
  status: i % 3 === 0 ? "active" : i % 3 === 1 ? "pending" : "banned",
  email: `user${i}@example.com`,
  last_login: "2024-02-14 10:42:00",
  metadata: i % 2 === 0 ? '{"role": "editor"}' : null,
  is_admin: i === 0,
  revenue: (Math.random() * 1000).toFixed(2),
}));

interface ResultsTableProps {
  activeTable: string;
}

export default function ResultsTable({ activeTable }: ResultsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Helper to render cell content based on type
  const renderCell = (key: string, value: any) => {
    if (value === null) {
      return <span className="text-[10px] uppercase font-bold text-white/20 tracking-wider">NULL</span>;
    }

    if (typeof value === "boolean") {
      return (
        <div className={`flex items-center gap-2 ${value ? "text-emerald-400" : "text-red-400"}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${value ? "bg-emerald-500" : "bg-red-500"} shadow-[0_0_8px_currentColor]`} />
          <span className="text-xs font-medium">{value ? "TRUE" : "FALSE"}</span>
        </div>
      );
    }

    if (key === "status") {
      const color = value === "active" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : 
                    value === "pending" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : 
                    "text-red-400 bg-red-500/10 border-red-500/20";
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${color} uppercase tracking-wide`}>
          {value}
        </span>
      );
    }
    
    // Check if looks like JSON
    if (typeof value === 'string' && value.startsWith('{')) {
         return <code className="text-[10px] text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">JSON</code>
    }

    return <span className="text-white/80">{value}</span>;
  };

  return (
    <div className="flex h-full flex-col border-t border-white/10 bg-[#080808]">
      
      {/* 1. The Toolbar (Search & Filter) */}
      <div className="flex h-10 items-center justify-between bg-white/5 px-4 text-xs border-b border-white/5">
        <div className="flex items-center gap-4 text-white/50">
        <span className="font-mono text-orange-400 font-bold">{activeTable}</span>
          
          <span className="h-3 w-[1px] bg-white/10" />
          <span>Query took <span className="text-emerald-400">12ms</span></span>
          <span className="h-3 w-[1px] bg-white/10" />
          <span>20 rows returned</span>
        </div>
        <div className="flex items-center gap-2">
           <button className="hover:text-white text-white/40 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
           <span className="text-white/40">Page 1 of 1</span>
           <button className="hover:text-white text-white/40 transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {/* 2. The Data Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        <table className="w-full min-w-[800px] border-collapse text-left text-xs font-mono">
          
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-[#0c0c0c] shadow-[0_1px_0_rgba(255,255,255,0.1)]">
            <tr>
              <th className="w-10 border-b border-white/10 px-4 py-3 text-center text-white/30">#</th>
              {MOCK_COLUMNS.map((col) => (
                <th key={col} className="border-b border-white/10 px-4 py-3 font-medium text-white/50 hover:text-white cursor-pointer transition-colors select-none group">
                  <div className="flex items-center gap-2">
                     {col}
                  </div>
                </th>
              ))}
              <th className="w-10 border-b border-white/10"></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/5">
            {MOCK_DATA.map((row: any, i) => (
              <motion.tr 
                key={row.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                className="group relative bg-transparent hover:bg-white/[0.02] transition-colors"
              >
                {/* Row Number */}
                <td className="px-4 py-2.5 text-center text-white/20 group-hover:text-white/40">
                  {i + 1}
                </td>

                {/* Data Cells */}
                {MOCK_COLUMNS.map((col) => (
                  <td key={`${row.id}-${col}`} className="max-w-[200px] px-4 py-2.5 truncate">
                    {renderCell(col, row[col])}
                  </td>
                ))}

                {/* Actions Hover (Copy/More) */}
                <td className="px-4 py-2.5 text-right">
                   <div className={`flex justify-end gap-2 transition-opacity ${hoveredRow === i ? "opacity-100" : "opacity-0"}`}>
                      <button className="text-white/40 hover:text-orange-400 p-1 rounded hover:bg-white/5">
                         <Copy className="h-3.5 w-3.5" />
                      </button>
                   </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}