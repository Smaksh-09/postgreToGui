"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Clock, Zap, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Connection {
  id: string;
  name: string;
  provider: string;
  updatedAt: string;
}

export default function ConnectionGrid() {
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/connections")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setConnections(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleActivate = async (id: string) => {
    // Show a loading state or sound effect here if you wanted
    await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.push("/dashboard/visualizer");
  };

  if (loading) return null;
  if (connections.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-xs font-medium uppercase tracking-widest text-white/30">
          Recent Signals
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {connections.map((conn, i) => (
            <motion.button
              key={conn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleActivate(conn.id)}
              className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-orange-500/30 hover:bg-white/[0.04]"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="flex items-center gap-4 z-10">
                {/* Icon Box */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a0a] shadow-inner group-hover:border-orange-500/30 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all">
                  <Database className="h-4 w-4 text-white/40 group-hover:text-orange-500 transition-colors" />
                </div>
                
                {/* Text Info */}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    {conn.name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <span className="uppercase tracking-wide">{conn.provider}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
                    <span>{new Date(conn.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Icon */}
              <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/20 opacity-0 transition-all group-hover:opacity-100 group-hover:bg-orange-500 group-hover:text-white">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}