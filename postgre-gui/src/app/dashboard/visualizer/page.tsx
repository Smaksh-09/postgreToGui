"use client";

import Sidebar from "../../../components/Dashboard/Sidebar";
import { Sparkles, Play, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import ResultsTable from "../../../components/ui/ResultsTable";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SchemaGraph from "../../../components/ui/SchemaGraph";
import QueryDrawer, {
  QueryDrawerEntry,
} from "../../../components/ui/QueryDrawer";
import QueryHistory from "../../../components/ui/QueryHistory";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

export default function VisualizerPage() {
  const router = useRouter();
  const [schemaData, setSchemaData] = useState<{ tables: any[]; relations: any[] }>({
    tables: [],
    relations: [],
  });
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState("");
  const [loading, setLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [drawerEntry, setDrawerEntry] = useState<QueryDrawerEntry | null>(
    null
  );
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    async function fetchSchema() {
      try {
        const res = await fetch("/api/schema");
        if (res.status === 401) return router.push("/login");
        if (res.status === 404) return router.push("/dashboard");
        if (!res.ok) throw new Error("Failed to fetch schema");

        const data = await res.json();
        if (data.schema) {
          setSchemaData({ tables: data.schema, relations: data.relations });
          setTableNames(data.schema.map((t: any) => t.table_name));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchema();
  }, [router]);

  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const question = inputValue.trim();
      setInputValue("");

      // 1. Show Drawer immediately (Loading State)
      setDrawerEntry({
        question,
        generatedSql: "",
      });

      try {
        // 2. Prepare Context
        const schemaContext = activeTable
          ? { tableName: activeTable }
          : { tables: tableNames };

        // 3. Call Your API
        const res = await fetch("/api/query/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: question,
            schemaContext,
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        // 4. Update Drawer with Real SQL
        setDrawerEntry((prev) =>
          prev ? { ...prev, generatedSql: data.sql } : null
        );
      } catch (error) {
        console.error("AI Gen Failed:", error);
        setDrawerEntry((prev) =>
          prev
            ? { ...prev, generatedSql: "-- Error: Could not generate SQL." }
            : null
        );
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-midnight-950 text-white overflow-hidden">
      <Sidebar
        tables={tableNames}
        activeTable={activeTable}
        onSelectTable={setActiveTable}
        isLoading={loading}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />
      
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
            {activeTable && (
              <button
                onClick={() => setActiveTable("")}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
              >
                Close Table ✕
              </button>
            )}
            <button className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 transition-colors shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              <Play className="h-3.5 w-3.5 fill-current" />
              Run Query
            </button>
          </div>
        </header>

        {/* WORKSPACE CANVAS */}
        <div className="relative flex-1 bg-[url('/grid-pattern.svg')] bg-center">
          {loading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#050505]/70 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <LoadingSpinner size={18} />
                Loading schema...
              </div>
            </div>
          )}
          
          {/* Main View: Graph vs Table */}
          {activeTable ? (
            <div className="absolute inset-0 z-20 bg-midnight-950 pb-16">
              <ResultsTable activeTable={activeTable} />
            </div>
          ) : (
            <div className="absolute inset-0 z-10">
              <SchemaGraph
                data={schemaData}
                onNodeClick={(name) => setActiveTable(name)}
              />
            </div>
          )}

          {/* Floating AI Command Bar */}
          <div className="absolute bottom-8 left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 px-4">
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={`Ask your ${activeTable || "database"}... (Press Enter)`}
                className="flex-1 bg-transparent px-2 text-sm text-white placeholder-white/30 focus:outline-none"
              />
              <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                 <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50 sm:inline-block">
                   ↵
                 </kbd>
                 <button className="rounded-lg p-1.5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Maximize2 className="h-4 w-4" />
                 </button>
              </div>
            </motion.div>
          </div>

          <QueryDrawer
            isOpen={!!drawerEntry}
            onClose={() => setDrawerEntry(null)}
            entry={drawerEntry}
            onRun={(sql) => console.log("Running SQL:", sql)}
          />

          <QueryHistory
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onSelect={(historyItem) => {
              setIsHistoryOpen(false);
              setDrawerEntry({
                question: historyItem.question,
                generatedSql: historyItem.sql,
              });
            }}
          />
        </div>
      </main>
    </div>
  );
}