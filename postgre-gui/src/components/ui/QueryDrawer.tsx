"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import SqlEditor from "./SqlEditor";
import ResultsTable from "./ResultsTable";

export interface QueryDrawerEntry {
  question: string;
  generatedSql: string;
}

interface QueryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entry: QueryDrawerEntry | null;
  onRun?: (sql: string) => void;
}

export default function QueryDrawer({
  isOpen,
  onClose,
  entry,
  onRun,
}: QueryDrawerProps) {
  const [sqlValue, setSqlValue] = useState(entry?.generatedSql ?? "");
  const [showResults, setShowResults] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync SQL when entry changes
  if (entry && entry.generatedSql !== sqlValue && !showResults) {
    setSqlValue(entry.generatedSql);
  }

  const handleRun = () => {
    setIsRunning(true);
    // Simulate a query execution delay
    setTimeout(() => {
      setIsRunning(false);
      setShowResults(true);
      if (onRun) onRun(sqlValue);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setShowResults(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && entry && (
        <motion.div
          className="absolute inset-x-0 bottom-0 z-40 flex flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#0a0a0a]/95 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          style={{ maxHeight: "75vh" }}
        >
          {/* Drag Handle */}
          <div className="flex items-center justify-center pt-2 pb-1">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/40">You asked</p>
                <p className="text-sm font-medium text-white">
                  {entry.question}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* SQL Editor Section */}
          <div className="flex flex-col gap-3 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                Generated SQL
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-1 text-[11px] font-semibold text-white transition-all hover:bg-orange-500 disabled:opacity-50 shadow-[0_0_12px_rgba(234,88,12,0.3)]"
                >
                  {isRunning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 fill-current" />
                  )}
                  {isRunning ? "Running..." : "Run Query"}
                </button>
              </div>
            </div>

            <div className="resize-y overflow-auto min-h-[30vh] max-h-[40vh] rounded-lg border border-white/10 bg-[#0a0a0a]">
              <SqlEditor
                value={sqlValue}
                onChange={setSqlValue}
                minHeight="30vh"
                className="border-none"
              />
            </div>
          </div>

          {/* Results Section (collapsible) */}
          {showResults && (
            <div className="flex flex-1 flex-col overflow-hidden border-t border-white/10">
              <button
                onClick={() => setShowResults(!showResults)}
                className="flex items-center justify-between px-6 py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                <span className="font-medium uppercase tracking-wider">
                  Results
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="flex-1 overflow-auto" style={{ maxHeight: "30vh" }}>
                <ResultsTable activeTable={entry.question} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
