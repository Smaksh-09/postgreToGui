"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useSession } from "next-auth/react";

export default function ConnectForm() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionString, setConnectionString] = useState("");

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to connect");

      // Success! Redirect to the visualizer
      router.push("/dashboard/visualizer");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c0c] p-8 shadow-2xl"
    >
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-white">Connect Database</h2>
        <p className="mt-2 text-sm text-white/50">
          Paste your PostgreSQL connection string to visualize.
        </p>
      </div>

      <form onSubmit={handleConnect} className="space-y-4">
        <div>
          <input
            type="password"
            placeholder="postgres://user:pass@host:5432/db"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-600 py-3 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size={16} />
              Connecting...
            </>
          ) : (
            "Visualize Schema →"
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-white/10" />
        <span className="text-xs text-white/30">Trusted by Vibe Coders</span>
        <div className="h-[1px] flex-1 bg-white/10" />
      </div>
    </motion.div>
  );
}