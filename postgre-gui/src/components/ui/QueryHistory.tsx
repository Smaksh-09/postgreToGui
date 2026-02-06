"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  RotateCcw,
  Sparkles,
  Trash2,
  ChevronRight,
} from "lucide-react";

export interface HistoryEntry {
  id: string;
  question: string;
  sql: string;
  timestamp: Date;
  rowCount?: number;
  duration?: number;
}

// Mock history for now
const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: "1",
    question: "Show me all active users who signed up last week",
    sql: "SELECT * FROM users WHERE status = 'active' AND created_at > NOW() - INTERVAL '7 days';",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    rowCount: 42,
    duration: 12,
  },
  {
    id: "2",
    question: "Count orders by product category",
    sql: "SELECT p.category, COUNT(*) as order_count FROM orders o JOIN products p ON o.product_id = p.id GROUP BY p.category ORDER BY order_count DESC;",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    rowCount: 8,
    duration: 45,
  },
  {
    id: "3",
    question: "Find users with no orders",
    sql: "SELECT u.* FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE o.id IS NULL;",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    rowCount: 156,
    duration: 28,
  },
  {
    id: "4",
    question: "Top 10 revenue generating customers",
    sql: "SELECT u.email, SUM(o.total) as revenue FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.email ORDER BY revenue DESC LIMIT 10;",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    rowCount: 10,
    duration: 67,
  },
  {
    id: "5",
    question: "Show recent failed transactions",
    sql: "SELECT * FROM transactions WHERE status = 'failed' ORDER BY created_at DESC LIMIT 50;",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    rowCount: 23,
    duration: 9,
  },
];

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface QueryHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (entry: HistoryEntry) => void;
}

export default function QueryHistory({
  isOpen,
  onClose,
  onSelect,
}: QueryHistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClearAll = () => {
    setEntries([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-white/10 bg-[#080808]/95 shadow-[-20px_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-white">
                Query History
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                {entries.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {entries.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="rounded-md px-2 py-1 text-[11px] text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Clock className="h-5 w-5 text-white/20" />
                </div>
                <p className="text-sm text-white/30">No queries yet</p>
                <p className="max-w-[200px] text-xs text-white/20">
                  Your AI-generated queries will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 py-1">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group relative cursor-pointer px-5 py-4 transition-colors hover:bg-white/[0.03]"
                    onClick={() => onSelect?.(entry)}
                  >
                    {/* Question */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-orange-500/10">
                        <Sparkles className="h-3 w-3 text-orange-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white/90">
                          {entry.question}
                        </p>
                        <p className="mt-1.5 line-clamp-1 font-mono text-[11px] text-white/30">
                          {entry.sql}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-white/25">
                          <span>{formatRelativeTime(entry.timestamp)}</span>
                          {entry.rowCount !== undefined && (
                            <>
                              <span className="h-2.5 w-px bg-white/10" />
                              <span>{entry.rowCount} rows</span>
                            </>
                          )}
                          {entry.duration !== undefined && (
                            <>
                              <span className="h-2.5 w-px bg-white/10" />
                              <span className="text-emerald-400/60">
                                {entry.duration}ms
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div
                      className={`absolute right-4 top-4 flex items-center gap-1 transition-opacity ${
                        hoveredId === entry.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect?.(entry);
                        }}
                        className="rounded p-1 text-white/30 transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                        title="Re-run"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        className="rounded p-1 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
