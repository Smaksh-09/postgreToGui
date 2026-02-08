"use client";

import Sidebar from "../../../components/Dashboard/Sidebar";
import { Sparkles, Play } from "lucide-react";
import { motion } from "framer-motion";
import ResultsTable from "../../../components/ui/ResultsTable";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SchemaGraph from "../../../components/ui/SchemaGraph";
import QueryDrawer, {
  QueryDrawerEntry,
} from "../../../components/ui/QueryDrawer";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import QueryHistory from "../../../components/ui/QueryHistory";

export default function VisualizerPage() {
  const router = useRouter();
  const [schemaData, setSchemaData] = useState<{ tables: any[]; relations: any[] }>({
    tables: [],
    relations: [],
  });
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerEntry, setDrawerEntry] = useState<QueryDrawerEntry | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  const handleGenerate = async () => {
    if (!promptValue.trim()) return;
    const question = promptValue.trim();
    setIsGenerating(true);

    setDrawerEntry({ question, generatedSql: "" });
    setIsDrawerOpen(true);

    try {
      const res = await fetch("/api/query/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setDrawerEntry({ question, generatedSql: data.sql });
    } catch (err) {
      console.error(err);
      setDrawerEntry({
        question,
        generatedSql: "-- Error generating query. Please try again.",
      });
    } finally {
      setIsGenerating(false);
      setPromptValue("");
    }
  };

  const handleHistorySelect = (sql: string) => {
    setDrawerEntry({
      question: "Restored from history",
      generatedSql: sql,
    });
    setIsDrawerOpen(true);
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
            <div className="absolute inset-0 z-20 bg-midnight-950 pb-20">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-orange-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <input 
                type="text"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Ask your data (e.g., 'Show top 5 users by revenue')..."
                className="flex-1 bg-transparent px-2 text-sm text-white placeholder-white/30 focus:outline-none"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !promptValue}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/50 hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <LoadingSpinner size={14} />
                ) : (
                  <div className="text-[10px] font-bold">↵</div>
                )}
              </button>
            </motion.div>
          </div>

          <QueryDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            entry={drawerEntry}
            onRun={(sql) => console.log("Running SQL:", sql)}
          />

          <QueryHistory
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onSelectQuery={handleHistorySelect}
          />
        </div>
      </main>
    </div>
  );
}