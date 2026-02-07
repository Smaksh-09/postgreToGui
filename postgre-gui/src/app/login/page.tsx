"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa"; // Standard icons
import { Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = (provider: "github" | "google") => {
    setIsLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-midnight-950 text-white">
      
      {/* 1. Background Effects (Magma Glow) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] bg-indigo-500/5 blur-[100px]" />
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      {/* 2. The Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]/80 p-8 shadow-2xl backdrop-blur-xl transition-colors hover:border-orange-500/20">
          
          {/* Subtle top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-50" />

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Sign in to access your database console.
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-3">
            
            {/* GITHUB */}
            <button
              onClick={() => handleLogin("github")}
              disabled={!!isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50"
            >
              {isLoading === "github" ? (
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              ) : (
                <FaGithub className="h-5 w-5 text-white/80 group-hover:text-white" />
              )}
              <span>
                {isLoading === "github" ? "Connecting..." : "Continue with GitHub"}
              </span>
              {/* Hover Glow */}
              <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            {/* GOOGLE */}
            <button
              onClick={() => handleLogin("google")}
              disabled={!!isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50"
            >
              {isLoading === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              ) : (
                <FaGoogle className="h-4 w-4 text-white/80 group-hover:text-white" />
              )}
              <span>
                {isLoading === "google" ? "Connecting..." : "Continue with Google"}
              </span>
            </button>
          </div>

        </div>

        {/* Footer Terms */}
        <p className="mt-8 text-center text-xs text-white/20">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}