"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type PiiRiskLevel = "CRITICAL" | "ELEVATED" | "NONE" | string;

type PiiReport = {
  riskScore?: { level: PiiRiskLevel; score: number };
  infectedNodes?: Record<string, "HIGH" | "MEDIUM">;
  infectedEdges?: string[];
  improvements?: string[];
};

export default function PiiAuditSidebar({
  isOpen,
  onClose,
  report,
}: {
  isOpen: boolean;
  onClose: () => void;
  report: PiiReport | null;
}) {
  const infectedNodes = report?.infectedNodes ?? {};
  const entries = Object.entries(infectedNodes);
  const highTables = entries.filter(([, v]) => v === "HIGH").map(([k]) => k);
  const mediumTables = entries.filter(([, v]) => v === "MEDIUM").map(([k]) => k);

  const riskLevel = report?.riskScore?.level ?? "NONE";
  const score = Math.max(0, Math.min(100, report?.riskScore?.score ?? 0));

  const color =
    riskLevel === "CRITICAL"
      ? {
          text: "text-red-400",
          ring: "ring-red-500/20",
          bar: "bg-red-500",
          dot: "bg-red-500",
        }
      : riskLevel === "ELEVATED"
        ? {
            text: "text-orange-400",
            ring: "ring-orange-500/20",
            bar: "bg-orange-500",
            dot: "bg-orange-500",
          }
        : {
            text: "text-white/60",
            ring: "ring-white/10",
            bar: "bg-emerald-500",
            dot: "bg-emerald-500",
          };

  return (
    <motion.aside
      className="absolute right-0 top-0 bottom-0 z-50 h-full w-[420px] max-w-[90vw] border-l border-white/10 bg-[#050505]/95 backdrop-blur-xl"
      initial={false}
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
      animate={{
        x: isOpen ? 0 : 420,
      }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Security &amp; PII Audit</div>
            <div className="mt-1 text-xs text-white/50">No modal blocking — graph stays visible.</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close PII audit sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className={`rounded-xl border border-white/10 bg-white/5 p-4 ${color.ring}`}>
            <div className={`text-xs font-medium uppercase tracking-wide ${color.text}`}>
              {riskLevel === "CRITICAL"
                ? "Critical Risk Detected"
                : riskLevel === "ELEVATED"
                  ? "Elevated Risk Detected"
                  : "No Significant PII Risk Detected"}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-2xl font-bold text-white">{score}</div>
              <div className="text-xs text-white/50">
                {highTables.length} High • {mediumTables.length} Implicit
              </div>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
              <div className={`h-2 rounded-full ${color.bar}`} style={{ width: `${score}%` }} />
            </div>

            <div className="mt-3 text-xs text-white/50">
              Audit Complete. {highTables.length} High Risk, {mediumTables.length} Implicit Risk found.
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 text-xs font-semibold text-white/70">Affected Tables</div>
            <div className="space-y-2">
              {highTables.length === 0 && mediumTables.length === 0 ? (
                <div className="text-xs text-white/40">No risky tables identified.</div>
              ) : null}

              {highTables.map((t) => (
                <div
                  key={`high-${t}`}
                  className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full ${color.dot}`} />
                    <span className="truncate text-xs font-medium text-red-200">{t}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-red-200/70">HIGH</div>
                </div>
              ))}

              {mediumTables.map((t) => (
                <div
                  key={`medium-${t}`}
                  className="flex items-center justify-between rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="truncate text-xs font-medium text-orange-200">{t}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-orange-200/70">IMPLICIT</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 text-xs font-semibold text-white/70">Actionable Improvements</div>
            <div className="space-y-2">
              {(report?.improvements ?? []).length === 0 ? (
                <div className="text-xs text-white/40">No recommendations generated.</div>
              ) : null}

              {(report?.improvements ?? []).map((imp, idx) => (
                <div
                  key={`imp-${idx}`}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70 leading-relaxed"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-orange-500/80" />
                    <span>{imp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

