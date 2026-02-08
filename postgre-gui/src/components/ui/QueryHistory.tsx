"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, XCircle, Play, Copy, Terminal } from "lucide-react";

interface QueryLog {
  id: string;
  sql: string;
  success: boolean;
  durationMs: number;
  createdAt: string;
}

interface QueryHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (sql: string) => void;
}

export default function QueryHistory({ isOpen, onClose, onSelectQuery }: QueryHistoryProps) {
  const [history, setHistory] = useState<QueryLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch history whenever the drawer opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/query/history")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setHistory(data);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Slide-in Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-white/10 bg-[#0c0c0c] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <h2 className="text-sm font-semibold text-white">Execution Log</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List */}
            <div className="h-full overflow-y-auto p-4 pb-20 scrollbar-thin scrollbar-thumb-white/10">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-white/30">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  <span className="text-xs">Syncing timeline...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="py-10 text-center text-xs text-white/30">
                  No queries executed in this session.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((log) => (
                    <div
                      key={log.id}
                      className="group relative flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      {/* Top Row: Status & Time */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {log.success ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/80" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500/80" />
                          )}
                          <span className={`text-[10px] font-mono ${log.success ? "text-emerald-500/60" : "text-red-500/60"}`}>
                            {log.success ? "SUCCESS" : "FAILED"}
                          </span>
                          <span className="h-3 w-[1px] bg-white/10" />
                          <span className="text-[10px] text-white/30">{log.durationMs}ms</span>
                        </div>
                        <span className="text-[10px] text-white/30">{formatTime(log.createdAt)}</span>
                      </div>

                      {/* Code Snippet */}
                      <div className="relative rounded-md bg-black/40 p-2 font-mono text-xs text-white/70">
                        {log.sql}
                      </div>

                      {/* Actions (Only visible on hover) */}
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => {
                            onSelectQuery(log.sql);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 rounded bg-orange-500/10 px-2 py-1 text-[10px] font-medium text-orange-400 hover:bg-orange-500/20"
                        >
                          <Play className="h-3 w-3" /> Re-run
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(log.sql)}
                          className="flex items-center gap-1.5 rounded bg-white/5 px-2 py-1 text-[10px] font-medium text-white/40 hover:bg-white/10 hover:text-white"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}