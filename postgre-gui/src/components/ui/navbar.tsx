"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";


const navItems = [
  { name: "Home", link: "/" },
  { name: "Private Key", link: "/private-key" }, 
  { name: "Product", link: "/product" },
  { name: "Solution", link: "/solution" },
  { name: "Pricing", link: "/pricing" },
  { name: "Community", link: "/community" },
];

export default function FloatingNavbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="fixed top-6 inset-x-0 max-w-2xl mx-auto z-50">
      <nav
        className="
          relative flex items-center justify-between px-6 py-3
          rounded-full border border-white/10
          bg-midnight-950/60 backdrop-blur-md
          shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]
        "
      >
        <ul className="flex flex-row items-center gap-2 w-full justify-between">
          {navItems.map((item, idx) => (
            <Link
              key={item.name}
              href={item.link}
              className="relative px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className="relative z-10">{item.name}</span>
              
              {/* This creates the subtle hover pill effect */}
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-white/10"
                    layoutId="hoverBackground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.15 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </ul>
      </nav>
    </div>
  );
}