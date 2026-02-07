"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface ResultsTableProps {
  activeTable: string;
}

export default function ResultsTable({ activeTable }: ResultsTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data
  const fetchData = async () => {
    if (!activeTable) return;
    
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const res = await fetch("/api/query/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Construct a safe query
        body: JSON.stringify({ 
          sql: `SELECT * FROM "${activeTable}" LIMIT 100` 
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch data");
      }

      setColumns(json.fields || []);
      setData(json.rows || []);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever the active table changes
  useEffect(() => {
    fetchData();
  }, [activeTable]);

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/40">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm">Fetching rows from <span className="text-white">{activeTable}</span>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-white/50">
        <div className="rounded-full bg-red-500/10 p-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-white">Error loading table</p>
          <p className="mt-1 max-w-md text-sm text-red-400">{error}</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white/30">
        <p>Table is empty or no data returned.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-[#0a0a0a]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-[#111] text-xs uppercase text-white/40">
          <tr>
            {columns.map((col) => (
              <th key={col} className="border-b border-white/10 px-6 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/80">
          {data.map((row, i) => (
            <motion.tr 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group hover:bg-white/[0.02]"
            >
              {columns.map((col) => (
                <td key={`${i}-${col}`} className="whitespace-nowrap px-6 py-3 font-mono text-xs">
                  {/* Handle Objects/Dates for display */}
                  {typeof row[col] === 'object' && row[col] !== null
                    ? JSON.stringify(row[col]) 
                    : String(row[col] ?? 'NULL')}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}