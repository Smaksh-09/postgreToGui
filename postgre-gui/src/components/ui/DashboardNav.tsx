"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronLeft, LogOut, Hexagon } from "lucide-react";

export default function DashboardNav() {
  return (
    <>
      {/* TOP LEFT: Escape Hatch (Back to Landing) */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/"
          className="group flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm text-white/40 transition-all hover:bg-white/10 hover:text-white hover:border-white/10 backdrop-blur-md"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Home</span>
        </Link>
      </div>

      {/* TOP RIGHT: User Controls (Logout) */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="group flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm text-white/40 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 backdrop-blur-md"
        >
          <span>Sign Out</span>
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}