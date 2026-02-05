"use client";

import { Handle, Position } from "reactflow";
import { Key} from "lucide-react";

// The data we expect for each table
export type TableNodeData = {
  label: string; // Table Name
  columns: Array<{ name: string; type: string; isPk?: boolean }>;
};

export default function TableNode({ data }: { data: TableNodeData }) {
  return (
    <div className="min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c]/90 shadow-2xl backdrop-blur-md transition-all hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(234,88,12,0.2)]">
      
      {/* 1. Header (Table Name) */}
      <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="font-bold text-sm text-white tracking-wide">{data.label}</span>
        <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_currentColor]" />
      </div>

      {/* 2. Columns List */}
      <div className="p-2 flex flex-col gap-1">
        {data.columns.map((col) => (
          <div key={col.name} className="group flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-white/5">
            
            {/* Column Name + Icon */}
            <div className="flex items-center gap-2 text-white/70 group-hover:text-white">
              {col.isPk ? (
                <Key className="h-3 w-3 text-yellow-500 rotate-90" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              )}
              <span className={col.isPk ? "text-yellow-100" : ""}>{col.name}</span>
            </div>

            {/* Data Type */}
            <span className="font-mono text-[10px] text-white/30">{col.type}</span>
          </div>
        ))}
      </div>

      {/* 3. Connection Handles (Invisible dots for lines to connect to) */}
      <Handle type="target" position={Position.Left} className="!bg-orange-500 !border-none !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-orange-500 !border-none !w-2 !h-2" />
    </div>
  );
}